/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting request rates
 */

import config from '../config/index.js';
import logger from '../utils/logger.js';
import cacheService from '../config/redis.js';

/**
 * In-memory rate limit store (fallback if Redis not available)
 */
class MemoryStore {
    constructor() {
        this.hits = new Map();
        this.resetTime = new Map();
    }

    async increment(key) {
        const now = Date.now();
        const resetTime = this.resetTime.get(key) || now + config.rateLimit.windowMs;

        if (now > resetTime) {
            this.hits.set(key, 1);
            this.resetTime.set(key, now + config.rateLimit.windowMs);
            return { hits: 1, resetTime: now + config.rateLimit.windowMs };
        }

        const hits = (this.hits.get(key) || 0) + 1;
        this.hits.set(key, hits);
        return { hits, resetTime };
    }

    async reset(key) {
        this.hits.delete(key);
        this.resetTime.delete(key);
    }

    // Clean up old entries periodically
    cleanup() {
        const now = Date.now();
        for (const [key, resetTime] of this.resetTime.entries()) {
            if (now > resetTime) {
                this.hits.delete(key);
                this.resetTime.delete(key);
            }
        }
    }
}

const memoryStore = new MemoryStore();

// Cleanup every minute
setInterval(() => memoryStore.cleanup(), 60000);

/**
 * Rate limiter middleware
 */
export const rateLimiter = (options = {}) => {
    const {
        windowMs = config.rateLimit.windowMs,
        max = config.rateLimit.max,
        message = 'Too many requests, please try again later',
        keyGenerator = (req) => req.ip,
        skip = () => false,
        handler = null,
    } = options;

    return async (req, res, next) => {
        // Skip if rate limiting is disabled or skip function returns true
        if (!config.rateLimit.enabled || skip(req)) {
            return next();
        }

        try {
            const key = `ratelimit:${keyGenerator(req)}`;
            let hits, resetTime;

            // Try Redis first, fallback to memory store
            try {
                if (!cacheService.shouldUseRedis()) {
                    throw new Error('Redis unavailable');
                }

                const multi = cacheService.redis.multi();
                multi.incr(key);
                multi.pExpire(key, windowMs);

                const results = await multi.exec();
                const redisHits = Array.isArray(results) ? results[0] : null;
                hits = typeof redisHits === 'number' ? redisHits : parseInt(redisHits, 10);
                if (!Number.isFinite(hits)) {
                    throw new Error('Redis INCR failed');
                }
                resetTime = Date.now() + windowMs;
            } catch (error) {
                // Fallback to memory store
                const result = await memoryStore.increment(key);
                hits = result.hits;
                resetTime = result.resetTime;
            }

            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', max);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, max - hits));
            res.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString());

            // Check if limit exceeded
            if (hits > max) {
                logger.warn(`Rate limit exceeded for ${key}`, {
                    ip: req.ip,
                    path: req.path,
                    hits,
                });

                if (handler) {
                    return handler(req, res, next);
                }

                return res.status(429).json({
                    success: false,
                    error: {
                        message,
                        retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
                    },
                });
            }

            next();
        } catch (error) {
            logger.error('Rate limiter error:', error);
            // On error, allow request to proceed
            next();
        }
    };
};

/**
 * Stricter rate limiter for authentication endpoints
 */
export const authRateLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts, please try again later',
    keyGenerator: (req) => `${req.ip}:${req.body.email || 'unknown'}`,
});

/**
 * API rate limiter
 */
export const apiRateLimiter = rateLimiter({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
});

/**
 * Webhook rate limiter (more permissive)
 */
export const webhookRateLimiter = rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
});

export default {
    rateLimiter,
    authRateLimiter,
    apiRateLimiter,
    webhookRateLimiter,
};
