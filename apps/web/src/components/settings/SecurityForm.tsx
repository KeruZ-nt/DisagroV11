import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Loader2, Lock, Mail } from 'lucide-react';
import { useState } from 'react';

export function SecurityForm({
  currentEmail,
  userId,
}: {
  currentEmail: string;
  userId: string;
}) {
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !emailPassword) return;

    setIsUpdatingEmail(true);
    try {
      // 1. Verificar contraseña actual re-autenticando
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: emailPassword,
      });
      if (signInError) throw new Error('Contraseña actual incorrecta');

      // 2. Actualizar correo en Auth
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail,
      });
      if (updateError) throw updateError;

      // 3. Actualizar correo en public.users
      const { error: dbError } = await supabase
        .from('users')
        .update({ email: newEmail })
        .eq('id', userId);
      if (dbError) throw dbError;

      toast.success('Correo electrónico actualizado correctamente. Revisa tu bandeja de entrada para verificarlo.');
      setNewEmail('');
      setEmailPassword('');
      setIsEditingEmail(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      toast.success('Contraseña actualizada correctamente.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-emerald-400" />
          Correo Electrónico
        </h3>
        
        {!isEditingEmail ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-400">Correo Actual</label>
              <div className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-slate-300">
                {currentEmail}
              </div>
            </div>
            <button
              onClick={() => setIsEditingEmail(true)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all"
            >
              Cambiar Correo
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-400">Nuevo Correo</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="nuevo@correo.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-400">Contraseña Actual (Requerido)</label>
              <input
                type="password"
                required
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                placeholder="••••••••"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditingEmail(false);
                  setNewEmail('');
                  setEmailPassword('');
                }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isUpdatingEmail || !newEmail || !emailPassword}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUpdatingEmail && <Loader2 className="w-4 h-4 animate-spin" />}
                Actualizar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Formulario de Contraseña */}
      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-emerald-400" />
          Cambiar Contraseña
        </h3>
        <form onSubmit={handleUpdatePassword} className="space-y-4 flex flex-col flex-1">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-400">Nueva Contraseña</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-400">Repetir Nueva Contraseña</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="Repite la nueva contraseña"
            />
          </div>
          <div className="mt-auto pt-4">
            <button
              disabled={isUpdatingPassword || !newPassword || !confirmPassword}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUpdatingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
              Actualizar Contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
