import { toast } from 'sonner';
import { ExcelUploadDropzone } from '@/components/inventory/ExcelUploadDropzone';
import { ProductModal } from '@/components/inventory/ProductModal';
import { deleteProduct, getProducts } from '@/lib/api/inventory';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Edit, Package, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export const Route = createFileRoute('/dashboard/inventory')({
  component: InventoryPage,
});

function InventoryPage() {
  const { data: products = [], refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      return await getProducts();
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: any) => {
    setModalMode('edit');
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTargetId);
      refetch();
    } catch (err) {
      toast.error(`Error al eliminar producto: ${(err as Error).message}`);
    } finally {
      setIsDeleting(false);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col min-h-0 pb-2">
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Eliminar Producto"
        message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        isConfirming={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-emerald-400" />
            Inventario de Productos
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Gestiona tu base de datos de productos. Sube Excel para actualizar
            en bloque.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-shrink-0 mb-6">
        <div className="lg:col-span-1">
          <ExcelUploadDropzone onUploadComplete={refetch} />
        </div>
        <div className="lg:col-span-2 flex flex-col justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
              <p className="text-sm text-slate-400 font-medium mb-1">
                Total Productos
              </p>
              <p className="text-3xl font-bold text-white">{products.length}</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
              <p className="text-sm text-emerald-400 font-medium mb-1">
                Stock Disponible
              </p>
              <p className="text-3xl font-bold text-emerald-400">
                {products.reduce((acc, p) => acc + (p.stock || 0), 0)}
              </p>
            </div>
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
              {/* Espacio reservado o estadística futura */}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-white/5 border border-white/5 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm flex flex-col">
        <div className="p-4 border-b border-white/5 flex items-center justify-between flex-shrink-0 bg-slate-950/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar producto por nombre..."
              className="w-full bg-black/20 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
            />
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Nuevo Producto Manual
          </button>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Producto</th>
                <th className="px-6 py-4 font-medium">Descripción</th>
                <th className="px-6 py-4 font-medium text-right">
                  Precio Unitario
                </th>
                <th className="px-6 py-4 font-medium text-right">Stock</th>
                <th className="px-6 py-4 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No hay productos en el inventario. Carga un Excel para
                    comenzar.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p
                        className="text-xs text-slate-400 truncate"
                        title={product.description}
                      >
                        {product.description || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-medium text-emerald-400">
                        $
                        {Number(product.unit_price).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`font-medium ${product.stock > 0 ? 'text-slate-300' : 'text-red-400'}`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2 transition-opacity">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                          title="Editar producto"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(product.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ProductModal
          mode={modalMode}
          initialData={selectedProduct}
          productId={selectedProduct?.id}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
