import { AlertTriangle, Check, Loader2, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2 bg-red-500/10 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">{title}</h2>
            </div>
            <button
              onClick={onCancel}
              disabled={isConfirming}
              className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-slate-300 text-sm">{message}</p>
        </div>
        <div className="px-6 py-4 bg-slate-950 flex justify-end gap-3 border-t border-white/5">
          <button
            onClick={onCancel}
            disabled={isConfirming}
            className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
            title={cancelText}
          >
            <X className="w-4 h-4" />{' '}
            <span className="hidden sm:inline">{cancelText}</span>
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50"
            title={confirmText}
          >
            {isConfirming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : confirmText.toLowerCase().includes('eliminar') ? (
              <Trash2 className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
