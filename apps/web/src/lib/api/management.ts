import { adminAuthClient, supabase } from '@/lib/supabase';

export async function getAreasAndRoles() {
  const { data: areas, error: err1 } = await supabase
    .from('areas')
    .select('*')
    .order('name');
  if (err1) throw new Error(err1.message);

  const { data: roles, error: err2 } = await supabase
    .from('roles')
    .select('*, areas(name)')
    .order('name');
  if (err2) throw new Error(err2.message);

  return { areas: areas || [], roles: roles || [] };
}

export async function createArea(name: string) {
  const { error } = await supabase.from('areas').insert({ name });
  if (error) throw new Error(error.message);

  return { success: true };
}

export async function updateArea(id: string, name: string) {
  const { error } = await supabase.from('areas').update({ name }).eq('id', id);
  if (error) throw new Error(error.message);

  return { success: true };
}

export async function deleteArea(id: string) {
  const { error } = await supabase.from('areas').delete().eq('id', id);
  if (error) throw new Error(error.message);

  return { success: true };
}

export async function createRole(
  name: string,
  area_id: string,
  is_system_admin: boolean
) {
  const { error } = await supabase
    .from('roles')
    .insert({ name, area_id, is_system_admin });
  if (error) throw new Error(error.message);

  return { success: true };
}

export async function updateRole(
  id: string,
  name: string,
  area_id: string,
  is_system_admin: boolean
) {
  const { error } = await supabase
    .from('roles')
    .update({ name, area_id, is_system_admin })
    .eq('id', id);
  if (error) throw new Error(error.message);

  return { success: true };
}

export async function deleteRole(id: string) {
  const { error } = await supabase.from('roles').delete().eq('id', id);
  if (error) throw new Error(error.message);

  return { success: true };
}

export async function deleteUser(userId: string) {
  const { error } = await adminAuthClient.auth.admin.deleteUser(userId);
  if (error) throw new Error(`No se pudo eliminar el usuario: ${error.message}`);
  return { success: true };
}
