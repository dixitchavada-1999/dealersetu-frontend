import { IndianRupee, Wallet, Clock, TrendingUp, CheckCircle, PackageCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DashboardStats } from '../../../lib/types';
import { formatCurrency } from '../../../lib/format';
import Card from '../../../components/ui/Card';

type Props = { revenue: DashboardStats['revenue'] };

type Tile = {
  icon: LucideIcon;
  cornerIcon: LucideIcon;
  iconWrap: string;
  iconColor: string;
  cornerColor: string;
  border: string;
  value: number;
  label: string;
};

/** Three-up revenue summary: total, collected, outstanding. */
export default function RevenueBreakdown({ revenue }: Props) {
  const tiles: Tile[] = [
    { icon: IndianRupee, cornerIcon: TrendingUp, iconWrap: 'bg-primary-50', iconColor: 'text-primary-600', cornerColor: 'text-primary-400', border: 'border-primary-100', value: revenue.total, label: 'Total Revenue' },
    { icon: Wallet, cornerIcon: CheckCircle, iconWrap: 'bg-emerald-50', iconColor: 'text-emerald-600', cornerColor: 'text-emerald-400', border: 'border-emerald-100', value: revenue.paid, label: 'Amount Collected' },
    { icon: Clock, cornerIcon: PackageCheck, iconWrap: 'bg-red-50', iconColor: 'text-red-600', cornerColor: 'text-red-400', border: 'border-red-100', value: revenue.outstanding, label: 'Outstanding Amount' },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      {tiles.map((t) => (
        <Card key={t.label} hover className={t.border}>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 ${t.iconWrap} rounded-xl flex items-center justify-center`}>
              <t.icon size={20} className={t.iconColor} strokeWidth={1.8} />
            </div>
            <t.cornerIcon size={16} className={t.cornerColor} />
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(t.value)}</p>
          <p className="text-sm text-slate-500 mt-0.5">{t.label}</p>
        </Card>
      ))}
    </div>
  );
}
