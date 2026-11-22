import { describe, it, expect } from 'vitest';
import {
  evaluateProgramme,
  evaluateDegree,
  evaluateSubjects,
  evaluateGrade,
  evaluateLanguage,
  evaluateDeadline,
  calculateCompatibility,
  explainEvaluationResult,
} from '../index';
import type {
  StudentProfile,
  ProgrammeData,
  ProgrammeRequirement,
  ConditionGroup,
} from '../types';

// ============================================================================
// TEST FIXTURES: 5 REALISTIC STUDENT PROFILES
// ============================================================================

/**
 * Profile A: Indian BCA (Bachelor of Computer Applications) graduate.
 * Has programming, databases, math, CS subjects. Has IELTS 7.0. Degree completed.
 */
export const profileA_BCA: StudentProfile = {
  id: 'student-a',
  educations: [
    {
      id: 'edu-a-1',
      qualificationType: 'bachelor',
      qualificationName: 'Bachelor of Computer Applications (BCA)',
      boardOrUniversity: 'Bangalore University',
      institutionName: 'Christ College',
      institutionCountry: 'India',
      institutionType: 'public',
      streamOrSpecialization: 'Computer Applications',
      completionYear: 2024,
      durationYears: 3,
      numberOfSemesters: 6,
      fullTime: true,
      creditSystem: 'indian_credits',
      totalCredits: 140,
      universityRecognition: 'UGC recognized, NAAC A+',
      thesisTitle: 'Distributed Cloud Storage System',
    },
  ],
  academicResults: [
    {
      educationId: 'edu-a-1',
      gradingSystem: 'cgpa_10',
      actualScore: 8.4,
      maximumScore: 10.0,
      percentage: 79.8,
      classOrDivision: 'First Class with Distinction',
      degreeStatus: 'completed',
      failedSubjects: 0,
      backlogs: 0,
    },
  ],
  subjects: [
    { id: 'sub-a-1', educationId: 'edu-a-1', semesterNumber: 1, subjectName: 'Discrete Mathematics', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 4, practicalCredits: 0, subjectGrade: 'A', subjectMarks: 85 },
    { id: 'sub-a-2', educationId: 'edu-a-1', semesterNumber: 1, subjectName: 'C Programming', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 3, practicalCredits: 1, subjectGrade: 'A+', subjectMarks: 90 },
    { id: 'sub-a-3', educationId: 'edu-a-1', semesterNumber: 2, subjectName: 'Data Structures with C++', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 3, practicalCredits: 1, subjectGrade: 'A', subjectMarks: 82 },
    { id: 'sub-a-4', educationId: 'edu-a-1', semesterNumber: 2, subjectName: 'Linear Algebra and Calculus', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 4, practicalCredits: 0, subjectGrade: 'B+', subjectMarks: 74 },
    { id: 'sub-a-5', educationId: 'edu-a-1', semesterNumber: 3, subjectName: 'Operating Systems', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 3, practicalCredits: 1, subjectGrade: 'A', subjectMarks: 80 },
    { id: 'sub-a-6', educationId: 'edu-a-1', semesterNumber: 3, subjectName: 'Database Management Systems', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 3, practicalCredits: 1, subjectGrade: 'A+', subjectMarks: 91 },
    { id: 'sub-a-7', educationId: 'edu-a-1', semesterNumber: 4, subjectName: 'Design and Analysis of Algorithms', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 3, practicalCredits: 1, subjectGrade: 'A', subjectMarks: 88 },
    { id: 'sub-a-8', educationId: 'edu-a-1', semesterNumber: 4, subjectName: 'Probability and Statistics', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 4, practicalCredits: 0, subjectGrade: 'A', subjectMarks: 84 },
    { id: 'sub-a-9', educationId: 'edu-a-1', semesterNumber: 5, subjectName: 'Computer Networks', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 4, practicalCredits: 0, subjectGrade: 'B+', subjectMarks: 76 },
    { id: 'sub-a-10', educationId: 'edu-a-1', semesterNumber: 6, subjectName: 'Software Engineering', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 4, practicalCredits: 0, subjectGrade: 'A', subjectMarks: 85 },
  ],
  subjectMappings: [
    { subjectId: 'sub-a-1', categoryId: 'cat-dm', categoryName: 'Discrete Mathematics' },
    { subjectId: 'sub-a-2', categoryId: 'cat-prog', categoryName: 'Programming' },
    { subjectId: 'sub-a-3', categoryId: 'cat-ds', categoryName: 'Data Structures' },
    { subjectId: 'sub-a-4', categoryId: 'cat-calc', categoryName: 'Calculus' },
    { subjectId: 'sub-a-5', categoryId: 'cat-os', categoryName: 'Operating Systems' },
    { subjectId: 'sub-a-6', categoryId: 'cat-db', categoryName: 'Database Management' },
    { subjectId: 'sub-a-7', categoryId: 'cat-algo', categoryName: 'Algorithms' },
    { subjectId: 'sub-a-8', categoryId: 'cat-stat', categoryName: 'Statistics' },
    { subjectId: 'sub-a-9', categoryId: 'cat-net', categoryName: 'Computer Networks' },
    { subjectId: 'sub-a-10', categoryId: 'cat-se', categoryName: 'Software Engineering' },
  ],
  languageCertificates: [
    {
      language: 'english',
      testType: 'ielts',
      level: null,
      overallScore: 7.0,
      readingScore: 7.5,
      writingScore: 6.5,
      listeningScore: 7.0,
      speakingScore: 7.0,
      testDate: '2025-06-15',
      expiryDate: '2027-06-15',
      certificateAvailable: true,
      moiCertificateAvailable: true,
      englishTaughtDegree: false,
    },
  ],
  additionalQualifications: [
    { qualificationType: 'internship', title: 'Software Developer Intern', durationMonths: 6 },
  ],
  preferences: {
    intendedDegree: 'master',
    preferredCountries: ['Germany', 'Austria'],
    programmLanguage: 'english',
  },
  documents: [
    { documentType: 'passport', verificationStatus: 'verified' },
    { documentType: 'bachelor_certificate', verificationStatus: 'verified' },
    { documentType: 'transcript', verificationStatus: 'verified' },
    { documentType: 'english_certificate', verificationStatus: 'verified' },
  ],
};

