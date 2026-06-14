import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, Search, Loader2, Filter, X } from 'lucide-react';
import { superAdminApi, extractError } from '../../lib/api';
import type { ActivityLog } from '../../lib/types';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import toast from '../../lib/toast';
import { MODULES, ROLES, ACTIONS } from './constants';
import LogRow from './components/LogRow';
import LogDetailDrawer from './components/LogDetailDrawer';

type PaginationState = { page: number; limit: number; total: number; pages: number };
const SELECT = 'px-3 py-2 bg-card border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none appearance-none cursor-pointer w-full';

/** Super-admin activity logs — filters, table, detail drawer. */
export default function ActivityLogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [module, setModule] = useState(searchParams.get('module') || 'All');
  const [role, setRole] = useState(searchParams.get('userRole') || 'All');
  const [action, setAction] = useState(searchParams.get('action') || 'All');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const tenantIdFilter = searchParams.get('tenantId') || '';

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page };
      if (search.trim()) params.search = search.trim();
      if (module !== 'All') params.module = module.toLowerCase();
      if (role !== 'All') params.userRole = role;
      if (action !== 'All') params.action = action;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (tenantIdFilter) params.tenantId = tenantIdFilter;
      const result = await superAdminApi.getActivityLogs(params);
      setLogs(result.logs);
      setPagination(result.pagination);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [page, search, module, role, action, startDate, endDate, tenantIdFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchLogs(), 300);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  const clearFilters = () => {
    setSearch(''); setModule('All'); setRole('All'); setAction('All'); setStartDate(''); setEndDate(''); setPage(1); setSearchParams({});
  };

  const hasActiveFilters = !!(search || module !== 'All' || role !== 'All' || action !== 'All' || startDate || endDate || tenantIdFilter);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-sm"><Activity size={20} className="text-white" strokeWidth={1.8} /></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Activity Logs</h1>
            <p className="text-sm text-slate-500">Track all user actions across tenants</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search description, user, target..." className="w-full pl-10 pr-4 py-2.5 bg-card border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${hasActiveFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-card border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          <Filter size={16} /> Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary-500" />}
        </button>
        {hasActiveFilters && <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"><X size={14} /> Clear</button>}
      </div>

      {showFilters && (
        <div className="bg-card rounded-xl border border-slate-100 p-4 mb-4 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div><label className="block text-xs font-medium text-slate-500 mb-1">Module</label><select value={module} onChange={(e) => { setModule(e.target.value); setPage(1); }} className={SELECT}>{MODULES.map((m) => <option key={m} value={m}>{m}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-slate-500 mb-1">Role</label><select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className={SELECT}>{ROLES.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-slate-500 mb-1">Action</label><select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }} className={SELECT}>{ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label><input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className={SELECT} /></div>
            <div><label className="block text-xs font-medium text-slate-500 mb-1">End Date</label><input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className={SELECT} /></div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>
      ) : logs.length === 0 ? (
        <EmptyState title="No activity logs" message={hasActiveFilters ? 'Try adjusting your filters.' : 'No activity has been recorded yet.'} />
      ) : (
        <div className="bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Tenant</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Module</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Action</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Target</th>
                  <th className="w-10 px-3 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log) => <LogRow key={log.id} log={log} onSelect={() => setSelectedLog(log)} />)}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-slate-100">
            <Pagination page={pagination.page} pageSize={pagination.limit} total={pagination.total} onPageChange={setPage} />
          </div>
        </div>
      )}

      {selectedLog && <LogDetailDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
}
