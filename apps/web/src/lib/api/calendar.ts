import { supabase } from '@/lib/supabase';

export async function getCalendarEvents(userId: string, userRole: string) {
  let query = supabase
    .from('calendar_events')
    .select(`
      id,
      title,
      type,
      event_date,
      related_project_id,
      target_role_id,
      target_area_id,
      user_id
    `);

  if (userRole !== 'ADMIN') {
    query = query.eq('user_id', userId);
  }

  const { data: events, error: eventsError } = await query;

  if (eventsError) console.error('Error fetching events:', eventsError);

  // Mapeamos para indicar si es automático (asumimos que PROFORMA_DEADLINE siempre es auto para evitar eliminarlos)
  const allEvents = (events || []).map((e) => ({
    ...e,
    is_auto: e.type === 'PROFORMA_DEADLINE',
  }));

  return allEvents.sort(
    (a, b) =>
      new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  );
}

export async function createCalendarEvent(eventData: {
  title: string;
  type: string;
  event_date: string;
  user_id: string;
  related_project_id?: string | null;
  target_role_id?: string | null;
  target_area_id?: string | null;
}) {
  const { error } = await supabase.from('calendar_events').insert(eventData);
  if (error) throw new Error(error.message);

  const { notifyAdmin } = await import('./notifications');
  await notifyAdmin(`Nuevo evento programado: ${eventData.title}`, 'calendar');

  return { success: true };
}

export async function deleteCalendarEvent(eventId: string) {
  const { data: existing } = await supabase
    .from('calendar_events')
    .select('type')
    .eq('id', eventId)
    .single();
  if (existing?.type === 'PROFORMA_DEADLINE') {
    throw new Error(
      'No puedes eliminar eventos automáticos de proformas desde el calendario.'
    );
  }

  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', eventId);
  if (error) throw new Error(error.message);

  const { notifyAdmin } = await import('./notifications');
  await notifyAdmin('Un evento del calendario ha sido cancelado.', 'calendar');

  return { success: true };
}

export async function updateCalendarEvent(
  eventId: string,
  eventData: Partial<{
    title: string;
    type: string;
    event_date: string;
    related_project_id?: string | null;
    target_role_id?: string | null;
    target_area_id?: string | null;
  }>
) {
  const { data: existing } = await supabase
    .from('calendar_events')
    .select('type, related_project_id')
    .eq('id', eventId)
    .single();

  const { error } = await supabase
    .from('calendar_events')
    .update(eventData)
    .eq('id', eventId);
  if (error) throw new Error(error.message);

  if (
    existing?.type === 'PROFORMA_DEADLINE' &&
    existing.related_project_id &&
    eventData.event_date
  ) {
    const newDateStr = eventData.event_date.split('T')[0];
    await supabase
      .from('proformas')
      .update({ expiration_date: newDateStr })
      .eq('project_id', existing.related_project_id);
  }

  const { notifyAdmin } = await import('./notifications');
  await notifyAdmin('Un evento ha sido reprogramado o modificado.', 'calendar');

  return { success: true };
}
