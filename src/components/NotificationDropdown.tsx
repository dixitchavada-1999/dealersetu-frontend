import { useEffect, useRef } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import type { Notification } from '../lib/types';

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const typeIcons: Record<string, string> = {
  order_placed: '📦',
  order_approved: '✅',
  order_dispatched: '🚚',
  order_delivered: '📬',
  order_cancelled: '❌',
  payment_received: '💰',
  payment_pending: '⏳',
  new_customer: '👤',
  new_product: '📋',
  low_stock: '⚠️',
  stock_updated: '🔄',
  feedback_received: '💬',
  discount_updated: '🏷️',
  welcome: '🎉',
  customer_deactivated: '🚫',
};

function getNotificationRoute(notification: Notification): string {
  const { type, data } = notification;
  if (type.startsWith('order_') || type.startsWith('payment_')) {
    return data.orderId ? `/orders/${data.orderId}` : '/orders';
  }
  if (type === 'new_customer' || type === 'customer_deactivated') return '/customers';
  if (type === 'low_stock' || type === 'new_product' || type === 'stock_updated' || type === 'discount_updated') return '/products';
  if (type === 'feedback_received') return '/feedback';
  return '/notifications';
}

export default function NotificationDropdown({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      fetchNotifications(1);
    }
  }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    const route = getNotificationRoute(notification);
    navigate(route);
    onClose();
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-primary-500" />
          <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
          {unreadCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-primary-500 text-white rounded-full leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
          >
            <CheckCheck size={14} />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[380px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 text-center">
            <Bell size={28} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-400 text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.slice(0, 10).map(n => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full text-left px-4 py-3 hover:bg-slate-100 transition-colors border-b border-slate-100 last:border-0 group ${
                !n.isRead ? 'bg-primary-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-base mt-0.5 shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
                  {typeIcons[n.type] || '🔔'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm text-slate-800 truncate ${!n.isRead ? 'font-semibold' : 'font-medium'}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-slate-200">
          <button
            onClick={() => { navigate('/notifications'); onClose(); }}
            className="w-full py-2.5 text-center text-xs font-medium text-primary-500 hover:bg-slate-100 transition-colors"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
