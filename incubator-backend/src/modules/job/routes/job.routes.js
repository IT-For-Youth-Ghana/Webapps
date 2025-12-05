/**
 * Job Routes
 * Defines all job-related API endpoints
 */

import express from "express";
import jobController from "../controller/job.controller";
import {
  authenticate,
  authorize,
} from "../../auth/middleware/auth.middleware";
import { ROLES } from "../../../utils/constants";

const router = express.Router();

// ========================================
// PUBLIC ROUTES (No authentication required)
// ========================================

// Featured and trending jobs (must be before /:id to avoid conflicts)
router.get("/featured", jobController.getFeaturedJobs);
router.get("/recent", jobController.getRecentJobs);
router.get("/trending", jobController.getTrendingJobs);

// Search and filter
router.get("/search", jobController.searchJobs);
router.get("/filter", jobController.filterJobs);

// Get job by slug (must be before /:id)
router.get("/slug/:slug", jobController.getJobBySlug);

// List all active jobs
router.get("/", jobController.listActiveJobs);

// Get job by ID (must be after specific routes to avoid conflicts)
router.get("/:id", jobController.getJobById);

// ========================================
// COMPANY ROUTES (Authentication required)
// ========================================

// My jobs management
router.get(
  "/my-jobs",
  authenticate,
  authorize(ROLES.COMPANY),
  jobController.getMyJobs
);

router.get(
  "/my-jobs/stats",
  authenticate,
  authorize(ROLES.COMPANY),
  jobController.getMyJobStats
);

// Create job
router.post(
  "/",
  authenticate,
  authorize(ROLES.COMPANY),
  jobController.createJob
);

// Job status management
router.post(
  "/:id/publish",
  authenticate,
  authorize(ROLES.COMPANY),
  jobController.publishJob
);

router.post(
  "/:id/close",
  authenticate,
  authorize(ROLES.COMPANY),
  jobController.closeJob
);

router.post(
  "/:id/pause",
  authenticate,
  authorize(ROLES.COMPANY),
  jobController.pauseJob
);

// Update and delete
router.put(
  "/:id",
  authenticate,
  authorize(ROLES.COMPANY),
  jobController.updateJob
);

router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.COMPANY),
  jobController.deleteJob
);

// Analytics
router.get(
  "/:id/analytics",
  authenticate,
  authorize(ROLES.COMPANY),
  jobController.getJobAnalytics
);

// Bulk operations
router.post(
  "/bulk-update",
  authenticate,
  authorize(ROLES.COMPANY),
  jobController.bulkUpdateStatus
);

// ========================================
// ADMIN ROUTES
// ========================================

router.get(
  "/platform-stats",
  authenticate,
  authorize(ROLES.ADMIN),
  jobController.getPlatformStats
);

export default router;