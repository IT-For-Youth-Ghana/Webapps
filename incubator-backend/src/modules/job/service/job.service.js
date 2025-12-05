/**
 * Job Service
 * Handles job-related business logic
 * - Job CRUD operations
 * - Search and filtering
 * - Status management
 * - Analytics
 */

import BaseService from "../../shared/base.service";
import jobRepository from "../repositories/job.repository";
import companyRepository from "../../user/repositories/company.repository";
import JobValidation from "../validation/job.validation";
import { ERROR_MESSAGES } from "../../../utils/constants";

// Attach validation to BaseService
BaseService.setValidation(JobValidation);

class JobService extends BaseService {
  constructor() {
    super({
      job: jobRepository,
      company: companyRepository,
    });
  }

  // ========================================
  // 1. JOB CRUD OPERATIONS
  // ========================================

  /**
   * Create a new job
   * @param {Object} data - Job data
   * @param {string} companyId - Company ID (from auth)
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async createJob(data, companyId, options = {}) {
    return this.runInContext({ action: "createJob", companyId }, async () => {
      try {
        this.log("createJob.start", { companyId });

        // Validate input
        const validatedData = this.validate(data, JobValidation.createJobSchema);

        // Verify company exists
        const company = await this.repo("company").getByUserId(companyId);
        if (!company) {
          throw new Error(ERROR_MESSAGES.COMPANY_NOT_FOUND);
        }

        // Set company ID
        validatedData.company = company._id;

        // Create job
        const job = await this.repo("job").createJob(validatedData, options);

        this.log("createJob.success", { jobId: job._id });
        return this.success(job, { message: "Job created successfully" });
      } catch (error) {
        this.log("createJob.error", { error: error.message });
        return this.error(error, "Failed to create job");
      }
    });
  }

  /**
   * Get job by ID
   * @param {string} jobId
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async getJobById(jobId, options = {}) {
    return this.runInContext({ action: "getJobById", jobId }, async () => {
      try {
        this.log("getJobById.start", { jobId });

        const job = await this.repo("job").getJobById(jobId, options);

        if (!job) {
          throw new Error(ERROR_MESSAGES.JOB_NOT_FOUND);
        }

        // Increment view count (async, don't wait)
        if (!options.skipViewIncrement) {
          this.repo("job").incrementViews(jobId).catch(err => 
            console.error("Failed to increment views:", err)
          );
        }

        this.log("getJobById.success", { jobId });
        return this.success(job);
      } catch (error) {
        this.log("getJobById.error", { error: error.message });
        return this.error(error, "Failed to fetch job");
      }
    });
  }

  /**
   * Get job by slug
   * @param {string} slug
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async getJobBySlug(slug, options = {}) {
    return this.runInContext({ action: "getJobBySlug", slug }, async () => {
      try {
        this.log("getJobBySlug.start", { slug });

        const job = await this.repo("job").getJobBySlug(slug, options);

        if (!job) {
          throw new Error(ERROR_MESSAGES.JOB_NOT_FOUND);
        }

        // Increment view count
        if (!options.skipViewIncrement) {
          this.repo("job").incrementViews(job._id).catch(err => 
            console.error("Failed to increment views:", err)
          );
        }

        this.log("getJobBySlug.success", { jobId: job._id });
        return this.success(job);
      } catch (error) {
        this.log("getJobBySlug.error", { error: error.message });
        return this.error(error, "Failed to fetch job");
      }
    });
  }

  /**
   * Update job
   * @param {string} jobId
   * @param {Object} updates
   * @param {string} companyId - For ownership verification
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async updateJob(jobId, updates, companyId, options = {}) {
    return this.runInContext({ action: "updateJob", jobId }, async () => {
      try {
        this.log("updateJob.start", { jobId, companyId });

        // Validate updates
        const validatedUpdates = this.validate(updates, JobValidation.updateJobSchema);

        // Get job and verify ownership
        const job = await this.repo("job").getJobById(jobId, { lean: true });

        if (!job) {
          throw new Error(ERROR_MESSAGES.JOB_NOT_FOUND);
        }

        // Verify company ownership
        const company = await this.repo("company").getByUserId(companyId);
        if (!company || job.company._id.toString() !== company._id.toString()) {
          throw new Error("You don't have permission to update this job");
        }

        // Check if job can be edited
        if (!["draft", "open", "paused"].includes(job.status)) {
          throw new Error("Cannot edit closed or deleted jobs");
        }

        // Update job
        const updatedJob = await this.repo("job").updateJob(
          jobId,
          validatedUpdates,
          options
        );

        this.log("updateJob.success", { jobId });
        return this.success(updatedJob, { message: "Job updated successfully" });
      } catch (error) {
        this.log("updateJob.error", { error: error.message });
        return this.error(error, "Failed to update job");
      }
    });
  }

  /**
   * Delete job (soft delete)
   * @param {string} jobId
   * @param {string} companyId - For ownership verification
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async deleteJob(jobId, companyId, options = {}) {
    return this.runInContext({ action: "deleteJob", jobId }, async () => {
      try {
        this.log("deleteJob.start", { jobId, companyId });

        // Get job and verify ownership
        const job = await this.repo("job").getJobById(jobId, { lean: true });

        if (!job) {
          throw new Error(ERROR_MESSAGES.JOB_NOT_FOUND);
        }

        // Verify company ownership
        const company = await this.repo("company").getByUserId(companyId);
        if (!company || job.company._id.toString() !== company._id.toString()) {
          throw new Error("You don't have permission to delete this job");
        }

        // Soft delete
        await this.repo("job").deleteJob(jobId, companyId, options);

        this.log("deleteJob.success", { jobId });
        return this.success(null, { message: "Job deleted successfully" });
      } catch (error) {
        this.log("deleteJob.error", { error: error.message });
        return this.error(error, "Failed to delete job");
      }
    });
  }

  // ========================================
  // 2. JOB STATUS MANAGEMENT
  // ========================================

  /**
   * Publish job (from draft)
   * @param {string} jobId
   * @param {string} companyId
   * @returns {Promise<Object>}
   */
  async publishJob(jobId, companyId) {
    return this.runInContext({ action: "publishJob", jobId }, async () => {
      try {
        this.log("publishJob.start", { jobId, companyId });

        // Verify ownership
        const job = await this.repo("job").getJobById(jobId, { lean: true });
        if (!job) {
          throw new Error(ERROR_MESSAGES.JOB_NOT_FOUND);
        }

        const company = await this.repo("company").getByUserId(companyId);
        if (!company || job.company._id.toString() !== company._id.toString()) {
          throw new Error("You don't have permission to publish this job");
        }

        if (job.status !== "draft") {
          throw new Error("Only draft jobs can be published");
        }

        // Publish
        const publishedJob = await this.repo("job").publishJob(jobId);

        this.log("publishJob.success", { jobId });
        return this.success(publishedJob, { message: "Job published successfully" });
      } catch (error) {
        this.log("publishJob.error", { error: error.message });
        return this.error(error, "Failed to publish job");
      }
    });
  }

