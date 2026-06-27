import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../lib/types';
import api, { authApi, setTokens, setUser as storeUser, getToken, getStoredUser, extractError } from '../lib/api';
import { decodeJwt, hasPermission, hasAnyPermission, hasAllPermissions } from '../lib/permissions';

type AvailableTenant = { id: string; name: string; businessType: string; logo: string; isCurrent: boolean };

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDispatch: boolean;
  isProduction: boolean;
  isMarketing: boolean;
  isSuperAdmin: boolean;
  isCustomer: boolean;
  /** Effective permission keys from the user's JWT. Empty for unauthenticated. */
  permissions: string[];
  /** Single-key check. Super-admin always returns true. */
  hasPermission: (key: string) => boolean;
  /** Any-of-many check. */
  hasAnyPermission: (keys: string[]) => boolean;
  /** All-of-many check. */
  hasAllPermissions: (keys: string[]) => boolean;
  availableTenants: AvailableTenant[];
  login: (identifier: string, password: string) => Promise<void>;
  activateAccount: (code: string, password: string, confirmPassword: string) => Promise<void>;
  updateProfile: (data: { firstName?: string; lastName?: string; email?: string; mobileNumber?: string; password?: string }) => Promise<void>;
  /** Update the cached tenant.enabledRoles after the owner toggles a role (drives sidebar gating). */
  applyEnabledRoles: (roles: string[]) => void;
  switchTenant: (tenantId: string) => Promise<void>;
  addBusiness: (loginCode: string) => Promise<void>;
  register: (data: {
    firstName: string; lastName: string; email: string;
    userName: string; password: string; mobileNumber: string;
    businessName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

/** Detect if string looks like a phone number */
const isPhoneNumber = (val: string) => /^\+?\d{7,15}$/.test(val.replace(/[\s-]/g, ''));

/**
 * Merge JWT-embedded RBAC fields (permissions, roleSlug, isSuperAdmin,
 * permissionVersion) into the user object returned by the backend so the
 * UI can read them from `useAuth().user` without decoding the token again.
 */
function enrichUserWithToken(user: User, accessToken: string): User {
  const payload = decodeJwt(accessToken);
  if (!payload) return user;
  return {
    ...user,
    permissions: Array.isArray(payload.permissions) ? payload.permissions : (user.permissions ?? []),
    roleSlug: payload.roleSlug ?? user.roleSlug ?? null,
    permissionVersion: typeof payload.permissionVersion === 'number'
      ? payload.permissionVersion
      : (user.permissionVersion ?? 0),
    // Trust the JWT's isSuperAdmin over the user-object flag (JWT is authoritative)
    isSuperAdmin: typeof payload.isSuperAdmin === 'boolean' ? payload.isSuperAdmin : user.isSuperAdmin,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableTenants, setAvailableTenants] = useState<AvailableTenant[]>([]);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const stored = getStoredUser();
      if (stored) {
        // Re-enrich on page reload — handles stored users from before the
        // RBAC migration that don't yet have `permissions` in localStorage.
        setUser(enrichUserWithToken(stored, token));
      }
      const storedTenants = localStorage.getItem('availableTenants');
      if (storedTenants) {
        try { setAvailableTenants(JSON.parse(storedTenants)); } catch { /* ignore corrupt JSON */ }
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthResponse = useCallback((res: { user: any; tokens: { accessToken: string; refreshToken: string }; availableTenants?: AvailableTenant[] }) => {
    setTokens(res.tokens.accessToken, res.tokens.refreshToken);
    const enriched = enrichUserWithToken(res.user as User, res.tokens.accessToken);
    storeUser(enriched);
    setUser(enriched);
    if (res.availableTenants && res.availableTenants.length > 1) {
      setAvailableTenants(res.availableTenants);
      localStorage.setItem('availableTenants', JSON.stringify(res.availableTenants));
    }
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const credentials = isPhoneNumber(identifier)
      ? { mobileNumber: identifier, password, deviceId: 'web-browser' }
      : identifier.includes('@')
        ? { email: identifier, password, deviceId: 'web-browser' }
        : { userName: identifier, password, deviceId: 'web-browser' };
    const res = await authApi.login(credentials);
    handleAuthResponse(res);
  }, [handleAuthResponse]);

  const activateAccount = useCallback(async (code: string, password: string, confirmPassword: string) => {
    const res = await authApi.activateAccount(code, password, confirmPassword);
    handleAuthResponse(res);
  }, [handleAuthResponse]);

  const applyEnabledRoles = useCallback((roles: string[]) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, tenant: { ...(prev.tenant as any), enabledRoles: roles } } as User;
      storeUser(next);
      return next;
    });
  }, []);

  const updateProfile = useCallback(async (data: { firstName?: string; lastName?: string; email?: string; mobileNumber?: string; password?: string }) => {
    const res = await authApi.updateProfile(data);
    // Preserve previously-decoded permissions etc. — profile updates don't change roles
    const merged: User = { ...(user || ({} as User)), ...(res.user as User) };
    storeUser(merged);
    setUser(merged);
  }, [user]);

  const switchTenant = useCallback(async (tenantId: string) => {
    const { data } = await api.post('/auth/switch-tenant', { tenantId });
    const { user: userData, tokens, availableTenants: tenants } = data.data;
    setTokens(tokens.accessToken, tokens.refreshToken);
    const enriched = enrichUserWithToken(userData as User, tokens.accessToken);
    storeUser(enriched);
    setUser(enriched);
    if (tenants?.length) {
      setAvailableTenants(tenants);
      localStorage.setItem('availableTenants', JSON.stringify(tenants));
    }
  }, []);

  const addBusiness = useCallback(async (loginCode: string) => {
    const res = await authApi.addBusiness(loginCode);
    const tenants = res?.availableTenants;
    if (tenants?.length) {
      setAvailableTenants(tenants);
      localStorage.setItem('availableTenants', JSON.stringify(tenants));
    }
  }, []);

  const register = useCallback(async (data: {
    firstName: string; lastName: string; email: string;
    userName: string; password: string; mobileNumber: string;
    businessName?: string;
  }) => {
    const res = await authApi.register(data);
    setTokens(res.tokens.accessToken, res.tokens.refreshToken);
    const enriched = enrichUserWithToken(res.user as User, res.tokens.accessToken);
    storeUser(enriched);
    setUser(enriched);
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* network errors are non-fatal here */ }
    setUser(null);
    setAvailableTenants([]);
    localStorage.removeItem('availableTenants');
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = !!user?.isAdmin;
  const isDispatch = !!user?.isDispatch;
  const isProduction = !!user?.isProduction;
  const isMarketing = !!user?.isMarketing;
  const isSuperAdmin = !!user?.isSuperAdmin;
  // Prefer the explicit backend flag; fall back to elimination for old tokens.
  const isCustomer = isAuthenticated && (user?.isCustomer ?? (!isAdmin && !isDispatch && !isProduction && !isMarketing && !isSuperAdmin));
  const permissions = user?.permissions ?? [];

  const ctxHasPermission = useCallback(
    (key: string) => isSuperAdmin || hasPermission(permissions, key),
    [isSuperAdmin, permissions]
  );
  const ctxHasAnyPermission = useCallback(
    (keys: string[]) => isSuperAdmin || hasAnyPermission(permissions, keys),
    [isSuperAdmin, permissions]
  );
  const ctxHasAllPermissions = useCallback(
    (keys: string[]) => isSuperAdmin || hasAllPermissions(permissions, keys),
    [isSuperAdmin, permissions]
  );

  return (
    <AuthContext.Provider value={{
      user, isLoading, isAuthenticated,
      isAdmin, isDispatch, isProduction, isMarketing, isSuperAdmin, isCustomer,
      permissions,
      hasPermission: ctxHasPermission,
      hasAnyPermission: ctxHasAnyPermission,
      hasAllPermissions: ctxHasAllPermissions,
      availableTenants,
      login, activateAccount, updateProfile, applyEnabledRoles, switchTenant, addBusiness, register, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { extractError };
