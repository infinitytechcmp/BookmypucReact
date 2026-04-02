# BookMyPUC - PHP Backend Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Install XAMPP/WAMP/MAMP
Download and install a local PHP server:
- **Windows**: [XAMPP](https://www.apachefriends.org/) or [WAMP](https://www.wampserver.com/)
- **Mac**: [MAMP](https://www.mamp.info/)
- **Linux**: Install Apache, PHP, MySQL separately

### Step 2: Copy Files
```bash
# Copy the php folder to your web server directory
# XAMPP: C:/xampp/htdocs/bookmypuc-api/
# WAMP: C:/wamp64/www/bookmypuc-api/
# MAMP: /Applications/MAMP/htdocs/bookmypuc-api/

cp -r php/* /path/to/htdocs/bookmypuc-api/
```

### Step 3: Create Database
```bash
# Option 1: Using MySQL command line
mysql -u root -p < database.sql

# Option 2: Using phpMyAdmin
# 1. Open http://localhost/phpmyadmin
# 2. Create new database: bookmypuc
# 3. Import database.sql file
```

### Step 4: Configure Database
Edit `config/database.php`:
```php
private $host = "localhost";
private $db_name = "bookmypuc";
private $username = "root";      // Your MySQL username
private $password = "";          // Your MySQL password
```

### Step 5: Test API
Open browser and navigate to:
```
http://localhost/bookmypuc-api/
```

You should see the test page with system status and API endpoints.

---

## 📋 API Base URL

```
http://localhost/bookmypuc-api/api/
```

---

## 🔑 Test Credentials

### Admin
```
Email: admin@bookmypuc.com
Password: admin123
```

### User
```
Email: arun@gmail.com
Password: user123
```

### Shop Owner
```
Email: citypuc@gmail.com
Password: shop123
```

---

## 🧪 Quick API Tests

### Test 1: Login
```bash
curl -X POST http://localhost/bookmypuc-api/api/auth.php?action=login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "arun@gmail.com",
    "password": "user123",
    "role": "user"
  }'
```

### Test 2: Get Centers
```bash
curl http://localhost/bookmypuc-api/api/centers.php
```

### Test 3: Get Bookings
```bash
curl http://localhost/bookmypuc-api/api/bookings.php?user_id=1
```

### Test 4: Admin Dashboard Stats
```bash
curl http://localhost/bookmypuc-api/api/admin.php?action=dashboard-stats
```

---

## 📊 Database Tables

| Table | Description | Records |
|-------|-------------|---------|
| admins | Admin accounts | 1 |
| users | User accounts | 5 |
| shop_owners | Shop owner accounts | 4 |
| centers | PUC centers | 8 |
| vehicles | User vehicles | 7 |
| bookings | Booking records | 10 |
| notifications | User notifications | 5 |

---

## 🔧 Common Issues & Solutions

### Issue 1: Database Connection Failed
**Solution**: 
- Check MySQL is running
- Verify credentials in `config/database.php`
- Ensure database `bookmypuc` exists

### Issue 2: 404 Not Found
**Solution**:
- Check file paths are correct
- Verify Apache is running
- Check `.htaccess` file exists

### Issue 3: CORS Errors
**Solution**:
- Update CORS headers in `config/database.php`
- Add your frontend URL to allowed origins

### Issue 4: Permission Denied
**Solution**:
```bash
# Linux/Mac: Set proper permissions
chmod -R 755 /path/to/bookmypuc-api/
chown -R www-data:www-data /path/to/bookmypuc-api/
```

---

## 🎯 Key Features

✅ Complete RESTful API
✅ User authentication with bcrypt
✅ Role-based access (Admin, User, Shop Owner)
✅ Booking confirmation workflow
✅ Real-time notifications
✅ PUC certificate management
✅ Dashboard analytics
✅ CORS enabled
✅ SQL injection protection
✅ Input validation
✅ Error handling

---

## 📱 Frontend Integration

Update your React services to use the PHP backend:

```typescript
// Example: Update base URL in your services
const API_BASE_URL = 'http://localhost/bookmypuc-api/api';

// Login example
async function login(email: string, password: string, role: string) {
  const response = await fetch(`${API_BASE_URL}/auth.php?action=login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  });
  return response.json();
}

// Get centers example
async function getCenters(filters?: any) {
  const params = new URLSearchParams(filters);
  const response = await fetch(`${API_BASE_URL}/centers.php?${params}`);
  return response.json();
}
```

---

## 🚀 Production Deployment

### 1. Update Database Credentials
```php
private $host = "your-production-host";
private $db_name = "your-production-db";
private $username = "your-production-user";
private $password = "your-secure-password";
```

### 2. Update CORS Headers
```php
// In config/database.php
header("Access-Control-Allow-Origin: https://yourdomain.com");
```

### 3. Disable Error Display
```php
// In .htaccess
php_flag display_errors Off
```

### 4. Enable HTTPS
- Install SSL certificate
- Force HTTPS in .htaccess:
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 5. Secure Database
- Use strong passwords
- Limit database user permissions
- Enable MySQL firewall rules

---

## 📚 Additional Resources

- **Full API Documentation**: See `README.md` in php folder
- **Database Schema**: See `database.sql` for complete structure
- **Test Page**: Open `index.php` for interactive testing

---

## 💡 Tips

1. **Use Postman**: Import API endpoints for easier testing
2. **Check Logs**: Enable error logging for debugging
3. **Backup Database**: Regular backups before making changes
4. **Version Control**: Use Git to track API changes
5. **Monitor Performance**: Use MySQL slow query log

---

## 🆘 Support

For issues or questions:
1. Check the full `README.md` documentation
2. Review error logs in Apache/PHP
3. Test endpoints using the test page (`index.php`)
4. Verify database connection and data

---

## ✅ Checklist

- [ ] XAMPP/WAMP/MAMP installed
- [ ] PHP folder copied to htdocs
- [ ] Database created and imported
- [ ] Database credentials configured
- [ ] Apache and MySQL running
- [ ] Test page accessible
- [ ] API endpoints responding
- [ ] Sample data loaded
- [ ] Frontend connected to backend

---

**🎉 You're all set! Your BookMyPUC backend is ready to use.**
