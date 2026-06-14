// Indian-locale number / currency / date formatting — shared across the app.

/** Compact number with Indian units: 1.2Cr · 3.4L · 5.6K · 1,234. */
export const formatCompact = (n: number): string => {
  if (n >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000) return `${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return new Intl.NumberFormat('en-IN').format(Math.round(n));
};

/** Full INR currency, no paise: ₹1,82,095. */
export const formatCurrency = (n: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

/** INR currency WITH paise: ₹1,82,095.50. */
export const formatCurrencyExact = (n: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

/** Short day-month date: "10 Jun". */
export const formatShortDate = (d: string): string =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

/** Day-month-year date: "10 Jun 2026". */
export const formatLongDate = (d: string): string =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/** Date + time: "10 Jun 2026, 04:30 PM" (returns "-" when empty). */
export const formatDateTime = (d?: string): string =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
