import { supabase } from '@/lib/supabase';
import { Loader2, Save, Shield, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { RoleData, TeamMember } from './TeamList';

export function EditRoleModal({
  isOpen,
  onClose,
  member,
  availableRoles,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
  availableRoles: RoleData[];
  onSuccess: () => void;
}) {
  const [roleId, setRoleId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && member) {
      // Find the user's current role_id by matching the name
      // Since member.roles only has name, we need to find it in availableRoles
      const currentRole = availableRoles.find(
        (r) => r.name === member.roles?.name
      );
      if (currentRole) {
        setRoleId(currentRole.id);
      } else {
        setRoleId('');
      }
    }
  }, [isOpen, member, availableRoles]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (!roleId) throw new Error('Debes seleccionar un rol para el usuario.');

      const { error } = await supabase
        .from('users')
        .update({ role_id: roleId })
        .eq('id', member.id);

      if (error) {
        throw new Error(error.message);
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-800/30">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Cambiar Rol
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <p className="text-sm text-slate-400 mb-4">
              Estás modificando los permisos de <strong>{member.name}</strong> (
              {member.email}).
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-400">
              Nueva Área y Rol
            </label>
            <div className="relative">
              <select
                required
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
              >
                <option value="" disabled>
                  Seleccionar un rol...
                </option>
                {availableRoles?.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900">
                    {r.areas?.name} - {r.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-slate-400"
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
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-3 sm:px-5 py-2 text-slate-300 hover:text-white font-medium transition-colors"
              title="Cancelar"
            >
              <X className="w-4 h-4" />{' '}
              <span className="hidden sm:inline">Cancelar</span>
            </button>
            <button
              type="submit"
              disabled={isSaving || !roleId}
              className="flex items-center gap-2 px-3 sm:px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20"
              title={isSaving ? 'Guardando...' : 'Guardar Cambios'}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
