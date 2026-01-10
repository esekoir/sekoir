<?php
/**
 * E-Sekoir Database Installation Script
 * =====================================
 * 
 * خطوات التثبيت:
 * 1. غيّر بيانات قاعدة البيانات أدناه
 * 2. ارفع هذا الملف إلى مجلد database على استضافتك
 * 3. افتح الرابط: https://yoursite.com/database/install.php
 * 4. احذف الملف بعد التثبيت للأمان
 */

// ╔═══════════════════════════════════════════════════════════╗
// ║          ⚙️ إعدادات قاعدة البيانات - غيّرها هنا            ║
// ╚═══════════════════════════════════════════════════════════╝

$config = [
    'host'     => 'localhost',           // عادة localhost
    'dbname'   => 'u752343995_caba',     // ← اسم قاعدة البيانات
    'username' => 'u752343995_dz',       // ← اسم المستخدم
    'password' => 'YOUR_PASSWORD',       // ← ⚠️ كلمة المرور هنا
    'charset'  => 'utf8mb4'
];

// ╔═══════════════════════════════════════════════════════════╗
// ║              👤 بيانات حساب الأدمن                         ║
// ╚═══════════════════════════════════════════════════════════╝

$adminAccount = [
    'email'     => 'admin@caba-dz.com',  // ← إيميل الأدمن
    'password'  => 'Admin@123456',       // ← كلمة مرور الأدمن
    'full_name' => 'مدير النظام',        // ← اسم الأدمن
    'username'  => 'admin',              // ← اسم المستخدم
    'wilaya'    => '16'                  // ← رمز الولاية
];

// ╔═══════════════════════════════════════════════════════════╗
// ║              🌐 إعدادات الموقع                             ║
// ╚═══════════════════════════════════════════════════════════╝

$siteSettings = [
    'site_url'         => 'https://caba-dz.com',
    'jwt_secret'       => 'E-Sekoir-JWT-Secret-Key-2024-Change-This-To-Random-String',
    'google_client_id' => ''  // ← اختياري: أضف Google Client ID للتسجيل بجوجل
];

