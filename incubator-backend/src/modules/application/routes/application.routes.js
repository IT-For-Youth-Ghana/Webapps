/**
 * Application Routes
 * Defines all endpoints for job applications
 */

import { Router } from "express";
import { applicationController } from "../controller/application.controller.js";
import { authenticate, authorize } from "../../../middleware/auth.middleware.js";
import { validateRequest } from "../../../middleware/validation.middleware.js";
import ApplicationValidation from "../validation/application.validation.js";

const router = Router();

// ========================================
// PUBLIC ROUTES (No authentication required)
// ========================================
// None for applications - all require authentication

// ========================================
// PROTECTED ROUTES (Authentication required)
// ========================================

// All routes require authentication
router.use(authenticate);

// ========================================
// 1. STUDENT ROUTES
// ========================================

/**
 * @route   POST /api/applications
 * @desc    Submit job application
 * @access  Student
 */
router.post(
  "/",
  authorize("student"),
  validateRequest(ApplicationValidation.createApplicationSchema),
  applicationController.createApplication
);

/**
 * @route   GET /api/applications/me
 * @desc    Get current student's applications
 * @access  Student
 */
router.get(
  "/me",
  authorize("student"),
  applicationController.getMyApplications
);

/**
 * @route   PUT /api/applications/:id
 * @desc    Update application (before review)
 * @access  Student (own applications only)
 */
router.put(
  "/:id",
  authorize("student"),
  validateRequest(ApplicationValidation.updateApplicationSchema),
  applicationController.updateApplication
);

/**
 * @route   DELETE /api/applications/:id
 * @desc    Withdraw application
 * @access  Student (own applications only)
 */
router.delete(
  "/:id",
  authorize("student"),
  validateRequest(ApplicationValidation.withdrawApplicationSchema),
  applicationController.withdrawApplication
);

// ========================================
// 2. COMPANY ROUTES
// ========================================

/**
 * @route   GET /api/jobs/:jobId/applications
 * @desc    Get applications for a job
 * @access  Company (own jobs), Admin
 */
router.get(
  "/jobs/:jobId/applications",
  authorize("company", "admin"),
  applicationController.getJobApplications
);

/**
 * @route   PATCH /api/applications/:id/status
 * @desc    Update application status
 * @access  Company (own jobs), Admin
 */
router.patch(
  "/:id/status",
  authorize("company", "admin"),
  validateRequest(ApplicationValidation.updateStatusSchema),
  applicationController.updateApplicationStatus
);

/**
 * @route   PATCH /api/applications/bulk/status
 * @desc    Bulk update application statuses
 * @access  Company (own jobs), Admin
 */
router.patch(
  "/bulk/status",
  authorize("company", "admin"),
  validateRequest(ApplicationValidation.bulkUpdateStatusSchema),
  applicationController.bulkUpdateStatus
);

// ========================================
// 3. GENERAL ROUTES (All authenticated users)
// ========================================

/**
 * @route   GET /api/applications/statistics
 * @desc    Get application statistics
 * @access  Company (own jobs), Admin
 */
router.get(
  "/statistics",
  authorize("company", "admin"),
  validateRequest(ApplicationValidation.getStatisticsSchema),
  applicationController.getStatistics
);

/**
 * @route   GET /api/applications/:id
 * @desc    Get single application details
 * @access  Student (own), Company (own jobs), Admin
 */
router.get(
  "/:id",
  validateRequest(ApplicationValidation.getApplicationSchema),
  applicationController.getApplicationById
);

/**
 * @route   GET /api/applications
 * @desc    List/search applications
 * @access  Student (own), Company (own jobs), Admin (all)
 */
router.get(
  "/",
  validateRequest(ApplicationValidation.searchApplicationsSchema),
  applicationController.listApplications
);

// ========================================
// 4. ADMIN ROUTES
// ========================================

/**
 * @route   DELETE /api/applications/bulk
 * @desc    Bulk delete applications
 * @access  Admin only
 */
router.delete(
  "/bulk",
  authorize("admin"),
  validateRequest(ApplicationValidation.bulkDeleteSchema),
  applicationController.bulkDelete
);

export default router;