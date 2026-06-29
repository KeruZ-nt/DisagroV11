import {
  clearAllNotifications,
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from '@/lib/api/notifications';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Bell, Check, Trash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Agregamos interfaz para Notification
interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isRinging, setIsRinging] = useState(false);
  const queryClient = useQueryClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadNotifications = async () => {
      try {
        const [notifs, count] = await Promise.all([
          getNotifications(userId),
          getUnreadCount(userId),
        ]);
        if (mounted) {
          setNotifications(notifs);
          setUnreadCount(count);
        }
      } catch (err) {
        console.error('Error loading notifications', err);
      }
    };

    loadNotifications();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (mounted) {
            setNotifications((prev) => [payload.new as Notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            setIsRinging(true);
            setTimeout(() => setIsRinging(false), 3000); // Ring for 3 seconds
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const handleClearAll = async () => {
    await clearAllNotifications(userId);
    setNotifications([]);
    setUnreadCount(0);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const getNotificationLink = (type: string) => {
    if (type === 'cliente') return '/dashboard/clients';
    if (type === 'proforma') return '/dashboard/proformas';
    return '#';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 ${isRinging ? 'animate-[wiggle_1s_ease-in-out_infinite]' : ''}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-[20px] px-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-bold rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-in zoom-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-800/40">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              Notificaciones
            </h3>
            <div className="flex gap-2 items-center">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium transition-colors"
                >
                  Marcar leídas
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors group"
                  title="Limpiar todas"
                >
                  <Trash className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No tienes notificaciones
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.slice(0, 5).map((notif) => {
                  const link = getNotificationLink(notif.type);
                  const isLink = link !== '#';
                  const Content = (
                    <div className="flex gap-3 cursor-pointer p-1">
                      <div
                        className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 transition-colors ${notif.is_read ? 'bg-slate-700' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm leading-relaxed ${notif.is_read ? 'text-slate-400' : 'text-slate-200 font-medium'} hover:text-white transition-colors`}
                        >
                          {notif.message}
                        </p>
                        <p className="text-[11px] font-medium text-slate-500 mt-1.5">
                          {new Date(notif.created_at).toLocaleDateString(
                            'es-ES',
                            {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  );

                  return (
                    <div
                      key={notif.id}
                      className={`p-4 transition-all duration-300 border-l-2 ${notif.is_read ? 'bg-transparent border-transparent' : 'bg-white/[0.03] border-emerald-500'} hover:bg-white/[0.06] group`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        {isLink ? (
                          <Link
                            to={link}
                            onClick={() => {
                              handleMarkAsRead(notif.id);
                              setIsOpen(false);
                            }}
                            className="flex-1"
                          >
                            {Content}
                          </Link>
                        ) : (
                          <div className="flex-1">{Content}</div>
                        )}

                        {!notif.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notif.id);
                            }}
                            title="Marcar como leída"
                            className="text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 p-1.5 rounded-lg flex-shrink-0 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
