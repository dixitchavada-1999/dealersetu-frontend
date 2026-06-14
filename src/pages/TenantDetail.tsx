import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  ArrowLeft, Building2, Mail, Phone, MapPin, Calendar, Users, Loader2, Power,
  FolderTree, Package, ShoppingCart, UserCheck, Eye, X, Hash, Tag, Layers, Box, Weight, Activity,
} from 'lucide-react';
import { superAdminApi, extractError } from '../lib/api';
import type {
  SuperAdminTenantDetail, SuperAdminTenantUser, SACategory, SAProduct, SAProductDetail, SACustomer, SAOrder, SAOrderDetail,
} from '../lib/api';
import toast from '../lib/toast';

// ── Types ───────────────────────────────────────────────────────
type Tab = 'overview' | 'categories' | 'products' | 'customers' | 'orders';
type DrawerContent =
  | { type: 'category'; data: SACategory }
  | { type: 'product'; data: SAProductDetail; loading?: false }
  | { type: 'product'; data: null; loading: true }
  | { type: 'customer'; data: SACustomer }
  | { type: 'order'; data: SAOrderDetail; loading?: false }
  | { type: 'order'; data: null; loading: true };

// ── Helpers ─────────────────────────────────────────────────────
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Placed: 'bg-blue-50 text-blue-700', Approved: 'bg-amber-50 text-amber-700',
    Dispatched: 'bg-orange-50 text-orange-700', Delivered: 'bg-emerald-50 text-emerald-700',
    Cancelled: 'bg-red-50 text-red-700', Pending: 'bg-red-50 text-red-700',
    Partial: 'bg-amber-50 text-amber-700', Paid: 'bg-emerald-50 text-emerald-700',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};

const activeBadge = (a: boolean) => a ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700';
const activeDot = (a: boolean) => a ? 'bg-emerald-500' : 'bg-red-500';

