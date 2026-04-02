<?php
/**
 * Contact API
 * Handles contact form submissions and sends emails
 */

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Get POST data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate required fields
    $required = ['name', 'email', 'mobile', 'subject', 'message'];
    if (!validateRequired($data, $required)) {
        sendResponse(false, 'All fields are required');
    }
    
    // Validate email format
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        sendResponse(false, 'Invalid email format');
    }
    
    // Validate mobile (10 digits)
    if (!preg_match('/^[0-9]{10}$/', $data['mobile'])) {
        sendResponse(false, 'Invalid mobile number. Must be 10 digits');
    }
    
    // Sanitize inputs
    $name = htmlspecialchars(strip_tags($data['name']));
    $email = htmlspecialchars(strip_tags($data['email']));
    $mobile = htmlspecialchars(strip_tags($data['mobile']));
    $subject = htmlspecialchars(strip_tags($data['subject']));
    $message = htmlspecialchars(strip_tags($data['message']));
    
    try {
        // Insert into database
        $query = "INSERT INTO contact_submissions 
                  (name, email, mobile, subject, message, created_at) 
                  VALUES (:name, :email, :mobile, :subject, :message, NOW())";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':mobile', $mobile);
        $stmt->bindParam(':subject', $subject);
        $stmt->bindParam(':message', $message);
        
        if ($stmt->execute()) {
            // Send email
            $emailSent = sendContactEmail($name, $email, $mobile, $subject, $message);
            
            if ($emailSent) {
                sendResponse(true, 'Message sent successfully! We will get back to you soon.');
            } else {
                sendResponse(true, 'Message saved but email notification failed. We will still get back to you.');
            }
        } else {
            sendResponse(false, 'Failed to save message');
        }
    } catch (Exception $e) {
        sendResponse(false, 'Error: ' . $e->getMessage());
    }
} else {
    sendResponse(false, 'Invalid request method', 405);
}

/**
 * Send contact email to admin
 */
function sendContactEmail($name, $email, $mobile, $subject, $message) {
    $to = 'mishra.arun1586@gmail.com';
    $emailSubject = 'BookMyPUC Contact Form: ' . $subject;
    
    // Email headers
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: BookMyPUC <noreply@bookmypuc.com>" . "\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    
    // Email body
    $emailBody = "
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 20px; }
            .label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
            .value { background: white; padding: 10px; border-radius: 4px; border-left: 3px solid #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2>📧 New Contact Form Submission</h2>
                <p>BookMyPUC Platform</p>
            </div>
            <div class='content'>
                <div class='field'>
                    <div class='label'>👤 Name:</div>
                    <div class='value'>" . htmlspecialchars($name) . "</div>
                </div>
                <div class='field'>
                    <div class='label'>📧 Email:</div>
                    <div class='value'>" . htmlspecialchars($email) . "</div>
                </div>
                <div class='field'>
                    <div class='label'>📱 Mobile:</div>
                    <div class='value'>" . htmlspecialchars($mobile) . "</div>
                </div>
                <div class='field'>
                    <div class='label'>📋 Subject:</div>
                    <div class='value'>" . htmlspecialchars($subject) . "</div>
                </div>
                <div class='field'>
                    <div class='label'>💬 Message:</div>
                    <div class='value'>" . nl2br(htmlspecialchars($message)) . "</div>
                </div>
                <div class='footer'>
                    <p>Received on: " . date('F j, Y, g:i a') . "</p>
                    <p>This is an automated message from BookMyPUC contact form.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Send email
    return mail($to, $emailSubject, $emailBody, $headers);
}
?>
