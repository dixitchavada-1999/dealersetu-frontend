import { Building2, Shield, Bell, ImageIcon } from 'lucide-react';
import type { NotificationPreferences } from '../../lib/types';

export type SectionKey = 'business' | 'permissions' | 'alerts' | 'explore';

export const defaultNotifPrefs: NotificationPreferences = {
  order_placed: true,
  order_approved: true,
  order_dispatched: true,
  order_delivered: true,
  order_cancelled: true,
  payment_received: true,
  payment_pending: true,
  new_product: true,
  new_customer: true,
  low_stock: true,
};

export const notifLabels: Record<string, string> = {
  order_placed: 'Order Placed',
  order_approved: 'Order Approved',
  order_dispatched: 'Order Dispatched',
  order_delivered: 'Order Delivered',
  order_cancelled: 'Order Cancelled',
  payment_received: 'Payment Received',
  payment_pending: 'Payment Pending',
  new_product: 'New Product',
  new_customer: 'New Customer',
  low_stock: 'Low Stock',
};

export const notifGroups: { label: string; keys: (keyof NotificationPreferences)[] }[] = [
  { label: 'Orders', keys: ['order_placed', 'order_approved', 'order_dispatched', 'order_delivered', 'order_cancelled'] },
  { label: 'Payments', keys: ['payment_received', 'payment_pending'] },
  { label: 'Other', keys: ['new_product', 'new_customer', 'low_stock'] },
];

export const SETTINGS_SECTIONS: {
  id: SectionKey;
  icon: typeof Building2;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
}[] = [
  { id: 'business', icon: Building2, iconColor: 'text-primary-600', iconBg: 'bg-primary-50', title: 'Business Settings', subtitle: 'Business info & pricing' },
  { id: 'permissions', icon: Shield, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', title: 'Team Permissions', subtitle: 'Role access control' },
  { id: 'alerts', icon: Bell, iconColor: 'text-amber-600', iconBg: 'bg-amber-50', title: 'Notifications & Alerts', subtitle: 'Stock alerts & notifications' },
  { id: 'explore', icon: ImageIcon, iconColor: 'text-violet-600', iconBg: 'bg-violet-50', title: 'Explore Feed', subtitle: 'Customer feed settings' },
];
