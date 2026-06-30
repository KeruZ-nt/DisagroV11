import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function StatsCards({
  totalSales,
  clientsCount,
  pendingProformas,
}: { totalSales: number; clientsCount: number; pendingProformas: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 lg:h-full">
      <div className="p-4 2xl:p-6 border border-white/5 bg-white/5 rounded-2xl shadow-xl backdrop-blur-sm relative overflow-hidden group flex flex-col justify-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
        <p className="text-sm font-medium text-slate-400 mb-1">
          Ventas Confirmadas
        </p>
        <h3 className="text-2xl 2xl:text-3xl font-bold text-white">
          ${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </h3>
        <p className="text-xs text-emerald-400 mt-2 font-medium">
          Histórico general
        </p>
      </div>
      <div className="p-4 2xl:p-6 border border-white/5 bg-white/5 rounded-2xl shadow-xl backdrop-blur-sm relative overflow-hidden group flex flex-col justify-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-colors" />
        <p className="text-sm font-medium text-slate-400 mb-1">
          Clientes Registrados
        </p>
        <h3 className="text-2xl 2xl:text-3xl font-bold text-white">
          {clientsCount}
        </h3>
        <p className="text-xs text-blue-400 mt-2 font-medium">
          Activos en el CRM
        </p>
      </div>
      <div className="p-4 2xl:p-6 border border-white/5 bg-white/5 rounded-2xl shadow-xl backdrop-blur-sm relative overflow-hidden group flex flex-col justify-center">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
        <p className="text-sm font-medium text-slate-400 mb-1">
          Proformas Pendientes
        </p>
        <h3 className="text-2xl 2xl:text-3xl font-bold text-white">
          {pendingProformas}
        </h3>
        <p className="text-xs text-slate-400 mt-2 font-medium">
          A la espera de respuesta
        </p>
      </div>
    </div>
  );
}

export function BalanceChart({ data }: { data: any[] }) {
  return (
    <div className="p-4 2xl:p-6 border border-white/5 bg-white/5 rounded-2xl shadow-xl backdrop-blur-sm flex flex-col h-full">
      <h4 className="text-base font-semibold text-slate-200 mb-4 flex-shrink-0">
        Proformas Confirmadas vs Pendientes
      </h4>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPendientes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ffffff10"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '12px',
                color: '#f1f5f9',
              }}
              itemStyle={{ color: '#f1f5f9' }}
            />
            <Area
              type="monotone"
              name="Confirmadas"
              dataKey="ventas"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorVentas)"
            />
            <Area
              type="monotone"
              name="Pendientes"
              dataKey="pendientes"
              stroke="#f59e0b"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPendientes)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function GrowthChart({ data }: { data: any[] }) {
  return (
    <div className="p-4 2xl:p-6 border border-white/5 bg-white/5 rounded-2xl shadow-xl backdrop-blur-sm flex flex-col h-full">
      <h4 className="text-base font-semibold text-slate-200 mb-4 flex-shrink-0">
        Crecimiento Anual (Confirmadas)
      </h4>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ffffff10"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: '#ffffff05' }}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                borderRadius: '12px',
                color: '#f1f5f9',
              }}
            />
            <Bar
              name="Total"
              dataKey="total"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
