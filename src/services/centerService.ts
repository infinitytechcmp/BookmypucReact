import type { Center, CenterFilters, VehicleType, FuelType } from '@/types/types';
import { apiRequest, API_ENDPOINTS } from '@/config/api';

export const centerService = {
  // Get all active centers (only from active shop owners)
  getActiveCenters: async (): Promise<Center[]> => {
    const result = await apiRequest<Center[]>(API_ENDPOINTS.CENTERS);
    return result.success && result.data ? result.data : [];
  },

  // Get centers with filters
  getFilteredCenters: async (filters: CenterFilters): Promise<Center[]> => {
    const params = new URLSearchParams();
    if (filters.state) params.append('state', filters.state);
    if (filters.city) params.append('city', filters.city);
    if (filters.taluka) params.append('taluka', filters.taluka);
    if (filters.pincode) params.append('pincode', filters.pincode);

    const endpoint = `${API_ENDPOINTS.CENTERS}?${params.toString()}`;
    const result = await apiRequest<Center[]>(endpoint);
    return result.success && result.data ? result.data : [];
  },

  // Get center by ID
  getCenterById: async (id: number): Promise<Center | undefined> => {
    const result = await apiRequest<Center[]>(`${API_ENDPOINTS.CENTERS}?id=${id}`);
    return result.success && result.data && result.data.length > 0 ? result.data[0] : undefined;
  },

  // Get centers by owner ID
  getCentersByOwnerId: async (ownerId: number): Promise<Center[]> => {
    const result = await apiRequest<Center[]>(`${API_ENDPOINTS.CENTERS}?owner_id=${ownerId}`);
    return result.success && result.data ? result.data : [];
  },

  // Get unique states
  getStates: async (): Promise<string[]> => {
    const centers = await centerService.getActiveCenters();
    return [...new Set(centers.map((c) => c.state))].sort();
  },

  // Get cities by state
  getCitiesByState: async (state: string): Promise<string[]> => {
    const centers = await centerService.getActiveCenters();
    return [...new Set(centers.filter((c) => c.state === state).map((c) => c.city))].sort();
  },

  // Get talukas by city
  getTalukasByCity: async (city: string): Promise<string[]> => {
    const centers = await centerService.getActiveCenters();
    return [...new Set(centers.filter((c) => c.city === city).map((c) => c.taluka))].sort();
  },

  // Calculate price based on vehicle type and fuel type
  calculatePrice: (center: Center, vehicleType: VehicleType, fuelType: FuelType): number => {
    const key = `${vehicleType}_${fuelType}` as keyof typeof center.pricing;
    return center.pricing[key] || 0;
  },

  // Add new center (for shop owners)
  addCenter: async (centerData: Omit<Center, 'id'>): Promise<Center | null> => {
    const result = await apiRequest<{ id: number }>(API_ENDPOINTS.CENTERS, {
      method: 'POST',
      body: JSON.stringify(centerData)
    });
    
    if (result.success && result.data) {
      return { ...centerData, id: result.data.id } as Center;
    }
    return null;
  },

  // Update center
  updateCenter: async (id: number, updates: Partial<Center>): Promise<boolean> => {
    const result = await apiRequest(API_ENDPOINTS.CENTERS, {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates })
    });
    return result.success;
  },

  // Delete center
  deleteCenter: async (id: number): Promise<boolean> => {
    const result = await apiRequest(`${API_ENDPOINTS.CENTERS}?id=${id}`, {
      method: 'DELETE'
    });
    return result.success;
  }
};
