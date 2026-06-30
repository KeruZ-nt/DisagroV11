import { adminAuthClient, supabase } from '@/lib/supabase';
import { useNavigate } from '@tanstack/react-router';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Save,
  UserPlus,
  X,
} from 'lucide-react';
import { useState } from 'react';

export function CreateUserModal({
  isOpen,
  onClose,
  availableRoles,
}: {
  isOpen: boolean;
  onClose: () => void;
  availableRoles?: { id: string; name: string; areas?: { name: string } }[];
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    try {
      if (!roleId) throw new Error('Debes seleccionar un rol para el usuario.');

      // 1. Crear usuario con adminAuthClient (no cierra la sesión actual)
      const { data: authData, error: authError } =
        await adminAuthClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name },
        });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Error desconocido al crear usuario');

      // 2. Insertar en la tabla pública users usando el cliente normal
      const { error: dbError } = await supabase.from('users').insert({
        id: authData.user.id,
        name,
        email,
        role_id: roleId,
      });

      if (dbError) {
        // Rollback
        await adminAuthClient.auth.admin.deleteUser(authData.user.id);
        throw new Error(dbError.message);
      }

      handleClose();
      // Refrescar para ver el nuevo usuario
      window.location.reload();
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRoleId('');
    setErrorMsg('');
    setShowPassword(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-800/30">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            Nuevo Miembro
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{errorMsg}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-400">
              Nombre Completo
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-400">
              Correo Electrónico
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              placeholder="juan@empresa.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-400">
              Contraseña Temporal
            </label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white transition-colors"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-400">
              Área y Rol
            </label>
            <div className="relative">
              <select
                required
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none pr-10"
              >
                <option value="" disabled>
                  Seleccionar un rol...
                </option>
                {availableRoles?.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900">
                    {r.name}
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
              onClick={handleClose}
              className="hidden sm:flex items-center gap-2 px-3 sm:px-5 py-2 text-slate-300 hover:text-white font-medium transition-colors"
              title="Cancelar"
            >
              <X className="w-4 h-4" />{' '}
              <span className="hidden sm:inline">Cancelar</span>
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-3 sm:px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20"
              title={isSaving ? 'Guardando...' : 'Crear Usuario'}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isSaving ? 'Guardando...' : 'Crear Usuario'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
