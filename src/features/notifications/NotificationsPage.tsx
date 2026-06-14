import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import Pagination from '../../components/Pagination';
import type { Notification } from '../../lib/types';
import { getNotificationRoute } from './helpers';
import NotificationItem from './components/NotificationItem';

/** Notifications inbox — all/unread filter, mark read, pagination. */
export default function NotificationsPage() {
  const {
    notifications, unreadCount, isLoading, currentPage, totalPages, total, pageSize,
    fetchNotifications, markAsRead, markAllAsRead,
  } = useNotifications();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => { fetchNotifications(1); }, [fetchNotifications]);

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  const handleClick = (n: Notification) => {
    if (!n.isRead) markAsRead(n.id);
    navigate(getNotificationRoute(n));
  };

  const tabClass = (active: boolean) => `px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${active ? 'bg-card text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-500 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors">
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-4 bg-slate-100 rounded-xl p-1 w-fit">
        <button onClick={() => setFilter('all')} className={tabClass(filter === 'all')}>All</button>
        <button onClick={() => setFilter('unread')} className={tabClass(filter === 'unread')}>Unread {unreadCount > 0 && `(${unreadCount})`}</button>
      </div>

      <div className="bg-card border border-slate-200 rounded-xl overflow-hidden">
        {isLoading && notifications.length === 0 ? (
          <div className="py-16 text-center">
            <Loader2 size={24} className="mx-auto text-primary-500 animate-spin mb-3" />
            <p className="text-slate-400 text-sm">Loading notifications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Bell size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm font-medium">{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
            <p className="text-slate-400 text-xs mt-1">{filter === 'unread' ? "You're all caught up!" : 'Notifications will appear here'}</p>
          </div>
        ) : (
          filtered.map((n) => <NotificationItem key={n.id} notification={n} onClick={handleClick} />)
        )}
      </div>

      {filter === 'all' && totalPages > 0 && (
        <div className="mt-4">
          <Pagination page={currentPage} pageSize={pageSize} total={total} onPageChange={(p) => fetchNotifications(p, pageSize)} onPageSizeChange={(s) => fetchNotifications(1, s)} />
        </div>
      )}
    </div>
  );
}
