/**
 * Auth Module Index
 * Exports all auth-related components
 */

import authController from './auth.controller.js';
import authService from './auth.service.js';
import authMiddleware from './auth.middleware.js';
import authRoutes from './auth.routes.js';
import jwtUtil from './jwt.util.js';

export {
    authController,
    authService,
    authMiddleware,
    authRoutes,
    jwtUtil,
};

export default {
    controller: authController,
    service: authService,
    middleware: authMiddleware,
    routes: authRoutes,
    jwt: jwtUtil,
};