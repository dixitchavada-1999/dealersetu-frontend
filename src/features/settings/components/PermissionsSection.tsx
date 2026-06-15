import { Card, Toggle } from '../../../components/ui';
import type { useSettings } from '../hooks/useSettings';

type Props = {
  perms: ReturnType<typeof useSettings>['perms'];
};

function PermissionGroup<T extends Record<string, boolean>>({ title, perms, onToggle }: { title: string; perms: T; onToggle: (key: keyof T) => void }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(perms) as (keyof T)[]).map(key => (
          <div key={String(key)} className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 transition-colors">
            <span className="text-sm font-medium text-slate-700 capitalize">{String(key)}</span>
            <Toggle checked={perms[key]} onChange={() => onToggle(key)} aria-label={`${title} ${String(key)}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Role-based access toggles for dispatch, production, and marketing teams. */
export default function PermissionsSection({ perms }: Props) {
  return (
    <Card padding="lg">
      <div className="space-y-6">
        <PermissionGroup title="Dispatch Permissions" perms={perms.dispatchPerms} onToggle={perms.toggleDispatchPerm} />
        <PermissionGroup title="Production Permissions" perms={perms.productionPerms} onToggle={perms.toggleProductionPerm} />
        <PermissionGroup title="Marketing Permissions" perms={perms.marketingPerms} onToggle={perms.toggleMarketingPerm} />
      </div>
    </Card>
  );
}
