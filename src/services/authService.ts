import { apiRequest, API_ENDPOINTS } from '@/config/api';

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'shopOwner';
}

export const authService = {
  // Register new user or shop owner
  register: async (registerData: RegisterData): Promise<boolean> => {
    try {
      const result = await apiRequest(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify(registerData)
      });

      return result.success;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  }
};
