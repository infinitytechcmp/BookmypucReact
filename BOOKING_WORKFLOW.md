# BookMyPUC - Booking Workflow Documentation

## 🔄 Complete Booking Workflow

### Overview
The booking system implements a **two-step confirmation process** where bookings start in "pending" status and require shop owner confirmation before becoming "confirmed".

---

## 📋 Booking Status Flow

```
User Books → PENDING → Shop Owner Confirms → CONFIRMED → Shop Owner Marks Done → DONE
                ↓
         Shop Owner Rejects → CANCELLED
                ↓
         User Cancels (if confirmed) → CANCELLED
```

---

## 🎯 Status Definitions

### 1. PENDING
- **When**: Immediately after user completes booking
- **Who Can See**: User and Shop Owner
- **User Actions**: View booking details, wait for confirmation
- **Shop Owner Actions**: Confirm or Reject
- **Description**: Booking request submitted, awaiting shop owner approval

### 2. CONFIRMED
- **When**: After shop owner confirms the booking
- **Who Can See**: User and Shop Owner
- **User Actions**: View booking, Cancel booking
- **Shop Owner Actions**: Mark as Done (with PUC certificate)
- **Description**: Appointment confirmed with date and time

### 3. DONE
- **When**: After shop owner marks booking as complete
- **Who Can See**: User and Shop Owner
- **User Actions**: View and download PUC certificate
- **Shop Owner Actions**: View only
- **Description**: PUC test completed, certificate issued

### 4. CANCELLED
- **When**: Shop owner rejects OR user cancels confirmed booking
- **Who Can See**: User and Shop Owner
- **User Actions**: View only
- **Shop Owner Actions**: View only
- **Description**: Booking cancelled/rejected

---

## 👤 User Journey

### Step 1: Book Appointment
1. User browses Find Centers page
2. Clicks "Book Now" on a center
3. Fills 3-step booking form:
   - Personal Details (if not logged in)
   - Vehicle Details
   - OTP Verification
4. Submits booking

### Step 2: Booking Submitted (PENDING)
- **Success Modal Shows**:
  - ✅ "Booking Submitted Successfully!"
  - ⏳ "Pending Shop Owner Confirmation"
  - Tentative date and time displayed
  - Email and WhatsApp notifications sent
- **Status**: PENDING
- **User Dashboard**: Shows booking with "Pending" badge
- **Actions Available**: None (wait for shop owner)

### Step 3: Shop Owner Confirms (CONFIRMED)
- **User Receives Notification**:
  - 🎉 "Booking Confirmed!"
  - Final appointment date and time
- **Status**: CONFIRMED
- **User Dashboard**: Shows booking with "Confirmed" badge
- **Actions Available**: Cancel booking

### Step 4: PUC Test Completed (DONE)
- **Shop Owner Marks as Done**:
  - Uploads PUC certificate
  - Enters PUC number
- **User Receives Notification**:
  - ✅ "PUC Certificate Generated!"
- **Status**: DONE
- **User Dashboard**: Shows "View Certificate" button
- **Actions Available**: Download certificate

---

## 🏪 Shop Owner Journey

### Step 1: Receive Booking Request
- **Notification Received**:
  - 📅 "New Booking Received!"
  - User name and center name
- **Bookings Page**: Shows new booking with "Pending" badge
- **Actions Available**: Confirm or Reject

### Step 2: Review Booking
- **Booking Details Visible**:
  - User name
  - Vehicle number and type
  - Tentative date and time
  - Price
- **Decision Required**: Confirm or Reject

### Step 3A: Confirm Booking
1. Click "Confirm" button
2. System automatically:
   - Sets status to CONFIRMED
   - Calculates final date (current + 2 days)
   - Generates random time within working hours
   - Sends notification to user
3. **Success Toast**: "Booking confirmed! User has been notified."

### Step 3B: Reject Booking
1. Click "Reject" button
2. System automatically:
   - Sets status to CANCELLED
   - Sends notification to user
3. **Success Toast**: "Booking rejected. User has been notified."

### Step 4: Mark as Done (After Service)
1. Click "Mark as Done" button
2. Fill form:
   - PUC Number (required)
   - Upload Certificate (required)
3. Submit
4. System automatically:
   - Sets status to DONE
   - Stores PUC details
   - Sends notification to user with certificate
5. **Success Toast**: "PUC Certificate Generated"

---

## 🔧 Technical Implementation

