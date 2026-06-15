import { useState } from 'react';
import { Building2, Mail, Phone, MapPin, Calendar, Users, Power } from 'lucide-react';
import type { SuperAdminTenantDetail, SuperAdminTenantUser } from '../../../../lib/api';
import { fmtDate, activeBadge, activeDot } from '../utils';

type Props = {
  tenant: SuperAdminTenantDetail;
  users: SuperAdminTenantUser[];
  toggling: boolean;
  onToggle: () => void;
};

const roleBadge = (role: string) =>
  role === 'ADMIN' ? 'bg-violet-50 text-violet-700' : role === 'DISPATCH' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600';

/** Overview tab — tenant info, counts, active toggle, and users table. */
export default function TenantOverview({ tenant, users, toggling, onToggle }: Props) {
  const [confirmToggle, setConfirmToggle] = useState(false);

  const counts = [
    { label: 'Categories', val: tenant.categoryCount },
    { label: 'Products', val: tenant.productCount },
    { label: 'Customers', val: tenant.customerCount },
    { label: 'Orders', val: tenant.orderCount },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-card rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm"><Building2 size={22} className="text-white" /></div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Tenant Info</h2>
            <p className="text-xs text-slate-400">{tenant.userCount} users</p>
          </div>
        </div>
        <div className="space-y-3">
          {tenant.email && <div className="flex items-center gap-3"><Mail size={16} className="text-slate-400 shrink-0" /><span className="text-sm text-slate-700">{tenant.email}</span></div>}
          {tenant.phone && <div className="flex items-center gap-3"><Phone size={16} className="text-slate-400 shrink-0" /><span className="text-sm text-slate-700">{tenant.phone}</span></div>}
          {tenant.address && <div className="flex items-center gap-3"><MapPin size={16} className="text-slate-400 shrink-0" /><span className="text-sm text-slate-700">{tenant.address}</span></div>}
          <div className="flex items-center gap-3"><Calendar size={16} className="text-slate-400 shrink-0" /><span className="text-sm text-slate-700">Created {fmtDate(tenant.createdAt)}</span></div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-5 pt-5 border-t border-slate-100">
          {counts.map(s => (
            <div key={s.label} className="bg-surface rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-slate-900">{s.val}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-5 border-t border-slate-100">
          {confirmToggle ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-700">
                {tenant.isActive ? 'Deactivating will block all users from logging in.' : 'Activating will allow all users to log in again.'}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmToggle(false)} disabled={toggling} className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-surface text-sm font-medium">Cancel</button>
                <button onClick={() => { onToggle(); setConfirmToggle(false); }} disabled={toggling} className={`flex-1 px-3 py-2 rounded-xl text-white text-sm font-medium shadow-sm disabled:opacity-50 ${tenant.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                  {toggling ? 'Processing...' : tenant.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmToggle(true)} className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${tenant.isActive ? 'border border-red-200 text-red-600 hover:bg-red-50' : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
              <Power size={16} />{tenant.isActive ? 'Deactivate Tenant' : 'Activate Tenant'}
            </button>
          )}
        </div>
      </div>

      <div className="lg:col-span-2 bg-card rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3"><Users size={20} className="text-slate-600" /><h2 className="text-lg font-semibold text-slate-900">Users ({users.length})</h2></div>
        </div>
        {users.length === 0 ? (
          <div className="text-center py-12"><p className="text-sm text-slate-500">No users found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-semibold text-slate-900">{u.firstName} {u.lastName}</td>
                    <td className="px-5 py-4 text-sm text-slate-600 hidden sm:table-cell">{u.email || '-'}</td>
                    <td className="px-5 py-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${roleBadge(u.role)}`}>{u.role}</span></td>
                    <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${activeBadge(u.isActive)}`}><span className={`w-1.5 h-1.5 rounded-full ${activeDot(u.isActive)}`} />{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-5 py-4 text-sm text-slate-500 hidden md:table-cell">{fmtDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
