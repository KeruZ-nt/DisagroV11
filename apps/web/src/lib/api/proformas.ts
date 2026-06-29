import { supabase } from '@/lib/supabase';

import type { ProformaData } from '@/components/proformas/ProformaGenerator';

export async function saveProforma(
  data: ProformaData,
  total: number,
  userId: string
) {
  // 1. Buscar o Crear Cliente
  let clientId = null;
  if (data.clientName) {
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('name', data.clientName)
      .maybeSingle();

    if (existingClient) {
      clientId = existingClient.id;
    } else {
      const { data: newClient, error: clientErr } = await supabase
        .from('clients')
        .insert({ name: data.clientName, email: data.clientEmail })
        .select('id')
        .single();
      if (newClient) clientId = newClient.id;
    }
  }

  // 2. Crear Proyecto
  const { data: project, error: projectErr } = await supabase
    .from('projects')
    .insert({
      title: data.projectName || 'Proforma de Proyecto',
      client_id: clientId,
      assigned_salesperson_id: userId,
      expected_revenue: total,
      status: 'PENDING',
    })
    .select('id')
    .single();

  if (!project || projectErr) {
    throw new Error(
      `Error creando proyecto: ${projectErr?.message || 'Unknown error'}`
    );
  }

  // 3. Crear Proforma
  const { error: proformaError } = await supabase.from('proformas').insert({
    project_id: project.id,
    items: data.items,
    total: total,
    expiration_date: data.validUntil || null,
    status: 'PENDING',
  });

  if (proformaError) {
    throw new Error(`Error creando proforma: ${proformaError.message}`);
  }

  // 4. Crear evento en el calendario si hay fecha de vencimiento
  if (data.validUntil) {
    await supabase.from('calendar_events').insert({
      title: `Vencimiento: ${data.projectName || 'Proforma'}`,
      type: 'PROFORMA_DEADLINE',
      event_date: new Date(`${data.validUntil}T12:00:00`).toISOString(),
      user_id: data.assignedSalespersonId || userId,
      related_project_id: project.id,
    });
  }

  const { notifyAdmin } = await import('./notifications');
  await notifyAdmin(
    `Nueva proforma generada para el cliente: ${data.clientName}`,
    'proforma'
  );

  return { success: true };
}

export async function updateProforma(
  proformaId: string,
  projectId: string,
  data: ProformaData,
  total: number
) {
  // 1. Actualizar o Crear Cliente
  let clientId = null;
  if (data.clientName) {
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('name', data.clientName)
      .maybeSingle();

    if (existingClient) {
      clientId = existingClient.id;
      await supabase
        .from('clients')
        .update({ email: data.clientEmail })
        .eq('id', clientId);
    } else {
      const { data: newClient } = await supabase
        .from('clients')
        .insert({ name: data.clientName, email: data.clientEmail })
        .select('id')
        .single();
      if (newClient) clientId = newClient.id;
    }
  }

  // 2. Actualizar Proyecto
  await supabase
    .from('projects')
    .update({
      title: data.projectName || 'Proforma de Proyecto',
      client_id: clientId,
      expected_revenue: total,
      ...(data.assignedSalespersonId
        ? { assigned_salesperson_id: data.assignedSalespersonId }
        : {}),
    })
    .eq('id', projectId);

  // 3. Actualizar Proforma
  const { error: proformaError } = await supabase
    .from('proformas')
    .update({
      items: data.items,
      total: total,
      expiration_date: data.validUntil || null,
    })
    .eq('id', proformaId);

  if (proformaError) {
    throw new Error(`Error actualizando proforma: ${proformaError.message}`);
  }

  // 4. Actualizar evento en el calendario
  if (data.validUntil) {
    const { data: existingEvent } = await supabase
      .from('calendar_events')
      .select('id')
      .eq('related_project_id', projectId)
      .eq('type', 'PROFORMA_DEADLINE')
      .maybeSingle();

    if (existingEvent) {
      await supabase
        .from('calendar_events')
        .update({
          event_date: new Date(`${data.validUntil}T12:00:00`).toISOString(),
          title: `Vencimiento: ${data.projectName || 'Proforma'}`,
          user_id:
            data.assignedSalespersonId ||
            (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', existingEvent.id);
    } else {
      await supabase.from('calendar_events').insert({
        title: `Vencimiento: ${data.projectName || 'Proforma'}`,
        type: 'PROFORMA_DEADLINE',
        event_date: new Date(`${data.validUntil}T12:00:00`).toISOString(),
        user_id:
          data.assignedSalespersonId ||
          (await supabase.auth.getUser()).data.user?.id,
        related_project_id: projectId,
      });
    }
  }

  const { notifyAdmin } = await import('./notifications');
  await notifyAdmin(
    `La proforma del proyecto ${data.projectName || 'Proforma'} ha sido modificada.`,
    'proforma'
  );

  return { success: true };
}

export async function deleteProforma(proformaId: string, projectId: string) {
  const { error: projError } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);
  if (projError)
    throw new Error(`Error eliminando proyecto: ${projError.message}`);

  return { success: true };
}

export async function updateProformaStatus(proformaId: string, status: string) {
  const { error } = await supabase
    .from('proformas')
    .update({ status })
    .eq('id', proformaId);

  if (error) {
    throw new Error(`Error actualizando estado: ${error.message}`);
  }

  const { notifyAdmin } = await import('./notifications');
  await notifyAdmin(
    `El estado de una proforma ha sido cambiado a: ${status}`,
    'info'
  );

  return { success: true };
}
