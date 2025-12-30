<?php
/**
 * Profiles API
 * GET /api/profiles/ - List profiles (admin)
 * GET /api/profiles/?user_id=xxx - Get specific profile
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/jwt.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$pdo = getDB();

$userId = $_GET['user_id'] ?? null;

if ($userId) {
    // Get specific profile
    $stmt = $pdo->prepare("SELECT * FROM profiles WHERE user_id = ?");
    $stmt->execute([$userId]);
    $profile = $stmt->fetch();
    
    if (!$profile) {
        jsonResponse(['error' => 'الملف الشخصي غير موجود'], 404);
    }
    
    jsonResponse($profile);
} else {
    // List all profiles (admin only)
    requireAdmin();
    
    $stmt = $pdo->query("SELECT * FROM profiles ORDER BY created_at DESC");
    $profiles = $stmt->fetchAll();
    
    jsonResponse($profiles);
}
?>
