<?php
/**
 * OTP API
 * Handles OTP generation, sending, and verification
 * 
 * Endpoints:
 * - POST /api/otp.php?action=send - Send OTP to email
 * - POST /api/otp.php?action=verify - Verify OTP
 * - POST /api/otp.php?action=resend - Resend OTP
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/helpers.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];
$data = getRequestData();

// Get action from query parameter
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'send') {
    handleSendOTP($db, $data);
} elseif ($action === 'verify') {
    handleVerifyOTP($db, $data);
} elseif ($action === 'resend') {
    handleResendOTP($db, $data);
} else {
    sendResponse(false, 'Invalid action', null, 400);
}

/**
 * Send OTP to email
 */
function handleSendOTP($db, $data) {
    $required = ['email'];
    $missing = validateRequired($data, $required);
    
    if (!empty($missing)) {
        sendResponse(false, 'Missing required fields: ' . implode(', ', $missing), null, 400);
    }

    // Validate email format
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        sendResponse(false, 'Invalid email format', null, 400);
    }

    try {
        $email = $data['email'];
        $purpose = isset($data['purpose']) ? $data['purpose'] : 'booking';
        
        // Check if there's a recent OTP (within last 2 minutes) to prevent spam
        $checkQuery = "SELECT id FROM otps 
                      WHERE email = :email 
                      AND is_verified = FALSE 
                      AND created_at > DATE_SUB(NOW(), INTERVAL 2 MINUTE)";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':email', $email);
        $checkStmt->execute();
        
        if ($checkStmt->fetch()) {
            sendResponse(false, 'Please wait 2 minutes before requesting a new OTP', null, 429);
        }

        // Generate 6-digit OTP
        $otp = generateOTP();
        
        // Set expiration (10 minutes from now)
        $expiresAt = date('Y-m-d H:i:s', strtotime('+10 minutes'));
        
        // Get client info
        $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

        // Insert OTP into database
        $query = "INSERT INTO otps (email, otp, purpose, expires_at, ip_address, user_agent)
                 VALUES (:email, :otp, :purpose, :expires_at, :ip_address, :user_agent)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':otp', $otp);
        $stmt->bindParam(':purpose', $purpose);
        $stmt->bindParam(':expires_at', $expiresAt);
        $stmt->bindParam(':ip_address', $ipAddress);
        $stmt->bindParam(':user_agent', $userAgent);
        $stmt->execute();
        
        $otpId = $db->lastInsertId();

        // Send OTP via email
        $emailSent = sendOTPEmail($email, $otp, $purpose);

        if ($emailSent) {
            sendResponse(true, 'OTP sent successfully to your email', [
                'otp_id' => $otpId,
                'expires_in' => 600 // 10 minutes in seconds
            ]);
        } else {
            // Delete the OTP if email failed
            $deleteQuery = "DELETE FROM otps WHERE id = :id";
            $deleteStmt = $db->prepare($deleteQuery);
            $deleteStmt->bindParam(':id', $otpId);
            $deleteStmt->execute();
            
            sendResponse(false, 'Failed to send OTP email. Please try again.', null, 500);
        }
    } catch (Exception $e) {
        error_log("Send OTP Error: " . $e->getMessage());
        sendResponse(false, 'Failed to send OTP', null, 500);
    }
}

/**
 * Verify OTP
 */
