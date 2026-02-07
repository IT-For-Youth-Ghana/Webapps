/**
 * Main API Router
 * Aggregates all module routes
 */

import { Router } from 'express';

// Module routes
import authRoutes from '../modules/shared/auth/auth.routes.js';
import ssoRoutes from '../modules/shared/sso/sso.routes.js';
import userRoutes from '../modules/user/user.routes.js';
import courseRoutes from '../modules/course/course.routes.js';
import enrollmentRoutes from '../modules/enrollment/enrollment.routes.js';
import paymentRoutes from '../modules/payment/payment.routes.js';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/sso', ssoRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/payments', paymentRoutes);

// API info endpoint
router.get('/', (req, res) => {
    res.json({
        name: 'ITFY Portal API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            auth: '/api/auth',
            sso: '/api/sso',
            users: '/api/users',
            courses: '/api/courses',
            enrollments: '/api/enrollments',
            payments: '/api/payments',
        },
    });
});

export default router;
