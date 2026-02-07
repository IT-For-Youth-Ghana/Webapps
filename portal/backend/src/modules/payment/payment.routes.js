/**
 * Payment Routes
 * Handles payment processing and admin endpoints
 */

import { Router } from 'express';
import express from 'express';
import paymentController from './payment.controller.js';
import { authenticate, requireRole } from '../shared/auth/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import paymentValidator from './payment.validator.js';

const router = Router();

// ==========================================
// Public Routes
// ==========================================

// Paystack callback (redirect from payment page)
router.get('/callback', paymentController.handleCallback);

// Paystack webhook (must use raw body for signature verification)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// ==========================================
// Authenticated User Routes
// ==========================================

// Initialize payment
router.post('/initialize', authenticate, validate(paymentValidator.initializePayment), paymentController.initializePayment);

// Verify payment
router.get('/verify/:reference', authenticate, validate(paymentValidator.verifyPayment), paymentController.verifyPayment);

// Payment history
router.get('/history', authenticate, validate(paymentValidator.listPayments), paymentController.getPaymentHistory);

// Get specific payment
router.get('/:id', authenticate, validate(paymentValidator.getPaymentById), paymentController.getPaymentDetails);

// Retry failed payment
router.post('/:id/retry', authenticate, validate(paymentValidator.getPaymentById), paymentController.retryPayment);

// ==========================================
// Admin Routes
// ==========================================

// Revenue statistics
router.get('/admin/stats', authenticate, requireRole(['admin']), paymentController.getRevenueStats);

// All payments
router.get('/admin/all', authenticate, requireRole(['admin']), validate(paymentValidator.listPayments), paymentController.getAllPayments);

export default router;
