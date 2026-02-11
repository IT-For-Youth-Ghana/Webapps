/**
 * Queue Manager
 * Initializes and manages all BullMQ queues and workers
 */

import { Queue, Worker, QueueEvents } from 'bullmq';
import logger from '../utils/logger.js';
import { queueOptions, workerConcurrency, rateLimits } from './config.js';

class QueueManager {
    constructor() {
        this.queues = {};
        this.workers = {};
        this.queueEvents = {};
        this.processors = {};
        this.isInitialized = false;
    }

    /**
     * Register a job processor
     */
    registerProcessor(queueName, processor) {
        this.processors[queueName] = processor;
        logger.debug(`Processor registered for queue: ${queueName}`);
    }

    /**
     * Create a queue
     */
    createQueue(name) {
        if (this.queues[name]) {
            return this.queues[name];
        }

        const options = queueOptions[name] || queueOptions.defaultQueueOptions;
        
        // Add rate limiting if configured
        if (rateLimits[name]) {
            options.limiter = rateLimits[name];
        }

        this.queues[name] = new Queue(name, options);
        
        logger.info(`✅ Queue created: ${name}`);
        
        return this.queues[name];
    }

    /**
     * Create a worker for a queue
     */
    createWorker(name) {
        if (!this.processors[name]) {
            throw new Error(`No processor registered for queue: ${name}`);
        }

        if (this.workers[name]) {
            return this.workers[name];
        }

        const options = queueOptions[name] || queueOptions.defaultQueueOptions;
        const concurrency = workerConcurrency[name] || 1;

        this.workers[name] = new Worker(
            name,
            this.processors[name],
            {
                ...options,
                concurrency,
                autorun: true,
            }
        );

        // Setup worker event listeners
        this.setupWorkerEvents(name);

        logger.info(`✅ Worker created: ${name} (concurrency: ${concurrency})`);

        return this.workers[name];
    }

    /**
     * Setup worker event listeners
     */
    setupWorkerEvents(name) {
        const worker = this.workers[name];

        worker.on('completed', (job) => {
            logger.debug(`Job completed: ${name}#${job.id}`, {
                jobName: job.name,
                duration: Date.now() - job.timestamp,
            });
        });

        worker.on('failed', (job, err) => {
            logger.error(`Job failed: ${name}#${job?.id}`, {
                jobName: job?.name,
                error: err.message,
                attemptsMade: job?.attemptsMade,
                attemptsLimit: job?.opts?.attempts,
                stack: err.stack,
            });
        });

        worker.on('error', (err) => {
            logger.error(`Worker error: ${name}`, {
                error: err.message,
                stack: err.stack,
            });
        });

        worker.on('stalled', (jobId) => {
            logger.warn(`Job stalled: ${name}#${jobId}`);
        });
    }

    /**
     * Create queue events listener
     */
    createQueueEvents(name) {
        if (this.queueEvents[name]) {
            return this.queueEvents[name];
        }

        const options = queueOptions[name] || queueOptions.defaultQueueOptions;
        
        this.queueEvents[name] = new QueueEvents(name, {
            connection: options.connection,
        });

        // Setup event listeners
        this.setupQueueEvents(name);

        logger.info(`✅ Queue events listener created: ${name}`);

        return this.queueEvents[name];
    }

    /**
     * Setup queue event listeners
     */
    setupQueueEvents(name) {
        const events = this.queueEvents[name];

        events.on('waiting', ({ jobId }) => {
            logger.debug(`Job waiting: ${name}#${jobId}`);
        });

        events.on('active', ({ jobId }) => {
            logger.debug(`Job active: ${name}#${jobId}`);
        });

        events.on('progress', ({ jobId, data }) => {
            logger.debug(`Job progress: ${name}#${jobId}`, { progress: data });
        });

        events.on('completed', ({ jobId, returnvalue }) => {
            logger.debug(`Job completed event: ${name}#${jobId}`);
        });

        events.on('failed', ({ jobId, failedReason }) => {
            logger.error(`Job failed event: ${name}#${jobId}`, {
                reason: failedReason,
            });
        });
    }

    /**
     * Initialize all queues and workers
     */
    async initialize() {
        if (this.isInitialized) {
            logger.warn('Queue manager already initialized');
            return;
        }

        try {
            logger.info('🔄 Initializing queue manager...');

            // Create queues
            const queueNames = Object.keys(this.processors);
            
            for (const name of queueNames) {
                this.createQueue(name);
                this.createWorker(name);
                this.createQueueEvents(name);
            }

            this.isInitialized = true;
            
            logger.info(`✅ Queue manager initialized with ${queueNames.length} queues`);
            logger.info(`📋 Active queues: ${queueNames.join(', ')}`);
        } catch (error) {
            logger.error('Failed to initialize queue manager', error);
            throw error;
        }
    }

