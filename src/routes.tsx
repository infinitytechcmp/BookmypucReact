import type { ReactNode } from 'react';

// Public Pages
import Home from './pages/Home';
import FindCenters from './pages/FindCenters';
import FAQs from './pages/FAQs';
import CmsPage from './pages/CmsPage';
import BlogDetail from './pages/BlogDetail';
import Blogs from './pages/Blogs';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';

// User Dashboard Pages
import UserDashboard from './pages/user/Dashboard';
import MyBookings from './pages/user/MyBookings';
import MyVehicles from './pages/user/MyVehicles';
import Profile from './pages/user/Profile';

// Shop Owner Dashboard Pages
import ShopOwnerDashboard from './pages/shop-owner/Dashboard';
import MyCenters from './pages/shop-owner/MyCenters';
import ShopOwnerBookings from './pages/shop-owner/Bookings';
import Subscription from './pages/shop-owner/Subscription';

// Admin Dashboard Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminShopOwners from './pages/admin/ShopOwners';
import AdminCenters from './pages/admin/Centers';
import AdminSubscriptions from './pages/admin/Subscriptions';
import AdminRegistrations from './pages/admin/Registrations';
import AdminBookings from './pages/admin/Bookings';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  // Public Routes
  { name: 'Home', path: '/', element: <Home /> },
  { name: 'About Us', path: '/about', element: <CmsPage slug="about" hideTitle /> },
  { name: 'Find Centers', path: '/find-centers', element: <FindCenters /> },
  { name: 'FAQs', path: '/faqs', element: <FAQs /> },
  { name: 'Privacy Policy', path: '/privacy-policy', element: <CmsPage slug="privacy-policy" title="Privacy Policy" /> },
  { name: 'Terms & Conditions', path: '/terms-conditions', element: <CmsPage slug="terms-conditions" title="Terms & Conditions" /> },
  { name: 'Contact Us', path: '/contact', element: <CmsPage slug="contact-us" hideTitle /> },
  { name: 'Blogs', path: '/blogs', element: <Blogs /> },
  { name: 'Blog Detail', path: '/blog/:slug', element: <BlogDetail />, visible: false },

  // Auth Routes
  { name: 'Login', path: '/login', element: <Login /> },
  { name: 'Register', path: '/register', element: <Register /> },
  { name: 'Admin Login', path: '/admin-login', element: <AdminLogin /> },

  // User Dashboard Routes
  { name: 'User Dashboard', path: '/user/dashboard', element: <UserDashboard /> },
  { name: 'My Bookings', path: '/user/bookings', element: <MyBookings /> },
  { name: 'My Vehicles', path: '/user/vehicles', element: <MyVehicles /> },
  { name: 'Profile', path: '/user/profile', element: <Profile /> },

  // Shop Owner Dashboard Routes
  { name: 'Shop Owner Dashboard', path: '/shop-owner/dashboard', element: <ShopOwnerDashboard /> },
  { name: 'My Centers', path: '/shop-owner/centers', element: <MyCenters /> },
  { name: 'Shop Owner Bookings', path: '/shop-owner/bookings', element: <ShopOwnerBookings /> },
  { name: 'Subscription', path: '/shop-owner/subscription', element: <Subscription /> },

  // Admin Dashboard Routes
  { name: 'Admin Dashboard', path: '/admin/dashboard', element: <AdminDashboard /> },
  { name: 'Admin Users', path: '/admin/users', element: <AdminUsers /> },
  { name: 'Admin Shop Owners', path: '/admin/shop-owners', element: <AdminShopOwners /> },
  { name: 'Admin Centers', path: '/admin/centers', element: <AdminCenters /> },
  { name: 'Admin Subscriptions', path: '/admin/subscriptions', element: <AdminSubscriptions /> },
  { name: 'Admin Registrations', path: '/admin/registrations', element: <AdminRegistrations /> },
  { name: 'Admin Bookings', path: '/admin/bookings', element: <AdminBookings /> },

  // Dynamic CMS Catch-All Route (Must be last so it doesn't override hardcoded paths)
  { name: 'Dynamic Page', path: '/:slug', element: <CmsPage /> },
];

export default routes;
