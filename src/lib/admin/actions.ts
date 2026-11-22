'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { loginSchema } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/server';
import { requireAdminAccess, requireFullAdminAccess } from './auth';

const nullableText = z.string().trim().max(5000).nullable().optional();
const nullableUrl = z.string().url().nullable().optional();
const universitySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(250),
  country: z.string().trim().min(2).max(100),
  city: z.string().trim().min(1).max(150),
  institution_type: z.enum(['public', 'private']),
  official_website: nullableUrl,
  admissions_website: nullableUrl,
  description: nullableText,
  is_public: z.boolean(),
});

const programmeSchema = z.object({
  id: z.string().uuid().optional(),
  university_id: z.string().uuid(),
  name: z.string().trim().min(2).max(250),
  degree_level: z.enum(['bachelor', 'master']),
  subject_area: nullableText,
  specialization: nullableText,
  description: nullableText,
  teaching_language: z.string().trim().min(2).max(60),
  duration_semesters: z.number().int().positive().nullable(),
  tuition_fee_per_semester: z.number().min(0).nullable(),
  semester_contribution: z.number().min(0).nullable(),
  application_fee: z.number().min(0).nullable(),
  official_programme_url: nullableUrl,
  official_application_url: nullableUrl,
  application_method: z.enum(['uni_assist', 'direct', 'other']).nullable(),
  status: z.enum(['draft', 'published', 'archived', 'unpublished']),
});

const importRequirementSchema = z.object({
  type: z.string().trim().min(1).max(100),
  description: nullableText,
  mandatory: z.boolean(),
  operator: z.enum(['eq', 'gt', 'gte', 'lt', 'lte', 'contains', 'one_of', 'all_of', 'any_of', 'between']),
  value: nullableText,
  numeric_value: z.number().nullable(),
  unit: nullableText,
  source_url: nullableUrl,
  source_title: nullableText,
});
const importProgrammeSchema = z.object({
  name: z.string().trim().min(2).max(250),
  degree_level: z.enum(['bachelor', 'master']),
  subject_area: nullableText,
  specialization: nullableText,
  description: nullableText,
  teaching_language: z.string().trim().min(2).max(60),
  duration_semesters: z.number().int().positive().nullable(),
  tuition_fee_per_semester: z.number().min(0).nullable(),
  semester_contribution: z.number().min(0).nullable(),
  application_fee: z.number().min(0).nullable(),
  official_programme_url: z.string().url(),
  official_application_url: nullableUrl,
  application_method: z.enum(['uni_assist', 'direct', 'other']).nullable(),
  requirements: z.array(importRequirementSchema).max(100),
});
const importUniversitySchema = z.object({
  name: z.string().trim().min(2).max(250),
  country: z.string().trim().min(2).max(100),
  city: z.string().trim().min(1).max(150),
  institution_type: z.enum(['public', 'private']),
  official_website: z.string().url(),
  admissions_website: nullableUrl,
  description: nullableText,
  is_public: z.boolean(),
  programmes: z.array(importProgrammeSchema).min(1).max(5000),
});

async function writeAudit(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, action: string, entityType: string, entityId: string | null, newValue: unknown, previousValue: unknown = null) {
  await supabase.from('audit_logs').insert({ user_id: userId, action, entity_type: entityType, entity_id: entityId, previous_value: previousValue, new_value: newValue });
}

export async function adminSignIn(input: unknown) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Enter a valid email and password.' };

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);
  if (signInError) return { error: 'Email or password is incorrect.' };

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    : { data: null };
  if (!profile || !['admin', 'editor'].includes(profile.role)) {
    await supabase.auth.signOut();
    return { error: 'This account does not have admin access.' };
  }
  return { success: true };
}

export async function saveUniversity(input: unknown) {
  const parsed = universitySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the institution details.' };
  const { supabase, user } = await requireAdminAccess();
  const { id, ...values } = parsed.data;
  const query = id
    ? supabase.from('universities').update(values).eq('id', id)
    : supabase.from('universities').insert({ ...values, created_by: user.id, is_demo: false });
  const { error } = await query;
  if (error) return { error: error.message };
  await writeAudit(supabase, user.id, id ? 'UPDATE_INSTITUTION' : 'ADD_INSTITUTION', 'university', id ?? null, values);
  revalidatePath('/admin');
  revalidatePath('/admin/universities');
  revalidatePath('/admin/programmes');
  return { success: true };
}

