import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, FolderTree, Package, ShoppingCart, UserCheck, Loader2, Activity } from 'lucide-react';
import { useTenantDetail, type Tab } from './detail/useTenantDetail';
import { activeBadge, activeDot } from './detail/utils';
import Drawer from './detail/components/Drawer';
import TenantOverview from './detail/components/TenantOverview';
import { CategoriesTab, ProductsTab, CustomersTab, OrdersTab } from './detail/components/TenantListTabs';
import { CategoryDrawerBody, ProductDrawerBody, CustomerDrawerBody, OrderDrawerBody } from './detail/components/TenantDrawerBodies';

/** Super-admin tenant drilldown — overview, categories, products, customers, orders + detail drawers. */
export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const s = useTenantDetail(id);

  if (s.loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>;
  if (!s.tenant) return null;

  const t = s.tenant;
  const tabs: { key: Tab; label: string; icon: typeof Building2; count?: number }[] = [
    { key: 'overview', label: 'Overview', icon: Building2 },
    { key: 'categories', label: 'Categories', icon: FolderTree, count: t.categoryCount },
    { key: 'products', label: 'Products', icon: Package, count: t.productCount },
    { key: 'customers', label: 'Customers', icon: UserCheck, count: t.customerCount },
    { key: 'orders', label: 'Orders', icon: ShoppingCart, count: t.orderCount },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/super-admin/tenants')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ArrowLeft size={20} className="text-slate-600" /></button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{t.name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{t.businessType || 'Business'}</p>
        </div>
        <button onClick={() => navigate(`/super-admin/activity-logs?tenantId=${t.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors">
          <Activity size={15} /> View Activity
        </button>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${activeBadge(t.isActive)}`}>
          <span className={`w-2 h-2 rounded-full ${activeDot(t.isActive)}`} />{t.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="flex gap-1 mb-6 bg-surface p-1 rounded-xl overflow-x-auto border border-slate-100">
        {tabs.map(tb => (
          <button
            key={tb.key}
            onClick={() => s.setTab(tb.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${s.tab === tb.key ? 'bg-card text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <tb.icon size={16} />
            {tb.label}
            {tb.count !== undefined && <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded-md">{tb.count}</span>}
          </button>
        ))}
      </div>

      {s.tabLoading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>
      ) : (
        <>
          {s.tab === 'overview' && <TenantOverview tenant={t} users={s.users} toggling={s.toggling} onToggle={s.toggleActive} />}
          {s.tab === 'categories' && <CategoriesTab categories={s.categories} onOpen={(c) => s.setDrawer({ type: 'category', data: c })} />}
          {s.tab === 'products' && <ProductsTab products={s.products} onOpen={s.openProductDrawer} />}
          {s.tab === 'customers' && <CustomersTab customers={s.customers} onOpen={(c) => s.setDrawer({ type: 'customer', data: c })} />}
          {s.tab === 'orders' && <OrdersTab orders={s.orders} onOpen={s.openOrderDrawer} />}
        </>
      )}

      <Drawer open={s.drawer?.type === 'category'} onClose={() => s.setDrawer(null)} title="Category Details">
        {s.drawer?.type === 'category' && <CategoryDrawerBody data={s.drawer.data} />}
      </Drawer>

      <Drawer wide open={s.drawer?.type === 'product'} onClose={() => s.setDrawer(null)} title="Product Details">
        {s.drawer?.type === 'product' && s.drawer.loading && <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-primary-600" /></div>}
        {s.drawer?.type === 'product' && s.drawer.data && <ProductDrawerBody data={s.drawer.data} />}
      </Drawer>

      <Drawer open={s.drawer?.type === 'customer'} onClose={() => s.setDrawer(null)} title="Customer Details">
        {s.drawer?.type === 'customer' && <CustomerDrawerBody data={s.drawer.data} />}
      </Drawer>

      <Drawer open={s.drawer?.type === 'order'} onClose={() => s.setDrawer(null)} title="Order Details">
        {s.drawer?.type === 'order' && s.drawer.loading && <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-primary-600" /></div>}
        {s.drawer?.type === 'order' && s.drawer.data && <OrderDrawerBody data={s.drawer.data} />}
      </Drawer>
    </div>
  );
}
