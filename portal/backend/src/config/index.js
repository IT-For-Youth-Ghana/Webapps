/**
 * Application Configuration
 * Centralized configuration for all environment settings
 */

import 'dotenv/config';

const config = {
    // Server Configuration
    server: {
        port: parseInt(process.env.PORT) || 5000,
        host: process.env.HOST || '0.0.0.0',
        env: process.env.NODE_ENV || 'development',
        apiPrefix: process.env.API_PREFIX || '/api',
    },

    // Database Configuration
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        name: process.env.DB_NAME || 'itfy_portal',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true',
        pool: {
            max: parseInt(process.env.DB_POOL_MAX) || 10,
            min: parseInt(process.env.DB_POOL_MIN) || 2,
            acquire: 30000,
            idle: 10000,
        },
    },

    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    },

    // SSO Configuration
    sso: {
        secret: process.env.SSO_SECRET,
        expiresIn: process.env.SSO_EXPIRES_IN || '5m',
    },

    // Redis / Caching Configuration
    redis: {
        enabled: process.env.REDIS_ENABLED === 'true',
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || null,
        ttl: {
            default: 300, // 5 minutes
            courses: 3600, // 1 hour
            categories: 86400, // 24 hours
            userProfile: 300, // 5 minutes
            popularCourses: 1800, // 30 minutes
        },
    },

    // Rate Limiting Configuration
    rateLimit: {
        enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    },

    // CORS Configuration
    cors: {
        origins: process.env.CORS_ORIGINS
            ? process.env.CORS_ORIGINS.split(',')
            : ['http://localhost:3000', 'http://localhost:5173'],
        credentials: true,
    },

    // Frontend URL
    frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:3000',
    },

    // Moodle Integration
    moodle: {
        url: process.env.MOODLE_URL,
        token: process.env.MOODLE_TOKEN,
        enabled: !!process.env.MOODLE_URL && !!process.env.MOODLE_TOKEN,
    },

    // Paystack Integration
    paystack: {
        secretKey: process.env.PAYSTACK_SECRET_KEY,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY,
        callbackUrl: process.env.PAYSTACK_CALLBACK_URL || `${process.env.FRONTEND_URL}/payment/callback`,
        enabled: !!process.env.PAYSTACK_SECRET_KEY,
    },

    // Incubator Integration
    incubator: {
        url: process.env.INCUBATOR_URL,
        secret: process.env.INCUBATOR_SECRET,
        enabled: !!process.env.INCUBATOR_URL,
    },

    // Email Configuration
    email: {
        provider: process.env.EMAIL_PROVIDER || 'console',
        from: {
            name: process.env.EMAIL_FROM || 'IT For Youth Ghana',
            address: process.env.EMAIL_FROM || 'noreply@itforyouthghana.org',
        },
        smtp: {
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT) || 587,
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASSWORD,
        },
    },

    testAddress: process.env.TEST_EMAIL || 'johnametepeagboku@live.com',

    // Security Configuration
    security: {
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
        passwordMinLength: 8,
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
        format: process.env.LOG_FORMAT || 'combined',
    },
};

// Validation of required configuration
const validateConfig = () => {
    const errors = [];

    if (config.server.env === 'production') {
        if (!config.jwt.secret || config.jwt.secret.includes('change-in-production')) {
            errors.push('JWT_SECRET must be set in production');
        }
        if (!config.database.password) {
            errors.push('DB_PASSWORD must be set in production');
        }
    }

    if (errors.length > 0) {
        console.error('Configuration validation failed:');
        errors.forEach(err => console.error(`  - ${err}`));
        if (config.server.env === 'production') {
            process.exit(1);
        }
    }
};

validateConfig();

export default config;
