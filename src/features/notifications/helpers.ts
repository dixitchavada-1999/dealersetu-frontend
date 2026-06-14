import type { Notification } from '../../lib/types';

/** Relative "time ago" label. */
export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Where clicking a notification should navigate. */
export function getNotificationRoute(notification: Notification): string {
  const { type, data } = notification;
  if (type.startsWith('order_') || type.startsWith('payment_')) return data.orderId ? `/orders/${data.orderId}` : '/orders';
  if (type === 'new_customer') return '/customers';
  if (type === 'low_stock') return '/products';
  return '/notifications';
}

export const NOTIFICATION_ICONS: Record<string, string> = {
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
};
