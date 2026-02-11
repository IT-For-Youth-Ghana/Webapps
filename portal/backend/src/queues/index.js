/**
 * Queue System Initialization
 * Registers all processors and initializes the queue manager
 */

import queueManager from './manager.js';
import { emailProcessor } from './processors/email.processor.js';
import { paymentProcessor } from './processors/payment.processor.js';
import { enrollmentProcessor } from './processors/enrollment.processor.js';
import { syncProcessor } from './processors/sync.processor.js';
import paymentQueue from './services/payment.queue.js';
import syncQueue from './services/sync.queue.js';
import logger from '../utils/logger.js';

/**
 * Register all queue processors
 */
export function registerProcessors() {
    logger.info('Registering queue processors...');

    // Register email processor
    queueManager.registerProcessor('email', emailProcessor);

    // Register payment processor
    queueManager.registerProcessor('payment', paymentProcessor);

    // Register enrollment processor
    queueManager.registerProcessor('enrollment', enrollmentProcessor);

    // Register sync processor
    queueManager.registerProcessor('sync', syncProcessor);

    logger.info('✅ Queue processors registered (email, payment, enrollment, sync)');

    logger.info('✅ Queue processors registered (email, payment, enrollment)');
}

/**
 * Schedule recurring jobs
 */
export async function scheduleRecurringJobs() {
    logger.info('⏰ Scheduling recurring jobs...');

    try {
        // Schedule pending payment polling (every 15 minutes)
        await paymentQueue.schedulePendingPaymentPolling();

        // Schedule abandoned payment cleanup (daily at 2 AM)
        await paymentQueue.scheduleAbandonedPaymentCleanup();

        // Schedule periodic Moodle sync (every 1 minute)
        await syncQueue.schedulePeriodicSync();

        logger.info('✅ Recurring jobs scheduled');
    } catch (error) {
        logger.error('❌ Failed to schedule recurring jobs:', error);
        // Don't throw - recurring jobs are not critical for startup
    }
}

/**
 * Initialize the queue system
 */
export async function initializeQueues() {
    try {
        logger.info('🚀 Initializing queue system...');

        // Register all processors first
        registerProcessors();

        // Initialize queue manager (creates queues and workers)
        await queueManager.initialize();

        // Schedule recurring jobs
        await scheduleRecurringJobs();

        logger.info('✅ Queue system initialized successfully');

        return queueManager;
    } catch (error) {
        logger.error('❌ Failed to initialize queue system', error);
        throw error;
    }
}

/**
 * Shutdown the queue system gracefully
 */
export async function shutdownQueues() {
    try {
        logger.info('Shutting down queue system...');
        await queueManager.shutdown();
        logger.info('✅ Queue system shut down successfully');
    } catch (error) {
        logger.error('Error shutting down queue system', error);
        throw error;
    }
}

/**
 * Get queue manager instance
 */
export function getQueueManager() {
    return queueManager;
}

// Export queue services for easy access
export { default as emailQueue } from './services/email.queue.js';
export { default as paymentQueue } from './services/payment.queue.js';
export { default as enrollmentQueue } from './services/enrollment.queue.js';

export default {
    initialize: initializeQueues,
    shutdown: shutdownQueues,
    manager: queueManager,
};