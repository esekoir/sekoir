# دليل رفع E-Sekoir على أي استضافة
# E-Sekoir Upload Guide for Any Hosting

---

## 📁 هيكل الملفات المطلوب رفعها | Files Structure

```
public_html/
├── api/                              ← PHP Backend
│   ├── config/
│   │   └── database.php              ← ⚠️ عدّله بمعلومات قاعدة البيانات
│   ├── auth/
│   │   ├── jwt.php
│   │   ├── register.php
│   │   ├── login.php
│   │   └── me.php
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
│   │   └── stats.php
│   ├── health.php
│   ├── test-cors.php
│   └── .htaccess
│
├── database/
│   └── install.php                   ← شغّله مرة واحدة ثم احذفه!
│
├── assets/                           ← من dist/assets بعد البناء
│   └── (ملفات JS و CSS)
│
├── icons/                            ← من public/icons
│   ├── eur.png
│   ├── usd.png
│   └── (باقي الأيقونات)
│
├── index.html                        ← من dist/index.html
├── robots.txt                        ← من public/robots.txt
└── .htaccess                         ← ⚠️ أنشئه (الكود بالأسفل)
```

---

## 🔧 الملفات التي يمكن تعديلها بعد البناء

### 1. `api/config/database.php` - إعدادات قاعدة البيانات ⚡ مهم جداً

```php
define('DB_HOST', 'localhost');           // عادة localhost
define('DB_NAME', 'اسم_قاعدة_البيانات');    // من cPanel
define('DB_USER', 'اسم_المستخدم');         // من cPanel
define('DB_PASS', 'كلمة_المرور');          // من cPanel
define('JWT_SECRET', 'مفتاح_سري_عشوائي_طويل'); // غيّره لقيمة آمنة!
```

**ملاحظة:** لم تعد تحتاج لتعديل SITE_URL أو ALLOWED_ORIGINS - يتم اكتشافهم تلقائياً!

---

### 2. `.htaccess` في public_html - لتوجيه الروابط ⚡ مهم

أنشئ ملف `.htaccess` في مجلد `public_html` بهذا المحتوى:

```apache
RewriteEngine On
RewriteBase /

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>

# Don't rewrite API requests
RewriteRule ^api/ - [L]

# Don't rewrite existing files
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Route everything else to index.html (SPA)
RewriteRule . /index.html [L]

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/css
    AddOutputFilterByType DEFLATE application/javascript application/json
</IfModule>

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType text/css "access plus 1 week"
    ExpiresByType application/javascript "access plus 1 week"
</IfModule>
```

---

### 3. `index.html` - يمكن تعديل العنوان والوصف

```html
<title>E-Sekoir - منصة الصرف الشاملة</title>
<meta name="description" content="...">
```

---

## 📋 خطوات الرفع التفصيلية

### الخطوة 1: بناء المشروع (إذا كان لديك Node.js)

```bash
npm install
npm run build
```

**ليس لديك Node.js؟** حمّل المشروع من GitHub واستخدم مجلد `dist` الجاهز.

---

### الخطوة 2: إنشاء قاعدة البيانات

1. ادخل لوحة تحكم cPanel
2. اذهب إلى **MySQL Databases**
3. أنشئ قاعدة بيانات جديدة (مثال: `esekoir_db`)
4. أنشئ مستخدم جديد (مثال: `esekoir_user`)
5. اربط المستخدم بقاعدة البيانات مع **All Privileges**

---

### الخطوة 3: رفع الملفات

1. ادخل **File Manager** في cPanel
2. افتح مجلد `public_html`
3. ارفع الملفات التالية:

| من | إلى |
|---|---|
| `dist/index.html` | `public_html/index.html` |
| `dist/assets/` | `public_html/assets/` |
| `public/icons/` | `public_html/icons/` |
| `public/robots.txt` | `public_html/robots.txt` |
| `api/` (كل المجلد) | `public_html/api/` |
| `database/install.php` | `public_html/database/install.php` |

---

### الخطوة 4: تعديل إعدادات قاعدة البيانات

1. افتح `public_html/api/config/database.php`
2. عدّل:
```php
define('DB_NAME', 'esekoir_db');        // اسم قاعدة البيانات
define('DB_USER', 'esekoir_user');      // اسم المستخدم
define('DB_PASS', 'your_password');     // كلمة المرور
define('JWT_SECRET', 'random_secret_key_here');
```

---

### الخطوة 5: تشغيل سكريبت التثبيت

1. زُر: `https://yourdomain.com/database/install.php`
2. سترى رسالة نجاح التثبيت
3. **⚠️ احذف الملف فوراً!** `database/install.php`

---

### الخطوة 6: إنشاء ملف .htaccess

أنشئ ملف `.htaccess` في `public_html` بالمحتوى المذكور أعلاه.

---

### الخطوة 7: اختبار الموقع

1. زُر موقعك: `https://yourdomain.com`
2. اختبر API: `https://yourdomain.com/api/health.php`
3. اختبر التسجيل وتسجيل الدخول

---

## 🔒 ملاحظات الأمان المهمة

1. **احذف `database/install.php`** فوراً بعد التثبيت
2. **غيّر `JWT_SECRET`** لقيمة عشوائية طويلة
3. **لا ترفع ملفات `.env`** أو أي ملفات حساسة
4. **فعّل HTTPS** من cPanel (Let's Encrypt مجاني)

---

## 🛠️ استكشاف الأخطاء

### الموقع يظهر صفحة بيضاء
- تأكد من رفع `assets/` كاملاً
- تأكد من وجود `.htaccess`

### خطأ 500 في API
- تحقق من صحة بيانات قاعدة البيانات
- تأكد من دعم PHP 7.4+

### التسجيل لا يعمل
- تأكد من تشغيل `install.php`
- راجع أذونات قاعدة البيانات

### مشاكل CORS
- زُر `https://yourdomain.com/api/test-cors.php`
- تأكد من استخدام HTTPS

---

## 📱 للرفع من الهاتف

1. استخدم تطبيق **File Manager** في cPanel
2. أو استخدم تطبيق FTP مثل **AndFTP**
3. ارفع الملفات واحداً تلو الآخر

---

## 🔄 التحديث المستقبلي

عند التحديث:
1. أعد البناء: `npm run build`
2. ارفع `dist/` الجديد
3. **لا تحذف** مجلد `api/` أو قاعدة البيانات

---

## 📞 الدعم

إذا واجهت مشاكل، تحقق من:
- Console في المتصفح (F12)
- سجلات الخطأ في cPanel (Error Log)
