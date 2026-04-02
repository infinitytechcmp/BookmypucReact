<?php
/**
 * Admin API
 * Handles admin-specific operations and dashboard statistics
 */

require_once '../config/database.php';

setCorsHeaders();

$database = new Database();
$db = $database->getConnection();

$method = getRequestMethod();
$data = getRequestData();

// Get action from query parameter
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'dashboard-stats':
        getDashboardStats($db);
        break;
    
    case 'user-stats':
        getUserStats($db);
        break;
    
    case 'shop-owner-stats':
        getShopOwnerStats($db);
        break;
    
    case 'activate-user':
        activateUser($db, $data);
        break;
    
    case 'deactivate-user':
        deactivateUser($db, $data);
        break;
    
    case 'activate-shop-owner':
        activateShopOwner($db, $data);
        break;
    
    case 'deactivate-shop-owner':
        deactivateShopOwner($db, $data);
        break;
    
    case 'pause-subscription':
        pauseSubscription($db, $data);
        break;
    
    case 'resume-subscription':
        resumeSubscription($db, $data);
        break;
    
    default:
        sendResponse(false, 'Invalid action', null, 400);
}

/**
 * Get admin dashboard statistics
 */
function getDashboardStats($db) {
    try {
        $query = "SELECT 
                    (SELECT COUNT(*) FROM bookings) as total_bookings,
                    (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
                    (SELECT COUNT(*) FROM centers WHERE status = 'active') as active_centers,
                    (SELECT COUNT(*) FROM shop_owners WHERE status = 'active') as active_shop_owners,
                    (SELECT COALESCE(SUM(price), 0) FROM bookings WHERE status = 'done') as total_revenue";

        $stmt = $db->prepare($query);
        $stmt->execute();
        $stats = $stmt->fetch();

        // Convert to appropriate types
        $stats['total_bookings'] = (int)$stats['total_bookings'];
        $stats['active_users'] = (int)$stats['active_users'];
        $stats['active_centers'] = (int)$stats['active_centers'];
        $stats['active_shop_owners'] = (int)$stats['active_shop_owners'];
        $stats['total_revenue'] = (float)$stats['total_revenue'];

        sendResponse(true, 'Dashboard stats retrieved successfully', $stats);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to retrieve dashboard stats: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Get user statistics
 */
function getUserStats($db) {
    try {
        if (!isset($_GET['user_id'])) {
            sendResponse(false, 'user_id is required', null, 400);
        }

        $query = "SELECT 
                    COUNT(*) as total_bookings,
                    SUM(CASE WHEN status = 'confirmed' AND date >= CURDATE() THEN 1 ELSE 0 END) as upcoming_bookings,
                    SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed_bookings,
                    COALESCE(SUM(CASE WHEN status = 'done' THEN price ELSE 0 END), 0) as total_spent
                  FROM bookings
                  WHERE user_id = :user_id";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $_GET['user_id']);
        $stmt->execute();
        $stats = $stmt->fetch();

        // Convert to appropriate types
        $stats['total_bookings'] = (int)$stats['total_bookings'];
        $stats['upcoming_bookings'] = (int)$stats['upcoming_bookings'];
        $stats['completed_bookings'] = (int)$stats['completed_bookings'];
        $stats['total_spent'] = (float)$stats['total_spent'];

        sendResponse(true, 'User stats retrieved successfully', $stats);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to retrieve user stats: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Get shop owner statistics
 */
function getShopOwnerStats($db) {
    try {
        if (!isset($_GET['owner_id'])) {
            sendResponse(false, 'owner_id is required', null, 400);
        }

        $query = "SELECT 
                    COUNT(b.id) as total_bookings,
                    SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
                    SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
                    SUM(CASE WHEN b.status = 'done' THEN 1 ELSE 0 END) as completed_bookings,
                    COALESCE(SUM(CASE WHEN b.status = 'done' THEN b.price ELSE 0 END), 0) as total_revenue,
                    (SELECT COUNT(*) FROM centers WHERE owner_id = :owner_id) as total_centers
                  FROM bookings b
                  JOIN centers c ON b.center_id = c.id
                  WHERE c.owner_id = :owner_id";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':owner_id', $_GET['owner_id']);
        $stmt->execute();
        $stats = $stmt->fetch();

        // Convert to appropriate types
        $stats['total_bookings'] = (int)$stats['total_bookings'];
        $stats['pending_bookings'] = (int)$stats['pending_bookings'];
        $stats['confirmed_bookings'] = (int)$stats['confirmed_bookings'];
        $stats['completed_bookings'] = (int)$stats['completed_bookings'];
        $stats['total_revenue'] = (float)$stats['total_revenue'];
        $stats['total_centers'] = (int)$stats['total_centers'];

        sendResponse(true, 'Shop owner stats retrieved successfully', $stats);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to retrieve shop owner stats: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Activate user
 */
function activateUser($db, $data) {
    if (!isset($data['id'])) {
        sendResponse(false, 'User ID is required', null, 400);
    }

    try {
        $query = "UPDATE users SET status = 'active' WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data['id']);
        $stmt->execute();

        sendResponse(true, 'User activated successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to activate user: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Deactivate user
 */
function deactivateUser($db, $data) {
    if (!isset($data['id'])) {
        sendResponse(false, 'User ID is required', null, 400);
    }

    try {
        $query = "UPDATE users SET status = 'inactive' WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data['id']);
        $stmt->execute();

        sendResponse(true, 'User deactivated successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to deactivate user: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Activate shop owner
 */
function activateShopOwner($db, $data) {
    if (!isset($data['id'])) {
        sendResponse(false, 'Shop owner ID is required', null, 400);
    }

    try {
        $query = "UPDATE shop_owners SET status = 'active' WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data['id']);
        $stmt->execute();

        sendResponse(true, 'Shop owner activated successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to activate shop owner: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Deactivate shop owner
 */
function deactivateShopOwner($db, $data) {
    if (!isset($data['id'])) {
        sendResponse(false, 'Shop owner ID is required', null, 400);
    }

    try {
        // Deactivate shop owner
        $query = "UPDATE shop_owners SET status = 'inactive' WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data['id']);
        $stmt->execute();

        // Also deactivate all their centers
        $centerQuery = "UPDATE centers SET status = 'inactive' WHERE owner_id = :id";
        $centerStmt = $db->prepare($centerQuery);
        $centerStmt->bindParam(':id', $data['id']);
        $centerStmt->execute();

        sendResponse(true, 'Shop owner and their centers deactivated successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to deactivate shop owner: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Pause subscription
 */
function pauseSubscription($db, $data) {
    if (!isset($data['id'])) {
        sendResponse(false, 'Shop owner ID is required', null, 400);
    }

    try {
        $query = "UPDATE shop_owners SET subscription = 'paused' WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data['id']);
        $stmt->execute();

        sendResponse(true, 'Subscription paused successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to pause subscription: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Resume subscription
 */
function resumeSubscription($db, $data) {
    if (!isset($data['id'])) {
        sendResponse(false, 'Shop owner ID is required', null, 400);
    }

    try {
        $query = "UPDATE shop_owners SET subscription = 'active' WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $data['id']);
        $stmt->execute();

        sendResponse(true, 'Subscription resumed successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to resume subscription: ' . $e->getMessage(), null, 500);
    }
}
?>
