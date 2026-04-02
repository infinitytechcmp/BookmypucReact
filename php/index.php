<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BookMyPUC API - Test Page</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            color: #667eea;
            margin-bottom: 10px;
        }
        .header p {
            color: #666;
        }
        .status {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            margin-bottom: 20px;
        }
        .status-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid #eee;
        }
        .status-item:last-child {
            border-bottom: none;
        }
        .status-label {
            font-weight: 600;
            color: #333;
        }
        .status-value {
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: 600;
        }
        .status-success {
            background: #10b981;
            color: white;
        }
        .status-error {
            background: #ef4444;
            color: white;
        }
        .endpoints {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .endpoints h2 {
            color: #667eea;
            margin-bottom: 20px;
        }
        .endpoint-group {
            margin-bottom: 30px;
        }
        .endpoint-group h3 {
            color: #764ba2;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
        }
        .endpoint {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 10px;
            border-left: 4px solid #667eea;
        }
        .endpoint-method {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 3px;
            font-weight: 600;
            font-size: 12px;
            margin-right: 10px;
        }
        .method-get { background: #10b981; color: white; }
        .method-post { background: #3b82f6; color: white; }
        .method-put { background: #f59e0b; color: white; }
        .method-delete { background: #ef4444; color: white; }
        .endpoint-url {
            color: #333;
            font-family: 'Courier New', monospace;
        }
        .test-button {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 600;
            margin-top: 10px;
        }
        .test-button:hover {
            background: #764ba2;
        }
        #testResult {
            margin-top: 20px;
            padding: 15px;
            border-radius: 5px;
            background: #f8f9fa;
            display: none;
        }
        .credentials {
            background: #fff3cd;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            border-left: 4px solid #ffc107;
        }
        .credentials h3 {
            color: #856404;
            margin-bottom: 10px;
        }
        .credentials code {
            background: #fff;
            padding: 2px 6px;
            border-radius: 3px;
            color: #d63384;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚗 BookMyPUC API</h1>
            <p>PHP + MySQL Backend API - Test & Documentation</p>
        </div>

        <div class="status">
            <h2 style="margin-bottom: 20px; color: #667eea;">System Status</h2>
            <div class="status-item">
                <span class="status-label">PHP Version</span>
                <span class="status-value status-success"><?php echo phpversion(); ?></span>
            </div>
            <div class="status-item">
                <span class="status-label">Database Connection</span>
                <span class="status-value" id="dbStatus">Testing...</span>
            </div>
            <div class="status-item">
                <span class="status-label">API Base URL</span>
                <span class="status-value status-success"><?php echo 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/api/'; ?></span>
            </div>
        </div>

        <?php
        // Test database connection
        require_once 'config/database.php';
        $database = new Database();
        $db = $database->getConnection();
        
        if ($db) {
            echo "<script>document.getElementById('dbStatus').className = 'status-value status-success'; document.getElementById('dbStatus').textContent = 'Connected';</script>";
            
            // Get some stats
            try {
                $stmt = $db->query("SELECT 
                    (SELECT COUNT(*) FROM users) as users,
                    (SELECT COUNT(*) FROM shop_owners) as shop_owners,
                    (SELECT COUNT(*) FROM centers) as centers,
                    (SELECT COUNT(*) FROM bookings) as bookings
                ");
                $stats = $stmt->fetch();
                
                echo "
                <div class='status'>
                    <h2 style='margin-bottom: 20px; color: #667eea;'>Database Statistics</h2>
                    <div class='status-item'>
                        <span class='status-label'>Total Users</span>
                        <span class='status-value status-success'>{$stats['users']}</span>
                    </div>
                    <div class='status-item'>
                        <span class='status-label'>Total Shop Owners</span>
                        <span class='status-value status-success'>{$stats['shop_owners']}</span>
                    </div>
                    <div class='status-item'>
                        <span class='status-label'>Total Centers</span>
                        <span class='status-value status-success'>{$stats['centers']}</span>
                    </div>
                    <div class='status-item'>
                        <span class='status-label'>Total Bookings</span>
                        <span class='status-value status-success'>{$stats['bookings']}</span>
                    </div>
                </div>
                ";
            } catch (Exception $e) {
                echo "<script>console.error('Stats error: " . $e->getMessage() . "');</script>";
            }
        } else {
            echo "<script>document.getElementById('dbStatus').className = 'status-value status-error'; document.getElementById('dbStatus').textContent = 'Failed';</script>";
        }
        ?>

        <div class="credentials">
            <h3>🔑 Default Credentials</h3>
            <p><strong>Admin:</strong> <code>admin@bookmypuc.com</code> / <code>admin123</code></p>
            <p><strong>User:</strong> <code>arun@gmail.com</code> / <code>user123</code></p>
            <p><strong>Shop Owner:</strong> <code>citypuc@gmail.com</code> / <code>shop123</code></p>
        </div>

        <div class="endpoints">
            <h2>📡 API Endpoints</h2>
            
            <div class="endpoint-group">
                <h3>Authentication</h3>
                <div class="endpoint">
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/auth.php?action=login</span>
                    <button class="test-button" onclick="testLogin()">Test Login</button>
                </div>
                <div class="endpoint">
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/auth.php?action=register</span>
                </div>
                <div class="endpoint">
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/auth.php?action=admin-login</span>
                </div>
            </div>

            <div class="endpoint-group">
                <h3>Centers</h3>
                <div class="endpoint">
                    <span class="endpoint-method method-get">GET</span>
                    <span class="endpoint-url">/api/centers.php</span>
                    <button class="test-button" onclick="testCenters()">Test Get Centers</button>
                </div>
                <div class="endpoint">
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/centers.php</span>
                </div>
                <div class="endpoint">
                    <span class="endpoint-method method-put">PUT</span>
                    <span class="endpoint-url">/api/centers.php</span>
                </div>
                <div class="endpoint">
                    <span class="endpoint-method method-delete">DELETE</span>
                    <span class="endpoint-url">/api/centers.php?id={id}</span>
                </div>
            </div>

            <div class="endpoint-group">
                <h3>Bookings</h3>
                <div class="endpoint">
                    <span class="endpoint-method method-get">GET</span>
                    <span class="endpoint-url">/api/bookings.php</span>
                    <button class="test-button" onclick="testBookings()">Test Get Bookings</button>
                </div>
                <div class="endpoint">
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/bookings.php</span>
                </div>
                <div class="endpoint">
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/bookings.php?action=confirm</span>
                </div>
                <div class="endpoint">
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/bookings.php?action=reject</span>
                </div>
                <div class="endpoint">
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/bookings.php?action=mark-done</span>
                </div>
            </div>

            <div class="endpoint-group">
                <h3>Notifications</h3>
                <div class="endpoint">
                    <span class="endpoint-method method-get">GET</span>
                    <span class="endpoint-url">/api/notifications.php?user_id={id}&user_role={role}</span>
                </div>
                <div class="endpoint">
                    <span class="endpoint-method method-get">GET</span>
                    <span class="endpoint-url">/api/notifications.php?action=unread-count&user_id={id}&user_role={role}</span>
                </div>
                <div class="endpoint">
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/notifications.php?action=mark-read</span>
                </div>
            </div>

            <div class="endpoint-group">
                <h3>Admin</h3>
                <div class="endpoint">
                    <span class="endpoint-method method-get">GET</span>
                    <span class="endpoint-url">/api/admin.php?action=dashboard-stats</span>
                    <button class="test-button" onclick="testAdminStats()">Test Dashboard Stats</button>
                </div>
                <div class="endpoint">
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/admin.php?action=activate-user</span>
                </div>
                <div class="endpoint">
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/admin.php?action=deactivate-shop-owner</span>
                </div>
            </div>

            <div id="testResult"></div>
        </div>
    </div>

    <script>
        const baseUrl = '<?php echo 'http://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/api/'; ?>';

        function showResult(title, data) {
            const resultDiv = document.getElementById('testResult');
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <h3 style="color: #667eea; margin-bottom: 10px;">${title}</h3>
                <pre style="background: white; padding: 15px; border-radius: 5px; overflow-x: auto;">${JSON.stringify(data, null, 2)}</pre>
            `;
        }

        async function testLogin() {
            try {
                const response = await fetch(baseUrl + 'auth.php?action=login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'arun@gmail.com',
                        password: 'user123',
                        role: 'user'
                    })
                });
                const data = await response.json();
                showResult('Login Test Result', data);
            } catch (error) {
                showResult('Login Test Error', { error: error.message });
            }
        }

        async function testCenters() {
            try {
                const response = await fetch(baseUrl + 'centers.php');
                const data = await response.json();
                showResult('Centers Test Result', data);
            } catch (error) {
                showResult('Centers Test Error', { error: error.message });
            }
        }

        async function testBookings() {
            try {
                const response = await fetch(baseUrl + 'bookings.php');
                const data = await response.json();
                showResult('Bookings Test Result', data);
            } catch (error) {
                showResult('Bookings Test Error', { error: error.message });
            }
        }

        async function testAdminStats() {
            try {
                const response = await fetch(baseUrl + 'admin.php?action=dashboard-stats');
                const data = await response.json();
                showResult('Admin Dashboard Stats', data);
            } catch (error) {
                showResult('Admin Stats Error', { error: error.message });
            }
        }
    </script>
</body>
</html>
