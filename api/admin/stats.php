<?php
/**
 * Admin Statistics API
 * GET /api/admin/stats.php - Get dashboard statistics
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/jwt.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

requireAdmin();

$pdo = getDB();

// Get counts
$stats = [];

// Users count
$stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
$stats['users_count'] = (int)$stmt->fetch()['count'];

// Comments count
$stmt = $pdo->query("SELECT COUNT(*) as count FROM comments");
$stats['comments_count'] = (int)$stmt->fetch()['count'];

// Currencies count
$stmt = $pdo->query("SELECT COUNT(*) as count FROM currencies WHERE is_active = TRUE");
$stats['currencies_count'] = (int)$stmt->fetch()['count'];

// Today's registrations
$stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()");
$stats['today_registrations'] = (int)$stmt->fetch()['count'];

// Today's comments
$stmt = $pdo->query("SELECT COUNT(*) as count FROM comments WHERE DATE(created_at) = CURDATE()");
$stats['today_comments'] = (int)$stmt->fetch()['count'];

// Comments by currency
$stmt = $pdo->query("
    SELECT currency_code, COUNT(*) as count 
    FROM comments 
    GROUP BY currency_code 
    ORDER BY count DESC 
    LIMIT 10
");
$stats['comments_by_currency'] = $stmt->fetchAll();

// Recent activity
$stmt = $pdo->query("
    SELECT 'comment' as type, content as detail, created_at 
    FROM comments 
    ORDER BY created_at DESC 
    LIMIT 10
");
$stats['recent_activity'] = $stmt->fetchAll();

jsonResponse($stats);
?>
