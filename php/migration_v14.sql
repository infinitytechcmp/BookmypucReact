-- BookMyPUC Database Migration to v14
-- Setup shop owner registration queue and add center document/code fields
-- Date: 2026-05-21

USE bookmypuc;

-- =====================================================
-- Add shop_owner_registrations table (v14)
-- =====================================================
CREATE TABLE IF NOT EXISTS shop_owner_registrations (
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
-- Add new columns to centers table (v14)
-- =====================================================
ALTER TABLE centers 
  ADD COLUMN IF NOT EXISTS center_code_petrol VARCHAR(100) NULL AFTER contact,
  ADD COLUMN IF NOT EXISTS center_code_diesel VARCHAR(100) NULL AFTER center_code_petrol,
  ADD COLUMN IF NOT EXISTS license_document VARCHAR(255) NULL AFTER center_code_diesel;

-- Verify table changes
SELECT 'v14 migration applied successfully' AS status;
DESCRIBE shop_owner_registrations;
DESCRIBE centers;
