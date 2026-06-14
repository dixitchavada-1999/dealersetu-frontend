import type { Notification } from '../../../lib/types';
import { timeAgo, NOTIFICATION_ICONS } from '../helpers';

type Props = { notification: Notification; onClick: (n: Notification) => void };

/** Single notification row. */
export default function NotificationItem({ notification: n, onClick }: Props) {
  return (
    <button
      onClick={() => onClick(n)}
      className={`w-full text-left px-5 py-4 hover:bg-slate-100 transition-colors border-b border-slate-100 last:border-0 group ${!n.isRead ? 'bg-primary-50' : ''}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg mt-0.5 shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 group-hover:bg-slate-200 transition-colors">
          {NOTIFICATION_ICONS[n.type] || '🔔'}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-sm text-slate-800 ${!n.isRead ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
            {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{n.message}</p>
          <p className="text-xs text-slate-400 mt-1.5">{timeAgo(n.createdAt)}</p>
        </div>
      </div>
    </button>
  );
}
