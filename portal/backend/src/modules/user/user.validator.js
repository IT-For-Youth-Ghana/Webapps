/**
 * User Validators
 * Input validation schemas for user endpoints
 */

import { body, param, query } from 'express-validator';

const userValidator = {
    updateProfile: [
        body('firstName')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('First name must be 2-50 characters'),

        body('lastName')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Last name must be 2-50 characters'),

        body('phone')
            .optional()
            .trim()
            .matches(/^(\+233|0)[0-9]{9}$/)
            .withMessage('Please enter a valid Ghanaian phone number'),

        body('dateOfBirth')
            .optional()
            .isISO8601()
            .withMessage('Please enter a valid date'),
    ],

    suspendUser: [
        param('id')
            .isUUID()
            .withMessage('Invalid user ID'),

        body('reason')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Reason must be less than 500 characters'),
    ],

    getUserById: [
        param('id')
            .isUUID()
            .withMessage('Invalid user ID'),
    ],

    listUsers: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),

        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100'),

        query('role')
            .optional()
            .isIn(['student', 'teacher', 'admin'])
            .withMessage('Invalid role'),

        query('status')
            .optional()
            .isIn(['active', 'suspended', 'pending'])
            .withMessage('Invalid status'),
    ],
};

export default userValidator;