/**
 * Profile B: Indian BBA (Bachelor of Business Administration) graduate.
 * Has statistics, economics, accounting, management. Has IELTS 6.5.
 */
export const profileB_BBA: StudentProfile = {
  id: 'student-b',
  educations: [
    {
      id: 'edu-b-1',
      qualificationType: 'bachelor',
      qualificationName: 'Bachelor of Business Administration',
      boardOrUniversity: 'Delhi University',
      institutionName: 'Shaheed Sukhdev College',
      institutionCountry: 'India',
      institutionType: 'public',
      streamOrSpecialization: 'Finance and Business Management',
      completionYear: 2024,
      durationYears: 3,
      numberOfSemesters: 6,
      fullTime: true,
      creditSystem: 'indian_credits',
      totalCredits: 120,
      universityRecognition: 'UGC recognized',
      thesisTitle: null,
    },
  ],
  academicResults: [
    {
      educationId: 'edu-b-1',
      gradingSystem: 'cgpa_10',
      actualScore: 7.8,
      maximumScore: 10.0,
      percentage: 74.1,
      classOrDivision: 'First Class',
      degreeStatus: 'completed',
      failedSubjects: 0,
      backlogs: 0,
    },
  ],
  subjects: [
    { id: 'sub-b-1', educationId: 'edu-b-1', semesterNumber: 1, subjectName: 'Financial Accounting', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 4, practicalCredits: 0, subjectGrade: 'A', subjectMarks: 80 },
    { id: 'sub-b-2', educationId: 'edu-b-1', semesterNumber: 2, subjectName: 'Microeconomics', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 4, practicalCredits: 0, subjectGrade: 'B+', subjectMarks: 72 },
    { id: 'sub-b-3', educationId: 'edu-b-1', semesterNumber: 3, subjectName: 'Business Statistics', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 4, practicalCredits: 0, subjectGrade: 'A', subjectMarks: 85 },
    { id: 'sub-b-4', educationId: 'edu-b-1', semesterNumber: 4, subjectName: 'Corporate Finance', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 4, practicalCredits: 0, subjectGrade: 'A', subjectMarks: 88 },
    { id: 'sub-b-5', educationId: 'edu-b-1', semesterNumber: 5, subjectName: 'Marketing Management', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 4, practicalCredits: 0, subjectGrade: 'A', subjectMarks: 81 },
  ],
  subjectMappings: [
    { subjectId: 'sub-b-1', categoryId: 'cat-acc', categoryName: 'Accounting' },
    { subjectId: 'sub-b-2', categoryId: 'cat-econ', categoryName: 'Economics' },
    { subjectId: 'sub-b-3', categoryId: 'cat-stat', categoryName: 'Statistics' },
    { subjectId: 'sub-b-4', categoryId: 'cat-fin', categoryName: 'Finance' },
    { subjectId: 'sub-b-5', categoryId: 'cat-mgmt', categoryName: 'Business Management' },
  ],
  languageCertificates: [
    {
      language: 'english',
      testType: 'ielts',
      level: null,
      overallScore: 6.5,
      readingScore: 6.5,
      writingScore: 6.0,
      listeningScore: 6.5,
      speakingScore: 6.5,
      testDate: '2025-08-10',
      expiryDate: '2027-08-10',
      certificateAvailable: true,
      moiCertificateAvailable: true,
      englishTaughtDegree: false,
    },
  ],
  additionalQualifications: [],
  preferences: {
    intendedDegree: 'master',
    preferredCountries: ['Germany'],
    programmLanguage: 'english',
  },
  documents: [],
};