// ── Drawer (only for individual item detail) ────────────────────
function Drawer({ open, onClose, title, wide, children }: {
  open: boolean; onClose: () => void; title: string; wide?: boolean; children: React.ReactNode;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} bg-card shadow-2xl flex flex-col animate-slide-in-right`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

// ── Info row ────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────
export default function TenantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tenant, setTenant] = useState<SuperAdminTenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');

  // Tab data
  const [users, setUsers] = useState<SuperAdminTenantUser[]>([]);
  const [categories, setCategories] = useState<SACategory[]>([]);
  const [products, setProducts] = useState<SAProduct[]>([]);
  const [customers, setCustomers] = useState<SACustomer[]>([]);
  const [orders, setOrders] = useState<SAOrder[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [loadedTabs, setLoadedTabs] = useState<Set<Tab>>(new Set());

  // Drawer (only for single item detail)
  const [drawer, setDrawer] = useState<DrawerContent | null>(null);

  // ── Fetch tenant + users on mount ─────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      superAdminApi.getTenantDetail(id),
      superAdminApi.getTenantUsers(id),
    ]).then(([t, u]) => {
      setTenant(t);
      setUsers(u);
      setLoadedTabs(new Set(['overview']));
    }).catch(err => { toast.error(extractError(err)); navigate('/super-admin/tenants'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // ── Lazy-load tab data ────────────────────────────────────────
  useEffect(() => {
    if (!id || loadedTabs.has(tab) || tab === 'overview') return;
    setTabLoading(true);
    const load = async () => {
      try {
        if (tab === 'categories') setCategories(await superAdminApi.getTenantCategories(id));
        if (tab === 'products') setProducts(await superAdminApi.getTenantProducts(id));
        if (tab === 'customers') setCustomers(await superAdminApi.getTenantCustomers(id));
        if (tab === 'orders') setOrders(await superAdminApi.getTenantOrders(id));
        setLoadedTabs(prev => new Set(prev).add(tab));
      } catch (err: any) { toast.error(extractError(err)); }
      finally { setTabLoading(false); }
    };
    load();
  }, [tab, id, loadedTabs]);

  const handleToggle = async () => {
    if (!id || !tenant) return;
    setToggling(true);
    try {
      const res = await superAdminApi.toggleTenantActive(id);
      setTenant(prev => prev ? { ...prev, isActive: res.isActive } : prev);
      toast.success(res.isActive ? 'Tenant activated' : 'Tenant deactivated');
      setConfirmToggle(false);
    } catch (err: any) { toast.error(extractError(err)); }
    finally { setToggling(false); }
  };

  const openProductDrawer = async (productId: string) => {
    if (!id) return;
    setDrawer({ type: 'product', data: null, loading: true });
    try {
      const detail = await superAdminApi.getTenantProductDetail(id, productId);
      setDrawer({ type: 'product', data: detail });
    } catch (err: any) { toast.error(extractError(err)); setDrawer(null); }
  };

  const openOrderDrawer = async (orderId: string) => {
    if (!id) return;
    setDrawer({ type: 'order', data: null, loading: true });
    try {
      const detail = await superAdminApi.getTenantOrderDetail(id, orderId);
      setDrawer({ type: 'order', data: detail });
    } catch (err: any) { toast.error(extractError(err)); setDrawer(null); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>;
  if (!tenant) return null;

  const tabs: { key: Tab; label: string; icon: typeof Building2; count?: number }[] = [
    { key: 'overview', label: 'Overview', icon: Building2 },
    { key: 'categories', label: 'Categories', icon: FolderTree, count: tenant.categoryCount },
    { key: 'products', label: 'Products', icon: Package, count: tenant.productCount },
    { key: 'customers', label: 'Customers', icon: UserCheck, count: tenant.customerCount },
    { key: 'orders', label: 'Orders', icon: ShoppingCart, count: tenant.orderCount },
  ];

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/super-admin/tenants')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{tenant.name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{tenant.businessType || 'Business'}</p>
        </div>
        <button
          onClick={() => navigate(`/super-admin/activity-logs?tenantId=${tenant.id}`)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
        >
          <Activity size={15} />
          View Activity
        </button>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${activeBadge(tenant.isActive)}`}>
          <span className={`w-2 h-2 rounded-full ${activeDot(tenant.isActive)}`} />
          {tenant.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 bg-surface p-1 rounded-xl overflow-x-auto border border-slate-100">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.key
                ? 'bg-card text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <t.icon size={16} />
            {t.label}
            {t.count !== undefined && (
              <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded-md">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content (inline) ─────────────────────────────────── */}
      {tabLoading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>
      ) : (
        <>
          {/* ── Overview ─────────────────────────────────────────── */}
          {tab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tenant Info Card */}
              <div className="bg-card rounded-xl shadow-sm border border-slate-100 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Building2 size={22} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Tenant Info</h2>
                    <p className="text-xs text-slate-400">{tenant.userCount} users</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {tenant.email && <div className="flex items-center gap-3"><Mail size={16} className="text-slate-400 shrink-0" /><span className="text-sm text-slate-700">{tenant.email}</span></div>}
                  {tenant.phone && <div className="flex items-center gap-3"><Phone size={16} className="text-slate-400 shrink-0" /><span className="text-sm text-slate-700">{tenant.phone}</span></div>}
                  {tenant.address && <div className="flex items-center gap-3"><MapPin size={16} className="text-slate-400 shrink-0" /><span className="text-sm text-slate-700">{tenant.address}</span></div>}
                  <div className="flex items-center gap-3"><Calendar size={16} className="text-slate-400 shrink-0" /><span className="text-sm text-slate-700">Created {fmtDate(tenant.createdAt)}</span></div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-5 pt-5 border-t border-slate-100">
                  {[
                    { label: 'Categories', val: tenant.categoryCount },
                    { label: 'Products', val: tenant.productCount },
                    { label: 'Customers', val: tenant.customerCount },
                    { label: 'Orders', val: tenant.orderCount },
                  ].map(s => (
                    <div key={s.label} className="bg-surface rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-slate-900">{s.val}</p>
                      <p className="text-xs text-slate-500">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-5 border-t border-slate-100">
                  {confirmToggle ? (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-700">
                        {tenant.isActive ? 'Deactivating will block all users from logging in.' : 'Activating will allow all users to log in again.'}
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmToggle(false)} disabled={toggling} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-surface text-sm font-medium">Cancel</button>
                        <button onClick={handleToggle} disabled={toggling} className={`flex-1 px-3 py-2 rounded-xl text-white text-sm font-medium shadow-sm disabled:opacity-50 ${tenant.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                          {toggling ? 'Processing...' : tenant.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmToggle(true)} className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${tenant.isActive ? 'border border-red-200 text-red-600 hover:bg-red-50' : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
                      <Power size={16} />{tenant.isActive ? 'Deactivate Tenant' : 'Activate Tenant'}
                    </button>
                  )}
                </div>
              </div>

              {/* Users Table */}
              <div className="lg:col-span-2 bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <div className="flex items-center gap-3"><Users size={20} className="text-slate-600" /><h2 className="text-lg font-semibold text-slate-900">Users ({users.length})</h2></div>
                </div>
                {users.length === 0 ? (
                  <div className="text-center py-12"><p className="text-sm text-slate-500">No users found.</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-slate-100">
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
                      </tr></thead>
                      <tbody className="divide-y divide-slate-50">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-surface/50 transition-colors">
                            <td className="px-5 py-4 text-sm font-semibold text-slate-900">{u.firstName} {u.lastName}</td>
                            <td className="px-5 py-4 text-sm text-slate-600 hidden sm:table-cell">{u.email || '-'}</td>
                            <td className="px-5 py-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${u.role === 'ADMIN' ? 'bg-violet-50 text-violet-700' : u.role === 'DISPATCH' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{u.role}</span></td>
                            <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${activeBadge(u.isActive)}`}><span className={`w-1.5 h-1.5 rounded-full ${activeDot(u.isActive)}`} />{u.isActive ? 'Active' : 'Inactive'}</span></td>
                            <td className="px-5 py-4 text-sm text-slate-500 hidden md:table-cell">{fmtDate(u.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Categories Tab ───────────────────────────────────── */}
          {tab === 'categories' && (
            <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              {categories.length === 0 ? (
                <div className="text-center py-12"><p className="text-sm text-slate-500">No categories found.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-slate-100">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Description</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Created</th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {categories.map(c => (
                        <tr key={c.id} className="hover:bg-surface/50 transition-colors cursor-pointer" onClick={() => setDrawer({ type: 'category', data: c })}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {c.imageUrl ? <img src={c.imageUrl} alt={c.name} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center"><FolderTree size={16} className="text-slate-400" /></div>}
                              <span className="text-sm font-semibold text-slate-900">{c.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-500 hidden sm:table-cell max-w-xs truncate">{c.description || '-'}</td>
                          <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${activeBadge(c.isActive)}`}><span className={`w-1.5 h-1.5 rounded-full ${activeDot(c.isActive)}`} />{c.isActive ? 'Active' : 'Inactive'}</span></td>
                          <td className="px-5 py-4 text-sm text-slate-500 hidden md:table-cell">{fmtDate(c.createdAt)}</td>
                          <td className="px-5 py-4 text-right">
                            <button onClick={e => { e.stopPropagation(); setDrawer({ type: 'category', data: c }); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><Eye size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Products Tab ─────────────────────────────────────── */}
          {tab === 'products' && (
            <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              {products.length === 0 ? (
                <div className="text-center py-12"><p className="text-sm text-slate-500">No products found.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-slate-100">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Brand</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Variants</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Stock</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-surface/50 transition-colors cursor-pointer" onClick={() => openProductDrawer(p.id)}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center"><Package size={16} className="text-slate-400" /></div>}
                              <div><p className="text-sm font-semibold text-slate-900">{p.name}</p>{p.productCode && <p className="text-xs text-slate-400">{p.productCode}</p>}</div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600 hidden sm:table-cell">{p.categoryName || '-'}</td>
                          <td className="px-5 py-4 text-sm text-slate-500 hidden md:table-cell">{p.brand || '-'}</td>
                          <td className="px-5 py-4 text-sm text-slate-600 hidden lg:table-cell">{p.variantCount}</td>
                          <td className="px-5 py-4 text-sm text-slate-600 hidden lg:table-cell">{p.totalStock} {p.unit}</td>
                          <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${activeBadge(p.isActive)}`}><span className={`w-1.5 h-1.5 rounded-full ${activeDot(p.isActive)}`} />{p.isActive ? 'Active' : 'Inactive'}</span></td>
                          <td className="px-5 py-4 text-right">
                            <button onClick={e => { e.stopPropagation(); openProductDrawer(p.id); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><Eye size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Customers Tab ────────────────────────────────────── */}
          {tab === 'customers' && (
            <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              {customers.length === 0 ? (
                <div className="text-center py-12"><p className="text-sm text-slate-500">No customers found.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-slate-100">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Mobile</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Shop</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Outstanding</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {customers.map(c => (
                        <tr key={c.id} className="hover:bg-surface/50 transition-colors cursor-pointer" onClick={() => setDrawer({ type: 'customer', data: c })}>
                          <td className="px-5 py-4"><p className="text-sm font-semibold text-slate-900">{c.name}</p>{c.email && <p className="text-xs text-slate-400">{c.email}</p>}</td>
                          <td className="px-5 py-4 text-sm text-slate-600 hidden sm:table-cell">{c.mobile || '-'}</td>
                          <td className="px-5 py-4 text-sm text-slate-500 hidden md:table-cell">{c.shopName || '-'}</td>
                          <td className="px-5 py-4 hidden lg:table-cell"><span className={`text-sm font-medium ${c.outstandingAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{fmtCurrency(c.outstandingAmount)}</span></td>
                          <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${activeBadge(c.isActive)}`}><span className={`w-1.5 h-1.5 rounded-full ${activeDot(c.isActive)}`} />{c.isActive ? 'Active' : 'Inactive'}</span></td>
                          <td className="px-5 py-4 text-right">
                            <button onClick={e => { e.stopPropagation(); setDrawer({ type: 'customer', data: c }); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><Eye size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Orders Tab ───────────────────────────────────────── */}
          {tab === 'orders' && (
            <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              {orders.length === 0 ? (
                <div className="text-center py-12"><p className="text-sm text-slate-500">No orders found.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-slate-100">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Customer</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Payment</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                      <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {orders.map(o => (
                        <tr key={o.id} className="hover:bg-surface/50 transition-colors cursor-pointer" onClick={() => openOrderDrawer(o.id)}>
                          <td className="px-5 py-4"><p className="text-sm font-semibold text-slate-900">{o.orderNumber}</p></td>
                          <td className="px-5 py-4 hidden sm:table-cell"><p className="text-sm text-slate-700">{o.customerName}</p><p className="text-xs text-slate-400">{o.customerMobile}</p></td>
                          <td className="px-5 py-4"><p className="text-sm font-semibold text-slate-900">{fmtCurrency(o.totalAmount)}</p>{o.paidAmount > 0 && <p className="text-xs text-emerald-600">Paid: {fmtCurrency(o.paidAmount)}</p>}</td>
                          <td className="px-5 py-4 hidden md:table-cell"><span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${statusBadge(o.paymentStatus)}`}>{o.paymentStatus}</span></td>
                          <td className="px-5 py-4"><span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${statusBadge(o.orderStatus)}`}>{o.orderStatus}</span></td>
                          <td className="px-5 py-4 text-sm text-slate-500 hidden md:table-cell">{fmtDate(o.orderDate)}</td>
                          <td className="px-5 py-4 text-right">
                            <button onClick={e => { e.stopPropagation(); openOrderDrawer(o.id); }} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><Eye size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ── DRAWERS (only for individual item detail via Eye icon) ─ */}
      {/* ═══════════════════════════════════════════════════════════ */}

      {/* Category detail */}
      <Drawer open={drawer?.type === 'category'} onClose={() => setDrawer(null)} title="Category Details">
        {drawer?.type === 'category' && (
          <div className="space-y-5">
            {drawer.data.imageUrl && <img src={drawer.data.imageUrl} alt={drawer.data.name} className="w-full h-48 rounded-xl object-cover" />}
            <div>
              <h3 className="text-xl font-bold text-slate-900">{drawer.data.name}</h3>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium mt-2 ${activeBadge(drawer.data.isActive)}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${activeDot(drawer.data.isActive)}`} />{drawer.data.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="bg-surface rounded-xl p-4 space-y-0">
              <InfoRow label="Description" value={drawer.data.description || '-'} />
              <InfoRow label="Created" value={fmtDate(drawer.data.createdAt)} />
            </div>
          </div>
        )}
      </Drawer>

      {/* Product detail (full detail like admin) */}
      <Drawer wide open={drawer?.type === 'product'} onClose={() => setDrawer(null)} title="Product Details">
        {drawer?.type === 'product' && drawer.loading && (
          <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-primary-600" /></div>
        )}
        {drawer?.type === 'product' && drawer.data && (() => {
          const p = drawer.data.product;
          const vs = drawer.data.variants;
          const images = p.imageUrls;
          const fmt = (n: number) => fmtCurrency(n);
          const getStockLabel = (qty: number) => {
            if (qty === 0) return { label: 'Out of Stock', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
            if (qty <= 10) return { label: 'Low Stock', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
            return { label: 'In Stock', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
          };
          return (
            <div className="space-y-6">
              {/* Product info card */}
              <div className="bg-surface rounded-xl border border-slate-100 overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="sm:w-48 shrink-0 bg-slate-50">
                    {images.length > 0 ? (
                      <img src={images[0]} alt={p.name} className="w-full h-48 sm:h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 py-10 h-full">
                        <div className="w-14 h-14 rounded-xl bg-slate-200/60 flex items-center justify-center">
                          <Package size={24} className="text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-400">No image</p>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 p-5">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
                      {p.description && <p className="text-sm text-slate-500 mt-1 leading-relaxed">{p.description}</p>}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0"><Tag size={14} className="text-primary-600" /></div>
                        <div><p className="text-[10px] text-slate-400 uppercase font-medium">Category</p><p className="text-sm font-semibold text-slate-900">{p.categoryName || '-'}</p></div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0"><Hash size={14} className="text-violet-600" /></div>
                        <div><p className="text-[10px] text-slate-400 uppercase font-medium">Code</p><p className="text-sm font-semibold text-slate-900 font-mono">{p.productCode || '-'}</p></div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0"><Layers size={14} className="text-amber-600" /></div>
                        <div><p className="text-[10px] text-slate-400 uppercase font-medium">Brand</p><p className="text-sm font-semibold text-slate-900">{p.brand || '-'}</p></div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0"><Box size={14} className="text-cyan-500" /></div>
                        <div><p className="text-[10px] text-slate-400 uppercase font-medium">Unit</p><p className="text-sm font-semibold text-slate-900">{p.unit}</p></div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg ${p.isActive ? 'bg-emerald-50' : 'bg-red-50'} flex items-center justify-center shrink-0`}>
                          <span className={`w-2.5 h-2.5 rounded-full ${activeDot(p.isActive)}`} />
                        </div>
                        <div><p className="text-[10px] text-slate-400 uppercase font-medium">Status</p><p className={`text-sm font-semibold ${p.isActive ? 'text-emerald-700' : 'text-red-700'}`}>{p.isActive ? 'Active' : 'Inactive'}</p></div>
                      </div>
                    </div>
                    {/* Variant Attributes */}
                    {p.variantAttributes.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-medium mb-2">Variant Attributes</p>
                        <div className="flex flex-wrap gap-2">
                          {p.variantAttributes.map((attr, i) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary-50 text-xs font-medium text-primary-700">
                              {attr.name}: {attr.values.join(', ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Image thumbnails */}
                    {images.length > 1 && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 overflow-x-auto">
                        {images.map((url, idx) => (
                          <img key={idx} src={url} alt={`${p.name} ${idx + 1}`} className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Variants ({vs.length})</h4>
                {vs.length === 0 ? (
                  <p className="text-sm text-slate-500">No variants configured.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {vs.map(v => {
                      const stock = getStockLabel(v.stockQty);
                      const vMargin = v.costPrice && v.price > 0 ? ((v.price - v.costPrice) / v.price * 100) : null;
                      const borderAccent = v.stockQty === 0 ? 'border-l-red-500' : v.stockQty <= 10 ? 'border-l-amber-500' : 'border-l-emerald-500';
                      return (
                        <div key={v.id} className={`bg-surface rounded-xl border border-slate-100 border-l-[3px] ${borderAccent} overflow-hidden`}>
                          {/* SKU + Attributes */}
                          <div className="px-4 pt-3 pb-2">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 text-[11px] font-bold text-primary-700 font-mono">
                                <Hash size={10} />{v.sku}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-600">{v.unit}</span>
                            </div>
                            {Object.keys(v.attributes).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(v.attributes).map(([key, val]) => (
                                  <span key={key} className="inline-flex items-center px-2 py-0.5 rounded-md bg-teal-50 text-[10px] font-semibold text-teal-700">{key}: {val}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Pricing */}
                          <div className="px-4 pb-2">
                            <div className="flex items-end justify-between">
                              <div>
                                <p className="text-xl font-extrabold text-primary-600 leading-none">{fmt(v.finalPrice)}</p>
                                {v.taxPercentage > 0 && (
                                  <p className="text-[10px] text-slate-400 mt-0.5">incl. {v.taxPercentage}% tax · Base: {fmt(v.price)}</p>
                                )}
                              </div>
                              {vMargin !== null && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${vMargin >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                  {vMargin >= 0 ? '+' : ''}{vMargin.toFixed(1)}%
                                </span>
                              )}
                            </div>
                            {v.costPrice > 0 && (
                              <p className="text-[10px] text-slate-400 mt-0.5">Cost: {fmt(v.costPrice)}</p>
                            )}
                          </div>
                          {/* Stock */}
                          <div className="bg-card px-4 py-2 flex items-center justify-between border-t border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${stock.bg} ${stock.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${stock.dot}`} />{stock.label}
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium">{v.stockQty} {v.unit}</span>
                              {v.weight > 0 && (
                                <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><Weight size={10} />{v.weight}g</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Drawer>

      {/* Customer detail */}
      <Drawer open={drawer?.type === 'customer'} onClose={() => setDrawer(null)} title="Customer Details">
        {drawer?.type === 'customer' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{drawer.data.name}</h3>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium mt-2 ${activeBadge(drawer.data.isActive)}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${activeDot(drawer.data.isActive)}`} />{drawer.data.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="bg-surface rounded-xl p-4 space-y-0">
              <InfoRow label="Mobile" value={drawer.data.mobile || '-'} />
              <InfoRow label="Email" value={drawer.data.email || '-'} />
              <InfoRow label="Shop Name" value={drawer.data.shopName || '-'} />
              <InfoRow label="GST Number" value={drawer.data.gstNumber || '-'} />
              <InfoRow label="Created" value={fmtDate(drawer.data.createdAt)} />
            </div>
            <div className="bg-surface rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 mb-1">Outstanding Amount</p>
              <p className={`text-2xl font-bold ${drawer.data.outstandingAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {fmtCurrency(drawer.data.outstandingAmount)}
              </p>
            </div>
          </div>
        )}
      </Drawer>

      {/* Order detail */}
      <Drawer open={drawer?.type === 'order'} onClose={() => setDrawer(null)} title="Order Details">
        {drawer?.type === 'order' && drawer.loading && (
          <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-primary-600" /></div>
        )}
        {drawer?.type === 'order' && drawer.data && (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{drawer.data.order.orderNumber}</h3>
              <p className="text-sm text-slate-400 mt-0.5">{fmtDate(drawer.data.order.orderDate)}</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <span className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium ${statusBadge(drawer.data.order.orderStatus)}`}>{drawer.data.order.orderStatus}</span>
                <span className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-medium ${statusBadge(drawer.data.order.paymentStatus)}`}>Payment: {drawer.data.order.paymentStatus}</span>
              </div>
            </div>

            {drawer.data.order.customer && (
              <div className="bg-surface rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Customer</p>
                <p className="text-sm font-medium text-slate-900">{drawer.data.order.customer.name}</p>
                {drawer.data.order.customer.mobile && <p className="text-xs text-slate-500 mt-0.5">{drawer.data.order.customer.mobile}</p>}
                {drawer.data.order.customer.shopName && <p className="text-xs text-slate-500">{drawer.data.order.customer.shopName}</p>}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface rounded-xl p-3 text-center">
                <p className="text-xs text-slate-500">Total</p>
                <p className="text-lg font-bold text-slate-900">{fmtCurrency(drawer.data.order.totalAmount)}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-xs text-emerald-600">Paid</p>
                <p className="text-lg font-bold text-emerald-700">{fmtCurrency(drawer.data.order.paidAmount)}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-xs text-red-600">Due</p>
                <p className="text-lg font-bold text-red-700">{fmtCurrency(drawer.data.order.totalAmount - drawer.data.order.paidAmount)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Items ({drawer.data.items.length})</p>
              <div className="space-y-2">
                {drawer.data.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-surface rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.productName}</p>
                      <p className="text-xs text-slate-400">{item.sku}{item.brand ? ` · ${item.brand}` : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{fmtCurrency(item.totalPrice)}</p>
                      <p className="text-xs text-slate-400">{item.quantity} {item.unit} x {fmtCurrency(item.pricePerUnit)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {(drawer.data.order.notes || drawer.data.order.deliveryNotes) && (
              <div className="space-y-2">
                {drawer.data.order.notes && <div className="bg-surface rounded-xl p-4"><p className="text-xs font-semibold text-slate-500 mb-1">Notes</p><p className="text-sm text-slate-700">{drawer.data.order.notes}</p></div>}
                {drawer.data.order.deliveryNotes && <div className="bg-surface rounded-xl p-4"><p className="text-xs font-semibold text-slate-500 mb-1">Delivery Notes</p><p className="text-sm text-slate-700">{drawer.data.order.deliveryNotes}</p></div>}
              </div>
            )}

            {(drawer.data.order.approvedAt || drawer.data.order.dispatchedAt || drawer.data.order.deliveredAt) && (
              <div className="bg-surface rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Timeline</p>
                <div className="space-y-0">
                  <InfoRow label="Order Placed" value={fmtDate(drawer.data.order.createdAt)} />
                  {drawer.data.order.approvedAt && <InfoRow label="Approved" value={fmtDate(drawer.data.order.approvedAt)} />}
                  {drawer.data.order.dispatchedAt && <InfoRow label="Dispatched" value={fmtDate(drawer.data.order.dispatchedAt)} />}
                  {drawer.data.order.deliveredAt && <InfoRow label="Delivered" value={fmtDate(drawer.data.order.deliveredAt)} />}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
