import type { ReactNode } from 'react';
import { Loader2, X } from 'lucide-react';

type Props = {
  open: boolean;
  loading: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/** Sliding right-hand drawer used for product detail on Products & My Products. */
export default function ProductDrawerShell({ open, loading, title, onClose, children }: Props) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-3xl bg-card shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>
          ) : (
            children
          )}
        </div>
      </aside>
    </>
  );
}
