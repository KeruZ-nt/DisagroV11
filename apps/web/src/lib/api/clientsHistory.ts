import { supabase } from '@/lib/supabase';

export async function getClientHistory(clientId: string) {
  // Obtener proyectos del cliente, incluyendo sus proformas asignadas
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      code,
      title,
      status,
      created_at,
      assigned_salesperson_id,
      users ( name ),
      proformas (
        id,
        code,
        total,
        status,
        issue_date,
        expiration_date,
        generated_file_url
      )
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching client history:', error);
    throw new Error('No se pudo cargar el historial del cliente');
  }

  return data;
}
