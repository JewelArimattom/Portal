import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Send, Clock, Calendar, CheckCircle2, AlertCircle, Plus, FileText } from 'lucide-react';

interface ApplicationItem {
  id: string;
  universityName: string;
  programmeName: string;
  intakeName: string;
  status:
    | 'interested'
    | 'shortlisted'
    | 'preparing_documents'
    | 'ready_to_apply'
    | 'submitted'
    | 'under_review'
    | 'interview'
    | 'admitted'
    | 'rejected'
    | 'waitlisted'
    | 'withdrawn';
  submissionDate?: string;
  decisionDate?: string;
  officialReference?: string;
  reminders?: Array<{ title: string; date: string; completed: boolean }>;
}

export default async function ApplicationsPage() {
  const applications: ApplicationItem[] = [
    {
      id: 'app-1',
      universityName: 'Technical University of Munich (TUM)',
      programmeName: 'M.Sc. Informatics',
      intakeName: 'Winter 2026/2027',
      status: 'submitted',
      submissionDate: '2026-11-10',
      officialReference: 'TUM-2026-INF-9482',
      reminders: [
        { title: 'Check status update on TUMonline', date: '2026-12-05', completed: false },
      ],
    },
    {
      id: 'app-2',
      universityName: 'RWTH Aachen University',
      programmeName: 'M.Sc. Data Science',
      intakeName: 'Winter 2026/2027',
      status: 'preparing_documents',
      reminders: [
        { title: 'Upload certified syllabus to portal', date: '2026-11-28', completed: false },
      ],
    },
    {
      id: 'app-3',
      universityName: 'Vienna University of Technology (TU Wien)',
      programmeName: 'M.Sc. Software Engineering',
      intakeName: 'Winter 2026/2027',
      status: 'ready_to_apply',
      reminders: [
        { title: 'Complete online application on TISS', date: '2026-12-01', completed: false },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'admitted':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'submitted':
      case 'under_review':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'preparing_documents':
      case 'ready_to_apply':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'rejected':
      case 'withdrawn':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Application Tracker & Reminders"
        description="Track your real-world admission application statuses across universities in Germany and Austria."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Application Tracker' },
        ]}
      />

      {/* Applications List */}
      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 font-semibold">{app.universityName}</div>
                  <h3 className="text-base font-bold text-slate-900">{app.programmeName}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>Intake: {app.intakeName}</span>
                    {app.officialReference && (
                      <>
                        <span>•</span>
                        <span>Ref ID: <strong className="text-slate-800">{app.officialReference}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${getStatusColor(
                      app.status
                    )}`}
                  >
                    {app.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Reminders section */}
              {app.reminders && app.reminders.length > 0 && (
                <div className="pt-3 border-t space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Upcoming Reminders & Deadlines
                  </h4>
                  <div className="space-y-1.5">
                    {app.reminders.map((rem, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border text-xs">
                        <div className="flex items-center gap-2 text-slate-800 font-medium">
                          <Clock className="h-3.5 w-3.5 text-blue-700" />
                          <span>{rem.title}</span>
                        </div>
                        <div className="text-slate-500 font-semibold">{rem.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-xl bg-slate-50 border p-4 text-xs text-slate-600 leading-relaxed space-y-1">
        <div className="font-semibold text-slate-900">Application Tracker Disclaimer:</div>
        <p>
          UniMatch does not submit applications on your behalf. All applications must be submitted directly to the university or via Uni-assist. This tracker assists you in organizing your deadlines and submissions.
        </p>
      </div>
    </div>
  );
}
