<?php
/**
 * E-Sekoir Database Installation Script
 * This script creates all necessary tables for the application
 * 
 * Usage: 
 * 1. Update the database credentials below
 * 2. Upload this file to your server
 * 3. Run it once via browser: https://yoursite.com/database/install.php
 * 4. Delete this file after installation for security
 */

// ============= DATABASE CONFIGURATION =============
$config = [
    'host'     => 'localhost',
    'dbname'   => 'your_database_name',
    'username' => 'your_username',
    'password' => 'your_password',
    'charset'  => 'utf8mb4'
];

// ============= DO NOT EDIT BELOW THIS LINE =============

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html dir='rtl' lang='ar'>
<head>
    <meta charset='UTF-8'>
    <title>تثبيت قاعدة البيانات - E-Sekoir</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #1a1a2e; color: #eee; padding: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #10b981; }
        .success { background: #065f46; padding: 10px 15px; border-radius: 8px; margin: 10px 0; }
        .error { background: #991b1b; padding: 10px 15px; border-radius: 8px; margin: 10px 0; }
        .info { background: #1e40af; padding: 10px 15px; border-radius: 8px; margin: 10px 0; }
        code { background: #333; padding: 2px 6px; border-radius: 4px; }
        .warning { background: #92400e; padding: 15px; border-radius: 8px; margin-top: 20px; }
    </style>
</head>
<body>
<div class='container'>
<h1>🚀 تثبيت قاعدة بيانات E-Sekoir</h1>
";

try {
    // Connect to database
    $dsn = "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    echo "<div class='success'>✅ تم الاتصال بقاعدة البيانات بنجاح</div>";

    // ============= CREATE TABLES =============
    
    // 1. Users table (for authentication)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            email_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL,
            INDEX idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "<div class='success'>✅ تم إنشاء جدول <code>users</code></div>";

    // 2. Profiles table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS profiles (
            id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
            user_id CHAR(36) NOT NULL UNIQUE,
            full_name VARCHAR(100),
            username VARCHAR(50) UNIQUE,
            wilaya VARCHAR(2),
            avatar_url VARCHAR(500),
            member_number INT AUTO_INCREMENT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id),
            INDEX idx_username (username)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "<div class='success'>✅ تم إنشاء جدول <code>profiles</code></div>";

    // 3. User roles table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS user_roles (
            id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
            user_id CHAR(36) NOT NULL,
            role ENUM('admin', 'moderator', 'user') NOT NULL DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_role (user_id, role),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id),
            INDEX idx_role (role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "<div class='success'>✅ تم إنشاء جدول <code>user_roles</code></div>";

    // 4. Currencies table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS currencies (
            id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
            code VARCHAR(20) NOT NULL UNIQUE,
            name_ar VARCHAR(100) NOT NULL,
            name_en VARCHAR(100) NOT NULL,
            type ENUM('currency', 'crypto', 'gold', 'transfer') NOT NULL,
            icon_url VARCHAR(500),
            buy_price DECIMAL(18, 4),
            sell_price DECIMAL(18, 4),
            is_active BOOLEAN DEFAULT TRUE,
            display_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_type (type),
            INDEX idx_active (is_active),
            INDEX idx_order (display_order)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "<div class='success'>✅ تم إنشاء جدول <code>currencies</code></div>";

    // 5. Comments table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS comments (
            id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
            user_id CHAR(36),
            currency_code VARCHAR(20) NOT NULL,
            content TEXT NOT NULL,
            parent_id CHAR(36),
            is_guest BOOLEAN DEFAULT FALSE,
            guest_name VARCHAR(100),
            likes_count INT DEFAULT 0,
            dislikes_count INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
            INDEX idx_currency (currency_code),
            INDEX idx_user (user_id),
            INDEX idx_parent (parent_id),
            INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "<div class='success'>✅ تم إنشاء جدول <code>comments</code></div>";

    // 6. Comment likes table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS comment_likes (
            id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
            comment_id CHAR(36) NOT NULL,
            user_id CHAR(36),
            guest_id VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_like (comment_id, user_id),
            UNIQUE KEY unique_guest_like (comment_id, guest_id),
            FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_comment (comment_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "<div class='success'>✅ تم إنشاء جدول <code>comment_likes</code></div>";

    // 7. Comment dislikes table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS comment_dislikes (
            id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
            comment_id CHAR(36) NOT NULL,
            user_id CHAR(36),
            guest_id VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_dislike (comment_id, user_id),
            UNIQUE KEY unique_guest_dislike (comment_id, guest_id),
            FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_comment (comment_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "<div class='success'>✅ تم إنشاء جدول <code>comment_dislikes</code></div>";

    // 8. Sessions table (for authentication)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS sessions (
            id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
            user_id CHAR(36) NOT NULL,
            token VARCHAR(255) NOT NULL UNIQUE,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_token (token),
            INDEX idx_user (user_id),
            INDEX idx_expires (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "<div class='success'>✅ تم إنشاء جدول <code>sessions</code></div>";

    // ============= CREATE TRIGGERS =============
    
    // Trigger to update likes_count
    $pdo->exec("DROP TRIGGER IF EXISTS update_likes_count_insert");
    $pdo->exec("
        CREATE TRIGGER update_likes_count_insert
        AFTER INSERT ON comment_likes
        FOR EACH ROW
        UPDATE comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id
    ");
    
    $pdo->exec("DROP TRIGGER IF EXISTS update_likes_count_delete");
    $pdo->exec("
        CREATE TRIGGER update_likes_count_delete
        AFTER DELETE ON comment_likes
        FOR EACH ROW
        UPDATE comments SET likes_count = likes_count - 1 WHERE id = OLD.comment_id
    ");
    echo "<div class='success'>✅ تم إنشاء triggers لـ <code>likes_count</code></div>";

    // Trigger to update dislikes_count
    $pdo->exec("DROP TRIGGER IF EXISTS update_dislikes_count_insert");
    $pdo->exec("
        CREATE TRIGGER update_dislikes_count_insert
        AFTER INSERT ON comment_dislikes
        FOR EACH ROW
        UPDATE comments SET dislikes_count = dislikes_count + 1 WHERE id = NEW.comment_id
    ");
    
    $pdo->exec("DROP TRIGGER IF EXISTS update_dislikes_count_delete");
    $pdo->exec("
        CREATE TRIGGER update_dislikes_count_delete
        AFTER DELETE ON comment_dislikes
        FOR EACH ROW
        UPDATE comments SET dislikes_count = dislikes_count - 1 WHERE id = OLD.comment_id
    ");
    echo "<div class='success'>✅ تم إنشاء triggers لـ <code>dislikes_count</code></div>";

    // ============= INSERT DEFAULT DATA =============
    
    // Insert default currencies
    $defaultCurrencies = [
        ['USD', 'الدولار الأمريكي', 'US Dollar', 'currency', '/icons/usd.png', 1],
        ['EUR', 'اليورو', 'Euro', 'currency', '/icons/eur.png', 2],
        ['GBP', 'الجنيه الإسترليني', 'British Pound', 'currency', '/icons/gbp.png', 3],
        ['CAD', 'الدولار الكندي', 'Canadian Dollar', 'currency', '/icons/cad.png', 4],
        ['TRY', 'الليرة التركية', 'Turkish Lira', 'currency', '/icons/try.png', 5],
        ['AED', 'الدرهم الإماراتي', 'UAE Dirham', 'currency', '/icons/aed.png', 6],
        ['BTC', 'بيتكوين', 'Bitcoin', 'crypto', '/icons/btc.png', 10],
        ['ETH', 'إيثريوم', 'Ethereum', 'crypto', '/icons/eth.png', 11],
        ['USDT', 'تيثر', 'Tether', 'crypto', '/icons/usdt.png', 12],
        ['BNB', 'بينانس', 'Binance Coin', 'crypto', '/icons/bnb.png', 13],
        ['GOLD24', 'ذهب 24 قيراط', 'Gold 24K', 'gold', '/icons/gold24.png', 20],
        ['GOLD21', 'ذهب 21 قيراط', 'Gold 21K', 'gold', '/icons/gold21.png', 21],
        ['GOLD18', 'ذهب 18 قيراط', 'Gold 18K', 'gold', '/icons/gold18.png', 22],
        ['PAYPAL', 'باي بال', 'PayPal', 'transfer', '/icons/paypal.png', 30],
        ['WISE', 'وايز', 'Wise', 'transfer', '/icons/wise.png', 31],
        ['PAYSERA', 'بايسيرا', 'Paysera', 'transfer', '/icons/paysera.png', 32],
        ['SKRILL', 'سكريل', 'Skrill', 'transfer', '/icons/skrill.png', 33],
    ];

    $stmt = $pdo->prepare("
        INSERT IGNORE INTO currencies (code, name_ar, name_en, type, icon_url, display_order) 
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    foreach ($defaultCurrencies as $currency) {
        $stmt->execute($currency);
    }
    echo "<div class='success'>✅ تم إضافة العملات الافتراضية</div>";

    // ============= CREATE ADMIN USER =============
    echo "<div class='info'>
        <strong>📝 لإنشاء مستخدم أدمن:</strong><br>
        1. سجل حساب جديد من الموقع<br>
        2. ثم نفذ هذا الأمر في phpMyAdmin:<br>
        <code>INSERT INTO user_roles (user_id, role) SELECT id, 'admin' FROM users WHERE email = 'your@email.com';</code>
    </div>";

    echo "<div class='warning'>
        <strong>⚠️ تحذير أمني:</strong><br>
        احذف هذا الملف فوراً بعد التثبيت!<br>
        <code>rm database/install.php</code>
    </div>";

    echo "<div class='success' style='margin-top: 20px; font-size: 18px;'>
        🎉 <strong>تم تثبيت قاعدة البيانات بنجاح!</strong>
    </div>";

} catch (PDOException $e) {
    echo "<div class='error'>❌ خطأ: " . htmlspecialchars($e->getMessage()) . "</div>";
}

echo "</div></body></html>";
?>
