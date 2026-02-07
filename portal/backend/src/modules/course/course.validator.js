/**
 * Course Validators
 * Input validation schemas for course endpoints
 */

import { body, param, query } from 'express-validator';

const courseValidator = {
    getCourseById: [
        param('id')
            .isUUID()
            .withMessage('Invalid course ID'),
    ],

    createCourse: [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Course title is required')
            .isLength({ min: 5, max: 200 })
            .withMessage('Title must be 5-200 characters'),

        body('description')
            .trim()
            .notEmpty()
            .withMessage('Description is required')
            .isLength({ min: 20, max: 5000 })
            .withMessage('Description must be 20-5000 characters'),

        body('shortDescription')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Short description must be less than 500 characters'),

        body('price')
            .isFloat({ min: 0 })
            .withMessage('Price must be a positive number'),

        body('currency')
            .optional()
            .isIn(['GHS', 'USD'])
            .withMessage('Currency must be GHS or USD'),

        body('duration')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Duration must be a positive integer (in weeks)'),

        body('level')
            .optional()
            .isIn(['beginner', 'intermediate', 'advanced'])
            .withMessage('Invalid course level'),

        body('category')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Category must be less than 100 characters'),

        body('imageUrl')
            .optional()
            .isURL()
            .withMessage('Image URL must be a valid URL'),

        body('status')
            .optional()
            .isIn(['draft', 'active', 'archived'])
            .withMessage('Invalid status'),
    ],

    updateCourse: [
        param('id')
            .isUUID()
            .withMessage('Invalid course ID'),

        body('title')
            .optional()
            .trim()
            .isLength({ min: 5, max: 200 })
            .withMessage('Title must be 5-200 characters'),

        body('description')
            .optional()
            .trim()
            .isLength({ min: 20, max: 5000 })
            .withMessage('Description must be 20-5000 characters'),

        body('price')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Price must be a positive number'),

        body('level')
            .optional()
            .isIn(['beginner', 'intermediate', 'advanced'])
            .withMessage('Invalid course level'),

        body('status')
            .optional()
            .isIn(['draft', 'active', 'archived'])
            .withMessage('Invalid status'),
    ],

    listCourses: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Page must be a positive integer'),

        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limit must be between 1 and 100'),

        query('category')
            .optional()
            .trim(),

        query('level')
            .optional()
            .isIn(['beginner', 'intermediate', 'advanced'])
            .withMessage('Invalid level'),
    ],
};

export default courseValidator;
