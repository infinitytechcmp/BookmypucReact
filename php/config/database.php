<?php
/**
 * Database Configuration
 * BookMyPUC Application
 */

class Database {
    // Database credentials
    private $host = "localhost";
    private $db_name = "bookmypuc";
    private $username = "root";  // Change this to your MySQL username
    private $password = "";      // Change this to your MySQL password
    private $charset = "utf8mb4";
    
    public $conn;

    /**
     * Get database connection
     */
    public function getConnection() {
        $this->conn = null;

        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch(PDOException $exception) {
            echo json_encode([
                'success' => false,
                'message' => 'Database connection error: ' . $exception->getMessage()
            ]);
            exit();
        }

        return $this->conn;
    }
}

/**
 * Set CORS headers
 */
function setCorsHeaders() {
    // Allow from any origin
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
    }

    // Access-Control headers are received during OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
            header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

        exit(0);
    }

    header('Content-Type: application/json');
}

/**
 * Send JSON response
 */
function sendResponse($success, $message, $data = null, $statusCode = 200) {
    http_response_code($statusCode);
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response);
    exit();
}

/**
 * Get request method
 */
function getRequestMethod() {
    return $_SERVER['REQUEST_METHOD'];
}

/**
 * Get request data
 */
function getRequestData() {
    $data = json_decode(file_get_contents("php://input"), true);
    return $data ? $data : [];
}

/**
 * Validate required fields
 */
function validateRequired($data, $fields) {
    $missing = [];
    foreach ($fields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $missing[] = $field;
        }
    }
    return $missing;
}

/**
 * Hash password
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

/**
 * Verify password
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Generate random time within working hours
 */
function generateRandomTime($workingHours) {
    // Parse working hours (format: "08:00 - 20:00")
    $parts = explode(' - ', $workingHours);
    $startHour = (int)explode(':', $parts[0])[0];
    $endHour = (int)explode(':', $parts[1])[0];
    
    // Generate random hour between start and end
    $randomHour = rand($startHour, $endHour - 1);
    $randomMinute = rand(0, 1) == 0 ? '00' : '30';
    
    return sprintf('%02d:%s', $randomHour, $randomMinute);
}

/**
 * Calculate booking date (current date + 2 days)
 */
function calculateBookingDate() {
    $date = new DateTime();
    $date->modify('+2 days');
    return $date->format('Y-m-d');
}
?>
