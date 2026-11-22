'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Building2, ChevronDown, ExternalLink, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { saveUniversity, deleteUniversity, saveProgramme, deleteProgramme } from '@/lib/admin/actions';

type ProgrammeRow = {
  id: string; university_id: string; name: string; degree_level: 'bachelor' | 'master';
  subject_area: string | null; specialization: string | null; description: string | null;
  teaching_language: string; duration_semesters: number | null; tuition_fee_per_semester: number | null;
  semester_contribution: number | null; application_fee: number | null; official_programme_url: string | null;
  official_application_url: string | null; application_method: 'uni_assist' | 'direct' | 'other' | null;
  status: 'draft' | 'published' | 'archived' | 'unpublished';
};

export interface AdminUniversityRow {
  id: string;
  name: string;
  country: string;
  city: string;
  institution_type: 'public' | 'private';
  official_website: string | null;
  admissions_website: string | null;
  description: string | null;
  is_public: boolean;
  status: 'active' | 'archived';
  is_demo: boolean;
  federal_state?: string | null;
  course_catalog_status?: string | null;
  programme_count: number;
  programmes: ProgrammeRow[];
}

const blank: Omit<AdminUniversityRow, 'id' | 'status' | 'is_demo' | 'programme_count' | 'programmes'> = {
  name: '', country: 'Germany', city: '', institution_type: 'public', official_website: '',
  admissions_website: '', description: '', is_public: true,
};

type ProgrammePage = { programmes: ProgrammeRow[]; total: number; loaded: boolean; loading: boolean; loadingMore: boolean; error: string | null };

