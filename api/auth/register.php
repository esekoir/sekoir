<?php
/**
 * User Registration API
 * POST /api/auth/register.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/jwt.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$input = getJsonInput();

// Validate input
$email = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL);
$password = $input['password'] ?? '';
$fullName = trim($input['full_name'] ?? '');
$username = trim($input['username'] ?? '');
$wilaya = trim($input['wilaya'] ?? '');

if (!$email) {
    jsonResponse(['error' => 'البريد الإلكتروني غير صالح'], 400);
}

if (strlen($password) < 6) {
    jsonResponse(['error' => 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'], 400);
}

if (empty($fullName)) {
    jsonResponse(['error' => 'الاسم الكامل مطلوب'], 400);
}

if (empty($username)) {
    jsonResponse(['error' => 'اسم المستخدم مطلوب'], 400);
}

$pdo = getDB();

// Check if email exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    jsonResponse(['error' => 'البريد الإلكتروني مسجل مسبقاً'], 400);
}

// Check if username exists
$stmt = $pdo->prepare("SELECT id FROM profiles WHERE username = ?");
$stmt->execute([$username]);
if ($stmt->fetch()) {
    jsonResponse(['error' => 'اسم المستخدم مستخدم مسبقاً'], 400);
}

try {
    $pdo->beginTransaction();
    
    // Create user
    $userId = generateUUID();
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("
        INSERT INTO users (id, email, password_hash, email_verified) 
        VALUES (?, ?, ?, TRUE)
    ");
    $stmt->execute([$userId, $email, $passwordHash]);
    
    // Create profile
    $profileId = generateUUID();
    $stmt = $pdo->prepare("
        INSERT INTO profiles (id, user_id, full_name, username, wilaya) 
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$profileId, $userId, $fullName, $username, $wilaya]);
    
    $pdo->commit();
    
    // Create JWT token
    $token = createJWT($userId, $email);
    
    // Get profile
    $stmt = $pdo->prepare("SELECT * FROM profiles WHERE user_id = ?");
    $stmt->execute([$userId]);
    $profile = $stmt->fetch();
    
    jsonResponse([
        'user' => [
            'id' => $userId,
            'email' => $email
        ],
        'profile' => $profile,
        'access_token' => $token
    ]);
    
} catch (Exception $e) {
    $pdo->rollBack();
    jsonResponse(['error' => 'فشل في إنشاء الحساب'], 500);
}
?>
