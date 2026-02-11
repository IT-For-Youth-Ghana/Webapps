/**
 * Server Entry Point
 * Starts the Express server and initializes database + queues
 */

import app from './app.js';
import config from './config/index.js';
import logger from './utils/logger.js';
import { testConnection, closeConnection, syncDatabase } from './database/client.js';
import './models/index.js';
import { initRedis, closeRedis } from './config/redis.js';
import emailService from './modules/shared/email/email.service.js';
import http from 'http';
import { initSocket, getIO } from './realtime/socket.js';
import { initializeQueues, shutdownQueues } from './queues/index.js';

const PORT = config.server.port;
const HOST = config.server.host;


/**
 * Start server
 */
async function startServer() {
    try {
        // Initialize database connection
        logger.info('🔌 Connecting to database...');
        await testConnection();

        // Initialize email service (non-blocking)
        logger.info('🔌 Initializing email service...');
        emailService.initialize().catch(err => {
            logger.error('❌ Email service initialization failed in background', err);
        });

        // Optional dev-time schema sync
        if (config.server.env !== 'production' && process.env.DB_SYNC === 'true') {
            const alter = process.env.DB_SYNC_ALTER === 'true';
            const force = process.env.DB_SYNC_FORCE === 'true';
            logger.warn(`⚠️  DB sync enabled (alter: ${alter}, force: ${force})`);
            if (!alter && !force) {
                logger.warn('⚠️  DB sync is a no-op (set DB_SYNC_ALTER=true or DB_SYNC_FORCE=true)');
                logger.warn('💡 Tip: Set DB_SYNC_FORCE=true to recreate tables or disable DB_SYNC to skip sync');
            } else {
                try {
                    await syncDatabase({ alter, force });
                } catch (syncError) {
                    logger.error('❌ Database sync failed, but continuing with existing schema', syncError);
                    logger.warn('⚠️  Server starting with potentially outdated schema');
                    logger.warn('💡 To fix: Run with DB_SYNC_FORCE=true to recreate tables (WILL LOSE DATA)');
                }
            }
        }

        // Initialize Redis (optional)
        if (config.redis.enabled) {
            logger.info('🔌 Connecting to Redis...');
            await initRedis();
        }

        // Initialize Queue System (BullMQ)
        logger.info('🔌 Initializing queue system...');
        await initializeQueues();

        // Initialize Moodle sync (optional)
        if (config.moodle?.enabled) {
            logger.info('🔄 Initializing Moodle sync...');
            try {
                // Import sync queue after queues are initialized
                const { default: syncQueue } = await import('./queues/services/sync.queue.js');
                await syncQueue.addInitialSyncJob();
                logger.info('✅ Initial Moodle sync job queued');
            } catch (error) {
                logger.warn('⚠️  Failed to queue initial Moodle sync, but continuing startup', error);
            }
        }

        // Start HTTP server + Socket.io
        const httpServer = http.createServer(app);
        initSocket(httpServer);

        const server = httpServer.listen(PORT, HOST, () => {
            logger.info('='.repeat(50));
            logger.info(`🚀 Server started successfully!`);
            logger.info(`📡 Environment: ${config.server.env}`);
            logger.info(`🌐 Server URL: http://${HOST}:${PORT}`);
            logger.info(`📚 API URL: http://${HOST}:${PORT}${config.server.apiPrefix}`);
            logger.info(`💚 Health Check: http://${HOST}:${PORT}/health`);
            logger.info(`📋 Queue Admin: http://${HOST}:${PORT}${config.server.apiPrefix}/admin/queues/stats`);
            logger.info('='.repeat(50));
        });

        // Graceful shutdown handlers
        const gracefulShutdown = async (signal) => {
            logger.info(`\n${signal} received, starting graceful shutdown...`);

            // Stop accepting new connections
            server.close(async () => {
                logger.info('✅ HTTP server closed');

                try {
                    // Shutdown queue system (stops workers, closes connections)
                    logger.info('🔄 Shutting down queue system...');
                    await shutdownQueues();

                    // Close Socket.io
                    const io = getIO();
                    if (io) {
                        io.close();
                        logger.info('✅ Socket.io closed');
                    }

                    // Close database connection
                    await closeConnection();

                    // Close Redis connection
                    if (config.redis.enabled) {
                        await closeRedis();
                    }

                    logger.info('✅ All connections closed successfully');
                    process.exit(0);
                } catch (error) {
                    logger.error('❌ Error during shutdown:', error);
                    process.exit(1);
                }
            });

            // Force shutdown after 30 seconds
            setTimeout(() => {
                logger.error('⚠️  Forced shutdown after timeout');
                process.exit(1);
            }, 30000);
        };

        // Listen for termination signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                logger.error(`❌ Port ${PORT} is already in use`);
            } else {
                logger.error('❌ Server error:', error);
            }
            process.exit(1);
        });

    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();
