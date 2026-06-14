import type { ReactNode } from 'react';
import { useCan, useCanAny, useCanAll } from '../lib/permissions';

type CanProps = {
  /** Required permission key, e.g. "products.create" */
  permission?: string;
  /** Render if user has ANY of these */
  anyOf?: string[];
  /** Render if user has ALL of these */
  allOf?: string[];
  /** What to render if the user lacks the permission(s) */
  fallback?: ReactNode;
  children: ReactNode;
};

/**
 * Declarative permission gate.
 *
 * Examples:
 *   <Can permission="products.create"><AddButton /></Can>
 *   <Can anyOf={["orders.approve","orders.dispatch"]}>...</Can>
 *   <Can allOf={["roles.read","roles.update"]} fallback={<Locked/>}>...</Can>
 *
 * Super-admin always renders the children regardless of the permission set.
 *
 * NOTE: This is a UI-only convenience — never the security boundary. The
 * backend's `requirePermission()` middleware enforces real authorization.
 */
export default function Can({ permission, anyOf, allOf, fallback = null, children }: CanProps) {
  // Each hook is called unconditionally to obey React rules of hooks.
  const single = useCan(permission || '__never__');
  const any = useCanAny(anyOf || []);
  const all = useCanAll(allOf || []);

  let allowed = false;
  if (permission) allowed = single;
  else if (anyOf && anyOf.length) allowed = any;
  else if (allOf && allOf.length) allowed = all;
  else allowed = true; // No constraint = always render (Can with no props)

  return <>{allowed ? children : fallback}</>;
}
