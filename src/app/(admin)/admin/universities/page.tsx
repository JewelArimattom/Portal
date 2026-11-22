import { PageHeader } from '@/components/layout/page-header';
import { AdminUniversitiesManager, type AdminUniversityRow } from '@/components/admin/admin-universities-manager';
import { requireAdminAccess } from '@/lib/admin/auth';

export default async function AdminUniversitiesPage() {
  const { supabase, role } = await requireAdminAccess();
  const { data, count, error } = await supabase.from('universities')
    .select('id,name,country,city,institution_type,official_website,admissions_website,description,is_public,status,is_demo,federal_state,course_catalog_status,programmes(count)', { count: 'exact' })
    .order('name').range(0, 24);
  const institutions: AdminUniversityRow[] = (data ?? []).map((university) => {
    const programmeCount = Array.isArray(university.programmes) ? university.programmes[0]?.count ?? 0 : 0;
    const { programmes: _count, ...details } = university;
    return { ...details, programme_count: programmeCount, programmes: [] };
  });

  return <div className="space-y-6">
    <PageHeader title="Institutions" description="Every institution currently stored in the UniMatch database." breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Institutions' }]} />
    {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Could not load institutions: {error.message}</p> : <AdminUniversitiesManager universities={institutions} totalCount={count ?? 0} canDelete={role === 'admin'} />}
  </div>;
}
