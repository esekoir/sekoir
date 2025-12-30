# E-Sekoir PHP API

## هيكل الملفات

```
api/
├── config/
│   └── database.php      # إعدادات قاعدة البيانات
├── auth/
│   ├── jwt.php           # وظائف JWT
│   ├── register.php      # تسجيل مستخدم جديد
│   ├── login.php         # تسجيل الدخول
│   └── me.php            # معلومات المستخدم الحالي
├── currencies/
│   ├── index.php         # عرض/إضافة العملات
│   └── update.php        # تعديل/حذف العملات
├── comments/
│   ├── index.php         # عرض/إضافة التعليقات
│   ├── delete.php        # حذف التعليقات
│   ├── like.php          # الإعجاب
│   └── dislike.php       # عدم الإعجاب
├── profiles/
│   ├── index.php         # عرض الملفات الشخصية
│   └── update.php        # تعديل/حذف الملفات
├── admin/
│   ├── users.php         # قائمة المستخدمين
│   └── stats.php         # الإحصائيات
├── .htaccess             # إعدادات Apache
└── README.md             # هذا الملف
```

## التثبيت

1. ارفع مجلد `api` إلى استضافتك
2. عدّل `config/database.php` ببيانات قاعدة البيانات
3. شغّل `../database/install.php` لإنشاء الجداول
4. احذف `install.php` بعد التثبيت

## نقاط النهاية (Endpoints)

### المصادقة
- `POST /api/auth/register.php` - تسجيل جديد
- `POST /api/auth/login.php` - تسجيل دخول
- `GET /api/auth/me.php` - المستخدم الحالي

### العملات
- `GET /api/currencies/` - قائمة العملات
- `POST /api/currencies/` - إضافة عملة (admin)
- `PUT /api/currencies/update.php?id=xxx` - تعديل (admin)
- `DELETE /api/currencies/update.php?id=xxx` - حذف (admin)

### التعليقات
- `GET /api/comments/?currency_code=xxx` - قائمة التعليقات
- `POST /api/comments/` - إضافة تعليق
- `DELETE /api/comments/delete.php?id=xxx` - حذف
- `POST /api/comments/like.php` - إعجاب
- `POST /api/comments/dislike.php` - عدم إعجاب

### الملفات الشخصية
- `GET /api/profiles/?user_id=xxx` - عرض ملف
- `GET /api/profiles/` - قائمة (admin)
- `PUT /api/profiles/update.php` - تعديل
- `DELETE /api/profiles/update.php?user_id=xxx` - حذف (admin)

### الأدمن
- `GET /api/admin/users.php` - قائمة المستخدمين
- `GET /api/admin/stats.php` - الإحصائيات

## المصادقة

استخدم JWT Token في Header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```
