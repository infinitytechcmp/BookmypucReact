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
    
    case 'registrations':
        getRegistrations($db);
        break;
    
    case 'approve-registration':
        approveRegistration($db, $data);
        break;
    
    case 'reject-registration':
        rejectRegistration($db, $data);
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
                    (SELECT COUNT(*) FROM shop_owner_registrations WHERE status = 'pending') as pending_registrations,
                    (SELECT COALESCE(SUM(price), 0) FROM bookings WHERE status = 'done') as total_revenue";

        $stmt = $db->prepare($query);
        $stmt->execute();
        $stats = $stmt->fetch();

        // Convert to appropriate types
        $stats['total_bookings'] = (int)$stats['total_bookings'];
        $stats['active_users'] = (int)$stats['active_users'];
        $stats['active_centers'] = (int)$stats['active_centers'];
        $stats['active_shop_owners'] = (int)$stats['active_shop_owners'];
        $stats['pending_registrations'] = (int)$stats['pending_registrations'];
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

/**
 * Get all shop owner registrations
 */
function getRegistrations($db) {
    try {
        $query = "SELECT * FROM shop_owner_registrations ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $registrations = $stmt->fetchAll();
        
        sendResponse(true, 'Registrations retrieved successfully', $registrations);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to retrieve registrations: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Approve a shop owner registration request
 */
function approveRegistration($db, $data) {
    if (!isset($data['id'])) {
        sendResponse(false, 'Registration ID is required', null, 400);
    }

    $id = $data['id'];

    try {
        // Fetch registration details
        $query = "SELECT * FROM shop_owner_registrations WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $registration = $stmt->fetch();

        if (!$registration) {
            sendResponse(false, 'Registration request not found', null, 404);
        }

        if ($registration['status'] !== 'pending') {
            sendResponse(false, 'This registration request has already been ' . $registration['status'], null, 400);
        }

        // Start transaction
        $db->beginTransaction();

        // 1. Update status in shop_owner_registrations
        $updateQuery = "UPDATE shop_owner_registrations SET status = 'approved' WHERE id = :id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':id', $id);
        $updateStmt->execute();

        // 2. Check if email already exists in shop_owners (just in case)
        $checkQuery = "SELECT id FROM shop_owners WHERE email = :email";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':email', $registration['email']);
        $checkStmt->execute();
        if ($checkStmt->fetch()) {
            $db->rollBack();
            sendResponse(false, 'Email already registered as shop owner', null, 409);
        }

        // 3. Create shop owner account
        $insertQuery = "INSERT INTO shop_owners (name, email, phone, password, role, status, subscription) 
                        VALUES (:name, :email, :phone, :password, 'shopOwner', 'active', 'active')";
        $insertStmt = $db->prepare($insertQuery);
        $insertStmt->bindParam(':name', $registration['owner_name']);
        $insertStmt->bindParam(':email', $registration['email']);
        $insertStmt->bindParam(':phone', $registration['contact']);
        $insertStmt->bindParam(':password', $registration['password']); // password is already hashed from registration
        $insertStmt->execute();

        $shopOwnerId = $db->lastInsertId();

        // 4. Create notification for shop owner
        $notifQuery = "INSERT INTO notifications (user_id, user_role, type, title, message, is_read) 
                      VALUES (:user_id, 'shopOwner', 'account_approved', 'Account Approved', :message, FALSE)";
        $notifStmt = $db->prepare($notifQuery);
        $notifMessage = "Your shop owner account has been approved. You can now log in and add your center.";
        $notifStmt->bindParam(':user_id', $shopOwnerId);
        $notifStmt->bindParam(':message', $notifMessage);
        $notifStmt->execute();

        $db->commit();

        // Send confirmation email to shop owner
        sendShopOwnerApprovalEmail($registration['email'], $registration['owner_name']);

        sendResponse(true, 'Registration approved and shop owner account created successfully');
    } catch (PDOException $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        sendResponse(false, 'Failed to approve registration: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Reject a shop owner registration request
 */
function rejectRegistration($db, $data) {
    if (!isset($data['id'])) {
        sendResponse(false, 'Registration ID is required', null, 400);
    }

    $id = $data['id'];

    try {
        // Fetch registration details
        $query = "SELECT * FROM shop_owner_registrations WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $registration = $stmt->fetch();

        if (!$registration) {
            sendResponse(false, 'Registration request not found', null, 404);
        }

        if ($registration['status'] !== 'pending') {
            sendResponse(false, 'This registration request has already been ' . $registration['status'], null, 400);
        }

        // Update status in shop_owner_registrations
        $updateQuery = "UPDATE shop_owner_registrations SET status = 'rejected' WHERE id = :id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':id', $id);
        $updateStmt->execute();

        // Send rejection email to shop owner
        sendShopOwnerRejectionEmail($registration['email'], $registration['owner_name']);

        sendResponse(true, 'Registration rejected successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to reject registration: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Send approval email to shop owner
 */
function sendShopOwnerApprovalEmail($email, $ownerName) {
    $subject = 'BookMyPUC - Shop Owner Account Approved';
    
    $message = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .highlight { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🚗 BookMyPUC</h1>
                <p>Congratulations! Your Account is Approved</p>
            </div>
            <div class='content'>
                <p>Hello {$ownerName},</p>
                <p>We are pleased to inform you that your request to register as a Shop Owner on BookMyPUC has been approved by the administrator.</p>
                
                <div class='highlight'>
                    <strong>Important Note:</strong> You can add only <strong>one</strong> PUC center per email address. Please make sure to enter your center details carefully when adding your center.
                </div>
                
                <p>You can now log in using the email and password you provided during registration.</p>
                
                <p>Please log in and visit your <strong>My Centers</strong> page to complete your center profile and start accepting bookings.</p>
                
                <p>Best regards,<br><strong>BookMyPUC Team</strong></p>
            </div>
            <div class='footer'>
                <p>© 2026 BookMyPUC. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    ";

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: BookMyPUC <noreply@bookmypuc.com>" . "\r\n";
    $headers .= "Reply-To: support@bookmypuc.com" . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // Send email
    $result = mail($email, $subject, $message, $headers);
    error_log("Shop Owner Approval email sent to {$email}: " . ($result ? 'Success' : 'Failed'));
    return $result;
}

/**
 * Send rejection email to shop owner
 */
function sendShopOwnerRejectionEmail($email, $ownerName) {
    $subject = 'BookMyPUC - Shop Owner Registration Application Update';
    
    $message = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🚗 BookMyPUC</h1>
                <p>Registration Application Update</p>
            </div>
            <div class='content'>
                <p>Hello {$ownerName},</p>
                <p>Thank you for your interest in joining BookMyPUC as a shop owner.</p>
                <p>We regret to inform you that your application to register a PUC center has been rejected by the administrator after reviewing your submitted information and license document.</p>
                <p>If you believe this was an error or would like to submit updated information or clear documents, please register again with valid information or contact our support team at support@bookmypuc.com.</p>
                
                <p>Best regards,<br><strong>BookMyPUC Team</strong></p>
            </div>
            <div class='footer'>
                <p>© 2026 BookMyPUC. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    ";

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: BookMyPUC <noreply@bookmypuc.com>" . "\r\n";
    $headers .= "Reply-To: support@bookmypuc.com" . "\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    // Send email
    $result = mail($email, $subject, $message, $headers);
    error_log("Shop Owner Rejection email sent to {$email}: " . ($result ? 'Success' : 'Failed'));
    return $result;
}
?>