/**
 * Profile C: Indian B.E. (Bachelor of Engineering in Electronics & Communication).
 * Has math, programming, electronics. Has NO English test yet.
 */
export const profileC_BE: StudentProfile = {
  id: 'student-c',
  educations: [
    {
      id: 'edu-c-1',
      qualificationType: 'bachelor',
      qualificationName: 'Bachelor of Engineering in Electronics & Communication',
      boardOrUniversity: 'Visvesvaraya Technological University',
      institutionName: 'BMS College of Engineering',
      institutionCountry: 'India',
      institutionType: 'public',
      streamOrSpecialization: 'Electronics and Communication Engineering',
      completionYear: 2024,
      durationYears: 4,
      numberOfSemesters: 8,
      fullTime: true,
      creditSystem: 'indian_credits',
      totalCredits: 175,
      universityRecognition: 'AICTE approved',
      thesisTitle: 'FPGA based Signal Processor',
    },
  ],
  academicResults: [
    {
      educationId: 'edu-c-1',
      gradingSystem: 'cgpa_10',
      actualScore: 7.9,
      maximumScore: 10.0,
      percentage: 75.0,
      classOrDivision: 'First Class',
      degreeStatus: 'completed',
      failedSubjects: 0,
      backlogs: 0,
    },
  ],
  subjects: [
    { id: 'sub-c-1', educationId: 'edu-c-1', semesterNumber: 1, subjectName: 'Engineering Mathematics I (Calculus)', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 4, practicalCredits: 0, subjectGrade: 'A', subjectMarks: 85 },
    { id: 'sub-c-2', educationId: 'edu-c-1', semesterNumber: 2, subjectName: 'Engineering Mathematics II (Linear Algebra & Differential Eq)', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 4, practicalCredits: 0, subjectGrade: 'A', subjectMarks: 82 },
    { id: 'sub-c-3', educationId: 'edu-c-1', semesterNumber: 3, subjectName: 'C and C++ Programming', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 3, practicalCredits: 1, subjectGrade: 'B+', subjectMarks: 78 },
    { id: 'sub-c-4', educationId: 'edu-c-1', semesterNumber: 4, subjectName: 'Signals and Systems', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 4, practicalCredits: 0, subjectGrade: 'A', subjectMarks: 84 },
    { id: 'sub-c-5', educationId: 'edu-c-1', semesterNumber: 5, subjectName: 'Digital Signal Processing', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 3, practicalCredits: 1, subjectGrade: 'A', subjectMarks: 86 },
  ],
  subjectMappings: [
    { subjectId: 'sub-c-1', categoryId: 'cat-calc', categoryName: 'Calculus' },
    { subjectId: 'sub-c-2', categoryId: 'cat-la', categoryName: 'Linear Algebra' },
    { subjectId: 'sub-c-3', categoryId: 'cat-prog', categoryName: 'Programming' },
    { subjectId: 'sub-c-4', categoryId: 'cat-sig', categoryName: 'Signals and Systems' },
  ],
  languageCertificates: [], // No English test yet
  additionalQualifications: [
    { qualificationType: 'project', title: 'Smart IoT Gateway', durationMonths: 4 },
  ],
  preferences: {
    intendedDegree: 'master',
    preferredCountries: ['Germany'],
    programmLanguage: 'english',
  },
  documents: [],
};

/**
 * Profile D: Incomplete student with missing transcripts and unmapped subjects.
 */
export const profileD_Incomplete: StudentProfile = {
  id: 'student-d',
  educations: [
    {
      id: 'edu-d-1',
      qualificationType: 'bachelor',
      qualificationName: 'B.Sc Computer Science',
      boardOrUniversity: 'Unknown University',
      institutionName: 'Unknown',
      institutionCountry: 'India',
      institutionType: null,
      streamOrSpecialization: null,
      completionYear: null,
      durationYears: 3,
      numberOfSemesters: 6,
      fullTime: true,
      creditSystem: null,
      totalCredits: null,
      universityRecognition: null,
      thesisTitle: null,
    },
  ],
  academicResults: [],
  subjects: [],
  subjectMappings: [],
  languageCertificates: [],
  additionalQualifications: [],
  preferences: {
    intendedDegree: 'master',
    preferredCountries: ['Germany'],
    programmLanguage: 'english',
  },
  documents: [],
};

/**
 * Profile E: Low CGPA student (5.5/10) with sufficient subject credits.
 */
