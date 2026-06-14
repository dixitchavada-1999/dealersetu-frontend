import { TrendingUp, TrendingDown, Wallet, CheckCircle, AlertTriangle, PackageCheck, Layers } from 'lucide-react';
import type { DashboardStats } from '../../../lib/types';
import { formatCurrency, formatCompact } from '../../../lib/format';
import { ORDER_STATUS_CONFIG } from '../../../constants/orderStatus';
import ProgressBar from '../../../components/ui/ProgressBar';
import SegmentedBar from '../../../components/ui/SegmentedBar';
import Sparkline from '../../../components/ui/Sparkline';
import KpiCard from './KpiCard';
import type { DashboardComputed } from '../hooks/useDashboardData';

type Props = { stats: DashboardStats; computed: DashboardComputed };

/** The five headline KPI cards across the top of the admin dashboard. */
export default function KpiSection({ stats, computed }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* 1. Total Revenue */}
      <KpiCard icon={Wallet} accent="primary" label="Total Revenue" value={formatCurrency(stats.revenue.total)} trend={{ dir: 'up', text: '+4.2%' }}>
        <p className="text-xs text-slate-400">vs last month</p>
        <div className="mt-3">
          <Sparkline trend="up" color="#10b981" />
        </div>
        <p className="text-xs text-slate-400 mt-1">Run-rate: {formatCurrency(computed.runRate)} annually</p>
      </KpiCard>

      {/* 2. Collection Rate */}
      <KpiCard icon={CheckCircle} accent="emerald" label="Collection Rate" value={`${computed.collectionRate.toFixed(1)}%`}>
        <ProgressBar value={computed.collectionRate} max={100} colors={['#0F52BA', '#2566c8']} />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-400">Target: 98%</span>
          <div className="flex items-center gap-1">
            {computed.collectionRate >= 98 ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-red-500" />}
            <span className={`text-xs font-semibold ${computed.collectionRate >= 98 ? 'text-emerald-600' : 'text-red-500'}`}>
              {computed.collectionRate >= 98 ? 'On target' : `${(98 - computed.collectionRate).toFixed(1)}% below`}
            </span>
          </div>
        </div>
      </KpiCard>

      {/* 3. Outstanding */}
      <KpiCard icon={AlertTriangle} accent="amber" label="Outstanding" value={formatCurrency(stats.revenue.outstanding)}>
        <p className="text-sm font-medium text-slate-600 mb-3">
          {stats.revenue.paid > 0 ? `${((stats.revenue.paid / stats.revenue.total) * 100).toFixed(1)}%` : '0%'} collected
        </p>
        <ProgressBar value={stats.revenue.paid} max={stats.revenue.total || 1} colors={['#f59e0b', '#eab308']} />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-400">Target: 0</span>
          {stats.revenue.outstanding > 0 ? (
            <span className="text-xs font-semibold text-amber-600">Pending</span>
          ) : (
            <span className="text-xs font-semibold text-emerald-600">All clear</span>
          )}
        </div>
      </KpiCard>

      {/* 4. Order Fulfillment */}
      <KpiCard icon={PackageCheck} accent="blue" label="Fulfillment" value={`${computed.fulfillmentRate.toFixed(0)}%`}>
        <p className="text-sm text-slate-500 mb-3">{computed.delivered} of {stats.counts.orders} orders delivered</p>
        <SegmentedBar segments={[
          { value: stats.ordersByStatus['Delivered'] || 0, color: '#10b981', label: 'Delivered' },
          { value: stats.ordersByStatus['Dispatched'] || 0, color: '#f97316', label: 'Dispatched' },
          { value: stats.ordersByStatus['Approved'] || 0, color: '#f59e0b', label: 'Approved' },
          { value: stats.ordersByStatus['Placed'] || 0, color: '#3b82f6', label: 'Placed' },
          { value: stats.ordersByStatus['Cancelled'] || 0, color: '#ef4444', label: 'Cancelled' },
        ]} />
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {Object.entries(stats.ordersByStatus).map(([status, count]) => {
            const cfg = ORDER_STATUS_CONFIG[status];
            if (!cfg || count === 0) return null;
            return (
              <span key={status} className="text-[10px] text-slate-500 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{status}: {count}
              </span>
            );
          })}
        </div>
      </KpiCard>

      {/* 5. Inventory Health */}
      <KpiCard icon={Layers} accent="violet" label="Inventory Health" value={formatCompact(stats.inventory?.totalStockValue ?? 0)}>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Stock Value</span>
            <span className="text-xs font-medium text-slate-700">{formatCurrency(stats.inventory?.totalStockValue ?? 0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Low Stock Items</span>
            <span className={`text-xs font-medium ${(stats.inventory?.lowStockItems ?? 0) > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{stats.inventory?.lowStockItems ?? 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Total Variants</span>
            <span className="text-xs font-medium text-slate-700">{stats.counts.variants ?? 0}</span>
          </div>
        </div>
        {(stats.inventory?.lowStockItems ?? 0) > 0 && (
          <p className="text-[10px] text-amber-600 mt-2">{stats.inventory!.lowStockItems} item{stats.inventory!.lowStockItems !== 1 ? 's' : ''} need restocking</p>
        )}
      </KpiCard>
    </div>
  );
}
