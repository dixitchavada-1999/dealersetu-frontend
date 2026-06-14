import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Building2, Users, Eye, Activity } from 'lucide-react';
import { superAdminApi, extractError } from '../../lib/api';
import type { SuperAdminTenant } from '../../lib/api';
import EmptyState from '../../components/EmptyState';
import { PageHeader, SearchInput, Card, IconButton, DataTable } from '../../components/ui';
import type { Column } from '../../components/ui';
import { formatLongDate } from '../../lib/format';
import toast from '../../lib/toast';

/** Super-admin tenants list — stats + searchable table, drill into detail. */
export default function TenantsPage() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<SuperAdminTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, users: 0 });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => { setPage(1); }, [debouncedSearch]);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    Promise.all([superAdminApi.getTenants({ search: debouncedSearch }), superAdminApi.getDashboard()])
      .then(([res, dash]) => {
        setTenants(res.tenants);
        setStats({ total: dash.totalTenants, active: dash.activeTenants, inactive: dash.inactiveTenants, users: dash.totalUsers });
      })
      .catch((e) => toast.error(extractError(e)))
      .finally(() => setLoading(false));
  }, [debouncedSearch]);

  const statCards = [
    { label: 'Total Tenants', value: stats.total, icon: Building2, color: 'bg-blue-600' },
    { label: 'Active', value: stats.active, icon: Building2, color: 'bg-emerald-600' },
    { label: 'Inactive', value: stats.inactive, icon: Building2, color: 'bg-red-600' },
    { label: 'Total Users', value: stats.users, icon: Users, color: 'bg-violet-600' },
  ];

  const columns: Column<SuperAdminTenant>[] = [
    { header: 'Tenant', render: (t) => (<><p className="text-sm font-semibold text-slate-900">{t.name}</p>{t.businessType && <p className="text-xs text-slate-400">{t.businessType}</p>}</>) },
    { header: 'Email', headerClassName: 'hidden sm:table-cell', cellClassName: 'text-sm text-slate-600 hidden sm:table-cell', render: (t) => t.email || '-' },
    { header: 'Phone', headerClassName: 'hidden md:table-cell', cellClassName: 'text-sm text-slate-600 hidden md:table-cell', render: (t) => t.phone || '-' },
    { header: 'Users', headerClassName: 'hidden lg:table-cell', cellClassName: 'text-sm text-slate-600 hidden lg:table-cell', render: (t) => t.userCount },
    {
      header: 'Status',
      render: (t) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${t.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${t.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
          {t.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { header: 'Created', headerClassName: 'hidden md:table-cell', cellClassName: 'text-sm text-slate-500 hidden md:table-cell', render: (t) => formatLongDate(t.createdAt) },
    {
      header: 'Actions',
      align: 'right',
      render: (t) => (
        <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
          <IconButton icon={Activity} label="View Activity" onClick={() => navigate(`/super-admin/activity-logs?tenantId=${t.id}`)} />
          <IconButton icon={Eye} label="View" onClick={() => navigate(`/super-admin/tenants/${t.id}`)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Tenants" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {statCards.map((c) => (
          <Card key={c.label} padding="sm" hover>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center shadow-sm`}>
                <c.icon size={18} className="text-white" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{c.value}</p>
                <p className="text-xs text-slate-500">{c.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mb-4"><SearchInput value={search} onChange={setSearch} placeholder="Search by name or email..." /></div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>
      ) : tenants.length === 0 ? (
        <EmptyState title={search ? 'No results' : 'No tenants'} message={search ? 'Try a different search.' : 'No tenants registered yet.'} />
      ) : (
        <DataTable
          columns={columns}
          rows={tenants.slice((page - 1) * pageSize, page * pageSize)}
          rowKey={(t) => t.id}
          onRowClick={(t) => navigate(`/super-admin/tenants/${t.id}`)}
          pagination={{ page, pageSize, total: tenants.length, onPageChange: setPage, onPageSizeChange: (s) => { setPageSize(s); setPage(1); } }}
        />
      )}
    </div>
  );
}
