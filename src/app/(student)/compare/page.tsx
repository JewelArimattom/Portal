import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { DEMO_PROGRAMMES } from '@/lib/seed/demo-data';
import { Button } from '@/components/ui/button';
import { ExternalLink, Check, X, HelpCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ComparePageProps {
  searchParams: Promise<{
    p1?: string;
    p2?: string;
    p3?: string;
    p4?: string;
  }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;

  // Selected programme IDs (up to 4)
  const defaultIds = [
    DEMO_PROGRAMMES[0].id, // TUM Informatics
    DEMO_PROGRAMMES[1].id, // RWTH Data Science
    DEMO_PROGRAMMES[3].id, // TU Wien Software Engineering
  ];

  const selectedIds = [
    params.p1 || defaultIds[0],
    params.p2 || defaultIds[1],
    params.p3 || defaultIds[2],
    params.p4,
  ].filter(Boolean) as string[];

  const programmes = selectedIds
    .map((id) => DEMO_PROGRAMMES.find((p) => p.id === id))
    .filter(Boolean) as typeof DEMO_PROGRAMMES;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Side-by-Side Programme Comparison"
        description="Compare tuition, curricular prerequisites, language requirements, and application deadlines across up to 4 selected programmes."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Shortlist', href: '/shortlist' },
          { label: 'Compare' },
        ]}
      />

      <div className="overflow-x-auto rounded-2xl border bg-white shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="p-4 w-48 text-slate-500 font-bold uppercase tracking-wider">Criteria</th>
              {programmes.map((p) => (
                <th key={p.id} className="p-4 min-w-[220px] font-bold text-slate-900 border-l">
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">{p.universityName}</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{p.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y text-slate-700">
            <tr>
              <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Country & City</td>
              {programmes.map((p) => {
                const isAustrian = p.universityName.includes('Vienna') || p.universityName.includes('Graz');
                return (
                  <td key={p.id} className="p-4 border-l font-medium">
                    {isAustrian ? 'Austria' : 'Germany'} • {p.universityId.includes('tum') ? 'Munich' : p.universityId.includes('rwth') ? 'Aachen' : 'Vienna'}
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Degree Level</td>
              {programmes.map((p) => (
                <td key={p.id} className="p-4 border-l capitalize font-medium">{p.degreeLevel}</td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Teaching Language</td>
              {programmes.map((p) => (
                <td key={p.id} className="p-4 border-l font-bold text-slate-900 capitalize">{p.teachingLanguage}</td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Tuition Fee</td>
              {programmes.map((p) => (
                <td key={p.id} className="p-4 border-l font-bold text-blue-700">
                  {p.tuitionFeePerSemester === null ? 'Tuition-Free' : `€${p.tuitionFeePerSemester} / semester`}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Semester Contribution</td>
              {programmes.map((p) => (
                <td key={p.id} className="p-4 border-l">€{p.semesterContribution}</td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Application Method</td>
              {programmes.map((p) => (
                <td key={p.id} className="p-4 border-l uppercase font-semibold text-slate-800">
                  {p.applicationMethod.replace('_', ' ')}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">International Deadline</td>
              {programmes.map((p) => {
                const intake = p.intakes.find((i) => i.status === 'open') ?? p.intakes[0];
                return (
                  <td key={p.id} className="p-4 border-l font-bold text-slate-900">
                    {intake.internationalDeadline}
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Curricular Prereqs</td>
              {programmes.map((p) => (
                <td key={p.id} className="p-4 border-l space-y-1">
                  {p.requirements.map((r, i) => (
                    <div key={i} className="text-[11px] leading-tight text-slate-600">
                      • {r.description}
                    </div>
                  ))}
                </td>
              ))}
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-900 bg-slate-50/50">Official Portal</td>
              {programmes.map((p) => (
                <td key={p.id} className="p-4 border-l">
                  <a
                    href={p.officialApplicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex text-blue-700 hover:underline font-semibold items-center gap-1"
                  >
                    Apply on Portal <ExternalLink className="h-3 w-3" />
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
