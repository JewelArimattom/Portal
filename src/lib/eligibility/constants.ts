// Eligibility Engine Constants
// Deterministic reference values for evaluation

export const COMPATIBILITY_WEIGHTS = {
  degreeRelevance: 20,
  subjectMatch: 30,
  academicPerformance: 15,
  languageMatch: 15,
  otherRequirements: 10,
  supportingQualifications: 10,
} as const;

export const TOTAL_WEIGHT = 100;

// Known grading conversions (only when reliable)
export const KNOWN_GRADING_SCALES: Record<string, { min: number; max: number; passingGrade: number }> = {
  'cgpa_10': { min: 0, max: 10, passingGrade: 4.0 },
  'cgpa_4': { min: 0, max: 4, passingGrade: 2.0 },
  'percentage': { min: 0, max: 100, passingGrade: 40 },
};

// IELTS score bands
export const IELTS_BANDS = { min: 0, max: 9, step: 0.5 };
export const TOEFL_RANGE = { min: 0, max: 120 };

// Subject categories that count as Mathematics
export const MATHEMATICS_CATEGORIES = [
  'Calculus', 'Linear Algebra', 'Discrete Mathematics', 'Statistics',
  'Probability', 'Numerical Methods', 'Differential Equations',
  'Optimization', 'Mathematical Foundations',
];

// Subject categories that count as Computer Science
export const CS_CATEGORIES = [
  'Programming', 'Data Structures', 'Algorithms', 'Operating Systems',
  'Database Management', 'Computer Networks', 'Software Engineering',
  'Computer Architecture', 'Theory of Computation', 'Compiler Design',
  'Cybersecurity', 'Web Development',
];
