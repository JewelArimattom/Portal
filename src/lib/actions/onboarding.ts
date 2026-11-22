"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  additionalQualificationSchema,
  academicResultsSchema,
  courseInterestsSchema,
  educationSchema,
  languageCertificateSchema,
  personalInfoSchema,
  studyPreferencesSchema,
  subjectSchema,
  type AcademicResultsInput,
  type EducationInput,
  type LanguageCertificateInput,
  type PersonalInfoInput,
  type StudyPreferencesInput,
  type SubjectInput,
} from "@/lib/validations/onboarding";

function hasCompletedQualification(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && "title" in value &&
    typeof value.title === "string" && value.title.trim().length > 0;
}

/** Read the signed-in student's saved onboarding profile for form rehydration. */
export async function getOnboardingProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { authenticated: false, profile: null };

  const [profileResult, preferencesResult, educationsResult, gradesResult, subjectsResult, languagesResult, qualificationsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("student_preferences").select("*").eq("student_id", user.id).maybeSingle(),
    supabase.from("educations").select("*").eq("student_id", user.id).order("display_order"),
    supabase.from("academic_results").select("*").eq("student_id", user.id),
    supabase.from("subjects").select("*").eq("student_id", user.id).order("semester_number"),
    supabase.from("language_certificates").select("*").eq("student_id", user.id),
    supabase.from("additional_qualifications").select("*").eq("student_id", user.id),
  ]);

  const failed = [profileResult, preferencesResult, educationsResult, gradesResult, subjectsResult, languagesResult, qualificationsResult].find((result) => result.error);
  if (failed?.error) return { authenticated: true, profile: null, error: "Your saved profile could not be loaded. Please refresh and try again." };

  const profile = profileResult.data;
  const preferences = preferencesResult.data;
  const educations = educationsResult.data ?? [];
  const grade = gradesResult.data?.[0];
  return {
    authenticated: true,
    profile: {
      personalInfo: profile ? {
        fullName: profile.full_name ?? "",
        phone: profile.phone ?? "",
        dateOfBirth: profile.date_of_birth ?? "",
        nationality: profile.nationality ?? "",
        currentCountry: profile.current_country ?? "",
        currentState: profile.current_state ?? "",
        currentCity: profile.current_city ?? "",
        passportAvailable: profile.passport_available ?? "no",
        preferredLanguage: profile.preferred_language ?? "en",
      } : null,
      preferences: preferences ? {
        intendedDegree: preferences.intended_degree ?? "master",
        preferredCountries: preferences.preferred_countries ?? [],
        preferredAcademicYear: preferences.preferred_academic_year ?? "",
        preferredIntake: preferences.preferred_intake ?? "flexible",
        institutionTypePreference: preferences.institution_type_preference ?? "both",
        programmeLanguage: preferences.programme_language ?? "both",
        willingnessToLearnGerman: preferences.willingness_to_learn_german ?? false,
        currentGermanLevel: preferences.current_german_level ?? "",
        preferredSubjectAreas: preferences.preferred_subject_areas ?? [],
        preferredCities: preferences.preferred_cities ?? [],
        maxTuitionPerSemester: preferences.max_tuition_per_semester == null ? null : Number(preferences.max_tuition_per_semester),
        annualLivingBudget: preferences.annual_living_budget == null ? null : Number(preferences.annual_living_budget),
        scholarshipRequired: preferences.scholarship_required ?? false,
        willingnessToRelocate: preferences.willingness_to_relocate ?? false,
        willingnessEntranceExam: preferences.willingness_entrance_exam ?? false,
      } : null,
      interests: preferences ? {
        preferredStudyFields: preferences.preferred_subject_areas ?? [],
        preferredSpecializations: preferences.preferred_specializations ?? [],
        careerGoal: preferences.career_goal ?? "",
        researchOrIndustry: preferences.research_or_industry ?? "undecided",
        willingnessToChangeField: preferences.willingness_to_change_field ?? false,
        preferredDuration: preferences.preferred_duration ?? "flexible",
        importanceTuition: preferences.importance_tuition ?? 3,
        importanceCity: preferences.importance_city ?? 3,
        importanceReputation: preferences.importance_reputation ?? 3,
        importanceEmployment: preferences.importance_employment ?? 3,
      } : null,
      educations: educations.map((item) => ({
        id: item.id,
        qualificationType: item.qualification_type,
        qualificationName: item.qualification_name ?? "",
        boardOrUniversity: item.board_or_university ?? "",
        institutionName: item.institution_name ?? "",
        institutionCountry: item.institution_country ?? "",
        institutionCity: item.institution_city ?? "",
        institutionType: item.institution_type ?? "public",
        streamOrSpecialization: item.stream_or_specialization ?? "",
        completionYear: item.completion_year,
        durationYears: item.duration_years == null ? null : Number(item.duration_years),
        numberOfSemesters: item.number_of_semesters,
        fullTime: item.full_time ?? true,
        creditSystem: item.credit_system ?? "other",
        totalCredits: item.total_credits == null ? null : Number(item.total_credits),
        universityRecognition: item.university_recognition ?? "",
        thesisTitle: item.thesis_title ?? "",
        internshipDetails: item.internship_details ?? "",
        mathematicsStudied: item.mathematics_studied ?? false,
        physicsStudied: item.physics_studied ?? false,
        chemistryStudied: item.chemistry_studied ?? false,
        entranceExamDetails: item.entrance_exam_details ?? "",
      })),
      academicResults: grade ? {
        educationId: grade.education_id,
        gradingSystem: grade.grading_system,
        actualScore: grade.actual_score == null ? 0 : Number(grade.actual_score),
        maximumScore: grade.maximum_score == null ? 0 : Number(grade.maximum_score),
        percentage: grade.percentage == null ? null : Number(grade.percentage),
        classOrDivision: grade.class_or_division ?? "",
        degreeStatus: grade.degree_status,
        failedSubjects: grade.failed_subjects ?? 0,
        repeatedSubjects: grade.repeated_subjects ?? 0,
        backlogs: grade.backlogs ?? 0,
        academicGapsMonths: grade.academic_gaps_months ?? 0,
        awards: grade.awards ?? "",
        distinctions: grade.distinctions ?? "",
      } : null,
      subjects: (subjectsResult.data ?? []).map((item) => ({
        id: item.id,
        educationId: item.education_id,
        semesterNumber: item.semester_number,
        subjectName: item.subject_name,
        subjectCode: item.subject_code ?? "",
        originalCredits: item.original_credits == null ? 0 : Number(item.original_credits),
        creditSystem: item.credit_system ?? "other",
        theoryCredits: item.theory_credits == null ? null : Number(item.theory_credits),
        practicalCredits: item.practical_credits == null ? null : Number(item.practical_credits),
        subjectGrade: item.subject_grade ?? "",
        subjectMarks: item.subject_marks == null ? null : Number(item.subject_marks),
        categoryName: item.description ?? "",
      })),
      languages: (languagesResult.data ?? []).map((item) => ({
        id: item.id,
        language: item.language,
        testType: item.test_type,
        level: item.level,
        overallScore: item.overall_score == null ? null : Number(item.overall_score),
        readingScore: item.reading_score == null ? null : Number(item.reading_score),
        writingScore: item.writing_score == null ? null : Number(item.writing_score),
        listeningScore: item.listening_score == null ? null : Number(item.listening_score),
        speakingScore: item.speaking_score == null ? null : Number(item.speaking_score),
        testDate: item.test_date,
        expiryDate: item.expiry_date,
        certificateAvailable: item.certificate_available,
        plannedTestDate: item.planned_test_date,
        expectedScore: item.expected_score == null ? null : Number(item.expected_score),
        moiCertificateAvailable: item.moi_certificate_available,
        englishTaughtDegree: item.english_taught_degree,
      })),
      qualifications: (qualificationsResult.data ?? []).map((item) => ({
        id: item.id,
        qualificationType: item.qualification_type,
        title: item.title,
        organization: item.organization ?? "",
        description: item.description ?? "",
        startDate: item.start_date,
        endDate: item.end_date,
        durationMonths: item.duration_months,
        url: item.url ?? "",
      })),
    },
  };
}

