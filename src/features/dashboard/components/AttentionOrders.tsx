import { AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';
import type { Order } from '../../../lib/types';
import { formatCurrency, formatShortDate } from '../../../lib/format';
import { ORDER_STATUS_CONFIG, FALLBACK_STATUS } from '../../../constants/orderStatus';
import Card from '../../../components/ui/Card';

type Props = {
  orders: Order[];
  onOpen: (id: string) => void;
  onViewAll: () => void;
};

function attentionReason(order: Order): string {
  if (order.orderStatus === 'Placed') return 'Awaiting Approval';
  if (order.orderStatus === 'Approved') return 'Ready to Dispatch';
  if (order.paymentStatus !== 'Paid') return `Payment ${order.paymentStatus}`;
  return '';
}

/** List of orders that need action (pending / unpaid / in-transit). */
export default function AttentionOrders({ orders, onOpen, onViewAll }: Props) {
  return (
    <Card padding="lg">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Orders Requiring Attention</h2>
            <p className="text-xs text-slate-400">Pending, unpaid, or in-transit orders</p>
          </div>
        </div>
        <button onClick={onViewAll} className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
          View all <ArrowRight size={14} />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={24} className="text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-slate-700">All clear!</p>
          <p className="text-xs text-slate-400 mt-1">No orders need attention right now</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => {
            const cfg = ORDER_STATUS_CONFIG[o.orderStatus] || FALLBACK_STATUS;
            return (
              <div
                key={o.id}
                onClick={() => onOpen(o.id)}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1`} />
                    {o.orderStatus}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{o.customerName || 'Unknown'}</p>
                    <p className="text-xs text-slate-400">{o.orderNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{attentionReason(o)}</p>
                  <p className="text-xs text-slate-400">{formatCurrency(o.totalAmount)} · {formatShortDate(o.orderDate)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
