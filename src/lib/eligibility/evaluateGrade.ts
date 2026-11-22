// Grade Requirement Evaluator
// Compares the student's academic grade against the programme minimum.
// Only converts between grading systems when the conversion is known and reliable.

import type {
  RequirementEvaluation,
  StudentProfile,
  ProgrammeRequirement,
} from './types';
import { KNOWN_GRADING_SCALES } from './constants';

/**
 * Normalize a grading system name to a key in KNOWN_GRADING_SCALES.
 */
function normalizeGradingSystem(raw: string): string {
  const lower = raw.toLowerCase().replace(/[\s\-_]/g, '');
  if (lower.includes('cgpa') && lower.includes('10')) return 'cgpa_10';
  if (lower.includes('cgpa') && lower.includes('4')) return 'cgpa_4';
  if (lower.includes('gpa') && lower.includes('4')) return 'cgpa_4';
  if (lower.includes('percentage') || lower.includes('percent')) return 'percentage';
  if (lower.includes('cgpa')) return 'cgpa_10'; // default CGPA = 10-point
  return raw;
}

/**
 * Attempt to convert a score from one grading system to another.
 * Returns null when conversion is not reliably possible.
 */
function convertGrade(
  score: number,
  fromSystem: string,
  toSystem: string,
): number | null {
  const fromKey = normalizeGradingSystem(fromSystem);
  const toKey = normalizeGradingSystem(toSystem);

  if (fromKey === toKey) return score;

  const fromScale = KNOWN_GRADING_SCALES[fromKey];
  const toScale = KNOWN_GRADING_SCALES[toKey];

  if (!fromScale || !toScale) return null;

  // Normalize to 0-1 range, then to target scale
  const normalized = (score - fromScale.min) / (fromScale.max - fromScale.min);
  return normalized * (toScale.max - toScale.min) + toScale.min;
}

export function evaluateGrade(
  profile: StudentProfile,
  requirement: ProgrammeRequirement,
): RequirementEvaluation {
  const base: Omit<RequirementEvaluation, 'status' | 'studentValue' | 'explanation' | 'details'> = {
    requirementId: requirement.id,
    requirementType: requirement.requirementType,
    requirementDescription: requirement.requirementDescription ?? 'Academic grade requirement',
    requiredValue: requirement.requiredValue ??
      (requirement.requiredValueNumeric !== null ? String(requirement.requiredValueNumeric) : null),
    isMandatory: requirement.isMandatory,
  };

  // Find the most relevant academic result
  if (profile.academicResults.length === 0) {
    return {
      ...base,
      status: 'UNKNOWN',
      studentValue: null,
      explanation: 'No academic results found in the student profile. Cannot evaluate grade requirement.',
    };
  }

  // Use the first academic result (primary education)
  // In practice, we'd match by education level; for now pick the best available
  const result = profile.academicResults[0];
  const requiredScore = requirement.requiredValueNumeric;

  if (requiredScore === null || requiredScore === undefined) {
    return {
      ...base,
      status: 'NEEDS_REVIEW',
      studentValue: formatStudentGrade(result),
      explanation:
        `Your academic result is ${formatStudentGrade(result)}. ` +
        'The programme does not specify a numeric grade threshold, so manual review is needed.',
    };
  }

  const studentScore = result.actualScore;
  if (studentScore === null) {
    // Try percentage as fallback
    if (result.percentage !== null) {
      return evaluateWithScore(result.percentage, 'percentage', requiredScore, requirement, result, base);
    }
    return {
      ...base,
      status: 'UNKNOWN',
      studentValue: null,
      explanation: 'No numeric grade information is available. Cannot evaluate grade requirement.',
    };
  }

  const studentSystem = result.gradingSystem;
  const requiredSystem = requirement.unit ?? requirement.requiredValue ?? '';

  return evaluateWithScore(studentScore, studentSystem, requiredScore, requirement, result, base);
}

function evaluateWithScore(
  studentScore: number,
  studentSystem: string,
  requiredScore: number,
  requirement: ProgrammeRequirement,
  result: { gradingSystem: string; actualScore: number | null; percentage: number | null },
  base: Omit<RequirementEvaluation, 'status' | 'studentValue' | 'explanation' | 'details'>,
): RequirementEvaluation {
  const requiredSystem = requirement.unit ?? '';
  const studentSystemKey = normalizeGradingSystem(studentSystem);
  const requiredSystemKey = normalizeGradingSystem(requiredSystem);

  // Same grading system — direct comparison
  if (studentSystemKey === requiredSystemKey || !requiredSystem) {
    if (studentScore >= requiredScore) {
      return {
        ...base,
        status: 'PASSED',
        studentValue: `${studentScore} (${studentSystem})`,
        explanation:
          `Your academic score of ${studentScore} (${studentSystem}) meets the minimum requirement of ${requiredScore}.`,
      };
    }
    return {
      ...base,
      status: 'FAILED',
      studentValue: `${studentScore} (${studentSystem})`,
      explanation:
        `Your academic score of ${studentScore} (${studentSystem}) is below the minimum requirement of ${requiredScore}.`,
    };
  }

  // Different grading systems — try conversion
  const converted = convertGrade(studentScore, studentSystem, requiredSystem);

  if (converted === null) {
    return {
      ...base,
      status: 'NEEDS_REVIEW',
      studentValue: `${studentScore} (${studentSystem})`,
      explanation:
        `Your academic score is ${studentScore} on the ${studentSystem} scale. ` +
        `The programme requires ${requiredScore} on the ${requiredSystem} scale. ` +
        'Grade equivalence requires verification — the conversion between these systems is not reliably known.',
      details: {
        originalScore: studentScore,
        originalSystem: studentSystem,
        requiredScore,
        requiredSystem,
      },
    };
  }

  if (converted >= requiredScore) {
    return {
      ...base,
      status: 'PASSED',
      studentValue: `${studentScore} (${studentSystem}) ≈ ${converted.toFixed(2)} (${requiredSystem})`,
      explanation:
        `Your academic score of ${studentScore} (${studentSystem}) converts to approximately ${converted.toFixed(2)} ` +
        `on the ${requiredSystem} scale, which meets the minimum requirement of ${requiredScore}.`,
      details: {
        originalScore: studentScore,
        convertedScore: converted,
        conversionMethod: `${studentSystem} → ${requiredSystem}`,
      },
    };
  }

  return {
    ...base,
    status: 'FAILED',
    studentValue: `${studentScore} (${studentSystem}) ≈ ${converted.toFixed(2)} (${requiredSystem})`,
    explanation:
      `Your academic score of ${studentScore} (${studentSystem}) converts to approximately ${converted.toFixed(2)} ` +
      `on the ${requiredSystem} scale, which is below the minimum requirement of ${requiredScore}.`,
    details: {
      originalScore: studentScore,
      convertedScore: converted,
      conversionMethod: `${studentSystem} → ${requiredSystem}`,
    },
  };
}

function formatStudentGrade(result: {
  gradingSystem: string;
  actualScore: number | null;
  percentage: number | null;
  classOrDivision: string | null;
}): string {
  const parts: string[] = [];
  if (result.actualScore !== null) {
    parts.push(`${result.actualScore} (${result.gradingSystem})`);
  }
  if (result.percentage !== null) {
    parts.push(`${result.percentage}%`);
  }
  if (result.classOrDivision) {
    parts.push(result.classOrDivision);
  }
  return parts.join(', ') || 'N/A';
}
