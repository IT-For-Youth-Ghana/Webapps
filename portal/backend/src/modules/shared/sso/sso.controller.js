/**
 * SSO Controller
 * Handles SSO token generation and validation
 */

import ssoService from './sso.service.js';
import { successResponse, errorResponse } from '../../../utils/response.js';
import asyncHandler from '../../../utils/asyncHandler.js';

class SSOController {
    /**
     * POST /api/sso/generate
     * Generate SSO token + redirect URL
     */
    generate = asyncHandler(async (req, res) => {
        const { target, redirect } = req.body;

        if (!target) {
            return errorResponse(res, {
                statusCode: 400,
                message: 'Missing required field: target',
            });
        }

        const result = await ssoService.generateRedirect(req.user, target, redirect);

        return successResponse(res, {
            statusCode: 200,
            message: 'SSO redirect generated',
            data: {
                redirect_url: result.redirectUrl,
            },
        });
    });

    /**
     * POST /api/sso/validate
     * Validate SSO token
     */
    validate = asyncHandler(async (req, res) => {
        const { token } = req.body;

        if (!token) {
            return errorResponse(res, {
                statusCode: 400,
                message: 'Missing required field: token',
            });
        }

        const result = await ssoService.validateToken(token);

        return successResponse(res, {
            statusCode: 200,
            message: result.valid ? 'Token valid' : 'Token invalid',
            data: result,
        });
    });
}

export default new SSOController();
