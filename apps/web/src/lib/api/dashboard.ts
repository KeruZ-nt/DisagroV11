import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { format, isSameMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export function useDashboardData(userId: string) {
  return useQuery({
    queryKey: ['dashboard', userId],
    queryFn: async () => {
      // 1. Verificar Admin
      const { data: isAdminRes } = await supabase.rpc('is_admin');
      const isAdmin = !!isAdminRes;
      const userRole = isAdmin ? 'ADMIN' : 'SALES';

      // 2. Conteo de clientes
      const { count: clientsCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // 3. Obtener proformas
      let query = supabase
        .from('proformas')
        .select('total, status, issue_date, project_id');

      if (!isAdmin) {
        const { data: myProjects } = await supabase
          .from('projects')
          .select('id')
          .eq('assigned_salesperson_id', userId);

        const myProjectIds = myProjects?.map((p) => p.id) || [];
        if (myProjectIds.length > 0) {
          query = query.in('project_id', myProjectIds);
        } else {
          // If no projects, force an empty result by filtering on null
          query = query.in('project_id', [null]);
        }
      }

      const { data: proformas } = await query;
      const confirmedProformas =
        proformas?.filter((p) => p.status === 'CONFIRMED') || [];
      const pendingProformasList =
        proformas?.filter((p) => p.status === 'PENDING') || [];

      const totalSales = confirmedProformas.reduce(
        (sum, p) => sum + Number(p.total || 0),
        0
      );
      const pendingProformasCount = pendingProformasList.length;

      // 4. Lógica Mensual
      const monthlyData = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthName = format(monthDate, 'MMM', { locale: es }).replace(
          '.',
          ''
        );

        const monthConfirmed = confirmedProformas.filter(
          (p) => p.issue_date && isSameMonth(new Date(p.issue_date), monthDate)
        );
        const sumConfirmed = monthConfirmed.reduce(
          (sum, p) => sum + Number(p.total || 0),
          0
        );

        const monthPending = pendingProformasList.filter(
          (p) => p.issue_date && isSameMonth(new Date(p.issue_date), monthDate)
        );
        const sumPending = monthPending.reduce(
          (sum, p) => sum + Number(p.total || 0),
          0
        );

        monthlyData.push({
          name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
          ventas: sumConfirmed,
          pendientes: sumPending,
        });
      }

      // 5. Lógica Anual
      const annualMap: Record<string, number> = {};
      confirmedProformas.forEach((p) => {
        if (p.issue_date) {
          const year = new Date(p.issue_date).getFullYear().toString();
          annualMap[year] = (annualMap[year] || 0) + Number(p.total || 0);
        }
      });

      const annualData = Object.keys(annualMap)
        .sort()
        .slice(-5)
        .map((year) => ({
          year,
          total: annualMap[year],
        }));
      if (annualData.length === 0) {
        annualData.push({ year: now.getFullYear().toString(), total: 0 });
      }

      // 6. Calendario (Próximos Eventos)
      // Note: Recreating the logic of getCalendarEvents from Supabase.
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).toISOString();
      let eventsQuery = supabase
        .from('calendar_events')
        .select('*')
        .gte('event_date', startOfToday)
        .order('event_date', { ascending: true })
        .limit(10);

      if (!isAdmin) {
        eventsQuery = eventsQuery.eq('user_id', userId);
      }

      const { data: upcomingEvents } = await eventsQuery;

      return {
        isAdmin,
        userRole,
        clientsCount: clientsCount || 0,
        totalSales,
        pendingProformasCount,
        monthlyData,
        annualData,
        upcomingEvents: upcomingEvents || [],
      };
    },
  });
}
