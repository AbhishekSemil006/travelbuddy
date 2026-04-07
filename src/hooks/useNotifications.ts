import { useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';

export interface Notification {
  _id: string;
  type: 'join_request' | 'request_accepted' | 'request_declined' | 'participant_removed' | 'new_message' | 'trip_update';
  message: string;
  isRead: boolean;
  createdAt: string;
  tripId?: string;
  senderProfile?: {
    displayName: string;
    avatarUrl: string | null;
  } | null;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all', {});
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read');
    }
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead, refetch: fetchNotifications };
}
