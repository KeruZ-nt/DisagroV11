import { toast } from 'sonner';
import { deleteClientRecord } from '@/lib/api/clients';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function DeleteClientButton({
  clientId,
  clientName,
}: { clientId: string; clientName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteClientRecord(clientId);
      setIsOpen(false);
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error(`No se pudo eliminar el cliente. ${(error as Error).message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Eliminar Cliente"
        className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-red-500/10"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 mb-4 mx-auto">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-center text-white mb-2">
                ¿Eliminar cliente?
              </h3>
              <p className="text-center text-slate-400 text-sm mb-6">
                Estás a punto de eliminar permanentemente a{' '}
                <strong className="text-slate-200">{clientName}</strong>. Esta
                acción no se puede deshacer.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 font-medium hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
