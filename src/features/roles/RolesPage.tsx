import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, ShieldCheck } from 'lucide-react';
import { rolesApi, extractError } from '../../lib/api';
import type { Role } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import RolePermissionPanel from '../../components/RolePermissionPanel';
import { SearchInput, Button } from '../../components/ui';
import toast from '../../lib/toast';
import RoleCard from './components/RoleCard';

/** Modules & Permissions — role cards (activate/select) + inline permission editor. */
export default function RolesPage() {
  const navigate = useNavigate();
  const { hasPermission, isSuperAdmin, applyEnabledRoles } = useAuth();
  const canDelete = hasPermission('roles.delete');

  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    rolesApi.getAll()
      .then((rs) => { setRoles(rs); setSelectedId((cur) => (cur && rs.some((r) => r.id === cur) ? cur : rs[0]?.id ?? null)); })
      .catch((err) => toast.error(extractError(err)))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleToggle = async (role: Role, e: React.MouseEvent) => {
    e.stopPropagation();
    setTogglingId(role.id);
    try {
      const res = await rolesApi.setActivation(role.id, !role.active);
      setRoles((prev) => prev.map((r) => (r.id === role.id ? { ...r, active: !role.active } : r)));
      applyEnabledRoles(res.enabledRoles || []);
      toast.success(`${role.name} ${!role.active ? 'activated' : 'deactivated'}`);
      load();
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await rolesApi.delete(deleteTarget.id);
      toast.success('Role deleted');
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setDeleting(false);
    }
  };

  const filtered = roles.filter((r) => {
    const term = search.toLowerCase();
    return r.name.toLowerCase().includes(term) || r.slug.toLowerCase().includes(term) || (r.description || '').toLowerCase().includes(term);
  });
  const activatable = filtered.filter((r) => r.isDynamic);
  const alwaysOn = filtered.filter((r) => !r.isDynamic);
  const selectedRole = roles.find((r) => r.id === selectedId) || null;

  const card = (role: Role) => (
    <RoleCard key={role.id} role={role} selected={role.id === selectedId} isSuperAdmin={isSuperAdmin} canDelete={canDelete} toggling={togglingId === role.id} onSelect={setSelectedId} onToggle={handleToggle} onDelete={setDeleteTarget} />
  );

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><ShieldCheck size={26} className="text-primary-600" />Modules &amp; Permissions</h1>
          <p className="text-sm text-slate-500 mt-1">{isSuperAdmin ? 'Pick a role to view and edit its permissions below.' : 'Activate the modules your business needs, then pick one to set its permissions below.'}</p>
        </div>
        {isSuperAdmin && <Button icon={Plus} onClick={() => navigate('/roles/new')}>New Role</Button>}
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search by name or slug…" className="max-w-md" />

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState title={search ? 'No matching roles' : 'No roles yet'} message={search ? 'Try a different search term.' : 'No roles available yet.'} />
      ) : isSuperAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{filtered.map(card)}</div>
      ) : (
        <div className="space-y-8">
          {activatable.length > 0 && (
            <div>
              <div className="mb-3">
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Activatable Modules</h2>
                <p className="text-xs text-slate-500 mt-0.5">Switch on the modules your business uses — an active module appears in the menu.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{activatable.map(card)}</div>
            </div>
          )}
          {alwaysOn.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{alwaysOn.map(card)}</div>}
        </div>
      )}

      {selectedRole && (
        <div className="pt-2 border-t border-slate-200">
          <RolePermissionPanel key={selectedRole.id} roleId={selectedRole.id} onSaved={load} />
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete role?" message={`This will permanently delete the "${deleteTarget?.name}" role. This action cannot be undone.`} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} isLoading={deleting} />
    </div>
  );
}
