import { ProfileForm } from '@/components/settings/ProfileForm';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Settings } from 'lucide-react';

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: sessionData } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.user;
    },
  });

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['profile', sessionData?.id],
    enabled: !!sessionData,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*, roles(name)')
        .eq('id', sessionData?.id)
        .maybeSingle();
      if (error) throw error;
      return {
        ...data,
        role: data?.roles?.name || data?.role || 'Usuario',
      };
    },
  });

  if (isLoading) return <div className="p-8 text-white">Cargando...</div>;

  if (error) {
    return (
      <div className="p-8 text-red-500">
        <h2 className="text-xl font-bold">Error cargando perfil</h2>
        <p>{(error as any).message}</p>
      </div>
    );
  }

  if (!profile)
    return (
      <div className="p-8 text-white">
        <h2 className="text-xl font-bold mb-4">
          Perfil no encontrado en la base de datos.
        </h2>
        <p>Asegúrate de que este ID exista en la tabla public.users.</p>
      </div>
    );

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col min-h-0 pb-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-emerald-400" />
            Configuración de Cuenta
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Personaliza tu perfil y preferencias del sistema.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="max-w-4xl space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4">
              Perfil de Usuario
            </h2>
            <ProfileForm profile={profile} />
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Seguridad</h2>
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
              <p className="text-sm text-slate-400">
                La contraseña se gestiona a través del administrador del
                sistema. Para cambiar tu contraseña o credenciales de acceso,
                ponte en contacto con soporte técnico.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
