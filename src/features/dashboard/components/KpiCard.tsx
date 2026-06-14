import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export type KpiAccent = 'primary' | 'emerald' | 'amber' | 'blue' | 'violet';

// Icon-tile classes per accent. Literal strings so Tailwind's JIT can see them.
// All these accents have dark-mode overrides in index.css → render in both themes.
const ACCENT: Record<KpiAccent, string> = {
  primary: 'bg-primary-600/10 text-primary-600',
  emerald: 'bg-emerald-600/10 text-emerald-600',
  amber: 'bg-amber-600/10 text-amber-600',
  blue: 'bg-blue-600/10 text-blue-600',
  violet: 'bg-violet-600/10 text-violet-600',
};

type Props = {
  icon: LucideIcon;
  accent: KpiAccent;
  label: string;
  value: string;
  trend?: { dir: 'up' | 'down'; text: string };
  children?: React.ReactNode;
};

/**
 * Reusable dashboard KPI card — icon-led layout: colored icon tile + label on
 * top, headline value below, then card-specific extras passed as children.
 */
export default function KpiCard({ icon: Icon, accent, label, value, trend, children }: Props) {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${ACCENT[accent]}`}>
            <Icon size={18} strokeWidth={2} />
          </span>
          <span className="text-xs font-medium text-slate-500 truncate">{label}</span>
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-semibold shrink-0 ${trend.dir === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend.dir === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.text}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
      {children}
    </div>
  );
}
