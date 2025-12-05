/**
 * Job Repository
 * Handles all job-related data access operations
 */
import { BaseRepository } from "../../shared/base.repository";
import Job from "../model/job.model";
import { ERROR_MESSAGES } from "../../../utils/constants";

class JobRepository extends BaseRepository {
  constructor() {
    super(Job);
  }

  // ========================================
  // 1. BASIC CRUD OPERATIONS
  // ========================================

  /**
   * Create a new job
   * @param {Object} data - Job data
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async createJob(data, options = {}) {
    if (!data.company || !data.title || !data.description || !data.job_type) {
      throw new Error(ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
    }
    return await this.create(data, options);
  }

  /**
   * Update job by ID
   * @param {string} jobId
   * @param {Object} updates
   * @param {Object} [options]
   * @returns {Promise<Object|null>}
   */
  async updateJob(jobId, updates, options = {}) {
    return await this.update({ _id: jobId }, updates, options);
  }

  /**
   * Get job by ID
   * @param {string} jobId
   * @param {Object} [options]
   * @returns {Promise<Object|null>}
   */
  async getJobById(jobId, options = {}) {
    return await this.findById(jobId, {
      ...options,
      populate: { path: "company", select: "name industry website photo_url" },
    });
  }

  /**
   * Get job by slug
   * @param {string} slug
   * @param {Object} [options]
   * @returns {Promise<Object|null>}
   */
  async getJobBySlug(slug, options = {}) {
    return await this.findOne({ slug }, {
      ...options,
      populate: { path: "company", select: "name industry website photo_url" },
    });
  }

  // ========================================
  // 2. COMPANY-SPECIFIC OPERATIONS
  // ========================================

  /**
   * Get all jobs for a company
   * @param {string} companyId
   * @param {Object} [filters]
   * @param {number} [page=1]
   * @param {number} [limit=10]
   * @param {Object} [options]
   * @returns {Promise<{ data: Array, metadata: Object }>}
   */
  async getJobsByCompany(
    companyId,
    filters = {},
    page = 1,
    limit = 10,
    options = {}
  ) {
    const queryFilters = {
      company: companyId,
      ...filters,
    };

    return await this.findAll(queryFilters, page, limit, {
      ...options,
      sort: options.sort || { posted_at: -1 },
    });
  }

  /**
   * Count jobs by company
   * @param {string} companyId
   * @param {Object} [filters]
   * @returns {Promise<number>}
   */
  async countJobsByCompany(companyId, filters = {}) {
    const result = await this.model.countDocuments({
      company: companyId,
      deleted_at: null,
      ...filters,
    });
    return result;
  }

  /**
   * Get company job statistics
   * @param {string} companyId
   * @returns {Promise<Object>}
   */
  async getCompanyJobStats(companyId) {
    const result = await this.aggregate([
      {
        $match: {
          company: this.model.base.Types.ObjectId(companyId),
          deleted_at: null,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalApplications: { $sum: "$application_count" },
          totalViews: { $sum: "$view_count" },
        },
      },
    ]);

    // Transform to object
    const stats = {
      total: 0,
      open: 0,
      closed: 0,
      paused: 0,
      draft: 0,
      totalApplications: 0,
      totalViews: 0,
    };

    result.forEach((item) => {
      stats.total += item.count;
      stats[item._id] = item.count;
      stats.totalApplications += item.totalApplications;
      stats.totalViews += item.totalViews;
    });

    return stats;
  }

  // ========================================
  // 3. PUBLIC JOB LISTINGS
  // ========================================

  /**
   * Get active jobs (public listing)
   * @param {Object} [filters]
   * @param {number} [page=1]
   * @param {number} [limit=10]
   * @param {Object} [options]
   * @returns {Promise<{ data: Array, metadata: Object }>}
   */
  async getActiveJobs(filters = {}, page = 1, limit = 10, options = {}) {
    const now = new Date();
    const queryFilters = {
      status: "open",
      deleted_at: null,
      $or: [
        { closing_date: { $exists: false } },
        { closing_date: null },
        { closing_date: { $gt: now } },
      ],
      ...filters,
    };

    return await this.findAll(queryFilters, page, limit, {
      ...options,
      populate: { path: "company", select: "name industry website photo_url" },
      sort: options.sort || { posted_at: -1 },
    });
  }

