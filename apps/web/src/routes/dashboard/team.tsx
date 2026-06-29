import { TeamList } from '@/components/team/TeamList';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/team')({
  component: TeamPage,
});

function TeamPage() {
  const { data: isAdmin = false } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      const { data } = await supabase.rpc('is_admin');
      return !!data;
    },
  });

  const { data: team = [] } = useQuery({
    queryKey: ['teamList'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          roles (
            name,
            is_system_admin
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as any) || [];
    },
  });

  const { data: availableRoles = [] } = useQuery({
    queryKey: ['availableRoles'],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await supabase
        .from('roles')
        .select('*')
        .order('name');
      return data || [];
    },
  });

  return (
    <div className="h-full flex flex-col min-h-0 pb-4">
      <TeamList team={team} isAdmin={isAdmin} availableRoles={availableRoles} />
    </div>
  );
}
