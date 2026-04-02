<?php
/**
 * Users API
 * Handles CRUD operations for users
 */

require_once '../config/database.php';

setCorsHeaders();

$database = new Database();
$db = $database->getConnection();

$method = getRequestMethod();
$data = getRequestData();

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
 * Get users
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

        // Get single user by ID
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

        $query = "SELECT id, name, email, phone, role, status, created_at FROM users $whereClause ORDER BY created_at DESC";

        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        $users = $stmt->fetchAll();

        sendResponse(true, 'Users retrieved successfully', $users);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to retrieve users: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Update user
 */
function handleUpdate($db, $data) {
    if (!isset($data['id'])) {
        sendResponse(false, 'User ID is required', null, 400);
    }

    try {
        $updates = [];
        $params = [':id' => $data['id']];

        $allowedFields = ['name', 'email', 'phone', 'status'];
        
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

        $query = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();

        sendResponse(true, 'User updated successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to update user: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Delete user
 */
function handleDelete($db) {
    if (!isset($_GET['id'])) {
        sendResponse(false, 'User ID is required', null, 400);
    }

    try {
        $query = "DELETE FROM users WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $_GET['id']);
        $stmt->execute();

        sendResponse(true, 'User deleted successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to delete user: ' . $e->getMessage(), null, 500);
    }
}
?>
