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

## SMTP Configuration (Forgot Password)
This backend uses SMTP for sending password reset emails. Ensure you have the following environment variables configured for email functionality:

- `EMAIL_USER`: The email address used to send password reset emails.
- `EMAIL_PASS`: The password for the `EMAIL_USER`.
- `EMAIL_HOST`: The SMTP host (e.g., `smtp.gmail.com`).
- `EMAIL_PORT`: The SMTP port (e.g., `587` for TLS/STARTTLS).

## الإعدادات البيئية
- تحتاج متغيرات بيئة `.env` لربط قاعدة البيانات وإعداد المفاتيح السرية.
- قم بإنشاء ملف `.env` في المجلد الجذر للـ `backend` واملأه بالمعلومات التالية:

```
# Database Configuration
DB_USER=your_db_user
DB_HOST=localhost
DB_DATABASE=testBackend
DB_PASSWORD=your_db_password
DB_PORT=5432

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# SMTP Configuration for Email
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
```
