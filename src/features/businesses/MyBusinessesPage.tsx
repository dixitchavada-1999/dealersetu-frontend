import { useEffect, useState } from 'react';
import { Loader2, Building2, Plus, Check, EyeOff, Eye, UserX } from 'lucide-react';
import { authApi, extractError } from '../../lib/api';
import type { MyBusiness } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import EmptyState from '../../components/EmptyState';
import ConfirmDialog from '../../components/ConfirmDialog';
import toast from '../../lib/toast';

/**
 * Customer "My Businesses" — manage the owners they buy from:
 * add a business by activation code, switch, hide products, or deactivate.
 */
export default function MyBusinessesPage() {
  const { switchTenant, addBusiness } = useAuth();
  const [businesses, setBusinesses] = useState<MyBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<MyBusiness | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setBusinesses(await authApi.getMyBusinesses());
    } catch (err: any) {
      toast.error(extractError(err));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    const trimmed = code.trim();
    if (!trimmed) { toast.error('Please enter an activation code.'); return; }
    setAdding(true);
    try {
      await addBusiness(trimmed);
      setCode('');
      await load();
      toast.success('Business added to your account.');
    } catch (err: any) {
      toast.error(extractError(err));
    }
    setAdding(false);
  };

  const handleSwitch = async (b: MyBusiness) => {
    if (b.isCurrent || b.deactivated) return;
    setBusy(b.tenantId);
    try {
      await switchTenant(b.tenantId);
      await load();
      toast.success(`You are now using ${b.name}.`);
    } catch (err: any) {
      toast.error(extractError(err));
    }
    setBusy(null);
  };

  const handleToggleVisibility = async (b: MyBusiness, hidden: boolean) => {
    setBusinesses(prev => prev.map(x => (x.tenantId === b.tenantId ? { ...x, productsHidden: hidden } : x)));
    try {
      await authApi.setBusinessVisibility(b.tenantId, hidden);
    } catch (err: any) {
      setBusinesses(prev => prev.map(x => (x.tenantId === b.tenantId ? { ...x, productsHidden: !hidden } : x)));
      toast.error(extractError(err));
    }
  };

  const applyDeactivation = async (b: MyBusiness, deactivated: boolean) => {
    setBusy(b.tenantId);
    try {
      await authApi.setBusinessDeactivated(b.tenantId, deactivated);
      await load();
      toast.success(deactivated ? 'Business deactivated.' : 'Business reactivated.');
    } catch (err: any) {
      toast.error(extractError(err));
    }
    setBusy(null);
    setDeactivateTarget(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-primary-600" size={28} /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Businesses</h1>
        <p className="text-sm text-slate-500 mt-1">Manage the owners you buy from.</p>
      </div>

      {/* Add a business */}
      <div className="bg-card border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Plus size={16} className="text-primary-600" />
          <h2 className="font-semibold text-slate-900">Add a business</h2>
        </div>
        <p className="text-sm text-slate-500 mb-3">Enter the activation code an owner shared with you.</p>
        <div className="flex gap-3">
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Activation code"
            className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleAdd}
            disabled={adding}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium text-sm transition-colors shadow-sm flex items-center gap-2"
          >
            {adding ? <Loader2 size={16} className="animate-spin" /> : 'Add'}
          </button>
        </div>
      </div>

      {/* Businesses list */}
      {businesses.length === 0 ? (
        <EmptyState title="No businesses yet" message="You are not registered with any business yet." />
      ) : (
        <div className="space-y-3">
          {businesses.map(b => (
            <div
              key={b.tenantId}
              className={`bg-card border rounded-xl p-5 ${b.isCurrent ? 'border-primary-500' : 'border-slate-200'} ${b.deactivated ? 'opacity-70' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <Building2 size={18} className="text-primary-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 truncate">{b.name}</span>
                    {b.isCurrent && <span className="px-2 py-0.5 rounded-lg bg-primary-50 text-primary-700 text-[11px] font-bold">Current</span>}
                    {b.deactivated && <span className="px-2 py-0.5 rounded-lg bg-red-50 text-red-600 text-[11px] font-bold">Deactivated</span>}
                  </div>
                  {b.businessType && <p className="text-xs text-slate-500 mt-0.5">{b.businessType}</p>}
                </div>
                {!b.isCurrent && !b.deactivated && (
                  <button
                    onClick={() => handleSwitch(b)}
                    disabled={busy === b.tenantId}
                    className="px-4 py-2 border border-primary-500 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-50 disabled:opacity-50"
                  >
                    {busy === b.tenantId ? <Loader2 size={14} className="animate-spin" /> : 'Switch'}
                  </button>
                )}
              </div>

              {/* Controls */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                <button
                  onClick={() => handleToggleVisibility(b, !b.productsHidden)}
                  disabled={b.deactivated || busy === b.tenantId}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {b.productsHidden ? <Eye size={15} /> : <EyeOff size={15} />}
                  {b.productsHidden ? 'Show products' : 'Hide products'}
                </button>
                {b.deactivated ? (
                  <button
                    onClick={() => applyDeactivation(b, false)}
                    disabled={busy === b.tenantId}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-emerald-200 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                  >
                    <Check size={15} /> Reactivate
                  </button>
                ) : (
                  <button
                    onClick={() => setDeactivateTarget(b)}
                    disabled={busy === b.tenantId}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <UserX size={15} /> Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={() => deactivateTarget && applyDeactivation(deactivateTarget, true)}
        isLoading={!!deactivateTarget && busy === deactivateTarget.tenantId}
        title={`Deactivate ${deactivateTarget?.name || ''}?`}
        message="Their products will be hidden and the owner will be notified that you deactivated them. You can reactivate anytime."
        confirmLabel="Deactivate"
        loadingLabel="Deactivating..."
      />
    </div>
  );
}