/** Persist the submitted profile. The form remains usable as a browser-only draft for signed-out visitors. */
export async function saveOnboardingProfile(input: {
  personalInfo: unknown;
  preferences: unknown;
  educations: unknown;
  academicResults: unknown;
  subjects: unknown;
  languages: unknown;
  qualifications: unknown;
  interests: unknown;
}) {
  const personal = personalInfoSchema.safeParse(input.personalInfo);
  const preferences = studyPreferencesSchema.safeParse(input.preferences);
  const educations = educationSchema.array().min(1).safeParse(input.educations);
  const grades = academicResultsSchema.safeParse(input.academicResults);
  const subjects = subjectSchema.array().safeParse(input.subjects);
  const languages = languageCertificateSchema.array().safeParse(input.languages);
  const qualificationInput = Array.isArray(input.qualifications)
    ? input.qualifications.filter(hasCompletedQualification)
    : input.qualifications;
  const qualifications = additionalQualificationSchema.array().safeParse(qualificationInput);
  const interests = courseInterestsSchema.safeParse(input.interests);
  if (!personal.success || !preferences.success || !educations.success || !grades.success || !subjects.success || !languages.success || !qualifications.success || !interests.success) {
    return { success: false, error: "Some profile information is invalid. Review your answers and try again." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, authenticated: false, error: "Sign in to securely save your profile across devices." };

  const profile = personal.data;
  const study = preferences.data;
  const educationRows = educations.data;
  const academic = grades.data;
  const subjectRows = subjects.data;
  const languageRows = languages.data;
  const qualificationRows = qualifications.data;
  const interestsData = interests.data;

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: profile.fullName,
    phone: profile.phone || null,
    date_of_birth: profile.dateOfBirth || null,
    nationality: profile.nationality,
    current_country: profile.currentCountry,
    current_state: profile.currentState || null,
    current_city: profile.currentCity || null,
    passport_available: profile.passportAvailable || null,
    preferred_language: profile.preferredLanguage,
    profile_completed: false,
    onboarding_step: 9,
  }, { onConflict: "id" });
  if (profileError) return { success: false, error: `Could not save personal information: ${profileError.message}` };

  const { error: preferencesError } = await supabase.from("student_preferences").upsert({
    student_id: user.id,
    intended_degree: study.intendedDegree,
    preferred_countries: study.preferredCountries,
    preferred_academic_year: study.preferredAcademicYear || null,
    preferred_intake: study.preferredIntake,
    institution_type_preference: study.institutionTypePreference,
    programme_language: study.programmeLanguage,
    willingness_to_learn_german: study.willingnessToLearnGerman,
    current_german_level: study.currentGermanLevel || null,
    preferred_subject_areas: interestsData.preferredStudyFields.length
      ? interestsData.preferredStudyFields
      : study.preferredSubjectAreas,
    preferred_cities: study.preferredCities,
    max_tuition_per_semester: study.maxTuitionPerSemester ?? null,
    annual_living_budget: study.annualLivingBudget ?? null,
    scholarship_required: study.scholarshipRequired,
    willingness_to_relocate: study.willingnessToRelocate,
    willingness_entrance_exam: study.willingnessEntranceExam,
    preferred_specializations: interestsData.preferredSpecializations,
    career_goal: interestsData.careerGoal || null,
    research_or_industry: interestsData.researchOrIndustry,
    willingness_to_change_field: interestsData.willingnessToChangeField,
    preferred_duration: interestsData.preferredDuration || null,
    importance_tuition: interestsData.importanceTuition,
    importance_city: interestsData.importanceCity,
    importance_reputation: interestsData.importanceReputation,
    importance_employment: interestsData.importanceEmployment,
  }, { onConflict: "student_id" });
  if (preferencesError) return { success: false, error: `Could not save study preferences: ${preferencesError.message}` };

  const { error: deleteEducationError } = await supabase.from("educations").delete().eq("student_id", user.id);
  if (deleteEducationError) return { success: false, error: `Could not update education records: ${deleteEducationError.message}` };

  const insertedEducations = await supabase.from("educations").insert(educationRows.map((education, index) => ({
    student_id: user.id,
    qualification_type: education.qualificationType,
    qualification_name: education.qualificationName || null,
    board_or_university: education.boardOrUniversity || null,
    institution_name: education.institutionName || null,
    institution_country: education.institutionCountry || null,
    institution_city: education.institutionCity || null,
    institution_type: education.institutionType ?? null,
    stream_or_specialization: education.streamOrSpecialization || null,
    completion_year: education.completionYear ?? null,
    duration_years: education.durationYears ?? null,
    number_of_semesters: education.numberOfSemesters ?? null,
    full_time: education.fullTime ?? true,
    credit_system: education.creditSystem || null,
    total_credits: education.totalCredits ?? null,
    university_recognition: education.universityRecognition || null,
    thesis_title: education.thesisTitle || null,
    internship_details: education.internshipDetails || null,
    mathematics_studied: education.mathematicsStudied ?? null,
    physics_studied: education.physicsStudied ?? null,
    chemistry_studied: education.chemistryStudied ?? null,
    entrance_exam_details: education.entranceExamDetails || null,
    display_order: index,
  })).map((row) => ({ ...row, id: crypto.randomUUID() })));
  if (insertedEducations.error) return { success: false, error: `Could not save education records: ${insertedEducations.error.message}` };

  const { data: savedEducations, error: readEducationError } = await supabase.from("educations").select("id, display_order").eq("student_id", user.id).order("display_order");
  if (readEducationError || !savedEducations?.length) return { success: false, error: "Education records were saved, but could not be linked to grades and subjects. Please retry." };
  const educationIds = new Map<string, string>();
  educationRows.forEach((item, index) => {
    if (savedEducations[index]?.id) educationIds.set(item.id ?? `index-${index}`, savedEducations[index].id);
  });
  const resolveEducationId = (id: string | undefined) => educationIds.get(id ?? "") ?? savedEducations[0].id;

  const { error: gradeDeleteError } = await supabase.from("academic_results").delete().eq("student_id", user.id);
  if (gradeDeleteError) return { success: false, error: `Could not update academic results: ${gradeDeleteError.message}` };
  const { error: gradeError } = await supabase.from("academic_results").insert({
    student_id: user.id,
    education_id: resolveEducationId(academic.educationId),
    grading_system: academic.gradingSystem,
    actual_score: academic.actualScore,
    maximum_score: academic.maximumScore,
    percentage: academic.percentage ?? null,
    class_or_division: academic.classOrDivision || null,
    degree_status: academic.degreeStatus,
    failed_subjects: academic.failedSubjects ?? 0,
    repeated_subjects: academic.repeatedSubjects ?? 0,
    backlogs: academic.backlogs ?? 0,
    academic_gaps_months: academic.academicGapsMonths ?? 0,
    awards: academic.awards || null,
    distinctions: academic.distinctions || null,
  });
  if (gradeError) return { success: false, error: `Could not save academic results: ${gradeError.message}` };

  const { error: subjectDeleteError } = await supabase.from("subjects").delete().eq("student_id", user.id);
  if (subjectDeleteError) return { success: false, error: `Could not update subjects: ${subjectDeleteError.message}` };
  if (subjectRows.length) {
    const { error } = await supabase.from("subjects").insert(subjectRows.map((subject) => ({
      student_id: user.id,
      education_id: resolveEducationId(subject.educationId),
      semester_number: subject.semesterNumber,
      subject_name: subject.subjectName,
      subject_code: subject.subjectCode || null,
      original_credits: subject.originalCredits,
      credit_system: subject.creditSystem ?? null,
      theory_credits: subject.theoryCredits ?? null,
      practical_credits: subject.practicalCredits ?? null,
      subject_grade: subject.subjectGrade || null,
      subject_marks: subject.subjectMarks ?? null,
      description: subject.categoryName || subject.description || null,
    })));
    if (error) return { success: false, error: `Could not save subjects: ${error.message}` };
  }

  const { error: languageDeleteError } = await supabase.from("language_certificates").delete().eq("student_id", user.id);
  if (languageDeleteError) return { success: false, error: `Could not update language certificates: ${languageDeleteError.message}` };
  if (languageRows.length) {
    const { error } = await supabase.from("language_certificates").insert(languageRows.map((item) => ({
      student_id: user.id,
      language: item.language,
      test_type: item.testType,
      level: item.level || null,
      overall_score: item.overallScore ?? null,
      reading_score: item.readingScore ?? null,
      writing_score: item.writingScore ?? null,
      listening_score: item.listeningScore ?? null,
      speaking_score: item.speakingScore ?? null,
      test_date: item.testDate || null,
      expiry_date: item.expiryDate || null,
      certificate_available: item.certificateAvailable ?? false,
      planned_test_date: item.plannedTestDate || null,
      expected_score: item.expectedScore ?? null,
      moi_certificate_available: item.moiCertificateAvailable ?? false,
      english_taught_degree: item.englishTaughtDegree ?? false,
    })));
    if (error) return { success: false, error: `Could not save language certificates: ${error.message}` };
  }

  const { error: qualificationDeleteError } = await supabase.from("additional_qualifications").delete().eq("student_id", user.id);
  if (qualificationDeleteError) return { success: false, error: `Could not update additional qualifications: ${qualificationDeleteError.message}` };
  const validQualifications = qualificationRows.filter((item) => item.title.trim());
  if (validQualifications.length) {
    const { error } = await supabase.from("additional_qualifications").insert(validQualifications.map((item) => ({
      student_id: user.id,
      qualification_type: item.qualificationType,
      title: item.title,
      organization: item.organization || null,
      description: item.description || null,
      start_date: item.startDate || null,
      end_date: item.endDate || null,
      duration_months: item.durationMonths ?? null,
      url: item.url || null,
    })));
    if (error) return { success: false, error: `Could not save additional qualifications: ${error.message}` };
  }

  const { error: completeError } = await supabase.from("profiles").update({ profile_completed: true, onboarding_step: 9 }).eq("id", user.id);
  if (completeError) return { success: false, error: `Your profile data was saved but completion status could not be updated: ${completeError.message}` };

  revalidatePath("/onboarding");
  revalidatePath("/matches");
  revalidatePath("/dashboard");
  return { success: true, authenticated: true };
}

