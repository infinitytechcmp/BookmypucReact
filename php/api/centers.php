<?php
/**
 * Centers API
 * Handles CRUD operations for PUC centers
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
 * Get centers with filters
 */
function handleGet($db) {
    try {
        $conditions = ['c.status = :status'];
        $params = [':status' => 'active'];

        // Filter by owner
        if (isset($_GET['owner_id'])) {
            $conditions[] = 'c.owner_id = :owner_id';
            $params[':owner_id'] = $_GET['owner_id'];
        }

        // Filter by state
        if (isset($_GET['state']) && !empty($_GET['state'])) {
            $conditions[] = 'c.state = :state';
            $params[':state'] = $_GET['state'];
        }

        // Filter by city
        if (isset($_GET['city']) && !empty($_GET['city'])) {
            $conditions[] = 'c.city = :city';
            $params[':city'] = $_GET['city'];
        }

        // Filter by taluka
        if (isset($_GET['taluka']) && !empty($_GET['taluka'])) {
            $conditions[] = 'c.taluka = :taluka';
            $params[':taluka'] = $_GET['taluka'];
        }

        // Filter by pincode
        if (isset($_GET['pincode']) && !empty($_GET['pincode'])) {
            $conditions[] = 'c.pincode = :pincode';
            $params[':pincode'] = $_GET['pincode'];
        }

        // Get single center by ID
        if (isset($_GET['id'])) {
            $conditions[] = 'c.id = :id';
            $params[':id'] = $_GET['id'];
        }

        // Only show centers from active shop owners
        $conditions[] = 'so.status = :shop_status';
        $params[':shop_status'] = 'active';

        $whereClause = implode(' AND ', $conditions);

        $query = "SELECT c.*, so.name as owner_name, so.phone as owner_phone 
                 FROM centers c 
                 JOIN shop_owners so ON c.owner_id = so.id 
                 WHERE $whereClause 
                 ORDER BY c.created_at DESC";

        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();
        $centers = $stmt->fetchAll();

        // Format pricing as object
        foreach ($centers as &$center) {
            $center['pricing'] = [
                '2W_Petrol' => (float)$center['pricing_2w_petrol'],
                '3W_Petrol' => (float)$center['pricing_3w_petrol'],
                '3W_Diesel' => (float)$center['pricing_3w_diesel'],
                '4W_Petrol' => (float)$center['pricing_4w_petrol'],
                '4W_Diesel' => (float)$center['pricing_4w_diesel']
            ];
            
            // Remove individual pricing fields
            unset($center['pricing_2w_petrol']);
            unset($center['pricing_3w_petrol']);
            unset($center['pricing_3w_diesel']);
            unset($center['pricing_4w_petrol']);
            unset($center['pricing_4w_diesel']);
        }

        sendResponse(true, 'Centers retrieved successfully', $centers);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to retrieve centers: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Create new center
 */
function handleCreate($db, $data) {
    $required = ['owner_id', 'name', 'address', 'city', 'state', 'taluka', 'pincode', 'working_hours', 'contact'];
    $missing = validateRequired($data, $required);
    
    if (!empty($missing)) {
        sendResponse(false, 'Missing required fields: ' . implode(', ', $missing), null, 400);
    }

    try {
        // Enforce limit of one center per shop owner
        $checkCenterQuery = "SELECT id FROM centers WHERE owner_id = :owner_id";
        $checkCenterStmt = $db->prepare($checkCenterQuery);
        $checkCenterStmt->bindParam(':owner_id', $data['owner_id']);
        $checkCenterStmt->execute();
        if ($checkCenterStmt->fetch()) {
            sendResponse(false, 'You can only add one center per account.', null, 400);
        }

        $query = "INSERT INTO centers (owner_id, name, address, city, state, taluka, pincode, working_hours, contact,
                 center_code_petrol, center_code_diesel, license_document,
                 pricing_2w_petrol, pricing_3w_petrol, pricing_3w_diesel, pricing_4w_petrol, pricing_4w_diesel, status)
                 VALUES (:owner_id, :name, :address, :city, :state, :taluka, :pincode, :working_hours, :contact,
                 :center_code_petrol, :center_code_diesel, :license_document,
                 :pricing_2w_petrol, :pricing_3w_petrol, :pricing_3w_diesel, :pricing_4w_petrol, :pricing_4w_diesel, 'active')";

        $stmt = $db->prepare($query);
        
        $center_code_petrol = isset($data['center_code_petrol']) ? $data['center_code_petrol'] : null;
        $center_code_diesel = isset($data['center_code_diesel']) ? $data['center_code_diesel'] : null;
        $license_document = isset($data['license_document']) ? $data['license_document'] : null;

        $stmt->bindParam(':owner_id', $data['owner_id']);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':address', $data['address']);
        $stmt->bindParam(':city', $data['city']);
        $stmt->bindParam(':state', $data['state']);
        $stmt->bindParam(':taluka', $data['taluka']);
        $stmt->bindParam(':pincode', $data['pincode']);
        $stmt->bindParam(':working_hours', $data['working_hours']);
        $stmt->bindParam(':contact', $data['contact']);
        $stmt->bindParam(':center_code_petrol', $center_code_petrol);
        $stmt->bindParam(':center_code_diesel', $center_code_diesel);
        $stmt->bindParam(':license_document', $license_document);
        
        // Pricing with defaults
        $pricing_2w_petrol = isset($data['pricing']['2W_Petrol']) ? $data['pricing']['2W_Petrol'] : 50;
        $pricing_3w_petrol = isset($data['pricing']['3W_Petrol']) ? $data['pricing']['3W_Petrol'] : 100;
        $pricing_3w_diesel = isset($data['pricing']['3W_Diesel']) ? $data['pricing']['3W_Diesel'] : 150;
        $pricing_4w_petrol = isset($data['pricing']['4W_Petrol']) ? $data['pricing']['4W_Petrol'] : 125;
        $pricing_4w_diesel = isset($data['pricing']['4W_Diesel']) ? $data['pricing']['4W_Diesel'] : 150;
        
        $stmt->bindParam(':pricing_2w_petrol', $pricing_2w_petrol);
        $stmt->bindParam(':pricing_3w_petrol', $pricing_3w_petrol);
        $stmt->bindParam(':pricing_3w_diesel', $pricing_3w_diesel);
        $stmt->bindParam(':pricing_4w_petrol', $pricing_4w_petrol);
        $stmt->bindParam(':pricing_4w_diesel', $pricing_4w_diesel);
        
        $stmt->execute();
        $centerId = $db->lastInsertId();

        // Notify admin about new center
        $ownerQuery = "SELECT name FROM shop_owners WHERE id = :owner_id";
        $ownerStmt = $db->prepare($ownerQuery);
        $ownerStmt->bindParam(':owner_id', $data['owner_id']);
        $ownerStmt->execute();
        $owner = $ownerStmt->fetch();

        if ($owner) {
            $notifQuery = "INSERT INTO notifications (user_id, user_role, type, title, message, is_read, center_id) 
                          VALUES (1, 'admin', 'center_added', 'New Center Added', :message, FALSE, :center_id)";
            $notifStmt = $db->prepare($notifQuery);
            $notifMessage = $owner['name'] . ' added a new center: ' . $data['name'];
            $notifStmt->bindParam(':message', $notifMessage);
            $notifStmt->bindParam(':center_id', $centerId);
            $notifStmt->execute();
        }

        sendResponse(true, 'Center created successfully', ['id' => $centerId]);
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to create center: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Update center
 */
function handleUpdate($db, $data) {
    if (!isset($data['id'])) {
        sendResponse(false, 'Center ID is required', null, 400);
    }

    try {
        $updates = [];
        $params = [':id' => $data['id']];

        $allowedFields = ['name', 'address', 'city', 'state', 'taluka', 'pincode', 'working_hours', 'contact', 'status', 'center_code_petrol', 'center_code_diesel', 'license_document'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        // Handle pricing updates
        if (isset($data['pricing'])) {
            $pricingFields = [
                '2W_Petrol' => 'pricing_2w_petrol',
                '3W_Petrol' => 'pricing_3w_petrol',
                '3W_Diesel' => 'pricing_3w_diesel',
                '4W_Petrol' => 'pricing_4w_petrol',
                '4W_Diesel' => 'pricing_4w_diesel'
            ];
            
            foreach ($pricingFields as $key => $dbField) {
                if (isset($data['pricing'][$key])) {
                    $updates[] = "$dbField = :$dbField";
                    $params[":$dbField"] = $data['pricing'][$key];
                }
            }
        }

        if (empty($updates)) {
            sendResponse(false, 'No fields to update', null, 400);
        }

        $query = "UPDATE centers SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $db->prepare($query);
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        $stmt->execute();

        sendResponse(true, 'Center updated successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to update center: ' . $e->getMessage(), null, 500);
    }
}

/**
 * Delete center
 */
function handleDelete($db) {
    if (!isset($_GET['id'])) {
        sendResponse(false, 'Center ID is required', null, 400);
    }

    try {
        $query = "DELETE FROM centers WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':id', $_GET['id']);
        $stmt->execute();

        sendResponse(true, 'Center deleted successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Failed to delete center: ' . $e->getMessage(), null, 500);
    }
}
?>
