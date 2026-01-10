<?php
/**
 * Admin Settings API
 * GET /api/admin/settings.php - Get all settings
 * PUT /api/admin/settings.php - Update settings
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/jwt.php';

setCORSHeaders();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        getSettings();
        break;
    case 'PUT':
        updateSettings();
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function getSettings() {
    requireAdmin();
    
    $pdo = getDB();
    $stmt = $pdo->query("SELECT setting_key, setting_value FROM site_settings");
    $settings = [];
    
    while ($row = $stmt->fetch()) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
    
    jsonResponse(['settings' => $settings]);
}

function updateSettings() {
    requireAdmin();
    
    $input = getJsonInput();
    $pdo = getDB();
    
    $allowedSettings = [
        'registration_enabled',
        'email_verification_required', 
        'google_login_enabled',
        'guest_comments_enabled',
        'site_name',
        'site_description'
    ];
    
    $updated = [];
    
    foreach ($allowedSettings as $key) {
        if (isset($input[$key])) {
            updateSiteSetting($key, $input[$key]);
            $updated[$key] = $input[$key];
        }
    }
    
    if (empty($updated)) {
        jsonResponse(['error' => 'لا توجد إعدادات للتحديث'], 400);
    }
    
    jsonResponse(['success' => true, 'updated' => $updated]);
}
?>
