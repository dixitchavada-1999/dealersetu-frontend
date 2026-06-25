import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export type KpiAccent = 'primary' | 'emerald' | 'amber' | 'blue' | 'violet';

// Icon-tile classes per accent. Literal strings so Tailwind's JIT can see them.
// Tinted (not solid) so they keep good contrast in both light and dark themes.
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
 * Reusable dashboard KPI card — icon tile + trend pill on top, headline value,
 * then card-specific extras (mini chart / progress) passed as children.
 * Soft-rounded with a hover lift for a modern, tactile feel.
 */
export default function KpiCard({ icon: Icon, accent, label, value, trend, children }: Props) {
  return (
    <div className="bg-card rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <span className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${ACCENT[accent]}`}>
          <Icon size={20} strokeWidth={2} />
        </span>
        {trend && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              trend.dir === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
            }`}
          >
            {trend.dir === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.text}
          </span>
        )}
      </div>
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">{value}</p>
      {children}
    </div>
  );
}
