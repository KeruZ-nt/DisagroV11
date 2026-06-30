import { supabase } from '@/lib/supabase';

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  return data;
}

export async function updateUserProfile(
  userId: string,
  updates: { name?: string; avatar_url?: string; phone?: string | null }
) {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) {
    throw new Error(`Error actualizando perfil: ${error.message}`);
  }

  return { success: true };
}