  /**
   * Close job
   * @param {string} jobId
   * @param {string} companyId
   * @returns {Promise<Object>}
   */
  async closeJob(jobId, companyId) {
    return this.runInContext({ action: "closeJob", jobId }, async () => {
      try {
        this.log("closeJob.start", { jobId, companyId });

        // Verify ownership
        const job = await this.repo("job").getJobById(jobId, { lean: true });
        if (!job) {
          throw new Error(ERROR_MESSAGES.JOB_NOT_FOUND);
        }

        const company = await this.repo("company").getByUserId(companyId);
        if (!company || job.company._id.toString() !== company._id.toString()) {
          throw new Error("You don't have permission to close this job");
        }

        // Close
        const closedJob = await this.repo("job").closeJob(jobId);

        this.log("closeJob.success", { jobId });
        return this.success(closedJob, { message: "Job closed successfully" });
      } catch (error) {
        this.log("closeJob.error", { error: error.message });
        return this.error(error, "Failed to close job");
      }
    });
  }

  /**
   * Pause job
   * @param {string} jobId
   * @param {string} companyId
   * @returns {Promise<Object>}
   */
  async pauseJob(jobId, companyId) {
    return this.runInContext({ action: "pauseJob", jobId }, async () => {
      try {
        this.log("pauseJob.start", { jobId, companyId });

        // Verify ownership
        const job = await this.repo("job").getJobById(jobId, { lean: true });
        if (!job) {
          throw new Error(ERROR_MESSAGES.JOB_NOT_FOUND);
        }

        const company = await this.repo("company").getByUserId(companyId);
        if (!company || job.company._id.toString() !== company._id.toString()) {
          throw new Error("You don't have permission to pause this job");
        }

        // Pause
        const pausedJob = await this.repo("job").pauseJob(jobId);

        this.log("pauseJob.success", { jobId });
        return this.success(pausedJob, { message: "Job paused successfully" });
      } catch (error) {
        this.log("pauseJob.error", { error: error.message });
        return this.error(error, "Failed to pause job");
      }
    });
  }

  // ========================================
  // 3. JOB LISTINGS (PUBLIC)
  // ========================================

