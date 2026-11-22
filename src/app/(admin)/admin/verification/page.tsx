import { ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { requireAdminAccess } from '@/lib/admin/auth';

export default async function AdminVerificationPage() {
  const { supabase } = await requireAdminAccess();
  const [requirements, sources] = await Promise.all([
    supabase.from('programme_requirements').select('id,requirement_type,requirement_description,required_value,verification_status,programme_id,programmes!inner(name,universities!inner(name))').order('verification_status'),
    supabase.from('programme_sources').select('requirement_id,url,source_title,verification_status,date_accessed'),
  ]);
  const queryError = requirements.error || sources.error;
  const sourceRows = sources.data ?? [];
  const rows = (requirements.data ?? []) as unknown as Array<{ id: string; requirement_type: string; requirement_description: string | null; required_value: string | null; verification_status: string; programme_id: string; programmes: { name: string; universities: { name: string } } }>;

  return <div className="space-y-6">
    <PageHeader title="Requirement review" description="Real admission rules and source records from the database." breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Requirement review' }]} />
    {queryError ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Could not load requirement records: {queryError.message}</p> : !rows.length ? <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center"><h2 className="font-semibold text-slate-950">No requirements recorded yet</h2><p className="mt-2 text-sm text-slate-600">Add course entry rules with official sources before marking a course fully checked.</p></div> : <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-4">Programme</th><th className="p-4">Entry rule</th><th className="p-4">Required value</th><th className="p-4">Official source</th><th className="p-4">Review status</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => { const source = sourceRows.find((item) => item.requirement_id === row.id); return <tr key={row.id} className="align-top"><td className="p-4"><p className="font-semibold text-slate-950">{row.programmes.name}</p><p className="mt-1 text-xs text-slate-500">{row.programmes.universities.name}</p></td><td className="p-4"><p className="font-medium text-slate-800">{row.requirement_description || row.requirement_type.replaceAll('_', ' ')}</p><p className="mt-1 text-xs capitalize text-slate-500">{row.requirement_type.replaceAll('_', ' ')}</p></td><td className="p-4 text-slate-700">{row.required_value || 'Not specified'}</td><td className="p-4">{source ? <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-64 items-center gap-1 text-sm font-medium text-[#173b5b] underline underline-offset-2">{source.source_title || 'View source'}<ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0" /></a> : <span className="text-slate-500">No source linked</span>}</td><td className="p-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${row.verification_status === 'verified' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{row.verification_status.replaceAll('_', ' ')}</span></td></tr>; })}</tbody></table></div>}
  </div>;
}
