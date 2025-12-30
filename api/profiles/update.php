<?php
/**
 * Update/Delete Profile API
 * PUT /api/profiles/update.php - Update own profile
 * DELETE /api/profiles/update.php?user_id=xxx - Delete profile (admin)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/jwt.php';

setCORSHeaders();

$pdo = getDB();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'PUT':
        updateProfile();
        break;
    case 'DELETE':
        deleteProfile();
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function updateProfile() {
    global $pdo;
    
    $currentUser = requireAuth();
    $input = getJsonInput();
    
    $fields = [];
    $params = [];
    
    $allowedFields = ['full_name', 'username', 'wilaya', 'avatar_url'];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $fields[] = "$field = ?";
            $params[] = trim($input[$field]);
        }
    }
    
    if (empty($fields)) {
        jsonResponse(['error' => 'لا توجد بيانات للتحديث'], 400);
    }
    
    // Check username uniqueness
    if (isset($input['username'])) {
        $stmt = $pdo->prepare("SELECT id FROM profiles WHERE username = ? AND user_id != ?");
        $stmt->execute([trim($input['username']), $currentUser['user_id']]);
        if ($stmt->fetch()) {
            jsonResponse(['error' => 'اسم المستخدم مستخدم مسبقاً'], 400);
        }
    }
    
    $params[] = $currentUser['user_id'];
    
    $sql = "UPDATE profiles SET " . implode(', ', $fields) . " WHERE user_id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    $stmt = $pdo->prepare("SELECT * FROM profiles WHERE user_id = ?");
    $stmt->execute([$currentUser['user_id']]);
    $profile = $stmt->fetch();
    
    jsonResponse($profile);
}

function deleteProfile() {
    global $pdo;
    
    requireAdmin();
    
    $userId = $_GET['user_id'] ?? '';
    
    if (empty($userId)) {
        jsonResponse(['error' => 'معرف المستخدم مطلوب'], 400);
    }
    
    // Delete user (cascades to profile)
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    
    if ($stmt->rowCount() === 0) {
        jsonResponse(['error' => 'المستخدم غير موجود'], 404);
    }
    
    jsonResponse(['success' => true]);
}
?>
