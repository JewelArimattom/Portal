import { z } from 'zod';

export const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().min(1, 'Nationality is required'),
  currentCountry: z.string().min(1, 'Current country is required'),
  currentState: z.string().optional(),
  currentCity: z.string().optional(),
  passportAvailable: z.enum(['yes', 'no', 'in_progress', '']).refine((value) => value !== '', 'Select your passport status'),
  preferredLanguage: z.string(),
});

export type PersonalInfoInput = z.input<typeof personalInfoSchema>;

export const studyPreferencesSchema = z.object({
  intendedDegree: z.enum(['bachelor', 'master', '']).refine((value) => value !== '', 'Select a degree level'),
  preferredCountries: z.array(z.string()).min(1, 'Select at least one country'),
  preferredAcademicYear: z.string().optional(),
  preferredIntake: z.enum(['winter', 'summer', 'flexible']),
  institutionTypePreference: z.enum(['public', 'private', 'both']),
  programmeLanguage: z.enum(['english', 'german', 'both']),
  willingnessToLearnGerman: z.boolean(),
  currentGermanLevel: z.enum(['', 'none', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  preferredSubjectAreas: z.array(z.string()),
  preferredCities: z.array(z.string()),
  maxTuitionPerSemester: z.number().nullable().optional(),
  annualLivingBudget: z.number().nullable().optional(),
  scholarshipRequired: z.boolean(),
  willingnessToRelocate: z.boolean(),
  willingnessEntranceExam: z.boolean(),
});

export type StudyPreferencesInput = z.input<typeof studyPreferencesSchema>;

export const educationSchema = z.object({
  id: z.string().optional(),
  qualificationType: z.string().min(1, 'Qualification type is required'),
  qualificationName: z.string().nullable().optional(),
  boardOrUniversity: z.string().nullable().optional(),
  institutionName: z.string().nullable().optional(),
  institutionCountry: z.string().optional(),
  institutionCity: z.string().nullable().optional(),
  institutionType: z.enum(['public', 'private']).optional(),
  streamOrSpecialization: z.string().nullable().optional(),
  completionYear: z.number().nullable().optional(),
  durationYears: z.number().positive().nullable().optional(),
  numberOfSemesters: z.number().int().positive().nullable().optional(),
  fullTime: z.boolean().optional(),
  creditSystem: z.string().optional(),
  totalCredits: z.number().min(0).nullable().optional(),
  universityRecognition: z.string().nullable().optional(),
  thesisTitle: z.string().nullable().optional(),
  internshipDetails: z.string().nullable().optional(),
  mathematicsStudied: z.boolean().optional(),
  physicsStudied: z.boolean().optional(),
  chemistryStudied: z.boolean().optional(),
  entranceExamDetails: z.string().nullable().optional(),
});

export type EducationInput = z.infer<typeof educationSchema>;

export const academicResultsSchema = z.object({
  educationId: z.string(),
  gradingSystem: z.enum(['cgpa', 'percentage', 'gpa', 'german', 'other', '']).refine((value) => value !== '', 'Select your grading system'),
  actualScore: z.number({ error: 'Enter your result' }).min(0),
  maximumScore: z.number({ error: 'Enter the maximum score' }).gt(0, 'Maximum score must be greater than zero'),
  percentage: z.number().min(0).max(100).nullable().optional(),
  classOrDivision: z.string().nullable().optional(),
  degreeStatus: z.enum(['completed', 'in_progress', 'incomplete', 'dropped', '']).refine((value) => value !== '', 'Select your degree status'),
  failedSubjects: z.number().int().min(0).optional(),
  repeatedSubjects: z.number().int().min(0).optional(),
  backlogs: z.number().int().min(0).optional(),
  academicGapsMonths: z.number().int().min(0).optional(),
  awards: z.string().nullable().optional(),
  distinctions: z.string().nullable().optional(),
}).refine((result) => result.actualScore <= result.maximumScore, {
  message: 'Your result cannot exceed the maximum possible score',
  path: ['actualScore'],
});

export type AcademicResultsInput = z.input<typeof academicResultsSchema>;

export const subjectSchema = z.object({
  id: z.string().optional(),
  educationId: z.string(),
  semesterNumber: z.number().int().min(1),
  subjectName: z.string().min(1, 'Subject name is required'),
  subjectCode: z.string().nullable().optional(),
  originalCredits: z.number().gt(0, 'Enter the credits shown on your transcript'),
  creditSystem: z.string().optional(),
  theoryCredits: z.number().nullable().optional(),
  practicalCredits: z.number().nullable().optional(),
  subjectGrade: z.string().nullable().optional(),
  subjectMarks: z.number().nullable().optional(),
  categoryName: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export type SubjectInput = z.infer<typeof subjectSchema>;

export const languageCertificateSchema = z.object({
  id: z.string().optional(),
  language: z.enum(['english', 'german']),
  testType: z.string().min(1, 'Test type is required'),
  level: z.string().nullable().optional(),
  overallScore: z.number().nullable().optional(),
  readingScore: z.number().nullable().optional(),
  writingScore: z.number().nullable().optional(),
  listeningScore: z.number().nullable().optional(),
  speakingScore: z.number().nullable().optional(),
  testDate: z.string().nullable().optional(),
  expiryDate: z.string().nullable().optional(),
  certificateAvailable: z.boolean().optional(),
  plannedTestDate: z.string().nullable().optional(),
  expectedScore: z.number().nullable().optional(),
  moiCertificateAvailable: z.boolean().optional(),
  englishTaughtDegree: z.boolean().optional(),
});

export type LanguageCertificateInput = z.infer<typeof languageCertificateSchema>;

export const additionalQualificationSchema = z.object({
  id: z.string().optional(),
  qualificationType: z.string().min(1),
  title: z.string().min(1, 'Title is required'),
  organization: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  durationMonths: z.number().int().min(0).nullable().optional(),
  url: z.string().nullable().optional(),
});

export type AdditionalQualificationInput = z.infer<typeof additionalQualificationSchema>;

export const courseInterestsSchema = z.object({
  preferredStudyFields: z.array(z.string()),
  preferredSpecializations: z.array(z.string()),
  careerGoal: z.string().nullable().optional(),
  researchOrIndustry: z.enum(['research', 'industry', 'both', 'undecided']),
  willingnessToChangeField: z.boolean(),
  preferredDuration: z.string().nullable().optional(),
  importanceTuition: z.number().min(1).max(5),
  importanceCity: z.number().min(1).max(5),
  importanceReputation: z.number().min(1).max(5),
  importanceEmployment: z.number().min(1).max(5),
});

export type CourseInterestsInput = z.infer<typeof courseInterestsSchema>;

export const financialInfoSchema = z.object({
  maxTuitionPerSemester: z.number().nullable().optional(),
  tuitionPreference: z.string().nullable().optional(),
  annualLivingBudget: z.number().nullable().optional(),
  privateUniversityAffordable: z.boolean(),
  applicationFeeBudget: z.number().nullable().optional(),
  scholarshipRequired: z.boolean(),
  financialFlexibility: z.string().nullable().optional(),
});

export type FinancialInfoInput = z.infer<typeof financialInfoSchema>;

export const applicationReadinessSchema = z.object({
  passportReady: z.boolean(),
  transcriptsReady: z.boolean(),
  degreeCertReady: z.boolean(),
  languageCertReady: z.boolean(),
  cvReady: z.boolean(),
  motivationLetterReady: z.boolean(),
  recommendationLettersReady: z.boolean(),
  syllabusReady: z.boolean(),
  apsCertificateStatus: z.enum(['not_applicable', 'applied', 'received', 'not_started']),
  uniAssistAccount: z.enum(['yes', 'no', 'not_sure']),
  previousApplications: z.number(),
});

export type ApplicationReadinessInput = z.infer<typeof applicationReadinessSchema>;
