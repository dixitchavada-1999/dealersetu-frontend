import type { DashboardStats } from '../../../lib/types';
import Card from '../../../components/ui/Card';
import DonutChart, { type DonutSegment } from '../../../components/ui/DonutChart';

type Props = { ordersByStatus: DashboardStats['ordersByStatus']; totalOrders: number };

// Hex equivalents of the ORDER_STATUS_CONFIG dots, for the SVG donut.
const STATUS_HEX: Record<string, string> = {
  Placed: '#3b82f6',
  Approved: '#f59e0b',
  Dispatched: '#f97316',
  Delivered: '#10b981',
  Cancelled: '#ef4444',
};

/** Donut breakdown of orders by status with a legend. */
export default function OrdersDonut({ ordersByStatus, totalOrders }: Props) {
  const entries = Object.entries(ordersByStatus).filter(([, c]) => c > 0);
  const segments: DonutSegment[] = entries.map(([status, count]) => ({
    value: count,
    color: STATUS_HEX[status] ?? '#94a3b8',
    label: status,
  }));

  return (
    <Card padding="lg" className="h-full">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Orders Overview</h2>
      <p className="text-xs text-slate-400 mb-4">Distribution by status</p>

      <div className="flex flex-col items-center">
        <DonutChart segments={segments} centerLabel={String(totalOrders)} centerSub="Total Orders" />

        <div className="w-full mt-5 space-y-2">
          {segments.map((s) => {
            const pct = totalOrders > 0 ? Math.round((s.value / totalOrders) * 100) : 0;
            return (
              <div key={s.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.label}
                </span>
                <span className="text-slate-400">
                  <span className="font-semibold text-slate-700">{s.value}</span> · {pct}%
                </span>
              </div>
            );
          })}
          {segments.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No orders yet</p>}
        </div>
      </div>
    </Card>
  );
}
