/**
 * Dedicated Worker Entry Point
 * Starts the queue system without the HTTP server
 */

import { initializeQueues } from './index.js';
import { testConnection } from '../database/client.js';
import { initRedis } from '../config/redis.js';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import '../models/index.js';

async function startWorker() {
    try {
        logger.info('🚀 Starting dedicated worker process...');

        // 1. Database Connection
        logger.info('🔌 Connecting to database...');
        await testConnection();

        // 2. Redis Connection (optional)
        if (config.redis.enabled) {
            logger.info('🔌 Connecting to Redis...');
            await initRedis();
        }

        // 3. Initialize Queues (BullMQ)
        logger.info('🔌 Initializing queue system...');
        await initializeQueues();

        logger.info('✅ Worker process started successfully');

        // Handle signals for graceful shutdown
        const shutdown = async (signal) => {
            logger.info(`\n${signal} received, shutting down worker...`);
            // The process will naturally stop if PM2 sends SIGINT/SIGTERM
            // and we can add more cleanup here if needed.
            setTimeout(() => process.exit(0), 1000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

    } catch (error) {
        logger.error('❌ Failed to start worker process:', error);
        process.exit(1);
    }
}

startWorker();