    /**
     * Get a queue by name
     */
    getQueue(name) {
        if (!this.queues[name]) {
            throw new Error(`Queue not found: ${name}`);
        }
        return this.queues[name];
    }

    /**
     * Add a job to a queue
     */
    async addJob(queueName, jobName, data, options = {}) {
        const queue = this.getQueue(queueName);
        
        try {
            const job = await queue.add(jobName, data, options);
            
            logger.debug(`Job added: ${queueName}#${job.id}`, {
                jobName,
                jobId: job.id,
            });
            
            return job;
        } catch (error) {
            logger.error(`Failed to add job to queue: ${queueName}`, {
                jobName,
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Add a repeatable job (scheduled)
     */
    async addRepeatable(queueName, jobName, data, cronExpression, options = {}) {
        const queue = this.getQueue(queueName);
        
        try {
            const job = await queue.add(jobName, data, {
                ...options,
                repeat: {
                    pattern: cronExpression,
                },
            });
            
            logger.info(`Repeatable job added: ${queueName}#${jobName}`, {
                cron: cronExpression,
            });
            
            return job;
        } catch (error) {
            logger.error(`Failed to add repeatable job: ${queueName}`, {
                jobName,
                error: error.message,
            });
            throw error;
        }
    }

    /**
     * Get queue statistics
     */
    async getQueueStats(name) {
        const queue = this.queues[name];
        
        if (!queue) {
            throw new Error(`Queue not found: ${name}`);
        }

        const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
            queue.getWaitingCount(),
            queue.getActiveCount(),
            queue.getCompletedCount(),
            queue.getFailedCount(),
            queue.getDelayedCount(),
            queue.isPaused(),
        ]);

        return {
            name,
            waiting,
            active,
            completed,
            failed,
            delayed,
            paused,
            total: waiting + active + completed + failed + delayed,
        };
    }

    /**
     * Get all queue statistics
     */
    async getAllStats() {
        const stats = {};
        
        for (const name of Object.keys(this.queues)) {
            stats[name] = await this.getQueueStats(name);
        }
        
        return stats;
    }

    /**
     * Pause a queue
     */
    async pauseQueue(name) {
        const queue = this.queues[name];
        if (queue) {
            await queue.pause();
            logger.info(`Queue paused: ${name}`);
        }
    }

    /**
     * Resume a queue
     */
    async resumeQueue(name) {
        const queue = this.queues[name];
        if (queue) {
            await queue.resume();
            logger.info(`Queue resumed: ${name}`);
        }
    }

    /**
     * Clean old jobs from a queue
     */
    async cleanQueue(name, grace = 24 * 3600 * 1000, status = 'completed') {
        const queue = this.queues[name];
        if (queue) {
            const jobs = await queue.clean(grace, 1000, status);
            logger.info(`Queue cleaned: ${name}`, {
                status,
                removed: jobs.length,
            });
            return jobs;
        }
    }

    /**
     * Graceful shutdown
     */
    async shutdown() {
        logger.info('🔄 Shutting down queue manager...');

        try {
            // Close all workers
            for (const [name, worker] of Object.entries(this.workers)) {
                await worker.close();
                logger.info(`Worker closed: ${name}`);
            }

            // Close all queue events
            for (const [name, events] of Object.entries(this.queueEvents)) {
                await events.close();
                logger.info(`Queue events closed: ${name}`);
            }

            // Close all queues
            for (const [name, queue] of Object.entries(this.queues)) {
                await queue.close();
                logger.info(`Queue closed: ${name}`);
            }

            this.isInitialized = false;
            logger.info('✅ Queue manager shutdown complete');
        } catch (error) {
            logger.error('Error during queue manager shutdown', error);
            throw error;
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const stats = await this.getAllStats();
            const unhealthy = [];

            for (const [name, stat] of Object.entries(stats)) {
                if (stat.failed > 100) {
                    unhealthy.push(`${name}: ${stat.failed} failed jobs`);
                }
                if (stat.waiting > 1000) {
                    unhealthy.push(`${name}: ${stat.waiting} waiting jobs`);
                }
            }

            return {
                healthy: unhealthy.length === 0,
                issues: unhealthy,
                stats,
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message,
            };
        }
    }
}

// Singleton instance
const queueManager = new QueueManager();

export default queueManager;
