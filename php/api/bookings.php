<?php
/**
 * Bookings API
 * Handles CRUD operations for bookings, confirmation, rejection, and completion
 */

require_once '../config/database.php';

setCorsHeaders();

$database = new Database();
$db = $database->getConnection();

$method = getRequestMethod();
$data = getRequestData();

// Get action from query parameter
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'confirm') {
    handleConfirmBooking($db, $data);
} elseif ($action === 'reject') {
    handleRejectBooking($db, $data);
} elseif ($action === 'mark-done') {
    handleMarkAsDone($db, $data);
} elseif ($action === 'cancel') {
    handleCancelBooking($db, $data);
} else {
    switch ($method) {
        case 'GET':
            handleGet($db);
            break;
        
        case 'POST':
            handleCreate($db, $data);
            break;
        
        case 'PUT':
            handleUpdate($db, $data);
            break;
        
        case 'DELETE':
            handleDelete($db);
            break;
        
        default:
            sendResponse(false, 'Method not allowed', null, 405);
    }
}

/**
 * Get bookings with filters
 */
function handleGet($db) {
    try {
        $conditions = [];
        $params = [];

        // Filter by user
        if (isset($_GET['user_id'])) {
            $conditions[] = 'b.user_id = :user_id';
            $params[':user_id'] = $_GET['user_id'];
        }

        // Filter by center
        if (isset($_GET['center_id'])) {
            $conditions[] = 'b.center_id = :center_id';
            $params[':center_id'] = $_GET['center_id'];
        }

        // Filter by shop owner
        if (isset($_GET['owner_id'])) {
            $conditions[] = 'c.owner_id = :owner_id';
            $params[':owner_id'] = $_GET['owner_id'];
        }

        // Filter by status
        if (isset($_GET['status'])) {
            $conditions[] = 'b.status = :status';
            $params[':status'] = $_GET['status'];
        }

        // Get single booking by ID
        if (isset($_GET['id'])) {
            $conditions[] = 'b.id = :id';
            $params[':id'] = $_GET['id'];
        }

        $whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';

        $query = "SELECT b.*, 
                 u.name as user_name, u.email as user_email, u.phone as user_phone,
                 c.name as center_name, c.address as center_address, c.city, c.state, c.owner_id,
                 v.number as vehicle_number, v.type as vehicle_type, v.brand as vehicle_brand, 
                 v.model as vehicle_model, v.fuel as vehicle_fuel
                 FROM bookings b
                 JOIN users u ON b.user_id = u.id
                 JOIN centers c ON b.center_id = c.id
                 JOIN vehicles v ON b.vehicle_id = v.id
                 $whereClause
                 ORDER BY b.created_at DESC";

        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        $bookings = $stmt->fetchAll();

        sendResponse(true, 'Bookings retrieved successfully', $bookings);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to retrieve bookings: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Create new booking
 */
function handleCreate($db, $data) {
    $required = ['user_id', 'center_id', 'vehicle_id', 'price'];
    $missing = validateRequired($data, $required);
    
    if (!empty($missing)) {
        sendResponse(false, 'Missing required fields: ' . implode(', ', $missing), null, 400);
    }

    try {
        // Get center details for working hours
        $centerQuery = "SELECT working_hours, name, owner_id FROM centers WHERE id = :center_id";
        $centerStmt = $db->prepare($centerQuery);
        $centerStmt->bindParam(':center_id', $data['center_id']);
        $centerStmt->execute();
        $center = $centerStmt->fetch();

        if (!$center) {
            sendResponse(false, 'Center not found', null, 404);
        }

        // Calculate booking date and time
        $bookingDate = calculateBookingDate();
        $bookingTime = generateRandomTime($center['working_hours']);

        $query = "INSERT INTO bookings (user_id, center_id, vehicle_id, date, time, status, price)
                 VALUES (:user_id, :center_id, :vehicle_id, :date, :time, 'pending', :price)";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $data['user_id']);
        $stmt->bindParam(':center_id', $data['center_id']);
        $stmt->bindParam(':vehicle_id', $data['vehicle_id']);
        $stmt->bindParam(':date', $bookingDate);
        $stmt->bindParam(':time', $bookingTime);
        $stmt->bindParam(':price', $data['price']);
        
        $stmt->execute();
        $bookingId = $db->lastInsertId();

        // Get user name for notification
        $userQuery = "SELECT name FROM users WHERE id = :user_id";
        $userStmt = $db->prepare($userQuery);
        $userStmt->bindParam(':user_id', $data['user_id']);
        $userStmt->execute();
        $user = $userStmt->fetch();

        // Notify shop owner about new booking
        $notifQuery = "INSERT INTO notifications (user_id, user_role, type, title, message, is_read, booking_id) 
                      VALUES (:owner_id, 'shopOwner', 'new_booking', 'New Booking Received! 📅', :message, FALSE, :booking_id)";
        $notifStmt = $db->prepare($notifQuery);
        $notifMessage = $user['name'] . ' has booked an appointment at ' . $center['name'];
        $notifStmt->bindParam(':owner_id', $center['owner_id']);
        $notifStmt->bindParam(':message', $notifMessage);
        $notifStmt->bindParam(':booking_id', $bookingId);
        $notifStmt->execute();

        sendResponse(true, 'Booking created successfully', [
            'id' => $bookingId,
            'date' => $bookingDate,
            'time' => $bookingTime
        ]);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to create booking: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Confirm booking (shop owner confirms)
 */
function handleConfirmBooking($db, $data) {
    if (!isset($data['id'])) {
        sendResponse(false, 'Booking ID is required', null, 400);
    }

    try {
        // Get booking and center details
        $query = "SELECT b.*, c.working_hours, c.name as center_name, u.name as user_name
                 FROM bookings b
                 JOIN centers c ON b.center_id = c.id
                 JOIN users u ON b.user_id = u.id
                 WHERE b.id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data['id']);
        $stmt->execute();
        $booking = $stmt->fetch();

        if (!$booking) {
            sendResponse(false, 'Booking not found', null, 404);
        }

        // Calculate new appointment date (current + 2 days) and time
        $appointmentDate = calculateBookingDate();
        $appointmentTime = generateRandomTime($booking['working_hours']);

        // Update booking
        $updateQuery = "UPDATE bookings SET status = 'confirmed', date = :date, time = :time WHERE id = :id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':date', $appointmentDate);
        $updateStmt->bindParam(':time', $appointmentTime);
        $updateStmt->bindParam(':id', $data['id']);
        $updateStmt->execute();

        // Notify user about confirmation
        $notifQuery = "INSERT INTO notifications (user_id, user_role, type, title, message, is_read, booking_id) 
                      VALUES (:user_id, 'user', 'booking_confirmed', 'Booking Confirmed! 🎉', :message, FALSE, :booking_id)";
        $notifStmt = $db->prepare($notifQuery);
        $notifMessage = 'Your booking at ' . $booking['center_name'] . ' has been confirmed for ' . $appointmentDate . ' at ' . $appointmentTime;
        $notifStmt->bindParam(':user_id', $booking['user_id']);
        $notifStmt->bindParam(':message', $notifMessage);
        $notifStmt->bindParam(':booking_id', $data['id']);
        $notifStmt->execute();

        sendResponse(true, 'Booking confirmed successfully', [
            'date' => $appointmentDate,
            'time' => $appointmentTime
        ]);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to confirm booking: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Reject booking (shop owner rejects)
 */
function handleRejectBooking($db, $data) {
    if (!isset($data['id'])) {
        sendResponse(false, 'Booking ID is required', null, 400);
    }

    try {
        // Get booking details
        $query = "SELECT b.user_id, c.name as center_name
                 FROM bookings b
                 JOIN centers c ON b.center_id = c.id
                 WHERE b.id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data['id']);
        $stmt->execute();
        $booking = $stmt->fetch();

        if (!$booking) {
            sendResponse(false, 'Booking not found', null, 404);
        }

        // Update booking status
        $updateQuery = "UPDATE bookings SET status = 'cancelled' WHERE id = :id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':id', $data['id']);
        $updateStmt->execute();

        // Notify user about rejection
        $notifQuery = "INSERT INTO notifications (user_id, user_role, type, title, message, is_read, booking_id) 
                      VALUES (:user_id, 'user', 'booking_rejected', 'Booking Rejected', :message, FALSE, :booking_id)";
        $notifStmt = $db->prepare($notifQuery);
        $notifMessage = 'Your booking at ' . $booking['center_name'] . ' has been rejected. Please try another center.';
        $notifStmt->bindParam(':user_id', $booking['user_id']);
        $notifStmt->bindParam(':message', $notifMessage);
        $notifStmt->bindParam(':booking_id', $data['id']);
        $notifStmt->execute();

        sendResponse(true, 'Booking rejected successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to reject booking: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Mark booking as done with PUC details
 */
function handleMarkAsDone($db, $data) {
    $required = ['id', 'puc_number'];
    $missing = validateRequired($data, $required);
    
    if (!empty($missing)) {
        sendResponse(false, 'Missing required fields: ' . implode(', ', $missing), null, 400);
    }

    try {
        // Get booking details
        $query = "SELECT b.user_id, c.name as center_name
                 FROM bookings b
                 JOIN centers c ON b.center_id = c.id
                 WHERE b.id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data['id']);
        $stmt->execute();
        $booking = $stmt->fetch();

        if (!$booking) {
            sendResponse(false, 'Booking not found', null, 404);
        }

        $certificate = isset($data['certificate']) ? $data['certificate'] : 'certificate.pdf';

        // Update booking
        $updateQuery = "UPDATE bookings SET status = 'done', puc_number = :puc_number, certificate = :certificate WHERE id = :id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':puc_number', $data['puc_number']);
        $updateStmt->bindParam(':certificate', $certificate);
        $updateStmt->bindParam(':id', $data['id']);
        $updateStmt->execute();

        // Notify user about PUC completion
        $notifQuery = "INSERT INTO notifications (user_id, user_role, type, title, message, is_read, booking_id) 
                      VALUES (:user_id, 'user', 'puc_ready', 'PUC Certificate Ready! ✅', :message, FALSE, :booking_id)";
        $notifStmt = $db->prepare($notifQuery);
        $notifMessage = 'Your PUC certificate (' . $data['puc_number'] . ') from ' . $booking['center_name'] . ' is ready';
        $notifStmt->bindParam(':user_id', $booking['user_id']);
        $notifStmt->bindParam(':message', $notifMessage);
        $notifStmt->bindParam(':booking_id', $data['id']);
        $notifStmt->execute();

        sendResponse(true, 'Booking marked as done successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to mark booking as done: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Cancel booking (user cancels)
 */
function handleCancelBooking($db, $data) {
    if (!isset($data['id'])) {
        sendResponse(false, 'Booking ID is required', null, 400);
    }

    try {
        $query = "UPDATE bookings SET status = 'cancelled' WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data['id']);
        $stmt->execute();

        sendResponse(true, 'Booking cancelled successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to cancel booking: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Update booking
 */
function handleUpdate($db, $data) {
    if (!isset($data['id'])) {
        sendResponse(false, 'Booking ID is required', null, 400);
    }

    try {
        $updates = [];
        $params = [':id' => $data['id']];

        $allowedFields = ['date', 'time', 'status'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($updates)) {
            sendResponse(false, 'No fields to update', null, 400);
        }

        $query = "UPDATE bookings SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();

        sendResponse(true, 'Booking updated successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to update booking: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Delete booking
 */
function handleDelete($db) {
    if (!isset($_GET['id'])) {
        sendResponse(false, 'Booking ID is required', null, 400);
    }

    try {
        $query = "DELETE FROM bookings WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $_GET['id']);
        $stmt->execute();

        sendResponse(true, 'Booking deleted successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to delete booking: ' . $e->getMessage(), null, 500);
    }
}
?>
