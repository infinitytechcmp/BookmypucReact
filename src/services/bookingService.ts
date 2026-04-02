import type { Booking, BookingStatus } from '@/types/types';
import { apiRequest, API_ENDPOINTS } from '@/config/api';

export const bookingService = {
  // Get all bookings
  getAllBookings: async (): Promise<Booking[]> => {
    const result = await apiRequest<Booking[]>(API_ENDPOINTS.BOOKINGS);
    return result.success && result.data ? result.data : [];
  },

  // Get booking by ID
  getBookingById: async (id: number): Promise<Booking | undefined> => {
    const result = await apiRequest<Booking[]>(`${API_ENDPOINTS.BOOKINGS}?id=${id}`);
    return result.success && result.data && result.data.length > 0 ? result.data[0] : undefined;
  },

  // Get bookings by user ID
  getBookingsByUserId: async (userId: number): Promise<Booking[]> => {
    const result = await apiRequest<Booking[]>(`${API_ENDPOINTS.BOOKINGS}?user_id=${userId}`);
    return result.success && result.data ? result.data : [];
  },

  // Get bookings by center ID
  getBookingsByCenterId: async (centerId: number): Promise<Booking[]> => {
    const result = await apiRequest<Booking[]>(`${API_ENDPOINTS.BOOKINGS}?center_id=${centerId}`);
    return result.success && result.data ? result.data : [];
  },

  // Get bookings by shop owner ID
  getBookingsByShopOwnerId: async (ownerId: number): Promise<Booking[]> => {
    const result = await apiRequest<Booking[]>(`${API_ENDPOINTS.BOOKINGS}?owner_id=${ownerId}`);
    return result.success && result.data ? result.data : [];
  },

  // Create new booking
  createBooking: async (bookingData: Omit<Booking, 'id' | 'date' | 'time' | 'status' | 'pucNumber' | 'certificate'>): Promise<Booking | null> => {
    const result = await apiRequest<{ id: number; date: string; time: string }>(API_ENDPOINTS.BOOKINGS, {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
    
    if (result.success && result.data) {
      return {
        ...bookingData,
        id: result.data.id,
        date: result.data.date,
        time: result.data.time,
        status: 'pending',
        pucNumber: null,
        certificate: null
      } as Booking;
    }
    return null;
  },

  // Update booking status
  updateBookingStatus: async (id: number, status: BookingStatus): Promise<boolean> => {
    const result = await apiRequest(API_ENDPOINTS.BOOKINGS, {
      method: 'PUT',
      body: JSON.stringify({ id, status })
    });
    return result.success;
  },

  // Confirm booking (shop owner confirms)
  confirmBooking: async (id: number): Promise<boolean> => {
    const result = await apiRequest<{ date: string; time: string }>(API_ENDPOINTS.CONFIRM_BOOKING, {
      method: 'POST',
      body: JSON.stringify({ id })
    });
    return result.success;
  },

  // Reject booking (shop owner rejects)
  rejectBooking: async (id: number): Promise<boolean> => {
    const result = await apiRequest(API_ENDPOINTS.REJECT_BOOKING, {
      method: 'POST',
      body: JSON.stringify({ id })
    });
    return result.success;
  },

  // Mark booking as done with PUC details
  markBookingAsDone: async (id: number, pucNumber: string, certificate: string): Promise<boolean> => {
    const result = await apiRequest(API_ENDPOINTS.MARK_DONE, {
      method: 'POST',
      body: JSON.stringify({ id, puc_number: pucNumber, certificate })
    });
    return result.success;
  },

  // Cancel booking
  cancelBooking: async (id: number): Promise<boolean> => {
    const result = await apiRequest(API_ENDPOINTS.CANCEL_BOOKING, {
      method: 'POST',
      body: JSON.stringify({ id })
    });
    return result.success;
  },

  // Get booking statistics for user
  getUserBookingStats: async (userId: number) => {
    const bookings = await bookingService.getBookingsByUserId(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      totalBookings: bookings.length,
      upcomingBookings: bookings.filter(
        (b) => b.status === 'confirmed' && new Date(b.date) >= today
      ).length,
      completedBookings: bookings.filter((b) => b.status === 'done').length
    };
  },

  // Get booking statistics for shop owner
  getShopOwnerBookingStats: async (ownerId: number) => {
    const bookings = await bookingService.getBookingsByShopOwnerId(ownerId);

    return {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter((b) => b.status === 'pending').length,
      confirmedBookings: bookings.filter((b) => b.status === 'confirmed').length,
      completedBookings: bookings.filter((b) => b.status === 'done').length
    };
  },

  // Generate random time within working hours
  generateRandomTime: (workingHours: string): string => {
    const [start, end] = workingHours.split(' - ');
    const [startHour] = start.split(':').map(Number);
    const [endHour] = end.split(':').map(Number);
    
    const randomHour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
    const randomMinute = Math.random() < 0.5 ? '00' : '30';
    
    return `${randomHour.toString().padStart(2, '0')}:${randomMinute}`;
  },

  // Calculate booking date (current date + 2 days)
  calculateBookingDate: (): string => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().split('T')[0];
  }
};
