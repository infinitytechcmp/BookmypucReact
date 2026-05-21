<?php
/**
 * Shop Owners API
 * Handles CRUD operations for shop owners
 */

require_once '../config/database.php';

setCorsHeaders();

$database = new Database();
$db = $database->getConnection();

$method = getRequestMethod();
$data = getRequestData();
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'registration-details') {
    handleRegistrationDetails($db);
}

switch ($method) {
    case 'GET':
        handleGet($db);
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

/**
 * Get shop owners
 */
function handleGet($db) {
    try {
        $conditions = [];
        $params = [];

        // Filter by status
        if (isset($_GET['status'])) {
            $conditions[] = 'status = :status';
            $params[':status'] = $_GET['status'];
        }

        // Filter by subscription
        if (isset($_GET['subscription'])) {
            $conditions[] = 'subscription = :subscription';
            $params[':subscription'] = $_GET['subscription'];
        }

        // Get single shop owner by ID
        if (isset($_GET['id'])) {
            $conditions[] = 'id = :id';
            $params[':id'] = $_GET['id'];
        }

        // Get by email
        if (isset($_GET['email'])) {
            $conditions[] = 'email = :email';
            $params[':email'] = $_GET['email'];
        }

        $whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';

        $query = "SELECT id, name, email, phone, role, status, subscription, created_at 
                 FROM shop_owners $whereClause ORDER BY created_at DESC";

        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        $shopOwners = $stmt->fetchAll();

        sendResponse(true, 'Shop owners retrieved successfully', $shopOwners);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to retrieve shop owners: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Update shop owner
 */
function handleUpdate($db, $data) {
    if (!isset($data['id'])) {
        sendResponse(false, 'Shop owner ID is required', null, 400);
    }

    try {
        $updates = [];
        $params = [':id' => $data['id']];

        $allowedFields = ['name', 'email', 'phone', 'status', 'subscription'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        // Handle password update separately
        if (isset($data['password']) && !empty($data['password'])) {
            $updates[] = "password = :password";
            $params[":password"] = hashPassword($data['password']);
        }

        if (empty($updates)) {
            sendResponse(false, 'No fields to update', null, 400);
        }

        $query = "UPDATE shop_owners SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();

        sendResponse(true, 'Shop owner updated successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to update shop owner: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Delete shop owner
 */
function handleDelete($db) {
    if (!isset($_GET['id'])) {
        sendResponse(false, 'Shop owner ID is required', null, 400);
    }

    try {
        $query = "DELETE FROM shop_owners WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $_GET['id']);
        $stmt->execute();

        sendResponse(true, 'Shop owner deleted successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to delete shop owner: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Get registration details by email
 */
function handleRegistrationDetails($db) {
    if (!isset($_GET['email'])) {
        sendResponse(false, 'Email is required', null, 400);
    }

    $email = $_GET['email'];

    try {
        $query = "SELECT center_name, address, owner_name, contact, email, center_code_petrol, center_code_diesel, center_license_document, status, created_at 
                  FROM shop_owner_registrations WHERE email = :email LIMIT 1";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $registration = $stmt->fetch();

        if ($registration) {
            sendResponse(true, 'Registration details retrieved successfully', $registration);
        } else {
            sendResponse(false, 'Registration details not found', null, 404);
        }
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to retrieve registration details: ' . $e->getMessage(), null, 500);
    }
}
?>
