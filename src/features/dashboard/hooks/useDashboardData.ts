import { useEffect, useMemo, useState } from 'react';
import { dashboardApi, ordersApi, bannersApi, extractError } from '../../../lib/api';
import type { DashboardStats, Order, Banner } from '../../../lib/types';
import toast from '../../../lib/toast';

export type DashboardComputed = {
  collectionRate: number;
  fulfillmentRate: number;
  cancelRate: number;
  delivered: number;
  cancelled: number;
};

/**
 * Loads dashboard data (stats, recent orders, active banners) and derives the
 * computed metrics, week-over-week table rows, and "needs attention" order list.
 * Keeps all data concerns out of the presentational components.
 */
export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats(),
      ordersApi.getAll(),
      bannersApi.getAll().catch(() => [] as Banner[]),
    ])
      .then(([s, o, b]) => {
        setStats(s);
        setRecentOrders(o);
        setBanners(b.filter((banner) => banner.isActive));
      })
      .catch((err) => toast.error(extractError(err)))
      .finally(() => setLoading(false));
  }, []);

  const computed = useMemo<DashboardComputed | null>(() => {
    if (!stats) return null;
    const collectionRate = stats.revenue.total > 0 ? (stats.revenue.paid / stats.revenue.total) * 100 : 0;
    const delivered = stats.ordersByStatus['Delivered'] || 0;
    const totalOrders = stats.counts.orders;
    const fulfillmentRate = totalOrders > 0 ? (delivered / totalOrders) * 100 : 0;
    const cancelled = stats.ordersByStatus['Cancelled'] || 0;
    const cancelRate = totalOrders > 0 ? (cancelled / totalOrders) * 100 : 0;
    return { collectionRate, fulfillmentRate, cancelRate, delivered, cancelled };
  }, [stats]);

  const attentionOrders = useMemo(() => {
    return recentOrders
      .filter((o) => o.orderStatus === 'Placed' || o.orderStatus === 'Approved' || (o.orderStatus === 'Dispatched' && o.paymentStatus !== 'Paid'))
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 5);
  }, [recentOrders]);

  return { loading, stats, banners, computed, attentionOrders };
}
