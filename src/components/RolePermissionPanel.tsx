import { useEffect, useMemo, useState } from 'react';
import { Save, Loader2, ChevronDown, Lock } from 'lucide-react';
import { rolesApi, extractError } from '../lib/api';
import type { Role, PermissionCatalog } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import toast from '../lib/toast';

const permsEqual = (a: Set<string>, b: string[]) => a.size === b.length && b.every((p) => a.has(p));
const moduleOf = (perm: string) => perm.split('.')[0];

type Props = {
  /** Existing role id to view/edit. Omit (with isNew) to create. */
  roleId?: string;
  isNew?: boolean;
  /** Show the editable Role Name / Description fields (super-admin create/edit). */
  showBasicInfo?: boolean;
  /** Called after a successful save with the saved role. */
  onSaved?: (role: Role) => void;
};

/**
 * The permission editor (accordion modules + toggles + dirty "Update" bar).
 * Used inline on the Modules page (master-detail) and on the RoleEdit page.
 */
export default function RolePermissionPanel({ roleId, isNew = false, showBasicInfo = false, onSaved }: Props) {
  const { hasPermission, permissions: callerPerms, isSuperAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [catalog, setCatalog] = useState<PermissionCatalog>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  // Perms the role holds but whose module isn't shown in the editor (e.g. a
  // Customer's variants/categories/banners browse perms) — preserved on save.
  const [hiddenPerms, setHiddenPerms] = useState<string[]>([]);
  // Shown perms at load — baseline for the dirty check.
  const [baseline, setBaseline] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        setLoading(true);
        // Fetch the role first so we can scope the catalog to its relevant modules.
        let r: Role | null = null;
        if (!isNew && roleId) {
          r = await rolesApi.getById(roleId);
          if (cancelled) return;
          setRole(r); setName(r.name); setDescription(r.description || '');
        } else {
          setRole(null); setName(''); setDescription('');
        }
        const cat = await rolesApi.getCatalog(r?.slug);
        if (cancelled) return;
        const catObj = cat.catalog as PermissionCatalog;
        setCatalog(catObj);
        // Split the role's perms into shown (editable here) and hidden (preserved).
        const shown = new Set(Object.keys(catObj));
        const all = r?.permissions || [];
        const shownPerms = all.filter((p) => shown.has(moduleOf(p)));
        setSelected(new Set(shownPerms));
        setHiddenPerms(all.filter((p) => !shown.has(moduleOf(p))));
        setBaseline(shownPerms);
        setExpanded(new Set());
      } catch (err: any) {
        toast.error(extractError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    init();
    return () => { cancelled = true; };
  }, [roleId, isNew]);

  const editable =
    !role?.isSystemRole &&
    (isNew ? hasPermission('roles.create') : hasPermission('roles.update')) &&
    (isNew || isSuperAdmin || !!role?.tenantId);
  const readOnly = !editable;

  const dirty = useMemo(() => {
    if (isNew) return name.trim().length > 0 && selected.size > 0;
    if (!role) return false;
    return name !== role.name || description !== (role.description || '') || !permsEqual(selected, baseline);
  }, [isNew, role, name, description, selected, baseline]);

  const togglePerm = (key: string) => {
    if (readOnly) return;
    setSelected((prev) => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });
  };
  const toggleModuleAll = (moduleKey: string, allChecked: boolean) => {
    if (readOnly) return;
    setSelected((prev) => {
      const next = new Set(prev);
      const actions = Object.keys(catalog[moduleKey]?.actions || {});
      if (allChecked) actions.forEach((a) => next.delete(`${moduleKey}.${a}`));
      else actions.forEach((a) => next.add(`${moduleKey}.${a}`));
      return next;
    });
  };
  const toggleExpand = (moduleKey: string) => {
    setExpanded((prev) => { const next = new Set(prev); next.has(moduleKey) ? next.delete(moduleKey) : next.add(moduleKey); return next; });
  };
  const resetChanges = () => {
    if (!role) return;
    setName(role.name); setDescription(role.description || ''); setSelected(new Set(baseline));
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Role name is required');
    if (selected.size + hiddenPerms.length === 0) return toast.error('Select at least one permission');
    setSaving(true);
    try {
      // Merge the editable (shown) perms with the preserved hidden ones.
      const perms = [...new Set([...Array.from(selected), ...hiddenPerms])];
      if (isNew) {
        const created = await rolesApi.create({ name: name.trim(), description: description.trim(), permissions: perms });
        toast.success('Role created');
        onSaved?.(created);
      } else if (roleId) {
        const updated = await rolesApi.update(roleId, { name: name.trim(), description: description.trim(), permissions: perms });
        const shown = new Set(Object.keys(catalog));
        const shownPerms = updated.permissions.filter((p: string) => shown.has(moduleOf(p)));
        setRole(updated); setName(updated.name); setDescription(updated.description || '');
        setSelected(new Set(shownPerms)); setHiddenPerms(updated.permissions.filter((p: string) => !shown.has(moduleOf(p)))); setBaseline(shownPerms);
        toast.success('Permissions updated');
        onSaved?.(updated);
      }
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const grantable = useMemo(() => (isSuperAdmin ? null : new Set(callerPerms)), [callerPerms, isSuperAdmin]);

  if (loading) {
    return <div className="flex items-center justify-center py-16"><Loader2 size={26} className="animate-spin text-primary-600" /></div>;
  }

  const moduleKeys = Object.keys(catalog);
  const totalPerms = moduleKeys.reduce((sum, k) => sum + Object.keys(catalog[k].actions).length, 0);

  return (
    <div className="space-y-5 pb-24">
      {showBasicInfo && (
        <div className="bg-card border border-slate-200 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role Name</label>
            <input type="text" value={name} disabled={readOnly} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dispatch Manager"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-50 disabled:text-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea value={description} disabled={readOnly} onChange={(e) => setDescription(e.target.value)} placeholder="What does this role do?" rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none disabled:bg-slate-50 disabled:text-slate-500" />
          </div>
        </div>
      )}

      <div className="bg-card border border-slate-200 rounded-xl p-6">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {role ? <>Permissions for <span className="text-primary-600">{role.name}</span></> : 'Permissions'}
              {role?.isSystemRole && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded-full border border-amber-200">
                  <Lock size={10} /> read-only
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {selected.size} of {totalPerms} selected
              {!readOnly && <span className="ml-1 text-slate-400">· tap a module to expand</span>}
              {grantable && <span className="ml-2 text-amber-600">· greyed perms cannot be granted</span>}
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {moduleKeys.map((moduleKey) => {
            const def = catalog[moduleKey];
            const actions = Object.keys(def.actions);
            const checkedCount = actions.filter((a) => selected.has(`${moduleKey}.${a}`)).length;
            const allChecked = checkedCount === actions.length;
            const someChecked = checkedCount > 0 && checkedCount < actions.length;
            const isOpen = expanded.has(moduleKey);
            return (
              <div key={moduleKey} className={`border rounded-xl overflow-hidden transition-colors ${checkedCount > 0 ? 'border-primary-200' : 'border-slate-200'}`}>
                <button type="button" onClick={() => toggleExpand(moduleKey)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    {!readOnly && (
                      <input type="checkbox" checked={allChecked} ref={(el) => { if (el) el.indeterminate = someChecked; }}
                        onChange={() => toggleModuleAll(moduleKey, allChecked)} onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 shrink-0" title={allChecked ? 'Clear all' : 'Select all'} />
                    )}
                    <span className="text-sm font-semibold text-slate-800 truncate">{def.label}</span>
                    {def.scope === 'platform' && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-violet-50 text-violet-700 rounded-full border border-violet-200">platform</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${checkedCount > 0 ? 'bg-primary-50 text-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                      {checkedCount} / {actions.length}
                    </span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {isOpen && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-3 bg-card">
                    {actions.map((action) => {
                      const key = `${moduleKey}.${action}`;
                      const checked = selected.has(key);
                      const allowed = !grantable || grantable.has(key);
                      const blocked = !allowed && !readOnly;
                      return (
                        <label key={key}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                            blocked ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                            : checked ? 'bg-primary-50 border-primary-200 text-primary-700'
                            : 'bg-card border-slate-200 hover:bg-slate-50'
                          } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                          <input type="checkbox" checked={checked} disabled={readOnly || blocked} onChange={() => togglePerm(key)} className="w-4 h-4" />
                          <span className="min-w-0 block">{def.actions[action]}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {editable && dirty && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-[260px] z-30 bg-card/95 backdrop-blur border-t border-slate-200 px-6 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">{isNew ? 'Ready to create this role.' : 'You have unsaved permission changes.'}</p>
            <div className="flex items-center gap-2">
              {!isNew && (
                <button onClick={resetChanges} disabled={saving}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">Discard</button>
              )}
              <button onClick={handleSave} disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-sm">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving…' : isNew ? 'Create role' : 'Update permissions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