export const profileE_LowGrade: StudentProfile = {
  id: 'student-e',
  educations: [
    {
      id: 'edu-e-1',
      qualificationType: 'bachelor',
      qualificationName: 'B.Tech Information Technology',
      boardOrUniversity: 'Anna University',
      institutionName: 'Affiliated College',
      institutionCountry: 'India',
      institutionType: 'public',
      streamOrSpecialization: 'Information Technology',
      completionYear: 2023,
      durationYears: 4,
      numberOfSemesters: 8,
      fullTime: true,
      creditSystem: 'indian_credits',
      totalCredits: 160,
      universityRecognition: 'AICTE approved',
      thesisTitle: null,
    },
  ],
  academicResults: [
    {
      educationId: 'edu-e-1',
      gradingSystem: 'cgpa_10',
      actualScore: 5.5,
      maximumScore: 10.0,
      percentage: 52.0,
      classOrDivision: 'Second Class',
      degreeStatus: 'completed',
      failedSubjects: 2,
      backlogs: 0,
    },
  ],
  subjects: [
    { id: 'sub-e-1', educationId: 'edu-e-1', semesterNumber: 1, subjectName: 'Calculus and Linear Algebra', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 4, practicalCredits: 0, subjectGrade: 'C', subjectMarks: 50 },
    { id: 'sub-e-2', educationId: 'edu-e-1', semesterNumber: 2, subjectName: 'Python Programming', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 3, practicalCredits: 1, subjectGrade: 'C', subjectMarks: 52 },
    { id: 'sub-e-3', educationId: 'edu-e-1', semesterNumber: 3, subjectName: 'Data Structures and Algorithms', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 3, practicalCredits: 1, subjectGrade: 'B', subjectMarks: 60 },
    { id: 'sub-e-4', educationId: 'edu-e-1', semesterNumber: 4, subjectName: 'Database Systems', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 3, practicalCredits: 1, subjectGrade: 'C', subjectMarks: 55 },
    { id: 'sub-e-5', educationId: 'edu-e-1', semesterNumber: 5, subjectName: 'Operating Systems and Networks', originalCredits: 4, creditSystem: 'indian_credits', theoryCredits: 4, practicalCredits: 0, subjectGrade: 'B', subjectMarks: 62 },
  ],
  subjectMappings: [
    { subjectId: 'sub-e-1', categoryId: 'cat-math', categoryName: 'Calculus' },
    { subjectId: 'sub-e-2', categoryId: 'cat-prog', categoryName: 'Programming' },
    { subjectId: 'sub-e-3', categoryId: 'cat-algo', categoryName: 'Algorithms' },
    { subjectId: 'sub-e-4', categoryId: 'cat-db', categoryName: 'Database Management' },
    { subjectId: 'sub-e-5', categoryId: 'cat-os', categoryName: 'Operating Systems' },
  ],
  languageCertificates: [
    {
      language: 'english',
      testType: 'ielts',
      level: null,
      overallScore: 6.5,
      readingScore: 6.5,
      writingScore: 6.0,
      listeningScore: 6.5,
      speakingScore: 6.0,
      testDate: '2025-03-01',
      expiryDate: '2027-03-01',
      certificateAvailable: true,
      moiCertificateAvailable: true,
      englishTaughtDegree: false,
    },
  ],
  additionalQualifications: [],
  preferences: {
    intendedDegree: 'master',
    preferredCountries: ['Germany'],
    programmLanguage: 'english',
  },
  documents: [],
};

// ============================================================================
// TEST FIXTURES: SAMPLE PROGRAMMES
// ============================================================================

