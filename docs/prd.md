# Requirements Document

## 1. Application Overview

- **Application Name:** BookMyPUC
- **Description:** A modern SaaS web application for booking Pollution Under Control (PUC) appointments. The platform connects vehicle owners with PUC centers, enabling seamless appointment scheduling, certificate management, and center administration across three distinct roles: Admin, User, and Shop Owner. Features include real-time notifications across all modules, booking confirmation/rejection by shop owners, dynamic analytics with per-shop-owner filtering in the Admin Dashboard, a fully functional Contact Us form with PHP-based email delivery, a complete PHP API layer backed by a MySQL (v12) relational database, a fully functional Add Center form, a pending confirmation state for all new bookings until the respective shop owner explicitly marks them as confirmed, and a real OTP-based email verification system using a dedicated OTP table for verification and admin backup.

---

## 2. User Roles & Use Cases

### 2.1 Roles
- **Admin:** Platform-wide management, analytics, center and user oversight, OTP audit via the otp_logs table.
- **User (Vehicle Owner):** Browse PUC centers, book appointments, track booking status, manage certificates.
- **Shop Owner:** Manage their PUC center, view incoming bookings, confirm or reject bookings, update appointment status.

### 2.2 Core Use Cases
- Vehicle owner searches for a nearby PUC center and books an appointment.
- Booking is created in **Pending Confirmation** state and remains so until the shop owner acts.
- Shop owner receives a real-time notification of the new booking and either confirms or rejects it.
- Vehicle owner receives a real-time notification upon confirmation or rejection.
- Admin monitors all bookings, centers, and analytics with per-shop-owner filtering.
- During registration or password reset, a real OTP is generated, stored in the `otp_logs` table, and delivered to the user's email via PHP. The OTP is then verified through a dedicated PHP API endpoint.

---

## 3. Page Structure & Core Features

### 3.1 Page Hierarchy

```
BookMyPUC
├── Public
│   ├── Home / Landing Page
│   ├── Contact Us
│   └── Auth
│       ├── Register (with OTP email verification)
│       ├── Login
│       ├── Forgot Password (OTP-based)
│       └── Reset Password (after OTP verification)
├── User Dashboard
│   ├── Search & Browse Centers
│   ├── Book Appointment
│   ├── My Bookings (with status tracking)
│   └── My Certificates
├── Shop Owner Dashboard
│   ├── Overview / Analytics
│   ├── Incoming Bookings (Pending Confirmation)
│   ├── Confirmed Bookings
│   ├── Rejected Bookings
│   └── Center Profile Management
└── Admin Dashboard
    ├── Overview & Analytics (per-shop-owner filter)
    ├── Manage Centers
    ├── Manage Users
    ├── Manage Shop Owners
    ├── All Bookings
    └── OTP Logs (admin backup view)
```

### 3.2 Public Pages

**Home / Landing Page**
- Platform introduction, key features, call-to-action for registration/login.

**Contact Us**
- Form fields: Name, Email, Subject, Message.
- On submission, sends email via PHP mailer (SMTP/mail()).
- Success/failure feedback displayed to user.

**Auth**
- Registration: Name, Email, Password, Role selection (User / Shop Owner).
  - After form submission, a real 6-digit OTP is generated, stored in `otp_logs`, and sent to the provided email via PHP.
  - User must enter the OTP on a verification screen before the account is activated.
- Login: Email + Password, role-based redirect after authentication.
- Forgot Password:
  - User enters registered email.
  - A real 6-digit OTP is generated, stored in `otp_logs`, and sent to the email via PHP.
  - User enters OTP on a verification screen.
  - Upon successful OTP verification, user is redirected to the Reset Password screen.
- Reset Password: User sets a new password after OTP verification.

### 3.3 User Dashboard

**Search & Browse Centers**
- Search by location, name, or availability.
- Center cards display: name, address, operating hours, available slots.

**Book Appointment**
- Select center → select date/time slot → enter vehicle details (vehicle number, type) → confirm booking.
- On successful submission, booking is created with status = `pending_confirmation`.
- User sees confirmation message: 「Your booking is submitted and awaiting shop owner confirmation.」
- Real-time notification sent to the respective shop owner upon new booking.

