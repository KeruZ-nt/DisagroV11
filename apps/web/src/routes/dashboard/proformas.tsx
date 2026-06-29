import { DownloadPdfButton } from '@/components/proformas/DownloadPdfButton';
import { ProformaModal } from '@/components/proformas/ProformaModal';
import { StatusSelect } from '@/components/proformas/StatusSelect';
import { deleteProforma } from '@/lib/api/proformas';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { FileText, Filter, Search } from 'lucide-react';

export const Route = createFileRoute('/dashboard/proformas')({
  component: ProformasPage,
});

function ProformasPage() {
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

  const { data: salespeople = [] } = useQuery({
    queryKey: ['salespeople'],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await supabase
        .from('users')
        .select('id, name, roles!inner(is_system_admin)')
        .eq('roles.is_system_admin', false);
      return (data as any) || [];
    },
  });

  const { data: proformas = [], refetch } = useQuery({
    queryKey: ['proformas', isAdmin, sessionData?.id],
    enabled: !!sessionData,
    queryFn: async () => {
      let query = supabase
        .from('proformas')
        .select(`
          id,
          total,
          status,
          created_at,
          project_id,
          items,
          expiration_date,
          projects${!isAdmin ? '!inner' : ''} (
            title,
            assigned_salesperson_id,
            clients ( name, email ),
            users ( name )
          )
        `)
        .order('created_at', { ascending: false });

      if (!isAdmin && sessionData?.id) {
        query = query.eq('projects.assigned_salesperson_id', sessionData.id);
      }
      const { data } = await query;

      return (data || []).map((prof: any) => ({
        id: prof.id,
        projectId: prof.project_id,
        client: prof.projects?.clients?.name || 'Cliente sin nombre',
        total: prof.total || 0,
        status:
          prof.status === 'CONFIRMED'
            ? 'Confirmado'
            : prof.status === 'CANCELLED'
              ? 'Cancelado'
              : 'Pendiente',
        date: new Date(prof.created_at).toLocaleDateString('es-ES'),
        salesRep: prof.projects?.users?.name || 'Vendedor',
        rawData: {
          clientName: prof.projects?.clients?.name || '',
          clientEmail: prof.projects?.clients?.email || '',
          projectName: prof.projects?.title || '',
          validUntil: prof.expiration_date || '',
          assignedSalespersonId: prof.projects?.assigned_salesperson_id || '',
          items: prof.items || [],
        },
      }));
    },
  });

  if (!sessionData) return null;

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col min-h-0 pb-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-emerald-400" />
            Proformas
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isAdmin
              ? 'Directorio completo de todas las proformas generadas.'
              : 'Listado de proformas asignadas a tu cuenta.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ProformaModal
            mode="create"
            userEmail={sessionData.email || ''}
            userId={sessionData.id}
            isAdmin={isAdmin}
            salespeople={salespeople}
          />
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 text-sm font-medium transition-colors">
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white/5 border border-white/5 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between flex-shrink-0 bg-slate-950/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por cliente, ID o vendedor..."
              className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Vendedor</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium text-right">
                  Total (USD)
                </th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {proformas.map((prof: any) => (
                <tr
                  key={prof.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-200">
                      {prof.client}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-400">
                      {prof.salesRep}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-400">{prof.date}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-emerald-400">
                      $
                      {prof.total.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusSelect
                      proformaId={prof.id}
                      currentStatus={prof.status}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2 transition-opacity">
                      <DownloadPdfButton
                        proformaData={prof.rawData}
                        total={prof.total}
                        userEmail={sessionData.email || ''}
                      />
                      <ProformaModal
                        mode="edit"
                        userEmail={sessionData.email || ''}
                        userId={sessionData.id}
                        isAdmin={isAdmin}
                        salespeople={salespeople}
                        initialData={prof.rawData}
                        proformaId={prof.id}
                        projectId={prof.projectId}
                      />
                      <button
                        onClick={async () => {
                          toast('¿Eliminar proforma?', {
                            action: {
                              label: 'Eliminar',
                              onClick: async () => {
                                try {
                                  await deleteProforma(prof.id);
                                  refetch();
                                } catch (e) {
                                  toast.error((e as Error).message);
                                }
                              },
                            },
                            cancel: { label: 'Cancelar', onClick: () => {} },
                          });
                        }}
                        title="Eliminar"
                        className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-red-500/10"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {proformas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <FileText className="w-12 h-12 mb-4 opacity-20" />
              <p>No hay proformas registradas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
