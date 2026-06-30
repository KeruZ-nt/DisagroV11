// @ts-nocheck

import { createNewDraftFromHistory } from '@/lib/api/clients';
import { getClientHistory } from '@/lib/api/clientsHistory';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  PlusCircle,
  Save,
  X,
  Search,
} from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

import type { Client, Project, User } from '@/types';

export function ClientHistoryModal({
  client,
  salespeople = [],
  onClose,
}: {
  client: Partial<Client>;
  salespeople?: User[];
  onClose: () => void;
}) {
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newSalesperson, setNewSalesperson] = useState(
    client.assigned_salesperson_id || ''
  );
  const [historySearch, setHistorySearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getClientHistory(client.id);
      // Ensure it's sorted by code or date (usually date desc is best, but code works if sequential)
      const sortedData = (data || []).sort(
        (a: Record<string, unknown>, b: Record<string, unknown>) => {
          const aCode = typeof a.code === 'string' ? a.code : '';
          const bCode = typeof b.code === 'string' ? b.code : '';
          if (aCode && bCode) return bCode.localeCompare(aCode);
          const aDate = typeof a.created_at === 'string' ? a.created_at : '';
          const bDate = typeof b.created_at === 'string' ? b.created_at : '';
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        }
      );
      setHistory(sortedData);
    } catch (error) {
      console.error('Error cargando historial', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [client.id]);

  const draftMutation = useMutation({
    mutationFn: async () => {
      if (!newTitle) {
        throw new Error('Debes seleccionar un tipo de trámite.');
      }
      if (!newNotes.trim()) {
        throw new Error('Debes ingresar la descripción o problemática.');
      }
      await createNewDraftFromHistory(
        client.id!,
        newTitle,
        newNotes,
        newSalesperson || client.assigned_salesperson_id
      );
    },
    onSuccess: async () => {
      setNewTitle('');
      setNewNotes('');
      setIsCreatingNew(false);
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      await queryClient.invalidateQueries({ queryKey: ['clientDetails'] });
      await loadHistory();
      toast.success('Borrador generado exitosamente');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al generar borrador');
    },
  });

  const handleCreateNewDraft = () => {
    draftMutation.mutate();
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredHistory = history.filter((p: any) => {
    if (!historySearch) return true;
    const term = historySearch.toLowerCase();
    return (
      (p.title && p.title.toLowerCase().includes(term)) ||
      (p.code && p.code.toLowerCase().includes(term)) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  });

  const getAllowedRole = () => {
    switch (newTitle) {
      case 'Cotización de productos':
        return { role: 'ejecutivo', area: 'ventas' };
      case 'Instalación de sistema':
      case 'Mantenimiento':
      case 'Soporte Técnico':
      case 'Asesoría Técnica':
        return { role: 'especialista', area: 'operaciones' };
      default:
        return null;
    }
  };

  const allowedRoleInfo = getAllowedRole();
  const filteredSalespeople = salespeople.filter((u: User) => {
    if (!allowedRoleInfo) return true; // si no hay regla, mostrar todos
    const matchRole = u.roles?.name
      ?.toLowerCase()
      .includes(allowedRoleInfo.role);
    const matchArea = u.roles?.areas?.name
      ?.toLowerCase()
      .includes(allowedRoleInfo.area);
    return matchRole && matchArea;
  });

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] bg-[#0f172a] border border-white/10 sm:rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95">
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-slate-950/30 shrink-0">
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              {client.code && (
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-sm font-mono">
                  {client.code}
                </span>
              )}
              Historial: {client.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {client.company || 'Sin empresa'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Proformas /
              Proyectos
            </h4>
            <button
              onClick={() => setIsCreatingNew(!isCreatingNew)}
              className="text-xs font-medium bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
            >
              {isCreatingNew ? (
                <X className="w-3.5 h-3.5" />
              ) : (
                <PlusCircle className="w-3.5 h-3.5" />
              )}
              {isCreatingNew ? 'Cancelar' : 'Nuevo Trámite'}
            </button>
          </div>

          {isCreatingNew && (
            <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-5 mb-4 shadow-lg shadow-emerald-500/10 animate-in slide-in-from-top-2">
              <h4 className="text-emerald-400 font-semibold mb-4 text-sm flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Registrar Nuevo Trámite
              </h4>

              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Tipo de Trámite / Asunto
                  </label>
                  <CustomSelect
                    value={newTitle}
                    onChange={setNewTitle}
                    options={[
                      {
                        value: 'Cotización de productos',
                        label: 'Cotización de productos',
                      },
                      {
                        value: 'Instalación de sistema',
                        label: 'Instalación de sistema',
                      },
                      { value: 'Mantenimiento', label: 'Mantenimiento' },
                      { value: 'Soporte Técnico', label: 'Soporte Técnico' },
                      { value: 'Asesoría Técnica', label: 'Asesoría Técnica' },
                      { value: 'Otro', label: 'Otro' },
                    ]}
                    placeholder="Seleccione el asunto..."
                    searchable={true}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Descripción / Problemática
                  </label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[100px] resize-none"
                    placeholder="¿Qué se le va a ofrecer? ¿Qué problema tiene que vamos a resolver?"
                  />
                </div>

                {salespeople.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center justify-between">
                      <span>Asignar Encargado</span>
                      {allowedRoleInfo && (
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">
                          Filtro: {allowedRoleInfo.role} ({allowedRoleInfo.area}
                          )
                        </span>
                      )}
                    </label>
                    <CustomSelect
                      value={newSalesperson}
                      onChange={setNewSalesperson}
                      options={[
                        { value: '', label: '-- Sin asignar --' },
                        ...filteredSalespeople.map((u: User) => ({
                          value: u.id,
                          label: `${u.name} (${u.roles?.name || 'Sin rol'} - ${u.roles?.areas?.name || 'Sin área'})`,
                        })),
                      ]}
                      placeholder={
                        !newTitle
                          ? 'Primero seleccione un Asunto'
                          : 'Seleccionar...'
                      }
                      disabled={!newTitle}
                    />
                    {!newTitle && (
                      <p className="mt-1 text-[10px] text-amber-500/80">
                        Bloqueado hasta elegir tipo de trámite.
                      </p>
                    )}
                  </div>
                )}
              </div>
              {/* Error is now handled by toast */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCreateNewDraft}
                  disabled={draftMutation.isPending}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {draftMutation.isPending ? (
                    'Generando...'
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" /> Generar Borrador
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 bg-white/[0.02] rounded-xl border border-white/5 border-dashed">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-slate-400">
                Este cliente aún no tiene interacciones registradas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Buscar trámite por código o título..."
                  className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {filteredHistory.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-4">
                  No se encontraron trámites con esa búsqueda.
                </p>
              ) : (
                filteredHistory.map((project: Project) => {
                  const isExpanded = expandedId === project.id;
                  return (
                    <div
                      key={project.id}
                      className="bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors"
                    >
                      <div
                        className="flex justify-between items-start p-4 cursor-pointer select-none"
                        onClick={() => toggleExpand(project.id)}
                      >
                        <div className="flex-1">
                          <h5 className="font-medium text-slate-200 flex items-center gap-2">
                            {project.code && (
                              <span className="text-emerald-400 font-mono text-xs bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                {project.code}
                              </span>
                            )}
                            {project.title}
                          </h5>
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />{' '}
                            {new Date(project.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              project.status === 'CONFIRMED'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : project.status === 'CANCELLED'
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {project.status}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 pt-0 border-t border-white/5 bg-slate-950/30 animate-in slide-in-from-top-1">
                          {project.proformas && project.proformas.length > 0 ? (
                            <div className="space-y-2 mt-3">
                              {project.proformas.map((prof: any) => (
                                <div
                                  key={prof.id}
                                  className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5"
                                >
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-emerald-500" />
                                    <div>
                                      {prof.code && (
                                        <p className="text-xs text-slate-500 font-mono mb-0.5">
                                          {prof.code}
                                        </p>
                                      )}
                                      <span className="text-sm font-medium text-emerald-400">
                                        ${Number(prof.total).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                  {prof.generated_file_url ? (
                                    <a
                                      href={prof.generated_file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                      Ver PDF
                                    </a>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded">
                                      Sin PDF
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic mt-3">
                              No se generó proforma (Solo proyecto base)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
