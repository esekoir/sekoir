<?php
/**
 * Like/Unlike Comment API
 * POST /api/comments/like.php - Like a comment
 * DELETE /api/comments/like.php?comment_id=xxx - Unlike a comment
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/jwt.php';

setCORSHeaders();

$pdo = getDB();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        likeComment();
        break;
    case 'DELETE':
        unlikeComment();
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function likeComment() {
    global $pdo;
    
    $input = getJsonInput();
    $currentUser = getCurrentUser();
    
    $commentId = $input['comment_id'] ?? '';
    $guestId = $input['guest_id'] ?? null;
    
    if (empty($commentId)) {
        jsonResponse(['error' => 'معرف التعليق مطلوب'], 400);
    }
    
    // Determine user or guest
    $userId = $currentUser ? $currentUser['user_id'] : null;
    
    if (!$userId && empty($guestId)) {
        jsonResponse(['error' => 'معرف الضيف مطلوب'], 400);
    }
    
    // Check if already liked
    if ($userId) {
        $stmt = $pdo->prepare("SELECT id FROM comment_likes WHERE comment_id = ? AND user_id = ?");
        $stmt->execute([$commentId, $userId]);
    } else {
        $stmt = $pdo->prepare("SELECT id FROM comment_likes WHERE comment_id = ? AND guest_id = ?");
        $stmt->execute([$commentId, $guestId]);
    }
    
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'تم الإعجاب مسبقاً'], 400);
    }
    
    // Remove dislike if exists
    if ($userId) {
        $stmt = $pdo->prepare("DELETE FROM comment_dislikes WHERE comment_id = ? AND user_id = ?");
        $stmt->execute([$commentId, $userId]);
    } else {
        $stmt = $pdo->prepare("DELETE FROM comment_dislikes WHERE comment_id = ? AND guest_id = ?");
        $stmt->execute([$commentId, $guestId]);
    }
    
    // Add like
    $id = generateUUID();
    $stmt = $pdo->prepare("
        INSERT INTO comment_likes (id, comment_id, user_id, guest_id)
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([$id, $commentId, $userId, $userId ? null : $guestId]);
    
    jsonResponse(['success' => true]);
}

function unlikeComment() {
    global $pdo;
    
    $currentUser = getCurrentUser();
    $commentId = $_GET['comment_id'] ?? '';
    $guestId = $_GET['guest_id'] ?? null;
    
    if (empty($commentId)) {
        jsonResponse(['error' => 'معرف التعليق مطلوب'], 400);
    }
    
    $userId = $currentUser ? $currentUser['user_id'] : null;
    
    if ($userId) {
        $stmt = $pdo->prepare("DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?");
        $stmt->execute([$commentId, $userId]);
    } else {
        $stmt = $pdo->prepare("DELETE FROM comment_likes WHERE comment_id = ? AND guest_id = ?");
        $stmt->execute([$commentId, $guestId]);
    }
    
    jsonResponse(['success' => true]);
}
?>
