// Degree Requirement Evaluator
// Evaluates whether a student's degree type, specialization, duration, and
// institution recognition satisfy a programme requirement.

import type {
  RequirementEvaluation,
  StudentProfile,
  ProgrammeRequirement,
} from './types';

/** Degree-level hierarchy for ordering comparisons */
const DEGREE_LEVEL_ORDER: Record<string, number> = {
  'certificate': 1,
  'diploma': 2,
  'associate': 3,
  'bachelor': 4,
  'bachelors': 4,
  "bachelor's": 4,
  'postgraduate_diploma': 5,
  'master': 6,
  'masters': 6,
  "master's": 6,
  'doctorate': 7,
  'phd': 7,
};

/** Normalize a degree level string to its canonical form */
function normalizeDegreeLevel(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/_/g, ' ')
    .trim();
}

/** Check whether the student degree level satisfies the required level */
function degreeLevelSatisfies(studentLevel: string, requiredLevel: string): boolean | null {
  const sNorm = normalizeDegreeLevel(studentLevel);
  const rNorm = normalizeDegreeLevel(requiredLevel);

  const sOrder = Object.entries(DEGREE_LEVEL_ORDER).find(([k]) => sNorm.includes(k))?.[1];
  const rOrder = Object.entries(DEGREE_LEVEL_ORDER).find(([k]) => rNorm.includes(k))?.[1];

  if (sOrder === undefined || rOrder === undefined) return null; // Unknown levels
  return sOrder >= rOrder;
}

/** Check if a student specialization matches a required field keyword */
function specializationMatches(
  studentSpecialization: string | null,
  qualificationName: string | null,
  requiredValue: string | null,
): boolean | null {
  if (!requiredValue) return true; // No specific field required
  if (!studentSpecialization && !qualificationName) return null; // No data

  const reqLower = requiredValue.toLowerCase();
  const keywords = reqLower.split(/[,;|/]/).map((k) => k.trim()).filter(Boolean);

  const haystack = [
    studentSpecialization?.toLowerCase() ?? '',
    qualificationName?.toLowerCase() ?? '',
  ].join(' ');

  return keywords.some((kw) => haystack.includes(kw));
}

