/**
 * Smart Cache Service
 * Cache-aside pattern with Redis + in-memory LRU fallback
 * Features: TTL by data type, circuit breaker, auto-invalidation
 */

import config from './index.js';
import logger from '../utils/logger.js';

// In-memory LRU cache for fallback
class LRUCache {
    constructor(maxSize = 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    get(key) {
        if (!this.cache.has(key)) return null;

        const item = this.cache.get(key);
        if (item.expiresAt && Date.now() > item.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        // Move to end (most recently used)
        this.cache.delete(key);
        this.cache.set(key, item);
        return item.value;
    }

    set(key, value, ttlSeconds = 300) {
        // Evict oldest if at capacity
        if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }

        this.cache.set(key, {
            value,
            expiresAt: ttlSeconds > 0 ? Date.now() + (ttlSeconds * 1000) : null,
        });
    }

    delete(key) {
        this.cache.delete(key);
    }

    deletePattern(pattern) {
        const regex = new RegExp(pattern.replace('*', '.*'));
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }

    clear() {
        this.cache.clear();
    }

    size() {
        return this.cache.size;
    }
}

class CacheService {
    constructor() {
        this.redis = null;
        this.memoryCache = new LRUCache(1000);
        this.circuitOpen = false;
        this.failureCount = 0;
        this.circuitResetTime = null;
        this.CIRCUIT_THRESHOLD = 5;
        this.CIRCUIT_RESET_MS = 30000; // 30 seconds

        // TTL configuration (in seconds)
        this.ttl = config.redis.ttl;

        // Key prefix
        this.prefix = 'itfy:';
    }

    /**
     * Initialize Redis connection
     */
    async init() {
        if (!config.redis.enabled) {
            logger.info('📦 Cache: Using in-memory cache only (Redis disabled)');
            return;
        }

        try {
            const { createClient } = await import('redis');

            this.redis = createClient({
                url: config.redis.url,
                password: config.redis.password || undefined,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            logger.warn('Cache: Max Redis reconnection attempts reached');
                            return false;
                        }
                        return Math.min(retries * 100, 3000);
                    },
                },
            });

            this.redis.on('error', (err) => {
                logger.error('Cache: Redis error', err);
                this.openCircuit();
            });

            this.redis.on('ready', () => {
                logger.info('✅ Cache: Redis connected');
                this.closeCircuit();
            });

            await this.redis.connect();
        } catch (error) {
            logger.warn('Cache: Redis unavailable, using memory cache', error.message);
            this.openCircuit();
        }
    }

    /**
     * Circuit breaker: Open circuit on failure
     */
    openCircuit() {
        this.circuitOpen = true;
        this.circuitResetTime = Date.now() + this.CIRCUIT_RESET_MS;
        logger.warn('Cache: Circuit breaker OPEN - falling back to memory cache');
    }

    /**
     * Circuit breaker: Close circuit
     */
    closeCircuit() {
        this.circuitOpen = false;
        this.failureCount = 0;
        this.circuitResetTime = null;
    }

    /**
     * Check if should use Redis
     */
    shouldUseRedis() {
        if (!this.redis) return false;
        if (!this.circuitOpen) return true;

        // Check if circuit reset time has passed
        if (this.circuitResetTime && Date.now() > this.circuitResetTime) {
            logger.info('Cache: Attempting to close circuit breaker');
            this.closeCircuit();
            return true;
        }

        return false;
    }

    /**
     * Build cache key with prefix
     */
    buildKey(entity, ...parts) {
        return `${this.prefix}${entity}:${parts.join(':')}`;
    }

    /**
     * Get value from cache
     */
    async get(key) {
        // Try Redis first
        if (this.shouldUseRedis()) {
            try {
                const value = await this.redis.get(key);
                if (value) {
                    return JSON.parse(value);
                }
            } catch (error) {
                logger.error('Cache: Redis GET failed', error);
                this.failureCount++;
                if (this.failureCount >= this.CIRCUIT_THRESHOLD) {
                    this.openCircuit();
                }
            }
        }

        // Fall back to memory cache
        return this.memoryCache.get(key);
    }

    /**
     * Set value in cache
     */
    async set(key, value, ttlSeconds = this.ttl.default) {
        const serialized = JSON.stringify(value);

        // Always set in memory cache
        this.memoryCache.set(key, value, ttlSeconds);

        // Try Redis
        if (this.shouldUseRedis()) {
            try {
                if (ttlSeconds > 0) {
                    await this.redis.setEx(key, ttlSeconds, serialized);
                } else {
                    await this.redis.set(key, serialized);
                }
            } catch (error) {
                logger.error('Cache: Redis SET failed', error);
                this.failureCount++;
                if (this.failureCount >= this.CIRCUIT_THRESHOLD) {
                    this.openCircuit();
                }
            }
        }
    }

    /**
     * Delete key from cache
     */
    async delete(key) {
        this.memoryCache.delete(key);

        if (this.shouldUseRedis()) {
            try {
                await this.redis.del(key);
            } catch (error) {
                logger.error('Cache: Redis DEL failed', error);
            }
        }
    }

    /**
     * Delete keys matching pattern
     */
    async deletePattern(pattern) {
        this.memoryCache.deletePattern(pattern);

        if (this.shouldUseRedis()) {
            try {
                const keys = await this.redis.keys(pattern);
                if (keys.length > 0) {
                    await this.redis.del(keys);
                }
            } catch (error) {
                logger.error('Cache: Redis pattern DEL failed', error);
            }
        }
    }

    /**
     * Get or set cache (cache-aside pattern)
     */
    async getOrSet(key, fetchFn, ttlSeconds = this.ttl.default) {
        // Try cache first
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }

        // Fetch and cache
        const value = await fetchFn();
        if (value !== null && value !== undefined) {
            await this.set(key, value, ttlSeconds);
        }
        return value;
    }

    /**
     * Invalidate course-related caches
     */
    async invalidateCourses() {
        await this.deletePattern(`${this.prefix}courses:*`);
        await this.deletePattern(`${this.prefix}categories:*`);
        logger.debug('Cache: Course caches invalidated');
    }

    /**
     * Invalidate user-related caches
     */
    async invalidateUser(userId) {
        await this.deletePattern(`${this.prefix}user:${userId}:*`);
        logger.debug(`Cache: User ${userId} caches invalidated`);
    }

    /**
     * Get cache stats
     */
    getStats() {
        return {
            redisConnected: this.redis?.isReady || false,
            circuitOpen: this.circuitOpen,
            memoryCacheSize: this.memoryCache.size(),
            failureCount: this.failureCount,
        };
    }

    /**
     * Close connections
     */
    async close() {
        if (this.redis) {
            await this.redis.quit();
            logger.info('Cache: Redis connection closed');
        }
        this.memoryCache.clear();
    }
}

// Singleton instance
const cacheService = new CacheService();

// Initialize on module load
cacheService.init().catch(err => {
    logger.warn('Cache: Initialization failed, using memory cache', err.message);
});

export default cacheService;

export const initRedis = () => cacheService.init();
export const closeRedis = () => cacheService.close();