export function AdminUniversitiesManager({ universities, totalCount: initialTotalCount, canDelete }: { universities: AdminUniversityRow[]; totalCount: number; canDelete: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [institutionRows, setInstitutionRows] = useState(universities);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [programmePages, setProgrammePages] = useState<Record<string, ProgrammePage>>({});
  const initialSearch = useRef(true);
  const latestQuery = useRef(query);
  latestQuery.current = query;
  const [editing, setEditing] = useState<AdminUniversityRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedInstitution, setExpandedInstitution] = useState<string | null>(null);
  const [editingProgramme, setEditingProgramme] = useState<ProgrammeRow | null>(null);
  const [creatingProgrammeFor, setCreatingProgrammeFor] = useState<string | null>(null);
  const [programmeSaving, setProgrammeSaving] = useState(false);
  useEffect(() => {
    setInstitutionRows(universities);
    setTotalCount(initialTotalCount);
  }, [universities, initialTotalCount]);

  useEffect(() => {
    if (initialSearch.current) { initialSearch.current = false; return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setListLoading(true); setListError(null);
      try {
        const response = await fetch(`/api/admin/universities?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? 'Could not search institutions.');
        setInstitutionRows(result.universities as AdminUniversityRow[]);
        setTotalCount(result.total as number);
      } catch (cause) {
        if (!controller.signal.aborted) setListError(cause instanceof Error ? cause.message : 'Could not search institutions.');
      } finally {
        if (!controller.signal.aborted) setListLoading(false);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query]);

  const loadMoreInstitutions = async () => {
    setListLoading(true); setListError(null);
    try {
      const response = await fetch(`/api/admin/universities?offset=${institutionRows.length}&q=${encodeURIComponent(query)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Could not load more institutions.');
      if (query !== latestQuery.current) return;
      setInstitutionRows((current) => [...current, ...(result.universities as AdminUniversityRow[])]);
      setTotalCount(result.total as number);
    } catch (cause) {
      setListError(cause instanceof Error ? cause.message : 'Could not load more institutions.');
    } finally { setListLoading(false); }
  };

  const loadProgrammes = async (institutionId: string, offset = 0) => {
    setProgrammePages((current) => ({
      ...current,
      [institutionId]: { programmes: offset ? current[institutionId]?.programmes ?? [] : [], total: current[institutionId]?.total ?? 0, loaded: offset > 0 && (current[institutionId]?.loaded ?? false), loading: offset === 0, loadingMore: offset > 0, error: null },
    }));
    try {
      const response = await fetch(`/api/admin/universities?institution_id=${institutionId}&offset=${offset}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Could not load programmes.');
      setProgrammePages((current) => {
        const previous = current[institutionId]?.programmes ?? [];
        const loadedProgrammes = result.programmes as ProgrammeRow[];
        return { ...current, [institutionId]: { programmes: offset ? [...previous, ...loadedProgrammes] : loadedProgrammes, total: result.total as number, loaded: true, loading: false, loadingMore: false, error: null } };
      });
    } catch (cause) {
      setProgrammePages((current) => ({ ...current, [institutionId]: { ...(current[institutionId] ?? { programmes: [], total: 0, loaded: false, loading: false, loadingMore: false }), loading: false, loadingMore: false, error: cause instanceof Error ? cause.message : 'Could not load programmes.' } }));
    }
  };

  const toggleProgrammes = (institutionId: string) => {
    if (expandedInstitution === institutionId) { setExpandedInstitution(null); return; }
    setExpandedInstitution(institutionId);
    if (!programmePages[institutionId]?.loaded) void loadProgrammes(institutionId);
  };

  const closeForm = () => { setEditing(null); setIsCreating(false); setError(null); };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true); setError(null); setNotice(null);
    const data = new FormData(event.currentTarget);
    const result = await saveUniversity({
      ...(editing ? { id: editing.id } : {}),
      name: data.get('name'), country: data.get('country'), city: data.get('city'),
      institution_type: data.get('institution_type'), is_public: data.get('institution_type') === 'public',
      official_website: String(data.get('official_website') ?? '').trim() || null,
      admissions_website: String(data.get('admissions_website') ?? '').trim() || null,
      description: String(data.get('description') ?? '').trim() || null,
    });
    setSaving(false);
    if (result.error) setError(result.error);
    else { setNotice(editing ? 'Institution updated.' : 'Institution added.'); closeForm(); setQuery(''); router.refresh(); }
  };

  const remove = async (university: AdminUniversityRow) => {
    if (!window.confirm(`Delete ${university.name} and all ${university.programme_count} programmes under it? This cannot be undone.`)) return;
    setError(null); setNotice(null);
    const result = await deleteUniversity(university.id);
    if (result.error) setError(result.error);
    else { setNotice('Institution and its programmes deleted.'); setQuery(''); router.refresh(); }
  };

  const closeProgrammeForm = () => { setEditingProgramme(null); setCreatingProgrammeFor(null); setError(null); };
  const submitProgramme = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProgrammeSaving(true); setError(null); setNotice(null);
    const data = new FormData(event.currentTarget);
    const universityId = String(data.get('university_id'));
    const number = (key: string) => { const value = String(data.get(key) ?? '').trim(); return value ? Number(value) : null; };
    const result = await saveProgramme({
      ...(editingProgramme ? { id: editingProgramme.id } : {}),
      university_id: universityId,
      name: data.get('name'), degree_level: data.get('degree_level'),
      subject_area: String(data.get('subject_area') ?? '').trim() || null,
      specialization: String(data.get('specialization') ?? '').trim() || null,
      description: String(data.get('description') ?? '').trim() || null,
      teaching_language: data.get('teaching_language'), duration_semesters: number('duration_semesters'),
      tuition_fee_per_semester: number('tuition_fee_per_semester'), semester_contribution: number('semester_contribution'),
      application_fee: number('application_fee'), official_programme_url: String(data.get('official_programme_url') ?? '').trim() || null,
      official_application_url: String(data.get('official_application_url') ?? '').trim() || null,
      application_method: String(data.get('application_method') ?? '') || null, status: data.get('status'),
    });
    setProgrammeSaving(false);
    if (result.error) setError(result.error);
    else {
      setNotice(editingProgramme ? 'Programme updated.' : 'Programme added.'); closeProgrammeForm();
      await loadProgrammes(universityId);
      router.refresh();
    }
  };
  const removeProgramme = async (programme: ProgrammeRow) => {
    if (!window.confirm(`Delete “${programme.name}”? This cannot be undone.`)) return;
    setError(null); setNotice(null);
    const result = await deleteProgramme(programme.id);
    if (result.error) setError(result.error);
    else {
      setNotice('Programme deleted.');
      setProgrammePages((current) => {
        const page = current[programme.university_id];
        return page ? { ...current, [programme.university_id]: { ...page, programmes: page.programmes.filter((item) => item.id !== programme.id), total: Math.max(0, page.total - 1) } } : current;
      });
      router.refresh();
    }
  };

  const formValues = editing ?? blank;
  const showForm = isCreating || Boolean(editing);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative min-w-0 flex-1"><span className="sr-only">Search institutions</span><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search institution, city, or state" className="pl-9" /></label>
        <Button type="button" onClick={() => { closeForm(); setIsCreating(true); }} className="bg-[#173b5b] text-white hover:bg-[#102c45]"><Plus aria-hidden="true" className="mr-2 h-4 w-4" />Add institution</Button>
      </div>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      {listError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{listError}</p>}

      {showForm && <form key={editing?.id ?? (isCreating ? 'new' : 'hidden')} onSubmit={submit} className="rounded-2xl border border-[#cbd9e1] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-950">{editing ? 'Edit institution' : 'Add institution'}</h2><button type="button" onClick={closeForm} aria-label="Close form" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Institution name" name="name" required defaultValue={formValues.name} />
          <Field label="Country" name="country" required defaultValue={formValues.country} />
          <Field label="City" name="city" required defaultValue={formValues.city} />
          <label className="space-y-1.5 text-sm font-medium text-slate-800">Institution type<select name="institution_type" defaultValue={formValues.institution_type} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="public">Public</option><option value="private">Private</option></select></label>
          <Field label="Official website" name="official_website" type="url" defaultValue={formValues.official_website ?? ''} />
          <Field label="Admissions website" name="admissions_website" type="url" defaultValue={formValues.admissions_website ?? ''} />
          <label className="space-y-1.5 text-sm font-medium text-slate-800 sm:col-span-2">Description<textarea name="description" defaultValue={formValues.description ?? ''} rows={3} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" /></label>
        </div>
        <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" onClick={closeForm}>Cancel</Button><Button disabled={saving} className="bg-[#173b5b] text-white hover:bg-[#102c45]">{saving ? 'Saving…' : 'Save institution'}</Button></div>
      </form>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5"><h2 className="font-semibold text-slate-950">All institutions</h2><span className="text-sm text-slate-600" aria-live="polite">Showing {institutionRows.length} of {totalCount}{listLoading ? ' · Loading…' : ''}</span></div>
        {!institutionRows.length ? <p className="p-8 text-center text-sm text-slate-600">{listLoading ? 'Searching institutions…' : 'No institutions match this search.'}</p> : <ul className="divide-y divide-slate-100">
          {institutionRows.map((uni) => <li key={uni.id} className="p-4 sm:px-5 sm:py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 gap-3"><span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f0f4] text-[#173b5b]"><Building2 aria-hidden="true" className="h-5 w-5" /></span><div className="min-w-0"><h3 className="break-words font-semibold text-slate-950">{uni.name}</h3><p className="mt-0.5 text-sm text-slate-600">{uni.city}, {uni.country}{uni.federal_state ? ` · ${uni.federal_state}` : ''}</p><p className="mt-1 text-xs text-slate-500">{uni.programme_count} programmes · {uni.institution_type} · {uni.status}{uni.is_demo ? ' · demo record' : ''}</p></div></div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {uni.official_website && <a href={uni.official_website} target="_blank" rel="noreferrer" aria-label={`Open ${uni.name} website`} className="inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm text-slate-700 hover:bg-slate-50">Website <ExternalLink className="h-3.5 w-3.5" /></a>}
                <Button type="button" variant="outline" size="sm" aria-expanded={expandedInstitution === uni.id} aria-controls={`programmes-${uni.id}`} onClick={() => toggleProgrammes(uni.id)}><ChevronDown aria-hidden="true" className={`mr-1.5 h-3.5 w-3.5 transition-transform ${expandedInstitution === uni.id ? 'rotate-180' : ''}`} />{expandedInstitution === uni.id ? 'Hide programmes' : `Programmes (${uni.programme_count})`}</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => { setIsCreating(false); setEditing(uni); }}><Pencil aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" />Edit</Button>
                {canDelete && <Button type="button" variant="outline" size="sm" onClick={() => void remove(uni)} className="border-rose-200 text-rose-700 hover:bg-rose-50"><Trash2 aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" />Delete</Button>}
              </div>
            </div>
            {expandedInstitution === uni.id && <div id={`programmes-${uni.id}`} className="mt-4 w-full rounded-xl bg-[#f5f8fa] p-4 sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h4 className="font-semibold text-slate-950">Programmes</h4><p className="text-sm text-slate-600">Edit a course here or add one for {uni.name}.</p></div><Button type="button" size="sm" onClick={() => { setEditingProgramme(null); setCreatingProgrammeFor(uni.id); setError(null); }} className="bg-[#173b5b] text-white hover:bg-[#102c45]"><Plus aria-hidden="true" className="mr-1.5 h-4 w-4" />Add programme</Button></div>
              {(creatingProgrammeFor === uni.id || (editingProgramme && editingProgramme.university_id === uni.id)) && <form key={editingProgramme?.id ?? `new-${uni.id}`} onSubmit={submitProgramme} className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-4 flex items-center justify-between"><h5 className="font-semibold text-slate-950">{editingProgramme ? 'Edit programme' : 'Add programme'}</h5><button type="button" onClick={closeProgrammeForm} aria-label="Close programme form" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
                <input type="hidden" name="university_id" value={uni.id} />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Programme name" name="name" required defaultValue={editingProgramme?.name ?? ''} />
                  <label className="space-y-1.5 text-sm font-medium text-slate-800">Degree level<select name="degree_level" defaultValue={editingProgramme?.degree_level ?? 'bachelor'} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="bachelor">Bachelor</option><option value="master">Master</option></select></label>
                  <Field label="Subject area" name="subject_area" defaultValue={editingProgramme?.subject_area ?? ''} />
                  <Field label="Specialization" name="specialization" defaultValue={editingProgramme?.specialization ?? ''} />
                  <Field label="Teaching language" name="teaching_language" required defaultValue={editingProgramme?.teaching_language ?? 'German'} />
                  <label className="space-y-1.5 text-sm font-medium text-slate-800">Status<select name="status" defaultValue={editingProgramme?.status ?? 'draft'} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="draft">Draft</option><option value="published">Published</option><option value="unpublished">Unpublished</option><option value="archived">Archived</option></select></label>
                  <Field label="Duration (semesters)" name="duration_semesters" type="number" min="1" step="1" defaultValue={editingProgramme?.duration_semesters?.toString() ?? ''} />
                  <Field label="Tuition per semester (€)" name="tuition_fee_per_semester" type="number" min="0" step="0.01" defaultValue={editingProgramme?.tuition_fee_per_semester?.toString() ?? ''} />
                  <Field label="Semester contribution (€)" name="semester_contribution" type="number" min="0" step="0.01" defaultValue={editingProgramme?.semester_contribution?.toString() ?? ''} />
                  <Field label="Application fee (€)" name="application_fee" type="number" min="0" step="0.01" defaultValue={editingProgramme?.application_fee?.toString() ?? ''} />
                  <Field label="Official programme page" name="official_programme_url" type="url" defaultValue={editingProgramme?.official_programme_url ?? ''} />
                  <Field label="Official application page" name="official_application_url" type="url" defaultValue={editingProgramme?.official_application_url ?? ''} />
                  <label className="space-y-1.5 text-sm font-medium text-slate-800">Application method<select name="application_method" defaultValue={editingProgramme?.application_method ?? ''} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"><option value="">Not specified</option><option value="direct">Direct</option><option value="uni_assist">uni-assist</option><option value="other">Other</option></select></label>
                  <label className="space-y-1.5 text-sm font-medium text-slate-800 sm:col-span-2 lg:col-span-3">Description<textarea name="description" rows={2} defaultValue={editingProgramme?.description ?? ''} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" /></label>
                </div>
                <div className="mt-4 flex justify-end gap-2"><Button type="button" variant="outline" onClick={closeProgrammeForm}>Cancel</Button><Button disabled={programmeSaving} className="bg-[#173b5b] text-white hover:bg-[#102c45]">{programmeSaving ? 'Saving…' : 'Save programme'}</Button></div>
              </form>}
              {programmePages[uni.id]?.loading && <p className="py-6 text-sm text-slate-700" role="status">Loading programmes…</p>}
              {programmePages[uni.id]?.error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm text-rose-800"><p>{programmePages[uni.id].error}</p><Button type="button" variant="outline" size="sm" onClick={() => void loadProgrammes(uni.id)}>Try again</Button></div>}
              {programmePages[uni.id]?.loaded && programmePages[uni.id].programmes.length > 0 && <ul className="divide-y divide-slate-200">{programmePages[uni.id].programmes.map((program) => <li key={program.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-start gap-3"><BookOpen aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#32674f]" /><div className="min-w-0"><p className="break-words font-medium text-slate-950">{program.name}</p><p className="mt-0.5 text-sm capitalize text-slate-700">{program.degree_level}{program.subject_area ? ` · ${program.subject_area}` : ''} · {program.teaching_language} · {program.status}</p></div></div><div className="flex shrink-0 gap-2 pl-7 sm:pl-4"><Button type="button" size="sm" variant="outline" onClick={() => { setCreatingProgrammeFor(null); setEditingProgramme(program); setError(null); }}><Pencil aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" />Edit</Button>{canDelete && <Button type="button" size="sm" variant="outline" onClick={() => void removeProgramme(program)} className="border-rose-200 text-rose-700 hover:bg-rose-50"><Trash2 aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" />Delete</Button>}</div></li>)}</ul>}
              {programmePages[uni.id]?.loaded && programmePages[uni.id].programmes.length === 0 && <p className="py-3 text-sm text-slate-700">No programmes yet. Add the first programme for this institution.</p>}
              {programmePages[uni.id]?.loaded && programmePages[uni.id].programmes.length < programmePages[uni.id].total && <div className="border-t border-slate-200 pt-3"><Button type="button" variant="outline" size="sm" disabled={programmePages[uni.id].loadingMore} onClick={() => void loadProgrammes(uni.id, programmePages[uni.id].programmes.length)}>{programmePages[uni.id].loadingMore ? 'Loading…' : `Load more programmes (${programmePages[uni.id].total - programmePages[uni.id].programmes.length} remaining)`}</Button></div>}
            </div>}
          </li>)}
        </ul>}
      </div>
      {institutionRows.length < totalCount && <div className="flex flex-col items-center gap-2"><Button type="button" variant="outline" disabled={listLoading} onClick={() => void loadMoreInstitutions()}>{listLoading ? 'Loading…' : `Load more institutions (${totalCount - institutionRows.length} remaining)`}</Button></div>}
    </div>
  );
}

function Field({ label, name, type = 'text', required, min, step, defaultValue }: { label: string; name: string; type?: string; required?: boolean; min?: string; step?: string; defaultValue?: string }) {
  return <label className="space-y-1.5 text-sm font-medium text-slate-800">{label}<Input name={name} type={type} required={required} min={min} step={step} defaultValue={defaultValue} /></label>;
}
