import type { ReactNode } from 'react';
import { useModules } from '../contexts/ModulesContext';
import { useAuth } from '../contexts/AuthContext';
import UnderDevelopment from '../pages/UnderDevelopment';

/**
 * Wraps a feature page. If the module is flagged "under development" by the
 * super-admin, tenant users see a placeholder instead of the page. Super-admin
 * bypasses (so they can build/test the real screen).
 */
export default function ModuleGate({ moduleKey, label, children }: { moduleKey: string; label?: string; children: ReactNode }) {
  const { isUnderDevelopment } = useModules();
  const { isSuperAdmin } = useAuth();

  if (isUnderDevelopment(moduleKey) && !isSuperAdmin) {
    return <UnderDevelopment label={label} />;
  }
  return <>{children}</>;
}
