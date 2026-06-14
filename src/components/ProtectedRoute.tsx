import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

type Props = {
  /** Permission required for this route group. Super-admin always passes. */
  permission?: string;
  /** Restrict to super-admin only (the platform-level pages). */
  superAdminOnly?: boolean;
};

export default function ProtectedRoute({ permission, superAdminOnly = false }: Props) {
  const { isAuthenticated, isSuperAdmin, isLoading, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary-600" />
          <p className="text-sm text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (superAdminOnly) {
    if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;
    return <Outlet />;
  }

  // Super-admins shouldn't land on tenant pages — bounce to their portal.
  if (isSuperAdmin && !permission) return <Navigate to="/super-admin/tenants" replace />;

  if (permission && !hasPermission(permission)) {
    return <Navigate to={isSuperAdmin ? '/super-admin/tenants' : '/dashboard'} replace />;
  }

  return <Outlet />;
}
