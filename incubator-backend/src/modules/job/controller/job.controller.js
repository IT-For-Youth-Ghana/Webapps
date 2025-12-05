/**
 * Job Controller
 * Handles all job-related HTTP requests
 * - Job CRUD operations
 * - Public job listings and search
 * - Company job management
 * - Analytics and statistics
 */

import BaseController from "../../shared/base.controller";
import jobService from "../service/job.service";
import { 
  ERROR_MESSAGES, 
  ROLES 
} from "../../../utils/constants";

class JobController extends BaseController {
  constructor() {
    super({
      job: jobService,
    });
  }

  // ========================================
  // 1. PUBLIC JOB LISTINGS
  // ========================================

  /**
   * Get all active jobs (public)
   * GET /api/jobs
   * Query: ?page=1&limit=10&location=Accra&job_type=full-time
   */
  listActiveJobs = this.asyncHandler(async (req, res) => {
    this.log("info", { action: "listActiveJobs", query: req.query });

    const { page, limit } = this.getPagination(req);
    const filters = this.getFilters(req, [
      "location",
      "job_type",
      "experience_level",
    ]);

    const options = {
      sort: this.getSort(req, "-posted_at"),
    };

    const result = await this.service("job").getActiveJobs(
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
   * Get job by ID (public)
   * GET /api/jobs/:id
   */
  getJobById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    this.log("info", { action: "getJobById", jobId: id });

    const result = await this.service("job").getJobById(id);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.JOB_NOT_FOUND);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data);
  });

  /**
   * Get job by slug (public)
   * GET /api/jobs/slug/:slug
   */
  getJobBySlug = this.asyncHandler(async (req, res) => {
    const { slug } = req.params;

    this.log("info", { action: "getJobBySlug", slug });

    const result = await this.service("job").getJobBySlug(slug);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.JOB_NOT_FOUND);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data);
  });

  /**
   * Get featured jobs (public)
   * GET /api/jobs/featured
   * Query: ?limit=10
   */
  getFeaturedJobs = this.asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;

    this.log("info", { action: "getFeaturedJobs", limit });

    const result = await this.service("job").getFeaturedJobs(limit);

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, result.data);
  });

  /**
   * Get recent jobs (public)
   * GET /api/jobs/recent
   * Query: ?limit=10
   */
  getRecentJobs = this.asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;

    this.log("info", { action: "getRecentJobs", limit });

    const result = await this.service("job").getRecentJobs(limit);

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, result.data);
  });

  /**
   * Get trending jobs (public)
   * GET /api/jobs/trending
   * Query: ?limit=10
   */
  getTrendingJobs = this.asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;

    this.log("info", { action: "getTrendingJobs", limit });

    const result = await this.service("job").getTrendingJobs(limit);

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, result.data);
  });

  // ========================================
  // 2. SEARCH & FILTERING
  // ========================================

  /**
   * Search jobs (public)
   * GET /api/jobs/search
   * Query: ?q=developer&location=Accra&page=1&limit=10
   */
  searchJobs = this.asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q) {
      return this.badRequest(res, "Search term is required");
    }

    this.log("info", { action: "searchJobs", query: q });

    const result = await this.service("job").searchJobs(req.query);

    if (!result.success) {
      if (result.error.message.includes("Validation failed")) {
        return this.validationError(res, result.error.message);
      }
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
   * Filter jobs (public)
   * GET /api/jobs/filter
   * Query: ?location=Accra&job_type=remote&skills=React,Node.js&page=1
   */
  filterJobs = this.asyncHandler(async (req, res) => {
    this.log("info", { action: "filterJobs", filters: req.query });

    const result = await this.service("job").filterJobs(req.query);

    if (!result.success) {
      if (result.error.message.includes("Validation failed")) {
        return this.validationError(res, result.error.message);
      }
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
  // 3. COMPANY JOB MANAGEMENT
  // ========================================

  /**
   * Create job (Company)
   * POST /api/jobs
   * Headers: Authorization: Bearer <token>
   * Body: { title, description, job_type, location, ... }
   */
  createJob = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can create jobs");
    }

    this.log("info", {
      action: "createJob",
      userId: user.id,
      title: req.body.title,
    });

    const result = await this.service("job").createJob(req.body, user.id);

    if (!result.success) {
      if (result.error.message.includes("Validation failed")) {
        return this.validationError(res, result.error.message);
      }
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.COMPANY_NOT_FOUND);
      }
      return this.error(res, result.error);
    }

    return this.created(res, result.data, result.message);
  });

  /**
   * Update job (Company)
   * PUT /api/jobs/:id
   * Headers: Authorization: Bearer <token>
   * Body: { title?, description?, ... }
   */
  updateJob = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const { id } = req.params;

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can update jobs");
    }

    this.log("info", { action: "updateJob", userId: user.id, jobId: id });

    const result = await this.service("job").updateJob(id, req.body, user.id);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.JOB_NOT_FOUND);
      }
      if (result.error.message.includes("permission")) {
        return this.forbidden(res, result.error.message);
      }
      if (result.error.message.includes("Validation failed")) {
        return this.validationError(res, result.error.message);
      }
      if (result.error.message.includes("Cannot edit")) {
        return this.badRequest(res, result.error.message);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, result.message);
  });

  /**
   * Delete job (Company)
   * DELETE /api/jobs/:id
   * Headers: Authorization: Bearer <token>
   */
  deleteJob = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const { id } = req.params;

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can delete jobs");
    }

    this.log("info", { action: "deleteJob", userId: user.id, jobId: id });

    const result = await this.service("job").deleteJob(id, user.id);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.JOB_NOT_FOUND);
      }
      if (result.error.message.includes("permission")) {
        return this.forbidden(res, result.error.message);
      }
      return this.error(res, result.error);
    }

    return this.success(res, null, result.message);
  });

  /**
   * Get my jobs (Company)
   * GET /api/jobs/my-jobs
   * Headers: Authorization: Bearer <token>
   * Query: ?status=open&page=1&limit=10
   */
  getMyJobs = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can view their jobs");
    }

    this.log("info", { action: "getMyJobs", userId: user.id });

    const { page, limit } = this.getPagination(req);
    const filters = this.getFilters(req, ["status"]);
    const options = {
      sort: this.getSort(req, "-created_at"),
    };

    const result = await this.service("job").getCompanyJobs(
      user.id,
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
  // 4. JOB STATUS MANAGEMENT
  // ========================================

  /**
   * Publish job (Company)
   * POST /api/jobs/:id/publish
   * Headers: Authorization: Bearer <token>
   */
  publishJob = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const { id } = req.params;

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can publish jobs");
    }

    this.log("info", { action: "publishJob", userId: user.id, jobId: id });

    const result = await this.service("job").publishJob(id, user.id);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.JOB_NOT_FOUND);
      }
      if (result.error.message.includes("permission")) {
        return this.forbidden(res, result.error.message);
      }
      if (result.error.message.includes("Only draft")) {
        return this.badRequest(res, result.error.message);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, result.message);
  });

  /**
   * Close job (Company)
   * POST /api/jobs/:id/close
   * Headers: Authorization: Bearer <token>
   */
  closeJob = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const { id } = req.params;

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can close jobs");
    }

    this.log("info", { action: "closeJob", userId: user.id, jobId: id });

    const result = await this.service("job").closeJob(id, user.id);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.JOB_NOT_FOUND);
      }
      if (result.error.message.includes("permission")) {
        return this.forbidden(res, result.error.message);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, result.message);
  });

  /**
   * Pause job (Company)
   * POST /api/jobs/:id/pause
   * Headers: Authorization: Bearer <token>
   */
  pauseJob = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const { id } = req.params;

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can pause jobs");
    }

    this.log("info", { action: "pauseJob", userId: user.id, jobId: id });

    const result = await this.service("job").pauseJob(id, user.id);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.JOB_NOT_FOUND);
      }
      if (result.error.message.includes("permission")) {
        return this.forbidden(res, result.error.message);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, result.message);
  });

  // ========================================
  // 5. ANALYTICS & STATISTICS
  // ========================================

  /**
   * Get job analytics (Company)
   * GET /api/jobs/:id/analytics
   * Headers: Authorization: Bearer <token>
   */
  getJobAnalytics = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const { id } = req.params;

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can view job analytics");
    }

    this.log("info", { action: "getJobAnalytics", userId: user.id, jobId: id });

    const result = await this.service("job").getJobAnalytics(id, user.id);

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.JOB_NOT_FOUND);
      }
      if (result.error.message.includes("permission")) {
        return this.forbidden(res, result.error.message);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data);
  });

  /**
   * Get company job statistics (Company)
   * GET /api/jobs/my-jobs/stats
   * Headers: Authorization: Bearer <token>
   */
  getMyJobStats = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can view job statistics");
    }

    this.log("info", { action: "getMyJobStats", userId: user.id });

    const result = await this.service("job").getCompanyJobStats(user.id);

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, result.data);
  });

  /**
   * Get platform statistics (Admin)
   * GET /api/jobs/platform-stats
   * Headers: Authorization: Bearer <token>
   */
  getPlatformStats = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.ADMIN) {
      return this.forbidden(res, "Only admins can view platform statistics");
    }

    this.log("info", { action: "getPlatformStats", userId: user.id });

    const result = await this.service("job").getPlatformStats();

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, result.data);
  });

  // ========================================
  // 6. BULK OPERATIONS
  // ========================================

  /**
   * Bulk update job statuses (Company)
   * POST /api/jobs/bulk-update
   * Headers: Authorization: Bearer <token>
   * Body: { jobIds: string[], status: string }
   */
  bulkUpdateStatus = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can bulk update jobs");
    }

    this.log("info", {
      action: "bulkUpdateStatus",
      userId: user.id,
      count: req.body.jobIds?.length,
    });

    const result = await this.service("job").bulkUpdateStatus(
      req.body,
      user.id
    );

    if (!result.success) {
      if (result.error.message.includes("Validation failed")) {
        return this.validationError(res, result.error.message);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, result.message);
  });
}

// Export singleton instance
export default new JobController();