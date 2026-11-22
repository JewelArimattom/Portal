import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { DEMO_PROGRAMMES } from '@/lib/seed/demo-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bookmark, ExternalLink, Trash2, ArrowRight, Layers } from 'lucide-react';

export default async function ShortlistPage() {
  // Demo shortlist: 3 programmes saved
  const shortlistedProgrammes = [
    DEMO_PROGRAMMES[0], // TUM Informatics
    DEMO_PROGRAMMES[1], // RWTH Data Science
    DEMO_PROGRAMMES[3], // TU Wien Software Engineering
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Shortlist"
        description="Track your selected university programmes, compare criteria side-by-side, and initiate applications."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Shortlist' },
        ]}
        actions={
          <Link href="/compare">
            <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white gap-1.5 text-xs">
              <Layers className="h-4 w-4" />
              Compare All Saved ({shortlistedProgrammes.length})
            </Button>
          </Link>
        }
      />

      <div className="divide-y border rounded-2xl bg-white shadow-xs overflow-hidden">
        {shortlistedProgrammes.map((prog) => {
          const isAustrian = prog.universityName.includes('Vienna') || prog.universityName.includes('Graz');
          const country = isAustrian ? 'Austria' : 'Germany';
          const activeIntake = prog.intakes.find((i) => i.status === 'open') ?? prog.intakes[0];

          return (
            <div key={prog.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <span>{prog.universityName}</span>
                  <span>•</span>
                  <span>{country}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  <Link href={`/programmes/${prog.id}`} className="hover:text-blue-700 transition-colors">
                    {prog.name}
                  </Link>
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  <span>Language: <strong className="text-slate-800 capitalize">{prog.teachingLanguage}</strong></span>
                  <span>•</span>
                  <span>Tuition: <strong className="text-slate-800">{prog.tuitionFeePerSemester === null ? 'Free' : `€${prog.tuitionFeePerSemester}/sem`}</strong></span>
                  <span>•</span>
                  <span>Deadline: <strong className="text-slate-800">{activeIntake.internationalDeadline}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end sm:self-center">
                <Link href={`/programmes/${prog.id}`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    View Match
                  </Button>
                </Link>
                <Link href={`/applications?add=${prog.id}`}>
                  <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white text-xs">
                    Start Application
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
