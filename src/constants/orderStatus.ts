// Shared visual styling for order + payment statuses (dashboard, orders, etc.).

export type StatusStyle = { bg: string; dot: string; text: string };

export const ORDER_STATUS_CONFIG: Record<string, StatusStyle> = {
  Placed: { bg: 'bg-blue-50', dot: 'bg-blue-500', text: 'text-blue-700' },
  Approved: { bg: 'bg-amber-50', dot: 'bg-amber-500', text: 'text-amber-700' },
  Dispatched: { bg: 'bg-orange-50', dot: 'bg-orange-500', text: 'text-orange-700' },
  Delivered: { bg: 'bg-emerald-50', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  Cancelled: { bg: 'bg-red-50', dot: 'bg-red-500', text: 'text-red-700' },
};

export const PAYMENT_STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  Pending: { bg: 'bg-red-50', text: 'text-red-700' },
  Partial: { bg: 'bg-amber-50', text: 'text-amber-700' },
  Paid: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
};

/** Fallback when a status has no configured style. */
export const FALLBACK_STATUS: StatusStyle = { bg: 'bg-slate-50', dot: 'bg-slate-400', text: 'text-slate-600' };