**My Bookings**
- Lists all bookings with current status badge:
  - `Pending Confirmation` — awaiting shop owner action.
  - `Confirmed` — shop owner has confirmed.
  - `Rejected` — shop owner has rejected.
  - `Completed` — service done, certificate issued.
  - `Cancelled` — cancelled by user.
- User receives real-time notification when status changes from `pending_confirmation` to `confirmed` or `rejected`.
- User can cancel a booking only while it is in `pending_confirmation` or `confirmed` state.

**My Certificates**
- Lists issued PUC certificates linked to completed bookings.
- Download certificate as PDF.

### 3.4 Shop Owner Dashboard

**Incoming Bookings — Pending Confirmation**
- Displays all bookings with status = `pending_confirmation` for this shop owner's center.
- Each booking card shows: user name, vehicle number, vehicle type, requested date/time, booking ID.
- Actions available per booking:
  - **Confirm** → updates status to `confirmed`, sends real-time notification to user.
  - **Reject** → opens rejection reason input → updates status to `rejected`, sends real-time notification to user.
- Bookings remain in this view until the shop owner acts; no auto-expiry in MVP.

**Confirmed Bookings**
- Lists all bookings with status = `confirmed`.
- Shop owner can mark a confirmed booking as `completed` and attach certificate details.

**Rejected Bookings**
- Read-only list of rejected bookings with rejection reason.

**Overview / Analytics**
- Total bookings, pending count, confirmed count, completed count, rejection rate.
- Date-range filter.

**Center Profile Management**
- Edit center details: name, address, operating hours, available slots per day, contact info.

### 3.5 Admin Dashboard

**Overview & Analytics**
- Platform-wide stats: total bookings, total centers, total users, total shop owners.
- Per-shop-owner filter: select a shop owner to view their center's analytics in isolation.
- Booking status breakdown chart (pending_confirmation, confirmed, rejected, completed, cancelled).

**Manage Centers**
- Add Center form: center name, address, operating hours, slot capacity, assigned shop owner.
- Edit / deactivate centers.

**Manage Users / Shop Owners**
- View, search, activate/deactivate accounts.

**All Bookings**
- Full booking list with filters: status, center, shop owner, date range.
- Admin can view booking details but cannot confirm/reject on behalf of shop owner.

**OTP Logs**
- Read-only view of all OTP records from the `otp_logs` table for admin audit and backup purposes.
- Columns: ID, user email, OTP purpose, OTP code, status (used/expired/pending), created_at, expires_at.

---

## 4. Business Rules & Logic

### 4.1 Booking Status State Machine

```
[New Booking Created]
        ↓
  pending_confirmation   ← default state on creation
     ↙          ↘
confirmed       rejected
     ↓
  completed

[Any state] → cancelled  (by user, only from pending_confirmation or confirmed)
```

- A booking MUST remain in `pending_confirmation` until the shop owner explicitly selects Confirm or Reject.
- No system, cron job, or admin action may auto-transition a booking out of `pending_confirmation` in MVP.
- Only the shop owner assigned to the center of that booking may confirm or reject it.
- Admin has read-only visibility of all booking states.

### 4.2 Notifications
- **Trigger: New booking created** → notify assigned shop owner (real-time + in-app).
- **Trigger: Shop owner confirms booking** → notify user (real-time + in-app).
- **Trigger: Shop owner rejects booking** → notify user with rejection reason (real-time + in-app).
- **Trigger: Booking marked completed** → notify user (real-time + in-app).
- **Trigger: User cancels booking** → notify shop owner (real-time + in-app).

### 4.3 Slot Management
- A time slot becomes unavailable once its capacity is reached (confirmed bookings count toward capacity).
- Pending confirmation bookings also reserve the slot to prevent overbooking.
- If a booking is rejected or cancelled, the slot is released.

### 4.4 Role-Based Access
- Users can only view and manage their own bookings.
- Shop owners can only view and act on bookings belonging to their assigned center.
- Admins have read access to all data; write access limited to center/user management.

