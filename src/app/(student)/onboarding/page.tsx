'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getOnboardingProfile, saveOnboardingProfile } from '@/lib/actions/onboarding';
import { StepWizard, ONBOARDING_STEPS } from '@/components/forms/step-wizard';
import { StepPersonalInfo } from '@/components/onboarding/step-personal-info';
import { StepStudyPreferences } from '@/components/onboarding/step-study-preferences';
import { StepEducation } from '@/components/onboarding/step-education';
import { StepAcademicResults } from '@/components/onboarding/step-academic-results';
import { StepSubjects } from '@/components/onboarding/step-subjects';
import { StepLanguages } from '@/components/onboarding/step-languages';
import { StepQualifications } from '@/components/onboarding/step-qualifications';
import { StepInterests } from '@/components/onboarding/step-interests';
import { StepReview } from '@/components/onboarding/step-review';
import styles from './onboarding.module.css';

import type {
  PersonalInfoInput,
  StudyPreferencesInput,
  EducationInput,
  AcademicResultsInput,
  SubjectInput,
  LanguageCertificateInput,
  AdditionalQualificationInput,
  CourseInterestsInput,
} from '@/lib/validations/onboarding';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get('step');

  const [currentStep, setCurrentStep] = useState<number>(
    stepParam ? Math.min(Math.max(Number(stepParam), 1), ONBOARDING_STEPS.length) : 1
  );
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfoInput>({
    fullName: '', phone: '', dateOfBirth: '', nationality: '',
    currentCountry: '', currentState: '', currentCity: '', passportAvailable: '',
    preferredLanguage: 'en',
  });

  const [preferences, setPreferences] = useState<StudyPreferencesInput>({
    intendedDegree: '', preferredCountries: [], preferredAcademicYear: '',
    preferredIntake: 'flexible', institutionTypePreference: 'both', programmeLanguage: 'both',
    willingnessToLearnGerman: false,
    currentGermanLevel: '',
    preferredSubjectAreas: [], preferredCities: [],
    maxTuitionPerSemester: null,
    annualLivingBudget: null, scholarshipRequired: false, willingnessToRelocate: false,
    willingnessEntranceExam: false,
  });

  const [educations, setEducations] = useState<EducationInput[]>([]);

  const [academicResults, setAcademicResults] = useState<AcademicResultsInput>({
    educationId: '', gradingSystem: '',
    actualScore: undefined as unknown as number,
    maximumScore: undefined as unknown as number,
    percentage: null, classOrDivision: '', degreeStatus: 'in_progress',
    failedSubjects: 0,
    repeatedSubjects: 0,
    backlogs: 0,
    academicGapsMonths: 0,
  });

  const [subjects, setSubjects] = useState<SubjectInput[]>([]);

  const [languages, setLanguages] = useState<LanguageCertificateInput[]>([]);

  const [qualifications, setQualifications] = useState<AdditionalQualificationInput[]>([]);

  const [interests, setInterests] = useState<CourseInterestsInput>({
    preferredStudyFields: [], preferredSpecializations: [], careerGoal: '',
    researchOrIndustry: 'undecided',
    willingnessToChangeField: false,
    preferredDuration: 'flexible',
    importanceTuition: 3,
    importanceCity: 3,
    importanceReputation: 3,
    importanceEmployment: 3,
  });

  useEffect(() => {
    let cancelled = false;
    getOnboardingProfile().then((loaded) => {
      if (cancelled) return;
      setIsAuthenticated(loaded.authenticated);
      if (loaded.profile) {
        const saved = loaded.profile;
        if (saved.personalInfo) setPersonalInfo(saved.personalInfo as PersonalInfoInput);
        if (saved.preferences) setPreferences(saved.preferences as StudyPreferencesInput);
        if (saved.educations.length) setEducations(saved.educations as EducationInput[]);
        if (saved.academicResults) setAcademicResults(saved.academicResults as AcademicResultsInput);
        if (saved.subjects.length) setSubjects(saved.subjects as SubjectInput[]);
        if (saved.languages.length) setLanguages(saved.languages as LanguageCertificateInput[]);
        if (saved.qualifications.length) setQualifications(saved.qualifications as AdditionalQualificationInput[]);
        if (saved.interests) setInterests(saved.interests as CourseInterestsInput);
      } else if (loaded.error) {
        setSaveError(loaded.error);
      } else {
        try {
          const rawDraft = window.localStorage.getItem('unimatch_student_profile');
          const draft = rawDraft ? JSON.parse(rawDraft) : null;
          if (draft?.version === 2) {
            setPersonalInfo(draft.personalInfo);
            setPreferences(draft.preferences);
            setEducations(draft.educations);
            setAcademicResults(draft.academicResults);
            setSubjects(draft.subjects);
            setLanguages(draft.languages);
            setQualifications(draft.qualifications);
            setInterests(draft.interests);
          }
        } catch {
          window.localStorage.removeItem('unimatch_student_profile');
        }
      }
    }).catch(() => {
      if (!cancelled) setSaveError('Your saved profile could not be loaded. Check your connection and try again.');
    }).finally(() => {
      if (!cancelled) setIsLoadingProfile(false);
    });
    return () => { cancelled = true; };
  }, []);

  const markStepDoneAndAdvance = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    if (stepId < ONBOARDING_STEPS.length) {
      setCurrentStep(stepId + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleConfirmSubmit = async () => {
    setSaveError(null);
    setIsSaving(true);
    const studentFullProfile = {
        version: 2,
        personalInfo,
        preferences,
        educations,
        academicResults,
        subjects,
        languages,
        qualifications,
        interests,
        submittedAt: new Date().toISOString(),
      };
    try {
      const result = await saveOnboardingProfile(studentFullProfile);
      if (!result.success && result.authenticated !== false) {
        setSaveError(result.error ?? 'Your profile could not be saved. Please try again.');
        setIsSaving(false);
        return;
      }
      if (result.authenticated) {
        window.localStorage.removeItem('unimatch_student_profile');
      } else {
        // Signed-out students can still use this real, self-reported browser profile for matching.
        window.localStorage.setItem('unimatch_student_profile', JSON.stringify(studentFullProfile));
      }
      setIsSaving(false);
      router.push('/matches');
    } catch {
      setSaveError('Your profile could not be saved. Check your connection and try again.');
      setIsSaving(false);
    }
  };

  return (
    <div className={`${styles.onboardingPage} onboarding-flow space-y-6`}>
      {isLoadingProfile ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600" role="status">Loading your saved profile…</div>
      ) : <>
      {saveError && <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">{saveError}</p>}
      {!isAuthenticated && <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700">Guest profile: your answers will be used for matching on this device. <Link href="/signup" className="font-semibold text-[#173b5b] underline underline-offset-2">Create an account</Link> or <Link href="/login" className="font-semibold text-[#173b5b] underline underline-offset-2">sign in</Link> to save them to your student profile.</p>}
      <StepWizard
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepSelect={(id) => setCurrentStep(id)}
        onPrev={() => setCurrentStep(Math.max(1, currentStep - 1))}
      />

      {currentStep === 1 && (
        <StepPersonalInfo
          initialData={personalInfo}
          onSave={(data) => {
            setPersonalInfo(data);
            markStepDoneAndAdvance(1);
          }}
          isSaving={isSaving}
        />
      )}

      {currentStep === 2 && (
        <StepStudyPreferences
          initialData={preferences}
          onSave={(data) => {
            setPreferences(data);
            setInterests((current) => ({ ...current, preferredStudyFields: data.preferredSubjectAreas }));
            markStepDoneAndAdvance(2);
          }}
          isSaving={isSaving}
        />
      )}

      {currentStep === 3 && (
        <StepEducation
          initialData={educations}
          intendedDegree={preferences.intendedDegree}
          onSave={(data) => {
            setEducations(data);
            markStepDoneAndAdvance(3);
          }}
          isSaving={isSaving}
        />
      )}

      {currentStep === 4 && (
        <StepAcademicResults
          initialData={academicResults}
          onSave={(data) => {
            setAcademicResults(data);
            markStepDoneAndAdvance(4);
          }}
          isSaving={isSaving}
        />
      )}

      {currentStep === 5 && (
        <StepSubjects
          initialData={subjects}
          onSave={(data) => {
            setSubjects(data);
            markStepDoneAndAdvance(5);
          }}
          isSaving={isSaving}
        />
      )}

      {currentStep === 6 && (
        <StepLanguages
          initialData={languages}
          onSave={(data) => {
            setLanguages(data);
            markStepDoneAndAdvance(6);
          }}
          isSaving={isSaving}
        />
      )}

      {currentStep === 7 && (
        <StepQualifications
          initialData={qualifications}
          onSave={(data) => {
            setQualifications(data);
            markStepDoneAndAdvance(7);
          }}
          isSaving={isSaving}
        />
      )}

      {currentStep === 8 && (
        <StepInterests
          initialData={interests}
          onSave={(data) => {
            setInterests(data);
            markStepDoneAndAdvance(8);
          }}
          isSaving={isSaving}
        />
      )}

      {currentStep === 9 && (
        <StepReview
          personalInfo={personalInfo}
          preferences={preferences}
          educations={educations}
          academicResults={academicResults}
          subjects={subjects}
          languages={languages}
          onConfirmSubmit={handleConfirmSubmit}
          onJumpToStep={(id) => setCurrentStep(id)}
          isSubmitting={isSaving}
        />
      )}
      </>}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-slate-500">Loading onboarding wizard...</div>}>
      <OnboardingContent />
    </React.Suspense>
  );
}
