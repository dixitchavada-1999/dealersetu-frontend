import { X, Loader2, Calendar, User, CreditCard, Hash } from 'lucide-react';
import type { OrderDetail } from '../../../lib/types';
import { formatCurrencyExact, formatDateTime } from '../../../lib/format';
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, FALLBACK_STATUS } from '../../../constants/orderStatus';

type Props = {
  open: boolean;
  data: OrderDetail | null;
  loading: boolean;
  onClose: () => void;
};

/** Slide-in order detail drawer (status, amounts, timeline, items). */
export default function OrderDrawer({ open, data, loading, onClose }: Props) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside className={`fixed top-0 right-0 z-50 h-full w-full max-w-3xl bg-card shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">{data ? `Order #${data.order.orderNumber}` : 'Order Details'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>
          ) : data ? (
            <DrawerContent data={data} />
          ) : null}
        </div>
      </aside>
    </>
  );
}

function DrawerContent({ data }: { data: OrderDetail }) {
  const { order, items } = data;
  const ss = ORDER_STATUS_CONFIG[order.orderStatus] || FALLBACK_STATUS;
  const ps = PAYMENT_STATUS_CONFIG[order.paymentStatus] || { bg: 'bg-slate-50', text: 'text-slate-600' };
  const fmt = formatCurrencyExact;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium ${ss.bg} ${ss.text}`}>
          <span className={`w-2 h-2 rounded-full ${ss.dot}`} />
          {order.orderStatus}
        </span>
        <div className="flex items-center gap-1.5 text-sm text-slate-500"><Calendar size={14} />{formatDateTime(order.orderDate)}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><User size={14} className="text-slate-400" /><span className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Customer</span></div>
          <p className="text-sm font-semibold text-slate-900">{order.customerName || '-'}</p>
        </div>
        <div className={`rounded-xl p-4 ${ps.bg}`}>
          <div className="flex items-center gap-2 mb-2"><CreditCard size={14} className={ps.text} /><span className={`text-[11px] uppercase tracking-wider font-medium ${ps.text}`}>Payment</span></div>
          <p className={`text-sm font-semibold ${ps.text}`}>{order.paymentStatus}</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3"><span className="text-sm text-slate-500">Total Amount</span><span className="text-lg font-bold text-slate-900">{fmt(order.totalAmount)}</span></div>
        <div className="flex items-center justify-between mb-2"><span className="text-sm text-slate-500">Paid</span><span className="text-sm font-semibold text-emerald-600">{fmt(order.paidAmount)}</span></div>
        {order.totalAmount - order.paidAmount > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-200"><span className="text-sm text-slate-500">Outstanding</span><span className="text-sm font-semibold text-red-600">{fmt(order.totalAmount - order.paidAmount)}</span></div>
        )}
      </div>

      {(order.notes || order.deliveryNotes) && (
        <div className="space-y-2">
          {order.notes && <div className="bg-blue-50 rounded-xl px-4 py-3"><p className="text-[11px] text-blue-600 uppercase tracking-wider font-medium mb-1">Notes</p><p className="text-sm text-blue-800 leading-relaxed">{order.notes}</p></div>}
          {order.deliveryNotes && <div className="bg-amber-50 rounded-xl px-4 py-3"><p className="text-[11px] text-amber-600 uppercase tracking-wider font-medium mb-1">Delivery Notes</p><p className="text-sm text-amber-800 leading-relaxed">{order.deliveryNotes}</p></div>}
        </div>
      )}

      <div className="bg-slate-50 rounded-xl p-4">
        <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mb-3">Timeline</p>
        <div className="space-y-3">
          {[
            { label: 'Placed', date: order.orderDate, color: 'bg-blue-500' },
            { label: 'Approved', date: order.approvedAt, color: 'bg-amber-500' },
            { label: 'Dispatched', date: order.dispatchedAt, color: 'bg-orange-500' },
            { label: 'Delivered', date: order.deliveredAt, color: 'bg-emerald-500' },
          ].map((step, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${step.date ? step.color : 'bg-slate-300'}`} />
              <div className="flex-1 flex items-center justify-between">
                <span className={`text-sm font-medium ${step.date ? 'text-slate-700' : 'text-slate-400'}`}>{step.label}</span>
                <span className={`text-xs ${step.date ? 'text-slate-500' : 'text-slate-300'}`}>{formatDateTime(step.date)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3"><p className="text-sm font-semibold text-slate-900">Items ({items.length})</p></div>
        {items.length === 0 ? (
          <div className="text-center py-6 text-sm text-slate-400">No items</div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item) => (
              <div key={item.id} className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.productName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary-50 text-[10px] font-bold text-primary-700 font-mono"><Hash size={9} />{item.variantSku}</span>
                      <span className="text-[11px] text-slate-400">{item.unit}</span>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-900 shrink-0">{fmt(item.totalPrice)}</p>
                </div>
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-200/60">
                  <span className="text-xs text-slate-500">{item.quantity} x {fmt(item.pricePerUnit)}</span>
                </div>
              </div>
            ))}
            <div className="bg-primary-50 rounded-xl p-4 flex items-center justify-between"><span className="text-sm font-semibold text-primary-700">Grand Total</span><span className="text-lg font-bold text-primary-700">{fmt(order.totalAmount)}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