### 4.5 OTP Rules
- OTP is a randomly generated 6-digit numeric code.
- OTP is valid for 10 minutes from the time of generation (`expires_at = created_at + 10 minutes`).
- OTP is single-use: once successfully verified, its status is updated to `used` and it cannot be reused.
- If the OTP has expired, the API returns a 410 Gone response and the user must request a new OTP.
- If the OTP does not match, the API returns a 422 Unprocessable Entity response.
- A maximum of 5 OTP verification attempts are allowed per OTP record; exceeding this marks the OTP as `expired`.
- A new OTP request invalidates any previously issued unexpired OTP for the same email and purpose by marking it `expired`.
- OTP purpose values: `email_verification` (registration), `password_reset`.
- All OTP records are retained in `otp_logs` for admin audit; records are never deleted.

---

## 5. Database Schema (MySQL v12)

### 5.1 Tables

**users**
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user', 'shop_owner') NOT NULL DEFAULT 'user',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_email_verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

> Note: `is_email_verified` is set to `1` only after the user successfully verifies their email OTP during registration.

**centers**
```sql
CREATE TABLE centers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_owner_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  address TEXT NOT NULL,
  operating_hours VARCHAR(100),
  slot_capacity_per_day INT NOT NULL DEFAULT 20,
  contact_info VARCHAR(100),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_owner_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**bookings**
```sql
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  center_id INT NOT NULL,
  vehicle_number VARCHAR(20) NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status ENUM(
    'pending_confirmation',
    'confirmed',
    'rejected',
    'completed',
    'cancelled'
  ) NOT NULL DEFAULT 'pending_confirmation',
  rejection_reason TEXT DEFAULT NULL,
  confirmed_at DATETIME DEFAULT NULL,
  rejected_at DATETIME DEFAULT NULL,
  completed_at DATETIME DEFAULT NULL,
  cancelled_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (center_id) REFERENCES centers(id) ON DELETE CASCADE
);

CREATE INDEX idx_bookings_center_status ON bookings(center_id, status);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_appointment_date ON bookings(appointment_date);
```

**certificates**
```sql
CREATE TABLE certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL UNIQUE,
  certificate_number VARCHAR(100) NOT NULL UNIQUE,
  issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valid_until DATE NOT NULL,
  pdf_path VARCHAR(255),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
```

**notifications**
```sql
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
```

**contact_messages**
```sql
CREATE TABLE contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

**otp_logs** *(new table)*
```sql
CREATE TABLE otp_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  otp_code CHAR(6) NOT NULL,
  purpose ENUM('email_verification', 'password_reset') NOT NULL,
  status ENUM('pending', 'used', 'expired') NOT NULL DEFAULT 'pending',
  attempts TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  verified_at DATETIME DEFAULT NULL
);

CREATE INDEX idx_otp_logs_email_purpose ON otp_logs(email, purpose);
CREATE INDEX idx_otp_logs_status ON otp_logs(status);
```

> Field notes:
> - `otp_code`: 6-digit numeric string, e.g. '847291'.
> - `purpose`: distinguishes registration OTP from password-reset OTP.
> - `status`: `pending` = not yet used; `used` = successfully verified; `expired` = timed out or invalidated by a newer OTP request or max attempts exceeded.
> - `attempts`: incremented on each failed verification attempt; capped at 5.
> - `expires_at`: set to `created_at + INTERVAL 10 MINUTE` at insert time.
> - `verified_at`: timestamp of successful verification; NULL until verified.
> - Records are never deleted; retained for admin audit.

---

## 6. PHP API Layer

### 6.1 Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user/shop owner, triggers OTP email |
| POST | /api/auth/verify-otp | Verify OTP (email_verification or password_reset) |
| POST | /api/auth/resend-otp | Resend OTP for a given email and purpose |
| POST | /api/auth/login | Login (only allowed if is_email_verified = 1), returns JWT token |
| POST | /api/auth/logout | Invalidate session/token |
| POST | /api/auth/forgot-password | Send password reset OTP to email |
| POST | /api/auth/reset-password | Reset password after OTP verification |

