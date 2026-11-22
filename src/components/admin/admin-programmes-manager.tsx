'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Download, FileUp, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { importCatalog, saveProgramme, deleteProgramme } from '@/lib/admin/actions';

type ProgrammeStatus = 'draft' | 'published' | 'archived' | 'unpublished';
export interface AdminProgrammeRow {
  id: string; university_id: string; name: string; degree_level: 'bachelor' | 'master';
  subject_area: string | null; specialization: string | null; description: string | null;
  teaching_language: string; duration_semesters: number | null; tuition_fee_per_semester: number | null;
  semester_contribution: number | null; application_fee: number | null; official_programme_url: string | null;
  official_application_url: string | null; application_method: 'uni_assist' | 'direct' | 'other' | null;
  status: ProgrammeStatus; requirements_data_status: 'unknown' | 'partial' | 'complete';
  admission_selectivity: 'unknown' | 'open' | 'restricted' | 'special_requirements';
  university_name: string; university_country: string; is_demo: boolean;
}
export interface InstitutionOption { id: string; name: string; country: string }

type ImportedRequirement = { type: string; description: string | null; mandatory: boolean; operator: string; value: string | null; numeric_value: number | null; unit: string | null; source_url: string | null; source_title: string | null };
type ImportedProgramme = { name: string; degree_level: 'bachelor' | 'master'; subject_area: string | null; specialization: string | null; description: string | null; teaching_language: string; duration_semesters: number | null; tuition_fee_per_semester: number | null; semester_contribution: number | null; application_fee: number | null; official_programme_url: string; official_application_url: string | null; application_method: 'uni_assist' | 'direct' | 'other' | null; requirements: ImportedRequirement[] };
type ImportedUniversity = { name: string; country: string; city: string; institution_type: 'public' | 'private'; official_website: string; admissions_website: string | null; description: string | null; is_public: boolean; programmes: ImportedProgramme[] };

const optionalText = (value: string) => value.trim() || null;
const csvNumber = (value: string, rowNumber: number, label: string, integer = false): number | null => {
  if (!value.trim()) return null;
  const parsed = Number(value.trim().replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed < (integer ? 1 : 0) || (integer && !Number.isInteger(parsed))) throw new Error(`Row ${rowNumber}: “${label}” must be ${integer ? 'a positive whole number' : 'a valid non-negative number'}.`);
  return parsed;
};

function parseRows(text: string): string[][] {
  const source = text.replace(/^\uFEFF/, '');
  const header = source.split(/\r?\n/, 1)[0] ?? '';
  const delimiter = [',', ';', '\t'].sort((a, b) => header.split(b).length - header.split(a).length)[0];
  const rows: string[][] = [];
  let row: string[] = []; let cell = ''; let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '"') {
      if (quoted && source[index + 1] === '"') { cell += '"'; index += 1; } else quoted = !quoted;
    } else if (char === delimiter && !quoted) { row.push(cell.trim()); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && source[index + 1] === '\n') index += 1;
      row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = '';
    } else cell += char;
  }
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row);
  if (quoted) throw new Error('The CSV has a quote that is not closed.');
  return rows;
}

