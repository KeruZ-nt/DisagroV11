import { toast } from 'sonner';
import { updateUserProfile } from '@/lib/api/settings';
import { supabase } from '@/lib/supabase';
import { useNavigate } from '@tanstack/react-router';
import { Camera, CheckCircle2, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function ProfileForm({
  profile,
}: {
  profile: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar_url: string | null;
    phone?: string | null;
  };
}) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [toastMessage, setToastMessage] = useState('');
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(profile.id, { name, phone });
      await queryClient.invalidateQueries(); // General invalidation
      setToastMessage('Cambios guardados correctamente.');
    } catch (err) {
      toast.error((err as Error).message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      await updateUserProfile(profile.id, { avatar_url: publicUrl });
      await queryClient.invalidateQueries(); // General invalidation
      setAvatarUrl(publicUrl);
      setToastMessage('Avatar actualizado correctamente.');
    } catch (error) {
      toast.error(`Error al subir imagen: ${(error as Error).message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-[100] flex items-center gap-3 px-5 py-3 bg-slate-900 border border-emerald-500/50 shadow-2xl shadow-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-8 duration-300">
          <CheckCircle2 className="w-5 h-5" />
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
        {/* Avatar Section */}
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-950 shadow-2xl overflow-hidden flex items-center justify-center relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-emerald-400">
                {profile.email.charAt(0).toUpperCase()}
              </span>
            )}

            {/* Overlay para subir */}
            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity">
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <>
                  <Camera className="w-6 h-6 text-white mb-1" />
                  <span className="text-xs font-medium text-white">
                    Cambiar
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*, image/gif"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 space-y-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-400">
                Nombre Completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-400">
                Número de Celular
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. +51 999 999 999"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-400">
                Rol del Sistema
              </label>
              <input
                type="text"
                value={profile.role}
                disabled
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-emerald-500 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving || (name === profile.name && phone === (profile.phone || ''))}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-500/20"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
