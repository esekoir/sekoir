<?php
/**
 * E-Sekoir Database Configuration
 * ================================
 * 
 * غيّر القيم التالية حسب استضافتك
 */

// ╔═══════════════════════════════════════════════════════════╗
// ║              ⚙️ إعدادات قاعدة البيانات                     ║
// ╚═══════════════════════════════════════════════════════════╝

define('DB_HOST', 'localhost');              // عادة localhost
define('DB_NAME', 'u752343995_caba');        // ← اسم قاعدة البيانات
define('DB_USER', 'u752343995_dz');          // ← اسم مستخدم قاعدة البيانات  
define('DB_PASS', 'YOUR_PASSWORD');          // ← ⚠️ كلمة مرور قاعدة البيانات
define('DB_CHARSET', 'utf8mb4');

// ╔═══════════════════════════════════════════════════════════╗
// ║              🔐 إعدادات الأمان                             ║
// ╚═══════════════════════════════════════════════════════════╝

// مفتاح JWT - غيّره لنص عشوائي طويل (32 حرف على الأقل)
define('JWT_SECRET', 'E-Sekoir-JWT-Secret-Key-2024-Change-This-To-Random-String');

// ╔═══════════════════════════════════════════════════════════╗
// ║              🌐 إعدادات الموقع                             ║
// ╚═══════════════════════════════════════════════════════════╝

define('SITE_URL', 'https://caba-dz.com');

// النطاقات المسموح بها للـ CORS
define('ALLOWED_ORIGINS', [
    'https://caba-dz.com',
    'https://www.caba-dz.com',
    'http://localhost:5173',
    'http://localhost:3000'
]);

// ╔═══════════════════════════════════════════════════════════╗
// ║              🔵 Google OAuth (اختياري)                     ║
// ╚═══════════════════════════════════════════════════════════╝

// للتسجيل بحساب جوجل - احصل عليه من Google Cloud Console
define('GOOGLE_CLIENT_ID', '');

// ═══════════════════════════════════════════════════════════
// ⚠️ لا تعدّل أي شيء أسفل هذا الخط
// ═══════════════════════════════════════════════════════════

/**
 * Get PDO Database Connection
 */
function getDB() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            die(json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage()]));
        }
    }
    
    return $pdo;
}

/**
 * Set CORS Headers with Enhanced Security
 */
function setCORSHeaders() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // Validate origin against whitelist
    if (!empty($origin) && in_array($origin, ALLOWED_ORIGINS)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Vary: Origin");
    } else if (empty($origin)) {
        // Allow same-origin requests (no Origin header)
        header("Access-Control-Allow-Origin: " . SITE_URL);
    } else {
        // Block unauthorized origins
        http_response_code(403);
        die(json_encode(['error' => 'Origin not allowed', 'origin' => $origin]));
    }
    
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
    header("Content-Type: application/json; charset=utf-8");
    
    // Security headers
    header("X-Content-Type-Options: nosniff");
    header("X-Frame-Options: DENY");
    header("X-XSS-Protection: 1; mode=block");
    header("Referrer-Policy: strict-origin-when-cross-origin");
    
    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit();
    }
}

/**
 * Send JSON Response
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Get JSON Input
 */
function getJsonInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true) ?? [];
}

/**
 * Generate UUID v4
 */
function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

/**
 * Get Site Setting
 */
function getSiteSetting($key, $default = null) {
    try {
        $pdo = getDB();
        $stmt = $pdo->prepare("SELECT setting_value FROM site_settings WHERE setting_key = ?");
        $stmt->execute([$key]);
        $result = $stmt->fetch();
        return $result ? $result['setting_value'] : $default;
    } catch (Exception $e) {
        return $default;
    }
}

/**
 * Update Site Setting
 */
function updateSiteSetting($key, $value) {
    try {
        $pdo = getDB();
        $stmt = $pdo->prepare("
            INSERT INTO site_settings (setting_key, setting_value) 
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        ");
        return $stmt->execute([$key, $value]);
    } catch (Exception $e) {
        return false;
    }
}
?>
