# PHP Backend Integration - Migration Guide

## Overview
The application has been successfully integrated with the PHP + MySQL backend. All service methods are now async and return Promises.

## Key Changes

### 1. API Configuration
- New file: `src/config/api.ts`
- Contains API base URL and all endpoint definitions
- Update `API_BASE_URL` to match your PHP backend location:
  ```typescript
  export const API_BASE_URL = 'http://localhost/bookmypuc-api/api';
  ```

### 2. Service Methods Now Async
All service methods now return Promises and must be awaited:

**Before (Mock Data)**:
```typescript
const centers = centerService.getActiveCenters();
const vehicles = vehicleService.getVehiclesByUserId(userId);
```

**After (PHP Backend)**:
```typescript
const centers = await centerService.getActiveCenters();
const vehicles = await vehicleService.getVehiclesByUserId(userId);
```

### 3. Component Updates Required

#### useEffect Hooks
All data fetching in useEffect must use async functions:

**Pattern**:
```typescript
useEffect(() => {
  const fetchData = async () => {
    const data = await serviceMethod();
    setState(data);
  };
  fetchData();
}, [dependencies]);
```

#### Event Handlers
All event handlers that call services must be async:

**Pattern**:
```typescript
const handleAction = async () => {
  const result = await serviceMethod();
  if (result) {
    // Handle success
  }
};
```

## Database Setup

### 1. Install XAMPP/WAMP/MAMP
- Download and install a local PHP server

### 2. Import Database
```bash
mysql -u root -p < php/database.sql
```

Or use phpMyAdmin:
1. Create database: `bookmypuc`
2. Import `php/database.sql`

### 3. Configure Database Connection
Edit `php/config/database.php`:
```php
private $host = "localhost";
private $db_name = "bookmypuc";
private $username = "root";
private $password = "";
```

### 4. Copy PHP Files
Copy the `php` folder to your web server:
- XAMPP: `C:/xampp/htdocs/bookmypuc-api/`
- WAMP: `C:/wamp64/www/bookmypuc-api/`
- MAMP: `/Applications/MAMP/htdocs/bookmypuc-api/`

### 5. Test Backend
Open: `http://localhost/bookmypuc-api/`

You should see the test page with system status.

## Default Credentials

### Admin
- Email: `admin@bookmypuc.com`
- Password: `admin123`

### Testing
1. Start your PHP server (Apache + MySQL)
2. Ensure database is imported
3. Update API_BASE_URL in `src/config/api.ts`
4. Start React app: `npm run dev`
5. Login with admin credentials

## Sample Data Removed
All sample data has been removed from the database. Only the admin account remains.
You can register new users and shop owners through the application.

## API Endpoints

All endpoints are documented in `php/README.md` and `php/QUICKSTART.md`.

### Quick Reference:
- **Auth**: `/api/auth.php`
- **Centers**: `/api/centers.php`
- **Bookings**: `/api/bookings.php`
- **Vehicles**: `/api/vehicles.php`
- **Notifications**: `/api/notifications.php`
- **Users**: `/api/users.php`
- **Shop Owners**: `/api/shop-owners.php`
- **Admin**: `/api/admin.php`

## Troubleshooting

### CORS Errors
Update CORS headers in `php/config/database.php`:
```php
header("Access-Control-Allow-Origin: http://localhost:5173");
```

### Database Connection Failed
- Check MySQL is running
- Verify credentials in `php/config/database.php`
- Ensure database `bookmypuc` exists

### 404 Not Found
- Check PHP files are in correct directory
- Verify Apache is running
- Check `.htaccess` file exists

## Next Steps

1. ✅ PHP backend created and configured
2. ✅ Database schema created
3. ✅ All API endpoints implemented
4. ✅ Service files updated to use PHP APIs
5. ⏳ Component updates needed (async/await patterns)
6. ⏳ Test all features end-to-end

## Notes

- All passwords are hashed with bcrypt
- SQL injection protection via prepared statements
- Automatic notifications for booking state changes
- Booking date auto-calculated (current + 2 days)
- Random time generation within working hours
- Shop owner deactivation cascades to centers
