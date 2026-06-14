import { ORDER_STATUS_CONFIG } from '../../../constants/orderStatus';
import type { OrderStatus } from '../../../lib/types';

type Props = {
  value: OrderStatus | '';
  onChange: (status: OrderStatus | '') => void;
};

const STATUSES = Object.keys(ORDER_STATUS_CONFIG) as OrderStatus[];

/** "All" + per-status filter chips for the orders list. */
export default function OrderStatusFilter({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        onClick={() => onChange('')}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!value ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
      >
        All
      </button>
      {STATUSES.map((status) => {
        const s = ORDER_STATUS_CONFIG[status];
        const active = value === status;
        return (
          <button
            key={status}
            onClick={() => onChange(active ? '' : status)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? `${s.bg} ${s.text}` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${active ? s.dot : 'bg-slate-400'}`} />
            {status}
          </button>
        );
      })}
    </div>
  );
}
