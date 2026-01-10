<?php
/**
 * Upload Avatar API
 * POST /api/profiles/upload-avatar.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/jwt.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$currentUser = requireAuth();

// Check if file was uploaded
if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    jsonResponse(['error' => 'لم يتم رفع الصورة'], 400);
}

$file = $_FILES['avatar'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$maxSize = 5 * 1024 * 1024; // 5MB

// Validate file type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    jsonResponse(['error' => 'نوع الملف غير مدعوم. استخدم JPEG, PNG, GIF أو WebP'], 400);
}

// Validate file size
if ($file['size'] > $maxSize) {
    jsonResponse(['error' => 'حجم الملف كبير جداً. الحد الأقصى 5 ميجا'], 400);
}

// Create uploads directory if it doesn't exist
$uploadDir = __DIR__ . '/../../uploads/avatars/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = $currentUser['user_id'] . '_' . time() . '.' . $extension;
$filepath = $uploadDir . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    jsonResponse(['error' => 'فشل في حفظ الصورة'], 500);
}

// Generate URL
$avatarUrl = SITE_URL . '/uploads/avatars/' . $filename;

// Delete old avatar if exists
$pdo = getDB();
$stmt = $pdo->prepare("SELECT avatar_url FROM profiles WHERE user_id = ?");
$stmt->execute([$currentUser['user_id']]);
$oldProfile = $stmt->fetch();

if ($oldProfile && $oldProfile['avatar_url']) {
    $oldPath = str_replace(SITE_URL, __DIR__ . '/../..', $oldProfile['avatar_url']);
    if (file_exists($oldPath) && strpos($oldPath, '/avatars/') !== false) {
        @unlink($oldPath);
    }
}

// Update profile with new avatar URL
$stmt = $pdo->prepare("UPDATE profiles SET avatar_url = ?, updated_at = NOW() WHERE user_id = ?");
$stmt->execute([$avatarUrl, $currentUser['user_id']]);

// Get updated profile
$stmt = $pdo->prepare("SELECT * FROM profiles WHERE user_id = ?");
$stmt->execute([$currentUser['user_id']]);
$profile = $stmt->fetch();

jsonResponse([
    'success' => true,
    'avatar_url' => $avatarUrl,
    'profile' => $profile
]);
?>
