import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { runProgrammeMatching } from '@/lib/actions/matching';
import {
  Compass,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  Languages,
  ArrowRight,
  Sparkles,
  Bookmark,
  Send
} from 'lucide-react';

export default async function StudentDashboardPage() {
  const matchSummary = await runProgrammeMatching();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Student Admission Dashboard"
        description="Transparent rule-based programme discovery for Germany and Austria. Zero AI estimations."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/onboarding">
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            </Link>
            <Link href="/matches">
              <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white gap-1.5 shadow-sm">
                <Sparkles className="h-4 w-4" />
                Run Matching Engine
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Eligible
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-emerald-700">
            {matchSummary.eligibleCount}
          </div>
          <p className="mt-1 text-xs text-slate-500">All mandatory requirements met</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Conditional
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-amber-700">
            {matchSummary.conditionalCount}
          </div>
          <p className="mt-1 text-xs text-slate-500">Pending conditions / test</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Verification
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-blue-700">
            {matchSummary.verificationCount}
          </div>
          <p className="mt-1 text-xs text-slate-500">Missing data or credits review</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Not Eligible
            </span>
            <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-rose-700">
            {matchSummary.notEligibleCount}
          </div>
          <p className="mt-1 text-xs text-slate-500">Failed degree or grade check</p>
        </div>
      </div>

      {/* Quick Actions & Profile Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold text-slate-900">
              Top Matched Programmes
            </CardTitle>
            <Link href="/matches" className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1">
              View All ({matchSummary.totalEvaluated}) <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="divide-y">
            {matchSummary.results.slice(0, 4).map((res) => (
              <div key={res.programmeId} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">{res.universityName}</span>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                      {res.universityCountry}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    <Link href={`/programmes/${res.programmeId}`} className="hover:text-blue-700">
                      {res.programmeName}
                    </Link>
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Tuition: {res.tuitionFeePerSemester === null ? 'Free' : `€${res.tuitionFeePerSemester}/sem`}</span>
                    <span>•</span>
                    <span>Deadline: {res.deadline}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">{Math.round(res.compatibilityScore.totalScore)}%</div>
                    <div className="text-[10px] text-slate-500">Match Index</div>
                  </div>
                  <StatusBadge status={res.overallEligibility} size="sm" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Profile Card */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">
                Academic Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-slate-500">Degree Background:</span>
                <span className="font-semibold text-slate-800">Bachelor of Computer Applications</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-slate-500">CGPA:</span>
                <span className="font-semibold text-blue-700">8.4 / 10.0</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-slate-500">English Certificate:</span>
                <span className="font-semibold text-slate-800">IELTS Academic 7.0</span>
              </div>
              <div className="flex justify-between py-1.5 border-b">
                <span className="text-slate-500">Subject Credits:</span>
                <span className="font-semibold text-slate-800">10 Subjects (40 Credits)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">APS Certificate:</span>
                <span className="font-semibold text-amber-700">Applied (In Progress)</span>
              </div>

              <div className="pt-2">
                <Link href="/onboarding" className="w-full block">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Update Academic Data
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white">
            <CardContent className="pt-5 space-y-3">
              <div className="font-bold text-sm flex items-center gap-2">
                <Compass className="h-4 w-4 text-blue-400" />
                Target Degree Filter
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Currently displaying matching Master&apos;s degree programmes in Germany and Austria for winter semester admissions.
              </p>
              <Link href="/programmes" className="inline-block pt-1">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  Browse All Programmes
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
