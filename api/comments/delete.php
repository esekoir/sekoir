<?php
/**
 * Delete Comment API
 * DELETE /api/comments/delete.php?id=xxx
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/jwt.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$id = $_GET['id'] ?? '';

if (empty($id)) {
    jsonResponse(['error' => 'معرف التعليق مطلوب'], 400);
}

$currentUser = getCurrentUser();
$pdo = getDB();

// Get comment
$stmt = $pdo->prepare("SELECT user_id FROM comments WHERE id = ?");
$stmt->execute([$id]);
$comment = $stmt->fetch();

if (!$comment) {
    jsonResponse(['error' => 'التعليق غير موجود'], 404);
}

// Check permission: admin or owner
$canDelete = false;

if ($currentUser) {
    if ($comment['user_id'] === $currentUser['user_id']) {
        $canDelete = true;
    } elseif (isAdmin($currentUser['user_id'])) {
        $canDelete = true;
    }
}

if (!$canDelete) {
    jsonResponse(['error' => 'غير مصرح بحذف هذا التعليق'], 403);
}

$stmt = $pdo->prepare("DELETE FROM comments WHERE id = ?");
$stmt->execute([$id]);

jsonResponse(['success' => true]);
?>