---

#### POST /api/auth/register — Register & Send Email Verification OTP
```php
// Request body
{
  \"name\": \"John Doe\",
  \"email\": \"john@example.com\",
  \"password\": \"secret123\",
  \"role\": \"user\"
}

// Step 1: Insert user with is_email_verified = 0
INSERT INTO users (name, email, password_hash, role, is_active, is_email_verified, created_at, updated_at)
VALUES (:name, :email, :password_hash, :role, 1, 0, NOW(), NOW());

// Step 2: Invalidate any existing pending OTPs for this email + purpose
UPDATE otp_logs
SET status = 'expired'
WHERE email = :email
  AND purpose = 'email_verification'
  AND status = 'pending';

// Step 3: Generate 6-digit OTP and insert into otp_logs
$otp_code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

INSERT INTO otp_logs (email, otp_code, purpose, status, attempts, created_at, expires_at)
VALUES (:email, :otp_code, 'email_verification', 'pending', 0, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE));

// Step 4: Send OTP email via PHPMailer SMTP
// Email subject: 'BookMyPUC - Email Verification OTP'
// Email body: 'Your OTP for email verification is: ' . $otp_code . '. Valid for 10 minutes.'
$mail->send();

// Response: 201 Created
// { \"message\": \"Registration successful. An OTP has been sent to your email for verification.\" }
```

---

#### POST /api/auth/verify-otp — Verify OTP
```php
// Request body
{
  \"email\": \"john@example.com\",
  \"otp_code\": \"847291\",
  \"purpose\": \"email_verification\"  // or \"password_reset\"
}

// Step 1: Fetch the latest pending OTP for this email + purpose
SELECT id, otp_code, status, attempts, expires_at
FROM otp_logs
WHERE email = :email
  AND purpose = :purpose
  AND status = 'pending'
ORDER BY created_at DESC
LIMIT 1;

// Step 2: Check expiry
// If NOW() > expires_at:
UPDATE otp_logs SET status = 'expired' WHERE id = :otp_id;
// Return 410 Gone: { \"error\": \"OTP has expired. Please request a new one.\" }

// Step 3: Check attempts
// If attempts >= 5:
UPDATE otp_logs SET status = 'expired' WHERE id = :otp_id;
// Return 429 Too Many Requests: { \"error\": \"Maximum verification attempts exceeded. Please request a new OTP.\" }

// Step 4: Validate OTP code
// If otp_code does not match:
UPDATE otp_logs SET attempts = attempts + 1 WHERE id = :otp_id;
// Return 422 Unprocessable Entity: { \"error\": \"Invalid OTP. Please try again.\" }

// Step 5: OTP is valid — mark as used
UPDATE otp_logs
SET status = 'used',
    verified_at = NOW()
WHERE id = :otp_id;

// Step 6a: If purpose = 'email_verification' → activate user account
UPDATE users
SET is_email_verified = 1,
    updated_at = NOW()
WHERE email = :email;
// Return 200 OK: { \"message\": \"Email verified successfully. You can now log in.\" }

// Step 6b: If purpose = 'password_reset' → issue a short-lived reset token
// Generate a secure token, store temporarily (e.g. in a session or signed JWT), return to client
// Return 200 OK: { \"message\": \"OTP verified.\", \"reset_token\": \"<signed_token>\" }
```

---

#### POST /api/auth/resend-otp — Resend OTP
```php
// Request body
{
  \"email\": \"john@example.com\",
  \"purpose\": \"email_verification\"  // or \"password_reset\"
}

// Step 1: Invalidate existing pending OTPs
UPDATE otp_logs
SET status = 'expired'
WHERE email = :email
  AND purpose = :purpose
  AND status = 'pending';

// Step 2: Generate new OTP and insert
$otp_code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

INSERT INTO otp_logs (email, otp_code, purpose, status, attempts, created_at, expires_at)
VALUES (:email, :otp_code, :purpose, 'pending', 0, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE));

// Step 3: Send OTP email via PHPMailer SMTP
// Return 200 OK: { \"message\": \"A new OTP has been sent to your email.\" }
```

