<?php
/**
 * Get Current User API
 * GET /api/auth/me.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/jwt.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$currentUser = getCurrentUser();

if (!$currentUser) {
    jsonResponse(['user' => null, 'profile' => null]);
}

$pdo = getDB();

// Get user
$stmt = $pdo->prepare("SELECT id, email FROM users WHERE id = ?");
$stmt->execute([$currentUser['user_id']]);
$user = $stmt->fetch();

if (!$user) {
    jsonResponse(['user' => null, 'profile' => null]);
}

// Get profile
$stmt = $pdo->prepare("SELECT * FROM profiles WHERE user_id = ?");
$stmt->execute([$user['id']]);
$profile = $stmt->fetch();

// Check admin status
$isAdmin = isAdmin($user['id']);

jsonResponse([
    'user' => $user,
    'profile' => $profile,
    'is_admin' => $isAdmin
]);
?>
