# Welcome to Your Miaoda Project
Miaoda Application Link URL
    URL:https://medo.dev/projects/app-an01wmk33xmp

# BookMyPUC - PHP MySQL Backend API Documentation v12

## Overview
This is the complete PHP + MySQL backend for the BookMyPUC application. It provides RESTful APIs for all application features including authentication, bookings, notifications, contact form, and admin operations.

## 🆕 Version 12 Updates
- ✅ Contact form API with email integration
- ✅ Email notifications to admin (mishra.arun1586@gmail.com)
- ✅ Contact submissions database storage
- ✅ Beautiful HTML email templates
- 📄 See [V12_CHANGES.md](V12_CHANGES.md) for detailed changelog

## Setup Instructions

### 1. Database Setup

**For New Installations:**
```bash
# Import the complete database schema (includes v12 changes)
mysql -u root -p < database.sql
```

**For Existing Installations (Upgrade to v12):**
```bash
# Run migration script to add contact_submissions table
mysql -u root -p bookmypuc < migration_v12.sql
```

**Or using phpMyAdmin:**
- Create a new database named 'bookmypuc'
- Import the database.sql file (new) or migration_v12.sql (upgrade)

### 2. Configure Database Connection
Edit `config/database.php` and update the database credentials:
```php
private $host = "localhost";
private $db_name = "bookmypuc";
private $username = "root";        // Your MySQL username
private $password = "";            // Your MySQL password
```

### 3. Server Setup
Place the `php` folder in your web server directory:
- **XAMPP**: `C:/xampp/htdocs/bookmypuc-api/`
- **WAMP**: `C:/wamp64/www/bookmypuc-api/`
- **MAMP**: `/Applications/MAMP/htdocs/bookmypuc-api/`

### 4. Test the API
Open your browser and navigate to:
```
http://localhost/bookmypuc-api/api/centers.php
```

## Default Credentials

### Admin
- Email: `admin@bookmypuc.com`
- Password: `admin123`

### Users
- Email: `arun@gmail.com`
- Password: `user123`

### Shop Owners
- Email: `citypuc@gmail.com`
- Password: `shop123`

**Note**: All passwords are hashed using PHP's `password_hash()` function with bcrypt.

## API Endpoints

### Base URL
```
http://localhost/bookmypuc-api/api/
```

---

## Authentication APIs

### 1. User/Shop Owner Login
**Endpoint**: `POST /auth.php?action=login`

**Request Body**:
```json
{
  "email": "arun@gmail.com",
  "password": "user123",
  "role": "user"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Arun Mishra",
      "email": "arun@gmail.com",
      "phone": "9326261416",
      "role": "user",
      "status": "active"
    }
  }
}
```

### 2. User/Shop Owner Registration
**Endpoint**: `POST /auth.php?action=register`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@gmail.com",
  "phone": "9876543210",
  "password": "password123",
  "role": "user"
}
```

### 3. Admin Login
**Endpoint**: `POST /auth.php?action=admin-login`

**Request Body**:
```json
{
  "email": "admin@bookmypuc.com",
  "password": "admin123"
}
```

---

## Centers APIs

### 1. Get All Centers
**Endpoint**: `GET /centers.php`

**Query Parameters**:
- `owner_id` - Filter by shop owner ID
- `state` - Filter by state
- `city` - Filter by city
- `taluka` - Filter by taluka
- `pincode` - Filter by pincode
- `id` - Get single center by ID

**Example**:
```
GET /centers.php?city=Thane&state=Maharashtra
```

### 2. Create Center
**Endpoint**: `POST /centers.php`

**Request Body**:
```json
{
  "owner_id": 1,
  "name": "City PUC Services",
  "address": "456 Station Road",
  "city": "Thane",
  "state": "Maharashtra",
  "taluka": "Thane",
  "pincode": "400601",
  "working_hours": "08:00 - 20:00",
  "contact": "9876543210",
  "pricing": {
    "2W_Petrol": 50,
    "3W_Petrol": 100,
    "3W_Diesel": 150,
    "4W_Petrol": 125,
    "4W_Diesel": 150
  }
}
```

### 3. Update Center
**Endpoint**: `PUT /centers.php`

**Request Body**:
```json
{
  "id": 1,
  "name": "Updated Center Name",
  "working_hours": "09:00 - 21:00"
}
```

### 4. Delete Center
**Endpoint**: `DELETE /centers.php?id=1`

---

## Bookings APIs

### 1. Get Bookings
**Endpoint**: `GET /bookings.php`

**Query Parameters**:
- `user_id` - Filter by user ID
- `center_id` - Filter by center ID
- `owner_id` - Filter by shop owner ID
- `status` - Filter by status (pending, confirmed, done, cancelled)
- `id` - Get single booking by ID

**Example**:
```
GET /bookings.php?user_id=1&status=confirmed
```

### 2. Create Booking
**Endpoint**: `POST /bookings.php`

**Request Body**:
```json
{
  "user_id": 1,
  "center_id": 1,
  "vehicle_id": 1,
  "price": 125.00
}
```

**Response**:
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 10,
    "date": "2026-04-02",
    "time": "10:30"
  }
}
```

