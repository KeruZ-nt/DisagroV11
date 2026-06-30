import { CustomSelect } from '@/components/ui/CustomSelect';
import { createClientRecord, updateClientRecord } from '@/lib/api/clients';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  User,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type ClientModalProps = {
  isAdmin: boolean;
  salespeople?: { id: string; name: string }[];
  mode?: 'create' | 'edit';
  initialData?: {
    id?: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    location: string;
    assigned_salesperson_id: string;
  };
};

export function ClientModal({
  isAdmin,
  salespeople,
  mode = 'create',
  initialData,
}: ClientModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [data, setData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    company: initialData?.company || '',
    location: initialData?.location || '',
    assigned_salesperson_id: initialData?.assigned_salesperson_id || '',
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const handleSave = async () => {
    setError(null);
    if (!data.name.trim()) {
      setError('El nombre del cliente es obligatorio.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'edit' && initialData?.id) {
        await updateClientRecord(initialData.id, data);
      } else {
        await createClientRecord(data);
      }
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setIsOpen(false);

      // Reset form on success if creating
      if (mode === 'create') {
        setData({
          name: '',
          email: '',
          phone: '',
          company: '',
          location: '',
          assigned_salesperson_id: '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al guardar.');
    } finally {
      setIsLoading(false);
    }
  };

  // Solo el Admin puede ver estos botones para abrir el modal
  if (!isAdmin) return null;

  return (
    <>
      {mode === 'create' ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> Nuevo Cliente
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          title="Editar Cliente"
          className="text-slate-400 hover:text-blue-400 transition-colors p-1.5 rounded hover:bg-blue-500/10"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
      )}

      {isOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
            <div
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-5 border-b border-white/5 bg-slate-950/50">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {mode === 'create'
                    ? 'Registrar Nuevo Cliente'
                    : 'Editar Cliente'}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                    <User className="w-3 h-3" /> Nombre / Contacto Principal
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Ej. Juan Pérez"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Empresa (Opcional)
                  </label>
                  <input
                    type="text"
                    value={data.company}
                    onChange={(e) =>
                      setData({ ...data, company: e.target.value })
                    }
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Ej. Agrícola San Marcos S.A."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Correo
                    </label>
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) =>
                        setData({ ...data, email: e.target.value })
                      }
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Teléfono
                    </label>
                    <div className="flex bg-slate-950/50 border border-white/10 rounded-xl focus-within:ring-1 focus-within:ring-emerald-500">
                      <CustomSelect
                        value={
                          ['+51', '+54', '+56', '+57', '+58', '+593'].find(
                            (p) => data.phone.startsWith(p)
                          ) || '+51'
                        }
                        onChange={(prefix) => {
                          const currentPrefix =
                            ['+51', '+54', '+56', '+57', '+58', '+593'].find(
                              (p) => data.phone.startsWith(p)
                            ) || '+51';
                          const number = data.phone.startsWith(currentPrefix)
                            ? data.phone.slice(currentPrefix.length).trim()
                            : data.phone;
                          setData({ ...data, phone: `${prefix} ${number}`.trim() });
                        }}
                        options={[
                          { value: '+51', code: 'pe' },
                          { value: '+54', code: 'ar' },
                          { value: '+56', code: 'cl' },
                          { value: '+57', code: 'co' },
                          { value: '+58', code: 've' },
                          { value: '+593', code: 'ec' },
                        ].map((c) => ({
                          value: c.value,
                          label: (
                            <div className="flex items-center gap-2">
                              <img
                                src={`https://flagcdn.com/w20/${c.code}.png`}
                                alt={c.code}
                                className="w-5 h-auto rounded-[2px]"
                              />
                              <span>{c.value}</span>
                            </div>
                          ),
                        }))}
                        className="w-[110px] border-r border-white/10 shrink-0"
                        buttonClassName="w-full h-full bg-transparent px-3 py-2.5"
                      />
                      <input
                        type="text"
                        value={
                          (() => {
                            const currentPrefix =
                              ['+51', '+54', '+56', '+57', '+58', '+593'].find(
                                (p) => data.phone.startsWith(p)
                              ) || '+51';
                            return data.phone.startsWith(currentPrefix)
                              ? data.phone.slice(currentPrefix.length).trim()
                              : data.phone;
                          })()
                        }
                        onChange={(e) => {
                          const currentPrefix =
                            ['+51', '+54', '+56', '+57', '+58', '+593'].find(
                              (p) => data.phone.startsWith(p)
                            ) || '+51';
                          setData({
                            ...data,
                            phone: `${currentPrefix} ${e.target.value}`,
                          });
                        }}
                        className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-200 focus:outline-none"
                        placeholder="999 999 999"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Departamento / Localidad
                  </label>
                  <CustomSelect
                    value={data.location}
                    onChange={(val) => setData({ ...data, location: val })}
                    options={[
                      'Amazonas',
                      'Áncash',
                      'Apurímac',
                      'Arequipa',
                      'Ayacucho',
                      'Cajamarca',
                      'Callao',
                      'Cusco',
                      'Huancavelica',
                      'Huánuco',
                      'Ica',
                      'Junín',
                      'La Libertad',
                      'Lambayeque',
                      'Lima',
                      'Loreto',
                      'Madre de Dios',
                      'Moquegua',
                      'Pasco',
                      'Piura',
                      'Puno',
                      'San Martín',
                      'Tacna',
                      'Tumbes',
                      'Ucayali',
                    ].map((dep) => ({ value: dep, label: dep }))}
                    placeholder="Seleccione un departamento..."
                    searchable={true}
                  />
                </div>


                {error && (
                  <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                    {error}
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-white/5 bg-slate-950/30 flex justify-end gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-emerald-500/20"
                >
                  {isLoading ? (
                    'Guardando...'
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Guardar Cliente
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
