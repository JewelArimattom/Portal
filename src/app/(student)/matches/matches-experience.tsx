'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowUpRight, BookOpen, Check, ChevronDown, ExternalLink, LoaderCircle, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import type { ProgrammeMatchingResult } from '@/lib/actions/matching';
import { runProgrammeMatching } from '@/lib/actions/matching';
import type { StudentProfile } from '@/lib/eligibility/types';
import { CompatibilityScore } from '@/components/shared/compatibility-score';
import { RequirementRow } from '@/components/shared/requirement-row';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 10;

type MatchFilter = 'all' | 'ELIGIBLE' | 'CONDITIONALLY_ELIGIBLE' | 'NEEDS_VERIFICATION' | 'NOT_ELIGIBLE';

function toStudentProfile(value: any): StudentProfile | null {
  if (!value || !Array.isArray(value.educations) || value.educations.length === 0) return null;

  const educationIds = new Map<string, string>();
  const educations = value.educations.map((education: any, index: number) => {
    const id = education.id || `education-${index + 1}`;
    if (education.id) educationIds.set(education.id, id);
    return { ...education, id };
  });
  const firstEducationId = educations[0].id;
  const resolveEducationId = (id?: string) => (id && educationIds.get(id)) || firstEducationId;

  const subjects = (Array.isArray(value.subjects) ? value.subjects : []).map((subject: any, index: number) => ({
    ...subject,
    id: subject.id || `subject-${index + 1}`,
    educationId: resolveEducationId(subject.educationId),
  }));

  return {
    id: 'local-student-profile',
    educations,
    academicResults: value.academicResults
      ? [{ ...value.academicResults, educationId: resolveEducationId(value.academicResults.educationId) }]
      : [],
    subjects,
    subjectMappings: subjects.map((subject: any) => ({
      subjectId: subject.id,
      categoryId: subject.categoryName || 'Unclassified',
      categoryName: subject.categoryName || 'Unclassified',
    })),
    languageCertificates: Array.isArray(value.languages) ? value.languages : [],
    additionalQualifications: Array.isArray(value.qualifications)
      ? value.qualifications.filter((item: any) => item?.qualificationType && item?.title)
      : [],
    preferences: {
      intendedDegree: value.preferences?.intendedDegree || null,
      preferredCountries: Array.isArray(value.preferences?.preferredCountries) ? value.preferences.preferredCountries : [],
      programmLanguage: value.preferences?.programmeLanguage || null,
    },
    documents: [],
  };
}