  /**
   * Get active jobs (public listing)
   * @param {Object} filters
   * @param {Object} pagination - { page, limit }
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async getActiveJobs(filters = {}, pagination = {}, options = {}) {
    return this.runInContext({ action: "getActiveJobs" }, async () => {
      try {
        this.log("getActiveJobs.start", { filters, pagination });

        const { page = 1, limit = 10 } = pagination;

        const result = await this.repo("job").getActiveJobs(
          filters,
          page,
          limit,
          options
        );

        this.log("getActiveJobs.success", { total: result.metadata.total });
        return this.success(result);
      } catch (error) {
        this.log("getActiveJobs.error", { error: error.message });
        return this.error(error, "Failed to fetch active jobs");
      }
    });
  }

  /**
   * Get featured jobs
   * @param {number} [limit=10]
   * @returns {Promise<Object>}
   */
  async getFeaturedJobs(limit = 10) {
    return this.runInContext({ action: "getFeaturedJobs" }, async () => {
      try {
        this.log("getFeaturedJobs.start", { limit });

        const jobs = await this.repo("job").getFeaturedJobs(limit);

        this.log("getFeaturedJobs.success", { count: jobs.length });
        return this.success(jobs);
      } catch (error) {
        this.log("getFeaturedJobs.error", { error: error.message });
        return this.error(error, "Failed to fetch featured jobs");
      }
    });
  }

  /**
   * Get recent jobs
   * @param {number} [limit=10]
   * @returns {Promise<Object>}
   */
  async getRecentJobs(limit = 10) {
    return this.runInContext({ action: "getRecentJobs" }, async () => {
      try {
        this.log("getRecentJobs.start", { limit });

        const jobs = await this.repo("job").getRecentJobs(limit);

        this.log("getRecentJobs.success", { count: jobs.length });
        return this.success(jobs);
      } catch (error) {
        this.log("getRecentJobs.error", { error: error.message });
        return this.error(error, "Failed to fetch recent jobs");
      }
    });
  }

  // ========================================
  // 4. SEARCH & FILTERING
  // ========================================

  /**
   * Search jobs by text
   * @param {Object} searchData - { q, page, limit, filters }
   * @returns {Promise<Object>}
   */
  async searchJobs(searchData) {
    return this.runInContext({ action: "searchJobs" }, async () => {
      try {
        this.log("searchJobs.start", { searchTerm: searchData.q });

        // Validate search data
        const validated = this.validate(searchData, JobValidation.searchJobsSchema);

        const { q, page, limit, ...filters } = validated;

        // Parse skills if provided
        if (filters.skills) {
          filters.skills = JobValidation.parseSkills(filters.skills);
        }

        const result = await this.repo("job").searchJobs(q, filters, page, limit);

        this.log("searchJobs.success", { total: result.metadata.total });
        return this.success(result);
      } catch (error) {
        this.log("searchJobs.error", { error: error.message });
        return this.error(error, "Failed to search jobs");
      }
    });
  }

  /**
   * Filter jobs by criteria
   * @param {Object} filterData
   * @returns {Promise<Object>}
   */
  async filterJobs(filterData) {
    return this.runInContext({ action: "filterJobs" }, async () => {
      try {
        this.log("filterJobs.start", { filters: filterData });

        // Validate filter data
        const validated = this.validate(filterData, JobValidation.filterJobsSchema);

        const { page, limit, sort, ...filters } = validated;

        // Parse skills if provided
        if (filters.skills) {
          filters.skills = JobValidation.parseSkills(filters.skills);
        }

        // Build sort object
        const sortObj = JobValidation.buildSortObject(sort);

        const result = await this.repo("job").filterJobs(filters, page, limit, {
          sort: sortObj,
        });

        this.log("filterJobs.success", { total: result.metadata.total });
        return this.success(result);
      } catch (error) {
        this.log("filterJobs.error", { error: error.message });
        return this.error(error, "Failed to filter jobs");
      }
    });
  }

  // ========================================
  // 5. COMPANY JOB MANAGEMENT
  // ========================================

  /**
   * Get jobs by company
   * @param {string} companyId
   * @param {Object} filters
   * @param {Object} pagination
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async getCompanyJobs(companyId, filters = {}, pagination = {}, options = {}) {
    return this.runInContext({ action: "getCompanyJobs", companyId }, async () => {
      try {
        this.log("getCompanyJobs.start", { companyId });

        const company = await this.repo("company").getByUserId(companyId);
        if (!company) {
          throw new Error(ERROR_MESSAGES.COMPANY_NOT_FOUND);
        }

        const { page = 1, limit = 10 } = pagination;

        const result = await this.repo("job").getJobsByCompany(
          company._id,
          filters,
          page,
          limit,
          options
        );

        this.log("getCompanyJobs.success", { total: result.metadata.total });
        return this.success(result);
      } catch (error) {
        this.log("getCompanyJobs.error", { error: error.message });
        return this.error(error, "Failed to fetch company jobs");
      }
    });
  }

  /**
   * Get company job statistics
   * @param {string} companyId
   * @returns {Promise<Object>}
   */
  async getCompanyJobStats(companyId) {
    return this.runInContext({ action: "getCompanyJobStats", companyId }, async () => {
      try {
        this.log("getCompanyJobStats.start", { companyId });

        const company = await this.repo("company").getByUserId(companyId);
        if (!company) {
          throw new Error(ERROR_MESSAGES.COMPANY_NOT_FOUND);
        }

        const stats = await this.repo("job").getCompanyJobStats(company._id);

        this.log("getCompanyJobStats.success", { companyId });
        return this.success(stats);
      } catch (error) {
        this.log("getCompanyJobStats.error", { error: error.message });
        return this.error(error, "Failed to fetch job statistics");
      }
    });
  }

