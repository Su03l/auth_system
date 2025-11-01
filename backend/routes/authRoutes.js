const express = require('express');
const { signup, signin, refresh, logout } = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fname
 *               - lname
 *               - username
 *               - email
 *               - password
 *             properties:
 *               fname:
 *                 type: string
 *               lname:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               jobTitle:
 *                 type: string
 *                 description: User's job title
 *               department:
 *                 type: string
 *                 description: User's department
 *               city:
 *                 type: string
 *                 description: User's city
 *               educationalQualification:
 *                 type: string
 *                 description: User's educational qualification
 *               aboutMe:
 *                 type: string
 *                 description: A short bio about the user
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: User's date of birth (YYYY-MM-DD)
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       500:
 *         description: Error registering user
 */
router.post('/signup', signup);

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: Authenticate user and get a JWT
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - loginIdentifier
 *               - password
 *             properties:
 *               loginIdentifier:
 *                 type: string
 *                 description: Username or email of the user
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Signed in successfully, returns JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Error signing in
 */
router.post('/signin', signin);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh an access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: The refresh token or an expired access token
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: Error refreshing token
 */
router.post('/refresh', refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out a user (client-side token discard)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
router.post('/logout', authenticateToken, logout);

module.exports = router;
