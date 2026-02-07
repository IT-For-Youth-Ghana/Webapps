/**
 * Swagger/OpenAPI Configuration
 * Configures API documentation using swagger-jsdoc
 */

import swaggerJsdoc from 'swagger-jsdoc';
import config from './index.js';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ITFY Portal API Documentation',
            version: '1.0.0',
            description: 'Comprehensive API documentation for the IT For Youth Ghana Portal. This API provides endpoints for user authentication, course management, student enrollment, and payment processing integrated with Paystack.',
            contact: {
                name: 'IT For Youth Ghana',
                email: 'support@itforyouth.org',
            },
            license: {
                name: 'ISC',
            },
        },
        servers: [
            {
                url: `http://localhost:${config.server.port}${config.server.apiPrefix}`,
                description: 'Development Server',
            },
            {
                url: config.frontend.url ? `${config.frontend.url}/api` : 'https://portal.itforyouth.org/api',
                description: 'Production Server',
            },
        ],
        tags: [
            {
                name: 'Authentication',
                description: 'User authentication and registration endpoints',
            },
            {
                name: 'SSO',
                description: 'Single Sign-On endpoints for Moodle integration',
            },
            {
                name: 'Users',
                description: 'User profile and management endpoints',
            },
            {
                name: 'Courses',
                description: 'Course browsing and management endpoints',
            },
            {
                name: 'Enrollments',
                description: 'Course enrollment and progress tracking endpoints',
            },
            {
                name: 'Payments',
                description: 'Payment processing and transaction endpoints',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token obtained from /api/auth/login',
                },
            },
        },
    },
    apis: [
        './src/modules/**/*.routes.js',
        './src/config/swagger.schemas.js',
    ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
