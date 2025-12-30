<?php
/**
 * Update/Delete Currency API
 * PUT /api/currencies/update.php?id=xxx - Update currency
 * DELETE /api/currencies/update.php?id=xxx - Delete currency
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/jwt.php';

setCORSHeaders();

$pdo = getDB();
$id = $_GET['id'] ?? '';

if (empty($id)) {
    jsonResponse(['error' => 'معرف العملة مطلوب'], 400);
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'PUT':
        updateCurrency($id);
        break;
    case 'DELETE':
        deleteCurrency($id);
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function updateCurrency($id) {
    global $pdo;
    
    requireAdmin();
    
    $input = getJsonInput();
    
    // Build update query dynamically
    $fields = [];
    $params = [];
    
    $allowedFields = ['code', 'name_ar', 'name_en', 'type', 'icon_url', 'buy_price', 'sell_price', 'is_active', 'display_order'];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $fields[] = "$field = ?";
            $params[] = $input[$field];
        }
    }
    
    if (empty($fields)) {
        jsonResponse(['error' => 'لا توجد بيانات للتحديث'], 400);
    }
    
    $params[] = $id;
    
    $sql = "UPDATE currencies SET " . implode(', ', $fields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    $stmt = $pdo->prepare("SELECT * FROM currencies WHERE id = ?");
    $stmt->execute([$id]);
    $currency = $stmt->fetch();
    
    if (!$currency) {
        jsonResponse(['error' => 'العملة غير موجودة'], 404);
    }
    
    jsonResponse($currency);
}

function deleteCurrency($id) {
    global $pdo;
    
    requireAdmin();
    
    $stmt = $pdo->prepare("DELETE FROM currencies WHERE id = ?");
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() === 0) {
        jsonResponse(['error' => 'العملة غير موجودة'], 404);
    }
    
    jsonResponse(['success' => true]);
}
?>
