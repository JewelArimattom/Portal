import { PageHeader } from '@/components/layout/page-header';
import { AdminProgrammesManager, type AdminProgrammeRow, type InstitutionOption } from '@/components/admin/admin-programmes-manager';
import { requireAdminAccess } from '@/lib/admin/auth';

export default async function AdminProgrammesPage() {
  const { supabase, role } = await requireAdminAccess();
  const [programmesResult, institutionsResult] = await Promise.all([
    supabase.from('programmes').select('id,university_id,name,degree_level,subject_area,specialization,description,teaching_language,duration_semesters,tuition_fee_per_semester,semester_contribution,application_fee,official_programme_url,official_application_url,application_method,status,requirements_data_status,admission_selectivity,is_demo,universities!inner(name,country)').order('name').range(0, 9999),
    supabase.from('universities').select('id,name,country').order('name').range(0, 4999),
  ]);
  const error = programmesResult.error || institutionsResult.error;
  const programmeRows = (programmesResult.data ?? []) as unknown as Array<Omit<AdminProgrammeRow, 'university_name' | 'university_country'> & { universities: { name: string; country: string } }>;
  const programmes: AdminProgrammeRow[] = programmeRows.map((row) => ({ ...row, university_name: row.universities.name, university_country: row.universities.country }));
  const institutions: InstitutionOption[] = institutionsResult.data ?? [];

  return <div className="space-y-6">
    <PageHeader title="Programmes" description="Add, edit, and review the degree programmes in the database." breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Programmes' }]} />
    {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Could not load programmes: {error.message}</p> : <AdminProgrammesManager programmes={programmes} institutions={institutions} role={role} />}
  </div>;
}
