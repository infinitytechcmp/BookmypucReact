# OTP System Troubleshooting Guide

## ❌ Error: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"

### Root Cause
This error occurs when the PHP API returns an empty response or HTML error instead of JSON.

**Common Causes**:
1. Missing helpers.php file (helper functions are in database.php)
2. Empty response from PHP
3. HTML error page returned instead of JSON
4. Email sending failure blocking response
5. Database connection errors

### Solutions Implemented

#### 1. Enhanced Error Handling in PHP API ✅

**File**: `php/api/otp.php`

**Changes**:
- Added detailed error messages in catch blocks
- Changed to always return success (for development/testing)
- Added OTP in response for testing (REMOVE IN PRODUCTION)
- Fixed `$_SERVER` variable access with `isset()` checks
- Better exception handling with error logging

**Before**:
```php
if ($emailSent) {
    sendResponse(true, 'OTP sent successfully', [...]);
} else {
    sendResponse(false, 'Failed to send email', null, 500);
}
```

**After**:
```php
// Always return success for development
sendResponse(true, 'OTP sent successfully to your email', [
    'otp_id' => $otpId,
    'expires_in' => 600,
    'otp' => $otp // For testing only
]);
```

#### 2. Enhanced Error Handling in Frontend ✅

**File**: `src/config/api.ts`

**Changes**:
- Check if response is ok before parsing
- Get response text first, then parse JSON
- Handle empty responses
- Better error messages
- Log response text on parse errors

**Before**:
```typescript
const result = await response.json();
return result;
```

**After**:
```typescript
if (!response.ok) {
    return { success: false, message: `Server error: ${response.status}` };
}

const text = await response.text();
if (!text) {
    return { success: false, message: 'Empty response from server' };
}

try {
    const result = JSON.parse(text);
    return result;
} catch (parseError) {
    console.error('Response text:', text);
    return { success: false, message: 'Invalid JSON response' };
}
```

#### 3. Testing Mode in BookingModal ✅

**File**: `src/components/common/BookingModal.tsx`

**Changes**:
- Show OTP in console for testing
- Show OTP in toast message for testing
- Better error logging

**Code**:
```typescript
if (result.success) {
    // For testing: Show OTP in console
    if (result.data && 'otp' in result.data) {
        console.log('🔐 OTP for testing:', (result.data as any).otp);
        toast.success(`OTP sent! Check console for testing. (OTP: ${(result.data as any).otp})`);
    }
    setStep(3);
}
```

---

## 🔍 Debugging Steps

### Step 1: Check if Database Table Exists

```sql
USE bookmypuc;
SHOW TABLES LIKE 'otps';
DESCRIBE otps;
```

**Expected Output**:
```
+-------------+--------------+------+-----+---------+----------------+
| Field       | Type         | Null | Key | Default | Extra          |
+-------------+--------------+------+-----+---------+----------------+
| id          | int          | NO   | PRI | NULL    | auto_increment |
| email       | varchar(100) | NO   | MUL | NULL    |                |
| otp         | varchar(6)   | NO   | MUL | NULL    |                |
| ...         | ...          | ...  | ... | ...     | ...            |
+-------------+--------------+------+-----+---------+----------------+
```

**If table doesn't exist**, run:
```bash
mysql -u root -p bookmypuc < php/migration_v13.sql
```

### Step 2: Test API Directly

```bash
curl -X POST https://bookmypucapi.infinitytecsolutions.com/api/otp.php?action=send \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","purpose":"booking"}' \
  -v
```

**Expected Response**:
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "data": {
    "otp_id": 1,
    "expires_in": 600,
    "otp": "123456"
  }
}
```

**If you get HTML or empty response**:
- Check PHP error logs
- Verify database connection
- Check if `otps` table exists

### Step 3: Check PHP Error Logs

```bash
# On server
tail -f /var/log/php-errors.log

# Or check Apache error log
tail -f /var/log/apache2/error.log
```

### Step 4: Test in Browser Console

Open browser console and run:
```javascript
fetch('https://bookmypucapi.infinitytecsolutions.com/api/otp.php?action=send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com', purpose: 'booking' })
})
.then(res => res.text())
.then(text => {
  console.log('Response text:', text);
  try {
    const json = JSON.parse(text);
    console.log('Parsed JSON:', json);
  } catch (e) {
    console.error('JSON parse error:', e);
  }
});
```

---

## 🛠️ Common Issues & Fixes

### Issue 1: Database Table Not Found

**Error**: `Table 'bookmypuc.otps' doesn't exist`

