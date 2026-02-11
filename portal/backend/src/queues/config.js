/**
 * BullMQ Queue Configuration
 * Centralized configuration for all job queues
 */

import config from '../config/index.js';

/**
 * Redis connection configuration for BullMQ
 */
export const redisConnection = {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined,
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
};

/**
 * Default queue options
 */
export const defaultQueueOptions = {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000, // Start with 2 seconds
        },
        removeOnComplete: {
            age: 24 * 3600, // Keep completed jobs for 24 hours
            count: 1000, // Keep max 1000 completed jobs
        },
        removeOnFail: {
            age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
    },
};

/**
 * Queue-specific options
 */
export const queueOptions = {
    email: {
        ...defaultQueueOptions,
        defaultJobOptions: {
            ...defaultQueueOptions.defaultJobOptions,
            attempts: 5, // More retries for emails
            priority: 1, // Higher priority
            backoff: {
                type: 'exponential',
                delay: 5000, // 5 seconds
            },
        },
    },
    
    sync: {
        ...defaultQueueOptions,
        defaultJobOptions: {
            ...defaultQueueOptions.defaultJobOptions,
            attempts: 3,
            priority: 5, // Lower priority (higher number = lower priority)
            timeout: 60000, // 1 minute timeout
        },
    },
    
    payment: {
        ...defaultQueueOptions,
        defaultJobOptions: {
            ...defaultQueueOptions.defaultJobOptions,
            attempts: 5,
            priority: 2, // High priority
            backoff: {
                type: 'fixed',
                delay: 30000, // 30 seconds between retries
            },
        },
    },
    
    enrollment: {
        ...defaultQueueOptions,
        defaultJobOptions: {
            ...defaultQueueOptions.defaultJobOptions,
            attempts: 4,
            priority: 2,
        },
    },
    
    notification: {
        ...defaultQueueOptions,
        defaultJobOptions: {
            ...defaultQueueOptions.defaultJobOptions,
            attempts: 3,
            priority: 3,
        },
    },
    
    cleanup: {
        ...defaultQueueOptions,
        defaultJobOptions: {
            ...defaultQueueOptions.defaultJobOptions,
            attempts: 2,
            priority: 10, // Lowest priority
        },
    },
};

/**
 * Worker concurrency settings
 */
export const workerConcurrency = {
    email: parseInt(process.env.EMAIL_QUEUE_CONCURRENCY) || 5,
    sync: parseInt(process.env.SYNC_QUEUE_CONCURRENCY) || 2,
    payment: parseInt(process.env.PAYMENT_QUEUE_CONCURRENCY) || 3,
    enrollment: parseInt(process.env.ENROLLMENT_QUEUE_CONCURRENCY) || 3,
    notification: parseInt(process.env.NOTIFICATION_QUEUE_CONCURRENCY) || 5,
    cleanup: parseInt(process.env.CLEANUP_QUEUE_CONCURRENCY) || 1,
};

/**
 * Rate limiting configuration (jobs per time window)
 */
export const rateLimits = {
    email: {
        max: 50, // Max 50 emails
        duration: 60000, // Per minute
    },
    sync: {
        max: 10,
        duration: 60000,
    },
};
