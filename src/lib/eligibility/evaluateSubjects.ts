// Subject / Credit Requirement Evaluator
// Evaluates whether a student has enough credits in required subject categories.

import type {
  RequirementEvaluation,
  StudentProfile,
  ProgrammeRequirement,
  SubjectCreditBreakdown,
} from './types';
import { calculateCreditsForCategory } from './evaluateCredits';

/**
 * Evaluate a subject-credit requirement against the student's profile.
 *
 * @param profile      - The student profile
 * @param requirement  - The programme requirement (must be a subject/credit type)
 * @param usedSubjectIds - Subject IDs already counted (for double-counting prevention)
 * @returns The evaluation result and the updated set of used subject IDs
 */
export function evaluateSubjects(
  profile: StudentProfile,
  requirement: ProgrammeRequirement,
  usedSubjectIds: Set<string> = new Set(),
): { evaluation: RequirementEvaluation; usedSubjectIds: Set<string>; breakdown: SubjectCreditBreakdown } {
  const base: Omit<RequirementEvaluation, 'status' | 'studentValue' | 'explanation' | 'details'> = {
    requirementId: requirement.id,
    requirementType: requirement.requirementType,
    requirementDescription:
      requirement.requirementDescription ??
      `${requirement.subjectCategoryName ?? 'Subject'} credits requirement`,
    requiredValue: requirement.minCredits !== null
      ? `${requirement.minCredits} ${requirement.creditSystemRequired ?? ''} credits in ${requirement.subjectCategoryName ?? 'required category'}`
      : requirement.requiredValue,
    isMandatory: requirement.isMandatory,
  };

  // No subjects at all
  if (profile.subjects.length === 0) {
    const emptyBreakdown: SubjectCreditBreakdown = {
      categoryName: requirement.subjectCategoryName ?? 'Unknown',
      requiredCredits: requirement.minCredits ?? 0,
      earnedCredits: 0,
      creditSystem: requirement.creditSystemRequired ?? 'unknown',
      matchedSubjects: [],
      status: 'UNKNOWN',
    };

    return {
      evaluation: {
        ...base,
        status: 'UNKNOWN',
        studentValue: null,
        explanation:
          'No subject records found in the student profile. Cannot evaluate subject credit requirement.',
      },
      usedSubjectIds,
      breakdown: emptyBreakdown,
    };
  }

  // Calculate credits
  const calcResult = calculateCreditsForCategory(
    profile.subjects,
    profile.subjectMappings,
    requirement,
    usedSubjectIds,
  );

  const requiredCredits = requirement.minCredits ?? 0;
  const categoryName = requirement.subjectCategoryName ?? 'required category';
  const creditSystemLabel = requirement.creditSystemRequired ?? calcResult.creditSystem;

  const breakdown: SubjectCreditBreakdown = {
    categoryName,
    requiredCredits,
    earnedCredits: calcResult.totalCredits,
    creditSystem: creditSystemLabel,
    matchedSubjects: calcResult.matchedSubjects.map((s) => ({
      subjectName: s.subjectName,
      credits: s.credits,
      grade: s.grade,
      semester: s.semester,
    })),
    status: 'UNKNOWN', // Will be set below
  };

  // Credit system mismatch — we can't reliably compare
  if (calcResult.creditSystemMismatch) {
    breakdown.status = 'NEEDS_REVIEW';
    return {
      evaluation: {
        ...base,
        status: 'NEEDS_REVIEW',
        studentValue: `${calcResult.totalCredits} credits (${calcResult.creditSystem})`,
        explanation:
          `You have earned ${calcResult.totalCredits} credits in ${categoryName} subjects ` +
          `(${calcResult.creditSystem} system). The programme requires at least ${requiredCredits} ${creditSystemLabel} credits. ` +
          `Status: NEEDS_REVIEW — credit equivalence requires verification.`,
        details: { breakdown },
      },
      usedSubjectIds: calcResult.usedSubjectIds,
      breakdown,
    };
  }

  // Compare earned vs required
  if (calcResult.totalCredits >= requiredCredits) {
    breakdown.status = 'PASSED';
    return {
      evaluation: {
        ...base,
        status: 'PASSED',
        studentValue: `${calcResult.totalCredits} credits in ${categoryName}`,
        explanation:
          `You have earned ${calcResult.totalCredits} credits in ${categoryName} subjects, ` +
          `which meets the minimum requirement of ${requiredCredits} ${creditSystemLabel} credits.`,
        details: { breakdown },
      },
      usedSubjectIds: calcResult.usedSubjectIds,
      breakdown,
    };
  }

  // Not enough credits
  breakdown.status = 'FAILED';
  return {
    evaluation: {
      ...base,
      status: 'FAILED',
      studentValue: `${calcResult.totalCredits} credits in ${categoryName}`,
      explanation:
        `You have earned ${calcResult.totalCredits} credits in ${categoryName} subjects. ` +
        `The programme requires at least ${requiredCredits} ${creditSystemLabel} credits. ` +
        `You are short by ${requiredCredits - calcResult.totalCredits} credits.`,
      details: { breakdown },
    },
    usedSubjectIds: calcResult.usedSubjectIds,
    breakdown,
  };
}
