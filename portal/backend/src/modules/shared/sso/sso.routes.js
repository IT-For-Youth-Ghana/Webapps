/**
 * SSO Routes
 */

import { Router } from 'express';
import ssoController from './sso.controller.js';
import { authenticate } from '../auth/auth.middleware.js';
import { rateLimiter } from '../../../middlewares/rateLimit.middleware.js';

const router = Router();

const ssoGenerateLimiter = rateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    keyGenerator: (req) => req.userId || req.ip,
});

/**
 * @openapi
 * /sso/generate:
 *   post:
 *     tags:
 *       - SSO
 *     summary: Generate SSO token
 *     description: Generate a Single Sign-On token for Moodle integration
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: SSO token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         ssoToken:
 *                           type: string
 *                           description: SSO token for Moodle authentication
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                         redirectUrl:
 *                           type: string
 *                           description: Moodle redirect URL with token
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/generate', authenticate, ssoGenerateLimiter, ssoController.generate);

/**
 * @openapi
 * /sso/validate:
 *   post:
 *     tags:
 *       - SSO
 *     summary: Validate SSO token
 *     description: Validate an SSO token (used by Moodle)
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
 *                 description: SSO token to validate
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: string
 *                           format: uuid
 *                         email:
 *                           type: string
 *                         moodleUserId:
 *                           type: integer
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/validate', ssoController.validate);

export default router;
