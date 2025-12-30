<?php
/**
 * Currencies API
 * GET /api/currencies/ - List currencies
 * POST /api/currencies/ - Create currency (admin)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/jwt.php';

setCORSHeaders();

$pdo = getDB();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        getCurrencies();
        break;
    case 'POST':
        createCurrency();
        break;
    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}

function getCurrencies() {
    global $pdo;
    
    $activeOnly = !isset($_GET['all']);
    $type = $_GET['type'] ?? null;
    
    $sql = "SELECT * FROM currencies";
    $params = [];
    $conditions = [];
    
    if ($activeOnly) {
        $conditions[] = "is_active = TRUE";
    }
    
    if ($type) {
        $conditions[] = "type = ?";
        $params[] = $type;
    }
    
    if ($conditions) {
        $sql .= " WHERE " . implode(' AND ', $conditions);
    }
    
    $sql .= " ORDER BY display_order ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $currencies = $stmt->fetchAll();
    
    jsonResponse($currencies);
}

function createCurrency() {
    global $pdo;
    
    requireAdmin();
    
    $input = getJsonInput();
    
    $code = strtoupper(trim($input['code'] ?? ''));
    $nameAr = trim($input['name_ar'] ?? '');
    $nameEn = trim($input['name_en'] ?? '');
    $type = $input['type'] ?? 'currency';
    $iconUrl = $input['icon_url'] ?? null;
    $buyPrice = $input['buy_price'] ?? null;
    $sellPrice = $input['sell_price'] ?? null;
    $displayOrder = $input['display_order'] ?? 0;
    
    if (empty($code) || empty($nameAr) || empty($nameEn)) {
        jsonResponse(['error' => 'البيانات المطلوبة ناقصة'], 400);
    }
    
    // Check if code exists
    $stmt = $pdo->prepare("SELECT id FROM currencies WHERE code = ?");
    $stmt->execute([$code]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'رمز العملة موجود مسبقاً'], 400);
    }
    
    $id = generateUUID();
    
    $stmt = $pdo->prepare("
        INSERT INTO currencies (id, code, name_ar, name_en, type, icon_url, buy_price, sell_price, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([$id, $code, $nameAr, $nameEn, $type, $iconUrl, $buyPrice, $sellPrice, $displayOrder]);
    
    $stmt = $pdo->prepare("SELECT * FROM currencies WHERE id = ?");
    $stmt->execute([$id]);
    $currency = $stmt->fetch();
    
    jsonResponse($currency, 201);
}
?>