export async function savePersonalInfo(formData: PersonalInfoInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: formData.fullName,
    phone: formData.phone,
    date_of_birth: formData.dateOfBirth,
    nationality: formData.nationality,
    current_country: formData.currentCountry,
    current_state: formData.currentState,
    current_city: formData.currentCity,
    passport_available: formData.passportAvailable,
    preferred_language: formData.preferredLanguage,
    onboarding_step: 2,
  });

  if (error) return { error: error.message };
  revalidatePath("/onboarding");
  return { success: true };
}

export async function saveStudyPreferences(formData: StudyPreferencesInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("student_preferences").upsert({
    student_id: user.id,
    intended_degree: formData.intendedDegree,
    preferred_countries: formData.preferredCountries,
    preferred_academic_year: formData.preferredAcademicYear,
    preferred_intake: formData.preferredIntake,
    institution_type_preference: formData.institutionTypePreference,
    programme_language: formData.programmeLanguage,
    willingness_to_learn_german: formData.willingnessToLearnGerman,
    current_german_level: formData.currentGermanLevel,
    preferred_subject_areas: formData.preferredSubjectAreas,
    max_tuition_per_semester: formData.maxTuitionPerSemester,
    annual_living_budget: formData.annualLivingBudget,
    scholarship_required: formData.scholarshipRequired,
    willingness_to_relocate: formData.willingnessToRelocate,
  });

  if (error) return { error: error.message };
  revalidatePath("/onboarding");
  return { success: true };
}

