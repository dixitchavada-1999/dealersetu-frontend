// Color maps + filter option lists + time helpers for the activity log views.

export const MODULES = ['All', 'Auth', 'Order', 'Product', 'Category', 'Customer', 'Variant', 'Feedback', 'Settings', 'Team'];
export const ROLES = ['All', 'ADMIN', 'USER', 'DISPATCH', 'PRODUCTION', 'MARKETING', 'SUPER_ADMIN'];
export const ACTIONS = ['All', 'create', 'update', 'delete', 'login', 'logout', 'place_order', 'approve', 'dispatch', 'deliver', 'restock', 'switch_tenant'];

export const LOG_TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  info: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  success: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  error: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  critical: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-600' },
};

export const MODULE_COLORS: Record<string, string> = {
  order: 'bg-blue-50 text-blue-700', product: 'bg-emerald-50 text-emerald-700', category: 'bg-teal-50 text-teal-700',
  auth: 'bg-violet-50 text-violet-700', customer: 'bg-orange-50 text-orange-700', variant: 'bg-cyan-50 text-cyan-700',
  feedback: 'bg-amber-50 text-amber-700', settings: 'bg-slate-100 text-slate-700', team: 'bg-primary-50 text-primary-700',
};

export const ACTION_COLORS: Record<string, string> = {
  create: 'bg-emerald-50 text-emerald-700', update: 'bg-blue-50 text-blue-700', delete: 'bg-red-50 text-red-700',
  login: 'bg-violet-50 text-violet-700', logout: 'bg-slate-100 text-slate-600', place_order: 'bg-primary-50 text-primary-700',
  approve: 'bg-emerald-50 text-emerald-700', dispatch: 'bg-amber-50 text-amber-700', deliver: 'bg-teal-50 text-teal-700',
  restock: 'bg-cyan-50 text-cyan-700', switch_tenant: 'bg-violet-50 text-violet-700',
};

export const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-blue-50 text-blue-700', USER: 'bg-emerald-50 text-emerald-700', DISPATCH: 'bg-amber-50 text-amber-700',
  PRODUCTION: 'bg-cyan-50 text-cyan-700', MARKETING: 'bg-orange-50 text-orange-700', SUPER_ADMIN: 'bg-violet-50 text-violet-700',
};

export function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function fullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
