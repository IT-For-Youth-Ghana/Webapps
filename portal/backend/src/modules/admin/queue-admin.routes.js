/**
 * Queue Admin Routes
 * Admin endpoints for queue monitoring and management
 */

import { Router } from 'express';
import queueAdminController from './queue-admin.controller.js';
import { authenticate, requireRole } from '../shared/auth/auth.middleware.js';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireRole(['admin', 'super_admin']));

/**
 * @openapi
 * /admin/queues/health:
 *   get:
 *     tags:
 *       - Admin - Queues
 *     summary: Queue system health check
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Queue system status
 */
router.get('/health', queueAdminController.healthCheck);

/**
 * @openapi
 * /admin/queues/stats:
 *   get:
 *     tags:
 *       - Admin - Queues
 *     summary: Get all queue statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Queue statistics
 */
router.get('/stats', queueAdminController.getQueueStats);

/**
 * @openapi
 * /admin/queues/{name}/stats:
 *   get:
 *     tags:
 *       - Admin - Queues
 *     summary: Get specific queue statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Queue name (email, payment, sync, etc.)
 *     responses:
 *       200:
 *         description: Queue statistics
 */
router.get('/:name/stats', queueAdminController.getQueueStatsByName);

/**
 * @openapi
 * /admin/queues/{name}/jobs:
 *   get:
 *     tags:
 *       - Admin - Queues
 *     summary: Get jobs from a queue
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [waiting, active, completed, failed, delayed]
 *           default: waiting
 *       - in: query
 *         name: start
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: end
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get('/:name/jobs', queueAdminController.getQueueJobs);

/**
 * @openapi
 * /admin/queues/{name}/job/{jobId}:
 *   get:
 *     tags:
 *       - Admin - Queues
 *     summary: Get job details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job details
 */
router.get('/:name/job/:jobId', queueAdminController.getJobDetails);

/**
 * @openapi
 * /admin/queues/{name}/job/{jobId}/retry:
 *   post:
 *     tags:
 *       - Admin - Queues
 *     summary: Retry a failed job
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job retry initiated
 */
router.post('/:name/job/:jobId/retry', queueAdminController.retryJob);

/**
 * @openapi
 * /admin/queues/{name}/job/{jobId}:
 *   delete:
 *     tags:
 *       - Admin - Queues
 *     summary: Remove a job
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job removed
 */
router.delete('/:name/job/:jobId', queueAdminController.removeJob);

/**
 * @openapi
 * /admin/queues/{name}/pause:
 *   post:
 *     tags:
 *       - Admin - Queues
 *     summary: Pause a queue
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Queue paused
 */
router.post('/:name/pause', queueAdminController.pauseQueue);

/**
 * @openapi
 * /admin/queues/{name}/resume:
 *   post:
 *     tags:
 *       - Admin - Queues
 *     summary: Resume a queue
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Queue resumed
 */
router.post('/:name/resume', queueAdminController.resumeQueue);

/**
 * @openapi
 * /admin/queues/{name}/clean:
 *   post:
 *     tags:
 *       - Admin - Queues
 *     summary: Clean old jobs from queue
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               grace:
 *                 type: integer
 *                 description: Grace period in milliseconds
 *                 default: 86400000
 *               status:
 *                 type: string
 *                 enum: [completed, failed]
 *                 default: completed
 *     responses:
 *       200:
 *         description: Queue cleaned
 */
router.post('/:name/clean', queueAdminController.cleanQueue);

/**
 * @openapi
 * /admin/queues/{name}/jobs/retry-failed:
 *   post:
 *     tags:
 *       - Admin - Queues
 *     summary: Retry all failed jobs in a queue
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               limit:
 *                 type: integer
 *                 default: 100
 *     responses:
 *       200:
 *         description: Failed jobs retried
 */
router.post('/:name/jobs/retry-failed', queueAdminController.retryAllFailed);

export default router;