function formatDeadline(value: string) {
  if (!value) return 'Check programme page';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function ResultCard({ result }: { result: ProgrammeMatchingResult['results'][number] }) {
  const [showRequirements, setShowRequirements] = useState(false);
  const passedCount = result.requirementResults.filter((item) => item.status === 'PASSED').length;
  const reviewCount = result.requirementResults.filter((item) => item.status === 'NEEDS_REVIEW' || item.status === 'UNKNOWN').length;
  const unmetCount = result.requirementResults.filter((item) => item.status === 'FAILED').length;

  return (
    <article className="overflow-hidden rounded-2xl border border-[#d4dee5] bg-white shadow-[0_8px_24px_rgb(20_47_75_/_4%)]">
      <div className="flex flex-col gap-4 border-b border-[#dce5ea] bg-[#f7f9fa] px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#31556e]">
            {result.universityName} <span className="font-normal text-[#526675]">· {result.city}, {result.universityCountry}</span>
          </p>
          <h2 className="mt-1.5 text-xl font-bold leading-snug tracking-[-0.02em] text-[#142f4b] sm:text-2xl">
            <Link href={`/programmes/${result.programmeId}`} className="rounded-sm underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#287090]">
              {result.programmeName}
            </Link>
          </h2>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-[#405566]">
            <span>Language: <strong className="font-semibold capitalize text-[#1a3041]">{result.teachingLanguage.replace('_', ' ')}</strong></span>
            <span>Tuition: <strong className="font-semibold text-[#1a3041]">{result.tuitionFeePerSemester == null ? 'Not listed' : `€${result.tuitionFeePerSemester} / semester`}</strong></span>
            <span>Application deadline: <strong className="font-semibold text-[#1a3041]">{formatDeadline(result.deadline)}</strong></span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 self-start">
          <StatusBadge status={result.overallEligibility} size="lg" />
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)] lg:gap-7">
        <div className="min-w-0">
          <CompatibilityScore score={result.compatibilityScore} size="md" />
          <div className="mt-4 rounded-xl border border-[#dce5ea] bg-[#fbfcfd] p-3.5">
            <p className="text-sm font-semibold text-[#20384a]">Requirement overview</p>
            {result.requirementResults.length > 0 ? (
              <ul className="mt-2.5 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-1">
                <li className="flex items-center gap-2 text-[#285c41]"><Check aria-hidden="true" className="h-4 w-4 shrink-0" />{passedCount} requirements met</li>
                <li className="flex items-center gap-2 text-[#81500d]"><AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />{reviewCount} need verification</li>
                <li className="flex items-center gap-2 text-[#7f3740]"><AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />{unmetCount} not met</li>
              </ul>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-[#526675]">This programme has no structured requirements available yet, so a full eligibility evaluation is not possible.</p>
            )}
          </div>
          <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-[#526675]">
            <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#315c79]" />
            Compatibility is an academic fit indicator, not an admission probability. The university makes the final decision.
          </p>
        </div>

        <div className="min-w-0">
          <button
            type="button"
            onClick={() => setShowRequirements((visible) => !visible)}
            aria-expanded={showRequirements}
            className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-[#cbd9e1] bg-white px-4 text-left text-sm font-semibold text-[#173b5b] transition-colors hover:bg-[#f5f8fa] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#287090]"
          >
            <span>{showRequirements ? 'Hide' : 'Review'} {result.requirementResults.length} requirement checks</span>
            <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 transition-transform ${showRequirements ? 'rotate-180' : ''}`} />
          </button>
          {showRequirements && (
            <div className="mt-3 grid gap-3">
              {result.requirementResults.length > 0 ? result.requirementResults.map((requirement) => (
                <RequirementRow key={requirement.requirementId} evaluation={requirement} />
              )) : (
                <p className="rounded-xl border border-[#dce5ea] bg-[#fbfcfd] p-4 text-sm text-[#526675]">No programme requirement details have been published yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="flex flex-col gap-3 border-t border-[#e0e7eb] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-[#526675]">Review the official programme information before applying.</p>
        <div className="grid gap-2 sm:flex sm:flex-wrap">
          <Link href={`/programmes/${result.programmeId}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#9fb2bf] px-4 text-sm font-semibold text-[#173b5b] transition-colors hover:bg-[#f2f6f8] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#287090]">
            Programme details <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          {result.officialApplicationUrl && (
            <a href={result.officialApplicationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#173b5b] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#102c45] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#287090]">
              University application <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </a>
          )}
        </div>
      </footer>
    </article>
  );
}

const emptyResult: ProgrammeMatchingResult = {
  results: [],
  summaryResults: [],
  totalEvaluated: 0,
  eligibleCount: 0,
  conditionalCount: 0,
  verificationCount: 0,
  notEligibleCount: 0,
  dataStatus: 'profile_missing',
};

export function MatchesExperience() {
  const router = useRouter();
  const [data, setData] = useState(emptyResult);
  const [detailResults, setDetailResults] = useState<ProgrammeMatchingResult['results']>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailRetry, setDetailRetry] = useState(0);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<MatchFilter>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  const profileRef = useRef<StudentProfile | null>(null);
  const detailRequestId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let profile: StudentProfile | null = null;
    try {
      const savedProfile = window.localStorage.getItem('unimatch_student_profile');
      if (savedProfile) {
        const savedDraft = JSON.parse(savedProfile);
        if (savedDraft.submittedAt) profile = toStudentProfile(savedDraft);
      }
    } catch {
      profile = null;
    }

    profileRef.current = profile;
    runProgrammeMatching(profile ?? undefined).then((result) => {
      if (!cancelled) {
        setData(result);
        setDetailResults(result.results);
      }
    }).catch(() => {
      if (!cancelled) setData({ ...emptyResult, dataStatus: 'unavailable', dataMessage: 'Matches could not be calculated. Please try again.' });
    }).finally(() => {
      if (!cancelled) setProfileLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const filteredResults = useMemo(() => data.summaryResults.filter((result) => {
    if (filter !== 'all' && result.overallEligibility !== filter) return false;
    if (!deferredQuery) return true;
    const haystack = `${result.programmeName} ${result.universityName} ${result.city} ${result.universityCountry}`.toLocaleLowerCase();
    return haystack.includes(deferredQuery);
  }), [data.summaryResults, filter, deferredQuery]);

  const visibleSummaries = filteredResults.slice(0, visibleCount);
  const visibleIdsKey = visibleSummaries.map((result) => result.programmeId).join('|');

  useEffect(() => {
    const missingIds = visibleSummaries
      .map((result) => result.programmeId)
      .filter((id) => !detailResults.some((result) => result.programmeId === id));
    if (missingIds.length === 0 || profileLoading || data.dataStatus !== 'ready') return;

    const requestId = ++detailRequestId.current;
    setDetailsLoading(true);
    setDetailsError(null);
    runProgrammeMatching(profileRef.current ?? undefined, missingIds)
      .then((result) => {
        if (requestId === detailRequestId.current && result.dataStatus === 'ready') {
          setDetailResults((current) => {
            const byId = new Map(current.map((item) => [item.programmeId, item]));
            result.results.forEach((item) => byId.set(item.programmeId, item));
            return [...byId.values()];
          });
        } else if (requestId === detailRequestId.current) {
          setDetailsError(result.dataMessage || 'Programme details could not be loaded.');
        }
      })
      .catch(() => {
        if (requestId === detailRequestId.current) setDetailsError('Programme details could not be loaded. Check your connection and try again.');
      })
      .finally(() => {
        if (requestId === detailRequestId.current) setDetailsLoading(false);
      });
    // visibleIdsKey captures the requested result page; detail state is intentionally not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleIdsKey, profileLoading, data.dataStatus, detailRetry]);

  const filters: Array<{ id: MatchFilter; label: string; count: number }> = [
    { id: 'all', label: 'All matches', count: data.summaryResults.length },
    { id: 'ELIGIBLE', label: 'Eligible', count: data.summaryResults.filter((item) => item.overallEligibility === 'ELIGIBLE').length },
    { id: 'CONDITIONALLY_ELIGIBLE', label: 'Conditional', count: data.summaryResults.filter((item) => item.overallEligibility === 'CONDITIONALLY_ELIGIBLE').length },
    { id: 'NEEDS_VERIFICATION', label: 'Needs review', count: data.summaryResults.filter((item) => item.overallEligibility === 'NEEDS_VERIFICATION').length },
    { id: 'NOT_ELIGIBLE', label: 'Not eligible', count: data.summaryResults.filter((item) => item.overallEligibility === 'NOT_ELIGIBLE').length },
  ];

  const showProfileEmpty = !profileLoading && data.dataStatus === 'profile_missing';
  const showDataEmpty = !profileLoading && (data.dataStatus === 'no_programmes' || data.dataStatus === 'unavailable');

  return (
    <div className="space-y-6 sm:space-y-7">
      <div className="rounded-2xl border border-[#d5e0e6] bg-[#edf3f6] p-4 sm:flex sm:items-start sm:gap-3.5 sm:p-5">
        <ShieldCheck aria-hidden="true" className="mb-2 h-5 w-5 text-[#245775] sm:mb-0 sm:mt-0.5" />
        <p className="max-w-4xl text-sm leading-relaxed text-[#29475d] sm:text-[0.9375rem]">
          These results compare the academic information in your profile with published programme requirements. A compatibility score is not an admission probability; the university makes the final decision.
        </p>
      </div>

      {profileLoading ? (
        <div role="status" className="flex min-h-48 items-center justify-center gap-3 rounded-2xl border border-[#d5e0e6] bg-white text-sm font-medium text-[#31556e]">
          <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" /> Loading your profile against published programmes…
        </div>
      ) : showProfileEmpty ? (
        <section className="rounded-2xl border border-[#d5e0e6] bg-white px-5 py-10 text-center shadow-[0_8px_24px_rgb(20_47_75_/_4%)] sm:px-8">
          <BookOpen aria-hidden="true" className="mx-auto h-9 w-9 text-[#315c79]" />
          <h2 className="mt-4 text-xl font-bold text-[#142f4b]">Add your academic details to see matches</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#526675]">We need your qualification, grades, subjects, and language results to compare you with real published programme requirements.</p>
          <Link href="/onboarding" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#173b5b] px-5 text-sm font-semibold text-white hover:bg-[#102c45] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#287090]">Complete your profile <ArrowUpRight aria-hidden="true" className="ml-2 h-4 w-4" /></Link>
        </section>
      ) : showDataEmpty ? (
        <section className="rounded-2xl border border-[#d5e0e6] bg-white px-5 py-10 text-center shadow-[0_8px_24px_rgb(20_47_75_/_4%)] sm:px-8">
          <AlertCircle aria-hidden="true" className="mx-auto h-9 w-9 text-[#81500d]" />
          <h2 className="mt-4 text-xl font-bold text-[#142f4b]">{data.dataStatus === 'no_programmes' ? 'No published programmes yet' : 'Programme data is temporarily unavailable'}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#526675]">{data.dataMessage}</p>
          {data.dataStatus === 'unavailable' && <Button type="button" onClick={() => router.refresh()} className="mt-5 min-h-11 bg-[#173b5b] px-5 text-white hover:bg-[#102c45]">Try again</Button>}
          {data.dataStatus === 'no_programmes' && <Link href="/programmes" className="mt-5 inline-flex min-h-11 items-center justify-center text-sm font-semibold text-[#173b5b] underline underline-offset-4">Browse the catalogue</Link>}
        </section>
      ) : (
        <>
          <section aria-label="Filter and search matches" className="rounded-2xl border border-[#d5e0e6] bg-white p-4 shadow-[0_8px_24px_rgb(20_47_75_/_3%)] sm:p-5">
            <label htmlFor="match-search" className="mb-2 block text-sm font-semibold text-[#20384a]">Search programmes</label>
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#526675]" />
              <input id="match-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(PAGE_SIZE); }} placeholder="Programme, university, city or country" className="min-h-12 w-full rounded-xl border border-[#aebec9] bg-white pl-11 pr-4 text-base text-[#172c3c] placeholder:text-[#667b89] focus:border-[#1b5b80] focus:outline-none focus:ring-3 focus:ring-[#287090]/20" />
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#405566]">
              <SlidersHorizontal aria-hidden="true" className="h-4 w-4" /> Filter by eligibility
            </div>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Eligibility filters">
              {filters.map((item) => (
                <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => { setFilter(item.id); setVisibleCount(PAGE_SIZE); }} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#287090] ${filter === item.id ? 'border-[#173b5b] bg-[#173b5b] text-white' : 'border-[#c6d4dd] bg-white text-[#29475d] hover:bg-[#f2f6f8]'}`}>
                  {item.label}<span className={`tabular-nums ${filter === item.id ? 'text-white/80' : 'text-[#526675]'}`}>{item.count}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold text-[#142f4b]">Your programme matches</h2>
            <p aria-live="polite" className="text-sm text-[#526675]">Showing {Math.min(visibleCount, filteredResults.length)} of {filteredResults.length} {filteredResults.length === 1 ? 'programme' : 'programmes'}</p>
          </div>

          {filteredResults.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#bdcbd4] bg-white px-5 py-10 text-center">
              <Search aria-hidden="true" className="mx-auto h-7 w-7 text-[#526675]" />
              <h3 className="mt-3 text-base font-semibold text-[#20384a]">No matches for this search</h3>
              <p className="mt-1 text-sm text-[#526675]">Try a different programme, university, or location.</p>
            </div>
          ) : (
            <div className="grid gap-5" aria-live="polite">
              {visibleSummaries.map((summary) => {
                const detail = detailResults.find((result) => result.programmeId === summary.programmeId);
                return detail
                  ? <ResultCard key={summary.programmeId} result={detail} />
                  : detailsError
                    ? <div key={summary.programmeId} className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-[#d5e0e6] bg-white p-4 text-center text-sm text-[#526675]" role="alert"><span>{detailsError}</span><button type="button" onClick={() => setDetailRetry((value) => value + 1)} className="min-h-11 rounded-lg px-4 font-semibold text-[#173b5b] underline underline-offset-4">Try loading again</button></div>
                    : <div key={summary.programmeId} className="flex min-h-28 items-center justify-center gap-3 rounded-2xl border border-[#d5e0e6] bg-white text-sm font-medium text-[#31556e]" role="status"><LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" /> Loading programme details…</div>;
              })}
            </div>
          )}

          {detailsLoading && <p className="text-center text-sm text-[#526675]" aria-live="polite">Loading the next set of programme details…</p>}

          {visibleCount < filteredResults.length && (
            <div className="flex justify-center pt-1">
              <Button type="button" variant="outline" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="min-h-12 w-full border-[#9fb2bf] px-6 text-sm font-semibold text-[#173b5b] hover:bg-[#f2f6f8] sm:w-auto">
                Load {Math.min(PAGE_SIZE, filteredResults.length - visibleCount)} more programmes <ChevronDown aria-hidden="true" className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
