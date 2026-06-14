import { useAuth } from '../contexts/AuthContext';

/**
 * Decoded permission payload baked into the access JWT at login time.
 * Mirrors the backend `utils/issueAuthTokens.js` payload shape.
 */
export type JwtPermissionPayload = {
  id?: string;
  tenantId?: string | null;
  role?: string;
  roleSlug?: string | null;
  isSuperAdmin?: boolean;
  permissions?: string[];
  permissionVersion?: number;
  iat?: number;
  exp?: number;
};

/**
 * Decode a JWT's base64 payload section without verifying its signature.
 * The token's authenticity is already enforced server-side — the frontend
 * only needs to read the embedded permissions array.
 */
export function decodeJwt(token: string | null | undefined): JwtPermissionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    // Older browsers / weird encodings — fall back to a simpler decoder
    try {
      return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      return null;
    }
  }
}

/**
 * Pure check — does this list of effective permissions include the key?
 */
export function hasPermission(perms: string[] | null | undefined, key: string): boolean {
  if (!Array.isArray(perms)) return false;
  return perms.includes(key);
}

export function hasAnyPermission(perms: string[] | null | undefined, keys: string[]): boolean {
  if (!Array.isArray(perms)) return false;
  return keys.some((k) => perms.includes(k));
}

export function hasAllPermissions(perms: string[] | null | undefined, keys: string[]): boolean {
  if (!Array.isArray(perms)) return false;
  return keys.every((k) => perms.includes(k));
}

/**
 * React hook — returns a boolean indicating whether the current user has
 * the given permission. Super-admins always return true.
 */
export function useCan(permission: string): boolean {
  const { user, isSuperAdmin } = useAuth();
  if (isSuperAdmin) return true;
  return hasPermission(user?.permissions, permission);
}

/**
 * React hook — boolean for any-of-many.
 */
export function useCanAny(permissions: string[]): boolean {
  const { user, isSuperAdmin } = useAuth();
  if (isSuperAdmin) return true;
  return hasAnyPermission(user?.permissions, permissions);
}

/**
 * React hook — boolean for all-of-many.
 */
export function useCanAll(permissions: string[]): boolean {
  const { user, isSuperAdmin } = useAuth();
  if (isSuperAdmin) return true;
  return hasAllPermissions(user?.permissions, permissions);
}
