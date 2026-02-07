/**
 * Enrollment Validators
 * Input validation schemas for enrollment endpoints
 */

import { body, param, query } from 'express-validator';

const enrollmentValidator = {
    getEnrollmentById: [
        param('id')
            .isUUID()
            .withMessage('Invalid enrollment ID'),
    ],

    createEnrollment: [
        body('courseId')
            .isUUID()
            .withMessage('Invalid course ID'),
    ],

    updateProgress: [
        param('id')
            .isUUID()
            .withMessage('Invalid enrollment ID'),

        param('moduleId')
            .isUUID()
            .withMessage('Invalid module ID'),

        body('progress')
            .optional()
            .isInt({ min: 0, max: 100 })
            .withMessage('Progress must be between 0 and 100'),

        body('status')
            .optional()
            .isIn(['not_started', 'in_progress', 'completed'])
            .withMessage('Invalid progress status'),
    ],

    dropEnrollment: [
        param('id')
            .isUUID()
            .withMessage('Invalid enrollment ID'),

        body('reason')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Reason must be less than 500 characters'),
    ],

    listEnrollments: [
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
            .isIn(['pending', 'active', 'completed', 'dropped', 'suspended'])
            .withMessage('Invalid enrollment status'),
    ],
};

export default enrollmentValidator;
