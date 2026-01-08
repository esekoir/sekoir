<?php
/**
 * Google OAuth Login API
 * POST /api/auth/google.php
 * 
 * Receives Google ID token from frontend and authenticates user
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/jwt.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$input = getJsonInput();
$googleToken = $input['id_token'] ?? '';

if (empty($googleToken)) {
    jsonResponse(['error' => 'Google token is required'], 400);
}

// Verify Google token
$googleClientId = defined('GOOGLE_CLIENT_ID') ? GOOGLE_CLIENT_ID : '';

if (empty($googleClientId)) {
    jsonResponse(['error' => 'Google authentication is not configured'], 500);
}

// Verify the token with Google
$verifyUrl = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($googleToken);
$response = file_get_contents($verifyUrl);

if ($response === false) {
    jsonResponse(['error' => 'Failed to verify Google token'], 401);
}

$googleData = json_decode($response, true);

// Validate the token
if (!isset($googleData['email']) || !isset($googleData['sub'])) {
    jsonResponse(['error' => 'Invalid Google token'], 401);
}

// Check if token was issued for our app
if ($googleData['aud'] !== $googleClientId) {
    jsonResponse(['error' => 'Token was not issued for this application'], 401);
}

$email = $googleData['email'];
$googleId = $googleData['sub'];
$fullName = $googleData['name'] ?? '';
$avatarUrl = $googleData['picture'] ?? null;

$pdo = getDB();

// Check if user exists
$stmt = $pdo->prepare("SELECT id, email FROM users WHERE email = ? OR google_id = ?");
$stmt->execute([$email, $googleId]);
$user = $stmt->fetch();

if (!$user) {
    // Create new user
    $userId = generateUUID();
    
    $stmt = $pdo->prepare("INSERT INTO users (id, email, google_id, created_at) VALUES (?, ?, ?, NOW())");
    $stmt->execute([$userId, $email, $googleId]);
    
    // Create profile
    $profileId = generateUUID();
    $stmt = $pdo->prepare("
        INSERT INTO profiles (id, user_id, full_name, avatar_url, created_at, updated_at) 
        VALUES (?, ?, ?, ?, NOW(), NOW())
    ");
    $stmt->execute([$profileId, $userId, $fullName, $avatarUrl]);
    
    $user = ['id' => $userId, 'email' => $email];
    $needsProfileCompletion = true;
} else {
    // Update Google ID if not set
    if (!isset($user['google_id']) || empty($user['google_id'])) {
        $stmt = $pdo->prepare("UPDATE users SET google_id = ? WHERE id = ?");
        $stmt->execute([$googleId, $user['id']]);
    }
    $needsProfileCompletion = false;
}

// Update last login
$stmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
$stmt->execute([$user['id']]);

// Get profile
$stmt = $pdo->prepare("SELECT * FROM profiles WHERE user_id = ?");
$stmt->execute([$user['id']]);
$profile = $stmt->fetch();

// Check if profile needs completion (missing username or wilaya)
if ($profile && (empty($profile['username']) || empty($profile['wilaya']))) {
    $needsProfileCompletion = true;
}

// Create JWT token
$token = createJWT($user['id'], $user['email']);

jsonResponse([
    'user' => [
        'id' => $user['id'],
        'email' => $user['email']
    ],
    'profile' => $profile,
    'access_token' => $token,
    'needs_profile_completion' => $needsProfileCompletion
]);
?>