  // ========================================
  // 6. ANALYTICS
  // ========================================

  /**
   * Get job analytics
   * @param {string} jobId
   * @param {string} companyId - For ownership verification
   * @returns {Promise<Object>}
   */
  async getJobAnalytics(jobId, companyId) {
    return this.runInContext({ action: "getJobAnalytics", jobId }, async () => {
      try {
        this.log("getJobAnalytics.start", { jobId, companyId });

        // Verify ownership
        const job = await this.repo("job").getJobById(jobId, { lean: true });
        if (!job) {
          throw new Error(ERROR_MESSAGES.JOB_NOT_FOUND);
        }

        const company = await this.repo("company").getByUserId(companyId);
        if (!company || job.company._id.toString() !== company._id.toString()) {
          throw new Error("You don't have permission to view this job's analytics");
        }

        const analytics = await this.repo("job").getJobAnalytics(jobId);

        this.log("getJobAnalytics.success", { jobId });
        return this.success(analytics);
      } catch (error) {
        this.log("getJobAnalytics.error", { error: error.message });
        return this.error(error, "Failed to fetch job analytics");
      }
    });
  }

  /**
   * Get platform statistics
   * @returns {Promise<Object>}
   */
  async getPlatformStats() {
    return this.runInContext({ action: "getPlatformStats" }, async () => {
      try {
        this.log("getPlatformStats.start");

        const stats = await this.repo("job").getPlatformStats();

        this.log("getPlatformStats.success");
        return this.success(stats);
      } catch (error) {
        this.log("getPlatformStats.error", { error: error.message });
        return this.error(error, "Failed to fetch platform statistics");
      }
    });
  }

  /**
   * Get trending jobs
   * @param {number} [limit=10]
   * @returns {Promise<Object>}
   */
  async getTrendingJobs(limit = 10) {
    return this.runInContext({ action: "getTrendingJobs" }, async () => {
      try {
        this.log("getTrendingJobs.start", { limit });

        const jobs = await this.repo("job").getTrendingJobs(limit);

        this.log("getTrendingJobs.success", { count: jobs.length });
        return this.success(jobs);
      } catch (error) {
        this.log("getTrendingJobs.error", { error: error.message });
        return this.error(error, "Failed to fetch trending jobs");
      }
    });
  }

  // ========================================
  // 7. BULK OPERATIONS
  // ========================================

  /**
   * Bulk update job statuses
   * @param {Object} data - { jobIds, status }
   * @param {string} companyId - For ownership verification
   * @returns {Promise<Object>}
   */
  async bulkUpdateStatus(data, companyId) {
    return this.runInContext({ action: "bulkUpdateStatus" }, async () => {
      try {
        this.log("bulkUpdateStatus.start", { companyId, count: data.jobIds?.length });

        // Validate
        const validated = this.validate(data, JobValidation.bulkUpdateStatusSchema);

        // Get company profile from user ID
        const company = await this.repo("company").getByUserId(companyId);
        if (!company) {
          throw new Error(ERROR_MESSAGES.COMPANY_NOT_FOUND);
        }

        // Verify all jobs belong to company
        const jobs = await this.repo("job").model.find({
          _id: { $in: validated.jobIds },
          company_id: company._id
        }).select('_id');

        if (jobs.length !== validated.jobIds.length) {
          throw new Error("Some jobs do not belong to this company or do not exist");
        }

        // Update only the verified jobs
        const count = await this.repo("job").bulkUpdateStatus(
          jobs.map(j => j._id),
          validated.status
        );

        this.log("bulkUpdateStatus.success", { count });
        return this.success({ count }, { message: `${count} jobs updated` });
      } catch (error) {
        this.log("bulkUpdateStatus.error", { error: error.message });
        return this.error(error, "Failed to bulk update jobs");
      }
    });
  }
}

// Export singleton instance
export const jobService = new JobService();
export default jobService;