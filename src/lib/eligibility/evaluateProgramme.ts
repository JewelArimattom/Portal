// Programme Evaluator — Main Orchestrator
// Evaluates a student's eligibility for a programme by running all individual
// evaluators, resolving condition groups (AND/OR), and determining the overall
// eligibility status.

import type {
  StudentProfile,
  ProgrammeData,
  ProgrammeRequirement,
  ConditionGroup,
  RequirementEvaluation,
  ProgrammeEvaluationResult,
  OverallEligibility,
  EvalStatus,
} from './types';
import { evaluateDegree } from './evaluateDegree';
import { evaluateSubjects } from './evaluateSubjects';
import { evaluateGrade } from './evaluateGrade';
import { evaluateLanguage } from './evaluateLanguage';
import { evaluateDocuments } from './evaluateDocuments';
import { evaluateDeadline, type DeadlineInfo } from './evaluateDeadline';
import { calculateCompatibility } from './calculateCompatibility';

export interface EvaluationOptions {
  /** Current date for deadline evaluation (injectable for testing) */
  referenceDate?: Date;
  /** Deadline info for the programme intake */
  deadlineInfo?: DeadlineInfo;
}

/**
 * Evaluate a student's eligibility for a programme.
 */
export function evaluateProgramme(
  profile: StudentProfile,
  programme: ProgrammeData,
  options: EvaluationOptions = {},
): ProgrammeEvaluationResult {
  const referenceDate = options.referenceDate ?? new Date();
  const allResults: RequirementEvaluation[] = [];
  let usedSubjectIds = new Set<string>();

  // 1. Evaluate top-level requirements (not in any condition group)
  const topLevelReqs = programme.requirements.filter((r) => r.conditionGroupId === null);

  for (const req of topLevelReqs) {
    const result = evaluateRequirement(profile, req, referenceDate, options.deadlineInfo, usedSubjectIds);
    allResults.push(result.evaluation);
    usedSubjectIds = result.usedSubjectIds;
  }

  // 2. Evaluate condition groups
  for (const group of programme.conditionGroups) {
    const groupResults = evaluateConditionGroup(
      profile, group, referenceDate, options.deadlineInfo, usedSubjectIds,
    );
    allResults.push(...groupResults.evaluations);
    usedSubjectIds = groupResults.usedSubjectIds;
  }

  // A catalogue entry is not enough to assess individual eligibility. Until
  // all programme rules have verified, source-linked data, keep the result in
  // the review queue instead of treating absent rules as a positive match.
  if (programme.requirementsDataStatus && programme.requirementsDataStatus !== 'complete') {
    const isPartial = programme.requirementsDataStatus === 'partial';
    const admissionCategory = programme.admissionSelectivity && programme.admissionSelectivity !== 'unknown'
      ? ` The official catalogue lists this programme as ${programme.admissionSelectivity.replaceAll('_', ' ')}.`
      : '';
    allResults.push({
      requirementId: `admission-data-coverage:${programme.id}`,
      requirementType: 'requirements_data_coverage',
      requirementDescription: 'Programme-specific admission rules data coverage',
      status: 'NEEDS_REVIEW',
      studentValue: null,
      requiredValue: 'Complete, verified admission requirements for this programme',
      explanation: isPartial
        ? `Some official admissions information is recorded, but programme-specific criteria are incomplete. Eligibility and admission likelihood cannot be reliably assessed yet.${admissionCategory}`
        : `Programme-specific admission criteria have not been verified from official sources yet. This programme cannot receive a reliable eligibility assessment yet.${admissionCategory}`,
      details: programme.admissionSelectivity && programme.admissionSelectivity !== 'unknown'
        ? { publishedAdmissionCategory: programme.admissionSelectivity }
        : undefined,
      isMandatory: true,
    });
  }

  // 3. Determine overall eligibility
  const overallEligibility = determineOverallEligibility(allResults);

  // 4. Calculate compatibility score
  const compatibilityScore = calculateCompatibility(profile, programme, allResults);

  // 5. Calculate profile completeness
  const profileCompleteness = calculateProfileCompleteness(profile);

  return {
    programmeId: programme.id,
    programmeName: programme.name,
    universityName: programme.universityName,
    overallEligibility,
    compatibilityScore,
    requirementResults: allResults,
    evaluatedAt: referenceDate.toISOString(),
    requirementVersionUsed: programme.requirementVersion,
    profileCompleteness,
  };
}

