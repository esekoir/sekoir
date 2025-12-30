<?php
/**
 * User Login API
 * POST /api/auth/login.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/jwt.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$input = getJsonInput();

$email = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL);
$password = $input['password'] ?? '';

if (!$email || empty($password)) {
    jsonResponse(['error' => 'البريد الإلكتروني وكلمة المرور مطلوبان'], 400);
}

$pdo = getDB();

// Find user
$stmt = $pdo->prepare("SELECT id, email, password_hash FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    jsonResponse(['error' => 'بيانات الدخول غير صحيحة'], 401);
}

// Update last login
$stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
$stmt->execute([$user['id']]);

// Get profile
$stmt = $pdo->prepare("SELECT * FROM profiles WHERE user_id = ?");
$stmt->execute([$user['id']]);
$profile = $stmt->fetch();

// Create JWT token
$token = createJWT($user['id'], $user['email']);

jsonResponse([
    'user' => [
        'id' => $user['id'],
        'email' => $user['email']
    ],
    'profile' => $profile,
    'access_token' => $token
]);
?>
