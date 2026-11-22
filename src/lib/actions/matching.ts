"use server";

import { evaluateProgramme, type ProgrammeEvaluationResult, type StudentProfile, type ProgrammeData } from "@/lib/eligibility";
import { createClient } from "@/lib/supabase/server";
import type { ProgrammeSource } from '@/types/database';

interface MatchingIntakeRow {
  intake_name: string;
  academic_year: string | null;
  application_deadline: string | null;
  international_deadline: string | null;
  status: string | null;
}

interface MatchingRequirementRow {
  id: string;
  requirement_type: string;
  requirement_description: string | null;
  is_mandatory: boolean | null;
  operator: string | null;
  required_value: string | null;
  required_value_numeric: number | string | null;
  unit: string | null;
  verification_status: string | null;
}

interface MatchingProgrammeRow {
  id: string;
  name: string;
  degree_level: string;
  subject_area: string | null;
  specialization: string | null;
  description: string | null;
  teaching_language: string | null;
  tuition_fee_per_semester: number | string | null;
  semester_contribution: number | string | null;
  official_programme_url: string | null;
  official_application_url: string | null;
  application_method: string | null;
  last_verified_at: string | null;
  requirements_data_status: ProgrammeData['requirementsDataStatus'];
  admission_selectivity: ProgrammeData['admissionSelectivity'];
  universities: { name: string | null; country: string | null; city: string | null };
  programme_intakes: MatchingIntakeRow[] | null;
  programme_requirements: MatchingRequirementRow[] | null;
  programme_sources: ProgrammeSource[] | null;
}

interface MatchingProgramme {
  id: string;
  universityName: string;
  universityCountry: string;
  city: string;
  name: string;
  degreeLevel: string;
  subjectArea: string;
  specialization: string;
  description: string;
  teachingLanguage: string;
  tuitionFeePerSemester: number | null;
  semesterContribution: number;
  officialProgrammeUrl: string;
  officialApplicationUrl: string;
  applicationMethod: string;
  lastVerifiedAt: string | null;
  requirementsDataStatus: ProgrammeData['requirementsDataStatus'];
  admissionSelectivity: ProgrammeData['admissionSelectivity'];
  isDemo?: boolean;
  intakes: Array<{ name: string; academicYear: string | null; deadline: string; internationalDeadline: string; status: string }>;
  requirements: Array<{
    id: string;
    type: string;
    description: string;
    isMandatory: boolean;
    operator: string;
    requiredValue: string;
    requiredValueNumeric?: number;
    unit?: string;
    subjectCategoryName?: string | null;
    minCredits?: number | null;
    creditSystemRequired?: string | null;
    officialEctsEquivalent?: boolean;
    verificationStatus: string;
    sourceUrl: string;
    sourceTitle: string;
  }>;
}

export type ProgrammeMatchingDataStatus = 'ready' | 'profile_missing' | 'no_programmes' | 'unavailable';

export interface ProgrammeMatchSummary {
  programmeId: string;
  programmeName: string;
  universityName: string;
  universityCountry: string;
  city: string;
  overallEligibility: ProgrammeEvaluationResult['overallEligibility'];
  compatibilityScore: number;
  requirementCount: number;
}

export interface ProgrammeMatchingResult {
  results: Array<ProgrammeEvaluationResult & {
    universityCountry: string;
    city: string;
    tuitionFeePerSemester: number | null;
    semesterContribution: number;
    teachingLanguage: string;
    applicationMethod: string;
    deadline: string;
    officialProgrammeUrl: string;
    officialApplicationUrl: string;
    intakeStatus: string;
  }>;
  totalEvaluated: number;
  eligibleCount: number;
  conditionalCount: number;
  verificationCount: number;
  notEligibleCount: number;
  summaryResults: ProgrammeMatchSummary[];
  dataStatus: ProgrammeMatchingDataStatus;
  dataMessage?: string;
}

function emptyMatchingResult(dataStatus: ProgrammeMatchingDataStatus, dataMessage?: string): ProgrammeMatchingResult {
  return {
    results: [],
    totalEvaluated: 0,
    eligibleCount: 0,
    conditionalCount: 0,
    verificationCount: 0,
    notEligibleCount: 0,
    summaryResults: [],
    dataStatus,
    dataMessage,
  };
}

