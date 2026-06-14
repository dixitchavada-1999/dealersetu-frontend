import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, Truck, PackageCheck, Trash2, XCircle, Loader2 } from 'lucide-react';
import { ordersApi, extractError } from '../../lib/api';
import type { Order, OrderStatus, OrderDetail } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import DateRangePicker from '../../components/DateRangePicker';
import { PageHeader, SearchInput, StatusBadge, DataTable } from '../../components/ui';
import type { Column } from '../../components/ui';
import { formatCurrency, formatLongDate } from '../../lib/format';
import toast from '../../lib/toast';
import OrderStatusFilter from './components/OrderStatusFilter';
import OrderDrawer from './components/OrderDrawer';

/** Orders list — search, status + date filters, status workflow, detail drawer. */
export default function OrdersPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [permDeleteTarget, setPermDeleteTarget] = useState<Order | null>(null);
  const [permDeleting, setPermDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerData, setDrawerData] = useState<OrderDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const load = () => {
    setLoading(true);
    ordersApi.getAll().then(setOrders).catch((e) => toast.error(extractError(e))).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = orders.filter((o) => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) || (o.customerName || '').toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter && o.orderStatus !== statusFilter) return false;
    if (dateFrom) { const d = new Date(o.orderDate); const f = new Date(dateFrom); f.setHours(0, 0, 0, 0); if (d < f) return false; }
    if (dateTo) { const d = new Date(o.orderDate); const t = new Date(dateTo); t.setHours(23, 59, 59, 999); if (d > t) return false; }
    return true;
  });

  const hasActiveFilters = !!statusFilter || !!dateFrom || !!dateTo;
  const clearFilters = () => { setStatusFilter(''); setDateFrom(''); setDateTo(''); };

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (page > totalPages) setPage(1);
  }, [filtered.length, pageSize, page]);

  const pageStart = (page - 1) * pageSize;
  const paginated = filtered.slice(pageStart, pageStart + pageSize);

  const openDrawer = async (orderId: string) => {
    setDrawerOpen(true); setDrawerLoading(true); setDrawerData(null);
    try { setDrawerData(await ordersApi.getById(orderId)); }
    catch (e: any) { toast.error(extractError(e)); setDrawerOpen(false); }
    finally { setDrawerLoading(false); }
  };
  const closeDrawer = () => { setDrawerOpen(false); setTimeout(() => setDrawerData(null), 300); };

  const updateStatus = async (order: Order, newStatus: OrderStatus) => {
    try {
      await ordersApi.update(order.id, { orderStatus: newStatus });
      toast.success(`Order ${newStatus.toLowerCase()}`);
      load();
      if (drawerData?.order.id === order.id) setDrawerData(await ordersApi.getById(order.id));
    } catch (e: any) { toast.error(extractError(e)); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await ordersApi.delete(deleteTarget.id);
      toast.success('Order cancelled');
      if (drawerData?.order.id === deleteTarget.id) closeDrawer();
      setDeleteTarget(null); load();
    } catch (e: any) { toast.error(extractError(e)); }
    finally { setDeleting(false); }
  };

  const handlePermanentDelete = async () => {
    if (!permDeleteTarget) return;
    setPermDeleting(true);
    try {
      await ordersApi.permanentDelete(permDeleteTarget.id);
      toast.success('Order permanently deleted');
      if (drawerData?.order.id === permDeleteTarget.id) closeDrawer();
      setPermDeleteTarget(null); load();
    } catch (e: any) { toast.error(extractError(e)); }
    finally { setPermDeleting(false); }
  };

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const columns: Column<Order>[] = [
    {
      header: 'Order #',
      render: (o) => (
        <div onClick={stop}>
          <button onClick={() => navigate(`/orders/${o.id}`)} className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors">{o.orderNumber}</button>
          <p className="text-xs text-slate-400 md:hidden">{formatLongDate(o.orderDate)}</p>
        </div>
      ),
    },
    { header: 'Customer', headerClassName: 'hidden sm:table-cell', cellClassName: 'text-sm text-slate-600 hidden sm:table-cell', render: (o) => o.customerName || '-' },
    { header: 'Date', headerClassName: 'hidden md:table-cell', cellClassName: 'text-sm text-slate-500 hidden md:table-cell', render: (o) => formatLongDate(o.orderDate) },
    { header: 'Total', cellClassName: 'text-sm font-semibold text-slate-900', render: (o) => formatCurrency(o.totalAmount) },
    { header: 'Payment', headerClassName: 'hidden sm:table-cell', cellClassName: 'hidden sm:table-cell', render: (o) => <StatusBadge status={o.paymentStatus} kind="payment" /> },
    { header: 'Status', render: (o) => <StatusBadge status={o.orderStatus} /> },
    {
      header: 'Actions',
      align: 'right',
      cellClassName: 'whitespace-nowrap',
      render: (o) => (
        <div className="flex items-center justify-end gap-0.5" onClick={stop}>
          <button onClick={() => openDrawer(o.id)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors" title="View"><Eye size={16} /></button>
          {o.orderStatus === 'Placed' && <button onClick={() => updateStatus(o, 'Approved')} className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-500 hover:text-emerald-600 transition-colors" title="Approve"><CheckCircle size={16} /></button>}
          {o.orderStatus === 'Approved' && <button onClick={() => updateStatus(o, 'Dispatched')} className="p-2 hover:bg-orange-50 rounded-lg text-orange-500 hover:text-orange-600 transition-colors" title="Dispatch"><Truck size={16} /></button>}
          {o.orderStatus === 'Dispatched' && <button onClick={() => updateStatus(o, 'Delivered')} className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-500 hover:text-emerald-600 transition-colors" title="Deliver"><PackageCheck size={16} /></button>}
          {isAdmin && o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled' && <button onClick={() => setDeleteTarget(o)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Cancel"><XCircle size={16} /></button>}
          {isAdmin && o.orderStatus === 'Cancelled' && <button onClick={() => setPermDeleteTarget(o)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors" title="Delete permanently"><Trash2 size={16} /></button>}
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>;

  return (
    <div>
      <PageHeader title="Orders" subtitle={`${orders.length} total orders`} />

      {orders.length > 0 && (
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by order # or customer..." className="flex-1 sm:flex-initial sm:w-96" />
            <DateRangePicker from={dateFrom} to={dateTo} onChange={({ from, to }) => { setDateFrom(from); setDateTo(to); }} onClear={() => { setDateFrom(''); setDateTo(''); }} />
            {hasActiveFilters && <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1">Clear all</button>}
          </div>
          <OrderStatusFilter value={statusFilter} onChange={setStatusFilter} />
          {hasActiveFilters && <p className="text-xs text-slate-500">Showing {filtered.length} of {orders.length} orders</p>}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title={search ? 'No results' : 'No orders'} message={search ? 'Try a different search.' : 'Orders placed by customers will appear here.'} />
      ) : (
        <DataTable
          columns={columns}
          rows={paginated}
          rowKey={(o) => o.id}
          onRowClick={(o) => openDrawer(o.id)}
          pagination={{ page, pageSize, total: filtered.length, onPageChange: setPage, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
        />
      )}

      <OrderDrawer open={drawerOpen} data={drawerData} loading={drawerLoading} onClose={closeDrawer} />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} isLoading={deleting} title="Cancel Order" message={`Cancel order #${deleteTarget?.orderNumber}? This cannot be undone.`} />
      <ConfirmDialog isOpen={!!permDeleteTarget} onClose={() => setPermDeleteTarget(null)} onConfirm={handlePermanentDelete} isLoading={permDeleting} title="Permanently Delete Order" message={`Permanently delete order #${permDeleteTarget?.orderNumber}? This will remove all order data and cannot be recovered.`} />
    </div>
  );
}
