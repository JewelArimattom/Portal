import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { BookOpen, Building2, CheckCircle2, Clock3, FileCheck2, Plus, Upload } from 'lucide-react';
import { requireAdminAccess } from '@/lib/admin/auth';

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdminAccess();
  const [universities, programmes, requirements, intakes] = await Promise.all([
    supabase.from('universities').select('id,country,status,is_demo'),
    supabase.from('programmes').select('id,status,requirements_data_status,is_demo'),
    supabase.from('programme_requirements').select('id,verification_status'),
    supabase.from('programme_intakes').select('id,status'),
  ]);
  const queryError = universities.error || programmes.error || requirements.error || intakes.error;
  const institutions = universities.data ?? [];
  const courses = programmes.data ?? [];
  const rules = requirements.data ?? [];
  const intakeRows = intakes.data ?? [];
  const cards = [
    { label: 'Institutions', value: institutions.length, detail: 'All records in the database', icon: Building2, tone: 'text-[#173b5b] bg-[#e8f0f4]' },
    { label: 'Programmes', value: courses.length, detail: `${courses.filter((row) => row.status === 'published').length} published`, icon: BookOpen, tone: 'text-emerald-800 bg-emerald-50' },
    { label: 'Requirements to review', value: rules.filter((row) => row.verification_status !== 'verified').length, detail: 'Not yet verified', icon: FileCheck2, tone: 'text-amber-800 bg-amber-50' },
    { label: 'Open intakes', value: intakeRows.filter((row) => row.status === 'open').length, detail: 'Marked open in the database', icon: Clock3, tone: 'text-blue-800 bg-blue-50' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Catalogue admin" description="Manage the institutions and degree programmes students can find." />
      {queryError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Some database totals could not be loaded: {queryError.message}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, detail, icon: Icon, tone }) => (
          <section key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-slate-600">{label}</p><span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon aria-hidden="true" className="h-5 w-5" /></span></div>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{queryError ? '—' : value.toLocaleString()}</p>
            <p className="mt-1 text-sm text-slate-500">{detail}</p>
          </section>
        ))}
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 text-sm font-medium text-[#285c41]"><CheckCircle2 aria-hidden="true" className="h-4 w-4" /> Live catalogue data</span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Keep the course catalogue current</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Add and update institution records, review programmes, and import a validated CSV. New CSV programmes stay unpublished until you review them.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/admin/universities" className="inline-flex h-10 items-center justify-center rounded-md bg-[#173b5b] px-4 text-sm font-medium text-white transition-colors hover:bg-[#102c45]"><Building2 aria-hidden="true" className="mr-2 h-4 w-4" />View institutions</Link>
            <Link href="/admin/programmes" className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"><BookOpen aria-hidden="true" className="mr-2 h-4 w-4" />Manage programmes</Link>
            <Link href="/admin/programmes#import" className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"><Upload aria-hidden="true" className="mr-2 h-4 w-4" />Import CSV</Link>
            <Link href="/admin/programmes#new" className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"><Plus aria-hidden="true" className="mr-2 h-4 w-4" />Add programme</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
