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

/**
 * @openapi
 * /payments/callback:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Paystack payment callback
 *     description: Handle redirect from Paystack payment page
 *     parameters:
 *       - in: query
 *         name: reference
 *         schema:
 *           type: string
 *         description: Payment reference
 *       - in: query
 *         name: trxref
 *         schema:
 *           type: string
 *         description: Transaction reference (alternative)
 *     responses:
 *       302:
 *         description: Redirect to frontend with payment status
 */
router.get('/callback', paymentController.handleCallback);

/**
 * @openapi
 * /payments/webhook:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Paystack webhook
 *     description: Handle Paystack payment webhooks (requires raw body)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Paystack webhook payload
 *     responses:
 *       200:
 *         description: Webhook processed
 *       400:
 *         description: Invalid signature
 */
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// ==========================================
// Authenticated User Routes
// ==========================================

/**
 * @openapi
 * /payments/initialize:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Initialize payment
 *     description: Initialize a payment for course enrollment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               enrollmentId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional existing enrollment ID
 *               courseId:
 *                 type: string
 *                 format: uuid
 *                 description: Course ID to pay for
 *     responses:
 *       200:
 *         description: Payment initialized successfully
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
 *                         authorizationUrl:
 *                           type: string
 *                           description: Paystack payment page URL
 *                         reference:
 *                           type: string
 *                           description: Payment reference
 *                         accessCode:
 *                           type: string
 *                         isFree:
 *                           type: boolean
 *                           description: True if course is free
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/initialize', authenticate, validate(paymentValidator.initializePayment), paymentController.initializePayment);

/**
 * @openapi
 * /payments/verify/{reference}:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Verify payment
 *     description: Verify a payment by reference
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment reference
 *     responses:
 *       200:
 *         description: Payment verified
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
 *                         success:
 *                           type: boolean
 *                         status:
 *                           type: string
 *                         amount:
 *                           type: number
 *                         payment:
 *                           $ref: '#/components/schemas/Payment'
 */
router.get('/verify/:reference', authenticate, validate(paymentValidator.verifyPayment), paymentController.verifyPayment);

/**
 * @openapi
 * /payments/history:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get payment history
 *     description: Retrieve payment history for the current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, success, failed, cancelled]
 *         description: Filter by payment status
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
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
 *                         payments:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Payment'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationInfo'
 */
router.get('/history', authenticate, validate(paymentValidator.listPayments), paymentController.getPaymentHistory);

/**
 * @openapi
 * /payments/{id}:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get payment details
 *     description: Retrieve details of a specific payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Payment'
 *       404:
 *         description: Payment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', authenticate, validate(paymentValidator.getPaymentById), paymentController.getPaymentDetails);

/**
 * @openapi
 * /payments/{id}/retry:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Retry failed payment
 *     description: Retry a failed payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment retry initiated
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
 *                         authorizationUrl:
 *                           type: string
 *                         reference:
 *                           type: string
 */
router.post('/:id/retry', authenticate, validate(paymentValidator.getPaymentById), paymentController.retryPayment);

// ==========================================
// Admin Routes
// ==========================================

/**
 * @openapi
 * /payments/admin/stats:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get revenue statistics (Admin)
 *     description: Retrieve revenue and payment statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: Time period for statistics
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                         totalRevenue:
 *                           type: number
 *                         successfulPayments:
 *                           type: integer
 *                         failedPayments:
 *                           type: integer
 *                         pendingPayments:
 *                           type: integer
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/admin/stats', authenticate, requireRole(['admin']), paymentController.getRevenueStats);

/**
 * @openapi
 * /payments/admin/all:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get all payments (Admin)
 *     description: Retrieve all payments with filtering options
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, success, failed, cancelled]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
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
 *                         payments:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Payment'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationInfo'
 */
router.get('/admin/all', authenticate, requireRole(['admin']), validate(paymentValidator.listPayments), paymentController.getAllPayments);

export default router;
