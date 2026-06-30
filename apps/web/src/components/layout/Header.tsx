import { supabase } from '@/lib/supabase';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  Calendar,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NotificationBell } from './NotificationBell';

export function Header({
  userEmail,
  userRole,
  userId,
  avatarUrl,
  userName,
}: {
  userEmail: string;
  userRole: string;
  userId: string;
  avatarUrl?: string;
  userName?: string;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: '/login' });
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ...(userRole === 'ADMIN' || userRole === 'SUPERADMIN'
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
    ...(userRole === 'ADMIN' || userRole === 'SUPERADMIN'
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
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-white/[0.03] bg-[#020617]/70 backdrop-blur-2xl z-50 sticky top-0 shadow-sm">
      <div className="flex-1 flex items-center gap-4 sm:gap-6">
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link
          to="/dashboard"
          className="flex-shrink-0 drop-shadow-md md:hidden hover:opacity-80 transition-opacity"
        >
          <img
            src="/logo.png"
            alt="Disagro Perú"
            width={140}
            height={40}
            className="object-contain h-8 w-auto"
          />
        </Link>

        <div className="relative w-full max-w-md hidden sm:block group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Buscar proyectos, proformas o clientes..."
            className="w-full bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.1] rounded-full py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:bg-black/20 transition-all placeholder:text-slate-500 shadow-inner"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell userId={userId} />

        <div className="h-6 w-px bg-white/10 mx-1" />

        <div className="relative" ref={menuRef}>
          <div
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 cursor-pointer group hover:bg-white/[0.04] p-1.5 pr-4 rounded-full transition-all border border-transparent hover:border-white/[0.05]"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:border-emerald-500/50 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-bold text-emerald-400">
                  {(userName || userEmail).charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col items-start hidden sm:flex">
              <span className="text-sm font-medium text-slate-200 leading-tight truncate max-w-[180px] group-hover:text-white transition-colors">
                {userName || userEmail}
              </span>
              <span className="text-xs text-emerald-500 font-semibold tracking-wide">
                {userRole === 'ADMIN'
                  ? 'Administrador'
                  : userRole === 'SALES'
                    ? 'Ventas'
                    : userRole}
              </span>
            </div>
          </div>

          {/* Menú Desplegable */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="p-2">
                <Link
                  to="/dashboard/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Configurar Cuenta
                </Link>
                <div className="h-px bg-white/5 my-1 mx-2" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileNavOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] md:hidden">
            <div
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
              <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
                <span className="font-bold text-emerald-400 text-lg">Menu</span>
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileNavOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