### 3. Confirm Booking (Shop Owner)
**Endpoint**: `POST /bookings.php?action=confirm`

**Request Body**:
```json
{
  "id": 10
}
```

**Response**:
- Sets appointment date to current date + 2 days
- Generates random time within center working hours
- Sends notification to user

### 4. Reject Booking (Shop Owner)
**Endpoint**: `POST /bookings.php?action=reject`

**Request Body**:
```json
{
  "id": 10
}
```

### 5. Mark Booking as Done (Shop Owner)
**Endpoint**: `POST /bookings.php?action=mark-done`

**Request Body**:
```json
{
  "id": 10,
  "puc_number": "PUC2026001",
  "certificate": "certificate_001.pdf"
}
```

### 6. Cancel Booking (User)
**Endpoint**: `POST /bookings.php?action=cancel`

**Request Body**:
```json
{
  "id": 10
}
```

---

## Vehicles APIs

### 1. Get Vehicles
**Endpoint**: `GET /vehicles.php?user_id=1`

### 2. Create Vehicle
**Endpoint**: `POST /vehicles.php`

**Request Body**:
```json
{
  "user_id": 1,
  "number": "MH12JH1234",
  "type": "4W",
  "brand": "Maruti",
  "model": "Swift",
  "fuel": "Petrol"
}
```

### 3. Update Vehicle
**Endpoint**: `PUT /vehicles.php`

**Request Body**:
```json
{
  "id": 1,
  "number": "MH12JH5678",
  "brand": "Honda"
}
```

### 4. Delete Vehicle
**Endpoint**: `DELETE /vehicles.php?id=1`

---

## Notifications APIs

### 1. Get Notifications
**Endpoint**: `GET /notifications.php?user_id=1&user_role=user`

**Query Parameters**:
- `user_id` - Required
- `user_role` - Required (user, shopOwner, admin)
- `is_read` - Filter by read status (true/false)
- `id` - Get single notification

### 2. Get Unread Count
**Endpoint**: `GET /notifications.php?action=unread-count&user_id=1&user_role=user`

### 3. Create Notification
**Endpoint**: `POST /notifications.php`

**Request Body**:
```json
{
  "user_id": 1,
  "user_role": "user",
  "type": "booking_confirmed",
  "title": "Booking Confirmed!",
  "message": "Your booking has been confirmed",
  "booking_id": 10
}
```

### 4. Mark as Read
**Endpoint**: `POST /notifications.php?action=mark-read`

**Request Body**:
```json
{
  "id": 1
}
```

### 5. Mark All as Read
**Endpoint**: `POST /notifications.php?action=mark-all-read`

**Request Body**:
```json
{
  "user_id": 1,
  "user_role": "user"
}
```

### 6. Delete Notification
**Endpoint**: `DELETE /notifications.php?id=1`

---

## Users APIs

### 1. Get Users
**Endpoint**: `GET /users.php`

**Query Parameters**:
- `status` - Filter by status (active, inactive)
- `id` - Get single user
- `email` - Get user by email

### 2. Update User
**Endpoint**: `PUT /users.php`

**Request Body**:
```json
{
  "id": 1,
  "name": "Updated Name",
  "email": "newemail@gmail.com",
  "phone": "9876543210",
  "status": "active"
}
```

### 3. Delete User
**Endpoint**: `DELETE /users.php?id=1`

---

## Shop Owners APIs

### 1. Get Shop Owners
**Endpoint**: `GET /shop-owners.php`

**Query Parameters**:
- `status` - Filter by status
- `subscription` - Filter by subscription status
- `id` - Get single shop owner
- `email` - Get by email

### 2. Update Shop Owner
**Endpoint**: `PUT /shop-owners.php`

**Request Body**:
```json
{
  "id": 1,
  "name": "Updated Name",
  "status": "active",
  "subscription": "active"
}
```

### 3. Delete Shop Owner
**Endpoint**: `DELETE /shop-owners.php?id=1`

---

