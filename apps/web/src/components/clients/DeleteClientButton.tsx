import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { deleteClientRecord } from '@/lib/api/clients';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function DeleteClientButton({
  clientId,
  clientName,
}: { clientId: string; clientName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteClientRecord(clientId);
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsOpen(false);
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error(
        `No se pudo eliminar el cliente. ${(error as Error).message}`
      );
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

      <ConfirmModal
        isOpen={isOpen}
        title="¿Eliminar cliente?"
        message={`Estás a punto de eliminar permanentemente a ${clientName}. Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsOpen(false)}
      />
    </>
  );
}
