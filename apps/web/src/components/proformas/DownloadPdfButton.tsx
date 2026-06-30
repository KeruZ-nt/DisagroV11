import { FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ProformaDocument } from './ProformaDocument'; // Importación correcta
import type { ProformaData } from './ProformaGenerator';

export function DownloadPdfButton({
  proformaData,
  total,
  userEmail,
}: { proformaData: ProformaData; total: number; userEmail: string }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const blob = await pdf(
        <ProformaDocument
          data={proformaData}
          userEmail={userEmail}
          total={total}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Proforma_${proformaData.clientName || 'Cliente'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generando PDF', error);
      toast.error('Hubo un error al generar el PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      title="Ver / Descargar"
      className="text-slate-400 hover:text-emerald-400 transition-colors p-1.5 rounded hover:bg-emerald-500/10 disabled:opacity-50"
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileText className="w-4 h-4" />
      )}
    </button>
  );
}
