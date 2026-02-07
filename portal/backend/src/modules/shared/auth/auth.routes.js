/**
 * Auth Routes
 * Defines all authentication-related endpoints
 */

import express from 'express';
import authController from './auth.controller.js';
import { authenticate } from './auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register/start
 * @desc    Start registration process - send verification code
 * @access  Public
 */
router.post('/register/start', authController.startRegistration);

/**
 * @route   POST /api/auth/register/verify
 * @desc    Verify email with code
 * @access  Public
 */
router.post('/register/verify', authController.verifyCode);

/**
 * @route   POST /api/auth/register/complete
 * @desc    Complete registration with course enrollment
 * @access  Public
 */
router.post('/register/complete', authController.completeRegistration);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change password (authenticated)
 * @access  Private
 */
router.post('/change-password', authenticate, authController.changePassword);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.getProfile);

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify if token is valid
 * @access  Private
 */
router.post('/verify-token', authenticate, authController.verifyToken);

export default router;