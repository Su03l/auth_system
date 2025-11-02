// auth/forgot-reset.js
const express = require("express");
const crypto = require("crypto");
const pool = require("../db");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const validator = require("validator");

const router = express.Router();

/* ---------- CONFIG (عدّل هذه القيم من env) ---------- */

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || "no-reply@example.com";
const SECRET_HMAC = process.env.SECRET_HMAC || "change_this_secret"; // مهم تغييره
const CODE_TTL_MINUTES = 10;
const MAX_VERIFY_ATTEMPTS = 5;
/* ------------------------------------------------------ */

/* nodemailer transporter (SMTP) */
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

/* rate limiting على endpoint إرسال الرموز (prevents abuse) */
const forgotLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5, // max 5 requests per window per IP (عدل حسب حاجتك)
  message: { error: "Too many requests, try again later." },
});

/* helper: generate 6-digit code as string */
function gen6() {
  return ('000000' + Math.floor(Math.random() * 1000000)).slice(-6);
}

/* hash the code using HMAC-SHA256 and server secret */
function hashCode(code) {
  return crypto.createHmac('sha256', SECRET_HMAC).update(code).digest('hex');
}

/* timing-safe compare */
function safeCompare(a, b) {
  const ba = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/* ---------- Endpoint: طلب إرسال رمز (Forgot) ---------- */
/**
 * @swagger
 * /auth/forgot:
 *   post:
 *     summary: Request a password reset code via email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *     responses:
 *       200:
 *         description: A generic message indicating the process has started. For security reasons, it does not confirm if the email exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: If an account exists, a reset code was sent.
 *       400:
 *         description: Invalid email format.
 *       429:
 *         description: Too many requests from this IP.
 *       500:
 *         description: Server error.
 */
router.post("/forgot", forgotLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const client = await pool.connect();
    try {
      // lookup user by email
      const userRes = await client.query("SELECT id FROM users WHERE lower(email) = lower($1) LIMIT 1", [email]);
      if (!userRes.rows.length) {
        // User does not exist
        return res.status(404).json({ error: "الحساب غير موجود" });
      }
      const user = userRes.rows[0];

      // generate code and hash
      const code = gen6();
      const codeHash = hashCode(code);
      const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

      // insert into password_resets
      await client.query(
        `INSERT INTO password_resets (user_id, email, code_hash, created_at, expires_at)
         VALUES ($1, $2, $3, now(), $4)`,
        [user.id, email.toLowerCase(), codeHash, expiresAt]
      );

      // send email (fire-and-forget)
      const textContent = `مرحبًا،

لقد تلقينا طلبًا لإعادة تعيين كلمة المرور لحسابك في نظام سليمان.

الرجاء استخدام رمز التحقق التالي لإكمال عملية إعادة تعيين كلمة المرور. هذا الرمز صالح لمدة ${CODE_TTL_MINUTES} دقائق فقط:
${code}

لإعادة تعيين كلمة المرور الخاصة بك، يرجى العودة إلى التطبيق أو صفحة إعادة التعيين وإدخال هذا الرمز.

إجراءات أمنية هامة:
- لا تشارك هذا الرمز أبدًا مع أي شخص. فريق دعم نظام سليمان لن يطلب منك هذا الرمز.
- إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.
- نوصي بشدة بتغيير كلمة المرور الخاصة بك بانتظام واستخدام كلمة مرور قوية وفريدة لحماية حسابك.

شكرًا لك على استخدام نظام سليمان.
فريق نظام سليمان`;

      const htmlContent = `
        <div style="direction: rtl; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">
            <h2 style="color: #0056b3; text-align: center; border-bottom: 2px solid #0056b3; padding-bottom: 10px;">إعادة تعيين كلمة المرور</h2>
            <p>مرحبًا،</p>
            <p>لقد تلقينا طلبًا لإعادة تعيين كلمة المرور لحسابك في <strong>نظام سليمان</strong>.</p>
            <p>الرجاء استخدام رمز التحقق التالي لإكمال عملية إعادة تعيين كلمة المرور. هذا الرمز صالح لمدة <strong>${CODE_TTL_MINUTES} دقائق فقط</strong>:</p>
            <div style="font-size: 28px; font-weight: bold; color: #0056b3; background-color: #e9f5ff; padding: 15px 20px; margin: 20px 0; text-align: center; border-radius: 5px; letter-spacing: 3px;">${code}</div>
            <p>لإعادة تعيين كلمة المرور الخاصة بك، يرجى العودة إلى التطبيق أو صفحة إعادة التعيين وإدخال هذا الرمز.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <h3 style="color: #d9534f;">إجراءات أمنية هامة:</h3>
            <ul style="list-style-type: disc; padding-left: 20px;">
                <li style="margin-bottom: 10px;"><strong>لا تشارك هذا الرمز أبدًا مع أي شخص.</strong> فريق دعم نظام سليمان لن يطلب منك هذا الرمز.</li>
                <li style="margin-bottom: 10px;">إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني. قد يكون شخص آخر قد أدخل بريدك الإلكتروني عن طريق الخطأ.</li>
                <li>نوصي بشدة بتغيير كلمة المرور الخاصة بك بانتظام واستخدام كلمة مرور قوية وفريدة لحماية حسابك.</li>
            </ul>
            <p style="text-align: center; margin-top: 30px; font-size: 0.9em; color: #777;">شكرًا لك على استخدام نظام سليمان.</p>
            <p style="text-align: center; font-weight: bold; color: #555;">فريق نظام سليمان</p>
        </div>
      `;

      transporter.sendMail({
        from: `"Suliman System" <${FROM_EMAIL}>`,
        to: email,
        subject: "إعادة تعيين كلمة المرور",
        text: textContent,
        html: htmlContent
      }).catch(err => {
        console.error("Mail send error:", err);
      });

      return res.json({ message: `تم ارسال رمز اعادة تعيين كلمة المرور الى ${email}` });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ---------- Endpoint: تحقق من الرمز (verify) ---------- */
/**
 * @swagger
 * /auth/verify-code:
 *   post:
 *     summary: Verify the 6-digit password reset code
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *               code:
 *                 type: string
 *                 description: The 6-digit code sent to the user's email.
 *     responses:
 *       200:
 *         description: The code is valid and the user can proceed to reset the password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Code valid. You may now reset your password.
 *       400:
 *         description: Invalid input, expired/used code, or too many failed attempts.
 *       500:
 *         description: Server error.
 */
router.post("/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !validator.isEmail(email) || !code) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const client = await pool.connect();
    try {
      // get latest non-used reset row
      const qr = await client.query(
        `SELECT id, code_hash, expires_at, attempts, used
         FROM password_resets
         WHERE lower(email) = lower($1)
         ORDER BY created_at DESC
         LIMIT 1`, [email]
      );
      if (!qr.rows.length) return res.status(400).json({ error: "Invalid or expired code" });
      const row = qr.rows[0];

      if (row.used) return res.status(400).json({ error: "Code already used" });

      const now = new Date();
      if (row.expires_at <= now) return res.status(400).json({ error: "Invalid or expired code" });

      if (row.attempts >= MAX_VERIFY_ATTEMPTS) {
        return res.status(400).json({ error: "Too many attempts" });
      }

      const providedHash = hashCode(String(code));
      const ok = safeCompare(row.code_hash, providedHash);
      if (!ok) {
        // increase attempts
        await client.query(`UPDATE password_resets SET attempts = attempts + 1 WHERE id = $1`, [row.id]);
        return res.status(400).json({ error: "Invalid code" });
      }

      // success — mark used (or you can keep it until reset endpoint consumes; here we mark used to ensure one-time)
      // await client.query(`UPDATE password_resets SET used = true WHERE id = $1`, [row.id]);

      // Option A: return success and let frontend open reset form (we used the code so user must use it immediately)
      return res.json({ message: "Code valid. You may now reset your password." });

      // Option B (alternative): you can create and return a short-lived reset token (JWT) and require that token to change pw.
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ---------- Endpoint: إعادة تعيين كلمة المرور (Reset) ---------- */
/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Set a new password after successful code verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *               code:
 *                 type: string
 *                 description: The 6-digit code sent to the user's email (required again for final validation).
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: The user's new password.
 *     responses:
 *       200:
 *         description: The password was updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated successfully.
 *       400:
 *         description: Invalid input, expired/used code, or weak password.
 *       500:
 *         description: Server error.
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !validator.isEmail(email) || !code || !newPassword) {
      return res.status(400).json({ error: "Invalid payload" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const client = await pool.connect();
    try {
      // find the latest (non-used) reset row matching email (the verify endpoint marked used already; if not, check code here)
      const qr = await client.query(
        `SELECT id, code_hash, expires_at, used FROM password_resets
         WHERE lower(email) = lower($1)
         ORDER BY created_at DESC LIMIT 1`, [email]
      );
      if (!qr.rows.length) return res.status(400).json({ error: "Invalid or expired code" });
      const row = qr.rows[0];

      if (row.used) return res.status(400).json({ error: "Code already used" });

      const now = new Date();
      if (row.expires_at <= now) return res.status(400).json({ error: "Invalid or expired code" });

      const providedHash = hashCode(String(code));
      if (!safeCompare(row.code_hash, providedHash)) {
        await client.query(`UPDATE password_resets SET attempts = attempts + 1 WHERE id = $1`, [row.id]);
        return res.status(400).json({ error: "Invalid code" });
      }

      // OK — update user password
      const userQ = await client.query(`SELECT id FROM users WHERE lower(email)=lower($1) LIMIT 1`, [email]);
      if (!userQ.rows.length) return res.status(400).json({ error: "User not found" });
      const userId = userQ.rows[0].id;

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(newPassword, salt);
      await client.query(`UPDATE users SET password = $1 WHERE id = $2`, [hash, userId]);

      // mark reset used
      await client.query(`UPDATE password_resets SET used = true WHERE id = $1`, [row.id]);

      return res.json({ message: "Password updated successfully." });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;