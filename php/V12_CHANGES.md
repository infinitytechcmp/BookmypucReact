# BookMyPUC v12 Update - Contact Form with Email Integration

## 🆕 What's New in v12

### Features Added
1. **Contact Form with 5 Fields**
   - Full Name
   - Email Address
   - Mobile Number (10 digits)
   - Subject
   - Message

2. **Email Notification System**
   - Automatic email sent to: `mishra.arun1586@gmail.com`
   - Beautiful HTML email template
   - Includes all form details
   - Reply-to set to user's email

3. **Database Storage**
   - All contact submissions saved to database
   - Status tracking (new, read, replied)
   - Indexed for fast queries

4. **Form Validation**
   - Client-side validation (React)
   - Server-side validation (PHP)
   - Email format validation
   - 10-digit mobile number validation

## 📁 Files Added/Modified

### New Files
1. `php/api/contact.php` - Contact form API endpoint
2. `php/migration_v12.sql` - Database migration script
3. `php/V12_CHANGES.md` - This file

### Modified Files
1. `src/pages/ContactUs.tsx` - Updated with new fields and API integration
2. `src/config/api.ts` - Added CONTACT endpoint
3. `php/database.sql` - Added contact_submissions table (marked as v12)

## 🗄️ Database Changes

### New Table: contact_submissions

```sql
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
);
```

## 🚀 Deployment Instructions

### For New Installations
1. Use the updated `php/database.sql` file
2. It includes the contact_submissions table automatically

### For Existing Installations
1. Run the migration script:
   ```bash
   mysql -u your_username -p bookmypuc < php/migration_v12.sql
   ```

2. Upload the new PHP file:
   ```bash
   # Upload to your server
   php/api/contact.php → /api/contact.php
   ```

3. Verify the endpoint:
   ```bash
   curl -X POST https://bookmypucapi.infinitytecsolutions.com/api/contact.php \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "mobile": "9876543210",
       "subject": "Test Subject",
       "message": "Test message"
     }'
   ```

## 📧 Email Configuration

### Default Settings
- **To Email**: mishra.arun1586@gmail.com
- **From Email**: noreply@bookmypuc.com
- **Reply-To**: User's submitted email

### Customizing Email Recipient
To change the recipient email, edit `php/api/contact.php`:

```php
// Line 72
$to = 'your-email@example.com'; // Change this
```

### Email Template Features
- ✅ Beautiful HTML design
- ✅ Gradient header
- ✅ Organized field display
- ✅ Timestamp included
- ✅ Mobile responsive
- ✅ Professional styling

## 🧪 Testing the Contact Form

### Frontend Testing
1. Navigate to `/contact-us` page
2. Fill in all 5 fields:
   - Name: Your Name
   - Email: your@email.com
   - Mobile: 9876543210 (10 digits)
   - Subject: Test Subject
   - Message: Your message here
3. Click "Send Message"
4. Should see success toast notification

### Backend Testing
Check if email was received at `mishra.arun1586@gmail.com`

### Database Verification
```sql
-- Check if submission was saved
SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT 1;
```

## 🔒 Security Features

1. **Input Sanitization**
   - HTML special characters escaped
   - Tags stripped
   - SQL injection prevention

2. **Validation**
   - Email format validation
   - Mobile number format (10 digits)
   - Required field checks
   - XSS prevention

3. **Database**
   - Prepared statements
   - Parameterized queries
   - UTF-8 encoding

## 📊 API Endpoint Details

### POST /api/contact.php

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "9876543210",
  "subject": "Inquiry about PUC centers",
  "message": "I would like to know more about..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Message sent successfully! We will get back to you soon."
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "All fields are required"
}
```

**Validation Errors:**
- "All fields are required"
- "Invalid email format"
- "Invalid mobile number. Must be 10 digits"

## 📝 Admin Features (Future Enhancement)

The contact_submissions table is ready for admin panel integration:

### Suggested Admin Features
1. View all contact submissions
2. Mark as read/replied
3. Filter by status
4. Search by email/name
5. Export to CSV
6. Reply directly from admin panel

### Sample Admin Query
```sql
-- Get all new submissions
SELECT * FROM contact_submissions 
WHERE status = 'new' 
ORDER BY created_at DESC;

-- Mark as read
UPDATE contact_submissions 
SET status = 'read' 
WHERE id = ?;
```

## 🎨 Email Template Preview

The email sent to admin includes:
- 📧 Header: "New Contact Form Submission"
- 👤 Name field
- 📧 Email field
- 📱 Mobile field
- 📋 Subject field
- 💬 Message field
- 🕐 Timestamp
- 🎨 Professional gradient design

## 🐛 Troubleshooting

### Email Not Sending
1. Check PHP mail() function is enabled on server
2. Verify server can send emails
3. Check spam folder
4. Consider using SMTP (PHPMailer) for production

### Database Error
1. Verify migration script ran successfully
2. Check table exists: `SHOW TABLES LIKE 'contact_submissions';`
3. Verify user has INSERT permissions

### API Error
1. Check CORS headers in contact.php
2. Verify file uploaded to correct location
3. Check PHP error logs
4. Test with curl command

## 📈 Version History

- **v12** (2026-04-01): Added contact form with email integration
- **v11**: Production API integration complete
- **v10**: Initial PHP backend implementation

## 🎯 Next Steps

1. ✅ Deploy migration script to production database
2. ✅ Upload contact.php to production server
3. ✅ Test contact form end-to-end
4. ⏳ Consider adding admin panel for contact management
5. ⏳ Implement SMTP for reliable email delivery
6. ⏳ Add email templates for auto-replies

## 📞 Support

For issues or questions:
- Email: mishra.arun1586@gmail.com
- Subject: BookMyPUC v12 Support

---

**Status**: ✅ v12 Complete and Ready for Deployment  
**Last Updated**: 2026-04-01
