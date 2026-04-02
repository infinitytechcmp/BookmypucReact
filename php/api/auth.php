<?php
/**
 * Authentication API
 * Handles login and registration for users, shop owners, and admin
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
    case 'login':
        handleLogin($db, $data);
        break;
    
    case 'register':
        handleRegister($db, $data);
        break;
    
    case 'admin-login':
        handleAdminLogin($db, $data);
        break;
    
    default:
        sendResponse(false, 'Invalid action', null, 400);
}

/**
 * Handle user/shop owner login
 */
function handleLogin($db, $data) {
    $missing = validateRequired($data, ['email', 'password', 'role']);
    if (!empty($missing)) {
        sendResponse(false, 'Missing required fields: ' . implode(', ', $missing), null, 400);
    }

    $email = $data['email'];
    $password = $data['password'];
    $role = $data['role']; // 'user' or 'shopOwner'

    try {
        if ($role === 'user') {
            $query = "SELECT * FROM users WHERE email = :email AND status = 'active'";
        } else if ($role === 'shopOwner') {
            $query = "SELECT * FROM shop_owners WHERE email = :email AND status = 'active'";
        } else {
            sendResponse(false, 'Invalid role', null, 400);
        }

        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        $user = $stmt->fetch();

        if ($user && verifyPassword($password, $user['password'])) {
            // Remove password from response
            unset($user['password']);
            unset($user['created_at']);
            unset($user['updated_at']);
            
            sendResponse(true, 'Login successful', ['user' => $user]);
        } else {
            sendResponse(false, 'Invalid email or password', null, 401);
        }
    } catch (PDOException $e) {
        sendResponse(false, 'Login failed: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Handle user/shop owner registration
 */
function handleRegister($db, $data) {
    $missing = validateRequired($data, ['name', 'email', 'phone', 'password', 'role']);
    if (!empty($missing)) {
        sendResponse(false, 'Missing required fields: ' . implode(', ', $missing), null, 400);
    }

    $name = $data['name'];
    $email = $data['email'];
    $phone = $data['phone'];
    $password = hashPassword($data['password']);
    $role = $data['role']; // 'user' or 'shopOwner'

    try {
        // Check if email already exists
        if ($role === 'user') {
            $checkQuery = "SELECT id FROM users WHERE email = :email";
            $insertQuery = "INSERT INTO users (name, email, phone, password, role, status) 
                           VALUES (:name, :email, :phone, :password, 'user', 'active')";
        } else if ($role === 'shopOwner') {
            $checkQuery = "SELECT id FROM shop_owners WHERE email = :email";
            $insertQuery = "INSERT INTO shop_owners (name, email, phone, password, role, status, subscription) 
                           VALUES (:name, :email, :phone, :password, 'shopOwner', 'active', 'active')";
        } else {
            sendResponse(false, 'Invalid role', null, 400);
        }

        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':email', $email);
        $checkStmt->execute();

        if ($checkStmt->fetch()) {
            sendResponse(false, 'Email already exists', null, 409);
        }

        // Insert new user
        $stmt = $db->prepare($insertQuery);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':password', $password);
        $stmt->execute();

        $userId = $db->lastInsertId();

        // Create notification for admin
        $notifQuery = "INSERT INTO notifications (user_id, user_role, type, title, message, is_read) 
                      VALUES (1, 'admin', 'user_registered', 'New User Registered', :message, FALSE)";
        $notifStmt = $db->prepare($notifQuery);
        $notifMessage = $name . ' has registered on the platform';
        $notifStmt->bindParam(':message', $notifMessage);
        $notifStmt->execute();

        sendResponse(true, 'Registration successful', ['id' => $userId]);
    } catch (PDOException $e) {
        sendResponse(false, 'Registration failed: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Handle admin login
 */
function handleAdminLogin($db, $data) {
    $missing = validateRequired($data, ['email', 'password']);
    if (!empty($missing)) {
        sendResponse(false, 'Missing required fields: ' . implode(', ', $missing), null, 400);
    }

    $email = $data['email'];
    $password = $data['password'];

    try {
        $query = "SELECT * FROM admins WHERE email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        $admin = $stmt->fetch();

        if ($admin && verifyPassword($password, $admin['password'])) {
            // Remove password from response
            unset($admin['password']);
            unset($admin['created_at']);
            unset($admin['updated_at']);
            
            sendResponse(true, 'Admin login successful', ['user' => $admin]);
        } else {
            sendResponse(false, 'Invalid admin credentials', null, 401);
        }
    } catch (PDOException $e) {
        sendResponse(false, 'Admin login failed: ' . $e->getMessage(), null, 500);
    }
}
?>
