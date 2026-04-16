import type { MockDatabase } from '@/types/types';

// Mock JSON database for BookMyPUC application
// This simulates a backend database with all necessary data

const mockData: MockDatabase = {
  admin: [
    {
      id: 1,
      name: 'Admin',
      email: 'admin@bookmypuc.com',
      password: 'admin123',
      role: 'admin'
    }
  ],
  users: [
    {
      id: 1,
      name: 'Arun Mishra',
      email: 'arun@gmail.com',
      phone: '9326261416',
      password: 'user123',
      role: 'user',
      status: 'active'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya@gmail.com',
      phone: '9876543211',
      password: 'user123',
      role: 'user',
      status: 'active'
    }
  ],
  shopOwners: [
    {
      id: 1,
      name: 'City PUC Services',
      email: 'citypuc@gmail.com',
      phone: '8308544837',
      password: 'shop123',
      role: 'shopOwner',
      status: 'active',
      subscription: 'active'
    },
    {
      id: 2,
      name: 'Green Auto Care',
      email: 'greencare@gmail.com',
      phone: '9876543212',
      password: 'shop123',
      role: 'shopOwner',
      status: 'active',
      subscription: 'active'
    },
    {
      id: 3,
      name: 'Quick PUC Center',
      email: 'quickpuc@gmail.com',
      phone: '9876543213',
      password: 'shop123',
      role: 'shopOwner',
      status: 'inactive',
      subscription: 'paused'
    }
  ],
  centers: [
    {
      id: 1,
      ownerId: 1,
      name: 'City PUC Services - Thane',
      address: '456 Station Road, Near Railway Station',
      city: 'Thane',
      state: 'Maharashtra',
      taluka: 'Thane',
      pincode: '400601',
      working_hours: '08:00 - 20:00',
      contact: '8308544837',
      pricing: {
        '2W_Petrol': 50,
        '3W_Petrol': 100,
        '3W_Diesel': 150,
        '4W_Petrol': 125,
        '4W_Diesel': 150
      },
      status: 'active'
    },
    {
      id: 2,
      ownerId: 1,
      name: 'City PUC Services - Mumbai',
      address: '123 Main Street, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      taluka: 'Mumbai Suburban',
      pincode: '400069',
      working_hours: '09:00 - 21:00',
      contact: '8308544837',
      pricing: {
        '2W_Petrol': 50,
        '3W_Petrol': 100,
        '3W_Diesel': 150,
        '4W_Petrol': 125,
        '4W_Diesel': 150
      },
      status: 'active'
    },
    {
      id: 3,
      ownerId: 2,
      name: 'Green Auto Care - Pune',
      address: '789 FC Road, Shivajinagar',
      city: 'Pune',
      state: 'Maharashtra',
      taluka: 'Pune City',
      pincode: '411004',
      working_hours: '08:00 - 19:00',
      contact: '9876543212',
      pricing: {
        '2W_Petrol': 50,
        '3W_Petrol': 100,
        '3W_Diesel': 150,
        '4W_Petrol': 125,
        '4W_Diesel': 150
      },
      status: 'active'
    },
    {
      id: 4,
      ownerId: 2,
      name: 'Green Auto Care - Nashik',
      address: '456 College Road, Nashik Road',
      city: 'Nashik',
      state: 'Maharashtra',
      taluka: 'Nashik',
      pincode: '422101',
      working_hours: '08:30 - 18:30',
      contact: '9876543212',
      pricing: {
        '2W_Petrol': 50,
        '3W_Petrol': 100,
        '3W_Diesel': 150,
        '4W_Petrol': 125,
        '4W_Diesel': 150
      },
      status: 'active'
    },
    {
      id: 5,
      ownerId: 3,
      name: 'Quick PUC Center - Nagpur',
      address: '321 Sitabuldi, Central Avenue',
      city: 'Nagpur',
      state: 'Maharashtra',
      taluka: 'Nagpur',
      pincode: '440012',
      working_hours: '09:00 - 20:00',
      contact: '9876543213',
      pricing: {
        '2W_Petrol': 50,
        '3W_Petrol': 100,
        '3W_Diesel': 150,
        '4W_Petrol': 125,
        '4W_Diesel': 150
      },
      status: 'active'
    }
  ],
  vehicles: [
    {
      id: 1,
      userId: 1,
      number: 'MH12JH1234',
      type: '4W',
      brand: 'Maruti',
      model: 'Swift',
      fuel: 'Petrol'
    },
    {
      id: 2,
      userId: 1,
      number: 'MH12AB5678',
      type: '2W',
      brand: 'Honda',
      model: 'Activa',
      fuel: 'Petrol'
    }
  ],
  bookings: [
    {
      id: 1,
      user_id: 1,
      center_id: 1,
      vehicle_id: 1,
      date: '2026-04-02',
      time: '10:30',
      status: 'confirmed',
      price: 125,
      pucNumber: null,
      certificate: null
    },
    {
      id: 2,
      user_id: 1,
      center_id: 2,
      vehicle_id: 2,
      date: '2026-03-28',
      time: '14:00',
      status: 'done',
      price: 50,
      pucNumber: 'PUC2026001234',
      certificate: 'https://example.com/certificates/puc001234.pdf'
    }
  ]
};

// Helper functions to interact with mock data
export const getMockData = (): MockDatabase => {
  const stored = localStorage.getItem('bookMyPucData');
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with default data
  localStorage.setItem('bookMyPucData', JSON.stringify(mockData));
  return mockData;
};

export const saveMockData = (data: MockDatabase): void => {
  localStorage.setItem('bookMyPucData', JSON.stringify(data));
};

export const resetMockData = (): void => {
  localStorage.setItem('bookMyPucData', JSON.stringify(mockData));
};

export default mockData;
