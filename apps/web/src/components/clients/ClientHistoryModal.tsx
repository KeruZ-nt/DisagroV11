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
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function ClientHistoryModal({
  client,
  onClose,
}: {
  client: { id: string; name?: string; assigned_salesperson_id?: string };
  onClose: () => void;
}) {
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newNotes, setNewNotes] = useState('');
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleCreateNewDraft = async () => {
    setError(null);
    if (!newNotes.trim()) {
      setError('Debes ingresar la problemática o consulta.');
      return;
    }
    setIsSavingDraft(true);
    try {
      await createNewDraftFromHistory(
        client.id,
        newNotes,
        client.assigned_salesperson_id
      );
      setNewNotes('');
      setIsCreatingNew(false);
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clientDetails'] });
      await loadHistory();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al generar borrador';
      setError(errorMsg);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-end p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg h-full sm:h-auto sm:max-h-[90vh] bg-[#0f172a] border border-white/10 sm:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-right-10">
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
            <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 mb-4 shadow-lg shadow-emerald-500/10 animate-in slide-in-from-top-2">
              <label className="block text-xs font-medium text-emerald-400 mb-2">
                ¿Cuál es el nuevo asunto de trámite?
              </label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[80px] resize-none mb-3"
                placeholder="Ej. El cliente necesita un nuevo sistema de riego para la hectárea norte..."
              />
              {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCreateNewDraft}
                  disabled={isSavingDraft}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {isSavingDraft ? (
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
              {history.map((project: any) => {
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
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
