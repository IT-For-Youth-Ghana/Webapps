/**
 * Payment Controller
 * Handles payment processing endpoints
 */

import paymentService from './payment.service.js';
import { successResponse } from '../../utils/response.js';
import asyncHandler from '../../utils/asyncHandler.js';
import logger from '../../utils/logger.js';

class PaymentController {
    /**
     * POST /api/payments/initialize
     * Initialize a payment for enrollment
     */
    initializePayment = asyncHandler(async (req, res) => {
        const { enrollmentId, courseId } = req.body;

        const result = await paymentService.initialize({
            userId: req.userId,
            enrollmentId,
            courseId,
        });

        return successResponse(res, {
            statusCode: 200,
            message: 'Payment initialized successfully',
            data: {
                authorizationUrl: result.authorizationUrl,
                reference: result.reference,
                accessCode: result.accessCode,
                isFree: result.isFree,
            },
        });
    });

    /**
     * GET /api/payments/verify/:reference
     * Verify a payment by reference
     */
    verifyPayment = asyncHandler(async (req, res) => {
        const { reference } = req.params;

        const result = await paymentService.verifyPayment(reference);

        return successResponse(res, {
            statusCode: 200,
            message: result.success ? 'Payment verified successfully' : 'Payment verification failed',
            data: result,
        });
    });

    /**
     * GET /api/payments/callback
     * Handle Paystack callback (redirect from payment page)
     */
    handleCallback = asyncHandler(async (req, res) => {
        const { reference, trxref } = req.query;
        const ref = reference || trxref;

        if (!ref) {
            return res.redirect(`${process.env.FRONTEND_URL}/payment/error?message=No reference provided`);
        }

        const result = await paymentService.verifyPayment(ref);

        if (result.success) {
            return res.redirect(`${process.env.FRONTEND_URL}/payment/success?reference=${ref}`);
        } else {
            return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?reference=${ref}`);
        }
    });

    /**
     * POST /api/payments/webhook
     * Handle Paystack webhook
     */
    handleWebhook = asyncHandler(async (req, res) => {
        const signature = req.headers['x-paystack-signature'];
        const payload = req.body;

        const result = await paymentService.processWebhook(payload, signature);
        if (!result.valid) {
            logger.warn('Invalid webhook signature received');
            return res.status(400).send('Invalid signature');
        }

        return res.status(200).send('OK');
    });

    /**
     * GET /api/payments/history
     * Get user's payment history
     */
    getPaymentHistory = asyncHandler(async (req, res) => {
        const { page = 1, limit = 20, status } = req.query;

        const payments = await paymentService.getByUser(req.userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            status,
        });

        return successResponse(res, {
            statusCode: 200,
            message: 'Payment history retrieved successfully',
            data: payments,
        });
    });

    /**
     * GET /api/payments/:id
     * Get payment details
     */
    getPaymentDetails = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const payment = await paymentService.getById(id, req.userId);

        return successResponse(res, {
            statusCode: 200,
            message: 'Payment retrieved successfully',
            data: payment,
        });
    });

    /**
     * POST /api/payments/:id/retry
     * Retry a failed payment
     */
    retryPayment = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const result = await paymentService.retryPayment(id, req.userId);

        return successResponse(res, {
            statusCode: 200,
            message: 'Payment retry initiated',
            data: {
                authorizationUrl: result.authorizationUrl,
                reference: result.paystackReference,
            },
        });
    });

    // ==========================================
    // Admin Endpoints
    // ==========================================

    /**
     * GET /api/payments/admin/all
     * Get all payments (admin)
     */
    getAllPayments = asyncHandler(async (req, res) => {
        const { page = 1, limit = 50, status, startDate, endDate } = req.query;

        const payments = await paymentService.getAll({
            page: parseInt(page),
            limit: parseInt(limit),
            status,
            startDate,
            endDate,
        });

        return successResponse(res, {
            statusCode: 200,
            message: 'Payments retrieved successfully',
            data: payments,
        });
    });

    /**
     * GET /api/payments/admin/stats
     * Get revenue statistics (admin)
     */
    getRevenueStats = asyncHandler(async (req, res) => {
        const { period = 'month' } = req.query;

        const stats = await paymentService.getRevenueStats(period);

        return successResponse(res, {
            statusCode: 200,
            message: 'Revenue statistics retrieved successfully',
            data: stats,
        });
    });
}

export default new PaymentController();