/** Route a requirement to the correct evaluator based on its type. */
function evaluateRequirement(
  profile: StudentProfile,
  requirement: ProgrammeRequirement,
  referenceDate: Date,
  deadlineInfo: DeadlineInfo | undefined,
  usedSubjectIds: Set<string>,
): { evaluation: RequirementEvaluation; usedSubjectIds: Set<string> } {
  const reqType = requirement.requirementType.toLowerCase();

  switch (reqType) {
    case 'degree':
    case 'degree_level':
    case 'degree_type':
    case 'qualification': {
      return {
        evaluation: applyVerificationStatus(evaluateDegree(profile, requirement), requirement),
        usedSubjectIds,
      };
    }

    case 'subject_credits':
    case 'subject':
    case 'credits': {
      const result = evaluateSubjects(profile, requirement, usedSubjectIds);
      return {
        evaluation: applyVerificationStatus(result.evaluation, requirement),
        usedSubjectIds: result.usedSubjectIds,
      };
    }

    case 'grade':
    case 'gpa':
    case 'academic_performance': {
      return {
        evaluation: applyVerificationStatus(evaluateGrade(profile, requirement), requirement),
        usedSubjectIds,
      };
    }

    case 'language':
    case 'language_proficiency':
    case 'english':
    case 'german': {
      return {
        evaluation: applyVerificationStatus(evaluateLanguage(profile, requirement, referenceDate), requirement),
        usedSubjectIds,
      };
    }

    case 'document':
    case 'documents': {
      return {
        evaluation: applyVerificationStatus(evaluateDocuments(profile, requirement), requirement),
        usedSubjectIds,
      };
    }

    case 'deadline':
    case 'application_deadline': {
      const info = deadlineInfo ?? {
        applicationDeadline: null,
        internationalDeadline: null,
        intakeStatus: null,
        verificationDate: null,
      };
      return {
        evaluation: applyVerificationStatus(evaluateDeadline(requirement, info, referenceDate), requirement),
        usedSubjectIds,
      };
    }

    default: {
      return {
        evaluation: {
          requirementId: requirement.id,
          requirementType: requirement.requirementType,
          requirementDescription: requirement.requirementDescription ?? 'Unknown requirement',
          status: 'NEEDS_REVIEW' as EvalStatus,
          studentValue: null,
          requiredValue: requirement.requiredValue,
          explanation: `Unknown requirement type "${requirement.requirementType}". Manual review is needed.`,
          isMandatory: requirement.isMandatory,
        },
        usedSubjectIds,
      };
    }
  }
}

function applyVerificationStatus(
  evaluation: RequirementEvaluation,
  requirement: ProgrammeRequirement,
): RequirementEvaluation {
  if (requirement.verificationStatus === 'verified' || evaluation.status === 'NOT_APPLICABLE') {
    return evaluation;
  }

  return {
    ...evaluation,
    status: 'NEEDS_REVIEW',
    explanation: `${evaluation.explanation} The source data for this rule is ${requirement.verificationStatus}; manual verification is required before relying on this result.`,
  };
}

