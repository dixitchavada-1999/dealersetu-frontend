import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderTree, Package, ShoppingCart, Users, Truck, Settings, X, ShoppingBag, Building2, Wrench, Megaphone, MessageSquare, Bell, Activity, ImageIcon, ShieldCheck, Construction, Mail,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useModules } from '../contexts/ModulesContext';

type MenuItem = {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  /** Permission required to see this item. Omit for always-visible. */
  permission?: string;
  /** Restrict to super-admin (used by the platform-only sidebar). */
  superAdminOnly?: boolean;
  /** Dynamic-role slug — item shows only if the owner activated this role for the tenant. */
  role?: string;
  /** Module key — its DB `type` (customer/owner/both) decides which menu it shows in. */
  module?: string;
};

// Tenant-portal menu — Owner + custom-role users see whichever items they
// have the required permission for (and whose module type allows owner/both).
const tenantItems: MenuItem[] = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard',     permission: 'dashboard.read',    module: 'dashboard' },
  { to: '/categories',    icon: FolderTree,      label: 'Categories',    permission: 'categories.read',   module: 'categories' },
  { to: '/products',      icon: Package,         label: 'Products',      permission: 'products.read',     module: 'products' },
  { to: '/orders',        icon: ShoppingCart,    label: 'Orders',        permission: 'orders.read',       module: 'orders' },
  { to: '/customers',     icon: Users,           label: 'Customers',     permission: 'customers.read',    module: 'customers' },
  { to: '/dispatch',      icon: Truck,           label: 'Dispatch',      permission: 'team.read', role: 'dispatch',   module: 'dispatch' },
  { to: '/production',    icon: Wrench,          label: 'Production',    permission: 'team.read', role: 'production', module: 'production' },
  { to: '/marketing',     icon: Megaphone,       label: 'Marketing',     permission: 'team.read', role: 'marketing', module: 'marketing' },
  { to: '/notifications', icon: Bell,            label: 'Notifications', permission: 'notifications.read', module: 'notifications' },
  { to: '/feedback',      icon: MessageSquare,   label: 'Feedback',      permission: 'feedback.read',     module: 'feedback' },
  { to: '/promotions',    icon: ImageIcon,       label: 'Promotions',    permission: 'banners.read',      module: 'promotions' },
  { to: '/roles',         icon: ShieldCheck,     label: 'Modules',       permission: 'roles.read',        module: 'roles' },
  { to: '/settings',      icon: Settings,        label: 'Settings',      permission: 'settings.read',     module: 'settings' },
];

// Customer menu — gated by customer-role permission AND the module's type
// (customer/both). My Products & Cart are customer-only (no catalog module).
const customerItems: MenuItem[] = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard',     permission: 'dashboard.read',     module: 'dashboard' },
  { to: '/products',      icon: Package,         label: 'Products',      permission: 'products.read',      module: 'products' },
  { to: '/my-products',   icon: ShoppingBag,     label: 'My Products',   permission: 'products.read' },
  { to: '/cart',          icon: ShoppingCart,    label: 'Cart',          permission: 'orders.create' },
  { to: '/orders',        icon: ShoppingCart,    label: 'Orders',        permission: 'orders.read',        module: 'orders' },
  { to: '/notifications', icon: Bell,            label: 'Notifications', permission: 'notifications.read', module: 'notifications' },
  { to: '/feedback',      icon: MessageSquare,   label: 'Feedback',      permission: 'feedback.read',      module: 'feedback' },
];

const superAdminItems: MenuItem[] = [
  { to: '/super-admin/tenants',        icon: Building2, label: 'Tenants',        permission: 'tenants.read',      superAdminOnly: true },
  { to: '/super-admin/activity-logs',  icon: Activity,  label: 'Activity Logs',  permission: 'activitylogs.read', superAdminOnly: true },
  { to: '/super-admin/module-status',  icon: Construction, label: 'Module Status', superAdminOnly: true },
  { to: '/super-admin/email-templates', icon: Mail, label: 'Email Templates', superAdminOnly: true },
  { to: '/super-admin/settings', icon: Settings, label: 'Settings', superAdminOnly: true },
  { to: '/roles',                      icon: ShieldCheck, label: 'Modules',        permission: 'systemroles.read',  superAdminOnly: true },
];

type Props = { open: boolean; onClose: () => void };

export default function Sidebar({ open, onClose }: Props) {
  const { isAdmin, isDispatch, isProduction, isMarketing, isSuperAdmin, isCustomer, user, hasPermission } = useAuth();
  const { moduleType } = useModules();

  // Pick the right menu pool, then filter by permission.
  let pool: MenuItem[];
  if (isSuperAdmin) pool = superAdminItems;
  else if (isCustomer) pool = customerItems;
  else pool = tenantItems;

  // Dynamic-role modules (Dispatch/Production/Marketing) only show when the
  // owner has activated that role for the tenant. Super-admin pool is unaffected.
  const enabledRoles = user?.tenant?.enabledRoles ?? [];
  const items = pool.filter((item) => {
    if (item.permission && !hasPermission(item.permission)) return false;
    if (item.role && !isSuperAdmin && !enabledRoles.includes(item.role)) return false;
    // Module type (set by super-admin) decides which menu the module shows in.
    if (item.module && !isSuperAdmin) {
      const t = moduleType(item.module);
      if (isCustomer && !(t === 'customer' || t === 'both')) return false;
      if (!isCustomer && !(t === 'owner' || t === 'both')) return false;
    }
    return true;
  });

  const roleLabel = isSuperAdmin
    ? 'Super Admin'
    : isAdmin
      ? 'Owner'
      : isDispatch
        ? 'Dispatch'
        : isProduction
          ? 'Production'
          : isMarketing
            ? 'Marketing'
            : isCustomer
              ? 'Customer'
              : (user?.roleSlug ? user.roleSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Team');

  // slate utilities auto-invert in dark mode (see index.css), so these classes
  // give dark-on-white in light mode and light-on-navy in dark mode.
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary-600 text-white shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-sidebar border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #0F52BA 0%, #00C9A7 100%)',
                boxShadow: '0 8px 20px rgba(0, 201, 167, 0.3)',
              }}
            >
              <ShoppingBag size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              Dealer<span style={{ background: 'linear-gradient(135deg, #0F52BA, #00C9A7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Setu</span>
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* User badge */}
        <div className="mx-4 mb-4 px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-600 truncate">{roleLabel}</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 mb-2">
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Menu</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {items.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'} className={linkClass} onClick={onClose}>
              <item.icon size={19} strokeWidth={1.8} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 mx-3 mb-3 rounded-xl bg-primary-600/10 border border-primary-500/20">
          <p className="text-xs font-medium text-primary-700">DealerSetu v1.0</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{isSuperAdmin ? 'Platform Admin' : isCustomer ? 'Customer Portal' : 'Admin Panel'}</p>
        </div>

      </aside>
    </>
  );
}