function handleVerifyOTP($db, $data) {
    $required = ['email', 'otp'];
    $missing = validateRequired($data, $required);
    
    if (!empty($missing)) {
        sendResponse(false, 'Missing required fields: ' . implode(', ', $missing), null, 400);
    }

    try {
        $email = $data['email'];
        $otp = $data['otp'];
        $purpose = isset($data['purpose']) ? $data['purpose'] : 'booking';

        // Find valid OTP
        $query = "SELECT id, expires_at, is_verified 
                 FROM otps 
                 WHERE email = :email 
                 AND otp = :otp 
                 AND purpose = :purpose 
                 ORDER BY created_at DESC 
                 LIMIT 1";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':otp', $otp);
        $stmt->bindParam(':purpose', $purpose);
        $stmt->execute();
        
        $otpRecord = $stmt->fetch();

        if (!$otpRecord) {
            sendResponse(false, 'Invalid OTP. Please check and try again.', null, 400);
        }

        // Check if already verified
        if ($otpRecord['is_verified']) {
            sendResponse(false, 'OTP has already been used', null, 400);
        }

        // Check if expired
        if (strtotime($otpRecord['expires_at']) < time()) {
            sendResponse(false, 'OTP has expired. Please request a new one.', null, 400);
        }

        // Mark OTP as verified
        $updateQuery = "UPDATE otps 
                       SET is_verified = TRUE, verified_at = NOW() 
                       WHERE id = :id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':id', $otpRecord['id']);
        $updateStmt->execute();

        sendResponse(true, 'OTP verified successfully', [
            'verified' => true,
            'email' => $email
        ]);
    } catch (Exception $e) {
        error_log("Verify OTP Error: " . $e->getMessage());
        sendResponse(false, 'Failed to verify OTP', null, 500);
    }
}

/**
 * Resend OTP
 */
function handleResendOTP($db, $data) {
    // Resend is same as send, just invalidate old OTPs first
    $required = ['email'];
    $missing = validateRequired($data, $required);
    
    if (!empty($missing)) {
        sendResponse(false, 'Missing required fields: ' . implode(', ', $missing), null, 400);
    }

    try {
        $email = $data['email'];
        $purpose = isset($data['purpose']) ? $data['purpose'] : 'booking';

        // Invalidate all previous unverified OTPs for this email
        $invalidateQuery = "UPDATE otps 
                           SET expires_at = NOW() 
                           WHERE email = :email 
                           AND purpose = :purpose 
                           AND is_verified = FALSE";
        $invalidateStmt = $db->prepare($invalidateQuery);
        $invalidateStmt->bindParam(':email', $email);
        $invalidateStmt->bindParam(':purpose', $purpose);
        $invalidateStmt->execute();

        // Now send new OTP
        handleSendOTP($db, $data);
    } catch (Exception $e) {
        error_log("Resend OTP Error: " . $e->getMessage());
        sendResponse(false, 'Failed to resend OTP', null, 500);
    }
}

/**
 * Generate 6-digit OTP
 */
function generateOTP() {
    return str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
}

/**
 * Send OTP via email
 */
function sendOTPEmail($email, $otp, $purpose = 'booking') {
    $subject = 'BookMyPUC - Your OTP Code';
    
    $purposeText = [
        'booking' => 'complete your booking',
        'registration' => 'complete your registration',
        'password_reset' => 'reset your password'
    ];
    
    $purposeMessage = isset($purposeText[$purpose]) ? $purposeText[$purpose] : 'verify your email';
    
    $message = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🚗 BookMyPUC</h1>
                <p>Your OTP Verification Code</p>
            </div>
            <div class='content'>
                <p>Hello,</p>
                <p>You requested an OTP to <strong>{$purposeMessage}</strong>.</p>
                
                <div class='otp-box'>
                    <p style='margin: 0; color: #666;'>Your OTP Code:</p>
                    <div class='otp-code'>{$otp}</div>
                    <p style='margin: 10px 0 0 0; color: #666; font-size: 14px;'>Valid for 10 minutes</p>
                </div>
                
                <div class='warning'>
                    <strong>⚠️ Security Notice:</strong><br>
                    • Do not share this OTP with anyone<br>
                    • BookMyPUC will never ask for your OTP via phone or email<br>
                    • This OTP expires in 10 minutes
                </div>
                
                <p>If you didn't request this OTP, please ignore this email or contact our support team.</p>
                
                <p>Best regards,<br><strong>BookMyPUC Team</strong></p>
            </div>
            <div class='footer'>
                <p>© 2026 BookMyPUC. All rights reserved.</p>
                <p>This is an automated email. Please do not reply.</p>
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
    
    // Log email attempt
    error_log("OTP Email sent to {$email}: " . ($result ? 'Success' : 'Failed'));
    
    return $result;
}