export const sampleCSMaster: ProgrammeData = {
  id: 'prog-cs-master-1',
  name: 'M.Sc. Computer Science',
  universityName: 'Technical University of Munich (TUM)',
  degreeLevel: 'master',
  teachingLanguage: 'english',
  requirementVersion: 1,
  requirements: [
    {
      id: 'req-1',
      programmeId: 'prog-cs-master-1',
      conditionGroupId: null,
      requirementType: 'degree',
      requirementDescription: "Bachelor's degree in Computer Science, Computer Applications, or related IT discipline",
      isMandatory: true,
      operator: 'contains',
      requiredValue: 'Computer',
      requiredValueNumeric: null,
      unit: null,
      subjectCategoryId: null,
      subjectCategoryName: null,
      minCredits: null,
      creditSystemRequired: null,
      officialEctsEquivalent: false,
      practicalCreditsCount: true,
      allowDoubleCounting: false,
      verificationStatus: 'verified',
      requirementVersion: 1,
    },
    {
      id: 'req-2',
      programmeId: 'prog-cs-master-1',
      conditionGroupId: null,
      requirementType: 'subject_credits',
      requirementDescription: 'At least 12 credits in Mathematics/Calculus/Statistics',
      isMandatory: true,
      operator: 'gte',
      requiredValue: '12',
      requiredValueNumeric: 12,
      unit: 'credits',
      subjectCategoryId: null,
      subjectCategoryName: 'Mathematics',
      minCredits: 12,
      creditSystemRequired: 'indian_credits',
      officialEctsEquivalent: false,
      practicalCreditsCount: true,
      allowDoubleCounting: false,
      verificationStatus: 'verified',
      requirementVersion: 1,
    },
    {
      id: 'req-3',
      programmeId: 'prog-cs-master-1',
      conditionGroupId: null,
      requirementType: 'grade',
      requirementDescription: 'Minimum CGPA of 7.0/10 or equivalent (German grade 2.5 or better)',
      isMandatory: true,
      operator: 'gte',
      requiredValue: '7.0',
      requiredValueNumeric: 7.0,
      unit: 'cgpa_10',
      subjectCategoryId: null,
      subjectCategoryName: null,
      minCredits: null,
      creditSystemRequired: null,
      officialEctsEquivalent: false,
      practicalCreditsCount: true,
      allowDoubleCounting: false,
      verificationStatus: 'verified',
      requirementVersion: 1,
    },
    {
      id: 'req-4',
      programmeId: 'prog-cs-master-1',
      conditionGroupId: null,
      requirementType: 'language',
      requirementDescription: 'IELTS overall score of at least 6.5 (minimum 6.0 in each section)',
      isMandatory: true,
      operator: 'gte',
      requiredValue: '6.5',
      requiredValueNumeric: 6.5,
      unit: 'ielts',
      subjectCategoryId: null,
      subjectCategoryName: null,
      minCredits: null,
      creditSystemRequired: null,
      officialEctsEquivalent: false,
      practicalCreditsCount: true,
      allowDoubleCounting: false,
      verificationStatus: 'verified',
      requirementVersion: 1,
    },
  ],
  conditionGroups: [],
};

// ============================================================================
// SUITE 1: INDIVIDUAL EVALUATOR UNIT TESTS
// ============================================================================

