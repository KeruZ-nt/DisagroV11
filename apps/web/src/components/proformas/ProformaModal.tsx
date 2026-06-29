import { useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ProformaGenerator } from './ProformaGenerator';
import type { ProformaData } from './ProformaGenerator';

type ProformaModalProps = {
  userEmail: string;
  userId: string;
  isAdmin?: boolean;
  salespeople?: { id: string; name: string }[];
  mode?: 'create' | 'edit';
  initialData?: ProformaData;
  proformaId?: string;
  projectId?: string;
};

export function ProformaModal({
  userEmail,
  userId,
  isAdmin,
  salespeople,
  mode = 'create',
  initialData,
  proformaId,
  projectId,
}: ProformaModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <>
      {mode === 'create' ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> Nueva Proforma
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          title="Editar"
          className="text-slate-400 hover:text-blue-400 transition-colors p-1.5 rounded hover:bg-blue-500/10"
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
      )}

      {isOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <div className="relative w-full max-w-7xl h-[90vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
              {/* Header del Modal */}
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-950/50 flex-shrink-0">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {mode === 'create'
                    ? 'Crear Nueva Proforma'
                    : 'Editar Proforma'}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenido (El Generador) */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <ProformaGenerator
                  userEmail={userEmail}
                  userId={userId}
                  isAdmin={isAdmin}
                  salespeople={salespeople}
                  initialData={initialData}
                  proformaId={proformaId}
                  projectId={projectId}
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ['proformas'] });
                    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
                    setIsOpen(false);
                  }}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
