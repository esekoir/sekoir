# 📱 دليل رفع E-Sekoir على الاستضافة
## (للهاتف والكمبيوتر)

---

## 📁 الملفات المطلوبة

### 1️⃣ ملفات الواجهة الأمامية (Frontend)
```
public_html/
├── index.html
├── assets/          ← ملفات CSS و JS المُولّدة
├── icons/           ← أيقونات العملات
└── .htaccess        ← توجيه الروابط
```

### 2️⃣ ملفات الـ API (Backend)
```
public_html/api/
├── config/
│   └── database.php   ← ⚠️ غيّر بيانات قاعدة البيانات هنا
├── auth/
│   ├── jwt.php
│   ├── login.php
│   ├── register.php
│   ├── me.php
│   └── google.php
├── admin/
│   ├── settings.php
│   ├── stats.php
│   └── users.php
├── profiles/
│   ├── index.php
│   ├── update.php
│   └── upload-avatar.php
├── comments/
│   ├── index.php
│   ├── delete.php
│   ├── like.php
│   └── dislike.php
├── currencies/
│   ├── index.php
│   └── update.php
├── health.php
└── .htaccess
```

### 3️⃣ مجلد الرفع (للصور الشخصية)
```
public_html/uploads/
├── avatars/
│   └── .gitkeep
└── .htaccess
```

### 4️⃣ ملف تثبيت قاعدة البيانات
```
public_html/database/
└── install.php   ← سكريبت التثبيت (احذفه بعد التثبيت!)
```

---

## 🔧 خطوات التثبيت

### الخطوة 1: إنشاء قاعدة البيانات
1. ادخل لوحة التحكم **cPanel** أو **Hostinger**
2. اذهب إلى **MySQL Databases**
3. أنشئ قاعدة بيانات جديدة (مثل: `caba_db`)
4. أنشئ مستخدم MySQL جديد بكلمة مرور قوية
5. اربط المستخدم بقاعدة البيانات (All Privileges)

### الخطوة 2: تعديل ملف الإعدادات
افتح `api/config/database.php` وغيّر:

```php
// ═══════════════════════════════════════════════════════
// ⚠️ غيّر هذه الإعدادات حسب استضافتك
// ═══════════════════════════════════════════════════════

// قاعدة البيانات
define('DB_HOST', 'localhost');
define('DB_NAME', 'اسم_قاعدة_البيانات');      // ← غيّرها
define('DB_USER', 'اسم_المستخدم');           // ← غيّرها
define('DB_PASS', 'كلمة_المرور');            // ← غيّرها

// رابط الموقع
define('SITE_URL', 'https://caba-dz.com');    // ← غيّرها لرابط موقعك

// Google Login (اختياري)
define('GOOGLE_CLIENT_ID', '');               // ← أضف Google Client ID إذا أردت
```

### الخطوة 3: تعديل ملف install.php
افتح `database/install.php` وغيّر نفس البيانات:

```php
$config = [
    'host'     => 'localhost',
    'dbname'   => 'اسم_قاعدة_البيانات',    // ← غيّرها
    'username' => 'اسم_المستخدم',          // ← غيّرها
    'password' => 'كلمة_المرور',           // ← غيّرها
];
```

### الخطوة 4: رفع الملفات
1. ارفع كل الملفات إلى مجلد `public_html`
2. تأكد من رفع مجلد `api` و `uploads` و `database`

### الخطوة 5: تشغيل التثبيت
افتح في المتصفح:
```
https://موقعك.com/database/install.php
```

ستظهر رسائل نجاح لكل جدول يتم إنشاؤه.

### الخطوة 6: حذف ملف التثبيت ⚠️
بعد نجاح التثبيت، **احذف** ملف `database/install.php` فوراً للأمان!

---

## 👤 حساب الأدمن الافتراضي

| الحقل | القيمة |
|-------|--------|
| البريد | `admin@caba-dz.com` |
| كلمة المرور | `Admin@123456` |
| اسم المستخدم | `admin` |

**⚠️ غيّر كلمة المرور فوراً بعد أول تسجيل دخول!**

---

## 🔐 ملف .htaccess الرئيسي

