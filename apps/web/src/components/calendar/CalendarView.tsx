import { toast } from 'sonner';
// @ts-nocheck

import { deleteCalendarEvent, updateCalendarEvent } from '@/lib/api/calendar';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { CalendarModal } from './CalendarModal';

export function CalendarView({
  initialEvents,
  userId,
  userRole,
  availableRoles,
  availableAreas,
  refetchEvents,
}: {
  initialEvents: Record<string, unknown>[];
  userId: string;
  userRole: string;
  availableRoles?: { id: string; name: string }[];
  availableAreas?: { id: string; name: string }[];
  refetchEvents?: () => void;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [localEvents, setLocalEvents] =
    useState<Record<string, unknown>[]>(initialEvents);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Keep localEvents synced with the server
  useEffect(() => {
    setLocalEvents(initialEvents);
  }, [initialEvents]);

  const handleSuccess = () => {
    if (refetchEvents) refetchEvents();
  };

  const handleDelete = async (
    id: string,
    isAuto: boolean,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevenir abrir el modal al intentar borrar
    if (isAuto) {
      toast.error(
        'Este evento se genera automáticamente por una proforma. No se puede eliminar aquí.'
      );
      return;
    }
    if (confirm('¿Estás seguro de eliminar este evento?')) {
      // Optimistic delete
      setLocalEvents((prev) => prev.filter((ev) => ev.id !== id));
      try {
        await deleteCalendarEvent(id);
        handleSuccess();
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Error eliminando evento');
        setLocalEvents(initialEvents); // Revert
      }
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleDayClick = (day: Date) => {
    setSelectedEvent(null);
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  const handleEventClick = (
    e: React.MouseEvent,
    event: Record<string, unknown>
  ) => {
    e.stopPropagation(); // Prevenir click del día
    setSelectedEvent(event);
    setSelectedDate(null);
    setIsModalOpen(true);
  };

  const handleDragStart = (
    e: React.DragEvent,
    event: Record<string, unknown>
  ) => {
    e.stopPropagation();
    e.dataTransfer.setData('eventId', event.id as string);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    e.stopPropagation();
    const eventId = e.dataTransfer.getData('eventId');
    if (!eventId) return;

    const event = initialEvents.find((ev) => ev.id === eventId);
    if (!event) return;

    const originalDate = new Date(event.event_date as string);
    const newDate = new Date(targetDate);
    newDate.setHours(originalDate.getHours(), originalDate.getMinutes(), 0, 0);

    // Optimistic Update for immediate feedback
    setLocalEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId ? { ...ev, event_date: newDate.toISOString() } : ev
      )
    );

    try {
      await updateCalendarEvent(eventId, { event_date: newDate.toISOString() });
      handleSuccess();
      queryClient.invalidateQueries({ queryKey: ['proformas'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (err) {
      toast.error('Error al reprogramar el evento');
      setLocalEvents(initialEvents); // Revert on failure
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-6 bg-slate-900/50 p-4 rounded-2xl border border-white/5 shadow-lg">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-slate-800 hover:text-white rounded-full transition-all hover:scale-110 text-slate-300"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold text-white capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-slate-800 hover:text-white rounded-full transition-all hover:scale-110 text-slate-300"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = 'EEEE';
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Lunes

    for (let i = 0; i < 7; i++) {
      days.push(
        <div
          key={i}
          className="text-center font-semibold text-sm text-slate-400 py-3 uppercase tracking-wider"
        >
          {format(addDays(startDate, i), dateFormat, { locale: es }).substring(
            0,
            3
          )}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;

        // Buscar eventos de este día
        const dayEvents = localEvents.filter((event) =>
          isSameDay(new Date(event.event_date as string), cloneDay)
        );

        days.push(
          <div
            key={day.toString()}
            onClick={() => handleDayClick(cloneDay)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, cloneDay)}
            className={`flex-1 p-2 border-r border-white/5 last:border-r-0 transition-all cursor-pointer group hover:bg-slate-800/60 flex flex-col min-w-0 min-h-0 ${
              !isSameMonth(day, monthStart)
                ? 'bg-slate-950/50 text-slate-600'
                : isSameDay(day, new Date())
                  ? 'bg-emerald-900/10 text-emerald-400 font-bold'
                  : 'bg-slate-900/20 text-slate-300 hover:text-white'
            }`}
          >
            <div className="flex justify-end mb-1">
              <span
                className={`w-7 h-7 flex items-center justify-center rounded-full ${isSameDay(day, new Date()) ? 'bg-emerald-500 text-white' : ''}`}
              >
                {formattedDate}
              </span>
            </div>
            <div className="flex-1 flex flex-col gap-1 overflow-y-auto min-h-0 custom-scrollbar pr-1">
              {dayEvents.map((event: Record<string, unknown>, i) => {
                const isDeadline = event.type === 'PROFORMA_DEADLINE';
                return (
                  <div
                    key={i}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, event)}
                    onClick={(e) => handleEventClick(e, event)}
                    className={`text-xs p-1.5 rounded-md flex items-center border relative cursor-grab active:cursor-grabbing hover:scale-[1.02] hover:brightness-125 transition-all shadow-sm hover:shadow-md hover:z-10 group/event ${
                      isDeadline
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : event.is_auto
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                    title={event.title as string}
                  >
                    <div className="flex-1 min-w-0 overflow-hidden text-ellipsis line-clamp-2">
                      {!isDeadline && (
                        <span className="font-semibold mr-1">
                          {format(
                            new Date(event.event_date as string),
                            'HH:mm'
                          )}
                        </span>
                      )}
                      {event.title as string}
                    </div>

                    {!event.is_auto && (
                      <button
                        onClick={(e) =>
                          handleDelete(event.id, event.is_auto, e)
                        }
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white hover:bg-rose-500 hover:scale-110 transition-all bg-slate-800 rounded p-1 shadow-md"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div
          className="grid grid-cols-7 flex-1 min-h-0 border-b border-white/5 last:border-0"
          key={day.toString()}
        >
          {days}
        </div>
      );
      days = [];
    }
    return (
      <div className="border border-white/5 rounded-2xl overflow-hidden bg-slate-950/20 shadow-xl flex flex-col h-full">
        {rows}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col pb-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-emerald-400" />
            Calendario
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Gestiona tus reuniones, viajes y fechas límite. Haz clic en un día
            para agregar un evento.
          </p>
        </div>
        {userRole === 'ADMIN' && (
          <button
            onClick={() => {
              setSelectedEvent(null);
              setSelectedDate(new Date());
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105 rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
          >
            <Plus className="w-5 h-5" /> Nuevo Evento
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {renderHeader()}
        {renderDays()}
        <div className="flex-1 min-h-0 rounded-2xl">{renderCells()}</div>
      </div>

      <CalendarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        userId={userId}
        userRole={userRole}
        initialDate={selectedDate || undefined}
        existingEvent={selectedEvent}
        availableRoles={availableRoles}
        availableAreas={availableAreas}
      />
    </div>
  );
}
