import { Download, FileText, Plus, Save, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Suspense, lazy } from 'react';
import { ProformaDocument } from './ProformaDocument';

const LazyPDFViewer = lazy(() =>
  import('@react-pdf/renderer').then((mod) => ({ default: mod.PDFViewer }))
);

const PDFViewer = (props: any) => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center h-full text-slate-400">
        Cargando visor PDF interactivo...
      </div>
    }
  >
    <LazyPDFViewer {...props} />
  </Suspense>
);

export type ProformaItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type ProformaData = {
  clientName: string;
  clientEmail: string;
  projectName: string;
  validUntil: string;
  assignedSalespersonId?: string;
  items: ProformaItem[];
};

export function ProformaGenerator({
  userEmail,
  userId,
  isAdmin,
  salespeople,
  initialData,
  proformaId,
  projectId,
  onSuccess,
}: {
  userEmail: string;
  userId: string;
  isAdmin?: boolean;
  salespeople?: { id: string; name: string }[];
  initialData?: ProformaData;
  proformaId?: string;
  projectId?: string;
  onSuccess?: () => void;
}) {
  const [data, setData] = useState<ProformaData>(
    initialData || {
      clientName: '',
      clientEmail: '',
      projectName: '',
      validUntil: '',
      assignedSalespersonId: userId,
      items: [
        {
          id: '1',
          description: 'Sistema de Riego por Goteo (Hectárea)',
          quantity: 1,
          unitPrice: 5000,
        },
      ],
    }
  );
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const addItem = () => {
    setData({
      ...data,
      items: [
        ...data.items,
        {
          id: Math.random().toString(),
          description: '',
          quantity: 1,
          unitPrice: 0,
        },
      ],
    });
  };

  const removeItem = (id: string) => {
    setData({
      ...data,
      items: data.items.filter((item) => item.id !== id),
    });
  };

  const updateItem = (
    id: string,
    field: keyof ProformaItem,
    value: string | number
  ) => {
    setData({
      ...data,
      items: data.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const total = data.items.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0
  );

  const validateForm = () => {
    if (
      !data.clientName.trim() ||
      !data.projectName.trim() ||
      !data.validUntil
    ) {
      setError(
        'Por favor, completa todos los campos principales (Cliente, Proyecto y Fecha de Validez) antes de guardar.'
      );
      return false;
    }

    if (
      data.items.length === 0 ||
      data.items.some((item) => !item.description.trim())
    ) {
      setError('La proforma debe tener al menos un ítem con descripción.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setError(null);
    if (!validateForm()) return;

    try {
      if (proformaId && projectId) {
        const { updateProforma } = await import('@/lib/api/proformas');
        await updateProforma(proformaId, projectId, data, total);
      } else {
        const { saveProforma } = await import('@/lib/api/proformas');
        await saveProforma(data, total, data.assignedSalespersonId || userId);
      }

      setSuccessMsg('¡Proforma guardada con éxito!');

      setTimeout(() => {
        setSuccessMsg(null);
        if (onSuccess) onSuccess();
      }, 2500);
    } catch (err) {
      console.error('Error guardando:', err);
      setError('Hubo un error al guardar en la nube.');
    }
  };

  const handleDownload = async () => {
    setError(null);
    if (!validateForm()) return;

    try {
      const { pdf } = await import('@react-pdf/renderer');
      const blob = await pdf(
        <ProformaDocument data={data} userEmail={userEmail} total={total} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Proforma_${data.clientName || 'Cliente'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error descargando:', err);
      setError('Hubo un error al generar el PDF.');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-0">
      {/* Formulario Dinámico (Izquierda) */}
      <div className="w-full lg:w-[45%] p-6 overflow-y-auto custom-scrollbar border-r border-white/5 flex flex-col">
        <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2 flex-shrink-0">
          <FileText className="w-5 h-5 text-emerald-400" />
          Datos del Cliente y Proyecto
        </h3>

        <div className="space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Cliente / Empresa
              </label>
              <input
                type="text"
                value={data.clientName}
                onChange={(e) =>
                  setData({ ...data, clientName: e.target.value })
                }
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow"
                placeholder="Ej. Hacienda San José"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Correo del Cliente
              </label>
              <input
                type="email"
                value={data.clientEmail}
                onChange={(e) =>
                  setData({ ...data, clientEmail: e.target.value })
                }
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow"
                placeholder="contacto@empresa.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Nombre del Proyecto
              </label>
              <input
                type="text"
                value={data.projectName}
                onChange={(e) =>
                  setData({ ...data, projectName: e.target.value })
                }
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow"
                placeholder="Ej. Instalación de Riego..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Válido Hasta
              </label>
              <input
                type="date"
                value={data.validUntil}
                onChange={(e) =>
                  setData({ ...data, validUntil: e.target.value })
                }
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow [color-scheme:dark]"
              />
            </div>
          </div>

          {isAdmin && salespeople && (
            <div>
              <label className="block text-xs font-medium text-emerald-400 mb-1.5">
                Asignar Vendedor (Solo Admin)
              </label>
              <select
                value={data.assignedSalespersonId}
                onChange={(e) =>
                  setData({ ...data, assignedSalespersonId: e.target.value })
                }
                className="w-full bg-emerald-950/20 border border-emerald-500/20 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow"
              >
                <option value={userId}>Asignarme a mí</option>
                {salespeople.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-6 border-t border-white/5">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-slate-200">
                Ítems del Proyecto
              </label>
              <button
                onClick={addItem}
                className="text-xs px-2 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-md font-medium flex items-center gap-1 hover:bg-emerald-500/20 transition-colors"
              >
                <Plus className="w-3 h-3" /> Agregar Ítem
              </button>
            </div>

            <div className="space-y-4">
              {data.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col xl:flex-row gap-3 items-start xl:items-center bg-white/[0.02] p-3 rounded-xl border border-white/5"
                >
                  <div className="flex-1 w-full xl:w-auto">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, 'description', e.target.value)
                      }
                      placeholder="Descripción del concepto"
                      className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow"
                    />
                  </div>
                  <div className="flex gap-2 w-full xl:w-64 flex-shrink-0">
                    <div className="w-1/3">
                      <input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            'quantity',
                            Number.parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="Cant."
                        className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow"
                      />
                    </div>
                    <div className="w-2/3 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        value={item.unitPrice || ''}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            'unitPrice',
                            Number.parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="P. Unitario"
                        className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 pl-7 pr-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-shadow"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors self-end xl:self-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer del Formulario */}
        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium text-sm">
              Total Estimado:
            </span>
            <span className="text-2xl font-bold text-emerald-400 tracking-tight">
              ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center justify-between">
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleSave}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                if (!data.clientEmail) {
                  setError(
                    'Primero ingresa el correo electrónico del cliente para poder enviar.'
                  );
                  return;
                }
                const subject = encodeURIComponent(
                  `Proforma: ${data.projectName || 'Proyecto Nuevo'}`
                );
                const body = encodeURIComponent(
                  `Hola ${data.clientName || 'Cliente'},\n\nAdjunto los detalles de la proforma correspondiente a su solicitud.\n(No olvides adjuntar el PDF descargado)\n\nAtentamente,\nEquipo de Disagro`
                );
                window.location.href = `mailto:${data.clientEmail}?subject=${subject}&body=${body}`;
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium py-3 rounded-xl transition-all text-sm"
            >
              <Send className="w-4 h-4" />
              Enviar por Correo
            </button>
          </div>
        </div>
      </div>

      {/* Visor PDF en Tiempo Real (Derecha) */}
      <div className="w-full lg:w-[55%] bg-[#525659] h-[500px] lg:h-full flex-shrink-0">
        <PDFViewer width="100%" height="100%" className="border-none">
          <ProformaDocument data={data} userEmail={userEmail} total={total} />
        </PDFViewer>
      </div>
    </div>
  );
}
