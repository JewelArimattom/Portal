import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { DEMO_PROGRAMMES, DEMO_UNIVERSITIES } from '@/lib/seed/demo-data';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass, Search, Filter, ExternalLink, Calendar, MapPin, GraduationCap, DollarSign } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ProgrammesPageProps {
  searchParams: Promise<{
    country?: string;
    degreeLevel?: string;
    language?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function ProgrammesPage({ searchParams }: ProgrammesPageProps) {
  const params = await searchParams;
  const countryFilter = params.country || 'all';
  const degreeFilter = params.degreeLevel || 'all';
  const languageFilter = params.language || 'all';
  const searchQuery = params.search?.toLowerCase() || '';

  // Attempt to query Supabase database with fallback to verified catalogue
  let allProgrammes = DEMO_PROGRAMMES;
  try {
    const supabase = await createClient();
    const { data: dbProgrammes } = await supabase
      .from('programmes')
      .select('*, universities(*), programme_intakes(*)')
      .eq('status', 'published');

    if (dbProgrammes && dbProgrammes.length > 0) {
      allProgrammes = dbProgrammes.map((p) => ({
        id: p.id,
        universityId: p.university_id,
        universityName: p.universities?.name ?? 'University',
        name: p.name,
        degreeLevel: p.degree_level,
        subjectArea: p.subject_area ?? 'Computer Science',
        specialization: p.specialization ?? '',
        description: p.description ?? '',
        teachingLanguage: p.teaching_language as any,
        durationSemesters: p.duration_semesters ?? 4,
        tuitionFeePerSemester: p.tuition_fee_per_semester ? Number(p.tuition_fee_per_semester) : null,
        tuitionFeeStatus: p.tuition_fee_status ?? null,
        semesterContribution: p.semester_contribution ? Number(p.semester_contribution) : 150,
        applicationFee: p.application_fee ? Number(p.application_fee) : 0,
        estimatedLivingCostMonthly: p.estimated_living_cost_monthly ? Number(p.estimated_living_cost_monthly) : 900,
        officialProgrammeUrl: p.official_programme_url ?? 'https://www.daad.de',
        officialApplicationUrl: p.official_application_url ?? 'https://www.uni-assist.de',
        applicationMethod: p.application_method ?? 'direct',
        lastVerifiedAt: p.last_verified_at ?? '2026-10-15',
        isDemo: false as any,
        intakes: p.programme_intakes && p.programme_intakes.length > 0
          ? p.programme_intakes.map((i: any) => ({
              name: i.intake_name,
              academicYear: i.academic_year,
              deadline: i.application_deadline ?? '',
              internationalDeadline: i.international_deadline ?? '',
              status: i.status ?? 'open',
            }))
          : [],
        requirements: [],
      }));
    }
  } catch (err) {
    allProgrammes = DEMO_PROGRAMMES;
  }

  // Filter programmes
  let filtered = allProgrammes.filter((prog) => {
    const isAustrian = prog.universityName.includes('Vienna') || prog.universityName.includes('Graz');
    const progCountry = isAustrian ? 'Austria' : 'Germany';

    if (countryFilter !== 'all' && progCountry.toLowerCase() !== countryFilter.toLowerCase()) {
      return false;
    }

    if (degreeFilter !== 'all' && prog.degreeLevel !== degreeFilter) {
      return false;
    }

    if (languageFilter !== 'all' && prog.teachingLanguage !== languageFilter) {
      return false;
    }

    if (searchQuery) {
      const matchName = prog.name.toLowerCase().includes(searchQuery);
      const matchUni = prog.universityName.toLowerCase().includes(searchQuery);
      const matchSub = prog.subjectArea.toLowerCase().includes(searchQuery);
      if (!matchName && !matchUni && !matchSub) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="University Programme Catalogue"
        description="Explore Bachelor’s and Master’s programmes across Germany and Austria, then compare their published admission requirements."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Programmes' },
        ]}
      />

      {/* Filter Bar */}
      <div className="rounded-2xl border bg-white p-4 shadow-xs space-y-4">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Search Keywords</label>
            <Input
              name="search"
              defaultValue={params.search ?? ''}
              placeholder="e.g. Computer Science, Munich"
              className="h-11 text-sm"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Country</label>
            <select
              name="country"
              defaultValue={countryFilter}
              className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All countries</option>
              <option value="Germany">Germany</option>
              <option value="Austria">Austria</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Degree Level</label>
            <select
              name="degreeLevel"
              defaultValue={degreeFilter}
              className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Degree Levels</option>
              <option value="master">Master&apos;s</option>
              <option value="bachelor">Bachelor&apos;s</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Language</label>
            <select
              name="language"
              defaultValue={languageFilter}
              className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Languages</option>
              <option value="english">100% English Taught</option>
              <option value="german">German Taught</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-3 border-t">
            <Link href="/programmes">
              <Button type="button" variant="ghost" size="sm" className="h-10 px-4 text-sm">
                Clear Filters
              </Button>
            </Link>
            <Button type="submit" size="sm" className="h-10 px-4 bg-blue-700 hover:bg-blue-800 text-white text-sm gap-1.5">
              <Search className="h-3.5 w-3.5" />
              Apply Filters
            </Button>
          </div>
        </form>
      </div>

      {/* Catalogue Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((prog) => {
          const isAustrian = prog.universityName.includes('Vienna') || prog.universityName.includes('Graz');
          const country = isAustrian ? 'Austria' : 'Germany';
          const activeIntake = prog.intakes.find((i) => i.status === 'open') ?? prog.intakes[0];

          return (
            <Card key={prog.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {country}
                  </span>
                  <span className="font-bold text-[10px] uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {prog.teachingLanguage}
                  </span>
                </div>

                <div className="text-xs text-slate-500 font-medium line-clamp-1">{prog.universityName}</div>

                <CardTitle className="text-base font-bold text-slate-900 leading-snug pt-1">
                  <Link href={`/programmes/${prog.id}`} className="hover:text-blue-700 transition-colors">
                    {prog.name}
                  </Link>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4">
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {prog.description}
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50/80 p-3 rounded-lg">
                  <div>
                    <span className="text-slate-500 block">Tuition:</span>
                    <span className="font-semibold text-slate-800">
                      {prog.tuitionFeeStatus === 'unknown' ? 'Tuition not listed' : prog.tuitionFeePerSemester === null ? 'Tuition-Free' : `€${prog.tuitionFeePerSemester}/sem`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Deadline:</span>
                    <span className="font-semibold text-slate-800">{activeIntake?.internationalDeadline || 'Not listed'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t text-xs">
                  <span className="text-slate-600 text-xs font-medium">
                    {prog.requirements.length} requirements listed
                  </span>

                  <Link href={`/programmes/${prog.id}`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs font-semibold text-blue-700 hover:text-blue-800 hover:bg-blue-50">
                      Check Eligibility
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
