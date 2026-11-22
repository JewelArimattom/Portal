import Link from 'next/link';
import { notFound } from 'next/navigation';
import { StatusBadge } from '@/components/shared/status-badge';
import { RequirementRow } from '@/components/shared/requirement-row';
import { CompatibilityScore } from '@/components/shared/compatibility-score';
import { DEMO_PROGRAMMES, type DemoProgramme } from '@/lib/seed/demo-data';
import { evaluateProgramme, type StudentProfile, type ProgrammeData } from '@/lib/eligibility';
import { createClient } from '@/lib/supabase/server';
import { getOnboardingProfile } from '@/lib/actions/onboarding';
import type { ProgrammeSource } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface ProgrammeDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

type ProgrammeDetail = Omit<DemoProgramme, 'isDemo' | 'degreeLevel' | 'teachingLanguage'> & {
  isDemo: boolean;
  degreeLevel: string;
  teachingLanguage: string;
};

interface ProgrammeIntakeRow {
  intake_name: string;
  academic_year: string;
  application_deadline: string | null;
  international_deadline: string | null;
  status: 'open' | 'closed' | 'upcoming';
}

interface ProgrammeRequirementRow {
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

interface ProgrammeRow {
  id: string;
  university_id: string;
  name: string;
  degree_level: string;
  subject_area: string | null;
  specialization: string | null;
  description: string | null;
  teaching_language: string;
  duration_semesters: number | null;
  tuition_fee_per_semester: number | string | null;
  tuition_fee_status: 'known' | 'unknown' | 'not_applicable' | null;
  semester_contribution: number | string | null;
  application_fee: number | string | null;
  estimated_living_cost_monthly: number | string | null;
  official_programme_url: string | null;
  official_application_url: string | null;
  application_method: 'uni_assist' | 'direct' | 'other' | null;
  last_verified_at: string | null;
  requirements_data_status: 'unknown' | 'partial' | 'complete' | null;
  admission_selectivity: 'unknown' | 'open' | 'restricted' | 'special_requirements' | null;
  universities: { name: string | null } | null;
  programme_intakes: ProgrammeIntakeRow[] | null;
  programme_requirements: ProgrammeRequirementRow[] | null;
  programme_sources: ProgrammeSource[] | null;
}

export default async function ProgrammeDetailPage({ params }: ProgrammeDetailPageProps) {
  const { id } = await params;
  let programme: ProgrammeDetail | undefined = DEMO_PROGRAMMES.find((p) => p.id === id);

  if (!programme) {
    try {
      const supabase = await createClient();
      const { data: rawProgramme } = await supabase
        .from('programmes')
        .select('*, universities(*), programme_intakes(*), programme_requirements(*), programme_sources(*)')
        .eq('id', id)
        .single();

      if (rawProgramme) {
        const dbProg = rawProgramme as unknown as ProgrammeRow;
        programme = {
          id: dbProg.id,
          universityId: dbProg.university_id,
          universityName: dbProg.universities?.name ?? 'University',
          name: dbProg.name,
          degreeLevel: dbProg.degree_level,
          subjectArea: dbProg.subject_area ?? 'Computer Science',
          specialization: dbProg.specialization ?? '',
          description: dbProg.description ?? '',
          teachingLanguage: dbProg.teaching_language,
          durationSemesters: dbProg.duration_semesters ?? 4,
          tuitionFeePerSemester: dbProg.tuition_fee_per_semester == null ? null : Number(dbProg.tuition_fee_per_semester),
          tuitionFeeStatus: dbProg.tuition_fee_status ?? undefined,
          semesterContribution: dbProg.semester_contribution == null ? 150 : Number(dbProg.semester_contribution),
          applicationFee: dbProg.application_fee == null ? 0 : Number(dbProg.application_fee),
          estimatedLivingCostMonthly: dbProg.estimated_living_cost_monthly == null ? 900 : Number(dbProg.estimated_living_cost_monthly),
          officialProgrammeUrl: dbProg.official_programme_url ?? 'https://www.daad.de',
          officialApplicationUrl: dbProg.official_application_url ?? 'https://www.uni-assist.de',
          applicationMethod: dbProg.application_method ?? 'direct',
          lastVerifiedAt: dbProg.last_verified_at ?? '2026-10-15',
          requirementsDataStatus: dbProg.requirements_data_status ?? 'unknown',
          admissionSelectivity: dbProg.admission_selectivity ?? 'unknown',
          isDemo: false,
          intakes: dbProg.programme_intakes && dbProg.programme_intakes.length > 0
            ? dbProg.programme_intakes.map((i) => ({
                name: i.intake_name,
                academicYear: i.academic_year,
                deadline: i.application_deadline ?? '',
                internationalDeadline: i.international_deadline ?? '',
                status: i.status ?? 'open',
              }))
            : [],
          requirements: dbProg.programme_requirements && dbProg.programme_requirements.length > 0
            ? dbProg.programme_requirements.map((r) => {
                const source = dbProg.programme_sources?.find((s: ProgrammeSource) => s.requirement_id === r.id)
                  ?? dbProg.programme_sources?.find((s: ProgrammeSource) => s.programme_id === dbProg.id);
                return {
                id: r.id,
                type: r.requirement_type,
                description: r.requirement_description ?? '',
                isMandatory: r.is_mandatory ?? true,
                operator: r.operator ?? 'gte',
                requiredValue: r.required_value ?? '',
                requiredValueNumeric: r.required_value_numeric ? Number(r.required_value_numeric) : undefined,
                unit: r.unit ?? undefined,
                sourceUrl: source?.url ?? dbProg.official_programme_url ?? 'https://www.daad.de',
                sourceTitle: source?.source_title ?? 'Official programme source',
                verificationStatus: r.verification_status ?? 'draft',
                };
              })
            : [],
        };
      }
    } catch {
      // fallback
    }
  }

  if (!programme) {
    notFound();
  }

  const isAustrian = programme.universityName.includes('Vienna') || programme.universityName.includes('Graz');
  const country = isAustrian ? 'Austria' : 'Germany';
  const activeIntake = programme.intakes.find((i) => i.status === 'open') ?? programme.intakes[0];
  const verifiedDate = programme.lastVerifiedAt
    ? new Date(programme.lastVerifiedAt)
    : null;
  const verifiedDateLabel = verifiedDate && !Number.isNaN(verifiedDate.getTime())
    ? new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(verifiedDate)
    : null;

  const onboardingData = await getOnboardingProfile();
  const saved = onboardingData.profile;
  const educationIds = new Set<string>(saved?.educations.map((education) => education.id) ?? []);
  const studentProfile: StudentProfile | null = saved?.educations?.length ? {
    id: 'saved-student-profile',
    educations: saved.educations,
    academicResults: saved.academicResults ? [{ ...saved.academicResults, educationId: educationIds.has(saved.academicResults.educationId) ? saved.academicResults.educationId : saved.educations[0].id }] : [],
    subjects: saved.subjects.map((subject, index) => ({
      ...subject,
      id: subject.id || `subject-${index + 1}`,
      educationId: educationIds.has(subject.educationId) ? subject.educationId : saved.educations[0].id,
    })),
    subjectMappings: saved.subjects.map((subject, index) => ({
      subjectId: subject.id || `subject-${index + 1}`,
      categoryId: subject.categoryName || 'Unclassified',
      categoryName: subject.categoryName || 'Unclassified',
    })),
    languageCertificates: saved.languages,
    additionalQualifications: saved.qualifications.map((item) => ({
      qualificationType: item.qualificationType,
      title: item.title,
      durationMonths: item.durationMonths,
    })),
    preferences: {
      intendedDegree: saved.preferences?.intendedDegree || null,
      preferredCountries: saved.preferences?.preferredCountries ?? [],
      programmLanguage: saved.preferences?.programmeLanguage || null,
    },
    documents: [],
  } : null;

  const programmeData: ProgrammeData = {
    id: programme.id,
    name: programme.name,
    universityName: programme.universityName,
    degreeLevel: programme.degreeLevel,
    teachingLanguage: programme.teachingLanguage,
    requirementVersion: 1,
    requirementsDataStatus: programme.requirementsDataStatus ?? 'unknown',
    admissionSelectivity: programme.admissionSelectivity ?? 'unknown',
    requirements: programme.requirements.map((r) => ({
      id: r.id,
      programmeId: programme.id,
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
      verificationStatus: r.verificationStatus ?? (programme.isDemo ? 'verified' : 'draft'),
      requirementVersion: 1,
    })),
    conditionGroups: [],
  };

  const evaluation = studentProfile ? evaluateProgramme(studentProfile, programmeData, {
    referenceDate: new Date(),
    deadlineInfo: {
      applicationDeadline: activeIntake?.deadline ?? '',
      internationalDeadline: activeIntake?.internationalDeadline ?? '',
      intakeStatus: activeIntake?.status ?? null,
      verificationDate: programme.lastVerifiedAt,
    },
  }) : null;

  return (
    <div className="space-y-7 sm:space-y-8">
      <header className="mb-2 border-b border-slate-200 pb-6 pt-1 sm:pb-7">
        <nav aria-label="Breadcrumb" className="mb-4 flex min-w-0 items-center gap-2 overflow-hidden text-xs text-slate-600">
          <Link href="/dashboard" className="shrink-0 hover:text-[#142f4b]">Dashboard</Link>
          <span aria-hidden="true">/</span>
          <Link href="/programmes" className="shrink-0 hover:text-[#142f4b]">Programmes</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="truncate font-medium text-slate-900">{programme.name}</span>
        </nav>

        <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-col items-start gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              <h1 className="max-w-4xl break-words text-[1.75rem] font-semibold leading-[1.12] tracking-[-.03em] text-[#142f4b] sm:text-3xl lg:text-4xl">
                {programme.name}
              </h1>
              <StatusBadge status={evaluation?.overallEligibility ?? 'NOT_EVALUATED'} size="md" />
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              {programme.universityName} <span aria-hidden="true" className="px-1">·</span> {country}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 border-t border-slate-200 pt-4 text-sm sm:grid-cols-4">
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-500">Degree</dt>
                <dd className="mt-0.5 break-words font-semibold capitalize text-slate-900">{programme.degreeLevel}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-500">Subject</dt>
                <dd className="mt-0.5 break-words font-semibold text-slate-900">{programme.subjectArea}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-500">Duration</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">{programme.durationSemesters} semesters</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-500">Teaching language</dt>
                <dd className="mt-0.5 break-words font-semibold capitalize text-slate-900">{programme.teachingLanguage}</dd>
              </div>
            </dl>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:shrink-0">
            <Link href={`/compare?p1=${programme.id}`} className="flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-center text-sm font-medium text-[#142f4b] transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#142f4b]">
              Compare programme
            </Link>
            <a href={programme.officialApplicationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#142f4b] px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-[#10283f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#142f4b]">
              Official application <ExternalLink aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
      </header>

      {/* Programme Metadata Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Tuition Fees</div>
          <div className="mt-1 text-base font-bold text-slate-900">
            {programme.tuitionFeeStatus === 'unknown' ? 'Tuition not listed' : programme.tuitionFeePerSemester === null ? 'Tuition-Free' : `€${programme.tuitionFeePerSemester} / semester`}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            + €{programme.semesterContribution} semester contribution
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Application Method</div>
          <div className="mt-1 text-base font-bold text-slate-900 uppercase">
            {programme.applicationMethod.replace('_', ' ')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Fee: €{programme.applicationFee}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Application Deadline</div>
          <div className="mt-1 text-base font-bold text-slate-900">
            {activeIntake?.internationalDeadline || 'Not listed'}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5 capitalize">
            {activeIntake ? `Intake: ${activeIntake.status}` : 'Intake not listed'}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Living Expenses Est.</div>
          <div className="mt-1 text-base font-bold text-slate-900">
            ~€{programme.estimatedLivingCostMonthly} / month
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Blocked account: €934/mo
          </div>
        </div>
      </div>

      {/* Description & Official Links */}
      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-[-.015em] text-[#142f4b]">
            About this programme
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            {programme.description || 'A programme description has not been added yet. Visit the official programme page for current details.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs border-t">
            <a
              href={programme.officialProgrammeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:underline flex items-center gap-1 font-semibold"
            >
              Official programme details <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            </a>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">
              Last verified: <strong>{verifiedDateLabel ?? 'Date unavailable'}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Deterministic Evaluation Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-[-.02em] text-[#142f4b] sm:text-2xl">How your profile compares</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">Review how your academic information compares with the programme requirements currently on file.</p>
          </div>
        </div>

        {evaluation ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm font-bold text-slate-900">Compatibility Index</CardTitle></CardHeader>
                <CardContent><CompatibilityScore score={evaluation.compatibilityScore} showBreakdown={true} /></CardContent>
              </Card>
            </div>
            <div className="space-y-3 lg:col-span-2">
              {evaluation.requirementResults.map((req) => {
                const matchedReq = programme.requirements.find((r) => r.id === req.requirementId);
                return <RequirementRow key={req.requirementId} evaluation={req} sourceUrl={matchedReq?.sourceUrl} sourceTitle={matchedReq?.sourceTitle} />;
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <p className="text-sm leading-6 text-slate-700">Add your academic profile to compare your own education and results with this programme. No sample student data is used.</p>
            <Link href="/onboarding" className="mt-3 inline-flex min-h-11 items-center rounded-md bg-[#142f4b] px-4 text-sm font-semibold text-white hover:bg-[#10283f]">Add academic profile</Link>
          </div>
        )}
      </div>

      {/* Mandatory Platform Disclaimer */}
      <div className="rounded-xl bg-slate-100 border p-5 text-xs text-slate-600 leading-relaxed space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <ShieldAlert className="h-4 w-4 text-blue-700" />
          <span>Platform Assessment Disclaimer</span>
        </div>
        <p>
          This assessment is based strictly on the information provided by the student and the published programme requirements stored in this platform. It is not an admission decision or a guarantee of eligibility. The university makes the final admission decision.
        </p>
      </div>
    </div>
  );
}
