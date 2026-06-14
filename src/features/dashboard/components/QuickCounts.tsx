import { FolderTree, Package, Layers, Users, ShoppingCart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DashboardStats } from '../../../lib/types';
import Card from '../../../components/ui/Card';

type Props = { counts: DashboardStats['counts'] };

/** Row of compact entity-count cards (categories, products, etc.). */
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
        <Card key={c.label} padding="sm" hover>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center shadow-sm`}>
              <c.icon size={18} className="text-white" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{c.value}</p>
              <p className="text-xs text-slate-500">{c.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
