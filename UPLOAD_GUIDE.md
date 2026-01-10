# 📱 دليل رفع E-Sekoir على الاستضافة (من الهاتف)

## 📁 هيكل الملفات المطلوب رفعها

```
public_html/
├── index.html          ← الصفحة الرئيسية
├── assets/             ← ملفات JavaScript و CSS
├── icons/              ← أيقونات العملات
│   ├── usd.png
│   ├── eur.png
│   └── ...
├── api/                ← ملفات PHP Backend
│   ├── config/
│   │   └── database.php    ← ⚠️ ملف الإعدادات (غيّره)
│   ├── auth/
│   │   ├── jwt.php
│   │   ├── login.php
│   │   ├── register.php
│   │   ├── me.php
│   │   └── google.php
│   ├── currencies/
│   │   ├── index.php
│   │   └── update.php
│   ├── comments/
│   │   ├── index.php
│   │   ├── delete.php
│   │   ├── like.php
│   │   └── dislike.php
│   ├── profiles/
│   │   ├── index.php
│   │   └── update.php
│   ├── admin/
│   │   ├── users.php
│   │   ├── stats.php
│   │   └── settings.php
│   ├── health.php
│   └── .htaccess
├── database/
│   └── install.php     ← سكريبت التثبيت (احذفه بعد التثبيت)
├── .htaccess           ← لتوجيه الروابط
└── robots.txt
```

---

## 🚀 خطوات التثبيت

### الخطوة 1: إنشاء قاعدة البيانات

1. ادخل لوحة تحكم الاستضافة (cPanel أو DirectAdmin)
2. ابحث عن "MySQL Databases"
3. أنشئ قاعدة بيانات جديدة
4. أنشئ مستخدم جديد مع كلمة مرور قوية
5. اربط المستخدم بقاعدة البيانات مع صلاحيات كاملة

### الخطوة 2: تعديل ملف الإعدادات

افتح الملف: `api/config/database.php`

غيّر هذه القيم:

```php
define('DB_HOST', 'localhost');              // عادة localhost
define('DB_NAME', 'اسم_قاعدة_البيانات');      // ← غيّره
define('DB_USER', 'اسم_المستخدم');            // ← غيّره
define('DB_PASS', 'كلمة_المرور');             // ← غيّره

define('JWT_SECRET', 'نص_عشوائي_طويل');       // ← غيّره لنص عشوائي
define('SITE_URL', 'https://yoursite.com');  // ← غيّره لرابط موقعك
```

### الخطوة 3: رفع الملفات

1. ارفع جميع الملفات إلى مجلد `public_html`
2. تأكد من رفع مجلد `api` كاملاً

### الخطوة 4: تشغيل سكريبت التثبيت

1. افتح الرابط: `https://yoursite.com/database/install.php`
2. انتظر اكتمال التثبيت
3. سترى بيانات حساب الأدمن

### الخطوة 5: حذف ملف التثبيت (مهم جداً!)

بعد التثبيت، احذف الملف:
```
database/install.php
```

---

## 👤 بيانات حساب الأدمن الافتراضي

| الحقل | القيمة |
|-------|--------|
| البريد الإلكتروني | `admin@caba-dz.com` |
| كلمة المرور | `Admin@123456` |
| اسم المستخدم | `admin` |

⚠️ **غيّر كلمة المرور فوراً بعد أول تسجيل دخول!**

يمكنك تغيير هذه البيانات في ملف `database/install.php` قبل التثبيت.

---

## 🔧 ملف .htaccess الرئيسي

ضع هذا الملف في `public_html/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Don't rewrite API calls
    RewriteCond %{REQUEST_URI} ^/api [NC]
    RewriteRule ^ - [L]
    
    # Don't rewrite existing files
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    
    # Rewrite everything else to index.html
    RewriteRule ^ index.html [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "DENY"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

---

## 📂 ملف api/.htaccess

```apache
# Allow API access
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Handle OPTIONS requests for CORS
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>

# PHP settings
<IfModule mod_php8.c>
    php_value display_errors 0
    php_value log_errors 1
</IfModule>
```

---

## ✅ اختبار التثبيت

بعد الرفع، جرب هذه الروابط:

1. **الصفحة الرئيسية**: `https://yoursite.com`
2. **فحص الـ API**: `https://yoursite.com/api/health.php`
3. **فحص العملات**: `https://yoursite.com/api/currencies/index.php`

---

## 🆘 حل المشاكل الشائعة

### خطأ 500 Internal Server Error
- تأكد من صلاحيات الملفات (644 للملفات، 755 للمجلدات)
- تأكد من صحة بيانات قاعدة البيانات

### خطأ CORS
- تأكد أن `SITE_URL` و `ALLOWED_ORIGINS` في `database.php` صحيحة

### صفحة بيضاء
- تأكد من رفع جميع ملفات `assets`
- تأكد من ملف `.htaccess`

---

## 📞 للمساعدة

إذا واجهت أي مشكلة:
1. تأكد من اتباع الخطوات بالترتيب
2. تحقق من رسائل الخطأ في ملفات logs
3. جرب فتح `/api/health.php` لفحص الاتصال
