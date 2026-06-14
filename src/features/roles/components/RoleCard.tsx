import { Lock, Users as UsersIcon, BadgeCheck, Trash2 } from 'lucide-react';
import type { Role } from '../../../lib/types';

type Props = {
  role: Role;
  selected: boolean;
  isSuperAdmin: boolean;
  canDelete: boolean;
  toggling: boolean;
  onSelect: (id: string) => void;
  onToggle: (role: Role, e: React.MouseEvent) => void;
  onDelete: (role: Role) => void;
};

/** Selectable role/module card with activation toggle + delete (per permissions). */
export default function RoleCard({ role, selected, isSuperAdmin, canDelete, toggling, onSelect, onToggle, onDelete }: Props) {
  const isSystem = role.isSystemRole;
  const usersAssigned = role.userCount || 0;
  const blockedDelete = isSystem || role.isDefault || usersAssigned > 0;
  const isDyn = !isSuperAdmin && !!role.isDynamic;

  return (
    <button
      type="button"
      onClick={() => onSelect(role.id)}
      className={`text-left rounded-xl p-5 border transition-all ${
        selected
          ? 'bg-primary-50/50 border-primary-400 ring-2 ring-primary-500/30 shadow-sm'
          : isDyn && !role.active
            ? 'bg-card border-slate-200 opacity-80 hover:opacity-100'
            : 'bg-card border-slate-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{role.name}</h3>
          {isSystem && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded-full border border-amber-200"><Lock size={10} /> System</span>}
          {isDyn && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${role.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${role.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              {role.active ? 'Active' : 'Inactive'}
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-slate-400 truncate">{role.slug}</span>
      </div>

      {role.description && <p className="text-sm text-slate-500 mb-3 line-clamp-2">{role.description}</p>}

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1"><BadgeCheck size={14} />{role.permissions.length} perm{role.permissions.length === 1 ? '' : 's'}</span>
        <span className="inline-flex items-center gap-1"><UsersIcon size={14} />{usersAssigned} user{usersAssigned === 1 ? '' : 's'}</span>
        <span className="ml-auto px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">{role.scope}</span>
      </div>

      {(isDyn || (isSuperAdmin && canDelete && !blockedDelete)) && (
        <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-slate-100">
          {isDyn && (
            <span className="mr-auto inline-flex items-center gap-2">
              <span className={`text-xs font-medium ${role.active ? 'text-emerald-600' : 'text-slate-500'}`}>{role.active ? 'Active' : 'Inactive'}</span>
              <span
                onClick={(e) => onToggle(role, e)}
                role="switch"
                aria-checked={role.active}
                className={`relative inline-block w-11 h-6 rounded-full transition-colors cursor-pointer ${toggling ? 'opacity-50' : ''} ${role.active ? 'bg-primary-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${role.active ? 'left-[22px]' : 'left-0.5'}`} />
              </span>
            </span>
          )}
          {isSuperAdmin && canDelete && !blockedDelete && (
            <span onClick={(e) => { e.stopPropagation(); onDelete(role); }} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors cursor-pointer" title="Delete role"><Trash2 size={16} /></span>
          )}
        </div>
      )}
    </button>
  );
}
