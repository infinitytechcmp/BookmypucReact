-- BookMyPUC Database Schema v12
-- MySQL Database Creation and Sample Data
-- Version: 12 - Added contact_submissions table

-- Create Database
CREATE DATABASE IF NOT EXISTS bookmypuc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bookmypuc;

-- Drop tables if exist (for clean installation)
DROP TABLE IF EXISTS contact_submissions;
DROP TABLE IF EXISTS otps;
DROP TABLE IF EXISTS shop_owner_registrations;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS centers;
DROP TABLE IF EXISTS shop_owners;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS admins;

-- =====================================================
-- Table: admins
-- =====================================================
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: users
-- =====================================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: shop_owners
-- =====================================================
CREATE TABLE shop_owners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'shopOwner',
  status ENUM('active', 'inactive') DEFAULT 'active',
  subscription ENUM('active', 'paused') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_subscription (subscription)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: centers
-- =====================================================
CREATE TABLE centers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  taluka VARCHAR(100) NOT NULL,
  pincode VARCHAR(10) NOT NULL,
  working_hours VARCHAR(50) NOT NULL,
  contact VARCHAR(20) NOT NULL,
  center_code_petrol VARCHAR(100) NULL,
  center_code_diesel VARCHAR(100) NULL,
  license_document VARCHAR(255) NULL,
  pricing_2w_petrol DECIMAL(10,2) DEFAULT 50.00,
  pricing_3w_petrol DECIMAL(10,2) DEFAULT 100.00,
  pricing_3w_diesel DECIMAL(10,2) DEFAULT 150.00,
  pricing_4w_petrol DECIMAL(10,2) DEFAULT 125.00,
  pricing_4w_diesel DECIMAL(10,2) DEFAULT 150.00,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES shop_owners(id) ON DELETE CASCADE,
  INDEX idx_owner (owner_id),
  INDEX idx_city (city),
  INDEX idx_state (state),
  INDEX idx_pincode (pincode),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: vehicles
-- =====================================================
CREATE TABLE vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  number VARCHAR(20) NOT NULL,
  type ENUM('2W', '3W', '4W') NOT NULL,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  fuel ENUM('Petrol', 'Diesel') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_number (number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: bookings
-- =====================================================
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  center_id INT NOT NULL,
  vehicle_id INT NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(10) NOT NULL,
  status ENUM('pending', 'confirmed', 'done', 'cancelled') DEFAULT 'pending',
  price DECIMAL(10,2) NOT NULL,
  puc_number VARCHAR(50) NULL,
  certificate VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_center (center_id),
  INDEX idx_status (status),
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: notifications
-- =====================================================
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  user_role ENUM('user', 'shopOwner', 'admin') NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  booking_id INT NULL,
  center_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_role (user_id, user_role),
  INDEX idx_read (is_read),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: contact_submissions (v12)
-- =====================================================
CREATE TABLE contact_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('new', 'read', 'replied') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: otps (v13)
-- Purpose: Store OTPs for email verification during booking
-- =====================================================
CREATE TABLE otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  purpose ENUM('booking', 'registration', 'password_reset') DEFAULT 'booking',
  is_verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  INDEX idx_email (email),
  INDEX idx_otp (otp),
  INDEX idx_expires (expires_at),
  INDEX idx_verified (is_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table: shop_owner_registrations (v14)
-- Purpose: Store registrations waiting for admin approval
-- =====================================================
CREATE TABLE shop_owner_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  center_name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  owner_name VARCHAR(100) NOT NULL,
  contact VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  center_code_petrol VARCHAR(100) NOT NULL,
  center_code_diesel VARCHAR(100) NOT NULL,
  center_license_document VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Insert Admin (password: admin123)
-- REQUIRED: At least one admin account needed for system access
-- =====================================================
INSERT INTO admins (name, email, password, role) VALUES
('Admin', 'admin@bookmypuc.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- =====================================================
-- Create Views for Easy Data Access
-- =====================================================

-- View: Booking Details with User, Center, and Vehicle Info
CREATE OR REPLACE VIEW booking_details AS
SELECT 
  b.id,
  b.user_id,
  u.name AS user_name,
  u.email AS user_email,
  u.phone AS user_phone,
  b.center_id,
  c.name AS center_name,
  c.address AS center_address,
  c.city,
  c.state,
  c.owner_id,
  so.name AS shop_owner_name,
  b.vehicle_id,
  v.number AS vehicle_number,
  v.type AS vehicle_type,
  v.brand AS vehicle_brand,
  v.model AS vehicle_model,
  v.fuel AS vehicle_fuel,
  b.date,
  b.time,
  b.status,
  b.price,
  b.puc_number,
  b.certificate,
  b.created_at,
  b.updated_at
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN centers c ON b.center_id = c.id
JOIN shop_owners so ON c.owner_id = so.id
JOIN vehicles v ON b.vehicle_id = v.id;

-- =====================================================
-- Stored Procedures
-- =====================================================

DELIMITER //

-- Procedure: Get Dashboard Stats for Admin
CREATE PROCEDURE GetAdminDashboardStats()
BEGIN
  SELECT 
    (SELECT COUNT(*) FROM bookings) AS total_bookings,
    (SELECT COUNT(*) FROM users WHERE status = 'active') AS active_users,
    (SELECT COUNT(*) FROM centers WHERE status = 'active') AS active_centers,
    (SELECT SUM(price) FROM bookings WHERE status = 'done') AS total_revenue;
END //

-- Procedure: Get User Booking Stats
CREATE PROCEDURE GetUserBookingStats(IN p_user_id INT)
BEGIN
  SELECT 
    COUNT(*) AS total_bookings,
    SUM(CASE WHEN status = 'confirmed' AND date >= CURDATE() THEN 1 ELSE 0 END) AS upcoming_bookings,
    SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS completed_bookings,
    SUM(CASE WHEN status = 'done' THEN price ELSE 0 END) AS total_spent
  FROM bookings
  WHERE user_id = p_user_id;
END //

-- Procedure: Get Shop Owner Booking Stats
CREATE PROCEDURE GetShopOwnerBookingStats(IN p_owner_id INT)
BEGIN
  SELECT 
    COUNT(*) AS total_bookings,
    SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) AS pending_bookings,
    SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_bookings,
    SUM(CASE WHEN b.status = 'done' THEN 1 ELSE 0 END) AS completed_bookings,
    SUM(CASE WHEN b.status = 'done' THEN b.price ELSE 0 END) AS total_revenue
  FROM bookings b
  JOIN centers c ON b.center_id = c.id
  WHERE c.owner_id = p_owner_id;
END //

DELIMITER ;

-- =====================================================
-- Grant Permissions (adjust username/password as needed)
-- =====================================================
-- CREATE USER IF NOT EXISTS 'bookmypuc_user'@'localhost' IDENTIFIED BY 'your_secure_password';
-- GRANT ALL PRIVILEGES ON bookmypuc.* TO 'bookmypuc_user'@'localhost';
-- FLUSH PRIVILEGES;

-- =====================================================
-- End of SQL File
-- =====================================================
