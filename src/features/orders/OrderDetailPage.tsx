import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Calendar, User, CreditCard, Hash, CheckCircle, Truck, PackageCheck, XCircle, Edit3, IndianRupee, Clock } from 'lucide-react';
import { ordersApi, extractError } from '../../lib/api';
import type { OrderDetail as OrderDetailType, OrderStatus } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, FALLBACK_STATUS } from '../../constants/orderStatus';
import { formatCurrencyExact, formatDateTime } from '../../lib/format';
import toast from '../../lib/toast';

const fmt = formatCurrencyExact;
const fmtDate = formatDateTime;

/** Full order detail page — status workflow, payments, notes, charges, items. */
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAdmin, isDispatch, isProduction, isMarketing } = useAuth();
  const isCustomer = !isAdmin && !isDispatch && !isProduction && !isMarketing;

  const [data, setData] = useState<OrderDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editDeliveryNotes, setEditDeliveryNotes] = useState('');
  const [chargesOpen, setChargesOpen] = useState(false);
  const [editCourierCharge, setEditCourierCharge] = useState('');
  const [editAdditionalDiscount, setEditAdditionalDiscount] = useState('');
  const [editAdditionalCharge, setEditAdditionalCharge] = useState('');
  const [editAdditionalChargeNote, setEditAdditionalChargeNote] = useState('');

  const loadOrder = () => {
    if (!id) return;
    ordersApi.getById(id).then(setData).catch((err) => toast.error(extractError(err))).finally(() => setLoading(false));
  };
  useEffect(() => { loadOrder(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  const updateStatus = async (newStatus: OrderStatus) => {
    if (!data) return;
    setActionLoading(true);
    try { await ordersApi.update(data.order.id, { orderStatus: newStatus }); toast.success(`Order ${newStatus.toLowerCase()}`); loadOrder(); }
    catch (err: any) { toast.error(extractError(err)); }
    finally { setActionLoading(false); }
  };
  const handleCancel = async () => {
    if (!data) return;
    setActionLoading(true);
    try { await ordersApi.delete(data.order.id); toast.success('Order cancelled'); loadOrder(); setCancelOpen(false); }
    catch (err: any) { toast.error(extractError(err)); }
    finally { setActionLoading(false); }
  };
  const handlePaymentUpdate = async () => {
    if (!data) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return toast.error('Enter a valid amount');
    setActionLoading(true);
    try { await ordersApi.update(data.order.id, { paidAmount: data.order.paidAmount + amount } as any); toast.success('Payment updated'); setPaymentOpen(false); setPaymentAmount(''); loadOrder(); }
    catch (err: any) { toast.error(extractError(err)); }
    finally { setActionLoading(false); }
  };
  const handleNotesUpdate = async () => {
    if (!data) return;
    setActionLoading(true);
    try { await ordersApi.update(data.order.id, { notes: editNotes, deliveryNotes: editDeliveryNotes } as any); toast.success('Notes updated'); setNotesOpen(false); loadOrder(); }
    catch (err: any) { toast.error(extractError(err)); }
    finally { setActionLoading(false); }
  };
  const openChargesEdit = () => {
    if (!data) return;
    setEditCourierCharge((data.order.courierCharge || 0).toString());
    setEditAdditionalDiscount((data.order.additionalDiscount || 0).toString());
    setEditAdditionalCharge((data.order.additionalCharge || 0).toString());
    setEditAdditionalChargeNote(data.order.additionalChargeNote || '');
    setChargesOpen(true);
  };
  const handleChargesUpdate = async () => {
    if (!data) return;
    setActionLoading(true);
    try {
      await ordersApi.editCharges(data.order.id, { courierCharge: parseFloat(editCourierCharge) || 0, additionalDiscount: parseFloat(editAdditionalDiscount) || 0, additionalCharge: parseFloat(editAdditionalCharge) || 0, additionalChargeNote: editAdditionalChargeNote });
      toast.success('Charges updated'); setChargesOpen(false); loadOrder();
    } catch (err: any) { toast.error(extractError(err)); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>;
  if (!data) return <EmptyState title="Order not found" />;

  const { order, items } = data;
  const ss = ORDER_STATUS_CONFIG[order.orderStatus] || FALLBACK_STATUS;
  const ps = PAYMENT_STATUS_CONFIG[order.paymentStatus] || { bg: 'bg-slate-50', text: 'text-slate-600' };
  const outstanding = order.totalAmount - order.paidAmount;
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const timelineSteps = [
    { label: 'Placed', date: order.orderDate, color: 'bg-blue-500', ring: 'ring-blue-200' },
    { label: 'Approved', date: order.approvedAt, color: 'bg-amber-500', ring: 'ring-amber-200' },
    { label: 'Dispatched', date: order.dispatchedAt, color: 'bg-orange-500', ring: 'ring-orange-200' },
    { label: 'Delivered', date: order.deliveredAt, color: 'bg-emerald-500', ring: 'ring-emerald-200' },
  ];

  const inputCls = 'w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm';

  return (
    <div>
      <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 font-medium transition-colors"><ArrowLeft size={16} /> Back to Orders</Link>

      <div className="bg-card rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Order #{order.orderNumber}</h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500"><Calendar size={14} /><span>Placed on {fmtDate(order.orderDate)}</span></div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium ${ss.bg} ${ss.text}`}><span className={`w-2 h-2 rounded-full ${ss.dot}`} />{order.orderStatus}</span>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium ${ps.bg} ${ps.text}`}>{order.paymentStatus}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 rounded-xl p-4"><div className="flex items-center gap-2 mb-1.5"><User size={14} className="text-slate-400" /><span className="text-xs text-slate-500">Customer</span></div><p className="text-sm font-semibold text-slate-900">{order.customerName || '-'}</p></div>
          <div className="bg-slate-50 rounded-xl p-4"><div className="flex items-center gap-2 mb-1.5"><IndianRupee size={14} className="text-slate-400" /><span className="text-xs text-slate-500">Total</span></div><p className="text-lg font-bold text-slate-900">{fmt(order.totalAmount)}</p></div>
          <div className="bg-emerald-50 rounded-xl p-4"><div className="flex items-center gap-2 mb-1.5"><CheckCircle size={14} className="text-emerald-500" /><span className="text-xs text-emerald-600">Paid</span></div><p className="text-lg font-bold text-emerald-700">{fmt(order.paidAmount)}</p></div>
          <div className={`rounded-xl p-4 ${outstanding > 0 ? 'bg-amber-50' : 'bg-emerald-50'}`}><div className="flex items-center gap-2 mb-1.5"><Clock size={14} className={outstanding > 0 ? 'text-amber-500' : 'text-emerald-500'} /><span className={`text-xs ${outstanding > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>Outstanding</span></div><p className={`text-lg font-bold ${outstanding > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>{fmt(outstanding)}</p></div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mb-4">Timeline</p>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-3 left-6 right-6 h-0.5 bg-slate-200" />
            <div className="absolute top-3 left-6 h-0.5 bg-emerald-400" style={{ width: `${Math.max(0, (timelineSteps.filter((s) => s.date).length - 1) / (timelineSteps.length - 1) * 100)}%`, maxWidth: 'calc(100% - 48px)' }} />
            {timelineSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center relative z-10" style={{ flex: 1 }}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step.date ? step.color : 'bg-slate-300'} ${step.date ? `ring-4 ${step.ring}` : ''}`}>{step.date && <CheckCircle size={12} className="text-white" />}</div>
                <span className={`text-xs font-medium mt-2 ${step.date ? 'text-slate-700' : 'text-slate-400'}`}>{step.label}</span>
                <span className={`text-[10px] mt-0.5 ${step.date ? 'text-slate-500' : 'text-slate-300'}`}>{fmtDate(step.date)}</span>
              </div>
            ))}
          </div>
        </div>

        {(order.notes || order.deliveryNotes) && (
          <div className="space-y-2 mb-6">
            {order.notes && <div className="bg-blue-50 rounded-xl px-4 py-3"><p className="text-[11px] text-blue-600 uppercase tracking-wider font-medium mb-1">Order Notes</p><p className="text-sm text-blue-800 leading-relaxed">{order.notes}</p></div>}
            {order.deliveryNotes && <div className="bg-amber-50 rounded-xl px-4 py-3"><p className="text-[11px] text-amber-600 uppercase tracking-wider font-medium mb-1">Delivery Notes</p><p className="text-sm text-amber-800 leading-relaxed">{order.deliveryNotes}</p></div>}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && order.orderStatus === 'Placed' && <button onClick={() => updateStatus('Approved')} disabled={actionLoading} className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"><CheckCircle size={16} /> Approve</button>}
          {isAdmin && order.orderStatus === 'Approved' && <button onClick={() => updateStatus('Dispatched')} disabled={actionLoading} className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"><Truck size={16} /> Dispatch</button>}
          {isAdmin && order.orderStatus === 'Dispatched' && <button onClick={() => updateStatus('Delivered')} disabled={actionLoading} className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"><PackageCheck size={16} /> Deliver</button>}
          {isAdmin && outstanding > 0 && order.orderStatus !== 'Cancelled' && <button onClick={() => { setPaymentAmount(''); setPaymentOpen(true); }} disabled={actionLoading} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"><CreditCard size={16} /> Update Payment</button>}
          {isAdmin && order.orderStatus !== 'Cancelled' && <button onClick={() => { setEditNotes(order.notes || ''); setEditDeliveryNotes(order.deliveryNotes || ''); setNotesOpen(true); }} disabled={actionLoading} className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"><Edit3 size={16} /> Edit Notes</button>}
          {isAdmin && order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && <button onClick={() => setCancelOpen(true)} disabled={actionLoading} className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"><XCircle size={16} /> Cancel</button>}
          {isCustomer && order.orderStatus === 'Dispatched' && <button onClick={() => updateStatus('Delivered')} disabled={actionLoading} className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"><PackageCheck size={16} /> Confirm Delivery</button>}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-slate-900">Items ({items.length})</h2></div>

      {items.length === 0 ? (
        <EmptyState title="No items" />
      ) : (
        <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">SKU</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty x Price</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Unit</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4"><p className="text-sm font-semibold text-slate-900">{item.productName}</p>{item.productCode && <p className="text-xs text-slate-400 mt-0.5">{item.productCode}</p>}</td>
                    <td className="px-5 py-4 hidden sm:table-cell"><span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-primary-50 text-[10px] font-bold text-primary-700 font-mono"><Hash size={9} />{item.variantSku}</span></td>
                    <td className="px-5 py-4 text-sm text-slate-600">{item.quantity} x {fmt(item.pricePerUnit)}</td>
                    <td className="px-5 py-4 text-sm text-slate-500 hidden sm:table-cell">{item.unit}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900 text-right">{fmt(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-5 py-4 space-y-2">
            <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Subtotal</span><span className="text-sm font-medium text-slate-700">{fmt(order.subtotal ?? subtotal)}</span></div>
            {(order.courierCharge ?? 0) > 0 && <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Courier Charge</span><span className="text-sm font-medium text-slate-700">+{fmt(order.courierCharge!)}</span></div>}
            {(order.additionalCharge ?? 0) > 0 && <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Additional Charge {order.additionalChargeNote && <span className="text-slate-400">({order.additionalChargeNote})</span>}</span><span className="text-sm font-medium text-slate-700">+{fmt(order.additionalCharge!)}</span></div>}
            {(order.additionalDiscount ?? 0) > 0 && <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Additional Discount</span><span className="text-sm font-medium text-emerald-600">-{fmt(order.additionalDiscount!)}</span></div>}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100"><span className="text-sm font-semibold text-slate-900">Grand Total</span><span className="text-lg font-bold text-slate-900">{fmt(order.totalAmount)}</span></div>
            {isAdmin && order.orderStatus !== 'Cancelled' && <div className="pt-1"><button onClick={openChargesEdit} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Edit Charges</button></div>}
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={cancelOpen} onClose={() => setCancelOpen(false)} onConfirm={handleCancel} isLoading={actionLoading} title="Cancel Order" message={`Cancel order #${order.orderNumber}? This cannot be undone.`} />

      {paymentOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setPaymentOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Update Payment</h3>
              <p className="text-sm text-slate-500 mb-1">Outstanding: <span className="font-semibold text-slate-700">{fmt(outstanding)}</span></p>
              <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Amount received" className={`mt-3 ${inputCls}`} autoFocus />
              <div className="flex items-center gap-2 mt-4">
                <button onClick={() => setPaymentOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={handlePaymentUpdate} disabled={actionLoading} className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50">{actionLoading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Save'}</button>
              </div>
            </div>
          </div>
        </>
      )}

      {chargesOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setChargesOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Edit Charges</h3>
              <div className="space-y-3">
                <div><label className="text-xs font-medium text-slate-500 mb-1 block">Courier Charge</label><input type="number" value={editCourierCharge} onChange={(e) => setEditCourierCharge(e.target.value)} placeholder="0" className={inputCls} /></div>
                <div><label className="text-xs font-medium text-slate-500 mb-1 block">Additional Discount</label><input type="number" value={editAdditionalDiscount} onChange={(e) => setEditAdditionalDiscount(e.target.value)} placeholder="0" className={inputCls} /></div>
                <div><label className="text-xs font-medium text-slate-500 mb-1 block">Additional Charge</label><input type="number" value={editAdditionalCharge} onChange={(e) => setEditAdditionalCharge(e.target.value)} placeholder="0" className={inputCls} /></div>
                <div><label className="text-xs font-medium text-slate-500 mb-1 block">Charge Note</label><input value={editAdditionalChargeNote} onChange={(e) => setEditAdditionalChargeNote(e.target.value)} placeholder="e.g., Packaging fee" className={inputCls} /></div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button onClick={() => setChargesOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={handleChargesUpdate} disabled={actionLoading} className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50">{actionLoading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Save'}</button>
              </div>
            </div>
          </div>
        </>
      )}

      {notesOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setNotesOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Edit Notes</h3>
              <div className="space-y-3">
                <div><label className="text-xs font-medium text-slate-500 mb-1 block">Order Notes</label><textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} className={`${inputCls} resize-none`} /></div>
                <div><label className="text-xs font-medium text-slate-500 mb-1 block">Delivery Notes</label><textarea value={editDeliveryNotes} onChange={(e) => setEditDeliveryNotes(e.target.value)} rows={3} className={`${inputCls} resize-none`} /></div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button onClick={() => setNotesOpen(false)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={handleNotesUpdate} disabled={actionLoading} className="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50">{actionLoading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Save'}</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
