import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { modulesApi } from '../lib/api';
import type { ModuleItem, ModuleType } from '../lib/api';
import { useAuth } from './AuthContext';

type Ctx = {
  modules: ModuleItem[];
  /** Module key → type (customer/owner/both). Unknown keys default to 'both'. */
  moduleType: (key: string) => ModuleType;
  isUnderDevelopment: (key: string) => boolean;
  refresh: () => void;
};

const ModulesContext = createContext<Ctx>({
  modules: [],
  moduleType: () => 'both',
  isUnderDevelopment: () => false,
  refresh: () => {},
});

export const useModules = () => useContext(ModulesContext);

export function ModulesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [modules, setModules] = useState<ModuleItem[]>([]);

  const refresh = useCallback(async () => {
    try {
      const res = await modulesApi.get();
      setModules(res.modules);
    } catch {
      /* non-fatal */
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) refresh();
    else setModules([]);
  }, [isAuthenticated, refresh]);

  const moduleType = useCallback((key: string): ModuleType => modules.find((m) => m.key === key)?.type ?? 'both', [modules]);
  const isUnderDevelopment = useCallback((key: string) => modules.some((m) => m.key === key && m.underDevelopment), [modules]);

  return (
    <ModulesContext.Provider value={{ modules, moduleType, isUnderDevelopment, refresh }}>
      {children}
    </ModulesContext.Provider>
  );
}
