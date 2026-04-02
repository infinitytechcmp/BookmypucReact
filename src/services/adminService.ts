import { apiRequest, API_ENDPOINTS } from '@/config/api';
import type { User, ShopOwner } from '@/types/types';

export const adminService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const result = await apiRequest<{
      total_bookings: number;
      active_users: number;
      active_centers: number;
      active_shop_owners: number;
      total_revenue: number;
    }>(API_ENDPOINTS.ADMIN_STATS);
    
    if (result.success && result.data) {
      return {
        totalBookings: result.data.total_bookings,
        activeUsers: result.data.active_users,
        activeCenters: result.data.active_centers,
        activeShopOwners: result.data.active_shop_owners,
        totalRevenue: result.data.total_revenue
      };
    }
    
    return {
      totalBookings: 0,
      activeUsers: 0,
      activeCenters: 0,
      activeShopOwners: 0,
      totalRevenue: 0
    };
  },

  // Get user statistics
  getUserStats: async (userId: number) => {
    const result = await apiRequest<{
      total_bookings: number;
      upcoming_bookings: number;
      completed_bookings: number;
      total_spent: number;
    }>(`${API_ENDPOINTS.USER_STATS}&user_id=${userId}`);
    
    if (result.success && result.data) {
      return {
        totalBookings: result.data.total_bookings,
        upcomingBookings: result.data.upcoming_bookings,
        completedBookings: result.data.completed_bookings,
        totalSpent: result.data.total_spent
      };
    }
    
    return {
      totalBookings: 0,
      upcomingBookings: 0,
      completedBookings: 0,
      totalSpent: 0
    };
  },

  // Get shop owner statistics
  getShopOwnerStats: async (ownerId: number) => {
    const result = await apiRequest<{
      total_bookings: number;
      pending_bookings: number;
      confirmed_bookings: number;
      completed_bookings: number;
      total_revenue: number;
      total_centers: number;
    }>(`${API_ENDPOINTS.SHOP_OWNER_STATS}&owner_id=${ownerId}`);
    
    if (result.success && result.data) {
      return {
        totalBookings: result.data.total_bookings,
        pendingBookings: result.data.pending_bookings,
        confirmedBookings: result.data.confirmed_bookings,
        completedBookings: result.data.completed_bookings,
        totalRevenue: result.data.total_revenue,
        totalCenters: result.data.total_centers
      };
    }
    
    return {
      totalBookings: 0,
      pendingBookings: 0,
      confirmedBookings: 0,
      completedBookings: 0,
      totalRevenue: 0,
      totalCenters: 0
    };
  },

  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const result = await apiRequest<User[]>(API_ENDPOINTS.USERS);
    return result.success && result.data ? result.data : [];
  },

  // Get all shop owners
  getAllShopOwners: async (): Promise<ShopOwner[]> => {
    const result = await apiRequest<ShopOwner[]>(API_ENDPOINTS.SHOP_OWNERS);
    return result.success && result.data ? result.data : [];
  },

  // Activate user
  activateUser: async (userId: number): Promise<boolean> => {
    const result = await apiRequest(API_ENDPOINTS.ACTIVATE_USER, {
      method: 'POST',
      body: JSON.stringify({ id: userId })
    });
    return result.success;
  },

  // Deactivate user
  deactivateUser: async (userId: number): Promise<boolean> => {
    const result = await apiRequest(API_ENDPOINTS.DEACTIVATE_USER, {
      method: 'POST',
      body: JSON.stringify({ id: userId })
    });
    return result.success;
  },

  // Activate shop owner
  activateShopOwner: async (shopOwnerId: number): Promise<boolean> => {
    const result = await apiRequest(API_ENDPOINTS.ACTIVATE_SHOP_OWNER, {
      method: 'POST',
      body: JSON.stringify({ id: shopOwnerId })
    });
    return result.success;
  },

  // Deactivate shop owner
  deactivateShopOwner: async (shopOwnerId: number): Promise<boolean> => {
    const result = await apiRequest(API_ENDPOINTS.DEACTIVATE_SHOP_OWNER, {
      method: 'POST',
      body: JSON.stringify({ id: shopOwnerId })
    });
    return result.success;
  },

  // Pause subscription
  pauseSubscription: async (shopOwnerId: number): Promise<boolean> => {
    const result = await apiRequest(API_ENDPOINTS.PAUSE_SUBSCRIPTION, {
      method: 'POST',
      body: JSON.stringify({ id: shopOwnerId })
    });
    return result.success;
  },

  // Resume subscription
  resumeSubscription: async (shopOwnerId: number): Promise<boolean> => {
    const result = await apiRequest(API_ENDPOINTS.RESUME_SUBSCRIPTION, {
      method: 'POST',
      body: JSON.stringify({ id: shopOwnerId })
    });
    return result.success;
  }
};