function parseCatalogCsv(text: string): ImportedUniversity[] {
  const rows = parseRows(text);
  if (rows.length < 2) throw new Error('The CSV must include a header and at least one course row.');
  const headers = rows[0].map((value) => value.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const requiredHeaders = ['institutionname', 'country', 'city', 'institutiontype', 'officialwebsite', 'programmename', 'degreelevel', 'subjectarea', 'teachinglanguage', 'officialprogrammeurl'];
  const missingHeaders = requiredHeaders.filter((name) => !headers.includes(name));
  if (missingHeaders.length) throw new Error(`Missing required CSV columns: ${missingHeaders.join(', ')}. Download the template for the full column list.`);
  const col = (name: string) => headers.indexOf(name);
  const value = (row: string[], name: string) => row[col(name)]?.trim() ?? '';
  const bool = (raw: string, rowNumber: number, fallback: boolean) => {
    if (!raw.trim()) return fallback;
    if (['true', 'yes', '1'].includes(raw.toLowerCase())) return true;
    if (['false', 'no', '0'].includes(raw.toLowerCase())) return false;
    throw new Error(`Row ${rowNumber}: is_public must be true/false or yes/no.`);
  };
  const groups = new Map<string, ImportedUniversity>();
  const programmeRows = new Map<string, ImportedProgramme>();
  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    const institutionName = value(row, 'institutionname');
    const country = value(row, 'country');
    const city = value(row, 'city');
    const institutionType = value(row, 'institutiontype').toLowerCase();
    const officialWebsite = value(row, 'officialwebsite');
    const programmeName = value(row, 'programmename');
    const degreeLevel = value(row, 'degreelevel').toLowerCase();
    const subjectArea = value(row, 'subjectarea');
    const language = value(row, 'teachinglanguage').toLowerCase();
    const programmeUrl = value(row, 'officialprogrammeurl');
    if (!institutionName || !country || !city || !programmeName || !subjectArea) throw new Error(`Row ${rowNumber}: institution, city, country, programme name, and subject area are required.`);
    if (!['public', 'private'].includes(institutionType)) throw new Error(`Row ${rowNumber}: institution_type must be public or private.`);
    const isPublic = bool(value(row, 'ispublic'), rowNumber, institutionType === 'public');
    if (isPublic !== (institutionType === 'public')) throw new Error(`Row ${rowNumber}: is_public must match institution_type.`);
    if (!['bachelor', 'master'].includes(degreeLevel)) throw new Error(`Row ${rowNumber}: degree_level must be bachelor or master.`);
    if (!language) throw new Error(`Row ${rowNumber}: teaching_language is required.`);
    if (!/^https:\/\//i.test(officialWebsite) || !/^https:\/\//i.test(programmeUrl)) throw new Error(`Row ${rowNumber}: official website links must use https://.`);
    const institutionKey = `${institutionName.toLowerCase()}|${country.toLowerCase()}`;
    let institution = groups.get(institutionKey);
    if (!institution) {
      institution = { name: institutionName, country, city, institution_type: institutionType as 'public' | 'private', official_website: officialWebsite, admissions_website: optionalText(value(row, 'admissionswebsite')), description: optionalText(value(row, 'institutiondescription')), is_public: isPublic, programmes: [] };
      groups.set(institutionKey, institution);
    } else if (institution.city !== city || institution.official_website !== officialWebsite || institution.institution_type !== institutionType || institution.admissions_website !== optionalText(value(row, 'admissionswebsite')) || institution.description !== optionalText(value(row, 'institutiondescription')) || institution.is_public !== isPublic) {
      throw new Error(`Row ${rowNumber}: institution details must match the other rows for ${institutionName}.`);
    }
    const programmeKey = `${institutionKey}|${programmeName.toLowerCase()}|${degreeLevel}`;
    let programme = programmeRows.get(programmeKey);
    const methodValue = optionalText(value(row, 'applicationmethod'))?.toLowerCase() ?? null;
    if (methodValue && !['uni_assist', 'direct', 'other'].includes(methodValue)) throw new Error(`Row ${rowNumber}: application_method must be direct, uni_assist, or other.`);
    const initialProgramme: ImportedProgramme = {
      name: programmeName, degree_level: degreeLevel as 'bachelor' | 'master', subject_area: subjectArea,
      specialization: optionalText(value(row, 'specialization')), description: optionalText(value(row, 'programmedescription')),
      teaching_language: language, duration_semesters: csvNumber(value(row, 'durationsemesters'), rowNumber, 'duration_semesters', true),
      tuition_fee_per_semester: csvNumber(value(row, 'tuitionfeepersemester'), rowNumber, 'tuition_fee_per_semester'),
      semester_contribution: csvNumber(value(row, 'semestercontribution'), rowNumber, 'semester_contribution'),
      application_fee: csvNumber(value(row, 'applicationfee'), rowNumber, 'application_fee'),
      official_programme_url: programmeUrl, official_application_url: optionalText(value(row, 'officialapplicationurl')),
      application_method: (methodValue as ImportedProgramme['application_method']) ?? null,
      requirements: [],
    };
    if (programme && JSON.stringify({ ...programme, requirements: [] }) !== JSON.stringify({ ...initialProgramme, requirements: [] })) throw new Error(`Row ${rowNumber}: repeated programme details must be identical.`);
    if (!programme) { programme = initialProgramme; programmeRows.set(programmeKey, programme); institution.programmes.push(programme); }
    const requirementType = value(row, 'requirementtype');
    if (requirementType) {
      const requirementDescription = value(row, 'requirementdescription');
      if (!requirementDescription) throw new Error(`Row ${rowNumber}: requirement_description is required when requirement_type is set.`);
      const mandatoryRaw = value(row, 'ismandatory').toLowerCase();
      const mandatory = mandatoryRaw ? bool(mandatoryRaw, rowNumber, true) : true;
      const operator = value(row, 'operator').toLowerCase() || 'gte';
      if (!['eq', 'gt', 'gte', 'lt', 'lte', 'contains', 'one_of', 'all_of', 'any_of', 'between'].includes(operator)) throw new Error(`Row ${rowNumber}: unsupported requirement operator.`);
      const sourceUrl = optionalText(value(row, 'sourceurl'));
      if (sourceUrl && !/^https:\/\//i.test(sourceUrl)) throw new Error(`Row ${rowNumber}: source_url must use https://.`);
      programme.requirements.push({ type: requirementType, description: requirementDescription, mandatory, operator, value: optionalText(value(row, 'requiredvalue')), numeric_value: csvNumber(value(row, 'requiredvaluenumeric'), rowNumber, 'required_value_numeric'), unit: optionalText(value(row, 'unit')), source_url: sourceUrl, source_title: optionalText(value(row, 'sourcetitle')) });
    }
  });
  if (groups.size > 500 || [...groups.values()].reduce((n, group) => n + group.programmes.length, 0) > 5000) throw new Error('This file exceeds the limit of 500 institutions or 5,000 programmes.');
  return [...groups.values()];
}

const blankProgramme = (universityId: string): Omit<AdminProgrammeRow, 'id' | 'university_name' | 'university_country' | 'is_demo'> => ({
  university_id: universityId, name: '', degree_level: 'bachelor', subject_area: '', specialization: '', description: '',
  teaching_language: 'german', duration_semesters: null, tuition_fee_per_semester: null, semester_contribution: null,
  application_fee: null, official_programme_url: '', official_application_url: '', application_method: null,
  status: 'draft', requirements_data_status: 'unknown', admission_selectivity: 'unknown',
});

export function AdminProgrammesManager({ programmes, totalCount: initialTotalCount, institutions, role }: { programmes: AdminProgrammeRow[]; totalCount: number; institutions: InstitutionOption[]; role: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('');
  const [programmeRows, setProgrammeRows] = useState(programmes);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const initialSearch = useRef(true);
  const latestFilters = useRef({ query, institutionFilter });
  latestFilters.current = { query, institutionFilter };
  const [editing, setEditing] = useState<AdminProgrammeRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [csvBusy, setCsvBusy] = useState(false);
  const [csvPreview, setCsvPreview] = useState<ImportedUniversity[] | null>(null);
  const [csvFileName, setCsvFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => { setProgrammeRows(programmes); setTotalCount(initialTotalCount); }, [programmes, initialTotalCount]);
  useEffect(() => {
    if (initialSearch.current) { initialSearch.current = false; return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setListLoading(true); setListError(null);
      const params = new URLSearchParams({ q: query });
      if (institutionFilter) params.set('institution_id', institutionFilter);
      try {
        const response = await fetch(`/api/admin/programmes?${params}`, { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? 'Could not search programmes.');
        setProgrammeRows(result.programmes as AdminProgrammeRow[]); setTotalCount(result.total as number);
      } catch (cause) {
        if (!controller.signal.aborted) setListError(cause instanceof Error ? cause.message : 'Could not search programmes.');
      } finally { if (!controller.signal.aborted) setListLoading(false); }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, institutionFilter]);

  const loadMoreProgrammes = async () => {
    setListLoading(true); setListError(null);
    const params = new URLSearchParams({ q: query, offset: String(programmeRows.length) });
    if (institutionFilter) params.set('institution_id', institutionFilter);
    try {
      const response = await fetch(`/api/admin/programmes?${params}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Could not load more programmes.');
      if (query !== latestFilters.current.query || institutionFilter !== latestFilters.current.institutionFilter) return;
      setProgrammeRows((current) => [...current, ...(result.programmes as AdminProgrammeRow[])]); setTotalCount(result.total as number);
    } catch (cause) { setListError(cause instanceof Error ? cause.message : 'Could not load more programmes.'); }
    finally { setListLoading(false); }
  };
  const canDelete = role === 'admin';
  const formValues = editing ?? blankProgramme(institutions[0]?.id ?? '');
  const showForm = creating || Boolean(editing);
  const closeForm = () => { setCreating(false); setEditing(null); setError(null); };
  const resetProgrammeFilters = () => { setQuery(''); setInstitutionFilter(''); };

  const submitProgramme = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError(null); setNotice(null);
    const data = new FormData(event.currentTarget);
    const number = (name: string, integer = false) => { const raw = String(data.get(name) ?? '').trim(); if (!raw) return null; const parsed = Number(raw); return Number.isFinite(parsed) && (!integer || Number.isInteger(parsed)) ? parsed : NaN; };
    const result = await saveProgramme({
      ...(editing ? { id: editing.id } : {}), university_id: data.get('university_id'), name: data.get('name'), degree_level: data.get('degree_level'),
      subject_area: optionalText(String(data.get('subject_area') ?? '')), specialization: optionalText(String(data.get('specialization') ?? '')),
      description: optionalText(String(data.get('description') ?? '')), teaching_language: data.get('teaching_language'),
      duration_semesters: number('duration_semesters', true), tuition_fee_per_semester: number('tuition_fee_per_semester'),
      semester_contribution: number('semester_contribution'), application_fee: number('application_fee'),
      official_programme_url: optionalText(String(data.get('official_programme_url') ?? '')),
      official_application_url: optionalText(String(data.get('official_application_url') ?? '')),
      application_method: optionalText(String(data.get('application_method') ?? '')),
      status: data.get('status'),
    });
    setSaving(false);
    if (result.error) setError(result.error);
    else { setNotice(editing ? 'Programme updated.' : 'Programme added as a draft.'); closeForm(); resetProgrammeFilters(); router.refresh(); }
  };

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    setError(null); setNotice(null);
    if (!file.name.toLowerCase().endsWith('.csv')) { setError('Choose a .csv file.'); return; }
    if (file.size > 500_000) { setError('CSV files must be smaller than 500 KB. Split a larger file into smaller imports.'); return; }
    setCsvBusy(true);
    try {
      const groups = parseCatalogCsv(await file.text());
      setCsvPreview(groups);
      setCsvFileName(file.name);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not read this CSV.'); }
    finally { setCsvBusy(false); }
  };

  const confirmImport = async () => {
    if (!csvPreview) return;
    setCsvBusy(true); setError(null); setNotice(null);
    const programmeCount = csvPreview.reduce((sum, group) => sum + group.programmes.length, 0);
    try {
      const result = await importCatalog(csvPreview);
      if (result.error) setError(result.error);
      else {
        setNotice(`Imported ${result.counts?.universities ?? csvPreview.length} institutions and ${result.counts?.programmes ?? programmeCount} programmes. Programmes were saved as drafts.`);
        setCsvPreview(null); setCsvFileName(''); resetProgrammeFilters(); router.refresh();
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'The import could not be completed.'); }
    finally { setCsvBusy(false); }
  };

  const remove = async (programme: AdminProgrammeRow) => {
    if (!window.confirm(`Delete “${programme.name}” and its requirements and intake records? This cannot be undone.`)) return;
    setError(null); const result = await deleteProgramme(programme.id);
    if (result.error) setError(result.error); else { resetProgrammeFilters(); router.refresh(); }
  };

  return <div className="space-y-5">
    <section id="import" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><div className="flex items-center gap-2 text-sm font-semibold text-slate-950"><FileUp aria-hidden="true" className="h-4 w-4 text-[#285c41]" />Import institution and programme CSV</div><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">We check the whole file first. Existing institutions are rejected, and every new programme stays unpublished until you review it.</p></div>
        <div className="flex flex-wrap gap-2"><a href="/templates/admin-catalog-template.csv" download className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"><Download aria-hidden="true" className="mr-2 h-4 w-4" />Download template</a><label className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-md bg-[#173b5b] px-4 text-sm font-medium text-white hover:bg-[#102c45]">{csvBusy ? 'Checking file…' : 'Choose CSV'}<input type="file" accept=".csv,text/csv" onChange={upload} disabled={csvBusy} className="sr-only" /></label></div>
      </div>
      <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">Required: institution name, country, city, type, official website, programme name, Bachelor/Master level, subject area, language, and official programme page. Admission-rule columns are optional, but rules without verified citations are saved as drafts.</p>
      {csvPreview && <div className="mt-4 rounded-xl border border-[#cbd9e1] bg-[#f5f8fa] p-4" role="status">
        <p className="font-semibold text-slate-950">Ready to import {csvFileName}</p>
        <p className="mt-1 text-sm text-slate-700">{csvPreview.length} new institution{csvPreview.length === 1 ? '' : 's'} · {csvPreview.reduce((count, item) => count + item.programmes.length, 0)} programmes · {csvPreview.reduce((count, item) => count + item.programmes.reduce((sum, program) => sum + program.requirements.length, 0), 0)} admission rules.</p>
        <ul className="mt-3 max-h-36 space-y-1 overflow-y-auto text-xs text-slate-700">{csvPreview.slice(0, 8).map((institution) => <li key={`${institution.name}-${institution.country}`}><span className="font-medium">{institution.name}</span> · {institution.programmes.length} programmes</li>)}{csvPreview.length > 8 && <li className="text-slate-500">and {csvPreview.length - 8} more institutions</li>}</ul>
        <p className="mt-1 text-xs leading-5 text-slate-600">This import adds new records only. It will stop if any institution already exists, and it will not overwrite current records. Nothing has been saved yet.</p>
        <div className="mt-3 flex flex-wrap gap-2"><Button type="button" onClick={() => void confirmImport()} disabled={csvBusy} className="bg-[#173b5b] text-white hover:bg-[#102c45]">{csvBusy ? 'Importing…' : 'Confirm import'}</Button><Button type="button" variant="outline" disabled={csvBusy} onClick={() => { setCsvPreview(null); setCsvFileName(''); }}>Cancel</Button></div>
      </div>}
    </section>

    {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
    {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

    <section id="new" className="scroll-mt-24 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row"><label className="relative min-w-0 flex-1"><span className="sr-only">Search programmes</span><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search programme name or subject" className="pl-9" /></label><label className="sr-only" htmlFor="programme-institution-filter">Filter by institution</label><select id="programme-institution-filter" value={institutionFilter} onChange={(event) => setInstitutionFilter(event.target.value)} className="h-10 min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm sm:w-64"><option value="">All institutions</option>{institutions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><Button type="button" onClick={() => { if (!institutions.length) { setError('Add an institution before adding its programmes.'); return; } closeForm(); setCreating(true); }} className="bg-[#173b5b] text-white hover:bg-[#102c45]"><Plus aria-hidden="true" className="mr-2 h-4 w-4" />Add programme</Button></div>
      {showForm && <form key={editing?.id ?? (creating ? 'new' : 'hidden')} onSubmit={submitProgramme} className="rounded-2xl border border-[#cbd9e1] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-950">{editing ? 'Edit programme' : 'Add programme'}</h2><button type="button" aria-label="Close form" onClick={closeForm} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1.5 text-sm font-medium">Institution<select name="university_id" required defaultValue={formValues.university_id} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">{institutions.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.country}</option>)}</select></label>
          <InputField label="Programme name" name="name" required defaultValue={formValues.name} />
          <SelectField label="Degree level" name="degree_level" value={formValues.degree_level} options={['bachelor', 'master']} />
          <InputField label="Subject area" name="subject_area" defaultValue={formValues.subject_area ?? ''} />
          <InputField label="Specialization" name="specialization" defaultValue={formValues.specialization ?? ''} />
          <InputField label="Teaching language" name="teaching_language" required defaultValue={formValues.teaching_language} />
          <InputField label="Duration (semesters)" name="duration_semesters" type="number" min="1" defaultValue={formValues.duration_semesters ?? ''} />
          <InputField label="Tuition / semester (€)" name="tuition_fee_per_semester" type="number" min="0" step="0.01" defaultValue={formValues.tuition_fee_per_semester ?? ''} />
          <InputField label="Semester contribution (€)" name="semester_contribution" type="number" min="0" step="0.01" defaultValue={formValues.semester_contribution ?? ''} />
          <InputField label="Application fee (€)" name="application_fee" type="number" min="0" step="0.01" defaultValue={formValues.application_fee ?? ''} />
          <InputField label="Official programme page" name="official_programme_url" type="url" defaultValue={formValues.official_programme_url ?? ''} />
          <InputField label="Official application page" name="official_application_url" type="url" defaultValue={formValues.official_application_url ?? ''} />
          <SelectField label="Application method" name="application_method" value={formValues.application_method ?? ''} options={['', 'direct', 'uni_assist', 'other']} />
          <SelectField label="Publication status" name="status" value={formValues.status} options={['draft', 'published', 'unpublished', 'archived']} />
          <label className="space-y-1.5 text-sm font-medium sm:col-span-2 lg:col-span-3">Description<textarea name="description" rows={3} defaultValue={formValues.description ?? ''} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" /></label>
        </div>
        <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="outline" onClick={closeForm}>Cancel</Button><Button disabled={saving} className="bg-[#173b5b] text-white hover:bg-[#102c45]">{saving ? 'Saving…' : 'Save programme'}</Button></div>
      </form>}
    </section>

    {listError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{listError}</p>}
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5"><h2 className="font-semibold text-slate-950">All programmes</h2><span className="text-sm text-slate-600" aria-live="polite">Showing {programmeRows.length} of {totalCount}{listLoading ? ' · Loading…' : ''}</span></div>
      {!programmeRows.length ? <p className="p-8 text-center text-sm text-slate-600">{listLoading ? 'Searching programmes…' : 'No programmes match these filters.'}</p> : <ul className="divide-y divide-slate-100">{programmeRows.map((program) => <li key={program.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 gap-3"><span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800"><BookOpen aria-hidden="true" className="h-5 w-5" /></span><div className="min-w-0"><h3 className="font-semibold text-slate-950">{program.name}</h3><p className="mt-0.5 text-sm text-slate-600">{program.university_name} · {program.university_country}</p><p className="mt-1 text-xs capitalize text-slate-500">{program.degree_level} · {program.subject_area || 'Subject area not set'} · {program.status}{program.is_demo ? ' · demo record' : ''}</p></div></div>
        <div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" onClick={() => { setCreating(false); setEditing(program); }}><Pencil aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" />Edit</Button>{canDelete && <Button type="button" size="sm" variant="outline" onClick={() => void remove(program)} className="border-rose-200 text-rose-700 hover:bg-rose-50"><Trash2 aria-hidden="true" className="mr-1.5 h-3.5 w-3.5" />Delete</Button>}</div>
      </li>)}</ul>}
    </div>
    {programmeRows.length < totalCount && <div className="flex justify-center"><Button type="button" variant="outline" disabled={listLoading} onClick={() => void loadMoreProgrammes()}>{listLoading ? 'Loading…' : `Load more programmes (${totalCount - programmeRows.length} remaining)`}</Button></div>}
  </div>;
}

function InputField({ label, name, type = 'text', required, min, step, defaultValue }: { label: string; name: string; type?: string; required?: boolean; min?: string; step?: string; defaultValue?: string | number }) {
  return <label className="space-y-1.5 text-sm font-medium text-slate-800">{label}<Input name={name} type={type} required={required} min={min} step={step} defaultValue={defaultValue} /></label>;
}
function SelectField({ label, name, value, options }: { label: string; name: string; value: string; options: string[] }) {
  return <label className="space-y-1.5 text-sm font-medium text-slate-800">{label}<select name={name} defaultValue={value} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">{options.map((option) => <option key={option || 'none'} value={option}>{option ? option.replaceAll('_', ' ') : 'Select if known'}</option>)}</select></label>;
}
