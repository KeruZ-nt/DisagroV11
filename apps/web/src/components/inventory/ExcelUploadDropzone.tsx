import { upsertProductsFromExcel } from '@/lib/api/inventory';
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  UploadCloud,
} from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

export function ExcelUploadDropzone() {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatus('idle');
    setMessage('');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON
      // Expected columns: name, description, unit_price, category, stock
      const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (rawJson.length < 2) {
        throw new Error(
          'El archivo excel parece estar vacío o no tiene datos.'
        );
      }

      const headers = (rawJson[0] as string[]).map((h) =>
        String(h).trim().toLowerCase()
      );

      // Mapear filas a objetos
      const products = [];
      for (let i = 1; i < rawJson.length; i++) {
        const row = rawJson[i] as any[];
        if (row.length === 0 || !row[0]) continue; // saltar filas vacías

        const product: any = {};
        headers.forEach((header, index) => {
          if (header === 'nombre' || header === 'name')
            product.name = row[index];
          if (header === 'descripcion' || header === 'description')
            product.description = row[index];
          if (
            header === 'precio' ||
            header === 'precio_unitario' ||
            header === 'unit_price'
          )
            product.unit_price = row[index];
          if (header === 'categoria' || header === 'category')
            product.category = row[index];
          if (header === 'stock' || header === 'cantidad')
            product.stock = row[index];
        });

        if (product.name) products.push(product);
      }

      const result = await upsertProductsFromExcel(products);
      if (result.success) {
        setStatus('success');
        setMessage(`¡${products.length} productos procesados correctamente!`);
      } else {
        throw new Error(result.error || 'Error procesando archivo');
      }
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setMessage(err.message || 'Error al leer el archivo Excel.');
    } finally {
      setIsUploading(false);
      // Reset input value
      e.target.value = '';
    }
  };

  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 transition-colors">
          <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Carga Masiva de Productos
        </h3>
        <p className="text-sm text-slate-400 mb-6 max-w-sm">
          Sube un archivo Excel (.xlsx o .csv) con las columnas: <br />{' '}
          <span className="text-emerald-400 font-mono text-xs">
            nombre, descripcion, precio, categoria, stock
          </span>
        </p>

        <label
          className={`
          relative cursor-pointer flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all shadow-lg
          ${isUploading ? 'bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'}
        `}
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <UploadCloud className="w-5 h-5" />
          )}
          {isUploading ? 'Procesando archivo...' : 'Seleccionar Excel'}
          <input
            type="file"
            className="hidden"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>

        {status === 'success' && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-red-400 bg-red-500/10 px-4 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4" /> {message}
          </div>
        )}
      </div>
    </div>
  );
}
