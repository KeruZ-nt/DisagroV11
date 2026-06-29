import { supabase } from '@/lib/supabase';

export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
  return data;
}

export async function getUnreadCount(userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) return 0;
  return count || 0;
}

export async function markAsRead(notificationId: string) {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
}

export async function markAllAsRead(userId: string) {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
}

export async function clearAllNotifications(userId: string) {
  await supabase.from('notifications').delete().eq('user_id', userId);
}

// ==========================================
// Funciones Internas para generar alertas automáticas
// ==========================================

export async function notifyAdmin(message: string, type = 'info') {
  // Obtener a todos los administradores
  const { data: admins } = await supabase
    .from('users')
    .select('id, roles!inner(is_system_admin)')
    .eq('roles.is_system_admin', true);

  if (!admins || admins.length === 0) return;

  const adminSupabase = supabase;

  for (const admin of admins) {
    // Verificar si ya existe una notificación idéntica sin leer
    const { data: existing } = await adminSupabase
      .from('notifications')
      .select('id')
      .eq('user_id', admin.id)
      .eq('message', message)
      .eq('is_read', false)
      .maybeSingle();

    if (!existing) {
      await adminSupabase.from('notifications').insert({
        user_id: admin.id,
        message,
        type,
      });
    }
  }
}

export async function notifyUser(
  userId: string,
  message: string,
  type = 'info'
) {
  if (!userId) return;
  const adminSupabase = supabase;

  const { data: existing } = await adminSupabase
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('message', message)
    .eq('is_read', false)
    .maybeSingle();

  if (!existing) {
    const { error } = await adminSupabase.from('notifications').insert({
      user_id: userId,
      message,
      type,
    });
    if (error) {
      console.error('Error inserting notification:', error);
    }
  }
}
