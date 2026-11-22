// Compatibility Score Calculator
// Calculates a deterministic compatibility score (0-100) across six dimensions.
// This is a factual assessment, NOT an admission probability.

import type {
  StudentProfile,
  ProgrammeData,
  RequirementEvaluation,
  CompatibilityBreakdown,
} from './types';
import { COMPATIBILITY_WEIGHTS } from './constants';

/**
 * Calculate the compatibility score for a student against a programme.
 *
 * @param profile   - Student profile
 * @param programme - Programme data
 * @param results   - Already-computed requirement evaluations
 */
export function calculateCompatibility(
  profile: StudentProfile,
  programme: ProgrammeData,
  results: RequirementEvaluation[],
): CompatibilityBreakdown {
  const missingInformation: string[] = [];
  let isProvisional = false;

  // 1. Degree Relevance (0-20)
  const degreeRelevance = scoreDegreeRelevance(profile, programme, results, missingInformation);

  // 2. Subject Match (0-30)
  const subjectMatch = scoreSubjectMatch(results, missingInformation);

  // 3. Academic Performance (0-15)
  const academicPerformance = scoreAcademicPerformance(results, missingInformation);

  // 4. Language Match (0-15)
  const languageMatch = scoreLanguageMatch(results, missingInformation);

  // 5. Other Requirements (0-10)
  const otherRequirements = scoreOtherRequirements(results, missingInformation);

  // 6. Supporting Qualifications (0-10)
  const supportingQualifications = scoreSupportingQualifications(profile, missingInformation);

  if (missingInformation.length > 0) {
    isProvisional = true;
  }

  const totalScore =
    degreeRelevance + subjectMatch + academicPerformance +
    languageMatch + otherRequirements + supportingQualifications;

  return {
    degreeRelevance,
    subjectMatch,
    academicPerformance,
    languageMatch,
    otherRequirements,
    supportingQualifications,
    totalScore,
    isProvisional,
    missingInformation,
  };
}

/** Score degree relevance (0-20 points) */
function scoreDegreeRelevance(
  profile: StudentProfile,
  programme: ProgrammeData,
  results: RequirementEvaluation[],
  missing: string[],
): number {
  const max = COMPATIBILITY_WEIGHTS.degreeRelevance;
  const degreeResults = results.filter(
    (r) => ['degree', 'degree_level', 'degree_type', 'qualification'].includes(r.requirementType.toLowerCase()),
  );

  if (degreeResults.length === 0) {
    if (profile.educations.length === 0) {
      missing.push('Education history not provided');
      return 0;
    }
    // No degree requirement — give full marks
    return max;
  }

  const passedCount = degreeResults.filter((r) => r.status === 'PASSED').length;
  const conditionalCount = degreeResults.filter((r) => r.status === 'CONDITIONAL').length;
  const unknownCount = degreeResults.filter((r) => r.status === 'UNKNOWN' || r.status === 'NEEDS_REVIEW').length;

  if (unknownCount > 0) missing.push('Degree evaluation could not be fully verified');

  const score =
    (passedCount * max + conditionalCount * max * 0.5) / degreeResults.length;

  return Math.round(Math.min(score, max));
}

/** Score subject match (0-30 points) */
function scoreSubjectMatch(
  results: RequirementEvaluation[],
  missing: string[],
): number {
  const max = COMPATIBILITY_WEIGHTS.subjectMatch;
  const subjectResults = results.filter(
    (r) => ['subject_credits', 'subject', 'credits'].includes(r.requirementType.toLowerCase()),
  );

  if (subjectResults.length === 0) {
    // No subject requirements — give partial marks
    return Math.round(max * 0.5);
  }

  let totalWeightedScore = 0;

  for (const result of subjectResults) {
    switch (result.status) {
      case 'PASSED':
        totalWeightedScore += 1;
        break;
      case 'CONDITIONAL':
        totalWeightedScore += 0.5;
        break;
      case 'NEEDS_REVIEW':
        totalWeightedScore += 0.3;
        missing.push(`Subject credit evaluation for "${result.requirementDescription}" needs review`);
        break;
      case 'UNKNOWN':
        totalWeightedScore += 0;
        missing.push(`Subject data missing for "${result.requirementDescription}"`);
        break;
      case 'FAILED':
        totalWeightedScore += 0;
        break;
      case 'NOT_APPLICABLE':
        totalWeightedScore += 1; // Not applicable = no problem
        break;
    }
  }

  const ratio = totalWeightedScore / subjectResults.length;
  return Math.round(ratio * max);
}

