/**
 * API Configuration
 * Update the API_BASE_URL to match your PHP backend location
 */

// Production API
export const API_BASE_URL = 'https://bookmypucapi.infinitytecsolutions.com/api';

// Development - Local XAMPP/WAMP/MAMP (uncomment for local development)
// export const API_BASE_URL = 'http://localhost/bookmypuc-api/api';

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth.php?action=login',
  REGISTER: '/auth.php?action=register',
  ADMIN_LOGIN: '/auth.php?action=admin-login',
  
  // Centers
  CENTERS: '/centers.php',
  
  // Bookings
  BOOKINGS: '/bookings.php',
  CONFIRM_BOOKING: '/bookings.php?action=confirm',
  REJECT_BOOKING: '/bookings.php?action=reject',
  MARK_DONE: '/bookings.php?action=mark-done',
  CANCEL_BOOKING: '/bookings.php?action=cancel',
  
  // Vehicles
  VEHICLES: '/vehicles.php',
  
  // Notifications
  NOTIFICATIONS: '/notifications.php',
  UNREAD_COUNT: '/notifications.php?action=unread-count',
  MARK_READ: '/notifications.php?action=mark-read',
  MARK_ALL_READ: '/notifications.php?action=mark-all-read',
  
  // Users
  USERS: '/users.php',
  
  // Shop Owners
  SHOP_OWNERS: '/shop-owners.php',
  
  // Admin
  ADMIN_STATS: '/admin.php?action=dashboard-stats',
  USER_STATS: '/admin.php?action=user-stats',
  SHOP_OWNER_STATS: '/admin.php?action=shop-owner-stats',
  ACTIVATE_USER: '/admin.php?action=activate-user',
  DEACTIVATE_USER: '/admin.php?action=deactivate-user',
  ACTIVATE_SHOP_OWNER: '/admin.php?action=activate-shop-owner',
  DEACTIVATE_SHOP_OWNER: '/admin.php?action=deactivate-shop-owner',
  PAUSE_SUBSCRIPTION: '/admin.php?action=pause-subscription',
  RESUME_SUBSCRIPTION: '/admin.php?action=resume-subscription',
  
  // Contact
  CONTACT: '/contact.php',
  
  // OTP
  SEND_OTP: '/otp.php?action=send',
  VERIFY_OTP: '/otp.php?action=verify',
  RESEND_OTP: '/otp.php?action=resend'
};

/**
 * Helper function to build full API URL
 */
export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

/**
 * Helper function for API requests
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ success: boolean; message: string; data?: T }> {
  try {
    const response = await fetch(getApiUrl(endpoint), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API Request Error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred'
    };
  }
}
