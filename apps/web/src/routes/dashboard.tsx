import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { supabase } from '@/lib/supabase';
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw redirect({ to: '/login' });
    }
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setSessionInfo(user);
      if (user) {
        supabase
          .from('users')
          .select('*, roles(name, is_system_admin)')
          .eq('id', user.id)
          .single()
          .then(({ data: profileData }) => {
            if (profileData) setProfile(profileData);
          });
      }
    });
  }, []);

  if (!sessionInfo) return null;

  const userRole =
    profile?.role ||
    profile?.roles?.name ||
    sessionInfo?.user_metadata?.role ||
    'USER';
  const isAdmin =
    profile?.roles?.is_system_admin ||
    userRole === 'ADMIN' ||
    userRole === 'SUPERADMIN';
  const userName =
    profile?.name || sessionInfo?.user_metadata?.full_name || sessionInfo.email;
  const avatarUrl =
    profile?.avatar_url || sessionInfo?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          userEmail={sessionInfo.email}
          userId={sessionInfo.id}
          userRole={isAdmin ? 'ADMIN' : userRole}
          userName={userName}
          avatarUrl={avatarUrl}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-emerald-500/5 blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col min-h-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
