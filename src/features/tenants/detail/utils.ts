/** Tenant-detail formatting + badge helpers (super-admin drilldown). */
export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Placed: 'bg-blue-50 text-blue-700', Approved: 'bg-amber-50 text-amber-700',
    Dispatched: 'bg-orange-50 text-orange-700', Delivered: 'bg-emerald-50 text-emerald-700',
    Cancelled: 'bg-red-50 text-red-700', Pending: 'bg-red-50 text-red-700',
    Partial: 'bg-amber-50 text-amber-700', Paid: 'bg-emerald-50 text-emerald-700',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};

export const activeBadge = (a: boolean) => (a ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700');
export const activeDot = (a: boolean) => (a ? 'bg-emerald-500' : 'bg-red-500');

export const stockLabel = (qty: number) => {
  if (qty === 0) return { label: 'Out of Stock', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
  if (qty <= 10) return { label: 'Low Stock', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' };
  return { label: 'In Stock', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
};
