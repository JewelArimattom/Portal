// Eligibility Engine Types
// Pure deterministic evaluation types — NO AI, NO LLMs

export type EvalStatus = 'PASSED' | 'FAILED' | 'UNKNOWN' | 'CONDITIONAL' | 'NOT_APPLICABLE' | 'NEEDS_REVIEW';
export type OverallEligibility = 'ELIGIBLE' | 'CONDITIONALLY_ELIGIBLE' | 'NEEDS_VERIFICATION' | 'NOT_ELIGIBLE' | 'NOT_EVALUATED';

export interface RequirementEvaluation {
  requirementId: string;
  requirementType: string;
  requirementDescription: string;
  status: EvalStatus;
  studentValue: string | null;
  requiredValue: string | null;
  explanation: string;
  details?: Record<string, unknown>;
  isMandatory: boolean;
}

export interface SubjectCreditBreakdown {
  categoryName: string;
  requiredCredits: number;
  earnedCredits: number;
  creditSystem: string;
  matchedSubjects: Array<{
    subjectName: string;
    credits: number;
    grade: string | null;
    semester: number;
  }>;
  status: EvalStatus;
}

export interface CompatibilityBreakdown {
  degreeRelevance: number; // out of 20
  subjectMatch: number; // out of 30
  academicPerformance: number; // out of 15
  languageMatch: number; // out of 15
  otherRequirements: number; // out of 10
  supportingQualifications: number; // out of 10
  totalScore: number; // out of 100
  isProvisional: boolean;
  missingInformation: string[];
}

export interface ProgrammeEvaluationResult {
  programmeId: string;
  programmeName: string;
  universityName: string;
  overallEligibility: OverallEligibility;
  compatibilityScore: CompatibilityBreakdown;
  requirementResults: RequirementEvaluation[];
  evaluatedAt: string;
  requirementVersionUsed: number;
  profileCompleteness: number;
}

// Student profile types used by the engine
export interface StudentProfile {
  id: string;
  educations: StudentEducation[];
  academicResults: StudentAcademicResult[];
  subjects: StudentSubject[];
  subjectMappings: SubjectMapping[];
  languageCertificates: StudentLanguageCertificate[];
  additionalQualifications: StudentQualification[];
  preferences: StudentPreferences;
  documents: StudentDocument[];
}

export interface StudentEducation {
  id: string;
  qualificationType: string;
  qualificationName: string | null;
  boardOrUniversity: string | null;
  institutionName: string | null;
  institutionCountry: string | null;
  institutionType: string | null;
  streamOrSpecialization: string | null;
  completionYear: number | null;
  durationYears: number | null;
  numberOfSemesters: number | null;
  fullTime: boolean;
  creditSystem: string | null;
  totalCredits: number | null;
  universityRecognition: string | null;
  thesisTitle: string | null;
}

export interface StudentAcademicResult {
  educationId: string;
  gradingSystem: string;
  actualScore: number | null;
  maximumScore: number | null;
  percentage: number | null;
  classOrDivision: string | null;
  degreeStatus: string;
  failedSubjects: number;
  backlogs: number;
}

export interface StudentSubject {
  id: string;
  educationId: string;
  semesterNumber: number;
  subjectName: string;
  originalCredits: number | null;
  creditSystem: string | null;
  theoryCredits: number | null;
  practicalCredits: number | null;
  subjectGrade: string | null;
  subjectMarks: number | null;
}

export interface SubjectMapping {
  subjectId: string;
  categoryId: string;
  categoryName: string;
}

export interface StudentLanguageCertificate {
  language: string;
  testType: string;
  level: string | null;
  overallScore: number | null;
  readingScore: number | null;
  writingScore: number | null;
  listeningScore: number | null;
  speakingScore: number | null;
  testDate: string | null;
  expiryDate: string | null;
  certificateAvailable: boolean;
  moiCertificateAvailable: boolean;
  englishTaughtDegree: boolean;
}

export interface StudentQualification {
  qualificationType: string;
  title: string;
  durationMonths: number | null;
}

export interface StudentPreferences {
  intendedDegree: string | null;
  preferredCountries: string[];
  programmLanguage: string | null;
}

export interface StudentDocument {
  documentType: string;
  verificationStatus: string;
}

export interface ProgrammeRequirement {
  id: string;
  programmeId: string;
  conditionGroupId: string | null;
  requirementType: string;
  requirementDescription: string | null;
  isMandatory: boolean;
  operator: string | null;
  requiredValue: string | null;
  requiredValueNumeric: number | null;
  unit: string | null;
  subjectCategoryId: string | null;
  subjectCategoryName: string | null;
  minCredits: number | null;
  creditSystemRequired: string | null;
  officialEctsEquivalent: boolean;
  practicalCreditsCount: boolean;
  allowDoubleCounting: boolean;
  verificationStatus: string;
  requirementVersion: number;
}

export interface ConditionGroup {
  id: string;
  programmeId: string;
  parentGroupId: string | null;
  logic: 'AND' | 'OR';
  label: string | null;
  requirements: ProgrammeRequirement[];
  childGroups: ConditionGroup[];
}

export interface ProgrammeData {
  id: string;
  name: string;
  universityName: string;
  degreeLevel: string;
  teachingLanguage: string;
  requirementVersion: number;
  requirementsDataStatus?: 'unknown' | 'partial' | 'complete';
  admissionSelectivity?: 'unknown' | 'open' | 'restricted' | 'special_requirements';
  requirements: ProgrammeRequirement[];
  conditionGroups: ConditionGroup[];
}
