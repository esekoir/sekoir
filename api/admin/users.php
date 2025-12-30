<?php
/**
 * Admin Users API
 * GET /api/admin/users.php - List all users with profiles
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/jwt.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

requireAdmin();

$pdo = getDB();

$stmt = $pdo->query("
    SELECT 
        u.id as user_id,
        u.email,
        u.created_at as user_created_at,
        u.last_login,
        p.id as profile_id,
        p.full_name,
        p.username,
        p.wilaya,
        p.avatar_url,
        p.member_number,
        p.created_at as profile_created_at,
        (SELECT GROUP_CONCAT(role) FROM user_roles WHERE user_id = u.id) as roles
    FROM users u
    LEFT JOIN profiles p ON u.id = p.user_id
    ORDER BY u.created_at DESC
");

$users = $stmt->fetchAll();

jsonResponse($users);
?>
