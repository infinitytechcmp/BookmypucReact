<?php

// Handle CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-API-KEY, Accept");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

// Load configurations and DB
require_once 'config.php';
require_once 'Database.php';

// Authentication validation (Optional but recommended)
$headers = getallheaders();
$apiKey = $headers['X-API-KEY'] ?? $headers['x-api-key'] ?? null;
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

// Uncomment to enforce auth
/*
if ($apiKey !== API_KEY) {
    http_response_code(401);
    echo json_encode(['error' => true, 'message' => 'Unauthorized: Invalid API Key']);
    exit;
}
*/

// Routing Logic (Powered by .htaccess)
$routePath = $_GET['route'] ?? '';

// Support both /adminapi/menus and /adminapi/api/v1/menus
$routePath = trim($routePath, '/');
if (strpos($routePath, 'api/v1/') === 0) {
    $routePath = substr($routePath, 7); // Length of 'api/v1/'
}

$segments = explode('/', trim($routePath, '/'));
$resource = $segments[0] ?? '';
$identifier = $segments[1] ?? null;
$subResource = $segments[2] ?? null;

// Dispatch to controllers
try {
    switch ($resource) {
        case '':
            // Test DB connection
            $dbStatus = 'Connected';
            try {
                $db = Database::getInstance()->getConnection();
                $db->query("SELECT 1");
            } catch (Exception $e) {
                $dbStatus = 'Failed: ' . $e->getMessage();
            }

            echo json_encode([
                'error' => false,
                'message' => 'Welcome to Core PHP API',
                'database_status' => $dbStatus,
                'endpoints' => [
                    [
                        'module' => 'Menus',
                        'url' => '/api/v1/menus',
                        'method' => 'GET',
                        'description' => 'Get all menus',
                        'example_response' => ['error' => false, 'data' => [['id' => 1, 'name' => 'Main Menu', 'slug' => 'main-menu']], 'message' => 'Success']
                    ],
                    [
                        'module' => 'Menus',
                        'url' => '/api/v1/menus/{slug}',
                        'method' => 'GET',
                        'description' => 'Get specific menu by slug with nodes',
                        'example_response' => ['error' => false, 'data' => ['id' => 1, 'name' => 'Main Menu', 'menu_nodes' => []], 'message' => 'Success']
                    ],
                    [
                        'module' => 'Simple Sliders',
                        'url' => '/api/v1/simple-sliders',
                        'method' => 'GET',
                        'description' => 'Get all sliders',
                        'example_response' => ['error' => false, 'data' => [['id' => 1, 'name' => 'Home Slider', 'items' => []]], 'message' => 'Success']
                    ],
                    [
                        'module' => 'Simple Sliders',
                        'url' => '/api/v1/simple-sliders/{key}',
                        'method' => 'GET',
                        'description' => 'Get specific slider by key',
                        'example_response' => ['error' => false, 'data' => ['id' => 1, 'name' => 'Home Slider', 'items' => []], 'message' => 'Success']
                    ],
                    [
                        'module' => 'Pages',
                        'url' => '/api/v1/pages',
                        'method' => 'GET',
                        'description' => 'Get all pages',
                        'example_response' => ['error' => false, 'data' => [['id' => 1, 'name' => 'Home', 'slug' => 'home']], 'message' => 'Success']
                    ],
                    [
                        'module' => 'Pages',
                        'url' => '/api/v1/pages/{slug}',
                        'method' => 'GET',
                        'description' => 'Get specific page by slug',
                        'example_response' => ['error' => false, 'data' => ['id' => 1, 'name' => 'Home', 'content' => '...'], 'message' => 'Success']
                    ],
                    [
                        'module' => 'Blog Posts',
                        'url' => '/api/v1/posts',
                        'method' => 'GET',
                        'description' => 'Get all posts',
                        'example_response' => ['error' => false, 'data' => [['id' => 1, 'name' => 'Hello World', 'slug' => 'hello-world']], 'message' => 'Success']
                    ],
                    [
                        'module' => 'Blog Posts',
                        'url' => '/api/v1/posts/{slug}',
                        'method' => 'GET',
                        'description' => 'Get specific post by slug',
                        'example_response' => ['error' => false, 'data' => ['id' => 1, 'name' => 'Hello World', 'content' => '...'], 'message' => 'Success']
                    ],
                    [
                        'module' => 'Teams',
                        'url' => '/api/v1/teams',
                        'method' => 'GET',
                        'description' => 'Get all team members',
                        'example_response' => ['error' => false, 'data' => [['id' => 1, 'name' => 'John Doe', 'title' => 'CEO']], 'message' => 'Success']
                    ],
                    [
                        'module' => 'Testimonials',
                        'url' => '/api/v1/testimonials',
                        'method' => 'GET',
                        'description' => 'Get all testimonials',
                        'example_response' => ['error' => false, 'data' => [['id' => 1, 'name' => 'Jane Doe', 'content' => 'Great!']], 'message' => 'Success']
                    ],
                    [
                        'module' => 'FAQs',
                        'url' => '/api/v1/faqs',
                        'method' => 'GET',
                        'description' => 'Get all FAQs',
                        'example_response' => ['error' => false, 'data' => [['id' => 1, 'question' => 'How?', 'answer' => 'Like this']], 'message' => 'Success']
                    ],
                    [
                        'module' => 'FAQ Categories',
                        'url' => '/api/v1/faq-categories',
                        'method' => 'GET',
                        'description' => 'Get FAQ categories',
                        'example_response' => ['error' => false, 'data' => [['id' => 1, 'name' => 'General']], 'message' => 'Success']
                    ],
                    [
                        'module' => 'Theme Options',
                        'url' => '/api/v1/theme-options',
                        'method' => 'GET',
                        'description' => 'Get theme global settings',
                        'example_response' => ['error' => false, 'data' => ['site_title' => 'BookMyPUC', 'logo' => 'logo.png'], 'message' => 'Success']
                    ]
                ]
            ]);
            break;

        case 'menus':
            require_once 'Controllers/MenuController.php';
            $controller = new MenuController();
            if ($identifier) {
                $controller->getBySlug($identifier);
            } else {
                $controller->index();
            }
            break;
            
        case 'simple-sliders':
            require_once 'Controllers/SliderController.php';
            $controller = new SliderController();
            if ($identifier) {
                $controller->getByKey($identifier);
            } else {
                $controller->index();
            }
            break;

        case 'pages':
            require_once 'Controllers/PageController.php';
            $controller = new PageController();
            if ($identifier) {
                $controller->getBySlug($identifier);
            } else {
                $controller->index();
            }
            break;

        case 'posts':
            require_once 'Controllers/BlogController.php';
            $controller = new BlogController();
            if ($identifier) {
                $controller->getPostBySlug($identifier);
            } else {
                $controller->getPosts();
            }
            break;

        case 'categories':
            require_once 'Controllers/BlogController.php';
            $controller = new BlogController();
            if ($identifier) {
                $controller->getCategoryBySlug($identifier);
            } else {
                $controller->getCategories();
            }
            break;

        case 'tags':
            require_once 'Controllers/BlogController.php';
            $controller = new BlogController();
            if ($identifier) {
                $controller->getTagBySlug($identifier);
            } else {
                $controller->getTags();
            }
            break;

        case 'teams':
            require_once 'Controllers/TeamController.php';
            $controller = new TeamController();
            if ($identifier) {
                $controller->getById($identifier);
            } else {
                $controller->index();
            }
            break;

        case 'testimonials':
            require_once 'Controllers/TestimonialController.php';
            $controller = new TestimonialController();
            $controller->index();
            break;

        case 'faqs':
            require_once 'Controllers/FaqController.php';
            $controller = new FaqController();
            $controller->getFaqs();
            break;

        case 'faq-categories':
            require_once 'Controllers/FaqController.php';
            $controller = new FaqController();
            $controller->getCategories();
            break;

        case 'theme-options':
            require_once 'Controllers/ThemeOptionController.php';
            $controller = new ThemeOptionController();
            $controller->index();
            break;

        default:
            http_response_code(404);
            echo json_encode(['error' => true, 'message' => 'Endpoint not found']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => true, 'message' => 'Server error: ' . $e->getMessage()]);
}
