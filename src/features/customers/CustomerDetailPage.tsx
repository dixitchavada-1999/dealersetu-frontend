import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Phone, Mail, Store, MapPin, CreditCard, IndianRupee, Clock } from 'lucide-react';
import { userApi, ordersApi, extractError } from '../../lib/api';
import type { UserMember, Order, CustomerBalances } from '../../lib/types';
import EmptyState from '../../components/EmptyState';
import { Card, StatusBadge } from '../../components/ui';
import { formatCurrency, formatLongDate } from '../../lib/format';
import toast from '../../lib/toast';

/** Customer detail — info, balances, and order history. */
export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<UserMember | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [balances, setBalances] = useState<CustomerBalances | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [members, allOrders, bal] = await Promise.all([userApi.getMembers(), ordersApi.getAll(id), userApi.getBalances()]);
        setMember(members.find((m) => m.id === id) || null);
        setOrders(allOrders);
        setBalances(bal);
      } catch (err: any) {
        toast.error(extractError(err));
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>;
  if (!member) return <EmptyState title="Customer not found" />;

  const customerBalance = balances?.byCustomer?.[id!];
  const infoItems = [
    { icon: Phone, label: 'Mobile', value: member.mobileNumber },
    { icon: Mail, label: 'Email', value: member.email || '-' },
    { icon: Store, label: 'Shop', value: member.shopName || '-' },
    { icon: CreditCard, label: 'GST', value: member.gstNumber || '-' },
  ];

  return (
    <div>
      <Link to="/customers" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 font-medium transition-colors"><ArrowLeft size={16} /> Back to Customers</Link>

      <Card padding="lg" className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{member.firstName} {member.lastName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${member.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${member.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />{member.isActive ? 'Active' : 'Inactive'}
              </span>
              {member.isDeviceLocked && <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 text-xs font-medium text-amber-700">Device Locked</span>}
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-100 text-sm font-mono font-medium text-slate-600">Code: {member.loginCode}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {infoItems.map((it) => (
            <div key={it.label} className="bg-slate-50 rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-1.5"><it.icon size={14} className="text-slate-400" /><span className="text-xs text-slate-500">{it.label}</span></div>
              <p className="text-sm font-semibold text-slate-900">{it.value}</p>
            </div>
          ))}
        </div>

        {member.address?.line1 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-start gap-2">
            <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-600">{[member.address.line1, member.address.city, member.address.state, member.address.pincode].filter(Boolean).join(', ')}</p>
          </div>
        )}
      </Card>

      {customerBalance && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card padding="md"><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><IndianRupee size={16} className="text-blue-600" /></div><span className="text-sm text-slate-500">Total Amount</span></div><p className="text-2xl font-bold text-slate-900">{formatCurrency(customerBalance.totalAmount)}</p></Card>
          <Card padding="md" className="border-emerald-100"><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><IndianRupee size={16} className="text-emerald-600" /></div><span className="text-sm text-slate-500">Paid</span></div><p className="text-2xl font-bold text-emerald-600">{formatCurrency(customerBalance.paidAmount)}</p></Card>
          <Card padding="md" className="border-red-100"><div className="flex items-center gap-2 mb-2"><div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><Clock size={16} className="text-red-600" /></div><span className="text-sm text-slate-500">Pending</span></div><p className="text-2xl font-bold text-red-600">{formatCurrency(customerBalance.pendingAmount)}</p></Card>
        </div>
      )}

      <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-slate-900">Orders ({orders.length})</h2></div>

      {orders.length === 0 ? (
        <EmptyState title="No orders" message="No orders from this customer yet." />
      ) : (
        <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order #</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Payment</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/orders/${o.id}`)}>
                    <td className="px-5 py-4"><p className="text-sm font-semibold text-slate-900">{o.orderNumber}</p><p className="text-xs text-slate-400 sm:hidden">{formatLongDate(o.orderDate)}</p></td>
                    <td className="px-5 py-4 text-sm text-slate-500 hidden sm:table-cell">{formatLongDate(o.orderDate)}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">{formatCurrency(o.totalAmount)}</td>
                    <td className="px-5 py-4 hidden sm:table-cell"><StatusBadge status={o.paymentStatus} kind="payment" /></td>
                    <td className="px-5 py-4"><StatusBadge status={o.orderStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
