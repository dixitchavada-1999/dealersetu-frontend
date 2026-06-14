import { Clock, ChevronRight } from 'lucide-react';
import type { ActivityLog } from '../../../lib/types';
import { LOG_TYPE_COLORS, MODULE_COLORS, ACTION_COLORS, ROLE_COLORS, relativeTime, fullDate } from '../constants';

type Props = { log: ActivityLog; onSelect: () => void };

/** One activity-log table row. */
export default function LogRow({ log, onSelect }: Props) {
  const moduleColor = MODULE_COLORS[log.module?.toLowerCase() || ''] || 'bg-slate-100 text-slate-600';
  const actionColor = ACTION_COLORS[log.action?.toLowerCase() || ''] || 'bg-slate-100 text-slate-600';
  const roleColor = ROLE_COLORS[log.userRole] || 'bg-slate-100 text-slate-600';

  return (
    <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={onSelect}>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${(LOG_TYPE_COLORS[log.logType] || LOG_TYPE_COLORS.info).dot}`} title={log.logType} />
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-slate-400 shrink-0" />
            <span className="text-sm text-slate-600" title={fullDate(log.createdAt)}>{relativeTime(log.createdAt)}</span>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <p className="text-sm font-medium text-slate-900">{log.userName}</p>
        <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${roleColor}`}>{log.userRole}</span>
      </td>
      <td className="px-5 py-3.5 text-sm text-slate-600 hidden md:table-cell">{log.tenantName || 'N/A'}</td>
      <td className="px-5 py-3.5 hidden sm:table-cell"><span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium capitalize ${moduleColor}`}>{log.module}</span></td>
      <td className="px-5 py-3.5 hidden sm:table-cell"><span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${actionColor}`}>{log.action}</span></td>
      <td className="px-5 py-3.5"><p className="text-sm text-slate-700 max-w-xs truncate" title={log.description}>{log.description}</p></td>
      <td className="px-5 py-3.5 text-sm text-slate-500 hidden lg:table-cell">{log.targetName || '-'}</td>
      <td className="px-3 py-3.5"><ChevronRight size={16} className="text-slate-400" /></td>
    </tr>
  );
}
