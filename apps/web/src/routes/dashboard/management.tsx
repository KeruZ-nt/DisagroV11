import { ManagementView } from '@/components/management/ManagementView';
import { getAreasAndRoles } from '@/lib/api/management';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/management')({
  beforeLoad: async () => {
    const { data: is_admin } = await supabase.rpc('is_admin');
    if (!is_admin) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: ManagementPage,
});

function ManagementPage() {
  const { data = { areas: [], roles: [] } } = useQuery({
    queryKey: ['managementAreasAndRoles'],
    queryFn: async () => {
      return await getAreasAndRoles();
    },
  });

  return (
    <div className="animate-in fade-in duration-500 h-full">
      <ManagementView areas={data.areas} roles={data.roles} />
    </div>
  );
}
