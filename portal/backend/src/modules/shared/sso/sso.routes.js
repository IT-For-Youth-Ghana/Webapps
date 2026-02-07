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

router.post('/generate', authenticate, ssoGenerateLimiter, ssoController.generate);
router.post('/validate', ssoController.validate);

export default router;