### Database Schema
```sql
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  center_id INT NOT NULL,
  vehicle_id INT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status ENUM('pending', 'confirmed', 'done', 'cancelled') DEFAULT 'pending',
  price DECIMAL(10,2) NOT NULL,
  puc_number VARCHAR(50),
  certificate VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### API Endpoints

#### 1. Create Booking (POST /api/bookings.php)
```json
Request:
{
  "user_id": 1,
  "center_id": 1,
  "vehicle_id": 1,
  "price": 125
}

Response:
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 1,
    "date": "2026-04-02",
    "time": "10:30"
  }
}
```
- **Initial Status**: pending
- **Date Calculation**: Current date + 2 days
- **Time Generation**: Random within center's working hours
- **Notification**: Sent to shop owner

#### 2. Confirm Booking (POST /api/bookings.php?action=confirm)
```json
Request:
{
  "id": 1
}

Response:
{
  "success": true,
  "message": "Booking confirmed successfully",
  "data": {
    "date": "2026-04-02",
    "time": "14:30"
  }
}
```
- **Status Change**: pending → confirmed
- **Date Recalculation**: Current date + 2 days (fresh calculation)
- **Time Regeneration**: New random time within working hours
- **Notification**: Sent to user

#### 3. Reject Booking (POST /api/bookings.php?action=reject)
```json
Request:
{
  "id": 1
}

Response:
{
  "success": true,
  "message": "Booking rejected successfully"
}
```
- **Status Change**: pending → cancelled
- **Notification**: Sent to user

#### 4. Mark as Done (POST /api/bookings.php?action=mark-done)
```json
Request:
{
  "id": 1,
  "puc_number": "MH12PUC123456",
  "certificate": "https://example.com/certificates/cert123.pdf"
}

Response:
{
  "success": true,
  "message": "Booking marked as done successfully"
}
```
- **Status Change**: confirmed → done
- **PUC Details**: Stored in database
- **Notification**: Sent to user with certificate link

#### 5. Cancel Booking (POST /api/bookings.php?action=cancel)
```json
Request:
{
  "id": 1
}

Response:
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```
- **Status Change**: confirmed → cancelled
- **Restriction**: Only confirmed bookings can be cancelled by user
- **Notification**: Sent to shop owner

---

## 📧 Notification System

### User Notifications

1. **Booking Submitted** (Automatic)
   - Title: "Booking Submitted! 📅"
   - Message: "Your booking request has been sent to [Center Name]"

2. **Booking Confirmed** (Shop Owner Action)
   - Title: "Booking Confirmed! 🎉"
   - Message: "Your booking at [Center Name] has been confirmed for [Date] at [Time]"

3. **Booking Rejected** (Shop Owner Action)
   - Title: "Booking Rejected ❌"
   - Message: "Your booking at [Center Name] has been rejected"

4. **PUC Certificate Generated** (Shop Owner Action)
   - Title: "PUC Certificate Generated! ✅"
   - Message: "Your PUC certificate is ready. Download it from your dashboard."

### Shop Owner Notifications

1. **New Booking Received** (User Action)
   - Title: "New Booking Received! 📅"
   - Message: "[User Name] has booked an appointment at [Center Name]"

2. **Booking Cancelled** (User Action)
   - Title: "Booking Cancelled ❌"
   - Message: "[User Name] has cancelled their booking at [Center Name]"

---

## 🎨 UI Components

### Status Badges

```typescript
// User Dashboard
pending: 'outline' (gray border)
confirmed: 'default' (blue)
done: 'secondary' (green)
cancelled: 'destructive' (red)