انسخ هذا المحتوى إلى `public_html/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # API calls - forward to PHP backend
    RewriteRule ^api/(.*)$ api/$1 [L]
    
    # Database installer (remove after installation)
    RewriteRule ^database/(.*)$ database/$1 [L]
    
    # Uploads folder
    RewriteRule ^uploads/(.*)$ uploads/$1 [L]
    
    # Icons and static assets
    RewriteRule ^icons/(.*)$ icons/$1 [L]
    
    # If the request is for an existing file or directory, serve it
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]
    
    # Otherwise, redirect to index.html (SPA routing)
    RewriteRule ^ index.html [L]
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json
</IfModule>

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/webp "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
    ExpiresByType text/css "access plus 1 week"
    ExpiresByType application/javascript "access plus 1 week"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options SAMEORIGIN
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>
```

---

## 🔐 ملف api/.htaccess

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Handle preflight OPTIONS requests
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>

# PHP settings
<IfModule mod_php.c>
    php_flag display_errors Off
    php_value max_execution_time 60
    php_value upload_max_filesize 10M
    php_value post_max_size 10M
</IfModule>
```

---

## 📤 ملف uploads/.htaccess

```apache
# Prevent PHP execution in uploads directory
<FilesMatch "\.php$">
    Deny from all
</FilesMatch>

# Disable script execution
Options -ExecCGI
RemoveHandler .php .phtml .php3 .php4 .php5 .php7 .phps

# Set correct MIME types for images
<IfModule mod_mime.c>
    AddType image/jpeg .jpg .jpeg
    AddType image/png .png
    AddType image/gif .gif
    AddType image/webp .webp
</IfModule>

# Cache images
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/webp "access plus 1 month"
</IfModule>
```

---

## 🔑 تفعيل Google Login (اختياري)

### 1. إنشاء مشروع في Google Cloud Console
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com)
2. أنشئ مشروع جديد
3. فعّل **Google+ API**
4. اذهب إلى **Credentials** > **Create Credentials** > **OAuth Client ID**
5. اختر **Web Application**
6. أضف Authorized JavaScript origins:
   - `https://caba-dz.com`
   - `https://www.caba-dz.com`
7. انسخ **Client ID**

### 2. إضافة Client ID للمشروع
أضف الـ Client ID في ملفين:

**`api/config/database.php`:**
```php
define('GOOGLE_CLIENT_ID', 'YOUR_CLIENT_ID.apps.googleusercontent.com');
```

**`database/install.php`:**
```php
$siteSettings = [
    // ...
    'google_client_id' => 'YOUR_CLIENT_ID.apps.googleusercontent.com'
];
```

---

## ✅ اختبار الموقع

بعد التثبيت، تحقق من:

1. ✅ الصفحة الرئيسية تعمل
2. ✅ زر التسجيل يعمل (اقلب البطاقة الأولى)
3. ✅ تسجيل الدخول يعمل
4. ✅ زر Google يظهر (سيظهر رسالة إذا لم يكن مُفعّل)
5. ✅ التعليقات تعمل
6. ✅ لوحة التحكم تعمل (سجّل دخول كأدمن)
7. ✅ رفع الصورة الشخصية يعمل

---

## 🆘 حل المشاكل

### خطأ 500 Internal Server Error
- تحقق من صلاحيات الملفات (644 للملفات، 755 للمجلدات)
- تحقق من بيانات قاعدة البيانات

### خطأ CORS
- تأكد من إضافة رابط موقعك في `ALLOWED_ORIGINS` في `api/config/database.php`

### الصفحات لا تعمل
- تأكد من وجود ملف `.htaccess` الصحيح
- تأكد من تفعيل `mod_rewrite` في Apache

### Google Login لا يعمل
- تأكد من إضافة `GOOGLE_CLIENT_ID` صحيح
- تأكد من إضافة رابط موقعك في Google Console

---

## 📞 الدعم

إذا واجهت مشاكل:
1. تحقق من سجلات الأخطاء في cPanel
2. جرّب `https://موقعك.com/api/health.php` للتحقق من الـ API

---

**🎉 مبروك! موقعك جاهز للاستخدام!**
