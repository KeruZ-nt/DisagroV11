import { ClientModal } from '@/components/clients/ClientModal';
import { ClientRow } from '@/components/clients/ClientRow';
import { DeleteClientButton } from '@/components/clients/DeleteClientButton';
import { supabase } from '@/lib/supabase';
import type { Client, User as UserType } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Search, User } from 'lucide-react';

export const Route = createFileRoute('/dashboard/clients')({
  component: ClientsPage,
});

function ClientsPage() {
  // Fetch session and admin status
  const { data: sessionData } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.user;
    },
  });

  const { data: isAdmin = false } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      const { data } = await supabase.rpc('is_admin');
      return !!data;
    },
  });

  // Fetch salespeople (if admin)
  const { data: salespeople = [] } = useQuery({
    queryKey: ['salespeople'],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await supabase
        .from('users')
        .select(
          'id, name, email, created_at, roles!inner(name, is_system_admin, areas (name))'
        )
        .eq('roles.is_system_admin', false);
      return (data as unknown as UserType[]) || [];
    },
  });

  // Fetch clients
  const { data: clients = [] } = useQuery({
    queryKey: ['clients', isAdmin, sessionData?.id],
    enabled: !!sessionData,
    queryFn: async () => {
      let query = supabase
        .from('clients')
        .select(`
          id,
          name,
          email,
          phone,
          company,
          notes,
          location,
          status,
          created_at,
          assigned_salesperson_id,
          users ( name )
        `)
        .order('created_at', { ascending: false });

      if (!isAdmin && sessionData?.id) {
        query = query.eq('assigned_salesperson_id', sessionData.id);
      }
      const { data } = await query;
      return (data as unknown as Client[]) || [];
    },
  });

  if (!sessionData) return null;

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col min-h-0 pb-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {isAdmin ? 'Directorio de Clientes' : 'Mis Clientes'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isAdmin
              ? 'Gestión central de toda la cartera y asignaciones.'
              : 'Listado de clientes asignados a tu cuenta.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ClientModal
            isAdmin={isAdmin}
            salespeople={salespeople}
            mode="create"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white/5 border border-white/5 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between flex-shrink-0 bg-slate-950/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, empresa o correo..."
              className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Contacto</th>
                <th className="px-6 py-4 font-medium">Registro</th>
                {isAdmin && (
                  <th className="px-6 py-4 font-medium text-center">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clients.map((client: Client) => (
                <ClientRow
                  key={client.id}
                  client={client}
                  isAdmin={isAdmin}
                  salespeople={salespeople}
                >
                  <ClientModal
                    isAdmin={isAdmin}
                    salespeople={salespeople}
                    mode="edit"
                    initialData={{
                      id: client.id,
                      name: client.name,
                      email: client.email || '',
                      phone: client.phone || '',
                      company: client.company || '',
                      location: client.location || '',
                      assigned_salesperson_id:
                        client.assigned_salesperson_id || '',
                    }}
                  />
                  <DeleteClientButton
                    clientId={client.id}
                    clientName={client.name}
                  />
                </ClientRow>
              ))}
            </tbody>
          </table>

          {clients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <User className="w-12 h-12 mb-4 opacity-20" />
              <p>No hay clientes registrados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