describe('Deterministic Eligibility Engine — Unit Tests', () => {

  describe('Degree Requirement Evaluator (evaluateDegree)', () => {
    it('passes when student has required degree keyword in qualification name', () => {
      const req = sampleCSMaster.requirements[0];
      const result = evaluateDegree(profileA_BCA, req);
      expect(result.status).toBe('PASSED');
      expect(result.explanation).toContain('Computer Applications');
    });

    it('fails when student degree does not match required computing degree', () => {
      const req = sampleCSMaster.requirements[0];
      const result = evaluateDegree(profileB_BBA, req);
      expect(result.status).toBe('FAILED');
      expect(result.explanation).toContain('Business Administration');
    });

    it('returns UNKNOWN when student degree information is missing', () => {
      const emptyProfile: StudentProfile = { ...profileD_Incomplete, educations: [] };
      const req = sampleCSMaster.requirements[0];
      const result = evaluateDegree(emptyProfile, req);
      expect(result.status).toBe('UNKNOWN');
      expect(result.explanation).toContain('No education records found');
    });
  });

  describe('Grade Requirement Evaluator (evaluateGrade)', () => {
    it('passes when student CGPA exceeds required threshold', () => {
      const req = sampleCSMaster.requirements[2]; // requires CGPA 7.0
      const result = evaluateGrade(profileA_BCA, req); // actual: 8.4
      expect(result.status).toBe('PASSED');
      expect(result.studentValue).toBe('8.4 (cgpa_10)');
    });

    it('fails when student CGPA is below mandatory minimum', () => {
      const req = sampleCSMaster.requirements[2]; // requires CGPA 7.0
      const result = evaluateGrade(profileE_LowGrade, req); // actual: 5.5
      expect(result.status).toBe('FAILED');
      expect(result.studentValue).toBe('5.5 (cgpa_10)');
      expect(result.explanation).toContain('below');
    });

    it('returns UNKNOWN when student academic results are missing', () => {
      const req = sampleCSMaster.requirements[2];
      const result = evaluateGrade(profileD_Incomplete, req);
      expect(result.status).toBe('UNKNOWN');
    });
  });

  describe('Language Requirement Evaluator (evaluateLanguage)', () => {
    it('passes when IELTS score meets required overall score', () => {
      const req = sampleCSMaster.requirements[3]; // requires 6.5
      const result = evaluateLanguage(profileA_BCA, req, new Date('2026-01-01')); // actual: 7.0
      expect(result.status).toBe('PASSED');
      expect(result.studentValue).toContain('7');
    });

    it('fails when student has not taken English test and has no certificate', () => {
      const req = sampleCSMaster.requirements[3];
      const result = evaluateLanguage(profileC_BE, req, new Date('2026-01-01'));
      expect(result.status).toBe('UNKNOWN');
      expect(result.explanation).toContain('certificate');
    });

    it('returns CONDITIONAL when student has a planned test date', () => {
      const profileWithPlannedTest: StudentProfile = {
        ...profileC_BE,
        languageCertificates: [
          {
            language: 'english',
            testType: 'ielts',
            level: null,
            overallScore: null,
            readingScore: null,
            writingScore: null,
            listeningScore: null,
            speakingScore: null,
            testDate: null,
            expiryDate: null,
            certificateAvailable: false,
            plannedTestDate: '2026-12-01',
            expectedScore: 7.0,
            moiCertificateAvailable: false,
            englishTaughtDegree: false,
          } as any,
        ],
      };
      const req = sampleCSMaster.requirements[3];
      const result = evaluateLanguage(profileWithPlannedTest, req, new Date('2026-01-01'));
      expect(result.status).toBe('CONDITIONAL');
      expect(result.explanation).toContain('Planned test');
    });

    it('marks certificate as FAILED when test certificate has expired', () => {
      const expiredProfile: StudentProfile = {
        ...profileA_BCA,
        languageCertificates: [
          {
            ...profileA_BCA.languageCertificates[0],
            expiryDate: '2024-01-01', // Expired
          },
        ],
      };
      const req = sampleCSMaster.requirements[3];
      const result = evaluateLanguage(expiredProfile, req, new Date('2026-01-01'));
      expect(result.status).toBe('FAILED');
      expect(result.explanation).toContain('expired');
    });
  });

  describe('Subject and Credit Calculation (evaluateSubjects)', () => {
    it('calculates earned credits and evaluates against threshold', () => {
      const req: ProgrammeRequirement = {
        id: 'req-math',
        programmeId: 'p1',
        conditionGroupId: null,
        requirementType: 'subject_credits',
        requirementDescription: 'Minimum 8 credits in Calculus or Mathematics',
        isMandatory: true,
        operator: 'gte',
        requiredValue: '8',
        requiredValueNumeric: 8,
        unit: 'credits',
        subjectCategoryId: null,
        subjectCategoryName: 'Mathematics',
        minCredits: 8,
        creditSystemRequired: 'indian_credits',
        officialEctsEquivalent: false,
        practicalCreditsCount: true,
        allowDoubleCounting: false,
        verificationStatus: 'verified',
        requirementVersion: 1,
      };

      const result = evaluateSubjects(profileA_BCA, req);
      expect(result.evaluation.status).toBe('PASSED');
      expect(result.evaluation.studentValue).toContain('12');
    });

    it('returns NEEDS_REVIEW when required ECTS cannot be reliably equated without verified data', () => {
      const reqECTS: ProgrammeRequirement = {
        id: 'req-ects',
        programmeId: 'p1',
        conditionGroupId: null,
        requirementType: 'subject_credits',
        requirementDescription: 'Minimum 15 ECTS in Mathematics',
        isMandatory: true,
        operator: 'gte',
        requiredValue: '15',
        requiredValueNumeric: 15,
        unit: 'ECTS',
        subjectCategoryId: 'cat-calc',
        subjectCategoryName: 'Calculus',
        minCredits: 15,
        creditSystemRequired: 'ects',
        officialEctsEquivalent: true, // Requires strict ECTS equivalence
        practicalCreditsCount: true,
        allowDoubleCounting: false,
        verificationStatus: 'verified',
        requirementVersion: 1,
      };

      const result = evaluateSubjects(profileA_BCA, reqECTS);
      // Indian credits != ECTS automatically without official equivalence
      expect(result.evaluation.status).toBe('NEEDS_REVIEW');
      expect(result.evaluation.explanation).toContain('credit equivalence requires verification');
    });

    it('prevents double counting of subjects across different requirements', () => {
      const req1: ProgrammeRequirement = {
        id: 'req-prog',
        programmeId: 'p1',
        conditionGroupId: null,
        requirementType: 'subject_credits',
        requirementDescription: 'Minimum 4 credits in Programming',
        isMandatory: true,
        operator: 'gte',
        requiredValue: '4',
        requiredValueNumeric: 4,
        unit: 'credits',
        subjectCategoryId: 'cat-prog',
        subjectCategoryName: 'Programming',
        minCredits: 4,
        creditSystemRequired: 'indian_credits',
        officialEctsEquivalent: false,
        practicalCreditsCount: true,
        allowDoubleCounting: false,
        verificationStatus: 'verified',
        requirementVersion: 1,
      };

      const usedSubjectIds = new Set<string>();
      const res1 = evaluateSubjects(profileA_BCA, req1, usedSubjectIds);
      expect(res1.evaluation.status).toBe('PASSED');
      expect(res1.usedSubjectIds.has('sub-a-2')).toBe(true);

      // Now evaluate second requirement prohibiting double-counting
      const res2 = evaluateSubjects(profileA_BCA, req1, res1.usedSubjectIds);
      // Subject sub-a-2 was consumed, so earned credits for req1 should be 0
      expect(res2.evaluation.studentValue).toContain('0');
      expect(res2.evaluation.status).toBe('FAILED');
    });
  });

  describe('Deadline Evaluator (evaluateDeadline)', () => {
    it('passes when deadline is in the future', () => {
      const req: ProgrammeRequirement = {
        id: 'req-dl',
        programmeId: 'p1',
        conditionGroupId: null,
        requirementType: 'deadline',
        requirementDescription: 'Application deadline',
        isMandatory: true,
        operator: 'gte',
        requiredValue: '2027-01-15',
        requiredValueNumeric: null,
        unit: null,
        subjectCategoryId: null,
        subjectCategoryName: null,
        minCredits: null,
        creditSystemRequired: null,
        officialEctsEquivalent: false,
        practicalCreditsCount: true,
        allowDoubleCounting: false,
        verificationStatus: 'verified',
        requirementVersion: 1,
      };

      const deadlineInfo = {
        applicationDeadline: '2027-01-15',
        internationalDeadline: '2027-01-15',
        intakeStatus: 'open',
        verificationDate: '2026-11-01',
      };

      const result = evaluateDeadline(req, deadlineInfo, new Date('2026-11-20'));
      expect(result.status).toBe('PASSED');
      expect(result.explanation).toContain('not yet passed');
    });

    it('fails when deadline has passed', () => {
      const req: ProgrammeRequirement = {
        id: 'req-dl',
        programmeId: 'p1',
        conditionGroupId: null,
        requirementType: 'deadline',
        requirementDescription: 'Application deadline',
        isMandatory: true,
        operator: 'gte',
        requiredValue: '2025-07-15',
        requiredValueNumeric: null,
        unit: null,
        subjectCategoryId: null,
        subjectCategoryName: null,
        minCredits: null,
        creditSystemRequired: null,
        officialEctsEquivalent: false,
        practicalCreditsCount: true,
        allowDoubleCounting: false,
        verificationStatus: 'verified',
        requirementVersion: 1,
      };

      const deadlineInfo = {
        applicationDeadline: '2025-07-15',
        internationalDeadline: '2025-07-15',
        intakeStatus: 'closed',
        verificationDate: '2025-01-01',
      };

      const result = evaluateDeadline(req, deadlineInfo, new Date('2026-11-20'));
      expect(result.status).toBe('FAILED');
      expect(result.explanation).toContain('closed');
    });
  });
});