/** Evaluate a condition group recursively (AND/OR logic). */
function evaluateConditionGroup(
  profile: StudentProfile,
  group: ConditionGroup,
  referenceDate: Date,
  deadlineInfo: DeadlineInfo | undefined,
  usedSubjectIds: Set<string>,
): { evaluations: RequirementEvaluation[]; usedSubjectIds: Set<string> } {
  const evaluations: RequirementEvaluation[] = [];
  let currentUsedIds = usedSubjectIds;

  // Evaluate requirements in this group
  for (const req of group.requirements) {
    const result = evaluateRequirement(profile, req, referenceDate, deadlineInfo, currentUsedIds);
    evaluations.push(result.evaluation);
    currentUsedIds = result.usedSubjectIds;
  }

  // Evaluate child groups recursively
  for (const child of group.childGroups) {
    const childResults = evaluateConditionGroup(profile, child, referenceDate, deadlineInfo, currentUsedIds);
    evaluations.push(...childResults.evaluations);
    currentUsedIds = childResults.usedSubjectIds;
  }

  // Apply group logic (AND/OR) to synthesize a group-level result
  if (group.logic === 'OR' && evaluations.length > 0) {
    // For OR groups: if any requirement passes, the group passes
    const anyPassed = evaluations.some((e) => e.status === 'PASSED');
    const anyConditional = evaluations.some((e) => e.status === 'CONDITIONAL');
    const allFailed = evaluations.every(
      (e) => e.status === 'FAILED' || e.status === 'NOT_APPLICABLE',
    );

    if (anyPassed) {
      // Mark the non-passing ones as NOT_APPLICABLE in an OR group
      for (const eval_ of evaluations) {
        if (eval_.status !== 'PASSED') {
          eval_.status = 'NOT_APPLICABLE';
          eval_.explanation += ' (Alternative requirement — another option in this group was met.)';
        }
      }
    } else if (anyConditional && !allFailed) {
      // At least one conditional — keep as is
    }
    // If all failed, they remain FAILED
  }
  // AND groups: each requirement stands on its own — no special handling

  return { evaluations, usedSubjectIds: currentUsedIds };
}

/** Determine overall eligibility from all requirement evaluations. */
function determineOverallEligibility(results: RequirementEvaluation[]): OverallEligibility {
  if (results.length === 0) return 'NOT_EVALUATED';

  const mandatoryResults = results.filter((r) => r.isMandatory);
  const allResults = results;

  // Any mandatory requirement FAILED → NOT_ELIGIBLE
  const hasMandatoryFailed = mandatoryResults.some((r) => r.status === 'FAILED');
  if (hasMandatoryFailed) return 'NOT_ELIGIBLE';

  // Any critical UNKNOWN → NEEDS_VERIFICATION
  const hasMandatoryUnknown = mandatoryResults.some((r) => r.status === 'UNKNOWN');
  const hasMandatoryNeedsReview = mandatoryResults.some((r) => r.status === 'NEEDS_REVIEW');
  if (hasMandatoryUnknown || hasMandatoryNeedsReview) return 'NEEDS_VERIFICATION';

  // Any CONDITIONAL → CONDITIONALLY_ELIGIBLE
  const hasConditional = allResults.some((r) => r.status === 'CONDITIONAL');
  if (hasConditional) return 'CONDITIONALLY_ELIGIBLE';

  // Check for incomplete programme data — never give unconditional ELIGIBLE
  // if there are no requirements at all
  if (mandatoryResults.length === 0 && allResults.length === 0) return 'NOT_EVALUATED';

  // All mandatory requirements passed
  const allMandatoryPassed = mandatoryResults.every(
    (r) => r.status === 'PASSED' || r.status === 'NOT_APPLICABLE',
  );

  if (allMandatoryPassed) return 'ELIGIBLE';

  return 'NEEDS_VERIFICATION';
}

/** Calculate a rough profile completeness percentage. */
function calculateProfileCompleteness(profile: StudentProfile): number {
  let total = 0;
  let filled = 0;

  // Education
  total += 1;
  if (profile.educations.length > 0) filled += 1;

  // Academic results
  total += 1;
  if (profile.academicResults.length > 0) filled += 1;

  // Subjects
  total += 1;
  if (profile.subjects.length > 0) filled += 1;

  // Subject mappings
  total += 1;
  if (profile.subjectMappings.length > 0) filled += 1;

  // Language certificates
  total += 1;
  if (profile.languageCertificates.length > 0) filled += 1;

  // Documents
  total += 1;
  if (profile.documents.length > 0) filled += 1;

  // Preferences
  total += 1;
  if (profile.preferences.intendedDegree) filled += 1;

  return Math.round((filled / total) * 100);
}
