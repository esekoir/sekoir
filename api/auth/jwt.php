<?php
/**
 * Simple JWT Implementation
 */

require_once __DIR__ . '/../config/database.php';

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

/**
 * Create JWT Token
 */
function createJWT($userId, $email, $expiresIn = 86400) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    
    $payload = json_encode([
        'user_id' => $userId,
        'email' => $email,
        'iat' => time(),
        'exp' => time() + $expiresIn
    ]);
    
    $base64Header = base64UrlEncode($header);
    $base64Payload = base64UrlEncode($payload);
    
    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    $base64Signature = base64UrlEncode($signature);
    
    return "$base64Header.$base64Payload.$base64Signature";
}

/**
 * Verify JWT Token
 */
function verifyJWT($token) {
    $parts = explode('.', $token);
    
    if (count($parts) !== 3) {
        return null;
    }
    
    [$base64Header, $base64Payload, $base64Signature] = $parts;
    
    $signature = base64UrlDecode($base64Signature);
    $expectedSignature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    
    if (!hash_equals($expectedSignature, $signature)) {
        return null;
    }
    
    $payload = json_decode(base64UrlDecode($base64Payload), true);
    
    if ($payload['exp'] < time()) {
        return null;
    }
    
    return $payload;
}

/**
 * Get Current User from Authorization Header
 */
function getCurrentUser() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
        return verifyJWT($token);
    }
    
    return null;
}

/**
 * Require Authentication
 */
function requireAuth() {
    $user = getCurrentUser();
    
    if (!$user) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }
    
    return $user;
}

/**
 * Check if User is Admin
 */
function isAdmin($userId) {
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT role FROM user_roles WHERE user_id = ? AND role = 'admin'");
    $stmt->execute([$userId]);
    return $stmt->fetch() !== false;
}

/**
 * Require Admin Role
 */
function requireAdmin() {
    $user = requireAuth();
    
    if (!isAdmin($user['user_id'])) {
        jsonResponse(['error' => 'Forbidden - Admin access required'], 403);
    }
    
    return $user;
}
?>
