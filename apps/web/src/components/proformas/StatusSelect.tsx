import { updateProformaStatus } from '@/lib/api/proformas';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function StatusSelect({
  proformaId,
  currentStatus,
}: { proformaId: string; currentStatus: string }) {
  const queryClient = useQueryClient();
  const dbInitial =
    currentStatus === 'Confirmado'
      ? 'CONFIRMED'
      : currentStatus === 'Cancelado'
        ? 'CANCELLED'
        : 'PENDING';
  const [localStatus, setLocalStatus] = useState(dbInitial);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setLocalStatus(dbInitial);
  }, [dbInitial]);

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value;

    // Optimistic Update
    const prevStatus = localStatus;
    setLocalStatus(newStatus);
    setIsUpdating(true);

    try {
      await updateProformaStatus(proformaId, newStatus);
      queryClient.invalidateQueries({ queryKey: ['proformas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err) {
      toast.error((err as Error).message || 'Error al actualizar el estado');
      setLocalStatus(prevStatus); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative inline-block">
      <select
        value={localStatus}
        onChange={handleStatusChange}
        disabled={isUpdating}
        className={`appearance-none cursor-pointer pl-3 pr-8 py-1 rounded-full text-xs font-medium border focus:outline-none transition-all duration-300 ${
          localStatus === 'CONFIRMED'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
            : localStatus === 'PENDING'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
              : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
        } ${isUpdating ? 'opacity-70 animate-pulse cursor-not-allowed' : ''}`}
      >
        <option value="PENDING" className="bg-slate-900 text-blue-400">
          Pendiente
        </option>
        <option value="CONFIRMED" className="bg-slate-900 text-emerald-400">
          Aprobado
        </option>
        <option value="CANCELLED" className="bg-slate-900 text-red-400">
          Rechazado
        </option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
        <svg
          className={`w-3 h-3 transition-colors ${localStatus === 'CONFIRMED' ? 'text-emerald-500' : localStatus === 'PENDING' ? 'text-blue-500' : 'text-red-500'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