export async function saveEducation(educations: EducationInput[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Delete existing and insert fresh
  await supabase.from("educations").delete().eq("student_id", user.id);

  const rows = educations.map((edu, idx) => ({
    student_id: user.id,
    qualification_type: edu.qualificationType,
    qualification_name: edu.qualificationName,
    board_or_university: edu.boardOrUniversity,
    institution_name: edu.institutionName,
    institution_country: edu.institutionCountry,
    institution_city: edu.institutionCity,
    institution_type: edu.institutionType,
    stream_or_specialization: edu.streamOrSpecialization,
    completion_year: edu.completionYear,
    duration_years: edu.durationYears,
    number_of_semesters: edu.numberOfSemesters,
    full_time: edu.fullTime,
    credit_system: edu.creditSystem,
    total_credits: edu.totalCredits,
    university_recognition: edu.universityRecognition,
    thesis_title: edu.thesisTitle,
    display_order: idx,
  }));

  const { error } = await supabase.from("educations").insert(rows);
  if (error) return { error: error.message };
  return { success: true };
}

export async function saveAcademicResults(formData: AcademicResultsInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("academic_results").upsert({
    student_id: user.id,
    education_id: formData.educationId,
    grading_system: formData.gradingSystem,
    actual_score: formData.actualScore,
    maximum_score: formData.maximumScore,
    percentage: formData.percentage,
    class_or_division: formData.classOrDivision,
    degree_status: formData.degreeStatus,
    failed_subjects: formData.failedSubjects,
    backlogs: formData.backlogs,
    academic_gaps_months: formData.academicGapsMonths,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function saveSubjects(subjects: SubjectInput[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await supabase.from("subjects").delete().eq("student_id", user.id);

  const rows = subjects.map((sub) => ({
    student_id: user.id,
    education_id: sub.educationId || user.id,
    semester_number: sub.semesterNumber,
    subject_name: sub.subjectName,
    subject_code: sub.subjectCode,
    original_credits: sub.originalCredits,
    credit_system: sub.creditSystem,
    theory_credits: sub.theoryCredits,
    practical_credits: sub.practicalCredits,
    subject_grade: sub.subjectGrade,
    subject_marks: sub.subjectMarks,
    description: sub.categoryName,
  }));

  const { error } = await supabase.from("subjects").insert(rows);
  if (error) return { error: error.message };
  return { success: true };
}

export async function saveLanguageCertificates(certs: LanguageCertificateInput[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await supabase.from("language_certificates").delete().eq("student_id", user.id);

  const rows = certs.map((c) => ({
    student_id: user.id,
    language: c.language,
    test_type: c.testType,
    level: c.level,
    overall_score: c.overallScore,
    reading_score: c.readingScore,
    writing_score: c.writingScore,
    listening_score: c.listeningScore,
    speaking_score: c.speakingScore,
    test_date: c.testDate,
    expiry_date: c.expiryDate,
    certificate_available: c.certificateAvailable,
    planned_test_date: c.plannedTestDate,
    expected_score: c.expectedScore,
    moi_certificate_available: c.moiCertificateAvailable,
    english_taught_degree: c.englishTaughtDegree,
  }));

  const { error } = await supabase.from("language_certificates").insert(rows);
  if (error) return { error: error.message };
  return { success: true };
}
