import { Activity, X } from 'lucide-react';
import type { ActivityLog } from '../../../lib/types';
import { LOG_TYPE_COLORS, MODULE_COLORS, ACTION_COLORS, fullDate } from '../constants';

const ROLE_BADGE: Record<string, string> = {
  ADMIN: 'bg-blue-100 text-blue-700', USER: 'bg-emerald-100 text-emerald-700', DISPATCH: 'bg-amber-100 text-amber-700',
  PRODUCTION: 'bg-cyan-100 text-cyan-700', MARKETING: 'bg-orange-100 text-orange-700', SUPER_ADMIN: 'bg-violet-100 text-violet-700',
};

type Props = { log: ActivityLog; onClose: () => void };

/** Slide-in detail panel for a single activity-log entry. */
export default function LogDetailDrawer({ log, onClose }: Props) {
  const lt = LOG_TYPE_COLORS[log.logType] || LOG_TYPE_COLORS.info;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-slate-200 shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center"><Activity size={20} className="text-primary-600" /></div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Activity Detail</h3>
              <p className="text-xs text-slate-500">{fullDate(log.createdAt)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X size={18} className="text-slate-500" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">{log.userName?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <p className="font-semibold text-slate-900">{log.userName}</p>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${ROLE_BADGE[log.userRole] || 'bg-slate-100 text-slate-600'}`}>{log.userRole}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Module</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium capitalize ${MODULE_COLORS[log.module?.toLowerCase()] || 'bg-slate-100 text-slate-600'}`}>{log.module}</span>
            </div>
            <div className="bg-surface rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Action</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${ACTION_COLORS[log.action?.toLowerCase()] || 'bg-slate-100 text-slate-600'}`}>{log.action}</span>
            </div>
            <div className="bg-surface rounded-xl p-3 border border-slate-100 col-span-2">
              <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Operation</p>
              <code className="text-sm font-mono font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">{log.operation}</code>
            </div>
            <div className="bg-surface rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Log Type</p>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium ${lt.bg} ${lt.text}`}><span className={`w-2 h-2 rounded-full ${lt.dot}`} />{log.logType}</span>
            </div>
            <div className="bg-surface rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">IP Address</p>
              <p className="text-sm font-medium text-slate-700">{log.ipAddress || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-surface rounded-xl p-4 border border-slate-100">
            <p className="text-[10px] font-semibold text-slate-500 uppercase mb-2">Description</p>
            <p className="text-sm text-slate-800">{log.description}</p>
          </div>

          {log.targetName && (
            <div className="bg-surface rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-500 uppercase mb-2">Target</p>
              <p className="text-sm font-medium text-slate-800">{log.targetName}</p>
              {log.targetId && <p className="text-xs text-slate-400 mt-1 font-mono">{log.targetId}</p>}
            </div>
          )}

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="bg-surface rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-500 uppercase mb-2">Metadata</p>
              <pre className="text-xs text-slate-300 bg-slate-900 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap font-mono">{JSON.stringify(log.metadata, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
