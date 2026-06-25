import { FolderTree, Package, Layers, Users, ShoppingCart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DashboardStats } from '../../../lib/types';

type Props = { counts: DashboardStats['counts'] };

/** Row of compact entity-count tiles (categories, products, etc.). */
export default function QuickCounts({ counts }: Props) {
  const items: { label: string; value: number; icon: LucideIcon; color: string }[] = [
    { label: 'Categories', value: counts.categories ?? 0, icon: FolderTree, color: 'bg-violet-600' },
    { label: 'Products', value: counts.products ?? 0, icon: Package, color: 'bg-blue-600' },
    { label: 'Variants', value: counts.variants ?? 0, icon: Layers, color: 'bg-teal-600' },
    { label: 'Customers', value: counts.customers ?? 0, icon: Users, color: 'bg-emerald-600' },
    { label: 'Orders', value: counts.orders, icon: ShoppingCart, color: 'bg-amber-600' },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {items.map((c) => (
        <div
          key={c.label}
          className="bg-card rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className={`w-11 h-11 ${c.color} rounded-xl flex items-center justify-center shadow-sm`}>
            <c.icon size={18} className="text-white" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 leading-none">{c.value}</p>
            <p className="text-xs text-slate-500 mt-1">{c.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
