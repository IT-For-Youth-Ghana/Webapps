/**
 * Payment Validators
 * Input validation schemas for payment endpoints
 */

import { body, param, query } from 'express-validator';

const paymentValidator = {
    getPaymentById: [
        param('id')
            .isUUID()
            .withMessage('Invalid payment ID'),
    ],

    initializePayment: [
        body('enrollmentId')
            .optional()
            .isUUID()
            .withMessage('Invalid enrollment ID'),

        body('courseId')
            .optional()
            .isUUID()
            .withMessage('Invalid course ID'),

        body().custom((value, { req }) => {
            if (!req.body.enrollmentId && !req.body.courseId) {
                throw new Error('enrollmentId or courseId is required');
            }
            return true;
        }),
    ],

    verifyPayment: [
        param('reference')
            .trim()
            .notEmpty()
            .withMessage('Payment reference is required'),
    ],

    retryPayment: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('Invalid payment ID'),
    ],

    listPayments: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),

        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100'),

        query('status')
            .optional()
            .isIn(['pending', 'success', 'failed', 'cancelled'])
            .withMessage('Invalid payment status'),

        query('startDate')
            .optional()
            .isISO8601()
            .withMessage('Start date must be a valid ISO date'),

        query('endDate')
            .optional()
            .isISO8601()
            .withMessage('End date must be a valid ISO date'),
    ],
};

export default paymentValidator;
