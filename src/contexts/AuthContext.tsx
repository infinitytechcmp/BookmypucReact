import { createContext, useContext, useState, useEffect } from 'react';
import type { AuthContextType, AuthUser, RegisterData, UserRole } from '@/types/types';
import { apiRequest, API_ENDPOINTS } from '@/config/api';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('bookMyPucUser');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('bookMyPucUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('bookMyPucUser');
    }
  }, [user]);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const endpoint = role === 'admin' ? API_ENDPOINTS.ADMIN_LOGIN : API_ENDPOINTS.LOGIN;
      
      const result = await apiRequest<{ user: any }>(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email, password, role })
      });

      if (result.success && result.data?.user) {
        const userData = result.data.user;
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role,
          status: userData.status,
          subscription: userData.subscription
        });
        toast.success('Login successful!');
        return true;
      } else {
        toast.error(result.message || 'Invalid credentials');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

  const register = async (registerData: RegisterData): Promise<boolean> => {
    try {
      const result = await apiRequest(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify(registerData)
      });

      if (result.success) {
        toast.success('Registration successful! Please login.');
        return true;
      } else {
        toast.error(result.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

