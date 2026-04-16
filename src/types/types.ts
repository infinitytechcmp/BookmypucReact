// Core type definitions for BookMyPUC application

export type UserRole = 'admin' | 'user' | 'shopOwner';
export type UserStatus = 'active' | 'inactive';
export type SubscriptionStatus = 'active' | 'paused';
export type BookingStatus = 'pending' | 'confirmed' | 'done' | 'cancelled';
export type VehicleType = '2W' | '3W' | '4W' | 'Commercial';
export type FuelType = 'Petrol' | 'Diesel';
export type NotificationType = 'booking_confirmed' | 'booking_rejected' | 'booking_completed' | 'puc_ready' | 'new_booking' | 'user_registered' | 'center_added';

export interface Admin {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin';
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user';
  status: UserStatus;
}

export interface ShopOwner {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'shopOwner';
  status: UserStatus;
  subscription: SubscriptionStatus;
}

export interface Notification {
  id: number;
  userId: number;
  userRole: 'user' | 'shopOwner' | 'admin';
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  bookingId?: number;
  centerId?: number;
}

export interface Center {
  id: number;
  owner_id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  taluka: string;
  pincode: string;
  working_hours: string;
  contact: string;
  pricing: {
    '2W_Petrol': number;
    '3W_Petrol': number;
    '3W_Diesel': number;
    '4W_Petrol': number;
    '4W_Diesel': number;
    'Commercial_Petrol': number;
    'Commercial_Diesel': number;
  };
  status: UserStatus;
}

export interface Vehicle {
  id: number;
  userId: number;
  number: string;
  type: VehicleType;
  brand: string;
  model: string;
  fuel: FuelType;
}

export interface Booking {
  id: number;
  user_id: number;
  center_id: number;
  vehicle_id: number;
  date: string;
  time: string;
  status: BookingStatus;
  price: number;
  pucNumber: string | null;
  certificate: string | null;
}

export interface MockDatabase {
  admin: Admin[];
  users: User[];
  shopOwners: ShopOwner[];
  centers: Center[];
  vehicles: Vehicle[];
  bookings: Booking[];
}

// Filter types
export interface CenterFilters {
  state?: string;
  city?: string;
  taluka?: string;
  pincode?: string;
  vehicleType?: VehicleType;
}

// Booking form data
export interface BookingPersonalDetails {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface BookingVehicleDetails {
  vehicleNumber: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  fuelType: FuelType;
}

// Auth context types
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  status?: UserStatus;
  subscription?: SubscriptionStatus;
}

export interface AuthContextType {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'shopOwner';
}

// Dashboard stats
export interface UserDashboardStats {
  totalBookings: number;
  upcomingBookings: number;
  vehiclesAdded: number;
}

export interface ShopOwnerDashboardStats {
  totalCenters: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
}

export interface AdminDashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  activeCenters: number;
}
