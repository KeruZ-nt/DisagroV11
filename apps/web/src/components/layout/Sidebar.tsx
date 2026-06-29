import { cn } from '@/lib/utils';
import { Link, useLocation } from '@tanstack/react-router';
import {
  Calendar,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  Users,
} from 'lucide-react';

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ...(isAdmin
      ? [{ name: 'Proformas', href: '/dashboard/proformas', icon: FileText }]
      : [
          {
            name: 'Mis proformas',
            href: '/dashboard/proformas',
            icon: FileText,
          },
        ]),
    {
      name: 'Inventario Productos',
      href: '/dashboard/inventory',
      icon: Package,
    },
    { name: 'Clientes', href: '/dashboard/clients', icon: Users },
    { name: 'Calendario', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Equipo', href: '/dashboard/team', icon: Users },
    ...(isAdmin
      ? [
          {
            name: 'Gestión / Roles',
            href: '/dashboard/management',
            icon: Settings,
          },
        ]
      : []),
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-slate-950/50 backdrop-blur-xl hidden md:flex flex-col">
      <div className="h-16 flex items-center justify-center px-6 border-b border-white/5">
        <Link to="/dashboard" className="flex items-center drop-shadow-md">
          <img
            src="/logo.png"
            alt="Disagro Perú"
            width={150}
            height={43}
            className="object-contain h-10 w-auto"
          />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isExact =
            item.href === '/dashboard' ? pathname === '/dashboard' : isActive;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium',
                isExact
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  isExact
                    ? 'text-emerald-400'
                    : 'text-slate-500 group-hover:text-slate-300'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
