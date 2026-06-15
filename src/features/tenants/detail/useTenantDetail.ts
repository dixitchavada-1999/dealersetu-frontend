import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminApi, extractError } from '../../../lib/api';
import type {
  SuperAdminTenantDetail, SuperAdminTenantUser, SACategory, SAProduct, SAProductDetail,
  SACustomer, SAOrder, SAOrderDetail,
} from '../../../lib/api';
import toast from '../../../lib/toast';

export type Tab = 'overview' | 'categories' | 'products' | 'customers' | 'orders';

export type DrawerContent =
  | { type: 'category'; data: SACategory }
  | { type: 'product'; data: SAProductDetail; loading?: false }
  | { type: 'product'; data: null; loading: true }
  | { type: 'customer'; data: SACustomer }
  | { type: 'order'; data: SAOrderDetail; loading?: false }
  | { type: 'order'; data: null; loading: true };

/** Loads a tenant, lazily fetches per-tab lists, and manages active-toggle + detail drawers. */
export function useTenantDetail(id: string | undefined) {
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<SuperAdminTenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [tab, setTab] = useState<Tab>('overview');

  const [users, setUsers] = useState<SuperAdminTenantUser[]>([]);
  const [categories, setCategories] = useState<SACategory[]>([]);
  const [products, setProducts] = useState<SAProduct[]>([]);
  const [customers, setCustomers] = useState<SACustomer[]>([]);
  const [orders, setOrders] = useState<SAOrder[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [loadedTabs, setLoadedTabs] = useState<Set<Tab>>(new Set());

  const [drawer, setDrawer] = useState<DrawerContent | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([superAdminApi.getTenantDetail(id), superAdminApi.getTenantUsers(id)])
      .then(([t, u]) => { setTenant(t); setUsers(u); setLoadedTabs(new Set(['overview'])); })
      .catch(err => { toast.error(extractError(err)); navigate('/super-admin/tenants'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (!id || loadedTabs.has(tab) || tab === 'overview') return;
    setTabLoading(true);
    (async () => {
      try {
        if (tab === 'categories') setCategories(await superAdminApi.getTenantCategories(id));
        if (tab === 'products') setProducts(await superAdminApi.getTenantProducts(id));
        if (tab === 'customers') setCustomers(await superAdminApi.getTenantCustomers(id));
        if (tab === 'orders') setOrders(await superAdminApi.getTenantOrders(id));
        setLoadedTabs(prev => new Set(prev).add(tab));
      } catch (err: any) { toast.error(extractError(err)); }
      finally { setTabLoading(false); }
    })();
  }, [tab, id, loadedTabs]);

  const toggleActive = async () => {
    if (!id || !tenant) return;
    setToggling(true);
    try {
      const res = await superAdminApi.toggleTenantActive(id);
      setTenant(prev => (prev ? { ...prev, isActive: res.isActive } : prev));
      toast.success(res.isActive ? 'Tenant activated' : 'Tenant deactivated');
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

  return {
    tenant, loading, toggling, tab, setTab,
    users, categories, products, customers, orders, tabLoading,
    drawer, setDrawer, toggleActive, openProductDrawer, openOrderDrawer,
  };
}