---

#### POST /api/auth/login — Login
```php
// Request body
{
  \"email\": \"john@example.com\",
  \"password\": \"secret123\"
}

// Step 1: Fetch user
SELECT id, name, email, password_hash, role, is_active, is_email_verified
FROM users
WHERE email = :email
LIMIT 1;

// Step 2: Validate
// If user not found or password_hash mismatch → 401 Unauthorized
// If is_active = 0 → 403 Forbidden: { \"error\": \"Account is deactivated.\" }
// If is_email_verified = 0 → 403 Forbidden: { \"error\": \"Email not verified. Please verify your email before logging in.\" }

// Step 3: Issue JWT and return role-based redirect hint
// Return 200 OK: { \"token\": \"<jwt>\", \"role\": \"user\", \"redirect\": \"/dashboard\" }
```

---

#### POST /api/auth/forgot-password — Send Password Reset OTP
```php
// Request body
{
  \"email\": \"john@example.com\"
}

// Step 1: Verify email exists in users table
SELECT id FROM users WHERE email = :email AND is_active = 1 LIMIT 1;
// If not found → 404 Not Found: { \"error\": \"No active account found with this email.\" }

// Step 2: Invalidate existing pending password_reset OTPs
UPDATE otp_logs
SET status = 'expired'
WHERE email = :email
  AND purpose = 'password_reset'
  AND status = 'pending';

// Step 3: Generate and insert new OTP
$otp_code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

INSERT INTO otp_logs (email, otp_code, purpose, status, attempts, created_at, expires_at)
VALUES (:email, :otp_code, 'password_reset', 'pending', 0, NOW(), DATE_ADD(NOW(), INTERVAL 10 MINUTE));

// Step 4: Send OTP email via PHPMailer SMTP
// Email subject: 'BookMyPUC - Password Reset OTP'
// Email body: 'Your OTP for password reset is: ' . $otp_code . '. Valid for 10 minutes.'
$mail->send();

// Return 200 OK: { \"message\": \"A password reset OTP has been sent to your email.\" }
```

---

#### POST /api/auth/reset-password — Reset Password
```php
// Request body
{
  \"email\": \"john@example.com\",
  \"reset_token\": \"<signed_token_from_verify_otp>\",
  \"new_password\": \"newSecret456\"
}

// Step 1: Validate reset_token (verify signature and expiry)
// If invalid or expired → 401 Unauthorized: { \"error\": \"Invalid or expired reset token.\" }

// Step 2: Update password
UPDATE users
SET password_hash = :new_password_hash,
    updated_at = NOW()
WHERE email = :email;

// Return 200 OK: { \"message\": \"Password has been reset successfully. You can now log in.\" }
```

---

### 6.2 Centers Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/centers | List all active centers (with optional search params) |
| GET | /api/centers/{id} | Get center details |
| POST | /api/centers | Admin: Add new center |
| PUT | /api/centers/{id} | Admin/Shop Owner: Update center |
| DELETE | /api/centers/{id} | Admin: Deactivate center |
| GET | /api/centers/{id}/slots | Get available slots for a date |

