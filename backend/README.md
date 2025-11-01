# Backend - Authentication System

## نبذة
هذا المجلد يحتوي على كل الأكواد والبنية الخاصة بخادم الـ Node.js والـ API الخاصة بنظام المصادقة، ويدير عمليات المستخدمين وقاعدة البيانات.

## التقنيات المستخدمة
- Node.js
- Express.js
- PostgreSQL
- JWT (JSON Web Token)
- bcrypt (تشفير كلمات المرور)
- Swagger (توثيق API)
- CORS

## طريقة التشغيل
1. تأكد من وجود Node.js و npm ونظام PostgreSQL على جهازك.
2. قم بإنشاء قاعدة بيانات PostgreSQL جديدة (يمكنك تسمية القاعدة مثلاً testBackend).
3. انسخ ملف `backend/database.sql` إلى pgAdmin أو أي أداة SQL ونفذه لإنشاء الجداول.
4. ثبت الحزم:
   ```bash
   npm install
   ```
5. شغّل الخادم:
   ```bash
   npm run dev
   ```

## ملفات مهمة
- `controllers/`‎ : منطق العمليات (تسجيل - دخول - إدارة المستخدمين)
- `database.sql` : هيكل القاعدة والجداول
- `index.js` : نقطة البدء الرئيسية
- `routes/`‎ : تعريف المسارات وEndpoints

## الإعدادات البيئية
- تحتاج متغيرات بيئة `.env` لربط قاعدة البيانات وإعداد المفاتيح السرية

---