export function evaluateDegree(
  profile: StudentProfile,
  requirement: ProgrammeRequirement,
): RequirementEvaluation {
  const base: Omit<RequirementEvaluation, 'status' | 'studentValue' | 'explanation' | 'details'> = {
    requirementId: requirement.id,
    requirementType: requirement.requirementType,
    requirementDescription: requirement.requirementDescription ?? 'Degree requirement',
    requiredValue: requirement.requiredValue,
    isMandatory: requirement.isMandatory,
  };

  // No education records at all
  if (profile.educations.length === 0) {
    return {
      ...base,
      status: 'UNKNOWN',
      studentValue: null,
      explanation: 'No education records found in the student profile. Cannot evaluate degree requirement.',
    };
  }

  // Find the most relevant education (highest level)
  const sortedEducations = [...profile.educations].sort((a, b) => {
    const aOrder = Object.entries(DEGREE_LEVEL_ORDER).find(
      ([k]) => normalizeDegreeLevel(a.qualificationType).includes(k),
    )?.[1] ?? 0;
    const bOrder = Object.entries(DEGREE_LEVEL_ORDER).find(
      ([k]) => normalizeDegreeLevel(b.qualificationType).includes(k),
    )?.[1] ?? 0;
    return bOrder - aOrder;
  });

  const primaryEdu = sortedEducations[0];
  const academicResult = profile.academicResults.find((r) => r.educationId === primaryEdu.id);

  const studentDegreeStr = [
    primaryEdu.qualificationType,
    primaryEdu.qualificationName ? `in ${primaryEdu.qualificationName}` : null,
    primaryEdu.streamOrSpecialization ? `(${primaryEdu.streamOrSpecialization})` : null,
  ]
    .filter(Boolean)
    .join(' ');

  // Check degree level or field
  if (requirement.requiredValue) {
    if (requirement.operator === 'contains') {
      const match = specializationMatches(
        primaryEdu.streamOrSpecialization,
        primaryEdu.qualificationName,
        requirement.requiredValue,
      );
      if (match === true) {
        return {
          ...base,
          status: 'PASSED',
          studentValue: studentDegreeStr,
          explanation: `Your ${studentDegreeStr} satisfies the degree requirement containing "${requirement.requiredValue}".`,
          details: {
            institutionCountry: primaryEdu.institutionCountry,
            completionYear: primaryEdu.completionYear,
            durationYears: primaryEdu.durationYears,
          },
        };
      } else if (match === false) {
        return {
          ...base,
          status: 'FAILED',
          studentValue: studentDegreeStr,
          explanation: `Your qualification "${studentDegreeStr}" does not match the required field "${requirement.requiredValue}".`,
        };
      }
    }

    const levelMatch = degreeLevelSatisfies(primaryEdu.qualificationType, requirement.requiredValue);

    if (levelMatch === null) {
      // Try specialization match if level is not recognized
      const specMatch = specializationMatches(
        primaryEdu.streamOrSpecialization,
        primaryEdu.qualificationName,
        requirement.requiredValue,
      );
      if (specMatch === true) {
        return {
          ...base,
          status: 'PASSED',
          studentValue: studentDegreeStr,
          explanation: `Your ${studentDegreeStr} satisfies the degree requirement for "${requirement.requiredValue}".`,
          details: {
            institutionCountry: primaryEdu.institutionCountry,
            completionYear: primaryEdu.completionYear,
            durationYears: primaryEdu.durationYears,
          },
        };
      } else if (specMatch === false) {
        return {
          ...base,
          status: 'FAILED',
          studentValue: studentDegreeStr,
          explanation: `Your qualification "${studentDegreeStr}" does not match the required field "${requirement.requiredValue}".`,
        };
      }

      return {
        ...base,
        status: 'NEEDS_REVIEW',
        studentValue: studentDegreeStr,
        explanation: `Your degree type "${primaryEdu.qualificationType}" could not be reliably compared to the required "${requirement.requiredValue}". Manual verification is needed.`,
      };
    }

    if (!levelMatch) {
      return {
        ...base,
        status: 'FAILED',
        studentValue: studentDegreeStr,
        explanation: `Your degree type "${primaryEdu.qualificationType}" does not meet the required level of "${requirement.requiredValue}".`,
      };
    }
  }

  // Check specialization if the requirement specifies one
  if (requirement.requirementDescription) {
    const specKeywords = extractSpecializationKeywords(requirement.requirementDescription);
    if (specKeywords) {
      const specMatch = specializationMatches(
        primaryEdu.streamOrSpecialization,
        primaryEdu.qualificationName,
        specKeywords,
      );

      if (specMatch === null) {
        return {
          ...base,
          status: 'UNKNOWN',
          studentValue: studentDegreeStr,
          explanation: `No specialization information is available to verify whether your degree matches the requirement: "${requirement.requirementDescription}".`,
        };
      }

      if (!specMatch) {
        return {
          ...base,
          status: 'FAILED',
          studentValue: studentDegreeStr,
          explanation: `Your specialization "${primaryEdu.streamOrSpecialization ?? primaryEdu.qualificationName ?? 'unspecified'}" does not match the required field: "${requirement.requirementDescription}".`,
        };
      }
    }
  }

  // Check duration if specified
  if (requirement.requiredValueNumeric && requirement.unit === 'years') {
    if (primaryEdu.durationYears === null) {
      return {
        ...base,
        status: 'UNKNOWN',
        studentValue: studentDegreeStr,
        explanation: `Degree duration is not specified. The programme requires a minimum of ${requirement.requiredValueNumeric} years.`,
      };
    }
    if (primaryEdu.durationYears < requirement.requiredValueNumeric) {
      return {
        ...base,
        status: 'FAILED',
        studentValue: `${primaryEdu.durationYears} years`,
        explanation: `Your degree duration of ${primaryEdu.durationYears} years is less than the required ${requirement.requiredValueNumeric} years.`,
      };
    }
  }

  // Check completion status
  if (academicResult && academicResult.degreeStatus !== 'completed') {
    return {
      ...base,
      status: 'CONDITIONAL',
      studentValue: studentDegreeStr,
      explanation: `Your degree is currently "${academicResult.degreeStatus}". The programme requires a completed degree. Status will update upon completion.`,
      details: { degreeStatus: academicResult.degreeStatus },
    };
  }

  return {
    ...base,
    status: 'PASSED',
    studentValue: studentDegreeStr,
    explanation: `Your ${studentDegreeStr} satisfies the degree requirement for this programme.`,
    details: {
      institutionCountry: primaryEdu.institutionCountry,
      completionYear: primaryEdu.completionYear,
      durationYears: primaryEdu.durationYears,
    },
  };
}

/** Extract specialization keywords from a requirement description */
function extractSpecializationKeywords(description: string): string | null {
  // Look for patterns like "in Computer Science" or "related to engineering"
  const patterns = [
    /(?:in|of|related to|field of)\s+([A-Za-z\s,/]+)/i,
    /(?:degree|bachelor|master)(?:'s)?\s+(?:in|of)\s+([A-Za-z\s,/]+)/i,
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}
