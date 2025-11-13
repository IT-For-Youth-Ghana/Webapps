/**
 * User Controller
 * Handles HTTP requests for user profile management and admin operations
 * Uses UserService for business logic
 * RBAC via auth.middleware: protectRoute, requireRole
 */

import BaseController from "../../shared/base.controller.js";
import userService from "../service/user.service.js";

class UserController extends BaseController {
  constructor() {
    super({ user: userService });
  }

  // ========================================
  // 1. PROFILE MANAGEMENT (Student/Company/Admin)
  // ========================================

  /**
   * Get current user's profile
   * GET /api/users/me
   * @auth Required - Any authenticated user
   */
  getMyProfile = this.asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const result = await this.service("user").getMyProfile(userId);

    if (!result.success) {
      return this.notFound(res, result.error.message);
    }

    return this.success(res, result.data);
  });

  /**
   * Update current user's profile
   * PUT /api/users/me
   * @auth Required - Any authenticated user
   */
  updateMyProfile = this.asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const updates = req.body;

    const result = await this.service("user").updateMyProfile(userId, updates);

    if (!result.success) {
      if (result.error.message.includes("Validation")) {
        return this.validationError(res, result.error.message);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, "Profile updated successfully");
  });

  /**
   * Upload user photo
   * POST /api/users/me/photo
   * @auth Required - Any authenticated user
   */
  uploadPhoto = this.asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const file = req.file;

    if (!file) {
      return this.badRequest(res, "No file uploaded");
    }

    const result = await this.service("user").uploadPhoto(userId, file);

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, result.data, "Photo uploaded successfully");
  });

  /**
   * Delete current user's account (soft delete)
   * DELETE /api/users/me
   * @auth Required - Any authenticated user
   */
  deleteMyAccount = this.asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const result = await this.service("user").deleteMyAccount(userId);

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, result.data, "Account deleted successfully");
  });

  // ========================================
  // 2. ADMIN USER MANAGEMENT
  // ========================================

  /**
   * List all users with filters and pagination
   * GET /api/users?role=student&status=approved&page=1&limit=10
   * @auth Required - Admin only
   */
  listUsers = this.asyncHandler(async (req, res) => {
    const { page, limit } = this.getPagination(req);
    const filters = this.getFilters(req, [
      "role",
      "status",
      "is_active",
      "email_verified",
    ]);
    const sort = this.getSort(req);
    const select = this.getSelect(req);

    const result = await this.service("user").listUsers(
      filters,
      { page, limit },
      { sort, select }
    );

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.paginated(
      res,
      result.data.data,
      result.data.metadata.page,
      result.data.metadata.limit,
      result.data.metadata.total
    );
  });

  /**
   * List students only
   * GET /api/users/students?status=approved&page=1
   * @auth Required - Admin or Company
   */
  listStudents = this.asyncHandler(async (req, res) => {
    const { page, limit } = this.getPagination(req);
    const filters = {
      ...this.getFilters(req, ["status", "is_active", "email_verified"]),
      role: "student",
    };
    const sort = this.getSort(req);

    const result = await this.service("user").listUsers(
      filters,
      { page, limit },
      { sort }
    );

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.paginated(
      res,
      result.data.data,
      result.data.metadata.page,
      result.data.metadata.limit,
      result.data.metadata.total
    );
  });

  /**
   * List companies only
   * GET /api/users/companies?status=approved&page=1
   * @auth Required - Admin
   */
  listCompanies = this.asyncHandler(async (req, res) => {
    const { page, limit } = this.getPagination(req);
    const filters = {
      ...this.getFilters(req, ["status", "is_active"]),
      role: "company",
    };
    const sort = this.getSort(req);

    const result = await this.service("user").listUsers(
      filters,
      { page, limit },
      { sort }
    );

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.paginated(
      res,
      result.data.data,
      result.data.metadata.page,
      result.data.metadata.limit,
      result.data.metadata.total
    );
  });

  /**
   * List admins only
   * GET /api/users/admins?page=1
   * @auth Required - Super Admin
   */
  listAdmins = this.asyncHandler(async (req, res) => {
    const { page, limit } = this.getPagination(req);
    const filters = {
      ...this.getFilters(req, ["is_active"]),
      role: "admin",
    };
    const sort = this.getSort(req);

    const result = await this.service("user").listUsers(
      filters,
      { page, limit },
      { sort }
    );

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.paginated(
      res,
      result.data.data,
      result.data.metadata.page,
      result.data.metadata.limit,
      result.data.metadata.total
    );
  });

  /**
   * Get user by ID (with profile)
   * GET /api/users/:id
   * @auth Required - Admin or self
   */
  getUserById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.user._id.toString();

    // Check if user is accessing their own profile or is admin
    if (id !== currentUserId && req.user.role !== "admin") {
      return this.forbidden(res, "You can only access your own profile");
    }

    const result = await this.service("user").getUserById(id);

    if (!result.success) {
      return this.notFound(res, result.error.message);
    }

    return this.success(res, result.data);
  });

  /**
   * Approve user (admin action)
   * POST /api/users/:id/approve
   * @auth Required - Admin only
   */
  approveUser = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await this.service("user").approveUser(id);

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, result.data, "User approved successfully");
  });

  /**
   * Reject user (admin action)
   * POST /api/users/:id/reject
   * @auth Required - Admin only
   */
  rejectUser = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await this.service("user").rejectUser(id, reason);

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, result.data, "User rejected successfully");
  });

  /**
   * Deactivate/Activate user
   * PATCH /api/users/:id/status
   * @auth Required - Admin only
   */
  setUserStatus = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== "boolean") {
      return this.badRequest(res, "is_active must be a boolean");
    }

    const result = await this.service("user").setUserActiveStatus(
      id,
      is_active
    );

    if (!result.success) {
      return this.error(res, result.error);
    }

    const message = is_active
      ? "User activated successfully"
      : "User deactivated successfully";
    return this.success(res, result.data, message);
  });

  /**
   * Force delete user (permanent delete)
   * DELETE /api/users/:id/force
   * @auth Required - Super Admin only
   */
  forceDeleteUser = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await this.service("user").forceDeleteUser(id);

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, result.data, "User permanently deleted");
  });

  /**
   * Restore soft-deleted user
   * POST /api/users/:id/restore
   * @auth Required - Admin only
   */
  restoreUser = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await this.service("user").restoreUser(id);

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, result.data, "User restored successfully");
  });

  // ========================================
  // 3. BULK OPERATIONS
  // ========================================

  /**
   * Bulk approve users
   * POST /api/users/bulk/approve
   * @auth Required - Admin only
   */
  bulkApproveUsers = this.asyncHandler(async (req, res) => {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return this.badRequest(res, "userIds must be a non-empty array");
    }

    const result = await this.service("user").bulkApproveUsers(userIds);

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, result.data, "Users approved successfully");
  });

  // ========================================
  // 4. SEARCH & FILTER
  // ========================================

  /**
   * Search users across all profiles
   * GET /api/users/search?q=john&role=student
   * @auth Required - Admin or Company (for students)
   */
  searchUsers = this.asyncHandler(async (req, res) => {
    const { q: searchTerm } = req.query;
    const { page, limit } = this.getPagination(req);
    const filters = this.getFilters(req, ["role", "status"]);

    if (!searchTerm || searchTerm.trim().length < 2) {
      return this.badRequest(res, "Search term must be at least 2 characters");
    }

    const result = await this.service("user").searchUsers(
      searchTerm,
      filters,
      { page, limit }
    );

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.paginated(
      res,
      result.data.data,
      result.data.metadata.page,
      result.data.metadata.limit,
      result.data.metadata.total
    );
  });

  /**
   * Get eligible users (approved and active)
   * GET /api/users/eligible
   * @auth Required - Admin or Company
   */
  getEligibleUsers = this.asyncHandler(async (req, res) => {
    const result = await this.service("user").getEligibleUsers();

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, result.data);
  });

  // ========================================
  // 5. ANALYTICS
  // ========================================

  /**
   * Get user statistics
   * GET /api/users/:id/stats
   * @auth Required - Admin or self
   */
  getUserStats = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const currentUserId = req.user._id.toString();

    // Check if user is accessing their own stats or is admin
    if (id !== currentUserId && req.user.role !== "admin") {
      return this.forbidden(res, "You can only access your own statistics");
    }

    const result = await this.service("user").getUserStats(id);

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, result.data);
  });
}

export default new UserController();
