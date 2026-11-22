// Credit Calculation Helper
// Handles theory vs practical credits, credit systems, double-counting
// prevention, and ECTS equivalence.

import type { StudentSubject, SubjectMapping, ProgrammeRequirement } from './types';
import { MATHEMATICS_CATEGORIES, CS_CATEGORIES } from './constants';

export interface CreditCalculationResult {
  totalCredits: number;
  theoryCredits: number;
  practicalCredits: number;
  creditSystem: string;
  matchedSubjects: Array<{
    subjectId: string;
    subjectName: string;
    credits: number;
    grade: string | null;
    semester: number;
  }>;
  usedSubjectIds: Set<string>;
  creditSystemMismatch: boolean;
}

/**
 * Calculate total credits a student has earned in a specific category.
 *
 * @param subjects     - All student subjects
 * @param mappings     - Subject-to-category mappings
 * @param requirement  - The programme requirement being evaluated
 * @param usedIds      - Set of subject IDs already used (for double-counting prevention)
 * @returns Credit calculation breakdown
 */
export function calculateCreditsForCategory(
  subjects: StudentSubject[],
  mappings: SubjectMapping[],
  requirement: ProgrammeRequirement,
  usedIds: Set<string> = new Set(),
): CreditCalculationResult {
  const categoryId = requirement.subjectCategoryId;
  const categoryName = requirement.subjectCategoryName;

  // Find subjects mapped to this category
  const reqCatLower = categoryName?.toLowerCase() ?? '';
  const matchingMappings = mappings.filter((m) => {
    if (categoryId && m.categoryId === categoryId) return true;
    if (categoryName && m.categoryName.toLowerCase() === reqCatLower) return true;
    const mappingCatLower = m.categoryName.toLowerCase();
    if (reqCatLower === 'mathematics' || reqCatLower === 'math') {
      return MATHEMATICS_CATEGORIES.some((c) => c.toLowerCase() === mappingCatLower);
    }
    if (reqCatLower === 'computer science' || reqCatLower === 'cs' || reqCatLower === 'computing') {
      return CS_CATEGORIES.some((c) => c.toLowerCase() === mappingCatLower);
    }
    return false;
  });

  const matchedSubjectIds = new Set(matchingMappings.map((m) => m.subjectId));

  // Filter to subjects that match the category
  const candidateSubjects = subjects.filter((s) => matchedSubjectIds.has(s.id));

  let totalCredits = 0;
  let theoryCredits = 0;
  let practicalCredits = 0;
  let creditSystemMismatch = false;
  const matchedSubjects: CreditCalculationResult['matchedSubjects'] = [];
  const newUsedIds = new Set(usedIds);

  for (const subject of candidateSubjects) {
    // Double-counting prevention
    if (!requirement.allowDoubleCounting && usedIds.has(subject.id)) {
      continue;
    }

    // Determine credits for this subject
    let subjectCredits = 0;

    if (requirement.practicalCreditsCount) {
      // Include both theory and practical
      subjectCredits = (subject.theoryCredits ?? 0) + (subject.practicalCredits ?? 0);
    } else {
      // Theory only (or total if breakdown not available)
      if (subject.theoryCredits !== null) {
        subjectCredits = subject.theoryCredits;
      } else {
        // Fall back to original credits (assume all theory if no breakdown)
        subjectCredits = subject.originalCredits ?? 0;
      }
    }

    // If the subject has originalCredits but no breakdown, use that
    if (subjectCredits === 0 && subject.originalCredits !== null) {
      subjectCredits = subject.originalCredits;
    }

    // Check credit system compatibility
    if (
      requirement.creditSystemRequired &&
      subject.creditSystem &&
      subject.creditSystem !== requirement.creditSystemRequired
    ) {
      creditSystemMismatch = true;
    }

    totalCredits += subjectCredits;
    if (subject.theoryCredits !== null) theoryCredits += subject.theoryCredits;
    if (subject.practicalCredits !== null) practicalCredits += subject.practicalCredits;

    matchedSubjects.push({
      subjectId: subject.id,
      subjectName: subject.subjectName,
      credits: subjectCredits,
      grade: subject.subjectGrade,
      semester: subject.semesterNumber,
    });

    newUsedIds.add(subject.id);
  }

  return {
    totalCredits,
    theoryCredits,
    practicalCredits,
    creditSystem: candidateSubjects[0]?.creditSystem ?? 'unknown',
    matchedSubjects,
    usedSubjectIds: newUsedIds,
    creditSystemMismatch,
  };
}

/**
 * Check whether the credit system is reliably convertible to the required system.
 */
export function isCreditSystemConvertible(
  studentSystem: string | null,
  requiredSystem: string | null,
): boolean {
  if (!studentSystem || !requiredSystem) return false;
  if (studentSystem === requiredSystem) return true;

  // We do NOT blindly convert Indian credits to ECTS.
  // Only allow conversion when explicitly flagged via officialEctsEquivalent.
  return false;
}
