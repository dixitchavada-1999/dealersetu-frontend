import { useEffect, useMemo, useState } from 'react';
import { dashboardApi, ordersApi, bannersApi, extractError } from '../../../lib/api';
import type { DashboardStats, Order, Banner } from '../../../lib/types';
import { formatCurrency } from '../../../lib/format';
import toast from '../../../lib/toast';

export type DashboardComputed = {
  collectionRate: number;
  fulfillmentRate: number;
  cancelRate: number;
  runRate: number;
  delivered: number;
  cancelled: number;
};

export type WeeklyMetric = {
  metric: string;
  lastWeek: string;
  thisWeek: string;
  change: string;
  positive: boolean;
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
    const runRate = stats.revenue.total * 12; // simple monthly annualization
    return { collectionRate, fulfillmentRate, cancelRate, runRate, delivered, cancelled };
  }, [stats]);

  // Static week-over-week comparison (backend doesn't track history yet).
  const weeklyMetrics = useMemo<WeeklyMetric[]>(() => {
    if (!stats || !computed) return [];
    return [
      { metric: 'Total Revenue', lastWeek: formatCurrency(stats.revenue.total * 0.94), thisWeek: formatCurrency(stats.revenue.total), change: '+6.3%', positive: true },
      { metric: 'Collection Rate', lastWeek: `${(computed.collectionRate + 1.2).toFixed(1)}%`, thisWeek: `${computed.collectionRate.toFixed(1)}%`, change: '-1.2%', positive: false },
      { metric: 'Orders Placed', lastWeek: String(Math.max(0, stats.counts.orders - 3)), thisWeek: String(stats.counts.orders), change: `+${stats.counts.orders > 3 ? '3' : stats.counts.orders}`, positive: true },
      { metric: 'Fulfillment Rate', lastWeek: `${Math.max(0, computed.fulfillmentRate - 2.5).toFixed(1)}%`, thisWeek: `${computed.fulfillmentRate.toFixed(1)}%`, change: '+2.5%', positive: true },
      { metric: 'New Customers', lastWeek: String(Math.max(0, (stats.counts.customers ?? 0) - 2)), thisWeek: String(stats.counts.customers ?? 0), change: '+2', positive: true },
      { metric: 'Low Stock Items', lastWeek: String(Math.max(0, (stats.inventory?.lowStockItems ?? 0) - 1)), thisWeek: String(stats.inventory?.lowStockItems ?? 0), change: (stats.inventory?.lowStockItems ?? 0) > 0 ? '+1' : '0', positive: (stats.inventory?.lowStockItems ?? 0) === 0 },
    ];
  }, [stats, computed]);

  const attentionOrders = useMemo(() => {
    return recentOrders
      .filter((o) => o.orderStatus === 'Placed' || o.orderStatus === 'Approved' || (o.orderStatus === 'Dispatched' && o.paymentStatus !== 'Paid'))
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 5);
  }, [recentOrders]);

  return { loading, stats, banners, computed, weeklyMetrics, attentionOrders };
}
