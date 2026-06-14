import type { DashboardStats } from '../../../lib/types';
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, FALLBACK_STATUS } from '../../../constants/orderStatus';
import Card from '../../../components/ui/Card';

type Props = {
  ordersByStatus: DashboardStats['ordersByStatus'];
  ordersByPayment: DashboardStats['ordersByPayment'];
  totalOrders: number;
};

/** Detailed order-status grid plus a payment-status breakdown. */
export default function OrdersByStatus({ ordersByStatus, ordersByPayment, totalOrders }: Props) {
  return (
    <Card padding="lg" className="mt-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-5">Orders by Status</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Object.entries(ordersByStatus).map(([status, count]) => {
          const cfg = ORDER_STATUS_CONFIG[status] || FALLBACK_STATUS;
          const pct = totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(0) : '0';
          return (
            <div key={status} className={`${cfg.bg} rounded-xl px-4 py-3.5`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2.5 h-2.5 ${cfg.dot} rounded-full`} />
                <span className="text-xs font-medium text-slate-500">{status}</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{count}</p>
              <p className="text-xs text-slate-400 mt-0.5">{pct}% of total</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-5 border-t border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Payment Status</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(ordersByPayment).map(([status, count]) => {
            const c = PAYMENT_STATUS_CONFIG[status] || { bg: 'bg-slate-50', text: 'text-slate-600' };
            return (
              <div key={status} className={`${c.bg} rounded-xl px-4 py-3 text-center`}>
                <p className={`text-xl font-bold ${c.text}`}>{count}</p>
                <p className="text-xs text-slate-500 mt-0.5">{status}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