/** Score academic performance (0-15 points) */
function scoreAcademicPerformance(
  results: RequirementEvaluation[],
  missing: string[],
): number {
  const max = COMPATIBILITY_WEIGHTS.academicPerformance;
  const gradeResults = results.filter(
    (r) => ['grade', 'gpa', 'academic_performance'].includes(r.requirementType.toLowerCase()),
  );

  if (gradeResults.length === 0) {
    missing.push('No grade requirements to evaluate against');
    return Math.round(max * 0.5);
  }

  const passed = gradeResults.filter((r) => r.status === 'PASSED').length;
  const needsReview = gradeResults.filter((r) => r.status === 'NEEDS_REVIEW').length;

  if (needsReview > 0) missing.push('Grade conversion could not be verified');

  const ratio = (passed + needsReview * 0.3) / gradeResults.length;
  return Math.round(ratio * max);
}

/** Score language match (0-15 points) */
function scoreLanguageMatch(
  results: RequirementEvaluation[],
  missing: string[],
): number {
  const max = COMPATIBILITY_WEIGHTS.languageMatch;
  const langResults = results.filter(
    (r) =>
      ['language', 'language_proficiency', 'english', 'german'].includes(
        r.requirementType.toLowerCase(),
      ),
  );

  if (langResults.length === 0) {
    // No language requirements
    return max;
  }

  const passed = langResults.filter((r) => r.status === 'PASSED').length;
  const conditional = langResults.filter((r) => r.status === 'CONDITIONAL').length;
  const failed = langResults.filter((r) => r.status === 'FAILED').length;

  if (failed > 0) missing.push('Language requirement not met');

  const score =
    (passed * max + conditional * max * 0.5) / langResults.length;

  return Math.round(Math.min(score, max));
}

/** Score other requirements (0-10 points) */
function scoreOtherRequirements(
  results: RequirementEvaluation[],
  missing: string[],
): number {
  const max = COMPATIBILITY_WEIGHTS.otherRequirements;
  const knownTypes = [
    'degree', 'degree_level', 'degree_type', 'qualification',
    'subject_credits', 'subject', 'credits',
    'grade', 'gpa', 'academic_performance',
    'language', 'language_proficiency', 'english', 'german',
  ];

  const otherResults = results.filter(
    (r) =>
      !knownTypes.includes(r.requirementType.toLowerCase()) &&
      r.requirementType.toLowerCase() !== 'document' &&
      r.requirementType.toLowerCase() !== 'documents' &&
      r.requirementType.toLowerCase() !== 'deadline' &&
      r.requirementType.toLowerCase() !== 'application_deadline',
  );

  if (otherResults.length === 0) return max;

  const passed = otherResults.filter((r) => r.status === 'PASSED' || r.status === 'NOT_APPLICABLE').length;
  const needsReview = otherResults.filter((r) => r.status === 'NEEDS_REVIEW' || r.status === 'UNKNOWN').length;

  if (needsReview > 0) missing.push('Some additional requirements could not be verified');

  const ratio = (passed + needsReview * 0.3) / otherResults.length;
  return Math.round(ratio * max);
}

/** Score supporting qualifications (0-10 points) */
function scoreSupportingQualifications(
  profile: StudentProfile,
  missing: string[],
): number {
  const max = COMPATIBILITY_WEIGHTS.supportingQualifications;
  let score = 0;

  // Internships / work experience
  const internships = profile.additionalQualifications.filter(
    (q) => q.qualificationType.toLowerCase().includes('internship') ||
           q.qualificationType.toLowerCase().includes('work_experience'),
  );
  if (internships.length > 0) score += 3;

  // Projects / research
  const projects = profile.additionalQualifications.filter(
    (q) => q.qualificationType.toLowerCase().includes('project') ||
           q.qualificationType.toLowerCase().includes('research'),
  );
  if (projects.length > 0) score += 3;

  // Certifications
  const certifications = profile.additionalQualifications.filter(
    (q) => q.qualificationType.toLowerCase().includes('certification') ||
           q.qualificationType.toLowerCase().includes('certificate'),
  );
  if (certifications.length > 0) score += 2;

  // Any other qualifications
  const other = profile.additionalQualifications.filter(
    (q) => !internships.includes(q) && !projects.includes(q) && !certifications.includes(q),
  );
  if (other.length > 0) score += 2;

  if (profile.additionalQualifications.length === 0) {
    missing.push('No supporting qualifications provided');
  }

  return Math.min(score, max);
}
