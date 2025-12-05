/**
 * User Controller
 * Handles user profile management and admin operations
 * - Profile CRUD (self-service)
 * - Photo uploads
 * - Account management
 * - Admin operations (list, approve, reject, activate/deactivate)
 * - Search and filtering
 */

import BaseController from "../../shared/base.controller";
import userService from "../service/user.service";
import UserValidation from "../validation/user.validation";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, ROLES } from "../../../utils/constants";

class UserController extends BaseController {
  constructor() {
    super({
      user: userService,
    });
  }

  // ========================================
  // 1. PROFILE MANAGEMENT (Self-Service)
  // ========================================

  /**
   * Get current user's profile with populated data
   * GET /api/users/me
   * Headers: Authorization: Bearer <token>
   */
  getMyProfile = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    this.log("info", { action: "getMyProfile", userId: user.id });

    // Call service
    const result = await this.service("user").getMyProfile(user.id, {
      populate: true,
    });

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, "Profile retrieved successfully");
  });

  /**
   * Update current user's profile
   * PUT /api/users/me
   * Headers: Authorization: Bearer <token>
   * Body: Role-specific profile fields
   */
  updateMyProfile = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    this.log("info", {
      action: "updateMyProfile",
      userId: user.id,
      fields: Object.keys(req.body),
    });

    // Call service (validation happens in service layer)
    const validatedData = this.validate(req.body, UserValidation.updateProfileSchema);
    const result = await this.service("user").updateMyProfile(
      user.id,
      validatedData
    );

    if (!result.success) {
      if (result.error.message.includes("Validation failed")) {
        return this.validationError(res, result.error.message);
      }
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, SUCCESS_MESSAGES.PROFILE_UPDATED);
  });

  /**
   * Upload profile photo
   * POST /api/users/me/photo
   * Headers: Authorization: Bearer <token>
   * Body: FormData with 'photo' field
   */
  uploadPhoto = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (!req.file) {
      return this.badRequest(res, "Photo file is required");
    }

    this.log("info", {
      action: "uploadPhoto",
      userId: user.id,
      fileName: req.file.originalname,
    });

    // Call service
    const result = await this.service("user").uploadPhoto(user.id, req.file);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, SUCCESS_MESSAGES.FILE_UPLOADED);
  });

  /**
   * Delete current user's account (soft delete)
   * DELETE /api/users/me
   * Headers: Authorization: Bearer <token>
   */
  deleteMyAccount = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    this.log("info", { action: "deleteMyAccount", userId: user.id });

    // Call service
    const result = await this.service("user").deleteMyAccount(user.id);

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, null, SUCCESS_MESSAGES.ACCOUNT_DELETED);
  });

  // ========================================
  // 2. ADMIN USER MANAGEMENT
  // ========================================

  /**
   * List all users with filters and pagination (Admin)
   * GET /api/users
   * Query: ?page=1&limit=10&role=student&status=pending&search=email
   * Headers: Authorization: Bearer <token> (admin)
   */
  listUsers = this.asyncHandler(async (req, res) => {
    const admin = this.getUser(req);

    this.log("info", {
      action: "listUsers",
      adminId: admin.id,
      filters: req.query,
    });

    const { page, limit } = this.getPagination(req);
    const filters = this.getFilters(req, [
      "role",
      "status",
      "is_active",
      "email",
    ]);

    // Add search term if provided
    if (req.query.search) {
      filters.searchTerm = req.query.search;
    }

    const options = {
      sort: this.getSort(req, "-created_at"),
      select: this.getSelect(req),
      includeDeleted: req.query.includeDeleted === "true",
    };

    // Call service
    const result = await this.service("user").listUsers(
      filters,
      { page, limit },
      options
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
   * Get user by ID (Admin)
   * GET /api/users/:id
   * Headers: Authorization: Bearer <token> (admin)
   */
  getUserById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const admin = this.getUser(req);

    this.log("info", { action: "getUserById", userId: id, adminId: admin.id });

    const options = {
      includeDeleted: req.query.includeDeleted === "true",
      populate: true,
    };

    // Call service
    const result = await this.service("user").getUserById(id, options);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, "User retrieved successfully");
  });

  /**
   * Search users (Admin)
   * GET /api/users/search
   * Query: ?q=searchTerm&page=1&limit=10
   * Headers: Authorization: Bearer <token> (admin)
   */
  searchUsers = this.asyncHandler(async (req, res) => {
    const admin = this.getUser(req);
    const { q: searchTerm } = req.query;

    if (!searchTerm) {
      return this.badRequest(res, "Search term is required");
    }

    this.log("info", {
      action: "searchUsers",
      searchTerm,
      adminId: admin.id,
    });

    const { page, limit } = this.getPagination(req);

    // Call service (uses repository's searchUsers with aggregation)
    const result = await this.service("user").listUsers(
      { searchTerm },
      { page, limit },
      { sort: { created_at: -1 } }
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

  // ========================================
  // 3. USER APPROVAL WORKFLOW (Admin)
  // ========================================

  /**
   * Approve pending user (Admin)
   * POST /api/users/:id/approve
   * Headers: Authorization: Bearer <token> (admin)
   */
  approveUser = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const admin = this.getUser(req);

    this.log("info", { action: "approveUser", userId: id, adminId: admin.id });

    // Call service
    const result = await this.service("user").approveUser(id);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
      }
      if (result.error.message.includes("already approved")) {
        return this.badRequest(res, "User is already approved");
      }
      return this.error(res, result.error);
    }

    return this.success(
      res,
      result.data,
      result.message || SUCCESS_MESSAGES.ACCOUNT_APPROVED
    );
  });

  /**
   * Reject pending user (Admin)
   * POST /api/users/:id/reject
   * Body: { reason: string } (optional)
   * Headers: Authorization: Bearer <token> (admin)
   */
  rejectUser = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const admin = this.getUser(req);

    this.log("info", {
      action: "rejectUser",
      userId: id,
      adminId: admin.id,
      reason,
    });

    // Call service
    const result = await this.service("user").rejectUser(id, reason);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
      }
      if (result.error.message.includes("must be pending")) {
        return this.badRequest(res, "User must be pending to reject");
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, result.message || "User rejected");
  });

  /**
   * Bulk approve users (Admin)
   * POST /api/users/bulk-approve
   * Body: { userIds: string[] }
   * Headers: Authorization: Bearer <token> (admin)
   */
  bulkApprove = this.asyncHandler(async (req, res) => {
    const { userIds } = req.body;
    const admin = this.getUser(req);

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return this.badRequest(res, "userIds array is required");
    }

    this.log("info", {
      action: "bulkApprove",
      count: userIds.length,
      adminId: admin.id,
    });

    // Call service
    const result = await this.service("user").bulkApproveUsers(userIds);

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, result.data, result.data.message);
  });

  // ========================================
  // 4. USER ACTIVATION (Admin)
  // ========================================

  /**
   * Activate user account (Admin)
   * PUT /api/users/:id/activate
   * Headers: Authorization: Bearer <token> (admin)
   */
  activateUser = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const admin = this.getUser(req);

    this.log("info", {
      action: "activateUser",
      userId: id,
      adminId: admin.id,
    });

    // Call service
    const result = await this.service("user").setUserActiveStatus(id, true);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, result.message);
  });

  /**
   * Deactivate user account (Admin)
   * PUT /api/users/:id/deactivate
   * Headers: Authorization: Bearer <token> (admin)
   */
  deactivateUser = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const admin = this.getUser(req);

    this.log("info", {
      action: "deactivateUser",
      userId: id,
      adminId: admin.id,
    });

    // Call service
    const result = await this.service("user").setUserActiveStatus(id, false);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, result.message);
  });

  // ========================================
  // 5. USER DELETION (Admin)
  // ========================================

  /**
   * Soft delete user (Admin)
   * DELETE /api/users/:id
   * Headers: Authorization: Bearer <token> (admin)
   */
  deleteUser = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const admin = this.getUser(req);

    this.log("info", { action: "deleteUser", userId: id, adminId: admin.id });

    // Call service (uses deleteMyAccount which does soft delete + profile)
    const result = await this.service("user").deleteMyAccount(id);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
      }
      return this.error(res, result.error);
    }

    return this.success(res, null, result.data.message || "User deleted");
  });

  /**
   * Permanently delete user (Super Admin only)
   * DELETE /api/users/:id/force
   * Headers: Authorization: Bearer <token> (super admin)
   */
  forceDeleteUser = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const admin = this.getUser(req);

    this.log("info", {
      action: "forceDeleteUser",
      userId: id,
      adminId: admin.id,
    });

    // Call service
    const result = await this.service("user").forceDeleteUser(id);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
      }
      return this.error(res, result.error);
    }

    return this.success(res, null, result.data.message);
  });

  /**
   * Restore soft-deleted user (Admin)
   * POST /api/users/:id/restore
   * Headers: Authorization: Bearer <token> (admin)
   */
  restoreUser = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const admin = this.getUser(req);

    this.log("info", {
      action: "restoreUser",
      userId: id,
      adminId: admin.id,
    });

    // Call service
    const result = await this.service("user").restoreUser(id);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.USER_NOT_FOUND);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, result.message);
  });

  // ========================================
  // 6. ROLE-SPECIFIC LISTS (Admin)
  // ========================================

  /**
   * List all students (Admin)
   * GET /api/users/students
   * Query: ?page=1&limit=10&status=active
   * Headers: Authorization: Bearer <token> (admin)
   */
  listStudents = this.asyncHandler(async (req, res) => {
    const admin = this.getUser(req);

    this.log("info", { action: "listStudents", adminId: admin.id });

    const { page, limit } = this.getPagination(req);
    const filters = {
      role: ROLES.STUDENT,
      ...this.getFilters(req, ["status", "is_active"]),
    };

    const options = {
      sort: this.getSort(req, "-created_at"),
      includeDeleted: req.query.includeDeleted === "true",
    };

    // Call service
    const result = await this.service("user").listUsers(
      filters,
      { page, limit },
      options
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
   * List all companies (Admin)
   * GET /api/users/companies
   * Query: ?page=1&limit=10&status=approved
   * Headers: Authorization: Bearer <token> (admin)
   */
  listCompanies = this.asyncHandler(async (req, res) => {
    const admin = this.getUser(req);

    this.log("info", { action: "listCompanies", adminId: admin.id });

    const { page, limit } = this.getPagination(req);
    const filters = {
      role: ROLES.COMPANY,
      ...this.getFilters(req, ["status", "is_active"]),
    };

    const options = {
      sort: this.getSort(req, "-created_at"),
      includeDeleted: req.query.includeDeleted === "true",
    };

    // Call service
    const result = await this.service("user").listUsers(
      filters,
      { page, limit },
      options
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
   * List all admins (Super Admin only)
   * GET /api/users/admins
   * Query: ?page=1&limit=10
   * Headers: Authorization: Bearer <token> (super admin)
   */
  listAdmins = this.asyncHandler(async (req, res) => {
    const admin = this.getUser(req);

    this.log("info", { action: "listAdmins", adminId: admin.id });

    const { page, limit } = this.getPagination(req);
    const filters = {
      role: ROLES.ADMIN,
      ...this.getFilters(req, ["status", "is_active"]),
    };

    const options = {
      sort: this.getSort(req, "-created_at"),
      includeDeleted: req.query.includeDeleted === "true",
    };

    // Call service
    const result = await this.service("user").listUsers(
      filters,
      { page, limit },
      options
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

  // ========================================
  // 7. ANALYTICS & STATS (Admin)
  // ========================================

  /**
   * Get user statistics (Admin)
   * GET /api/users/stats
   * Headers: Authorization: Bearer <token> (admin)
   */
  getUserStats = this.asyncHandler(async (req, res) => {
    const admin = this.getUser(req);

    this.log("info", { action: "getUserStats", adminId: admin.id });

    // Get comprehensive user statistics from service
    const result = await this.service("user").getUserStats();

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, result.data, "User statistics retrieved successfully");
  });
}

// Export singleton instance
export default new UserController();