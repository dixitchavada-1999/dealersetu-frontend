import { Loader2, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { Banner } from '../../lib/types';
import { formatLongDate } from '../../lib/format';
import { useDashboardData } from './hooks/useDashboardData';
import KpiSection from './components/KpiSection';
import QuickCounts from './components/QuickCounts';
import OrdersDonut from './components/OrdersDonut';
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
  const { user, isAdmin, isDispatch, isProduction, isMarketing } = useAuth();
  const { loading, stats, banners, computed, attentionOrders } = useDashboardData();

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Here's what's happening with your business today.</p>
        </div>
        <span className="inline-flex items-center gap-2 self-start sm:self-auto bg-card border border-slate-100 shadow-sm rounded-xl px-3.5 py-2 text-sm font-medium text-slate-600">
          <CalendarDays size={16} className="text-primary-600" />
          {formatLongDate(new Date().toISOString())}
        </span>
      </div>

      <KpiSection stats={stats} computed={computed} />

      <QuickCounts counts={stats.counts} />

      {/* Orders donut + orders needing attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrdersDonut ordersByStatus={stats.ordersByStatus} totalOrders={stats.counts.orders} />
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
