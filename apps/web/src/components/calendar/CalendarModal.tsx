import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CustomTimePicker } from '@/components/ui/CustomTimePicker';
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
} from '@/lib/api/calendar';
import {
  Calendar as CalendarIcon,
  Check,
  Network,
  RefreshCw,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function CalendarModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
  userRole,
  initialDate,
  existingEvent,
  availableRoles = [],
  availableAreas = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userId: string;
  userRole: string;
  initialDate?: Date;
  existingEvent?: Record<string, unknown> | null;
  availableRoles?: { id: string; name: string }[];
  availableAreas: { id: string; name: string }[];
}) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('MEETING');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [eventTime, setEventTime] = useState<string>('');
  const [targetType, setTargetType] = useState<'PERSONAL' | 'ROLE' | 'AREA'>(
    'PERSONAL'
  );
  const [targetRoleId, setTargetRoleId] = useState('');
  const [targetAreaId, setTargetAreaId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();

  const showToast = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3500);
  };

  const isAdmin = userRole === 'ADMIN';

  const handleClose = () => {
    setTitle('');
    setType('MEETING');
    setTargetType('PERSONAL');
    setTargetRoleId('');
    setTargetAreaId('');
    setEventDate(null);
    setEventTime('');
    setError(null);
    setShowDeleteConfirm(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      if (existingEvent) {
        let defaultTitle = (existingEvent.title as string) || '';
        if (existingEvent.is_auto && defaultTitle.startsWith('Vencimiento: ')) {
          defaultTitle = defaultTitle.replace('Vencimiento: ', '');
        }
        setTitle(defaultTitle);
        setType((existingEvent.type as string) || 'MEETING');
        if (existingEvent.target_role_id) {
          setTargetType('ROLE');
          setTargetRoleId(existingEvent.target_role_id as string);
        } else if (existingEvent.target_area_id) {
          setTargetType('AREA');
          setTargetAreaId(existingEvent.target_area_id as string);
        } else {
          setTargetType('PERSONAL');
        }

        const evtDate = new Date(existingEvent.event_date as string);
        setEventDate(evtDate);
        const hours = evtDate.getHours().toString().padStart(2, '0');
        const mins = evtDate.getMinutes().toString().padStart(2, '0');
        setEventTime(`${hours}:${mins}`);
      } else if (initialDate) {
        setEventDate(initialDate);
        const hours = initialDate.getHours().toString().padStart(2, '0');
        const mins = initialDate.getMinutes().toString().padStart(2, '0');
        setEventTime(`${hours}:${mins}`);
      }
    }
  }, [isOpen, initialDate, existingEvent]);

  if (!isOpen) return null;

  const isAuto = existingEvent?.is_auto;

  if (!isAdmin && !existingEvent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={handleClose}
        />
        <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-6 text-center">
          <CalendarIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Creación Restringida
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            Solo los administradores pueden crear eventos o reuniones
            manualmente. Tus fechas de proforma se añaden automáticamente.
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  const handleConfirmDelete = async () => {
    if (!existingEvent || isAuto) return;
    setIsSaving(true);
    try {
      await deleteCalendarEvent(existingEvent.id as string);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setIsSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuto) return handleClose();
    if (!title.trim()) return showToast('El asunto del evento es obligatorio');
    if (!eventDate || !eventTime)
      return showToast('Debes seleccionar una fecha y hora');

    const [hours, minutes] = eventTime.split(':').map(Number);
    const finalDate = new Date(eventDate);
    finalDate.setHours(hours, minutes, 0, 0);
    const dateIso = finalDate.toISOString();

    const roleIdToSend =
      targetType === 'ROLE' && targetRoleId ? targetRoleId : null;
    const areaIdToSend =
      targetType === 'AREA' && targetAreaId ? targetAreaId : null;

    if (existingEvent) {
      const oldTitle = (existingEvent.title as string) || '';
      const oldType = (existingEvent.type as string) || 'MEETING';
      const oldRoleId = (existingEvent.target_role_id as string) || null;
      const oldAreaId = (existingEvent.target_area_id as string) || null;
      const oldDate = new Date(existingEvent.event_date as string);

      const hasChanged =
        title.trim() !== oldTitle.trim() ||
        type !== oldType ||
        finalDate.getTime() !== oldDate.getTime() ||
        roleIdToSend !== oldRoleId ||
        areaIdToSend !== oldAreaId;

      if (!hasChanged) {
        return handleClose();
      }
    }

    setIsSaving(true);
    try {
      if (existingEvent) {
        await updateCalendarEvent(existingEvent.id as string, {
          title: title.trim(),
          type,
          event_date: dateIso,
          target_role_id: roleIdToSend,
          target_area_id: areaIdToSend,
        });
      } else {
        await createCalendarEvent({
          title: title.trim(),
          type,
          event_date: dateIso,
          user_id: userId,
          target_role_id: roleIdToSend,
          target_area_id: areaIdToSend,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const getTitleText = () => {
    if (isAuto) return 'Vencimiento de Proforma';
    const typeName =
      type === 'MEETING' ? 'Reunión' : type === 'TRIP' ? 'Viaje' : 'Evento';
    return existingEvent ? typeName : 'Nuevo Evento';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Toast Notification */}
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-rose-500 text-white px-4 py-2.5 rounded-xl shadow-xl shadow-rose-500/20 text-sm font-medium animate-in slide-in-from-top-4 fade-in flex items-center gap-2 whitespace-nowrap">
            <span>{error}</span>
          </div>
        )}

        {/* Delete Confirmation Screen */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-8 text-center flex-col animate-in fade-in rounded-3xl">
            <Trash2 className="w-12 h-12 text-rose-500 mb-4 animate-in zoom-in" />
            <h3 className="text-xl font-bold text-white mb-2">
              ¿Eliminar Evento?
            </h3>
            <p className="text-slate-400 mb-8 text-sm">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-500 hover:scale-105 text-white rounded-xl transition-all font-medium shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-950/50 rounded-t-3xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-400" />
            {getTitleText()}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 hover:scale-110 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-visible">
          {isAuto && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm">
              Este evento se genera automáticamente. Para cambiar la fecha de
              vencimiento, arrástralo en el calendario principal.
            </div>
          )}

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-400">
                {isAuto ? 'Proforma' : 'Asunto'}
              </label>
              <input
                required
                type="text"
                disabled={!!isAuto}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all disabled:opacity-50"
                placeholder="Ej. Reunión de proyecto..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {!isAuto && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">
                      Tipo
                    </label>
                    <CustomSelect
                      value={type}
                      onChange={setType}
                      options={[
                        { value: 'MEETING', label: 'Reunión' },
                        { value: 'TRIP', label: 'Viaje' },
                        { value: 'PROFORMA_DEADLINE', label: 'Fecha Límite' },
                      ]}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-400">
                      Notificar a
                    </label>
                    <CustomSelect
                      value={targetType}
                      onChange={(val) =>
                        setTargetType(val as 'PERSONAL' | 'AREA' | 'ROLE')
                      }
                      options={[
                        { value: 'PERSONAL', label: 'Solo para mí' },
                        { value: 'AREA', label: 'Un Área completa' },
                        { value: 'ROLE', label: 'Un Rol específico' },
                      ]}
                    />
                  </div>
                </>
              )}

              {targetType === 'AREA' && (
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Network className="w-4 h-4" /> Selecciona Área
                  </label>
                  <CustomSelect
                    value={targetAreaId}
                    onChange={setTargetAreaId}
                    disabled={isAuto}
                    options={
                      availableAreas?.map((a) => ({
                        value: a.id,
                        label: a.name,
                      })) || []
                    }
                    placeholder="Elegir un Área..."
                  />
                </div>
              )}

              {targetType === 'ROLE' && (
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Selecciona Rol
                  </label>
                  <CustomSelect
                    value={targetRoleId}
                    onChange={setTargetRoleId}
                    disabled={isAuto}
                    options={
                      availableRoles?.map((r) => ({
                        value: r.id,
                        label: r.name,
                      })) || []
                    }
                    placeholder="Elegir un Rol..."
                  />
                </div>
              )}

              <div className={`space-y-1 ${isAuto ? 'col-span-2' : ''}`}>
                <label className="text-sm font-medium text-slate-400">
                  Fecha
                </label>
                <div className={isAuto ? 'opacity-50 pointer-events-none' : ''}>
                  <CustomDatePicker
                    selected={eventDate}
                    onChange={(date) => setEventDate(date)}
                    showTimeSelect={false}
                    placeholderText="Seleccionar fecha"
                  />
                </div>
              </div>

              {!isAuto && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-400">
                    Hora
                  </label>
                  <CustomTimePicker time={eventTime} onChange={setEventTime} />
                </div>
              )}
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-white/5 bg-slate-950/30 flex items-center justify-between gap-3 flex-shrink-0 rounded-b-3xl">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl font-medium transition-all mr-auto"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-3">
            {existingEvent && !isAuto && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSaving}
                title="Eliminar Evento"
                className="w-11 h-11 flex items-center justify-center text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white hover:scale-105 rounded-xl transition-all shadow-sm hover:shadow-rose-500/20"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSaving || isAuto}
              title={existingEvent ? 'Actualizar' : 'Crear Evento'}
              className={`w-11 h-11 flex items-center justify-center rounded-xl font-medium transition-all shadow-lg ${
                isAuto
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 hover:scale-105 text-white shadow-emerald-500/20 hover:shadow-emerald-500/40'
              }`}
            >
              {existingEvent ? (
                <RefreshCw className="w-5 h-5" />
              ) : (
                <Check className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