  /**
   * Get featured jobs
   * @param {number} [limit=10]
   * @param {Object} [options]
   * @returns {Promise<Array>}
   */
  async getFeaturedJobs(limit = 10, options = {}) {
    const now = new Date();
    const jobs = await this.model
      .find({
        is_featured: true,
        status: "open",
        deleted_at: null,
        $or: [
          { featured_until: { $exists: false } },
          { featured_until: null },
          { featured_until: { $gt: now } },
        ],
      })
      .populate("company", "name industry website photo_url")
      .sort({ posted_at: -1 })
      .limit(limit)
      .lean(options.lean);

    return jobs;
  }

  /**
   * Get recent jobs
   * @param {number} [limit=10]
   * @param {Object} [options]
   * @returns {Promise<Array>}
   */
  async getRecentJobs(limit = 10, options = {}) {
    return (
      await this.getActiveJobs({}, 1, limit, {
        ...options,
        sort: { posted_at: -1 },
      })
    ).data;
  }

  // ========================================
  // 4. SEARCH & FILTERING
  // ========================================

  /**
   * Search jobs by text
   * @param {string} searchTerm
   * @param {Object} [filters]
   * @param {number} [page=1]
   * @param {number} [limit=10]
   * @param {Object} [options]
   * @returns {Promise<{ data: Array, metadata: Object }>}
   */
  async searchJobs(
    searchTerm,
    filters = {},
    page = 1,
    limit = 10,
    options = {}
  ) {
    const skip = (page - 1) * limit;

    const query = {
      $text: { $search: searchTerm },
      status: "open",
      deleted_at: null,
      ...filters,
    };

    const data = await this.model
      .find(query)
      .populate("company", "name industry website photo_url")
      .select({ score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" }, posted_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(options.lean);

    const total = await this.model.countDocuments(query);

    return {
      data,
      metadata: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Filter jobs by multiple criteria
   * @param {Object} filters - { location, job_type, skills, experience_level }
   * @param {number} [page=1]
   * @param {number} [limit=10]
   * @param {Object} [options]
   * @returns {Promise<{ data: Array, metadata: Object }>}
   */
  async filterJobs(filters = {}, page = 1, limit = 10, options = {}) {
    const queryFilters = {
      status: "open",
      deleted_at: null,
    };

    // Location filter (case-insensitive partial match)
    if (filters.location) {
      queryFilters.location = { $regex: filters.location, $options: "i" };
    }

    // Job type filter
    if (filters.job_type) {
      queryFilters.job_type = filters.job_type;
    }

    // Experience level filter
    if (filters.experience_level) {
      queryFilters.experience_level = filters.experience_level;
    }

    // Skills filter (match any)
    if (filters.skills && Array.isArray(filters.skills)) {
      queryFilters.skills = { $in: filters.skills };
    }

    // Salary range filter
    if (filters.min_salary) {
      queryFilters["salary_range.min"] = { $gte: Number(filters.min_salary) };
    }

    if (filters.max_salary) {
      queryFilters["salary_range.max"] = { $lte: Number(filters.max_salary) };
    }

    // Company filter
    if (filters.company) {
      queryFilters.company = filters.company;
    }

    return await this.findAll(queryFilters, page, limit, {
      ...options,
      populate: { path: "company", select: "name industry website photo_url" },
      sort: options.sort || { posted_at: -1 },
    });
  }

  // ========================================
  // 5. JOB STATUS OPERATIONS
  // ========================================

  /**
   * Publish job (from draft)
   * @param {string} jobId
   * @returns {Promise<Object|null>}
   */
  async publishJob(jobId) {
    const job = await this.model.findById(jobId);
    if (!job) return null;
    return await job.publish();
  }

  /**
   * Close job
   * @param {string} jobId
   * @returns {Promise<Object|null>}
   */
  async closeJob(jobId) {
    const job = await this.model.findById(jobId);
    if (!job) return null;
    return await job.close();
  }

  /**
   * Pause job
   * @param {string} jobId
   * @returns {Promise<Object|null>}
   */
  async pauseJob(jobId) {
    const job = await this.model.findById(jobId);
    if (!job) return null;
    return await job.pause();
  }

  /**
   * Soft delete job
   * @param {string} jobId
   * @param {string} deletedBy - User ID
   * @param {Object} [options]
   * @returns {Promise<Object|null>}
   */
  async deleteJob(jobId, deletedBy, options = {}) {
    return await this.update(
      { _id: jobId },
      {
        status: "deleted",
        deleted_at: new Date(),
        deleted_by: deletedBy,
      },
      options
    );
  }

  // ========================================
  // 6. APPLICATION TRACKING
  // ========================================

  /**
   * Increment job view count
   * @param {string} jobId
   * @returns {Promise<Object|null>}
   */
  async incrementViews(jobId) {
    return await this.model.findByIdAndUpdate(
      jobId,
      { $inc: { view_count: 1 } },
      { new: true }
    );
  }

  /**
   * Increment application count
   * @param {string} jobId
   * @returns {Promise<Object|null>}
   */
  async incrementApplications(jobId) {
    return await this.model.findByIdAndUpdate(
      jobId,
      { $inc: { application_count: 1 } },
      { new: true }
    );
  }

  // ========================================
  // 7. ANALYTICS & STATISTICS
  // ========================================

  /**
   * Get job analytics
   * @param {string} jobId
   * @returns {Promise<Object>}
   */
  async getJobAnalytics(jobId) {
    const job = await this.getJobById(jobId);
    if (!job) return null;

    return {
      jobId: job._id,
      title: job.title,
      views: job.view_count,
      applications: job.application_count,
      status: job.status,
      daysPosted: job.daysPosted,
      isExpired: job.isExpired,
      conversionRate:
        job.view_count > 0
          ? ((job.application_count / job.view_count) * 100).toFixed(2)
          : 0,
    };
  }

  /**
   * Get trending jobs (most viewed in last 7 days)
   * @param {number} [limit=10]
   * @returns {Promise<Array>}
   */
  async getTrendingJobs(limit = 10) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return await this.model
      .find({
        status: "open",
        deleted_at: null,
        posted_at: { $gte: sevenDaysAgo },
      })
      .populate("company", "name industry website photo_url")
      .sort({ view_count: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get jobs expiring soon
   * @param {number} [days=7]
   * @param {number} [limit=10]
   * @returns {Promise<Array>}
   */
  async getExpiringJobs(days = 7, limit = 10) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await this.model
      .find({
        status: "open",
        deleted_at: null,
        closing_date: {
          $exists: true,
          $ne: null,
          $gte: now,
          $lte: futureDate,
        },
      })
      .populate("company", "name industry")
      .sort({ closing_date: 1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get platform statistics
   * @returns {Promise<Object>}
   */
  async getPlatformStats() {
    const result = await this.aggregate([
      {
        $match: { deleted_at: null },
      },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          openJobs: {
            $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] },
          },
          totalApplications: { $sum: "$application_count" },
          totalViews: { $sum: "$view_count" },
        },
      },
    ]);

    return result[0] || {
      totalJobs: 0,
      openJobs: 0,
      totalApplications: 0,
      totalViews: 0,
    };
  }

  // ========================================
  // 8. BULK OPERATIONS
  // ========================================

  /**
   * Bulk update job statuses
   * @param {string[]} jobIds
   * @param {string} status
   * @returns {Promise<number>} - Number of updated jobs
   */
  async bulkUpdateStatus(jobIds, status) {
    const result = await this.model.updateMany(
      { _id: { $in: jobIds } },
      { status, updated_at: new Date() }
    );
    return result.modifiedCount;
  }

  /**
   * Close expired jobs
   * @returns {Promise<number>} - Number of closed jobs
   */
  async closeExpiredJobs() {
    const result = await this.model.updateMany(
      {
        status: "open",
        closing_date: { $lt: new Date() },
      },
      { status: "closed", updated_at: new Date() }
    );
    return result.modifiedCount;
  }
}

// Export singleton instance
export const jobRepository = new JobRepository();
export default jobRepository;