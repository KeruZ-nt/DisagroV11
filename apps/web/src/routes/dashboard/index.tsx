import {
  BalanceChart,
  GrowthChart,
  StatsCards,
} from '@/components/dashboard/OverviewCharts';
import { useDashboardData } from '@/lib/api/dashboard';
import { supabase } from '@/lib/supabase';
import { createFileRoute } from '@tanstack/react-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/dashboard/')({
  component: DashboardIndex,
});

function DashboardIndex() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUserId(data.session.user.id);
      }
    });
  }, []);

  const { data, isLoading, error } = useDashboardData(userId || '');

  if (!userId || isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-emerald-400 font-medium">Cargando Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error cargando los datos del dashboard.
      </div>
    );
  }

  const {
    totalSales,
    clientsCount,
    pendingProformasCount,
    monthlyData,
    annualData,
    upcomingEvents,
  } = data!;

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col min-h-0 pb-2 overflow-y-auto lg:overflow-hidden custom-scrollbar">
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Dashboard Principal
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Resumen de actividad y estado financiero.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-medium text-emerald-400">
            Sistema en Línea
          </span>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex gap-6 min-h-0 flex-col lg:flex-row">
        {/* COLUMNA IZQUIERDA (Estadísticas y Gráficos) */}
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          <div className="flex-shrink-0 lg:h-32">
            <StatsCards
              totalSales={totalSales}
              clientsCount={clientsCount}
              pendingProformas={pendingProformasCount}
            />
          </div>

          <div className="flex-1 flex flex-col gap-6 min-h-0">
            <div className="min-h-[300px] lg:flex-1 lg:min-h-0">
              <BalanceChart data={monthlyData} />
            </div>
            <div className="min-h-[300px] lg:flex-1 lg:min-h-0">
              <GrowthChart data={annualData} />
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (Agenda en Fila) */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col min-h-[400px] lg:min-h-0">
          <div className="h-full p-4 2xl:p-6 border border-white/5 bg-white/5 rounded-2xl shadow-xl backdrop-blur-sm flex flex-col min-h-0">
            <h4 className="text-base font-semibold text-slate-200 mb-4 flex-shrink-0">
              Agenda en Fila
            </h4>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
              {upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <p className="text-sm text-slate-400">
                    No hay eventos próximos.
                  </p>
                </div>
              ) : (
                upcomingEvents.map((event: any) => {
                  const date = new Date(event.event_date);
                  let colorClass = '';
                  let initial = '';

                  if (event.type === 'PROFORMA_DEADLINE') {
                    colorClass = 'bg-red-500/20 text-red-400 border-red-500/20';
                    initial = 'PF';
                  } else if (event.type === 'MEETING') {
                    colorClass =
                      'bg-blue-500/20 text-blue-400 border-blue-500/20';
                    initial = 'RN';
                  } else {
                    colorClass =
                      'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
                    initial = 'VJ';
                  }

                  return (
                    <div
                      key={event.id}
                      className="flex flex-col gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]}`}
                        >
                          <span className="font-bold text-xs">{initial}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="font-medium text-white text-sm leading-tight truncate"
                            title={event.title}
                          >
                            {event.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            {event.type === 'PROFORMA_DEADLINE'
                              ? 'Fecha Límite Proforma'
                              : event.type === 'MEETING'
                                ? 'Reunión'
                                : 'Viaje'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p
                          className={`text-xs font-medium ${colorClass.split(' ')[1]}`}
                        >
                          {event.type === 'PROFORMA_DEADLINE'
                            ? format(date, 'dd MMM', { locale: es })
                            : format(date, 'dd MMM, HH:mm', { locale: es })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
