/**
 * Validation Middleware
 * Handles express-validator validation results
 */

import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

/**
 * Validate request using express-validator rules
 * @param {Array} validations - Array of express-validator validation chains
 */
export const validate = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        // Check for errors
        const errors = validationResult(req);

        if (errors.isEmpty()) {
            return next();
        }

        // Format errors
        const formattedErrors = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg,
            value: err.value,
        }));

        // Throw validation error
        throw new ValidationError('Validation failed', formattedErrors);
    };
};

export default validate;
