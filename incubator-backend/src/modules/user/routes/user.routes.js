/**
 * User Routes
 * Defines all user-related endpoints with proper authentication and authorization
 * Uses auth middleware (authenticate, authorize) for RBAC
 */

import { Router } from "express";
import userController from "../controller/user.controller.js";
import { authenticate, authorize } from "../../auth/middleware/auth.middleware.js";
import { ROLES } from "../../../utils/constants.js";
import { uploadProfilePhoto, handleUploadError } from "../../../utils/middleware/upload.middleware.js";

const router = Router();

// ========================================
// PUBLIC ROUTES (No authentication required)
// ========================================
// None for users - all endpoints require authentication

// ========================================
// AUTHENTICATED USER ROUTES (Self-access)
// ========================================

/**
 * @route   GET /api/users/me
 * @desc    Get current user's profile with role-specific details
 * @access  Private - Any authenticated user
 */
router.get("/me", authenticate, userController.getMyProfile);

/**
 * @route   PUT /api/users/me
 * @desc    Update current user's profile
 * @access  Private - Any authenticated user
 */
router.put("/me", authenticate, userController.updateMyProfile);

/**
 * @route   POST /api/users/me/photo
 * @desc    Upload profile photo for current user
 * @access  Private - Any authenticated user
 * @note    Multer middleware processes multipart/form-data with field name "photo"
 */
router.post(
  "/me/photo",
  authenticate,
  uploadProfilePhoto,
  handleUploadError,
  userController.uploadPhoto
);

/**
 * @route   DELETE /api/users/me
 * @desc    Soft delete current user's account
 * @access  Private - Any authenticated user
 */
router.delete("/me", authenticate, userController.deleteMyAccount);

// ========================================
// ADMIN-ONLY ROUTES (User Management)
// ========================================

/**
 * @route   GET /api/users
 * @desc    List all users with filters, pagination, and sorting
 * @access  Private - Admin only
 * @query   ?role=student&status=approved&page=1&limit=10&sort=-createdAt
 */
router.get(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  userController.listUsers
);

/**
 * @route   GET /api/users/search
 * @desc    Search users across all profiles (name, email, skills, etc.)
 * @access  Private - Admin or Company (for students)
 * @query   ?q=john&role=student&status=approved
 */
router.get(
  "/search",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.COMPANY),
  userController.searchUsers
);

/**
 * @route   GET /api/users/eligible
 * @desc    Get eligible users (approved and active)
 * @access  Private - Admin or Company
 */
router.get(
  "/eligible",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.COMPANY),
  userController.getEligibleUsers
);

/**
 * @route   GET /api/users/students
 * @desc    List all students with filters and pagination
 * @access  Private - Admin or Company
 * @query   ?status=approved&page=1&limit=10
 */
router.get(
  "/students",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.COMPANY),
  userController.listStudents
);

/**
 * @route   GET /api/users/companies
 * @desc    List all companies with filters and pagination
 * @access  Private - Admin only
 * @query   ?status=approved&page=1&limit=10
 */
router.get(
  "/companies",
  authenticate,
  authorize(ROLES.ADMIN),
  userController.listCompanies
);

/**
 * @route   GET /api/users/admins
 * @desc    List all admins with filters and pagination
 * @access  Private - Super Admin only (extend with permissions check)
 * @query   ?is_active=true&page=1&limit=10
 */
router.get(
  "/admins",
  authenticate,
  authorize(ROLES.ADMIN),
  userController.listAdmins
);

// ========================================
// BULK OPERATIONS (Admin only)
// ========================================

/**
 * @route   POST /api/users/bulk/approve
 * @desc    Approve multiple users at once
 * @access  Private - Admin only
 * @body    { userIds: ["id1", "id2", "id3"] }
 */
router.post(
  "/bulk/approve",
  authenticate,
  authorize(ROLES.ADMIN),
  userController.bulkApproveUsers
);

// ========================================
// INDIVIDUAL USER ROUTES (by ID)
// ========================================

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID with full profile
 * @access  Private - Admin or self
 */
router.get("/:id", authenticate, userController.getUserById);

/**
 * @route   GET /api/users/:id/stats
 * @desc    Get user statistics (applications, jobs, etc.)
 * @access  Private - Admin or self
 */
router.get("/:id/stats", authenticate, userController.getUserStats);

/**
 * @route   POST /api/users/:id/approve
 * @desc    Approve a pending user
 * @access  Private - Admin only
 */
router.post(
  "/:id/approve",
  authenticate,
  authorize(ROLES.ADMIN),
  userController.approveUser
);

/**
 * @route   POST /api/users/:id/reject
 * @desc    Reject a pending user (with optional reason)
 * @access  Private - Admin only
 * @body    { reason?: "Not qualified" }
 */
router.post(
  "/:id/reject",
  authenticate,
  authorize(ROLES.ADMIN),
  userController.rejectUser
);

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Activate or deactivate a user
 * @access  Private - Admin only
 * @body    { is_active: true|false }
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize(ROLES.ADMIN),
  userController.setUserStatus
);

/**
 * @route   POST /api/users/:id/restore
 * @desc    Restore a soft-deleted user
 * @access  Private - Admin only
 */
router.post(
  "/:id/restore",
  authenticate,
  authorize(ROLES.ADMIN),
  userController.restoreUser
);

/**
 * @route   DELETE /api/users/:id/force
 * @desc    Permanently delete a user (irreversible)
 * @access  Private - Super Admin only
 * @note    This should be heavily restricted - consider additional checks
 */
router.delete(
  "/:id/force",
  authenticate,
  authorize(ROLES.ADMIN),
  // TODO: Add requirePermission("super_admin") middleware
  userController.forceDeleteUser
);

export default router;