// ═══════════════════════════════════════════════════════════
// ⚠️ لا تعدّل أي شيء أسفل هذا الخط
// ═══════════════════════════════════════════════════════════

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html dir='rtl' lang='ar'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>تثبيت قاعدة البيانات - E-Sekoir</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, sans-serif; 
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
            color: #eee; 
            padding: 20px; 
            min-height: 100vh;
            margin: 0;
        }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #10b981; text-align: center; margin-bottom: 30px; }
        .success { 
            background: linear-gradient(135deg, #065f46 0%, #047857 100%); 
            padding: 12px 18px; 
            border-radius: 10px; 
            margin: 8px 0; 
            border-right: 4px solid #34d399;
        }
        .error { 
            background: linear-gradient(135deg, #991b1b 0%, #dc2626 100%); 
            padding: 12px 18px; 
            border-radius: 10px; 
            margin: 8px 0;
            border-right: 4px solid #f87171;
        }
        .info { 
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); 
            padding: 15px 20px; 
            border-radius: 10px; 
            margin: 12px 0;
            border-right: 4px solid #60a5fa;
        }
        .warning { 
            background: linear-gradient(135deg, #92400e 0%, #d97706 100%); 
            padding: 15px 20px; 
            border-radius: 10px; 
            margin: 12px 0;
            border-right: 4px solid #fbbf24;
        }
        code { 
            background: rgba(0,0,0,0.3); 
            padding: 3px 8px; 
            border-radius: 4px; 
            font-family: 'Consolas', monospace;
            direction: ltr;
            display: inline-block;
        }
        .admin-card {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            padding: 25px;
            border-radius: 15px;
            margin: 20px 0;
            text-align: center;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        }
        .admin-card h2 { margin-top: 0; font-size: 22px; }
        .admin-card .credentials {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 10px;
            margin-top: 15px;
            text-align: right;
        }
        .admin-card .credentials p {
            margin: 8px 0;
            font-size: 16px;
        }
        .admin-card .credentials strong {
            color: #a7f3d0;
        }
        .final-success {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            padding: 25px;
            border-radius: 15px;
            margin: 25px 0;
            text-align: center;
            font-size: 20px;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        }
        .section-title {
            background: rgba(255,255,255,0.05);
            padding: 10px 15px;
            border-radius: 8px;
            margin: 20px 0 10px;
            color: #94a3b8;
            font-size: 14px;
        }
    </style>
</head>
<body>
<div class='container'>
<h1>🚀 تثبيت E-Sekoir</h1>
";

function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

try {
    // Connect to database
    $dsn = "mysql:host={$config['host']};dbname={$config['dbname']};charset={$config['charset']}";
    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    echo "<div class='success'>✅ تم الاتصال بقاعدة البيانات بنجاح</div>";

    echo "<div class='section-title'>📊 إنشاء الجداول</div>";

    // ============= CREATE TABLES =============
    
    // 1. Users table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id CHAR(36) PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255),
            google_id VARCHAR(100) UNIQUE,
            email_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL,
            INDEX idx_email (email),
            INDEX idx_google_id (google_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "<div class='success'>✅ جدول <code>users</code> - المستخدمين</div>";

    // 2. Profiles table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS profiles (
            id CHAR(36) PRIMARY KEY,
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=1000
    ");
    echo "<div class='success'>✅ جدول <code>profiles</code> - الملفات الشخصية</div>";

    // 3. User roles table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS user_roles (
            id CHAR(36) PRIMARY KEY,
            user_id CHAR(36) NOT NULL,
            role ENUM('admin', 'moderator', 'user') NOT NULL DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_role (user_id, role),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id),
            INDEX idx_role (role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "<div class='success'>✅ جدول <code>user_roles</code> - صلاحيات المستخدمين</div>";

    // 4. Currencies table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS currencies (
            id CHAR(36) PRIMARY KEY,
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
    echo "<div class='success'>✅ جدول <code>currencies</code> - العملات</div>";

    // 5. Comments table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS comments (
            id CHAR(36) PRIMARY KEY,
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
    echo "<div class='success'>✅ جدول <code>comments</code> - التعليقات</div>";

    // 6. Comment likes table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS comment_likes (
            id CHAR(36) PRIMARY KEY,
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
    echo "<div class='success'>✅ جدول <code>comment_likes</code></div>";

    // 7. Comment dislikes table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS comment_dislikes (
            id CHAR(36) PRIMARY KEY,
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
    echo "<div class='success'>✅ جدول <code>comment_dislikes</code></div>";

    // 8. Site settings table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS site_settings (
            id INT PRIMARY KEY AUTO_INCREMENT,
            setting_key VARCHAR(50) NOT NULL UNIQUE,
            setting_value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "<div class='success'>✅ جدول <code>site_settings</code> - إعدادات الموقع</div>";

    echo "<div class='section-title'>⚡ إنشاء Triggers</div>";

    // ============= CREATE TRIGGERS =============
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
    echo "<div class='success'>✅ تم إنشاء Triggers للإعجابات</div>";

    echo "<div class='section-title'>💰 إضافة العملات الافتراضية</div>";

    // ============= INSERT DEFAULT DATA =============
    $defaultCurrencies = [
        ['USD', 'الدولار الأمريكي', 'US Dollar', 'currency', '/icons/usd.png', 215.50, 217.00, 1],
        ['EUR', 'اليورو', 'Euro', 'currency', '/icons/eur.png', 235.00, 237.50, 2],
        ['GBP', 'الجنيه الإسترليني', 'British Pound', 'currency', '/icons/gbp.png', 275.00, 278.00, 3],
        ['CAD', 'الدولار الكندي', 'Canadian Dollar', 'currency', '/icons/cad.png', 158.00, 160.00, 4],
        ['TRY', 'الليرة التركية', 'Turkish Lira', 'currency', '/icons/try.png', 6.20, 6.50, 5],
        ['AED', 'الدرهم الإماراتي', 'UAE Dirham', 'currency', '/icons/aed.png', 58.50, 59.50, 6],
        ['BTC', 'بيتكوين', 'Bitcoin', 'crypto', '/icons/btc.png', 9500000, 9600000, 10],
        ['ETH', 'إيثريوم', 'Ethereum', 'crypto', '/icons/eth.png', 520000, 530000, 11],
        ['USDT', 'تيثر', 'Tether', 'crypto', '/icons/usdt.png', 215.00, 217.00, 12],
        ['BNB', 'بينانس', 'Binance Coin', 'crypto', '/icons/bnb.png', 85000, 87000, 13],
        ['GOLD24', 'ذهب 24 قيراط', 'Gold 24K', 'gold', '/icons/gold24.png', 12500, 12700, 20],
        ['GOLD21', 'ذهب 21 قيراط', 'Gold 21K', 'gold', '/icons/gold21.png', 10900, 11100, 21],
        ['GOLD18', 'ذهب 18 قيراط', 'Gold 18K', 'gold', '/icons/gold18.png', 9300, 9500, 22],
        ['PAYPAL', 'باي بال', 'PayPal', 'transfer', '/icons/paypal.png', 210.00, 220.00, 30],
        ['WISE', 'وايز', 'Wise', 'transfer', '/icons/wise.png', 212.00, 218.00, 31],
        ['PAYSERA', 'بايسيرا', 'Paysera', 'transfer', '/icons/paysera.png', 215.00, 220.00, 32],
        ['SKRILL', 'سكريل', 'Skrill', 'transfer', '/icons/skrill.png', 208.00, 215.00, 33],
    ];

    $stmt = $pdo->prepare("
        INSERT INTO currencies (id, code, name_ar, name_en, type, icon_url, buy_price, sell_price, display_order) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name_ar = VALUES(name_ar)
    ");
    
    foreach ($defaultCurrencies as $currency) {
        $id = generateUUID();
        $stmt->execute([$id, $currency[0], $currency[1], $currency[2], $currency[3], $currency[4], $currency[5], $currency[6], $currency[7]]);
    }
    echo "<div class='success'>✅ تم إضافة 17 عملة افتراضية</div>";

    // ============= INSERT DEFAULT SETTINGS =============
    $defaultSettings = [
        ['registration_enabled', 'true'],
        ['email_verification_required', 'false'],
        ['google_login_enabled', 'false'],
        ['guest_comments_enabled', 'true'],
        ['site_name', 'E-Sekoir'],
        ['site_description', 'منصة الصرف الشاملة'],
    ];

    $stmt = $pdo->prepare("
        INSERT INTO site_settings (setting_key, setting_value) 
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    ");
    
    foreach ($defaultSettings as $setting) {
        $stmt->execute($setting);
    }
    echo "<div class='success'>✅ تم إضافة الإعدادات الافتراضية</div>";

    echo "<div class='section-title'>👤 إنشاء حساب الأدمن</div>";

    // ============= CREATE ADMIN USER =============
    
    // Check if admin already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$adminAccount['email']]);
    $existingAdmin = $stmt->fetch();
    
    if (!$existingAdmin) {
        $adminUserId = generateUUID();
        $adminProfileId = generateUUID();
        $adminRoleId = generateUUID();
        $passwordHash = password_hash($adminAccount['password'], PASSWORD_DEFAULT);
        
        // Create admin user
        $stmt = $pdo->prepare("
            INSERT INTO users (id, email, password_hash, email_verified) 
            VALUES (?, ?, ?, TRUE)
        ");
        $stmt->execute([$adminUserId, $adminAccount['email'], $passwordHash]);
        
        // Create admin profile
        $stmt = $pdo->prepare("
            INSERT INTO profiles (id, user_id, full_name, username, wilaya) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$adminProfileId, $adminUserId, $adminAccount['full_name'], $adminAccount['username'], $adminAccount['wilaya']]);
        
        // Assign admin role
        $stmt = $pdo->prepare("
            INSERT INTO user_roles (id, user_id, role) 
            VALUES (?, ?, 'admin')
        ");
        $stmt->execute([$adminRoleId, $adminUserId]);
        
        echo "<div class='success'>✅ تم إنشاء حساب الأدمن</div>";
        
        echo "<div class='admin-card'>
            <h2>🔐 بيانات دخول الأدمن</h2>
            <div class='credentials'>
                <p><strong>البريد الإلكتروني:</strong> {$adminAccount['email']}</p>
                <p><strong>كلمة المرور:</strong> {$adminAccount['password']}</p>
                <p><strong>اسم المستخدم:</strong> {$adminAccount['username']}</p>
            </div>
            <p style='margin-top: 15px; font-size: 14px; opacity: 0.9;'>⚠️ غيّر كلمة المرور بعد أول تسجيل دخول!</p>
        </div>";
    } else {
        echo "<div class='info'>ℹ️ حساب الأدمن موجود مسبقاً</div>";
    }

    // ============= SUCCESS =============
    
    echo "<div class='final-success'>
        🎉 <strong>تم تثبيت قاعدة البيانات بنجاح!</strong><br>
        <span style='font-size: 16px;'>يمكنك الآن استخدام الموقع</span>
    </div>";

    echo "<div class='warning'>
        <strong>⚠️ تحذير أمني مهم!</strong><br><br>
        1. احذف هذا الملف فوراً بعد التثبيت<br>
        2. غيّر كلمة مرور الأدمن<br>
        3. غيّر JWT_SECRET في ملف database.php
    </div>";

    echo "<div class='info'>
        <strong>📁 الملفات المهمة:</strong><br><br>
        • <code>api/config/database.php</code> - إعدادات قاعدة البيانات<br>
        • <code>api/</code> - ملفات الـ API<br>
        • <code>index.html</code> - الصفحة الرئيسية<br>
        • <code>icons/</code> - أيقونات العملات
    </div>";

} catch (PDOException $e) {
    echo "<div class='error'>
        <strong>❌ خطأ في قاعدة البيانات:</strong><br><br>
        " . htmlspecialchars($e->getMessage()) . "
    </div>";
    
    echo "<div class='info'>
        <strong>💡 تأكد من:</strong><br><br>
        1. اسم قاعدة البيانات صحيح<br>
        2. اسم المستخدم صحيح<br>
        3. كلمة المرور صحيحة<br>
        4. قاعدة البيانات موجودة على الاستضافة
    </div>";
}

echo "</div></body></html>";
?>
