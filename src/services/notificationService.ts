import { apiRequest, API_ENDPOINTS } from '@/config/api';
import type { Notification } from '@/types/types';

export const notificationService = {
  // Get all notifications for a user
  getNotificationsByUser: async (userId: number, userRole: 'user' | 'shopOwner' | 'admin'): Promise<Notification[]> => {
    const result = await apiRequest<Notification[]>(`${API_ENDPOINTS.NOTIFICATIONS}?user_id=${userId}&user_role=${userRole}`);
    return result.success && result.data ? result.data : [];
  },

  // Get unread count
  getUnreadCount: async (userId: number, userRole: 'user' | 'shopOwner' | 'admin'): Promise<number> => {
    const result = await apiRequest<{ count: number }>(`${API_ENDPOINTS.UNREAD_COUNT}&user_id=${userId}&user_role=${userRole}`);
    return result.success && result.data ? result.data.count : 0;
  },

  // Create notification
  createNotification: async (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification | null> => {
    const result = await apiRequest<{ id: number }>(API_ENDPOINTS.NOTIFICATIONS, {
      method: 'POST',
      body: JSON.stringify(notification)
    });
    
    if (result.success && result.data) {
      return {
        ...notification,
        id: result.data.id,
        read: false,
        createdAt: new Date().toISOString()
      } as Notification;
    }
    return null;
  },

  // Mark as read
  markAsRead: async (notificationId: number): Promise<boolean> => {
    const result = await apiRequest(API_ENDPOINTS.MARK_READ, {
      method: 'POST',
      body: JSON.stringify({ id: notificationId })
    });
    return result.success;
  },

  // Mark all as read
  markAllAsRead: async (userId: number, userRole: 'user' | 'shopOwner' | 'admin'): Promise<void> => {
    await apiRequest(API_ENDPOINTS.MARK_ALL_READ, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, user_role: userRole })
    });
  },

  // Delete notification
  deleteNotification: async (notificationId: number): Promise<boolean> => {
    const result = await apiRequest(`${API_ENDPOINTS.NOTIFICATIONS}?id=${notificationId}`, {
      method: 'DELETE'
    });
    return result.success;
  },

  // Note: The following methods are handled by the PHP backend automatically
  // They are kept here for reference but don't need to be called directly

  // Notify user about booking confirmation
  notifyBookingConfirmed: (userId: number, bookingId: number, centerName: string, date: string, time: string): void => {
    // Handled by PHP backend in bookings.php confirm action
  },

  // Notify user about booking rejection
  notifyBookingRejected: (userId: number, bookingId: number, centerName: string): void => {
    // Handled by PHP backend in bookings.php reject action
  },

  // Notify user about PUC completion
  notifyPUCReady: (userId: number, bookingId: number, centerName: string, pucNumber: string): void => {
    // Handled by PHP backend in bookings.php mark-done action
  },

  // Notify shop owner about new booking
  notifyNewBooking: (shopOwnerId: number, bookingId: number, centerName: string, userName: string): void => {
    // Handled by PHP backend in bookings.php create action
  },

  // Notify admin about new user
  notifyAdminNewUser: (adminId: number, userName: string): void => {
    // Handled by PHP backend in auth.php register action
  },

  // Notify admin about new center
  notifyAdminNewCenter: (adminId: number, centerName: string, shopOwnerName: string): void => {
    // Handled by PHP backend in centers.php create action
  }
};