export async function runProgrammeMatching(customStudentProfile?: StudentProfile, programmeIds?: string[]): Promise<ProgrammeMatchingResult> {
  let studentProfile: StudentProfile | null = customStudentProfile ?? null;
  let profileReadFailed = false;

  if (!studentProfile || studentProfile.id === 'local-student-profile') {
    const browserProfile = studentProfile;
    studentProfile = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const [
          { data: educations, error: educationError },
          { data: results, error: resultsError },
          { data: subjects, error: subjectsError },
          { data: certs, error: certificatesError },
          { data: prefs, error: preferencesError },
          { data: qualifications, error: qualificationsError },
        ] = await Promise.all([
          supabase.from("educations").select("*").eq("student_id", user.id),
          supabase.from("academic_results").select("*").eq("student_id", user.id),
          supabase.from("subjects").select("*").eq("student_id", user.id),
          supabase.from("language_certificates").select("*").eq("student_id", user.id),
          supabase.from("student_preferences").select("*").eq("student_id", user.id).single(),
          supabase.from("additional_qualifications").select("*").eq("student_id", user.id),
        ]);

        if ([educationError, resultsError, subjectsError, certificatesError, preferencesError, qualificationsError].some(Boolean)) {
          throw new Error('The saved student profile could not be read.');
        }

        if (educations && educations.length > 0) {
          studentProfile = {
            id: user.id,
            educations: educations.map((e) => ({
              id: e.id,
              qualificationType: e.qualification_type,
              qualificationName: e.qualification_name,
              boardOrUniversity: e.board_or_university,
              institutionName: e.institution_name,
              institutionCountry: e.institution_country,
              institutionType: e.institution_type,
              streamOrSpecialization: e.stream_or_specialization,
              completionYear: e.completion_year,
              durationYears: e.duration_years,
              numberOfSemesters: e.number_of_semesters,
              fullTime: e.full_time ?? true,
              creditSystem: e.credit_system,
              totalCredits: e.total_credits,
              universityRecognition: e.university_recognition,
              thesisTitle: e.thesis_title,
            })),
            academicResults: (results || []).map((r) => ({
              educationId: r.education_id,
              gradingSystem: r.grading_system,
              actualScore: r.actual_score == null ? null : Number(r.actual_score),
              maximumScore: r.maximum_score == null ? null : Number(r.maximum_score),
              percentage: r.percentage == null ? null : Number(r.percentage),
              classOrDivision: r.class_or_division,
              degreeStatus: r.degree_status,
              failedSubjects: r.failed_subjects || 0,
              backlogs: r.backlogs || 0,
            })),
            subjects: (subjects || []).map((s) => ({
              id: s.id,
              educationId: s.education_id,
              semesterNumber: s.semester_number,
              subjectName: s.subject_name,
              originalCredits: s.original_credits == null ? null : Number(s.original_credits),
              creditSystem: s.credit_system,
              theoryCredits: s.theory_credits == null ? null : Number(s.theory_credits),
              practicalCredits: s.practical_credits == null ? null : Number(s.practical_credits),
              subjectGrade: s.subject_grade,
              subjectMarks: s.subject_marks ? Number(s.subject_marks) : null,
            })),
            subjectMappings: (subjects || []).map((s) => ({
              subjectId: s.id,
              categoryId: s.description || 'Unclassified',
              categoryName: s.description || 'Unclassified',
            })),
            languageCertificates: (certs || []).map((c) => ({
              language: c.language,
              testType: c.test_type,
              level: c.level,
              overallScore: c.overall_score == null ? null : Number(c.overall_score),
              readingScore: c.reading_score == null ? null : Number(c.reading_score),
              writingScore: c.writing_score == null ? null : Number(c.writing_score),
              listeningScore: c.listening_score == null ? null : Number(c.listening_score),
              speakingScore: c.speaking_score == null ? null : Number(c.speaking_score),
              testDate: c.test_date,
              expiryDate: c.expiry_date,
              certificateAvailable: c.certificate_available ?? false,
              moiCertificateAvailable: c.moi_certificate_available ?? false,
              englishTaughtDegree: c.english_taught_degree ?? false,
            })),
            additionalQualifications: (qualifications || []).map((item) => ({
              qualificationType: item.qualification_type,
              title: item.title,
              organization: item.organization,
              description: item.description,
              durationMonths: item.duration_months,
              startDate: item.start_date,
              endDate: item.end_date,
              url: item.url,
            })),
            preferences: {
              intendedDegree: prefs?.intended_degree || null,
              preferredCountries: prefs?.preferred_countries || [],
              programmLanguage: prefs?.programme_language || null,
            },
            documents: [],
          };
        }
      } else {
        // Anonymous visitors can evaluate the profile they just entered in this browser.
        studentProfile = browserProfile;
      }
    } catch {
      profileReadFailed = true;
    }
  }

  if (profileReadFailed) {
    return emptyMatchingResult('unavailable', 'We could not load your saved academic profile. Please try again.');
  }

  if (!studentProfile || studentProfile.educations.length === 0) {
    return emptyMatchingResult('profile_missing', 'Add your academic background before viewing eligibility matches.');
  }
  let programmesToEvaluate: MatchingProgramme[];
  try {
    const supabase = await createClient();
    const selectedProgrammeFields = 'id, university_id, name, degree_level, subject_area, specialization, description, teaching_language, tuition_fee_per_semester, semester_contribution, official_programme_url, official_application_url, application_method, last_verified_at, requirements_data_status, admission_selectivity, universities!inner(name, country, city, is_demo), programme_intakes(intake_name, academic_year, application_deadline, international_deadline, status), programme_requirements(id, requirement_type, requirement_description, is_mandatory, operator, required_value, required_value_numeric, unit, verification_status), programme_sources(requirement_id, programme_id, url, source_title)';
    let dbProgrammes: MatchingProgrammeRow[] = [];

    if (programmeIds?.length) {
      const { data, error } = await supabase.from('programmes').select(selectedProgrammeFields).eq('status', 'published').eq('is_demo', false).eq('universities.is_demo', false).in('id', programmeIds);
      if (error) return emptyMatchingResult('unavailable', 'Published programme data could not be loaded. Please try again shortly.');
      dbProgrammes = (data ?? []) as unknown as MatchingProgrammeRow[];
    } else {
      const pageSize = 100;
      for (let offset = 0; ; offset += pageSize) {
        const { data, error } = await supabase
          .from('programmes')
          .select(selectedProgrammeFields)
          .eq('status', 'published')
          .eq('is_demo', false)
          .eq('universities.is_demo', false)
          .range(offset, offset + pageSize - 1);
        if (error) return emptyMatchingResult('unavailable', 'Published programme data could not be loaded. Please try again shortly.');
        dbProgrammes.push(...((data ?? []) as unknown as MatchingProgrammeRow[]));
        if (!data || data.length < pageSize) break;
      }
    }

    if (!dbProgrammes?.length) {
      return emptyMatchingResult('no_programmes', 'There are no published programmes available to compare yet.');
    }

    programmesToEvaluate = dbProgrammes.map((p) => ({
      id: p.id,
      universityName: p.universities?.name ?? 'University name unavailable',
      universityCountry: p.universities?.country ?? 'Country not listed',
      city: p.universities?.city ?? 'City not listed',
      name: p.name,
      degreeLevel: p.degree_level,
      subjectArea: p.subject_area ?? '',
      specialization: p.specialization ?? '',
      description: p.description ?? '',
      teachingLanguage: p.teaching_language ?? 'not_listed',
      tuitionFeePerSemester: p.tuition_fee_per_semester == null ? null : Number(p.tuition_fee_per_semester),
      semesterContribution: p.semester_contribution == null ? 0 : Number(p.semester_contribution),
      officialProgrammeUrl: p.official_programme_url ?? '',
      officialApplicationUrl: p.official_application_url ?? '',
      applicationMethod: p.application_method ?? '',
      lastVerifiedAt: p.last_verified_at ?? null,
      requirementsDataStatus: p.requirements_data_status ?? 'unknown',
      admissionSelectivity: p.admission_selectivity ?? 'unknown',
      intakes: (p.programme_intakes ?? []).map((intake) => ({
        name: intake.intake_name,
        academicYear: intake.academic_year,
        deadline: intake.application_deadline ?? '',
        internationalDeadline: intake.international_deadline ?? '',
        status: intake.status ?? 'unknown',
      })),
      requirements: (p.programme_requirements ?? []).map((requirement) => {
        const source = p.programme_sources?.find((item: ProgrammeSource) => item.requirement_id === requirement.id)
          ?? p.programme_sources?.find((item: ProgrammeSource) => item.programme_id === p.id);
        return {
          id: requirement.id,
          type: requirement.requirement_type,
          description: requirement.requirement_description ?? '',
          isMandatory: requirement.is_mandatory ?? true,
          operator: requirement.operator ?? 'gte',
          requiredValue: requirement.required_value ?? '',
          requiredValueNumeric: requirement.required_value_numeric == null ? undefined : Number(requirement.required_value_numeric),
          unit: requirement.unit ?? undefined,
          verificationStatus: requirement.verification_status ?? 'draft',
          sourceUrl: source?.url ?? p.official_programme_url ?? '',
          sourceTitle: source?.source_title ?? '',
        };
      }),
    }));
  } catch {
    return emptyMatchingResult('unavailable', 'Published programme data could not be loaded. Please try again shortly.');
  }
  // Iterate over programmes and evaluate each
  const evaluatedResults = programmesToEvaluate.map((prog) => {
    const programmeData: ProgrammeData = {
      id: prog.id,
      name: prog.name,
      universityName: prog.universityName,
      degreeLevel: prog.degreeLevel,
      teachingLanguage: prog.teachingLanguage,
      requirementVersion: 1,
      requirementsDataStatus: prog.requirementsDataStatus ?? 'unknown',
      admissionSelectivity: prog.admissionSelectivity ?? 'unknown',
      requirements: prog.requirements.map((r) => ({
        id: r.id,
        programmeId: prog.id,
        conditionGroupId: null,
        requirementType: r.type,
        requirementDescription: r.description,
        isMandatory: r.isMandatory,
        operator: r.operator,
        requiredValue: r.requiredValue,
        requiredValueNumeric: r.requiredValueNumeric ?? null,
        unit: r.unit ?? null,
        subjectCategoryId: null,
        subjectCategoryName: r.subjectCategoryName ?? null,
        minCredits: r.minCredits ?? null,
        creditSystemRequired: r.creditSystemRequired ?? null,
        officialEctsEquivalent: r.officialEctsEquivalent ?? false,
        practicalCreditsCount: true,
        allowDoubleCounting: false,
        verificationStatus: r.verificationStatus ?? (prog.isDemo ? 'verified' : 'draft'),
        requirementVersion: 1,
      })),
      conditionGroups: [],
    };

    const activeIntake = prog.intakes.find((i) => i.status === 'open') ?? prog.intakes[0] ?? {
      deadline: '',
      internationalDeadline: '',
      status: 'unknown',
    };

    const evaluation = evaluateProgramme(studentProfile, programmeData, {
      referenceDate: new Date(),
      deadlineInfo: {
        applicationDeadline: activeIntake.deadline,
        internationalDeadline: activeIntake.internationalDeadline,
        intakeStatus: activeIntake.status,
        verificationDate: prog.lastVerifiedAt,
      },
    });

    return {
      ...evaluation,
      universityCountry: prog.universityCountry,
      city: prog.city,
      tuitionFeePerSemester: prog.tuitionFeePerSemester,
      semesterContribution: prog.semesterContribution,
      teachingLanguage: prog.teachingLanguage,
      applicationMethod: prog.applicationMethod,
      deadline: activeIntake.internationalDeadline,
      officialProgrammeUrl: prog.officialProgrammeUrl,
      officialApplicationUrl: prog.officialApplicationUrl,
      intakeStatus: activeIntake.status,
    };
  });

  // Sort results: ELIGIBLE first, then CONDITIONALLY_ELIGIBLE, then NEEDS_VERIFICATION, then by compatibility score descending
  const statusRank: Record<string, number> = {
    ELIGIBLE: 1,
    CONDITIONALLY_ELIGIBLE: 2,
    NEEDS_VERIFICATION: 3,
    NOT_ELIGIBLE: 4,
    NOT_EVALUATED: 5,
  };

  evaluatedResults.sort((a, b) => {
    const rankDiff = (statusRank[a.overallEligibility] ?? 9) - (statusRank[b.overallEligibility] ?? 9);
    if (rankDiff !== 0) return rankDiff;
    return (b.compatibilityScore?.totalScore ?? 0) - (a.compatibilityScore?.totalScore ?? 0);
  });

  if (programmeIds?.length) {
    const displayOrder = new Map(programmeIds.map((id, index) => [id, index]));
    evaluatedResults.sort((a, b) => (displayOrder.get(a.programmeId) ?? Number.MAX_SAFE_INTEGER) - (displayOrder.get(b.programmeId) ?? Number.MAX_SAFE_INTEGER));
  }

  const summaryResults: ProgrammeMatchSummary[] = programmeIds?.length ? [] : evaluatedResults.map((result) => ({
    programmeId: result.programmeId,
    programmeName: result.programmeName,
    universityName: result.universityName,
    universityCountry: result.universityCountry,
    city: result.city,
    overallEligibility: result.overallEligibility,
    compatibilityScore: result.compatibilityScore.totalScore,
    requirementCount: result.requirementResults.length,
  }));

  const eligibleCount = evaluatedResults.filter((r) => r.overallEligibility === 'ELIGIBLE').length;
  const conditionalCount = evaluatedResults.filter((r) => r.overallEligibility === 'CONDITIONALLY_ELIGIBLE').length;
  const verificationCount = evaluatedResults.filter((r) => r.overallEligibility === 'NEEDS_VERIFICATION').length;
  const notEligibleCount = evaluatedResults.filter((r) => r.overallEligibility === 'NOT_ELIGIBLE').length;

  return {
    results: programmeIds?.length ? evaluatedResults : evaluatedResults.slice(0, 10),
    totalEvaluated: programmeIds?.length ? 0 : evaluatedResults.length,
    eligibleCount,
    conditionalCount,
    verificationCount,
    notEligibleCount,
    summaryResults,
    dataStatus: 'ready',
  };
}
