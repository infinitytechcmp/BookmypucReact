<?php
/**
 * Vehicles API
 * Handles CRUD operations for user vehicles
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

/**
 * Get vehicles
 */
function handleGet($db) {
    try {
        $conditions = [];
        $params = [];

        // Filter by user
        if (isset($_GET['user_id'])) {
            $conditions[] = 'user_id = :user_id';
            $params[':user_id'] = $_GET['user_id'];
        }

        // Get single vehicle by ID
        if (isset($_GET['id'])) {
            $conditions[] = 'id = :id';
            $params[':id'] = $_GET['id'];
        }

        $whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';

        $query = "SELECT * FROM vehicles $whereClause ORDER BY created_at DESC";

        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        $vehicles = $stmt->fetchAll();

        sendResponse(true, 'Vehicles retrieved successfully', $vehicles);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to retrieve vehicles: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Create new vehicle
 */
function handleCreate($db, $data) {
    $required = ['user_id', 'number', 'type', 'brand', 'model', 'fuel'];
    $missing = validateRequired($data, $required);
    
    if (!empty($missing)) {
        sendResponse(false, 'Missing required fields: ' . implode(', ', $missing), null, 400);
    }

    try {
        $query = "INSERT INTO vehicles (user_id, number, type, brand, model, fuel)
                 VALUES (:user_id, :number, :type, :brand, :model, :fuel)";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':user_id', $data['user_id']);
        $stmt->bindParam(':number', $data['number']);
        $stmt->bindParam(':type', $data['type']);
        $stmt->bindParam(':brand', $data['brand']);
        $stmt->bindParam(':model', $data['model']);
        $stmt->bindParam(':fuel', $data['fuel']);
        
        $stmt->execute();
        $vehicleId = $db->lastInsertId();

        sendResponse(true, 'Vehicle added successfully', ['id' => $vehicleId]);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to add vehicle: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Update vehicle
 */
function handleUpdate($db, $data) {
    if (!isset($data['id'])) {
        sendResponse(false, 'Vehicle ID is required', null, 400);
    }

    try {
        $updates = [];
        $params = [':id' => $data['id']];

        $allowedFields = ['number', 'type', 'brand', 'model', 'fuel'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($updates)) {
            sendResponse(false, 'No fields to update', null, 400);
        }

        $query = "UPDATE vehicles SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();

        sendResponse(true, 'Vehicle updated successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to update vehicle: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Delete vehicle
 */
function handleDelete($db) {
    if (!isset($_GET['id'])) {
        sendResponse(false, 'Vehicle ID is required', null, 400);
    }

    try {
        $query = "DELETE FROM vehicles WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $_GET['id']);
        $stmt->execute();

        sendResponse(true, 'Vehicle deleted successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to delete vehicle: ' . $e->getMessage(), null, 500);
    }
}
?>
