<?php
/**
 * Health Check Endpoint
 * GET /api/health.php
 * 
 * Simple endpoint to check if API is running
 */

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");

echo json_encode([
    'status' => 'ok',
    'timestamp' => date('c'),
    'version' => '1.0.0'
]);
?>
