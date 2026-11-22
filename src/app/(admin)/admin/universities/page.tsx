import { PageHeader } from '@/components/layout/page-header';
import { AdminUniversitiesManager, type AdminUniversityRow } from '@/components/admin/admin-universities-manager';
import { requireAdminAccess } from '@/lib/admin/auth';

export default async function AdminUniversitiesPage() {
  const { supabase, role } = await requireAdminAccess();
  const [{ data, error }, { data: programmes, error: programmeError }] = await Promise.all([
    supabase.from('universities').select('id,name,country,city,institution_type,official_website,admissions_website,description,is_public,status,is_demo,federal_state,course_catalog_status').order('name').range(0, 4999),
    supabase.from('programmes').select('id,university_id,name,degree_level,status').order('name').range(0, 9999),
  ]);
  const courseMap = new Map<string, NonNullable<typeof programmes>>();
  for (const programme of programmes ?? []) courseMap.set(programme.university_id, [...(courseMap.get(programme.university_id) ?? []), programme]);
  const institutions: AdminUniversityRow[] = (data ?? []).map((university) => {
    const courses = courseMap.get(university.id) ?? [];
    return { ...university, programme_count: courses.length, programmes: courses.map(({ id, name, degree_level, status }) => ({ id, name, degree_level, status })) };
  });

  return <div className="space-y-6">
    <PageHeader title="Institutions" description="Every institution currently stored in the UniMatch database." breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Institutions' }]} />
    {error || programmeError ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Could not load catalogue data: {(error || programmeError)?.message}</p> : <AdminUniversitiesManager universities={institutions} canDelete={role === 'admin'} />}
  </div>;
}
