import { Pencil, Trash2, Eye, ImageIcon, Star } from 'lucide-react';
import type { Product } from '../../../lib/types';

type Props = {
  products: Product[];
  catName: (id: string) => string;
  onView: (id: string) => void;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
};

/** Admin product list table with image, category, rating, status, and row actions. */
export default function ProductTable({ products, catName, onView, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Code</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Brand</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Rating</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Status</th>
            <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {products.map(p => (
            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => onView(p.id)}>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  {(p.imageUrl || p.imageUrls?.[0]) ? (
                    <img src={p.imageUrl || p.imageUrls![0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" onError={e => (e.currentTarget.style.display = 'none')} />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><ImageIcon size={16} className="text-slate-400" /></div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                      {(p.effectiveDiscount ?? 0) > 0 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-red-50 text-[10px] font-bold text-red-600">{p.effectiveDiscount}% OFF</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 sm:hidden">{catName(p.categoryId)}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 hidden sm:table-cell">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-50 text-xs font-medium text-primary-700">{catName(p.categoryId)}</span>
              </td>
              <td className="px-5 py-4 text-sm text-slate-500 font-mono hidden md:table-cell">{p.productCode || '-'}</td>
              <td className="px-5 py-4 text-sm text-slate-500 hidden lg:table-cell">{p.brand || '-'}</td>
              <td className="px-5 py-4 hidden lg:table-cell">
                {(p.averageRating ?? 0) > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-600 text-white text-xs font-bold">
                      {p.averageRating!.toFixed(1)}<Star size={10} className="fill-white text-white" />
                    </span>
                    <span className="text-[10px] text-slate-400">{p.reviewCount} ratings</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-300">No ratings</span>
                )}
              </td>
              <td className="px-5 py-4 hidden md:table-cell">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${p.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {p.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => onView(p.id)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><Eye size={16} /></button>
                  <button onClick={() => onEdit(p)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><Pencil size={16} /></button>
                  <button onClick={() => onDelete(p)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
