/**
 * Queue Admin Controller
 * Admin endpoints for monitoring and managing job queues
 */

import queueManager from '../../queues/manager.js';
import { successResponse } from '../../utils/response.js';
import asyncHandler from '../../utils/asyncHandler.js';
import logger from '../../utils/logger.js';

class QueueAdminController {
    /**
     * GET /api/admin/queues/stats
     * Get statistics for all queues
     */
    getQueueStats = asyncHandler(async (req, res) => {
        const stats = await queueManager.getAllStats();

        return successResponse(res, {
            statusCode: 200,
            message: 'Queue statistics retrieved successfully',
            data: stats,
        });
    });

    /**
     * GET /api/admin/queues/:name/stats
     * Get statistics for a specific queue
     */
    getQueueStatsByName = asyncHandler(async (req, res) => {
        const { name } = req.params;

        const stats = await queueManager.getQueueStats(name);

        return successResponse(res, {
            statusCode: 200,
            message: `Queue statistics retrieved for ${name}`,
            data: stats,
        });
    });

    /**
     * GET /api/admin/queues/:name/jobs
     * Get jobs from a specific queue
     */
    getQueueJobs = asyncHandler(async (req, res) => {
        const { name } = req.params;
        const { status = 'waiting', start = 0, end = 10 } = req.query;

        const queue = queueManager.getQueue(name);

        let jobs = [];

        switch (status) {
            case 'waiting':
                jobs = await queue.getWaiting(parseInt(start), parseInt(end));
                break;
            case 'active':
                jobs = await queue.getActive(parseInt(start), parseInt(end));
                break;
            case 'completed':
                jobs = await queue.getCompleted(parseInt(start), parseInt(end));
                break;
            case 'failed':
                jobs = await queue.getFailed(parseInt(start), parseInt(end));
                break;
            case 'delayed':
                jobs = await queue.getDelayed(parseInt(start), parseInt(end));
                break;
            default:
                jobs = await queue.getJobs([status], parseInt(start), parseInt(end));
        }

        // Format jobs for response
        const formattedJobs = jobs.map(job => ({
            id: job.id,
            name: job.name,
            data: job.data,
            progress: job.progress,
            attemptsMade: job.attemptsMade,
            failedReason: job.failedReason,
            stacktrace: job.stacktrace,
            returnvalue: job.returnvalue,
            finishedOn: job.finishedOn,
            processedOn: job.processedOn,
            timestamp: job.timestamp,
        }));

        return successResponse(res, {
            statusCode: 200,
            message: `Jobs retrieved for ${name} queue`,
            data: {
                queue: name,
                status,
                jobs: formattedJobs,
                total: formattedJobs.length,
            },
        });
    });

    /**
     * GET /api/admin/queues/:name/job/:jobId
     * Get specific job details
     */
    getJobDetails = asyncHandler(async (req, res) => {
        const { name, jobId } = req.params;

        const queue = queueManager.getQueue(name);
        const job = await queue.getJob(jobId);

        if (!job) {
            return successResponse(res, {
                statusCode: 404,
                message: 'Job not found',
                data: null,
            });
        }

        const state = await job.getState();

        return successResponse(res, {
            statusCode: 200,
            message: 'Job details retrieved successfully',
            data: {
                id: job.id,
                name: job.name,
                data: job.data,
                opts: job.opts,
                progress: job.progress,
                attemptsMade: job.attemptsMade,
                failedReason: job.failedReason,
                stacktrace: job.stacktrace,
                returnvalue: job.returnvalue,
                finishedOn: job.finishedOn,
                processedOn: job.processedOn,
                timestamp: job.timestamp,
                state,
            },
        });
    });

