import type { Vehicle, VehicleType, FuelType } from '@/types/types';
import { apiRequest, API_ENDPOINTS } from '@/config/api';

export const vehicleService = {
  // Get all vehicles for a user
  getVehiclesByUserId: async (userId: number): Promise<Vehicle[]> => {
    const result = await apiRequest<Vehicle[]>(`${API_ENDPOINTS.VEHICLES}?user_id=${userId}`);
    return result.success && result.data ? result.data : [];
  },

  // Get vehicle by ID
  getVehicleById: async (id: number): Promise<Vehicle | undefined> => {
    const result = await apiRequest<Vehicle[]>(`${API_ENDPOINTS.VEHICLES}?id=${id}`);
    return result.success && result.data && result.data.length > 0 ? result.data[0] : undefined;
  },

  // Add new vehicle
  addVehicle: async (vehicleData: Omit<Vehicle, 'id'>): Promise<Vehicle | null> => {
  // 🔥 Convert camelCase → snake_case
  const payload = {
    user_id: vehicleData.userId,
    number: vehicleData.number,
    type: vehicleData.type,
    brand: vehicleData.brand,
    model: vehicleData.model,
    fuel: vehicleData.fuel
  };

  const result = await apiRequest<{ id: number }>(API_ENDPOINTS.VEHICLES, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' // ✅ important
    },
    body: JSON.stringify(payload)
  });
  
  console.log('Vehicle API response:', result);

  if (result.success && result.data) {
    return { ...vehicleData, id: result.data.id }; // keep camelCase in frontend
  }

  return null;
},

  // Update vehicle
  updateVehicle: async (id: number, updates: Partial<Vehicle>): Promise<boolean> => {
    const result = await apiRequest(API_ENDPOINTS.VEHICLES, {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates })
    });
    return result.success;
  },

  // Delete vehicle
  deleteVehicle: async (id: number): Promise<boolean> => {
    const result = await apiRequest(`${API_ENDPOINTS.VEHICLES}?id=${id}`, {
      method: 'DELETE'
    });
    return result.success;
  }
};