export async function deleteUniversity(id: string) {
  if (!z.string().uuid().safeParse(id).success) return { error: 'Invalid institution.' };
  const { supabase } = await requireFullAdminAccess();
  const { data: previous } = await supabase.from('universities').select('id,name,country,city').eq('id', id).maybeSingle();
  const { error } = await supabase.from('universities').delete().eq('id', id);
  if (error) return { error: error.message };
  await writeAudit(supabase, (await supabase.auth.getUser()).data.user!.id, 'DELETE_INSTITUTION', 'university', id, null, previous);
  revalidatePath('/admin');
  revalidatePath('/admin/universities');
  revalidatePath('/admin/programmes');
  return { success: true };
}

export async function saveProgramme(input: unknown) {
  const parsed = programmeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the programme details.' };
  const { supabase, user } = await requireAdminAccess();
  const { id, ...values } = parsed.data;
  const query = id
    ? supabase.from('programmes').update(values).eq('id', id)
    : supabase.from('programmes').insert({ ...values, created_by: user.id, is_demo: false });
  const { error } = await query;
  if (error) return { error: error.message };
  await writeAudit(supabase, user.id, id ? 'UPDATE_PROGRAMME' : 'ADD_PROGRAMME', 'programme', id ?? null, values);
  revalidatePath('/admin');
  revalidatePath('/admin/programmes');
  revalidatePath('/admin/universities');
  return { success: true };
}

export async function deleteProgramme(id: string) {
  if (!z.string().uuid().safeParse(id).success) return { error: 'Invalid programme.' };
  const { supabase } = await requireFullAdminAccess();
  const { data: previous } = await supabase.from('programmes').select('id,name,university_id,degree_level').eq('id', id).maybeSingle();
  const { error } = await supabase.from('programmes').delete().eq('id', id);
  if (error) return { error: error.message };
  await writeAudit(supabase, (await supabase.auth.getUser()).data.user!.id, 'DELETE_PROGRAMME', 'programme', id, null, previous);
  revalidatePath('/admin');
  revalidatePath('/admin/programmes');
  revalidatePath('/admin/universities');
  return { success: true };
}

export async function importCatalog(input: unknown) {
  const parsed = z.array(importUniversitySchema).min(1).max(500).safeParse(input);
  if (!parsed.success) return { error: `CSV data is invalid: ${parsed.error.issues[0]?.message ?? 'check required fields.'}` };
  const totalProgrammes = parsed.data.reduce((sum, university) => sum + university.programmes.length, 0);
  if (totalProgrammes > 5000) return { error: 'A single import can contain at most 5,000 programmes.' };

  const seenUniversities = new Set<string>();
  const seenProgrammes = new Set<string>();
  for (const university of parsed.data) {
    const institutionKey = `${university.name.toLowerCase()}|${university.country.toLowerCase()}`;
    if (seenUniversities.has(institutionKey)) return { error: `The CSV repeats institution “${university.name}”.` };
    seenUniversities.add(institutionKey);
    for (const programme of university.programmes) {
      const programmeKey = `${institutionKey}|${programme.name.toLowerCase()}|${programme.degree_level}`;
      if (seenProgrammes.has(programmeKey)) return { error: `The CSV repeats programme “${programme.name}”.` };
      seenProgrammes.add(programmeKey);
    }
  }

  const { supabase } = await requireAdminAccess();
  const { data, error } = await supabase.rpc('admin_import_catalog', { p_universities: parsed.data });
  if (error) return { error: error.message };
  const { data: { user } } = await supabase.auth.getUser();
  if (user) await writeAudit(supabase, user.id, 'IMPORT_CATALOG_CSV', 'catalog_import', null, data);
  revalidatePath('/admin');
  revalidatePath('/admin/universities');
  revalidatePath('/admin/programmes');
  return { success: true, counts: data as { universities: number; programmes: number; requirements: number } };
}
