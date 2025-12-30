# E-Sekoir - دليل الرفع للاستضافة الخاصة

## هيكل الملفات المطلوب رفعها

```
public_html/
├── api/                          ← مجلد الـ API (PHP)
│   ├── config/
│   │   └── database.php          ← إعدادات قاعدة البيانات ⚠️ عدّله
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
│   └── .htaccess
│
├── database/
│   └── install.php               ← شغّله مرة واحدة ثم احذفه
│
├── assets/                       ← من مجلد dist/assets
├── icons/                        ← من مجلد public/icons
├── index.html                    ← من مجلد dist
├── robots.txt                    ← من مجلد public
└── .htaccess                     ← للـ SPA routing (أنشئه)
```

## خطوات الرفع

### 1. بناء المشروع
```bash
npm run build
```

### 2. عدّل `api/config/database.php`
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'اسم_قاعدة_بياناتك');
define('DB_USER', 'اسم_المستخدم');
define('DB_PASS', 'كلمة_المرور');
define('JWT_SECRET', 'مفتاح_سري_طويل_وعشوائي');
```

### 3. أنشئ `.htaccess` في public_html
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^api/ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### 4. شغّل سكريبت التثبيت
زُر: `https://موقعك.com/database/install.php`
ثم **احذف الملف** للأمان!

### 5. عدّل `src/lib/api.ts` قبل البناء
```typescript
const API_BASE_URL = 'https://موقعك.com/api';
```

## الملفات الجديدة للـ PHP

| الملف | الوظيفة |
|-------|---------|
| `src/lib/api.ts` | API Service للاتصال بـ PHP |
| `src/hooks/useAuthPHP.ts` | Hook للمصادقة |
| `src/hooks/useAdminPHP.ts` | Hook للأدمن |
| `src/pages/AuthPHP.tsx` | صفحة تسجيل الدخول |
| `src/components/CommentSectionPHP.tsx` | التعليقات |
| `src/components/AdminPanelPHP.tsx` | لوحة التحكم |

## ملاحظات مهمة

- ⚠️ لا تنسَ حذف `install.php` بعد التثبيت
- ⚠️ غيّر `JWT_SECRET` لقيمة آمنة
- ⚠️ الملفات الحالية تستخدم Supabase، للتبديل لـ PHP استبدل:
  - `useAuth` → `useAuthPHP`
  - `CommentSection` → `CommentSectionPHP`
  - `AdminPanel` → `AdminPanelPHP`