// Shop Owner Dashboard
pending: 'outline' (yellow/warning)
confirmed: 'default' (blue)
done: 'secondary' (green)
cancelled: 'destructive' (red)
```

### Action Buttons

**User Dashboard (My Bookings)**:
- Pending: No actions (waiting)
- Confirmed: "Cancel" button (red)
- Done: "View Certificate" button (outline)
- Cancelled: No actions

**Shop Owner Dashboard (Bookings)**:
- Pending: "Confirm" (green) + "Reject" (red)
- Confirmed: "Mark as Done" (blue)
- Done: No actions
- Cancelled: No actions

---

## ✅ Validation Rules

### Booking Creation
- User must be logged in
- Vehicle must be registered
- Center must be active
- Shop owner must be active
- All required fields must be filled

### Booking Confirmation
- Booking must exist
- Booking status must be "pending"
- Shop owner must own the center
- Date and time must be recalculated

### Booking Rejection
- Booking must exist
- Booking status must be "pending"
- Shop owner must own the center

### Mark as Done
- Booking must exist
- Booking status must be "confirmed"
- PUC number is required
- Certificate file is required
- Shop owner must own the center

### Booking Cancellation
- Booking must exist
- Booking status must be "confirmed"
- User must own the booking
- Cannot cancel pending or done bookings

---

## 🔒 Security & Permissions

### User Permissions
- ✅ Create bookings for their own vehicles
- ✅ View their own bookings
- ✅ Cancel their own confirmed bookings
- ❌ Cannot confirm bookings
- ❌ Cannot mark bookings as done
- ❌ Cannot view other users' bookings

### Shop Owner Permissions
- ✅ View bookings for their centers
- ✅ Confirm pending bookings
- ✅ Reject pending bookings
- ✅ Mark confirmed bookings as done
- ❌ Cannot create bookings
- ❌ Cannot cancel user bookings
- ❌ Cannot view bookings for other shop owners

### Admin Permissions
- ✅ View all bookings
- ✅ View all statistics
- ✅ Activate/deactivate users and shop owners
- ❌ Cannot directly modify bookings

---

## 📊 Business Logic

### Date Calculation
- **Initial Booking**: Current date + 2 days
- **After Confirmation**: Current date + 2 days (recalculated)
- **Example**: 
  - User books on 2026-03-31 → Tentative date: 2026-04-02
  - Shop owner confirms on 2026-04-01 → Final date: 2026-04-03

### Time Generation
- Random time within center's working hours
- Rounded to nearest 30 minutes (00 or 30)
- **Example**:
  - Working hours: 09:00 - 18:00
  - Possible times: 09:00, 09:30, 10:00, ..., 17:30

### Price Calculation
- Based on vehicle type and fuel type
- Pricing matrix:
  - 2W Petrol: ₹50
  - 3W Petrol: ₹100
  - 3W Diesel: ₹150
  - 4W Petrol: ₹125
  - 4W Diesel: ₹150

---

## 🎯 Key Features

1. **Two-Step Confirmation**: Prevents no-shows and ensures shop owner availability
2. **Automatic Notifications**: Keeps both parties informed
3. **Flexible Scheduling**: Date/time recalculated on confirmation
4. **Status Tracking**: Clear visibility of booking progress
5. **Certificate Management**: Digital PUC certificate storage
6. **Cancellation Policy**: Users can cancel confirmed bookings
7. **Rejection Handling**: Shop owners can reject if unavailable

---

## 📈 Statistics & Analytics

### User Dashboard
- Total Bookings
- Upcoming Bookings (confirmed, date >= today)
- Completed Bookings (done)

### Shop Owner Dashboard
- Total Bookings
- Pending Bookings (pending)
- Confirmed Bookings (confirmed)
- Completed Bookings (done)

### Admin Dashboard
- Total Bookings (all)
- Total Revenue (sum of done bookings)
- Active Users
- Active Centers

---

## 🐛 Error Handling

### Common Errors
1. **Booking Not Found**: Invalid booking ID
2. **Invalid Status**: Trying to perform action on wrong status
3. **Permission Denied**: User doesn't own the booking/center
4. **Center Not Found**: Invalid center ID
5. **Vehicle Not Found**: Invalid vehicle ID
6. **Missing PUC Details**: PUC number or certificate not provided

### Error Messages
- User-friendly messages displayed via toast notifications
- Technical errors logged for debugging
- Validation errors shown inline in forms

---

## ✅ Testing Checklist

### User Flow
- [ ] User can book appointment
- [ ] Booking starts in pending status
- [ ] Success modal shows correct message
- [ ] User receives notification
- [ ] Booking appears in My Bookings
- [ ] User cannot cancel pending booking
- [ ] User can cancel confirmed booking
- [ ] User can view certificate after done

### Shop Owner Flow
- [ ] Shop owner receives notification
- [ ] Pending booking appears in Bookings page
- [ ] Shop owner can confirm booking
- [ ] Shop owner can reject booking
- [ ] Confirmed booking shows Mark as Done button
- [ ] Shop owner can upload PUC certificate
- [ ] Done booking shows no actions

### Status Transitions
- [ ] pending → confirmed (shop owner confirms)
- [ ] pending → cancelled (shop owner rejects)
- [ ] confirmed → done (shop owner marks done)
- [ ] confirmed → cancelled (user cancels)

---

**Status**: ✅ Fully Implemented  
**Last Updated**: 2026-04-01  
**Version**: Production Ready
