import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from '../lib/toast';
import type { Notification } from '../lib/types';
import { notificationsApi, getToken } from '../lib/api';
import { useAuth } from './AuthContext';

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  fetchNotifications: (page?: number, limit?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const socketRef = useRef<Socket | null>(null);

  // Connect/disconnect socket based on auth state
  useEffect(() => {
    if (isAuthenticated) {
      const token = getToken();
      if (!token) return;

      const socket = io(import.meta.env.VITE_API_URL || '/', {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('Socket.io connected');
      });

      socket.on('notification', (data: any) => {
        const newNotif: Notification = {
          id: data._id,
          tenantId: data.tenantId || '',
          recipientId: data.recipientId || '',
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data || {},
          isRead: false,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        };

        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast(data.title, { icon: '🔔' });
      });

      socket.on('disconnect', () => {
        console.log('Socket.io disconnected');
      });

      socketRef.current = socket;

      // Fetch initial unread count
      notificationsApi.getUnreadCount().then(setUnreadCount).catch(() => {});

      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    } else {
      // Cleanup on logout
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      setCurrentPage(1);
      setHasMore(true);
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async (page = 1, limit?: number) => {
    setIsLoading(true);
    try {
      const { notifications: fetched, pagination } = await notificationsApi.getAll(page, limit);
      setNotifications(fetched);
      setCurrentPage(page);
      setTotalPages(pagination.pages);
      setTotal(pagination.total);
      setPageSize(pagination.limit);
      setHasMore(page < pagination.pages);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, isLoading, hasMore, currentPage, totalPages, total, pageSize,
      fetchNotifications, markAsRead, markAllAsRead,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