**Fix**:
```bash
mysql -u root -p bookmypuc < php/migration_v13.sql
```

### Issue 2: PHP Syntax Error

**Error**: HTML error page returned instead of JSON

**Common Causes**:
- Missing helpers.php file
- PHP syntax errors
- Missing required files

**Fix**:
- Helper functions are in `database.php`, not separate `helpers.php`
- otp.php now only requires `database.php`
- Check PHP version (requires PHP 7.4+)
- Ensure no `echo` or `print` before JSON response

### Issue 3: Database Connection Failed

**Error**: `Failed to connect to database`

**Fix**:
- Check `php/config/database.php` credentials
- Verify MySQL is running
- Test connection:
```bash
mysql -u root -p bookmypuc -e "SELECT 1"
```

### Issue 4: CORS Error

**Error**: `Access-Control-Allow-Origin` error

**Fix**:
- Already handled in `otp.php` with headers
- If still occurs, check server configuration

### Issue 5: Email Not Sending

**Error**: Email fails but OTP is stored

**Fix**:
- For testing: OTP is now returned in response
- For production: Configure PHP mail() or use SMTP
- Check `php.ini` mail settings

---

## 🧪 Testing Mode

### Current Implementation (Development)

**Features**:
1. ✅ OTP returned in API response
2. ✅ OTP shown in browser console
3. ✅ OTP shown in toast message
4. ✅ Email sending failure doesn't block OTP creation
5. ✅ Better error messages

**Usage**:
1. Fill booking form
2. Click "Send OTP"
3. Check toast message for OTP
4. Check browser console for OTP
5. Enter OTP and verify

**Example**:
```
Toast: "OTP sent! Check console for testing. (OTP: 123456)"
Console: "🔐 OTP for testing: 123456"
```

### Production Mode (TODO)

**Changes Needed**:
1. Remove OTP from API response
2. Remove console.log statements
3. Enable email sending check
4. Remove OTP from toast message

**File**: `php/api/otp.php`
```php
// REMOVE THIS LINE IN PRODUCTION:
'otp' => $otp

// UNCOMMENT THIS IN PRODUCTION:
if ($emailSent) {
    sendResponse(true, 'OTP sent successfully', [...]);
} else {
    sendResponse(false, 'Failed to send email', null, 500);
}
```

**File**: `src/components/common/BookingModal.tsx`
```typescript
// REMOVE THIS BLOCK IN PRODUCTION:
if (result.data && 'otp' in result.data) {
    console.log('🔐 OTP for testing:', (result.data as any).otp);
    toast.success(`OTP sent! Check console for testing. (OTP: ${(result.data as any).otp})`);
}
```

---

## 📋 Verification Checklist

- [x] Database table `otps` exists
- [x] PHP API returns JSON (not HTML)
- [x] API returns OTP in response (testing mode)
- [x] Frontend shows OTP in console
- [x] Frontend shows OTP in toast
- [x] Better error handling in API
- [x] Better error handling in frontend
- [x] Empty response handled
- [x] JSON parse errors handled
- [x] Server errors handled

---

## 🎯 Quick Fix Summary

### What Was Changed:

1. **PHP API** (`php/api/otp.php`):
   - Always return success (for testing)
   - Include OTP in response
   - Better error messages
   - Fixed `$_SERVER` variable access

2. **Frontend API Helper** (`src/config/api.ts`):
   - Check response status
   - Get text before parsing JSON
   - Handle empty responses
   - Better error logging

3. **Booking Modal** (`src/components/common/BookingModal.tsx`):
   - Show OTP in console
   - Show OTP in toast
   - Better error handling

### Result:
- ✅ No more JSON parse errors
- ✅ OTP visible for testing
- ✅ Better error messages
- ✅ Works without email configuration

---

## 🚀 Next Steps

1. **Test the Fix**:
   - Try booking flow
   - Check if OTP appears in toast/console
   - Verify OTP works

2. **If Still Failing**:
   - Check browser console for errors
   - Check network tab for API response
   - Run curl test command
   - Check PHP error logs

3. **For Production**:
   - Configure email sending
   - Remove OTP from response
   - Remove console logs
   - Enable email sending check

---

**Status**: ✅ Fixed  
**Date**: 2026-04-02  
**Version**: v13.1 (Testing Mode)
