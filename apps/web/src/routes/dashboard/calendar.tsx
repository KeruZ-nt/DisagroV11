import { CalendarView } from '@/components/calendar/CalendarView';
import { getCalendarEvents } from '@/lib/api/calendar';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/calendar')({
  component: CalendarPage,
});

function CalendarPage() {
  const { data: sessionData } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.user;
    },
  });

  const queryClient = useQueryClient();

  const { data: isAdmin = false } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      const { data } = await supabase.rpc('is_admin');
      return !!data;
    },
  });

  const { data: rolesAndAreas } = useQuery({
    queryKey: ['rolesAndAreas'],
    enabled: isAdmin,
    queryFn: async () => {
      const { data: roles } = await supabase
        .from('roles')
        .select('*, areas(name)')
        .order('name');
      const { data: areas } = await supabase
        .from('areas')
        .select('*')
        .order('name');
      return { roles: roles || [], areas: areas || [] };
    },
  });

  const { data: events = [], refetch } = useQuery({
    queryKey: ['calendarEvents', sessionData?.id, isAdmin],
    enabled: !!sessionData,
    queryFn: async () => {
      return await getCalendarEvents(
        sessionData?.id,
        isAdmin ? 'ADMIN' : 'SALES'
      );
    },
  });

  if (!sessionData) return null;

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col min-h-0 pb-2">
      <CalendarView
        initialEvents={events}
        userId={sessionData.id}
        userRole={isAdmin ? 'ADMIN' : 'SALES'}
        availableRoles={rolesAndAreas?.roles || []}
        availableAreas={rolesAndAreas?.areas || []}
        refetchEvents={() => {
          refetch();
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }}
      />
    </div>
  );
}
