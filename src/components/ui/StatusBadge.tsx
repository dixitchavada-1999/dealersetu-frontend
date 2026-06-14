import { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG, FALLBACK_STATUS } from '../../constants/orderStatus';

type Props = {
  status: string;
  /** Which config map to use. */
  kind?: 'order' | 'payment';
  /** Show the leading colour dot (order kind only). */
  dot?: boolean;
};

/** Coloured status pill for order / payment statuses. */
export default function StatusBadge({ status, kind = 'order', dot = true }: Props) {
  if (kind === 'payment') {
    const c = PAYMENT_STATUS_CONFIG[status] || { bg: 'bg-slate-50', text: 'text-slate-600' };
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${c.bg} ${c.text}`}>{status}</span>;
  }
  const cfg = ORDER_STATUS_CONFIG[status] || FALLBACK_STATUS;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5`} />}
      {status}
    </span>
  );
}
