import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Banner } from '../../lib/types';
import { useDashboardData } from './hooks/useDashboardData';
import KpiSection from './components/KpiSection';
import QuickCounts from './components/QuickCounts';
import WeeklyTrendTable from './components/WeeklyTrendTable';
import AttentionOrders from './components/AttentionOrders';
import RevenueBreakdown from './components/RevenueBreakdown';
import OrdersByStatus from './components/OrdersByStatus';
import ExploreFeed from './components/ExploreFeed';

/**
 * Dashboard container — owns data + routing concerns and composes the
 * presentational sections. Customers see the Explore feed; admins/staff see
 * the KPI + analytics layout.
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { isAdmin, isDispatch, isProduction, isMarketing } = useAuth();
  const { loading, stats, banners, computed, weeklyMetrics, attentionOrders } = useDashboardData();

  const isCustomer = !isAdmin && !isDispatch && !isProduction && !isMarketing;

  const handleBannerClick = (banner: Banner) => {
    if (banner.linkType === 'product' && banner.linkId) navigate(`/products/${banner.linkId}`);
    else if (banner.linkType === 'category') navigate('/products');
    else if (banner.linkType === 'external' && banner.linkUrl) window.open(banner.linkUrl, '_blank');
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>;
  if (!stats) return null;

  // ── Customer dashboard ──────────────────────────────────────
  if (stats.role === 'USER' || isCustomer) {
    return <ExploreFeed customerName={stats.customer?.name} banners={banners} onBannerClick={handleBannerClick} />;
  }

  // ── Admin / staff dashboard ─────────────────────────────────
  if (!computed) return null;
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      </div>

      <KpiSection stats={stats} computed={computed} />
      <QuickCounts counts={stats.counts} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeeklyTrendTable metrics={weeklyMetrics} />
        <AttentionOrders
          orders={attentionOrders}
          onOpen={(id) => navigate(`/orders/${id}`)}
          onViewAll={() => navigate('/orders')}
        />
      </div>

      <RevenueBreakdown revenue={stats.revenue} />
      <OrdersByStatus
        ordersByStatus={stats.ordersByStatus}
        ordersByPayment={stats.ordersByPayment}
        totalOrders={stats.counts.orders}
      />
    </div>
  );
}