## Admin APIs

### 1. Get Dashboard Stats
**Endpoint**: `GET /admin.php?action=dashboard-stats`

**Response**:
```json
{
  "success": true,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "total_bookings": 100,
    "active_users": 50,
    "active_centers": 20,
    "active_shop_owners": 10,
    "total_revenue": 15000.00
  }
}
```

### 2. Get User Stats
**Endpoint**: `GET /admin.php?action=user-stats&user_id=1`

### 3. Get Shop Owner Stats
**Endpoint**: `GET /admin.php?action=shop-owner-stats&owner_id=1`

### 4. Activate User
**Endpoint**: `POST /admin.php?action=activate-user`

**Request Body**:
```json
{
  "id": 1
}
```

### 5. Deactivate User
**Endpoint**: `POST /admin.php?action=deactivate-user`

**Request Body**:
```json
{
  "id": 1
}
```

### 6. Activate Shop Owner
**Endpoint**: `POST /admin.php?action=activate-shop-owner`

**Request Body**:
```json
{
  "id": 1
}
```

### 7. Deactivate Shop Owner
**Endpoint**: `POST /admin.php?action=deactivate-shop-owner`

**Request Body**:
```json
{
  "id": 1
}
```

**Note**: This also deactivates all centers owned by the shop owner.

### 8. Pause Subscription
**Endpoint**: `POST /admin.php?action=pause-subscription`

**Request Body**:
```json
{
  "id": 1
}
```

### 9. Resume Subscription
**Endpoint**: `POST /admin.php?action=resume-subscription`

**Request Body**:
```json
{
  "id": 1
}
```

---

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description here"
}
```

**Common HTTP Status Codes**:
- `200` - Success
- `400` - Bad Request (missing parameters, validation errors)
- `401` - Unauthorized (invalid credentials)
- `404` - Not Found
- `405` - Method Not Allowed
- `409` - Conflict (duplicate email, etc.)
- `500` - Internal Server Error

---

## CORS Configuration

The API is configured to accept requests from any origin. In production, update the CORS headers in `config/database.php`:

```php
function setCorsHeaders() {
    // Update this to your frontend domain
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
    
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        exit(0);
    }
    
    header('Content-Type: application/json');
}
```

---

## Database Schema

### Tables
1. **admins** - Admin users
2. **users** - Regular users
3. **shop_owners** - PUC center owners
4. **centers** - PUC centers
5. **vehicles** - User vehicles
6. **bookings** - Booking records
7. **notifications** - User notifications

### Views
- **booking_details** - Complete booking information with joins

### Stored Procedures
- **GetAdminDashboardStats()** - Admin dashboard statistics
- **GetUserBookingStats(user_id)** - User booking statistics
- **GetShopOwnerBookingStats(owner_id)** - Shop owner statistics

---

## Testing with Postman

1. Import the API endpoints into Postman
2. Set the base URL: `http://localhost/bookmypuc-api/api/`
3. For POST/PUT requests, set:
   - Headers: `Content-Type: application/json`
   - Body: raw JSON

---

## Security Notes

1. **Password Hashing**: All passwords are hashed using bcrypt
2. **SQL Injection**: All queries use prepared statements
3. **Input Validation**: Required fields are validated
4. **CORS**: Configure for production environment
5. **HTTPS**: Use HTTPS in production

---

## Troubleshooting

### Database Connection Error
- Check MySQL is running
- Verify database credentials in `config/database.php`
- Ensure database `bookmypuc` exists

### 404 Not Found
- Check file paths and server configuration
- Verify `.htaccess` if using Apache

### CORS Errors
- Update CORS headers in `config/database.php`
- Check browser console for specific errors

---

## Contact Form API (v12)

### Submit Contact Form
**Endpoint**: `POST /contact.php`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "subject": "Inquiry about PUC centers",
  "message": "I would like to know more about your services..."
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Message sent successfully! We will get back to you soon."
}
```

**Error Response (400)**:
```json
{
  "success": false,
  "message": "All fields are required"
}
```

**Features**:
- ✅ Saves submission to database
- ✅ Sends email to admin (mishra.arun1586@gmail.com)
- ✅ Beautiful HTML email template
- ✅ Input validation and sanitization
- ✅ Reply-to set to user's email

**Validation Rules**:
- All fields required
- Email must be valid format
- Mobile must be 10 digits
- XSS and SQL injection prevention

**Email Template Includes**:
- User's name, email, mobile
- Subject and message
- Timestamp
- Professional gradient design

---

## Support

For issues or questions, refer to the main application documentation or contact the development team.
