import { useEffect, useState } from 'react';
import { Loader2, Construction, CheckCircle2 } from 'lucide-react';
import { modulesApi, extractError } from '../../lib/api';
import type { ModuleItem, ModuleType } from '../../lib/api';
import { useModules } from '../../contexts/ModulesContext';
import toast from '../../lib/toast';

const TYPE_LABEL: Record<ModuleType, string> = { customer: 'Customer', owner: 'Owner', both: 'Both' };

/** Super-admin: set each module's audience type + under-development flag. */
export default function ModuleStatusPage() {
  const { refresh } = useModules();
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    modulesApi.get().then((r) => setModules(r.modules)).catch((e) => toast.error(extractError(e))).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const patch = async (key: string, data: Partial<{ type: ModuleType; underDevelopment: boolean }>) => {
    setModules((prev) => prev.map((m) => (m.key === key ? { ...m, ...data } : m)));
    setSavingKey(key);
    try {
      await modulesApi.update(key, data);
      refresh();
    } catch (e: any) {
      toast.error(extractError(e));
      load();
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary-600" /></div>;

  const devCount = modules.filter((m) => m.underDevelopment).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Construction size={26} className="text-primary-600" />
          Modules
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Set each module's audience (Customer / Owner / Both) and mark it “under development” to show a placeholder.
          {devCount > 0 && <span className="ml-1 text-amber-600">· {devCount} under development</span>}
        </p>
      </div>

      <div className="bg-card border border-slate-200 rounded-xl divide-y divide-slate-100">
        {modules.map((m) => (
          <div key={m.key} className="flex items-center justify-between gap-3 px-5 py-3.5 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              {m.underDevelopment ? <Construction size={18} className="text-amber-500 shrink-0" /> : <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />}
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{m.label}</p>
                <p className="text-[11px] font-mono text-slate-400">{m.key}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <label className="flex items-center gap-1.5 text-xs text-slate-500">
                Type
                <select
                  value={m.type}
                  disabled={savingKey === m.key}
                  onChange={(e) => patch(m.key, { type: e.target.value as ModuleType })}
                  className="px-2 py-1 border border-slate-200 rounded-lg bg-card text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {(['customer', 'owner', 'both'] as ModuleType[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                </select>
              </label>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${m.underDevelopment ? 'text-amber-600' : 'text-emerald-600'}`}>{m.underDevelopment ? 'Under dev' : 'Live'}</span>
                <button
                  onClick={() => patch(m.key, { underDevelopment: !m.underDevelopment })}
                  disabled={savingKey === m.key}
                  title={m.underDevelopment ? 'Set live' : 'Mark under development'}
                  className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${m.underDevelopment ? 'bg-amber-500' : 'bg-emerald-500'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${m.underDevelopment ? 'left-0.5' : 'left-[22px]'}`} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
