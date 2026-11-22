import { createClient } from '@/lib/supabase/server';

export async function requireAdminAccess() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Please sign in with an administrator account.');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (error || !profile || !['admin', 'editor'].includes(profile.role)) {
    throw new Error('You do not have permission to manage the catalogue.');
  }

  return { supabase, user, role: profile.role };
}

export async function requireFullAdminAccess() {
  const access = await requireAdminAccess();
  if (access.role !== 'admin') throw new Error('Only administrators can delete catalogue records.');
  return access;
}
