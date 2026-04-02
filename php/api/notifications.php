<?php
/**
 * Notifications API
 * Handles CRUD operations for notifications
 */

require_once '../config/database.php';

setCorsHeaders();

$database = new Database();
$db = $database->getConnection();

$method = getRequestMethod();
$data = getRequestData();

// Get action from query parameter
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'mark-read') {
    handleMarkAsRead($db, $data);
} elseif ($action === 'mark-all-read') {
    handleMarkAllAsRead($db, $data);
} elseif ($action === 'unread-count') {
    handleGetUnreadCount($db);
} else {
    switch ($method) {
        case 'GET':
            handleGet($db);
            break;
        
        case 'POST':
            handleCreate($db, $data);
            break;
        
        case 'DELETE':
            handleDelete($db);
            break;
        
        default:
            sendResponse(false, 'Method not allowed', null, 405);
    }
}

/**
 * Get notifications
 */
function handleGet($db) {
    try {
        $conditions = [];
        $params = [];

        // Filter by user and role (required)
        if (isset($_GET['user_id']) && isset($_GET['user_role'])) {
            $conditions[] = 'user_id = :user_id';
            $conditions[] = 'user_role = :user_role';
            $params[':user_id'] = $_GET['user_id'];
            $params[':user_role'] = $_GET['user_role'];
        } else {
            sendResponse(false, 'user_id and user_role are required', null, 400);
        }

        // Filter by read status
        if (isset($_GET['is_read'])) {
            $conditions[] = 'is_read = :is_read';
            $params[':is_read'] = $_GET['is_read'] === 'true' ? 1 : 0;
        }

        // Get single notification by ID
        if (isset($_GET['id'])) {
            $conditions[] = 'id = :id';
            $params[':id'] = $_GET['id'];
        }

        $whereClause = 'WHERE ' . implode(' AND ', $conditions);

        $query = "SELECT * FROM notifications $whereClause ORDER BY created_at DESC";

        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        $notifications = $stmt->fetchAll();

        // Convert is_read to boolean
        foreach ($notifications as &$notification) {
            $notification['read'] = (bool)$notification['is_read'];
            unset($notification['is_read']);
        }

        sendResponse(true, 'Notifications retrieved successfully', $notifications);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to retrieve notifications: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Get unread count
 */
function handleGetUnreadCount($db) {
    try {
        if (!isset($_GET['user_id']) || !isset($_GET['user_role'])) {
            sendResponse(false, 'user_id and user_role are required', null, 400);
        }

        $query = "SELECT COUNT(*) as count FROM notifications 
                 WHERE user_id = :user_id AND user_role = :user_role AND is_read = FALSE";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $_GET['user_id']);
        $stmt->bindParam(':user_role', $_GET['user_role']);
        $stmt->execute();
        
        $result = $stmt->fetch();

        sendResponse(true, 'Unread count retrieved successfully', ['count' => (int)$result['count']]);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to get unread count: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Create new notification
 */
function handleCreate($db, $data) {
    $required = ['user_id', 'user_role', 'type', 'title', 'message'];
    $missing = validateRequired($data, $required);
    
    if (!empty($missing)) {
        sendResponse(false, 'Missing required fields: ' . implode(', ', $missing), null, 400);
    }

    try {
        $query = "INSERT INTO notifications (user_id, user_role, type, title, message, is_read, booking_id, center_id)
                 VALUES (:user_id, :user_role, :type, :title, :message, FALSE, :booking_id, :center_id)";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $data['user_id']);
        $stmt->bindParam(':user_role', $data['user_role']);
        $stmt->bindParam(':type', $data['type']);
        $stmt->bindParam(':title', $data['title']);
        $stmt->bindParam(':message', $data['message']);
        
        $bookingId = isset($data['booking_id']) ? $data['booking_id'] : null;
        $centerId = isset($data['center_id']) ? $data['center_id'] : null;
        
        $stmt->bindParam(':booking_id', $bookingId);
        $stmt->bindParam(':center_id', $centerId);
        
        $stmt->execute();
        $notificationId = $db->lastInsertId();

        sendResponse(true, 'Notification created successfully', ['id' => $notificationId]);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to create notification: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Mark notification as read
 */
function handleMarkAsRead($db, $data) {
    if (!isset($data['id'])) {
        sendResponse(false, 'Notification ID is required', null, 400);
    }

    try {
        $query = "UPDATE notifications SET is_read = TRUE WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data['id']);
        $stmt->execute();

        sendResponse(true, 'Notification marked as read');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to mark notification as read: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Mark all notifications as read
 */
function handleMarkAllAsRead($db, $data) {
    $required = ['user_id', 'user_role'];
    $missing = validateRequired($data, $required);
    
    if (!empty($missing)) {
        sendResponse(false, 'Missing required fields: ' . implode(', ', $missing), null, 400);
    }

    try {
        $query = "UPDATE notifications SET is_read = TRUE WHERE user_id = :user_id AND user_role = :user_role";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $data['user_id']);
        $stmt->bindParam(':user_role', $data['user_role']);
        $stmt->execute();

        sendResponse(true, 'All notifications marked as read');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to mark all notifications as read: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Delete notification
 */
function handleDelete($db) {
    if (!isset($_GET['id'])) {
        sendResponse(false, 'Notification ID is required', null, 400);
    }

    try {
        $query = "DELETE FROM notifications WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $_GET['id']);
        $stmt->execute();

        sendResponse(true, 'Notification deleted successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to delete notification: ' . $e->getMessage(), null, 500);
    }
}
?>
