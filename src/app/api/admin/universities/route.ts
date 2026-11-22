import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAccess } from '@/lib/admin/auth';

const programmeFields = 'id,university_id,name,degree_level,subject_area,specialization,description,teaching_language,duration_semesters,tuition_fee_per_semester,semester_contribution,application_fee,official_programme_url,official_application_url,application_method,status';
const pageSize = 25;

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdminAccess();
    const params = request.nextUrl.searchParams;
    const institutionId = params.get('institution_id');

    if (institutionId) {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(institutionId)) {
        return NextResponse.json({ error: 'Invalid institution.' }, { status: 400 });
      }
      const offset = Math.max(0, Number.parseInt(params.get('offset') ?? '0', 10) || 0);
      const { data, count, error } = await supabase.from('programmes').select(programmeFields, { count: 'exact' })
        .eq('university_id', institutionId).order('name').range(offset, offset + pageSize - 1);
      if (error) return NextResponse.json({ error: 'Could not load programmes.' }, { status: 500 });
      return NextResponse.json({ programmes: data ?? [], total: count ?? 0, offset }, { headers: { 'Cache-Control': 'private, no-store' } });
    }

    const offset = Math.max(0, Number.parseInt(params.get('offset') ?? '0', 10) || 0);
    const rawQuery = params.get('q') ?? '';
    const query = rawQuery.replace(/[^\p{L}\p{N}\s.'-]/gu, '').trim().slice(0, 80);
    let requestQuery = supabase.from('universities')
      .select('id,name,country,city,institution_type,official_website,admissions_website,description,is_public,status,is_demo,federal_state,course_catalog_status,programmes(count)', { count: 'exact' })
      .order('name');
    if (query) requestQuery = requestQuery.or(`name.ilike.%${query}%,city.ilike.%${query}%,country.ilike.%${query}%,federal_state.ilike.%${query}%`);
    const { data, count, error } = await requestQuery.range(offset, offset + pageSize - 1);
    if (error) return NextResponse.json({ error: 'Could not load institutions.' }, { status: 500 });

    const universities = (data ?? []).map((institution) => {
      const programmeCount = Array.isArray(institution.programmes) ? institution.programmes[0]?.count ?? 0 : 0;
      const { programmes: _count, ...details } = institution;
      return { ...details, programme_count: programmeCount, programmes: [] };
    });
    return NextResponse.json({ universities, total: count ?? 0, offset, pageSize }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Admin access is required.' }, { status: 401, headers: { 'Cache-Control': 'private, no-store' } });
  }
}
