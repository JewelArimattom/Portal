import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin/auth';

const pageSize = 25;
const programmeFields = 'id,university_id,name,degree_level,subject_area,specialization,description,teaching_language,duration_semesters,tuition_fee_per_semester,semester_contribution,application_fee,official_programme_url,official_application_url,application_method,status,requirements_data_status,admission_selectivity,is_demo,universities!inner(name,country)';

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdminAccess();
    const params = request.nextUrl.searchParams;
    const offset = Math.max(0, Number.parseInt(params.get('offset') ?? '0', 10) || 0);
    const query = (params.get('q') ?? '').replace(/[^\p{L}\p{N}\s.'-]/gu, '').trim().replace(/\s+/g, ' ').slice(0, 80);
    const institutionId = params.get('institution_id');
    if (institutionId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(institutionId)) {
      return NextResponse.json({ error: 'Invalid institution.' }, { status: 400 });
    }
    let programmeQuery = supabase.from('programmes').select(programmeFields, { count: 'exact' }).order('name');

    if (query) programmeQuery = programmeQuery.or(`name.ilike.%${query}%,subject_area.ilike.%${query}%`);
    if (institutionId) programmeQuery = programmeQuery.eq('university_id', institutionId);

    const { data, count, error } = await programmeQuery.range(offset, offset + pageSize - 1);
    if (error) return NextResponse.json({ error: 'Could not load programmes.' }, { status: 500 });
    const programmes = (data ?? []).map((row) => {
      const { universities, ...programme } = row;
      const university = (Array.isArray(universities) ? universities[0] : universities) as { name: string; country: string } | undefined;
      return { ...programme, university_name: university?.name ?? '', university_country: university?.country ?? '' };
    });
    return NextResponse.json({ programmes, total: count ?? 0, offset, pageSize }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Admin access is required.' }, { status: 401, headers: { 'Cache-Control': 'private, no-store' } });
  }
}
