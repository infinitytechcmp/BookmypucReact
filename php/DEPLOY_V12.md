# BookMyPUC v12 - Quick Deployment Guide

## 🚀 Deploy v12 Updates to Production

### Step 1: Update Database (Choose One)

#### Option A: New Installation
```bash
# Use the complete database.sql file
mysql -u your_username -p bookmypuc < php/database.sql
```

#### Option B: Existing Installation (Recommended)
```bash
# Run only the migration script
mysql -u your_username -p bookmypuc < php/migration_v12.sql
```

### Step 2: Upload New PHP File

Upload `php/api/contact.php` to your server:

```bash
# Via FTP/SFTP
Local:  php/api/contact.php
Remote: /public_html/api/contact.php

# Or via SSH
scp php/api/contact.php user@server:/path/to/api/contact.php
```

### Step 3: Verify Database Table

```sql
-- Connect to your database
USE bookmypuc;

-- Check if table exists
SHOW TABLES LIKE 'contact_submissions';

-- View table structure
DESCRIBE contact_submissions;

-- Should show:
-- id, name, email, mobile, subject, message, status, created_at, updated_at
```

### Step 4: Test the API

```bash
# Test contact form submission
curl -X POST https://bookmypucapi.infinitytecsolutions.com/api/contact.php \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "mobile": "9876543210",
    "subject": "Test Subject",
    "message": "This is a test message"
  }'

# Expected response:
# {"success":true,"message":"Message sent successfully! We will get back to you soon."}
```

### Step 5: Test Email Delivery

1. Submit a test form from the website
2. Check email at: mishra.arun1586@gmail.com
3. Verify email contains all form fields
4. Check spam folder if not in inbox

### Step 6: Deploy Frontend (if needed)

If you haven't deployed the updated frontend:

```bash
# Build the React app
npm run build

# Deploy the dist folder to your hosting
# (Vercel, Netlify, AWS S3, etc.)
```

## ✅ Verification Checklist

- [ ] Database migration completed successfully
- [ ] contact_submissions table exists
- [ ] contact.php uploaded to server
- [ ] API endpoint responds to POST requests
- [ ] Test email received at mishra.arun1586@gmail.com
- [ ] Contact form works on website
- [ ] Form validation working (client + server)
- [ ] Success toast appears after submission
- [ ] Form clears after successful submission

## 🔧 Configuration Options

### Change Email Recipient

Edit `api/contact.php` line 72:

```php
$to = 'your-new-email@example.com';
```

### Customize Email Template

Edit the HTML in `sendContactEmail()` function (lines 80-140) in `api/contact.php`

### Add CC/BCC

Add to email headers in `api/contact.php`:

```php
$headers .= "Cc: another@example.com" . "\r\n";
$headers .= "Bcc: hidden@example.com" . "\r\n";
```

## 🐛 Troubleshooting

### Email Not Sending

**Check PHP mail() function:**
```php
<?php
if (mail('test@example.com', 'Test', 'Test message')) {
    echo 'Mail function works';
} else {
    echo 'Mail function not working';
}
?>
```

**Solutions:**
1. Enable mail() in php.ini
2. Configure SMTP settings
3. Use PHPMailer library (recommended for production)
4. Check server mail logs

### Database Error

```bash
# Check if table exists
mysql -u root -p -e "USE bookmypuc; SHOW TABLES LIKE 'contact_submissions';"

# If not exists, run migration again
mysql -u root -p bookmypuc < php/migration_v12.sql
```

### API Returns 404

1. Verify file path: `/api/contact.php`
2. Check file permissions: `chmod 644 contact.php`
3. Verify Apache/Nginx configuration
4. Check .htaccess rules

### CORS Error

Add to `api/contact.php` (already included):

```php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
```

## 📊 Monitor Contact Submissions

### View Recent Submissions

```sql
SELECT * FROM contact_submissions 
ORDER BY created_at DESC 
LIMIT 10;
```

### Count by Status

```sql
SELECT status, COUNT(*) as count 
FROM contact_submissions 
GROUP BY status;
```

### Search by Email

```sql
SELECT * FROM contact_submissions 
WHERE email LIKE '%example.com%';
```

## 🎯 Next Steps (Optional)

1. **Admin Panel Integration**
   - Add contact submissions view in admin dashboard
   - Mark as read/replied functionality
   - Export to CSV feature

2. **Email Improvements**
   - Implement SMTP with PHPMailer
   - Add auto-reply to user
   - Email templates for different subjects

3. **Analytics**
   - Track submission trends
   - Response time monitoring
   - Popular inquiry topics

## 📞 Support

If you encounter issues:
- Check `php/V12_CHANGES.md` for detailed documentation
- Review `php/README.md` for API details
- Email: mishra.arun1586@gmail.com

---

**Version**: v12  
**Date**: 2026-04-01  
**Status**: ✅ Ready for Production
