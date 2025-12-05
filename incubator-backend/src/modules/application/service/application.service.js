/**
 * Application Service (Final - Fully Corrected)
 * Handles job application business logic, CQRS operations, and workflows
 * 
 */

import BaseService from "../../shared/base.service";
import { applicationRepository } from "../repositories/application.repository";
import { jobRepository } from "../../job/repositories/job.repository";
import { studentRepository } from "../../user/repositories/student.repository";
import { companyRepository } from "../../user/repositories/company.repository";
import ApplicationValidation from "../validation/application.validation";
import { ERROR_MESSAGES } from "../../../utils/constants";
import { agenda } from "../../../config/agenda.config";

// Attach validation to BaseService
BaseService.setValidation(ApplicationValidation);

class ApplicationService extends BaseService {
  constructor() {
    super({
      application: applicationRepository,
      job: jobRepository,
      student: studentRepository,
      company: companyRepository,
    });
  }

  // ========================================
  // 1. CREATE APPLICATION (CQRS Command)
  // ========================================

  /**
   * Submit job application
   * @param {string} userId - User ID from JWT (not student profile ID)
   * @param {Object} data - { job, cover_letter, resume_url?, additional_info? }
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async createApplication(userId, data, options = {}) {
    return this.runInContext(
      { action: "createApplication", userId },
      async () => {
        try {
          this.log("createApplication.start", { userId, jobId: data.job });

          // Validate input
          const cleanData = this.validate(
            data,
            ApplicationValidation.createApplicationSchema
          );

          // Get student profile (CRITICAL: we need profile ID, not user ID)
          const student = await this.repo("student").getByUserId(userId);
          if (!student) {
            throw new Error(ERROR_MESSAGES.PROFILE_NOT_FOUND);
          }
          if (student.status === "inactive") {
            throw new Error("Please activate your profile to apply for jobs");
          }

          // Verify job exists and is active
          const job = await this.repo("job").findById(cleanData.job);
          if (!job) {
            throw new Error(ERROR_MESSAGES.JOB_NOT_FOUND);
          }
          if (job.status !== "active") {
            throw new Error(ERROR_MESSAGES.JOB_CLOSED);
          }
          if (job.application_deadline && new Date(job.application_deadline) < new Date()) {
            throw new Error("Job application deadline has passed");
          }

          // Get company and check self-application (compare user IDs)
          const company = await this.repo("company").findById(job.company_id);
          if (!company) {
            throw new Error("Company not found for this job");
          }
          if (company.user.toString() === userId) {
            throw new Error(ERROR_MESSAGES.CANNOT_APPLY_OWN_JOB);
          }

          // 5. Check for duplicate (use student profile ID)
          const existingApplication = await this.repo("application").findDuplicate(
            cleanData.job,
            student._id
          );
          if (existingApplication) {
            throw new Error(ERROR_MESSAGES.APPLICATION_EXISTS);
          }

          // Create application (student = student profile ID)
          const applicationData = {
            job: cleanData.job,
            student: student._id,
            cover_letter: cleanData.cover_letter,
            resume_url: cleanData.resume_url || student.cv_url,
            additional_info: cleanData.additional_info,
            status: "pending",
            applied_date: new Date(),
          };

          const application = await this.repo("application").create(
            applicationData,
            options
          );

          // Queue async operations
          await agenda.now("sendApplicationNotification", { 
            applicationId: application._id,
            studentId: student._id,
            jobId: job._id,
            companyId: company._id
          });

          await agenda.now("updateJobApplicationCount", { jobId: job._id });

          this.log("createApplication.success", {
            applicationId: application._id,
          });

          return this.success(application.deserialize(), {
            message: "Application submitted successfully",
          });
        } catch (error) {
          return this.error(error, "Failed to submit application");
        }
      }
    );
  }

  // ========================================
  // 2. UPDATE APPLICATION (Student)
  // ========================================

  /**
   * Update application before review
   * @param {string} applicationId
   * @param {string} userId - User ID from JWT
   * @param {Object} updates
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async updateApplication(applicationId, userId, updates, options = {}) {
    return this.runInContext(
      { action: "updateApplication", applicationId, userId },
      async () => {
        try {
          this.log("updateApplication.start", { applicationId });

          // 1. Validate input
          const cleanUpdates = this.validate(
            updates,
            ApplicationValidation.updateApplicationSchema
          );

          // 2. Get student profile
          const student = await this.repo("student").getByUserId(userId);
          if (!student) {
            throw new Error(ERROR_MESSAGES.PROFILE_NOT_FOUND);
          }

          // 3. Get application
          const application = await this.repo("application").findById(
            applicationId
          );
          if (!application) {
            throw new Error(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
          }

          // 4. Verify ownership (compare student profile IDs)
          if (application.student.toString() !== student._id.toString()) {
            throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
          }

          // 5. Verify can update
          if (application.status !== "pending") {
            throw new Error("Cannot update application after it has been reviewed");
          }

          // 6. Update application
          const updatedApplication = await this.repo("application").updateById(
            applicationId,
            cleanUpdates,
            options
          );

          this.log("updateApplication.success", { applicationId });

          return this.success(updatedApplication.deserialize(), {
            message: "Application updated successfully",
          });
        } catch (error) {
          return this.error(error, "Failed to update application");
        }
      }
    );
  }

  // ========================================
  // 3. UPDATE STATUS (Company/Admin)
  // ========================================

  /**
   * Update application status
   * @param {string} applicationId
   * @param {string} userId - Company/Admin user ID
   * @param {string} userRole
   * @param {Object} statusData - { status, rejection_reason?, notes? }
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async updateApplicationStatus(
    applicationId,
    userId,
    userRole,
    statusData,
    options = {}
  ) {
    return this.runInContext(
      { action: "updateApplicationStatus", applicationId, userId },
      async () => {
        try {
          this.log("updateApplicationStatus.start", { applicationId });

          // 1. Validate input
          const cleanData = this.validate(
            statusData,
            ApplicationValidation.updateStatusSchema
          );

          // 2. Get application with job details
          const application = await this.repo("application").findById(
            applicationId,
            { populate: [{ path: "job" }] }
          );
          if (!application) {
            throw new Error(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
          }

          // 3. Verify permissions (company can only update their job applications)
          if (userRole === "company") {
            const company = await this.repo("company").getByUserId(userId);
            if (!company) {
              throw new Error("Company profile not found");
            }
            if (
              application.job.company_id.toString() !== company._id.toString()
            ) {
              throw new Error(ERROR_MESSAGES.FORBIDDEN);
            }
          }

          // 4. Validate status transition
          ApplicationValidation.validateStatusTransition(
            application.status,
            cleanData.status
          );

          // 5. Update status
          const updates = {
            status: cleanData.status,
            status_updated_at: new Date(),
            status_updated_by: userId,
            ...(cleanData.rejection_reason && {
              rejection_reason: cleanData.rejection_reason,
            }),
            ...(cleanData.notes && { notes: cleanData.notes }),
          };

          const updatedApplication = await this.repo("application").updateById(
            applicationId,
            updates,
            options
          );

          // Queue notification to student
          await agenda.now("sendStatusUpdateEmail", { 
            applicationId,
            oldStatus: application.status,
            newStatus: cleanData.status,
            studentId: application.student
          });

          this.log("updateApplicationStatus.success", { applicationId });

          return this.success(updatedApplication.deserialize(), {
            message: "Application status updated successfully",
          });
        } catch (error) {
          return this.error(error, "Failed to update application status");
        }
      }
    );
  }

  // ========================================
  // 4. WITHDRAW APPLICATION (Student)
  // ========================================

  /**
   * Withdraw application
   * @param {string} applicationId
   * @param {string} userId - User ID from JWT
   * @param {Object} [data] - { withdrawal_reason? }
   * @returns {Promise<Object>}
   */
  async withdrawApplication(applicationId, userId, data = {}) {
    return this.runInContext(
      { action: "withdrawApplication", applicationId, userId },
      async () => {
        try {
          this.log("withdrawApplication.start", { applicationId });

          // 1. Get student profile
          const student = await this.repo("student").getByUserId(userId);
          if (!student) {
            throw new Error(ERROR_MESSAGES.PROFILE_NOT_FOUND);
          }

          // 2. Get application
          const application = await this.repo("application").findById(
            applicationId
          );
          if (!application) {
            throw new Error(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
          }

          // 3. Verify ownership (compare student profile IDs)
          if (application.student.toString() !== student._id.toString()) {
            throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
          }

          // 4. Verify can withdraw
          if (["approved", "rejected"].includes(application.status)) {
            throw new Error(
              "Cannot withdraw application that has been approved or rejected"
            );
          }
          if (application.deleted_at) {
            throw new Error("Application has already been withdrawn");
          }

          // 5. Soft delete application
          const withdrawnApplication = await this.repo("application").delete(
            { _id: applicationId }
          );

          // Update with withdrawal info
          if (data.withdrawal_reason) {
            await this.repo("application").updateById(
              applicationId,
              {
                withdrawal_reason: data.withdrawal_reason,
                withdrawn_at: new Date(),
              },
              { includeDeleted: true }
            );
          }

          // 6. Queue notification to company
          await agenda.now("sendWithdrawalNotification", { 
            applicationId,
            jobId: application.job
          });

          this.log("withdrawApplication.success", { applicationId });

          return this.success({
            message: "Application withdrawn successfully",
          });
        } catch (error) {
          return this.error(error, "Failed to withdraw application");
        }
      }
    );
  }

  // ========================================
  // 5. GET APPLICATION BY ID (CQRS Query)
  // ========================================

  /**
   * Get single application with details
   * @param {string} applicationId
   * @param {string} userId - User ID from JWT
   * @param {string} userRole
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async getApplicationById(applicationId, userId, userRole, options = {}) {
    return this.runInContext(
      { action: "getApplicationById", applicationId },
      async () => {
        try {
          this.log("getApplicationById.start", { applicationId });

          // 1. Get application with populated fields
          const populateOptions = [];
          if (options.with_job_details !== false) {
            populateOptions.push({
              path: "job",
              select: "title description company_id location job_type",
            });
          }
          if (options.with_student_details !== false) {
            populateOptions.push({
              path: "student",
              select: "first_name last_name bio skills cv_url",
            });
          }

          const application = await this.repo("application").findById(
            applicationId,
            { populate: populateOptions, includeDeleted: options.include_deleted }
          );

          if (!application) {
            throw new Error(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
          }

          // 2. Verify permissions
          await this._verifyApplicationAccess(application, userId, userRole);

          this.log("getApplicationById.success", { applicationId });

          return this.success(application.deserialize());
        } catch (error) {
          return this.error(error, "Failed to fetch application");
        }
      }
    );
  }

  // ========================================
  // 6. LIST APPLICATIONS (CQRS Query)
  // ========================================

  /**
   * Search/filter applications with pagination
   * @param {Object} filters - Query filters
   * @param {Object} pagination - { page, limit }
   * @param {string} userId - User ID from JWT
   * @param {string} userRole
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async listApplications(filters, pagination, userId, userRole, options = {}) {
    return this.runInContext({ action: "listApplications" }, async () => {
      try {
        this.log("listApplications.start", { filters, pagination });

        // 1. Validate filters
        const validatedParams = this.validate(
          { ...filters, ...pagination },
          ApplicationValidation.searchApplicationsSchema
        );

        const { page, limit, sort_by, sort_order, ...queryFilters } =
          validatedParams;

        // 2. Apply role-based filters
        const finalFilters = await this._applyRoleFilters(
          queryFilters,
          userId,
          userRole
        );

        // 3. Build query options
        const queryOptions = {
          sort: { [sort_by]: sort_order === "asc" ? 1 : -1 },
          includeDeleted: validatedParams.include_deleted,
        };

        if (validatedParams.with_job_details) {
          queryOptions.populate = [
            { path: "job", select: "title company_id location job_type status" },
          ];
        }
        if (validatedParams.with_student_details) {
          queryOptions.populate = queryOptions.populate || [];
          queryOptions.populate.push({
            path: "student",
            select: "first_name last_name bio skills cv_url",
          });
        }

        // 4. Execute query
        const result = await this.repo("application").findAll(
          finalFilters,
          page,
          limit,
          queryOptions
        );

        this.log("listApplications.success", { total: result.metadata.total });

        return this.success(result);
      } catch (error) {
        return this.error(error, "Failed to list applications");
      }
    });
  }

  // ========================================
  // 7. GET MY APPLICATIONS (Student)
  // ========================================

  /**
   * Get student's own applications
   * @param {string} userId - User ID from JWT
   * @param {Object} [filters]
   * @param {Object} [pagination]
   * @returns {Promise<Object>}
   */
  async getMyApplications(userId, filters = {}, pagination = {}) {
    return this.runInContext({ action: "getMyApplications", userId }, async () => {
      try {
        // Get student profile to get profile ID
        const student = await this.repo("student").getByUserId(userId);
        if (!student) {
          throw new Error(ERROR_MESSAGES.PROFILE_NOT_FOUND);
        }

        return this.listApplications(
          { ...filters, student: student._id }, // ✅ Use student profile ID
          pagination,
          userId,
          "student",
          { with_job_details: true }
        );
      } catch (error) {
        return this.error(error, "Failed to fetch your applications");
      }
    });
  }

  // ========================================
  // 8. GET JOB APPLICATIONS (Company)
  // ========================================

  /**
   * Get applications for company's jobs
   * @param {string} jobId
   * @param {string} userId - Company user ID from JWT
   * @param {Object} [filters]
   * @param {Object} [pagination]
   * @returns {Promise<Object>}
   */
  async getJobApplications(jobId, userId, filters = {}, pagination = {}) {
    return this.runInContext({ action: "getJobApplications" }, async () => {
      try {
        // Verify job ownership
        const job = await this.repo("job").findById(jobId);
        if (!job) {
          throw new Error(ERROR_MESSAGES.JOB_NOT_FOUND);
        }

        const company = await this.repo("company").getByUserId(userId);
        if (!company || job.company_id.toString() !== company._id.toString()) {
          throw new Error(ERROR_MESSAGES.FORBIDDEN);
        }

        return this.listApplications(
          { ...filters, job: jobId },
          pagination,
          userId,
          "company",
          { with_student_details: true }
        );
      } catch (error) {
        return this.error(error, "Failed to fetch job applications");
      }
    });
  }

  // ========================================
  // 9. BULK OPERATIONS
  // ========================================

  /**
   * Bulk update application status
   * @param {string[]} applicationIds
   * @param {Object} statusData
   * @param {string} userId
   * @param {string} userRole
   * @returns {Promise<Object>}
   */
  async bulkUpdateStatus(applicationIds, statusData, userId, userRole) {
    return this.runInContext({ action: "bulkUpdateStatus" }, async () => {
      try {
        this.log("bulkUpdateStatus.start", { count: applicationIds.length });

        // 1. Validate input
        const cleanData = this.validate(
          { application_ids: applicationIds, ...statusData },
          ApplicationValidation.bulkUpdateStatusSchema
        );

        // 2. Process updates in transaction
        const results = await this.transaction(async (session) => {
          const updates = [];
          const errors = [];

          for (const appId of cleanData.application_ids) {
            try {
              const result = await this.updateApplicationStatus(
                appId,
                userId,
                userRole,
                { 
                  status: cleanData.status, 
                  rejection_reason: cleanData.rejection_reason 
                },
                { session }
              );
              if (result.success) {
                updates.push(appId);
              } else {
                errors.push({ id: appId, error: result.error });
              }
            } catch (error) {
              errors.push({ id: appId, error: error.message });
            }
          }

          return { updates, errors };
        });

        this.log("bulkUpdateStatus.success", {
          updated: results.updates.length,
          failed: results.errors.length,
        });

        return this.success({
          updated: results.updates.length,
          failed: results.errors.length,
          errors: results.errors,
          message: `${results.updates.length} applications updated successfully`,
        });
      } catch (error) {
        return this.error(error, "Failed to bulk update applications");
      }
    });
  }

  /**
   * Bulk delete applications
   * @param {string[]} applicationIds
   * @param {string} userId
   * @param {string} userRole
   * @returns {Promise<Object>}
   */
  async bulkDelete(applicationIds, userId, userRole) {
    return this.runInContext({ action: "bulkDelete" }, async () => {
      try {
        this.log("bulkDelete.start", { count: applicationIds.length });

        // 1. Validate input
        const cleanData = this.validate(
          { application_ids: applicationIds },
          ApplicationValidation.bulkDeleteSchema
        );

        // 2. Process deletions in transaction
        const results = await this.transaction(async (session) => {
          const deletions = [];
          const errors = [];

          for (const appId of cleanData.application_ids) {
            try {
              const application = await this.repo("application").findById(appId);
              if (!application) {
                throw new Error(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
              }

              // Verify permissions
              await this._verifyApplicationAccess(application, userId, userRole);

              await this.repo("application").delete(
                { _id: appId },
                { session }
              );
              deletions.push(appId);
            } catch (error) {
              errors.push({ id: appId, error: error.message });
            }
          }

          return { deletions, errors };
        });

        this.log("bulkDelete.success", {
          deleted: results.deletions.length,
          failed: results.errors.length,
        });

        return this.success({
          deleted: results.deletions.length,
          failed: results.errors.length,
          errors: results.errors,
          message: `${results.deletions.length} applications deleted successfully`,
        });
      } catch (error) {
        return this.error(error, "Failed to bulk delete applications");
      }
    });
  }

  // ========================================
  // 10. STATISTICS & ANALYTICS
  // ========================================

  /**
   * Get application statistics
   * @param {Object} filters
   * @param {string} userId
   * @param {string} userRole
   * @returns {Promise<Object>}
   */
  async getStatistics(filters, userId, userRole) {
    return this.runInContext({ action: "getStatistics" }, async () => {
      try {
        this.log("getStatistics.start", { filters });

        // 1. Validate filters
        const cleanFilters = this.validate(
          filters,
          ApplicationValidation.getStatisticsSchema
        );

        // 2. Apply role-based filters
        const finalFilters = await this._applyRoleFilters(
          cleanFilters,
          userId,
          userRole
        );

        // 3. Get statistics
        const stats = await this.repo("application").getStatistics(
          finalFilters,
          cleanFilters.group_by
        );

        this.log("getStatistics.success");

        return this.success(stats);
      } catch (error) {
        return this.error(error, "Failed to fetch statistics");
      }
    });
  }

  // ========================================
  // PRIVATE HELPERS
  // ========================================

  /**
   * Verify user can access application
   * @param {Object} application
   * @param {string} userId - User ID from JWT
   * @param {string} userRole
   * @private
   */
  async _verifyApplicationAccess(application, userId, userRole) {
    if (userRole === "admin") return true;

    if (userRole === "student") {
      // Get student profile to compare IDs
      const student = await this.repo("student").getByUserId(userId);
      if (!student || application.student.toString() !== student._id.toString()) {
        throw new Error(ERROR_MESSAGES.FORBIDDEN);
      }
      return true;
    }

    if (userRole === "company") {
      const company = await this.repo("company").getByUserId(userId);
      if (!company) throw new Error("Company profile not found");

      const job = await this.repo("job").findById(application.job);
      if (!job || job.company_id.toString() !== company._id.toString()) {
        throw new Error(ERROR_MESSAGES.FORBIDDEN);
      }
      return true;
    }

    throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
  }

  /**
   * Apply role-based filters
   * @param {Object} filters
   * @param {string} userId - User ID from JWT
   * @param {string} userRole
   * @returns {Promise<Object>}
   * @private
   */
  async _applyRoleFilters(filters, userId, userRole) {
    const finalFilters = { ...filters };

    // Students can only see their own applications
    if (userRole === "student") {
      const student = await this.repo("student").getByUserId(userId);
      if (!student) throw new Error(ERROR_MESSAGES.PROFILE_NOT_FOUND);
      finalFilters.student = student._id; // ✅ Use student profile ID
    }

    // Companies can only see applications for their jobs
    if (userRole === "company") {
      const company = await this.repo("company").getByUserId(userId);
      if (!company) throw new Error("Company profile not found");

      // Get all company job IDs
      const companyJobs = await this.repo("job").findAll(
        { company_id: company._id },
        1,
        1000,
        { select: "_id" }
      );
      const jobIds = companyJobs.data.map((job) => job._id);

      finalFilters.job = { $in: jobIds };
    }

    // Apply date filters
    if (filters.applied_after || filters.applied_before) {
      finalFilters.applied_date = {};
      if (filters.applied_after) {
        finalFilters.applied_date.$gte = new Date(filters.applied_after);
      }
      if (filters.applied_before) {
        finalFilters.applied_date.$lte = new Date(filters.applied_before);
      }
      delete finalFilters.applied_after;
      delete finalFilters.applied_before;
    }

    return finalFilters;
  }
}

// Export singleton instance
export const applicationService = new ApplicationService();
export default applicationService;