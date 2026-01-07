<?php
/**
 * CORS Test Endpoint
 * GET /api/test-cors.php
 * 
 * Use this to verify CORS is working correctly
 */

require_once __DIR__ . '/config/database.php';

setCORSHeaders();

$response = [
    'success' => true,
    'message' => 'CORS is working correctly!',
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'php_version' => PHP_VERSION,
        'request_method' => $_SERVER['REQUEST_METHOD'],
        'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'same-origin',
        'allowed_origins' => ALLOWED_ORIGINS
    ],
    'database' => [
        'connected' => false,
        'tables' => []
    ]
];

// Test database connection
try {
    $pdo = getDB();
    $response['database']['connected'] = true;
    
    // Check if tables exist
    $tables = ['users', 'profiles', 'currencies', 'comments', 'comment_likes', 'comment_dislikes', 'user_roles'];
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        $response['database']['tables'][$table] = $stmt->rowCount() > 0;
    }
} catch (Exception $e) {
    $response['database']['error'] = 'Connection failed';
}

jsonResponse($response);
?>