### 6.3 Bookings Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/bookings | User: Create booking (status defaults to pending_confirmation) |
| GET | /api/bookings | Role-filtered list (user sees own; shop owner sees center's; admin sees all) |
| GET | /api/bookings/{id} | Get booking detail |
| PATCH | /api/bookings/{id}/confirm | Shop Owner: Confirm a pending_confirmation booking |
| PATCH | /api/bookings/{id}/reject | Shop Owner: Reject a pending_confirmation booking |
| PATCH | /api/bookings/{id}/complete | Shop Owner: Mark confirmed booking as completed |
| PATCH | /api/bookings/{id}/cancel | User: Cancel own booking (only if pending_confirmation or confirmed) |

#### POST /api/bookings — Create Booking
```php
// Request body
{
  \"center_id\": 5,
  \"vehicle_number\": \"MH12AB1234\",
  \"vehicle_type\": \"Car\",
  \"appointment_date\": \"2026-04-10\",
  \"appointment_time\": \"10:00:00\"
}

// SQL
INSERT INTO bookings
  (user_id, center_id, vehicle_number, vehicle_type, appointment_date, appointment_time, status, created_at, updated_at)
VALUES
  (:user_id, :center_id, :vehicle_number, :vehicle_type, :appointment_date, :appointment_time, 'pending_confirmation', NOW(), NOW());

// After insert: notify shop owner
INSERT INTO notifications (user_id, title, message, created_at)
SELECT
  c.shop_owner_id,
  'New Booking Pending Confirmation',
  CONCAT('Booking #', :booking_id, ' from ', :user_name, ' for ', :appointment_date, ' at ', :appointment_time, ' is awaiting your confirmation.'),
  NOW()
FROM centers c WHERE c.id = :center_id;
```

#### PATCH /api/bookings/{id}/confirm — Shop Owner Confirms Booking
```php
SELECT b.id
FROM bookings b
JOIN centers c ON b.center_id = c.id
WHERE b.id = :booking_id
  AND c.shop_owner_id = :auth_user_id
  AND b.status = 'pending_confirmation';

UPDATE bookings
SET
  status = 'confirmed',
  confirmed_at = NOW(),
  updated_at = NOW()
WHERE id = :booking_id
  AND status = 'pending_confirmation';

INSERT INTO notifications (user_id, title, message, created_at)
VALUES (
  :booking_user_id,
  'Booking Confirmed',
  CONCAT('Your booking #', :booking_id, ' has been confirmed by the PUC center.'),
  NOW()
);
```

#### PATCH /api/bookings/{id}/reject — Shop Owner Rejects Booking
```php
// Request body
{ \"rejection_reason\": \"Slot unavailable due to equipment maintenance.\" }

SELECT b.id
FROM bookings b
JOIN centers c ON b.center_id = c.id
WHERE b.id = :booking_id
  AND c.shop_owner_id = :auth_user_id
  AND b.status = 'pending_confirmation';

UPDATE bookings
SET
  status = 'rejected',
  rejection_reason = :rejection_reason,
  rejected_at = NOW(),
  updated_at = NOW()
WHERE id = :booking_id
  AND status = 'pending_confirmation';

INSERT INTO notifications (user_id, title, message, created_at)
VALUES (
  :booking_user_id,
  'Booking Rejected',
  CONCAT('Your booking #', :booking_id, ' was rejected. Reason: ', :rejection_reason),
  NOW()
);
```

#### PATCH /api/bookings/{id}/cancel — User Cancels Booking
```php
SELECT id FROM bookings
WHERE id = :booking_id
  AND user_id = :auth_user_id
  AND status IN ('pending_confirmation', 'confirmed');

UPDATE bookings
SET
  status = 'cancelled',
  cancelled_at = NOW(),
  updated_at = NOW()
WHERE id = :booking_id
  AND user_id = :auth_user_id
  AND status IN ('pending_confirmation', 'confirmed');

INSERT INTO notifications (user_id, title, message, created_at)
SELECT
  c.shop_owner_id,
  'Booking Cancelled by User',
  CONCAT('Booking #', :booking_id, ' has been cancelled by the user.'),
  NOW()
FROM bookings b
JOIN centers c ON b.center_id = c.id
WHERE b.id = :booking_id;
```

#### GET /api/bookings — List Bookings (Role-Filtered)
```php
// Admin: all bookings
SELECT b.*, u.name AS user_name, c.name AS center_name
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN centers c ON b.center_id = c.id
ORDER BY b.created_at DESC;

// Shop Owner: only bookings for their center
SELECT b.*, u.name AS user_name
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN centers c ON b.center_id = c.id
WHERE c.shop_owner_id = :auth_user_id
ORDER BY b.created_at DESC;

// Shop Owner — Pending Confirmation only
SELECT b.*, u.name AS user_name
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN centers c ON b.center_id = c.id
WHERE c.shop_owner_id = :auth_user_id
  AND b.status = 'pending_confirmation'
ORDER BY b.created_at ASC;

// User: only their own bookings
SELECT b.*, c.name AS center_name
FROM bookings b
JOIN centers c ON b.center_id = c.id
WHERE b.user_id = :auth_user_id
ORDER BY b.created_at DESC;
```

#### Slot Availability Check
```sql
SELECT COUNT(*) AS occupied
FROM bookings
WHERE center_id = :center_id
  AND appointment_date = :appointment_date
  AND appointment_time = :appointment_time
  AND status IN ('pending_confirmation', 'confirmed');

-- If occupied >= slot_capacity_per_day → slot unavailable
```

### 6.4 Notifications Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | Get notifications for authenticated user |
| PATCH | /api/notifications/{id}/read | Mark notification as read |
| PATCH | /api/notifications/read-all | Mark all notifications as read |

```sql
SELECT id, title, message, is_read, created_at
FROM notifications
WHERE user_id = :auth_user_id
ORDER BY created_at DESC
LIMIT 50;

UPDATE notifications
SET is_read = 1
WHERE id = :notification_id AND user_id = :auth_user_id;

UPDATE notifications
SET is_read = 1
WHERE user_id = :auth_user_id AND is_read = 0;
```

### 6.5 Admin Analytics Endpoint

```sql
-- Platform-wide summary
SELECT
  COUNT(*) AS total_bookings,
  SUM(status = 'pending_confirmation') AS pending_confirmation_count,
  SUM(status = 'confirmed') AS confirmed_count,
  SUM(status = 'rejected') AS rejected_count,
  SUM(status = 'completed') AS completed_count,
  SUM(status = 'cancelled') AS cancelled_count
FROM bookings
WHERE (:date_from IS NULL OR appointment_date >= :date_from)
  AND (:date_to IS NULL OR appointment_date <= :date_to);

-- Per-shop-owner filter
SELECT
  COUNT(*) AS total_bookings,
  SUM(b.status = 'pending_confirmation') AS pending_confirmation_count,
  SUM(b.status = 'confirmed') AS confirmed_count,
  SUM(b.status = 'rejected') AS rejected_count,
  SUM(b.status = 'completed') AS completed_count,
  SUM(b.status = 'cancelled') AS cancelled_count
FROM bookings b
JOIN centers c ON b.center_id = c.id
WHERE c.shop_owner_id = :shop_owner_id
  AND (:date_from IS NULL OR b.appointment_date >= :date_from)
  AND (:date_to IS NULL OR b.appointment_date <= :date_to);
```

### 6.6 Contact Us Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/contact | Submit contact form, store in DB, send email via PHP |

```php
INSERT INTO contact_messages (name, email, subject, message, sent_at)
VALUES (:name, :email, :subject, :message, NOW());

mail($admin_email, $subject, $message, 'From: ' . $email);
```

### 6.7 Admin OTP Logs Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/otp-logs | Admin: Read-only list of all OTP records for audit |

```sql
-- Admin: fetch all OTP log records with optional filters
SELECT id, email, purpose, otp_code, status, attempts, created_at, expires_at, verified_at
FROM otp_logs
ORDER BY created_at DESC
LIMIT 100 OFFSET :offset;

-- Optional filter by email
SELECT id, email, purpose, otp_code, status, attempts, created_at, expires_at, verified_at
FROM otp_logs
WHERE email = :email
ORDER BY created_at DESC;

-- Optional filter by purpose
SELECT id, email, purpose, otp_code, status, attempts, created_at, expires_at, verified_at
FROM otp_logs
WHERE purpose = :purpose
ORDER BY created_at DESC;

-- Optional filter by status
SELECT id, email, purpose, otp_code, status, attempts, created_at, expires_at, verified_at
FROM otp_logs
WHERE status = :status
ORDER BY created_at DESC;
```

---

## 7. Exceptions & Edge Cases

| Scenario | Handling |
|----------|----------|
| User tries to book a slot at full capacity (pending_confirmation + confirmed >= capacity) | API returns 409 Conflict: 「Selected slot is fully booked. Please choose another time.」 |
| Shop owner tries to confirm/reject a booking not belonging to their center | API returns 403 Forbidden |
| Shop owner tries to confirm/reject a booking not in pending_confirmation state | API returns 422 Unprocessable Entity: 「Booking is no longer in pending confirmation state.」 |
| User tries to cancel a completed or rejected booking | API returns 422: 「Booking cannot be cancelled in its current state.」 |
| Duplicate booking: same user, same center, same date/time, status in (pending_confirmation, confirmed) | API returns 409: 「You already have an active booking for this slot.」 |
| Shop owner account deactivated while bookings are pending_confirmation | Admin must reassign or handle manually; pending bookings remain visible to admin |
| Notification delivery failure | Log error silently; do not block booking creation or status update |
| User attempts to log in without verifying email | API returns 403 Forbidden: 「Email not verified. Please verify your email before logging in.」 |
| OTP has expired (NOW() > expires_at) | API returns 410 Gone: 「OTP has expired. Please request a new one.」; OTP status updated to expired |
| OTP code does not match | API returns 422 Unprocessable Entity: 「Invalid OTP. Please try again.」; attempts incremented |
| OTP verification attempts exceed 5 | API returns 429 Too Many Requests: 「Maximum verification attempts exceeded. Please request a new OTP.」; OTP status updated to expired |
| User requests a new OTP while a pending OTP exists | Existing pending OTP is marked expired; a new OTP is generated and sent |
| OTP email delivery failure | Log error silently; return 500 Internal Server Error to client: 「Failed to send OTP email. Please try again.」 |

---

## 8. Acceptance Criteria

1. A newly created booking always has status = `pending_confirmation` and is immediately visible in the shop owner's 「Incoming Bookings — Pending Confirmation」 view.
2. The booking status remains `pending_confirmation` until the shop owner explicitly clicks Confirm or Reject; no other actor or automated process may change this status.
3. Upon confirmation, the booking status transitions to `confirmed` and the user receives a real-time in-app notification.
4. Upon rejection, the booking status transitions to `rejected` with a stored rejection reason, and the user receives a real-time in-app notification including the reason.
5. The shop owner cannot confirm or reject a booking that is not in `pending_confirmation` state; the API enforces this with a 422 response.
6. Slot availability correctly accounts for both `pending_confirmation` and `confirmed` bookings when determining capacity.
7. The Admin Dashboard analytics correctly display a `pending_confirmation` count, filterable by shop owner.
8. All booking status transitions are recorded with their respective timestamp fields (confirmed_at, rejected_at, completed_at, cancelled_at).
9. The Contact Us form successfully stores the message in the database and delivers an email via PHP.
10. All notification triggers fire correctly for each status transition as defined in Section 4.2.
11. On registration, a real 6-digit OTP is generated, inserted into `otp_logs` with status = `pending` and expires_at = created_at + 10 minutes, and delivered to the user's email via PHP.
12. A user cannot log in until their email OTP has been successfully verified (is_email_verified = 1).
13. On successful OTP verification, the `otp_logs` record is updated to status = `used` and verified_at is recorded.
14. On OTP expiry or exceeding 5 attempts, the `otp_logs` record is updated to status = `expired` and the appropriate error is returned.
15. Requesting a new OTP invalidates all existing pending OTPs for the same email and purpose before inserting a new record.
16. The Admin OTP Logs endpoint returns all records from `otp_logs` and supports filtering by email, purpose, and status.
17. The forgot-password flow correctly generates and sends a password-reset OTP, and the reset-password endpoint only accepts a valid reset token issued after successful OTP verification.

---

## 9. Out of Scope (This Release)

- Auto-expiry or auto-rejection of pending_confirmation bookings after a time threshold.
- SMS or push notification channels (in-app notifications only for MVP).
- Multi-center assignment for a single shop owner.
- Payment gateway integration.
- PUC certificate generation/PDF rendering engine.
- Mobile native application.
- Advanced reporting or data export features.
- Rate limiting on OTP resend requests (beyond the 5-attempt cap per OTP record).