// ============================================================================
// SUITE 2: FULL PROGRAMME EVALUATION & REALISTIC PROFILES
// ============================================================================

describe('Full Programme Evaluation (evaluateProgramme)', () => {

  it('Profile A (BCA Graduate): Matches CS Master with ELIGIBLE status', () => {
    const result = evaluateProgramme(profileA_BCA, sampleCSMaster, {
      referenceDate: new Date('2026-01-01'),
    });

    expect(result.overallEligibility).toBe('ELIGIBLE');
    expect(result.compatibilityScore.totalScore).toBeGreaterThanOrEqual(70);
    expect(result.requirementResults.length).toBe(4);
    expect(result.requirementResults.every((r) => r.status === 'PASSED')).toBe(true);

    const explanation = explainEvaluationResult(result);
    expect(explanation).toContain('Eligible');
  });

  it('Profile B (BBA Graduate): Evaluated as NOT_ELIGIBLE for CS Master due to degree mismatch', () => {
    const result = evaluateProgramme(profileB_BBA, sampleCSMaster, {
      referenceDate: new Date('2026-01-01'),
    });

    expect(result.overallEligibility).toBe('NOT_ELIGIBLE');
    const degreeReq = result.requirementResults.find((r) => r.requirementType === 'degree');
    expect(degreeReq?.status).toBe('FAILED');
  });

  it('Profile C (B.E. Graduate): Evaluated as NOT_ELIGIBLE due to degree mismatch (Electronics vs Computing) and missing English test', () => {
    const result = evaluateProgramme(profileC_BE, sampleCSMaster, {
      referenceDate: new Date('2026-01-01'),
    });

    expect(result.overallEligibility).toBe('NOT_ELIGIBLE');
    const degreeReq = result.requirementResults.find((r) => r.requirementType === 'degree');
    expect(degreeReq?.status).toBe('FAILED');
    const langReq = result.requirementResults.find((r) => r.requirementType === 'language');
    expect(langReq?.status).toBe('UNKNOWN');
  });

  it('Profile D (Incomplete Profile): Evaluated as NEEDS_VERIFICATION due to missing data', () => {
    const result = evaluateProgramme(profileD_Incomplete, sampleCSMaster, {
      referenceDate: new Date('2026-01-01'),
    });

    expect(result.overallEligibility).toBe('NEEDS_VERIFICATION');
    expect(result.compatibilityScore.isProvisional).toBe(true);
    expect(result.compatibilityScore.missingInformation.length).toBeGreaterThan(0);
  });

  it('Profile E (Low CGPA): Evaluated as NOT_ELIGIBLE because CGPA is below mandatory minimum', () => {
    const result = evaluateProgramme(profileE_LowGrade, sampleCSMaster, {
      referenceDate: new Date('2026-01-01'),
    });

    expect(result.overallEligibility).toBe('NOT_ELIGIBLE');
    const gradeReq = result.requirementResults.find((r) => r.requirementType === 'grade');
    expect(gradeReq?.status).toBe('FAILED');
  });

  it('Condition Groups: OR Logic allows qualification if ANY alternative is met', () => {
    const programmeWithOR: ProgrammeData = {
      id: 'prog-or-test',
      name: 'M.Sc. Data Engineering',
      universityName: 'Vienna University of Technology',
      degreeLevel: 'master',
      teachingLanguage: 'english',
      requirementVersion: 1,
      requirements: [],
      conditionGroups: [
        {
          id: 'group-or-1',
          programmeId: 'prog-or-test',
          parentGroupId: null,
          logic: 'OR',
          label: 'Accepted Degree Background',
          requirements: [
            {
              id: 'req-or-bcs',
              programmeId: 'prog-or-test',
              conditionGroupId: 'group-or-1',
              requirementType: 'degree',
              requirementDescription: 'B.Sc in Computer Science',
              isMandatory: true,
              operator: 'contains',
              requiredValue: 'Computer Science',
              requiredValueNumeric: null,
              unit: null,
              subjectCategoryId: null,
              subjectCategoryName: null,
              minCredits: null,
              creditSystemRequired: null,
              officialEctsEquivalent: false,
              practicalCreditsCount: true,
              allowDoubleCounting: false,
              verificationStatus: 'verified',
              requirementVersion: 1,
            },
            {
              id: 'req-or-bca',
              programmeId: 'prog-or-test',
              conditionGroupId: 'group-or-1',
              requirementType: 'degree',
              requirementDescription: 'Bachelor of Computer Applications',
              isMandatory: true,
              operator: 'contains',
              requiredValue: 'Computer Applications',
              requiredValueNumeric: null,
              unit: null,
              subjectCategoryId: null,
              subjectCategoryName: null,
              minCredits: null,
              creditSystemRequired: null,
              officialEctsEquivalent: false,
              practicalCreditsCount: true,
              allowDoubleCounting: false,
              verificationStatus: 'verified',
              requirementVersion: 1,
            },
          ],
          childGroups: [],
        },
      ],
    };

    const result = evaluateProgramme(profileA_BCA, programmeWithOR);
    expect(result.overallEligibility).toBe('ELIGIBLE');
  });

  it('Condition Groups: AND Logic requires ALL conditions to be met', () => {
    const programmeWithAND: ProgrammeData = {
      id: 'prog-and-test',
      name: 'M.Sc. Advanced Computing',
      universityName: 'TU Berlin',
      degreeLevel: 'master',
      teachingLanguage: 'english',
      requirementVersion: 1,
      requirements: [],
      conditionGroups: [
        {
          id: 'group-and-1',
          programmeId: 'prog-and-test',
          parentGroupId: null,
          logic: 'AND',
          label: 'Academic and Language Requirements',
          requirements: [
            sampleCSMaster.requirements[0], // Degree req
            sampleCSMaster.requirements[2], // Grade req (CGPA >= 7.0)
            sampleCSMaster.requirements[3], // Language req (IELTS >= 6.5)
          ],
          childGroups: [],
        },
      ],
    };

    const result = evaluateProgramme(profileA_BCA, programmeWithAND, {
      referenceDate: new Date('2026-01-01'),
    });
    expect(result.overallEligibility).toBe('ELIGIBLE');

    // Profile E (CGPA 5.5) should fail the AND group
    const resultE = evaluateProgramme(profileE_LowGrade, programmeWithAND, {
      referenceDate: new Date('2026-01-01'),
    });
    expect(resultE.overallEligibility).toBe('NOT_ELIGIBLE');
  });

  it('Compatibility Score: Separate from eligibility status and never claims admission probability', () => {
    const result = evaluateProgramme(profileA_BCA, sampleCSMaster, {
      referenceDate: new Date('2026-01-01'),
    });

    const score = result.compatibilityScore;
    expect(score.totalScore).toBeGreaterThanOrEqual(0);
    expect(score.totalScore).toBeLessThanOrEqual(100);
    expect(score.degreeRelevance).toBeLessThanOrEqual(20);
    expect(score.subjectMatch).toBeLessThanOrEqual(30);
    expect(score.academicPerformance).toBeLessThanOrEqual(15);
    expect(score.languageMatch).toBeLessThanOrEqual(15);
    expect(score.otherRequirements).toBeLessThanOrEqual(10);
    expect(score.supportingQualifications).toBeLessThanOrEqual(10);
  });
});
