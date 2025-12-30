<?php
/**
 * Comments API
 * GET /api/comments/?currency_code=xxx - List comments
 * POST /api/comments/ - Create comment
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/jwt.php';

setCORSHeaders();

$pdo = getDB();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        getComments();
        break;
    case 'POST':
        createComment();
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function getComments() {
    global $pdo;
    
    $currencyCode = $_GET['currency_code'] ?? '';
    $limit = min((int)($_GET['limit'] ?? 20), 100);
    
    if (empty($currencyCode)) {
        jsonResponse(['error' => 'رمز العملة مطلوب'], 400);
    }
    
    // Get main comments (parent_id is null)
    $stmt = $pdo->prepare("
        SELECT c.*, p.full_name, p.avatar_url, p.username
        FROM comments c
        LEFT JOIN profiles p ON c.user_id = p.user_id
        WHERE c.currency_code = ? AND c.parent_id IS NULL
        ORDER BY c.created_at DESC
        LIMIT ?
    ");
    $stmt->execute([$currencyCode, $limit]);
    $comments = $stmt->fetchAll();
    
    // Get replies for each comment
    foreach ($comments as &$comment) {
        $stmt = $pdo->prepare("
            SELECT c.*, p.full_name, p.avatar_url, p.username
            FROM comments c
            LEFT JOIN profiles p ON c.user_id = p.user_id
            WHERE c.parent_id = ?
            ORDER BY c.created_at ASC
        ");
        $stmt->execute([$comment['id']]);
        $comment['replies'] = $stmt->fetchAll();
        
        // Format profile data
        $comment['profile'] = $comment['user_id'] ? [
            'full_name' => $comment['full_name'],
            'avatar_url' => $comment['avatar_url'],
            'username' => $comment['username']
        ] : null;
        
        foreach ($comment['replies'] as &$reply) {
            $reply['profile'] = $reply['user_id'] ? [
                'full_name' => $reply['full_name'],
                'avatar_url' => $reply['avatar_url'],
                'username' => $reply['username']
            ] : null;
        }
    }
    
    jsonResponse($comments);
}

function createComment() {
    global $pdo;
    
    $input = getJsonInput();
    $currentUser = getCurrentUser();
    
    $currencyCode = $input['currency_code'] ?? '';
    $content = trim($input['content'] ?? '');
    $parentId = $input['parent_id'] ?? null;
    $isGuest = $input['is_guest'] ?? false;
    $guestName = trim($input['guest_name'] ?? '');
    
    if (empty($currencyCode)) {
        jsonResponse(['error' => 'رمز العملة مطلوب'], 400);
    }
    
    if (empty($content)) {
        jsonResponse(['error' => 'محتوى التعليق مطلوب'], 400);
    }
    
    if (strlen($content) > 1000) {
        jsonResponse(['error' => 'التعليق طويل جداً (الحد الأقصى 1000 حرف)'], 400);
    }
    
    // Validate guest vs user
    if ($isGuest) {
        if (empty($guestName)) {
            jsonResponse(['error' => 'اسم الضيف مطلوب'], 400);
        }
        $userId = null;
    } else {
        if (!$currentUser) {
            jsonResponse(['error' => 'يجب تسجيل الدخول أو التعليق كضيف'], 401);
        }
        $userId = $currentUser['user_id'];
        $guestName = null;
    }
    
    $id = generateUUID();
    
    $stmt = $pdo->prepare("
        INSERT INTO comments (id, user_id, currency_code, content, parent_id, is_guest, guest_name)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([$id, $userId, $currencyCode, $content, $parentId, $isGuest, $guestName]);
    
    // Fetch the created comment with profile
    $stmt = $pdo->prepare("
        SELECT c.*, p.full_name, p.avatar_url, p.username
        FROM comments c
        LEFT JOIN profiles p ON c.user_id = p.user_id
        WHERE c.id = ?
    ");
    $stmt->execute([$id]);
    $comment = $stmt->fetch();
    
    $comment['profile'] = $comment['user_id'] ? [
        'full_name' => $comment['full_name'],
        'avatar_url' => $comment['avatar_url'],
        'username' => $comment['username']
    ] : null;
    
    $comment['replies'] = [];
    
    jsonResponse($comment, 201);
}
?>
