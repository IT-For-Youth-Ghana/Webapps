/**
 * User Service
 * Handles user profile management, admin operations, and business logic
 * Auth-related methods (login, tokens, password reset) handled by AuthService
 */

import BaseService from "../../shared/base.service";
import { userRepository } from "../repositories/user.repository";
import { studentRepository } from "../repositories/student.repository";
import { companyRepository } from "../repositories/company.repository";
import { adminRepository } from "../repositories/admin.repository";
import { applicationRepository } from "../../application/repositories/application.repository";
import UserValidation from "../validation/user.validation";
import { ERROR_MESSAGES } from "../../../utils/constants";
import { agenda } from "../../../config/agenda.config";

// Attach validation to BaseService (done once at startup, but here for completeness)
BaseService.setValidation(UserValidation);

class UserService extends BaseService {
  constructor() {
    super({
      user: userRepository,
      student: studentRepository,
      company: companyRepository,
      admin: adminRepository,
      application: applicationRepository,
    });
  }

  // ========================================
  // 1. USER PROFILE MANAGEMENT (Self-Service)
  // ========================================

  /**
   * Get current user's profile with populated data
   * @param {string} userId - Current user's ID
   * @param {Object} [options] - { select, populate, includeDeleted }
   * @returns {Promise<Object>} - { user, profile }
   */
  async getMyProfile(userId, options = {}) {
    return this.runInContext({ action: "getMyProfile", userId }, async () => {
      try {
        this.log("getMyProfile.start", { userId });

        const user = await this.repo("user").findById(userId, {
          ...options,
        });

        if (!user) {
          throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        // Populate profile based on role
        const profile = await this._getProfileByRole(
          user.role,
          user._id,
          options
        );

        const result = {
          user: user.deserialize({ exclude: ["password_hash"] }),
          profile,
        };

        this.log("getMyProfile.success", { userId });
        return this.success(result);
      } catch (error) {
        return this.error(error, "Failed to fetch profile");
      }
    });
  }

  /**
   * Update current user's profile
   * @param {string} userId - Current user's ID
   * @param {Object} updates - Partial updates
   * @param {Object} [options]
   * @returns {Promise<Object>} - Updated profile
   */
  async updateMyProfile(userId, updates, options = {}) {
    return this.runInContext(
      { action: "updateMyProfile", userId },
      async () => {
        try {
          this.log("updateMyProfile.start", {
            userId,
            updatesKeys: Object.keys(updates),
          });

          const user = await this.repo("user").findById(userId);
          if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

          // Validate updates based on role
          const updateSchema = this._getUpdateSchemaForRole(user.role);
          const cleanUpdates = this.validate(updates, updateSchema);

          let result;
          if (user.role === "student") {
            result = await this.repo("student").update(
              { user: userId },
              cleanUpdates,
              options
            );
          } else if (user.role === "company") {
            result = await this.repo("company").update(
              { user: userId },
              cleanUpdates,
              options
            );
          } else if (user.role === "admin") {
            result = await this.repo("admin").update(
              { user: userId },
              cleanUpdates,
              options
            );
          }

          if (!result) {
            throw new Error("Profile update failed");
          }

          this.log("updateMyProfile.success", { userId });
          return this.success(result);
        } catch (error) {
          return this.error(error, "Failed to update profile");
        }
      }
    );
  }

  /**
   * Upload user photo/profile picture
   * @param {string} userId
   * @param {Object} file - Multer file object
   * @returns {Promise<Object>} - { photo_url }
   */
  async uploadPhoto(userId, file) {
    return this.runInContext({ action: "uploadPhoto", userId }, async () => {
      try {
        this.log("uploadPhoto.start", { userId, fileName: file?.originalname });

        // NOTE: File upload implementation
        // For local storage: File is already saved by multer to uploads/profiles/
        // For cloud storage (S3/Cloudinary): Implement FileStorage.upload(file, "profiles")
        // Example S3: const photoUrl = await s3Client.upload(file.buffer, file.originalname);
        const photoUrl = `/uploads/profiles/${file.filename}`;

        const updateData = { photo_url: photoUrl };
        const user = await this.repo("user").updateById(userId, updateData);

        if (!user) throw new Error("User not found");

        this.log("uploadPhoto.success", { userId, photoUrl });
        return this.success({ photo_url: photoUrl });
      } catch (error) {
        return this.error(error, "Failed to upload photo");
      }
    });
  }

  /**
   * Delete current user's account (soft delete)
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async deleteMyAccount(userId) {
    return this.runInContext(
      { action: "deleteMyAccount", userId },
      async () => {
        try {
          this.log("deleteMyAccount.start", { userId });

          return await this.transaction(async (session) => {
            // Soft delete user
            const user = await this.repo("user").delete(userId, { session });
            if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

            // Soft delete profile
            const profileRepo = await this._getProfileRepoByRole(user.role);

            if (profileRepo) {
              await profileRepo.deleteByUserId(userId, { session });
            }

            this.log("deleteMyAccount.success", { userId });
            return this.success({
              user,
              message: "Account deleted successfully",
            });
          });
        } catch (error) {
          return this.error(error, "Failed to delete account");
        }
      }
    );
  }

  // ========================================
  // 2. ADMIN OPERATIONS
  // ========================================

  /**
   * List users for admin panel (search, filter, paginate)
   * @param {Object} filters - { role, status, searchTerm, is_active }
   * @param {Object} pagination - { page, limit }
   * @param {Object} [options] - { select, sort, includeDeleted }
   * @returns {Promise<Object>}
   */
  async listUsers(
    filters = {},
    pagination = { page: 1, limit: 10 },
    options = {}
  ) {
    return this.runInContext({ action: "listUsers" }, async () => {
      try {
        this.log("listUsers.start", { filters, pagination, options });

        // Validate pagination
        const { page, limit } = this.validate(
          pagination,
          UserValidation.searchUsersSchema
        );

        // Build filters
        const queryFilters = {
          ...filters,
          ...(options.includeDeleted ? {} : { deleted_at: null }),
        };

        const result = await this.repo("user").findAll(
          queryFilters,
          page,
          limit,
          {
            ...options,
            select: options.select || "email role status is_active created_at",
            sort: options.sort || { created_at: -1 },
          }
        );

        this.log("listUsers.success", { total: result.metadata.total });
        return this.success(result);
      } catch (error) {
        return this.error(error, "Failed to list users");
      }
    });
  }

  /**
   * Get detailed user info for admin
   * @param {string} userId
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async getUserById(userId, options = {}) {
    return this.runInContext({ action: "getUserById", userId }, async () => {
      try {
        this.log("getUserById.start", { userId });

        const user = await this.repo("user").findById(userId, {
          ...options,
          includeDeleted: options.includeDeleted || false,
        });

        if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

        const profile = await this._getProfileByRole(
          user.role,
          userId,
          options
        );

        const result = {
          user: user.deserialize({ exclude: ["password_hash"] }),
          profile,
          applicationsCount: await this._getApplicationsCount(userId),
          accountAge: Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24)), // days
          lastLogin: user.last_login_at,
        };

        this.log("getUserById.success", { userId });
        return this.success(result);
      } catch (error) {
        return this.error(error, "Failed to fetch user details");
      }
    });
  }

  /**
   * Approve pending user
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async approveUser(userId) {
    return this.runInContext({ action: "approveUser", userId }, async () => {
      try {
        this.log("approveUser.start", { userId });

        const user = await this.repo("user").findById(userId);

        if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

        if (user.status === "approved") throw Error("User already approved");

        const updatedUser = await this.repo("user").updateById(userId, {
          status: "approved",
          updated_at: Date.now(),
        });

        // Queue welcome email via Agenda.js
        await agenda.now('send-welcome-email', { 
          userId,
          email: updatedUser.email,
          name: `${updatedUser.first_name || ''} ${updatedUser.last_name || ''}`.trim(),
          role: updatedUser.role
        });

        this.log("approveUser.success", { userId });
        return this.success(updatedUser, { message: "User approved successfully" });
      } catch (error) {
        return this.error(error, "Failed to approve user");
      }
    });
  }

  /**
   * Reject pending user
   * @param {string} userId
   * @param {string} [reason]
   * @returns {Promise<Object>}
   */
  async rejectUser(userId, reason = "") {
    return this.runInContext({ action: "rejectUser", userId }, async () => {
      try {
        this.log("rejectUser.start", { userId, reason });

        const user = await this.repo("user").findById(userId)

        if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
        if (user.status !== "pending")
          throw new Error("User must be pending to reject");


        const updatedUser = await this.repo("user").updateById(userId, {
          status: "rejected",
          ...(reason && { rejection_reason: reason }),
          updated_at: Date.now(),
        });

        // Queue rejection email via Agenda.js
        await agenda.now('send-rejection-email', { 
          userId,
          email: updatedUser.email,
          name: `${updatedUser.first_name || ''} ${updatedUser.last_name || ''}`.trim(),
          reason: reason || 'Your application did not meet our requirements'
        });

        this.log("rejectUser.success", { userId });
        return this.success(updatedUser, { message: "User rejected successfully" });
      } catch (error) {
        return this.error(error, "Failed to reject user");
      }
    });
  }

  /**
   * Toggle user activation status
   * @param {string} userId
   * @param {boolean} isActive
   * @returns {Promise<Object>}
   */
  async setUserActiveStatus(userId, isActive) {
    return this.runInContext(
      { action: "setUserActiveStatus", userId },
      async () => {
        try {
          this.log("setUserActiveStatus.start", { userId, isActive });

          const user = await this.repo("user").updateById(userId, {
            is_active: isActive,
            updated_at: Date.now(),
          });

          if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

          this.log("setUserActiveStatus.success", { userId, isActive });
          return this.success(user, {
            message: isActive ? "User activated" : "User deactivated",
          });
        } catch (error) {
          return this.error(error, "Failed to update user status");
        }
      }
    );
  }

  /**
   * Permanently delete user (admin only)
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async forceDeleteUser(userId) {
    return this.runInContext(
      { action: "forceDeleteUser", userId },
      async () => {
        try {
          this.log("forceDeleteUser.start", { userId });

          return await this.transaction(async (session) => {
            const user = await this.repo("user").hardDelete(userId, {
              session,
            });
            if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

            // Delete profile
            const profileRepo = this._getProfileRepoByRole(user.role);

            if (profileRepo) {
              await profileRepo.forceDeleteByUserId(userId, { session });
            }

            // Delete related applications (if user is a student)
            if (user.role === 'student') {
              const student = await this.repo("student").getByUserId(userId);
              if (student) {
                await this.repo("application").model.deleteMany(
                  { student: student._id },
                  { session }
                );
                this.log("forceDeleteUser.applicationsDeleted", { 
                  userId, 
                  studentId: student._id 
                });
              }
            }

            this.log("forceDeleteUser.success", { userId });
            return this.success({ message: "User permanently deleted" });
          });
        } catch (error) {
          return this.error(error, "Failed to delete user permanently");
        }
      }
    );
  }

  /**
   * Restore soft-deleted user
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async restoreUser(userId) {
    return this.runInContext({ action: "restoreUser", userId }, async () => {
      try {
        this.log("restoreUser.start", { userId });

        return await this.transaction(async (session) => {
          const user = await this.repo("user").restore(userId, { session });
          if (!user) throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);

          // Restore profile
          const profileRepo = await this._getProfileRepoByRole(user.role);
          if (profileRepo) {
            await profileRepo.restoreByUserId(userId, { session });
          }

          this.log("restoreUser.success", { userId });
          return this.success(user, { message: "User restored successfully" });
        });
      } catch (error) {
        return this.error(error, "Failed to restore user");
      }
    });
  }

  // ========================================
  // 3. BULK OPERATIONS
  // ========================================

  /**
   * Bulk approve multiple users
   * @param {string[]} userIds
   * @returns {Promise<Object>}
   */
  async bulkApproveUsers(userIds) {
    return this.runInContext({ action: "bulkApproveUsers" }, async () => {
      try {
        this.log("bulkApproveUsers.start", { count: userIds.length });

        return await this.transaction(async (session) => {
          const updates = userIds.map((id) =>
            this.repo("user").update(
              { _id: id, status: "pending" },
              { status: "approved", updated_at: Date.now() },
              { session }
            )
          );

          const results = await Promise.all(updates);
          const successCount = results.filter(Boolean).length;

          this.log("bulkApproveUsers.success", { successCount });
          return this.success({
            count: successCount,
            message: `${successCount} users approved`,
          });
        });
      } catch (error) {
        return this.error(error, "Failed to bulk approve users");
      }
    });
  }

  // ========================================
  // 4. UTILITY METHODS
  // ========================================

  /**
   * Get users eligible for various features (tokens, notifications, etc.)
   * @param {Object} [options]
   * @returns {Promise<Array>}
   */
  async getEligibleUsers(options = {}) {
    return this.runInContext({ action: "getEligibleUsers" }, async () => {
      try {
        this.log("getEligibleUsers.start");

        const filters = {
          status: "approved",
          is_active: true,
          deleted_at: null,
        };

        const result = await this.repo("user").findAll(
          filters,
          1,
          1000,
          options
        );
        this.log("getEligibleUsers.success", { count: result.data.length });

        return this.success(result.data);
      } catch (error) {
        return this.error(error, "Failed to fetch eligible users");
      }
    });
  }

  // ========================================
  // 5. PRIVATE HELPERS
  // ========================================

  /**
   * Get profile repository based on role
   * @param {string} role
   * @returns {any|null}
   */
  async _getProfileRepoByRole(role) {
    const repoMap = {
      student: this.repos.student,
      company: this.repos.company,
      admin: this.repos.admin,
    };

    return repoMap[role] || null;
  }

  /**
   * Get profile data for a user by role
   * @param {string} role
   * @param {string} userId
   * @param {Object} [options]
   * @returns {Promise<Object|null>}
   * @private
   */
  async _getProfileByRole(role, userId, options = {}) {
    const repo = await this._getProfileRepoByRole(role);
    if (!repo) return null;

    const profile = await repo.getByUserId(userId, {
      ...options,
      includeDeleted: options.includeDeleted || false,
    });

    return profile ? profile.deserialize() : null;
  }

  /**
   * Get update validation schema for role
   * @param {string} role
   * @returns {Joi.Schema}
   * @private
   */
  _getUpdateSchemaForRole(role) {
    return UserValidation.buildUpdateProfileSchema(role);
  }

  /**
   * Get user's applications count (for admin dashboard)
   * @param {string} userId - User ID (not student profile ID)
   * @returns {Promise<number>}
   * @private
   */
  async _getApplicationsCount(userId) {
    try {
      // Get student profile from user ID
      const student = await this.repo("student").getByUserId(userId);
      if (!student) {
        return 0;
      }
      
      // Count applications using student profile ID
      const count = await this.repo("application").model.countDocuments({ 
        student: student._id,
        deleted_at: null
      });
      return count;
    } catch (error) {
      this.log("_getApplicationsCount.error", { userId, error: error.message });
      return 0;
    }
  }

  /**
   * Get comprehensive user statistics (Admin only)
   * @returns {Promise<Object>}
   */
  async getUserStats() {
    return this.runInContext({ action: "getUserStats" }, async () => {
      try {
        this.log("getUserStats.start");

        // Get all users for statistics
        const users = await this.repo("user").findAll({}, 1, 10000, {
          select: "_id email role status created_at",
          lean: true,
        });

        const data = users.data || [];

        // Calculate statistics
        const stats = {
          overview: {
            totalUsers: data.length,
            totalStudents: data.filter((u) => u.role === "student").length,
            totalCompanies: data.filter((u) => u.role === "company").length,
            totalAdmins: data.filter((u) => u.role === "admin").length,
          },
          byStatus: {
            active: data.filter((u) => u.status === "active").length,
            pending: data.filter((u) => u.status === "pending").length,
            inactive: data.filter((u) => u.status === "inactive").length,
            rejected: data.filter((u) => u.status === "rejected").length,
          },
          byRole: {
            students: {
              active: data.filter((u) => u.role === "student" && u.status === "active").length,
              pending: data.filter((u) => u.role === "student" && u.status === "pending").length,
            },
            companies: {
              active: data.filter((u) => u.role === "company" && u.status === "active").length,
              pending: data.filter((u) => u.role === "company" && u.status === "pending").length,
            },
          },
          recentSignups: data
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10)
            .map((u) => ({
              id: u._id,
              email: u.email,
              role: u.role,
              status: u.status,
              created_at: u.created_at,
            })),
        };

        this.log("getUserStats.success", { totalUsers: stats.overview.totalUsers });
        return this.success(stats);
      } catch (error) {
        this.log("getUserStats.error", { error: error.message });
        return this.error(error, "Failed to retrieve user statistics");
      }
    });
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;
