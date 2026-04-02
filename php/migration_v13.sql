-- BookMyPUC Database Migration to v13
-- Run this script on existing databases to add otps table
-- Date: 2026-04-02

USE bookmypuc;

-- =====================================================
-- Add otps table (v13)
-- =====================================================
CREATE TABLE IF NOT EXISTS otps (
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

-- Verify table creation
SELECT 'otps table created successfully' AS status;

-- Show table structure
DESCRIBE otps;

-- Clean up expired OTPs (optional, can be run periodically)
-- DELETE FROM otps WHERE expires_at < NOW() AND is_verified = FALSE;
