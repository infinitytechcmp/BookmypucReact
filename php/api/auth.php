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
if (empty($data) && !empty($_POST)) {
    $data = $_POST;
}

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
/**
 * Send new registration email notification to admin
 */
function sendAdminRegistrationEmail($adminEmail, $ownerName, $centerName, $email, $phone) {
    $subject = 'BookMyPUC - New Shop Owner Registration Request';
    
    $message = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .details-box { background: white; border: 1px solid #e5e7eb; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .details-row { display: flex; margin-bottom: 10px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px; }
            .details-label { font-weight: bold; width: 150px; color: #4b5563; }
            .details-value { flex-grow: 1; color: #1f2937; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🚗 BookMyPUC Admin</h1>
                <p>New Shop Owner Registration Request</p>
            </div>
            <div class='content'>
                <p>Hello Admin,</p>
                <p>A new shop owner has registered and is waiting for approval to join the platform.</p>
                
                <div class='details-box'>
                    <div class='details-row'>
                        <div class='details-label'>Owner Name:</div>
                        <div class='details-value'>{$ownerName}</div>
                    </div>
                    <div class='details-row'>
                        <div class='details-label'>Center Name:</div>
                        <div class='details-value'>{$centerName}</div>
                    </div>
                    <div class='details-row'>
                        <div class='details-label'>Email Address:</div>
                        <div class='details-value'>{$email}</div>
                    </div>
                    <div class='details-row'>
                        <div class='details-label'>Contact Number:</div>
                        <div class='details-value'>{$phone}</div>
                    </div>
                </div>
                
                <p>Please log in to the admin panel to view the uploaded documents and approve or reject this request.</p>
                
                <p>Best regards,<br><strong>BookMyPUC System</strong></p>
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
    $result = mail($adminEmail, $subject, $message, $headers);
    error_log("Admin Registration Request email sent to {$adminEmail}: " . ($result ? 'Success' : 'Failed'));
    return $result;
}

/**
 * Handle user/shop owner registration
 */
function handleRegister($db, $data) {
    $role = isset($data['role']) ? $data['role'] : '';

    if ($role === 'shopOwner') {
        $required = ['name', 'email', 'phone', 'password', 'center_name', 'address', 'center_code_petrol', 'center_code_diesel'];
        $missing = validateRequired($data, $required);
        if (!empty($missing)) {
            sendResponse(false, 'Missing required fields: ' . implode(', ', $missing), null, 400);
        }

        $name = $data['name'];
        $email = $data['email'];
        $phone = $data['phone'];
        $password = hashPassword($data['password']);
        $center_name = $data['center_name'];
        $address = $data['address'];
        $center_code_petrol = $data['center_code_petrol'];
        $center_code_diesel = $data['center_code_diesel'];

        // File upload check
        if (!isset($_FILES['center_license_document'])) {
            sendResponse(false, 'Center license document is required', null, 400);
        }

        $file = $_FILES['center_license_document'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            sendResponse(false, 'Error uploading file: code ' . $file['error'], null, 400);
        }

        // Handle file upload
        $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9_.-]/', '_', basename($file['name']));
        $uploadDir = '../uploads/licenses/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $targetFile = $uploadDir . $fileName;
        if (!move_uploaded_file($file['tmp_name'], $targetFile)) {
            sendResponse(false, 'Failed to save uploaded license document', null, 500);
        }

        try {
            // Check if email already exists in shop_owners or users
            $checkQuery1 = "SELECT id FROM shop_owners WHERE email = :email";
            $checkStmt1 = $db->prepare($checkQuery1);
            $checkStmt1->bindParam(':email', $email);
            $checkStmt1->execute();
            if ($checkStmt1->fetch()) {
                sendResponse(false, 'Email already registered as shop owner', null, 409);
            }

            $checkQuery2 = "SELECT id FROM users WHERE email = :email";
            $checkStmt2 = $db->prepare($checkQuery2);
            $checkStmt2->bindParam(':email', $email);
            $checkStmt2->execute();
            if ($checkStmt2->fetch()) {
                sendResponse(false, 'Email already registered as user', null, 409);
            }

            // Check if a pending registration already exists
            $checkQuery3 = "SELECT id FROM shop_owner_registrations WHERE email = :email AND status = 'pending'";
            $checkStmt3 = $db->prepare($checkQuery3);
            $checkStmt3->bindParam(':email', $email);
            $checkStmt3->execute();
            if ($checkStmt3->fetch()) {
                sendResponse(false, 'A pending registration already exists for this email', null, 409);
            }

            // Insert into shop_owner_registrations
            $insertQuery = "INSERT INTO shop_owner_registrations 
                            (center_name, address, owner_name, contact, email, password, center_code_petrol, center_code_diesel, center_license_document, status) 
                            VALUES (:center_name, :address, :owner_name, :phone, :email, :password, :center_code_petrol, :center_code_diesel, :license_document, 'pending')";
            $stmt = $db->prepare($insertQuery);
            $stmt->bindParam(':center_name', $center_name);
            $stmt->bindParam(':address', $address);
            $stmt->bindParam(':owner_name', $name);
            $stmt->bindParam(':phone', $phone);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':password', $password);
            $stmt->bindParam(':center_code_petrol', $center_code_petrol);
            $stmt->bindParam(':center_code_diesel', $center_code_diesel);
            $stmt->bindParam(':license_document', $fileName);
            $stmt->execute();

            $regId = $db->lastInsertId();

            // Create notification for admin
            $notifQuery = "INSERT INTO notifications (user_id, user_role, type, title, message, is_read) 
                          VALUES (1, 'admin', 'user_registered', 'New Shop Owner Registration Request', :message, FALSE)";
            $notifStmt = $db->prepare($notifQuery);
            $notifMessage = $name . ' has requested registration for ' . $center_name;
            $notifStmt->bindParam(':message', $notifMessage);
            $notifStmt->execute();

            // Send email to admin (default admin email)
            sendAdminRegistrationEmail('admin@bookmypuc.com', $name, $center_name, $email, $phone);

            sendResponse(true, 'Registration submitted successfully. Waiting for admin approval.', ['id' => $regId]);
        } catch (PDOException $e) {
            sendResponse(false, 'Registration failed: ' . $e->getMessage(), null, 500);
        }
    } else {
        // Normal user registration
        $missing = validateRequired($data, ['name', 'email', 'phone', 'password', 'role']);
        if (!empty($missing)) {
            sendResponse(false, 'Missing required fields: ' . implode(', ', $missing), null, 400);
        }

        $name = $data['name'];
        $email = $data['email'];
        $phone = $data['phone'];
        $password = hashPassword($data['password']);

        try {
            $checkQuery = "SELECT id FROM users WHERE email = :email";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(':email', $email);
            $checkStmt->execute();

            if ($checkStmt->fetch()) {
                sendResponse(false, 'Email already exists', null, 409);
            }

            $insertQuery = "INSERT INTO users (name, email, phone, password, role, status) 
                           VALUES (:name, :email, :phone, :password, 'user', 'active')";
            $stmt = $db->prepare($insertQuery);
            $stmt->bindParam(':name', $name);
            $stmt->bindParam(':email', $email);
            $stmt->bindParam(':phone', $phone);
            $stmt->bindParam(':password', $password);
            $stmt->execute();

            $userId = $db->lastInsertId();

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
