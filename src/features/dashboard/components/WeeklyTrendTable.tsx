import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../../../components/ui/Card';
import type { WeeklyMetric } from '../hooks/useDashboardData';

type Props = { metrics: WeeklyMetric[] };

/** Week-over-week comparison table of key business metrics. */
export default function WeeklyTrendTable({ metrics }: Props) {
  return (
    <Card padding="lg">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
          <BarChart3 size={20} className="text-primary-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">What Changed Since Last Week</h2>
          <p className="text-xs text-slate-400">Comparison of key business metrics</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Metric</th>
              <th className="text-right pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Week</th>
              <th className="text-right pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">This Week</th>
              <th className="text-right pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {metrics.map((row) => (
              <tr key={row.metric} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 text-sm font-medium text-slate-900">{row.metric}</td>
                <td className="py-3.5 text-sm text-slate-500 text-right">{row.lastWeek}</td>
                <td className="py-3.5 text-sm font-medium text-slate-900 text-right">{row.thisWeek}</td>
                <td className="py-3.5 text-right">
                  <span className={`inline-flex items-center gap-1 text-sm font-semibold ${row.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                    {row.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {row.change}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