    /**
     * POST /api/admin/queues/:name/job/:jobId/retry
     * Retry a failed job
     */
    retryJob = asyncHandler(async (req, res) => {
        const { name, jobId } = req.params;

        const queue = queueManager.getQueue(name);
        const job = await queue.getJob(jobId);

        if (!job) {
            return successResponse(res, {
                statusCode: 404,
                message: 'Job not found',
                data: null,
            });
        }

        await job.retry();

        logger.info(`Job retried by admin: ${name}#${jobId}`, { adminId: req.userId });

        return successResponse(res, {
            statusCode: 200,
            message: 'Job retry initiated',
            data: { jobId, retried: true },
        });
    });

    /**
     * DELETE /api/admin/queues/:name/job/:jobId
     * Remove a job from the queue
     */
    removeJob = asyncHandler(async (req, res) => {
        const { name, jobId } = req.params;

        const queue = queueManager.getQueue(name);
        const job = await queue.getJob(jobId);

        if (!job) {
            return successResponse(res, {
                statusCode: 404,
                message: 'Job not found',
                data: null,
            });
        }

        await job.remove();

        logger.info(`Job removed by admin: ${name}#${jobId}`, { adminId: req.userId });

        return successResponse(res, {
            statusCode: 200,
            message: 'Job removed successfully',
            data: { jobId, removed: true },
        });
    });

    /**
     * POST /api/admin/queues/:name/pause
     * Pause a queue
     */
    pauseQueue = asyncHandler(async (req, res) => {
        const { name } = req.params;

        await queueManager.pauseQueue(name);

        logger.info(`Queue paused by admin: ${name}`, { adminId: req.userId });

        return successResponse(res, {
            statusCode: 200,
            message: `Queue ${name} paused successfully`,
        });
    });

    /**
     * POST /api/admin/queues/:name/resume
     * Resume a paused queue
     */
    resumeQueue = asyncHandler(async (req, res) => {
        const { name } = req.params;

        await queueManager.resumeQueue(name);

        logger.info(`Queue resumed by admin: ${name}`, { adminId: req.userId });

        return successResponse(res, {
            statusCode: 200,
            message: `Queue ${name} resumed successfully`,
        });
    });

    /**
     * POST /api/admin/queues/:name/clean
     * Clean old jobs from a queue
     */
    cleanQueue = asyncHandler(async (req, res) => {
        const { name } = req.params;
        const { grace = 86400000, status = 'completed' } = req.body; // 24 hours default

        const jobs = await queueManager.cleanQueue(name, parseInt(grace), status);

        logger.info(`Queue cleaned by admin: ${name}`, {
            adminId: req.userId,
            removed: jobs.length,
            status,
        });

        return successResponse(res, {
            statusCode: 200,
            message: `Queue ${name} cleaned successfully`,
            data: {
                removed: jobs.length,
                status,
            },
        });
    });

    /**
     * GET /api/admin/queues/health
     * Health check for queue system
     */
    healthCheck = asyncHandler(async (req, res) => {
        const health = await queueManager.healthCheck();

        return successResponse(res, {
            statusCode: health.healthy ? 200 : 503,
            message: health.healthy ? 'Queue system healthy' : 'Queue system unhealthy',
            data: health,
        });
    });

    /**
     * POST /api/admin/queues/:name/jobs/retry-failed
     * Retry all failed jobs in a queue
     */
    retryAllFailed = asyncHandler(async (req, res) => {
        const { name } = req.params;
        const { limit = 100 } = req.body;

        const queue = queueManager.getQueue(name);
        const failedJobs = await queue.getFailed(0, parseInt(limit));

        let retried = 0;
        for (const job of failedJobs) {
            try {
                await job.retry();
                retried++;
            } catch (error) {
                logger.error(`Failed to retry job ${job.id}`, error);
            }
        }

        logger.info(`Bulk retry initiated by admin: ${name}`, {
            adminId: req.userId,
            total: failedJobs.length,
            retried,
        });

        return successResponse(res, {
            statusCode: 200,
            message: `Retried ${retried} failed jobs`,
            data: {
                total: failedJobs.length,
                retried,
                failed: failedJobs.length - retried,
            },
        });
    });
}

export default new QueueAdminController();
