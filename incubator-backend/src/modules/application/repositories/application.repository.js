/**
 * Application Repository (Final - Matches Actual Model)
 * 
 */

import mongoose from "mongoose";
import { BaseRepository } from "../../shared/base.repository";
import Application from "../model/application.model";
import { ERROR_MESSAGES } from "../../../utils/constants";

class ApplicationRepository extends BaseRepository {
  constructor() {
    super(Application);
  }

  // ========================================
  // 1. CORE CRUD (Used by Service)
  // ========================================

  /**
   * Find duplicate application
   * @param {string} jobId
   * @param {string} studentId - Student profile ID
   * @returns {Promise<Object|null>}
   */
  async findDuplicate(jobId, studentId) {
    return await this.findOne({
      job: jobId,
      student: studentId,
      deleted_at: null,
    });
  }

  /**
   * Update application by ID
   * @param {string} applicationId
   * @param {Object} updates
   * @param {Object} [options]
   * @returns {Promise<Object|null>}
   */
  async updateById(applicationId, updates, options = {}) {
    return await this.update({ _id: applicationId }, updates, {
      new: true,
      ...options,
    });
  }

  /**
   * Get application by ID with optional population
   * @param {string} applicationId
   * @param {Object} [options] - { populate, includeDeleted }
   * @returns {Promise<Object|null>}
   */
  async findById(applicationId, options = {}) {
    const query = this.model.findById(applicationId);

    if (options.populate) {
      if (Array.isArray(options.populate)) {
        options.populate.forEach((pop) => query.populate(pop));
      } else {
        query.populate(options.populate);
      }
    }

    if (options.includeDeleted) {
      query._includeDeleted = true;
    }

    return await query.exec();
  }

  // ========================================
  // 2. LIST & SEARCH
  // ========================================

  /**
   * Find all applications with filters, pagination, and population
   * @param {Object} filters
   * @param {number} page
   * @param {number} limit
   * @param {Object} options - { populate, sort, includeDeleted }
   * @returns {Promise<{ data: Array, metadata: Object }>}
   */
  async findAll(filters = {}, page = 1, limit = 10, options = {}) {
    try {
      const skip = (page - 1) * limit;
      const query = this.model.find(filters).skip(skip).limit(limit);

      // Apply options
      if (options.sort) query.sort(options.sort);
      if (options.populate) {
        if (Array.isArray(options.populate)) {
          options.populate.forEach((pop) => query.populate(pop));
        } else {
          query.populate(options.populate);
        }
      }
      if (options.includeDeleted) {
        query._includeDeleted = true;
      }

      const data = await query.lean().exec();

      // Count with same filters
      const countQuery = this.model.countDocuments(filters);
      if (options.includeDeleted) {
        countQuery._includeDeleted = true;
      }
      const total = await countQuery.exec();

      return {
        data,
        metadata: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit) || 1,
        },
      };
    } catch (error) {
      throw new Error(`Find all applications failed: ${error.message}`);
    }
  }

  // ========================================
  // 3. STUDENT-SPECIFIC QUERIES
  // ========================================

  /**
   * Get all applications for a student
   * @param {string} studentId - Student profile ID
   * @param {Object} [filters]
   * @param {number} [page=1]
   * @param {number} [limit=10]
   * @param {Object} [options]
   * @returns {Promise<{ data: Array, metadata: Object }>}
   */
  async getByStudent(
    studentId,
    filters = {},
    page = 1,
    limit = 10,
    options = {}
  ) {
    const queryFilters = {
      student: studentId,
      deleted_at: null,
      ...filters,
    };

    return await this.findAll(queryFilters, page, limit, {
      ...options,
      populate: options.populate || [
        {
          path: "job",
          select: "title location job_type status application_deadline company",
          populate: {
            path: "company",
            select: "name industry website photo_url",
          },
        },
      ],
      sort: options.sort || { applied_date: -1 },
    });
  }

  /**
   * Count student's applications by status
   * @param {string} studentId
   * @returns {Promise<Object>}
   */
  async countByStudentAndStatus(studentId) {
    const result = await this.aggregate([
      {
        $match: {
          student: new mongoose.Types.ObjectId(studentId),
          deleted_at: null,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = {
      total: 0,
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      interviewed: 0,
      accepted: 0,
      rejected: 0,
    };

    result.forEach((item) => {
      statusCounts[item._id] = item.count;
      statusCounts.total += item.count;
    });

    return statusCounts;
  }

  /**
   * Get student's recent applications
   * @param {string} studentId
   * @param {number} [limit=5]
   * @returns {Promise<Array>}
   */
  async getStudentRecentApplications(studentId, limit = 5) {
    return await this.model
      .find({
        student: studentId,
        deleted_at: null,
      })
      .populate("job", "title company status")
      .populate({
        path: "job",
        populate: { path: "company", select: "name" },
      })
      .sort({ applied_date: -1 })
      .limit(limit)
      .lean();
  }

  // ========================================
  // 4. JOB-SPECIFIC QUERIES
  // ========================================

  /**
   * Get applications for a specific job
   * @param {string} jobId
   * @param {Object} [filters]
   * @param {number} [page=1]
   * @param {number} [limit=10]
   * @param {Object} [options]
   * @returns {Promise<{ data: Array, metadata: Object }>}
   */
  async getByJob(jobId, filters = {}, page = 1, limit = 10, options = {}) {
    const queryFilters = {
      job: jobId,
      deleted_at: null,
      ...filters,
    };

    return await this.findAll(queryFilters, page, limit, {
      ...options,
      populate: options.populate || [
        {
          path: "student",
          select: "first_name last_name bio skills cv_url social_links",
          populate: {
            path: "user",
            select: "email photo_url",
          },
        },
      ],
      sort: options.sort || { applied_date: -1 },
    });
  }

  /**
   * Count applications by status for a job
   * @param {string} jobId
   * @returns {Promise<Object>}
   */
  async countByJobAndStatus(jobId) {
    const result = await this.aggregate([
      {
        $match: {
          job: new mongoose.Types.ObjectId(jobId),
          deleted_at: null,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = {
      total: 0,
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      interviewed: 0,
      accepted: 0,
      rejected: 0,
    };

    result.forEach((item) => {
      statusCounts[item._id] = item.count;
      statusCounts.total += item.count;
    });

    return statusCounts;
  }

  // ========================================
  // 5. COMPANY-SPECIFIC QUERIES
  // ========================================

  /**
   * Get all applications for company's jobs
   * @param {string} companyId - Company profile ID
   * @param {Object} [filters]
   * @param {number} [page=1]
   * @param {number} [limit=10]
   * @param {Object} [options]
   * @returns {Promise<{ data: Array, metadata: Object }>}
   */
  async getByCompany(
    companyId,
    filters = {},
    page = 1,
    limit = 10,
    options = {}
  ) {
    const skip = (page - 1) * limit;

    const pipeline = [
      // Join with jobs collection
      {
        $lookup: {
          from: "jobs",
          localField: "job",
          foreignField: "_id",
          as: "jobDetails",
        },
      },
      { $unwind: "$jobDetails" },
      // Match company
      {
        $match: {
          "jobDetails.company": new mongoose.Types.ObjectId(companyId),
          deleted_at: null,
          ...this._convertFiltersForAggregation(filters),
        },
      },
      // Join with students
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      { $unwind: "$studentDetails" },
      // Join with user for student
      {
        $lookup: {
          from: "users",
          localField: "studentDetails.user",
          foreignField: "_id",
          as: "studentUser",
        },
      },
      // Sort
      { $sort: options.sort || { applied_date: -1 } },
      // Paginate
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          metadata: [{ $count: "total" }],
        },
      },
      // Format metadata
      {
        $project: {
          data: 1,
          metadata: {
            page: { $literal: page },
            limit: { $literal: limit },
            total: { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
            pages: {
              $ceil: {
                $divide: [
                  { $ifNull: [{ $arrayElemAt: ["$metadata.total", 0] }, 0] },
                  limit,
                ],
              },
            },
          },
        },
      },
    ];

    const result = await this.aggregate(pipeline);
    const { data = [], metadata = {} } = result[0] || {};

    return {
      data,
      metadata: metadata || { page, limit, total: 0, pages: 0 },
    };
  }

  /**
   * Get pending applications for company
   * @param {string} companyId
   * @param {number} [limit=10]
   * @returns {Promise<Array>}
   */
  async getCompanyPendingApplications(companyId, limit = 10) {
    const pipeline = [
      {
        $match: {
          status: "pending",
          deleted_at: null,
        },
      },
      {
        $lookup: {
          from: "jobs",
          localField: "job",
          foreignField: "_id",
          as: "jobDetails",
        },
      },
      { $unwind: "$jobDetails" },
      {
        $match: {
          "jobDetails.company": new mongoose.Types.ObjectId(companyId),
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      { $sort: { applied_date: -1 } },
      { $limit: limit },
    ];

    return await this.aggregate(pipeline);
  }

  // ========================================
  // 6. STATISTICS & ANALYTICS
  // ========================================

  /**
   * Get application statistics (used by service)
   * @param {Object} filters - Query filters
   * @param {string} [groupBy='status'] - Group by: status, job, student, date
   * @returns {Promise<Array>}
   */
  async getStatistics(filters = {}, groupBy = "status") {
    try {
      // Convert filters to match model field names
      const convertedFilters = this._convertFiltersToModelFields(filters);
      
      const matchStage = {
        deleted_at: null,
        ...this._convertFiltersForAggregation(convertedFilters),
      };

      let groupField;
      switch (groupBy) {
        case "date":
          groupField = {
            $dateToString: { format: "%Y-%m-%d", date: "$applied_date" },
          };
          break;
        case "job_id":
          groupField = "$job";
          break;
        case "student_id":
          groupField = "$student";
          break;
        case "status":
        default:
          groupField = "$status";
      }

      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: groupField,
            count: { $sum: 1 },
            pending: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            reviewing: {
              $sum: { $cond: [{ $eq: ["$status", "reviewing"] }, 1, 0] },
            },
            shortlisted: {
              $sum: { $cond: [{ $eq: ["$status", "shortlisted"] }, 1, 0] },
            },
            interviewed: {
              $sum: { $cond: [{ $eq: ["$status", "interviewed"] }, 1, 0] },
            },
            accepted: {
              $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
            },
            rejected: {
              $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ];

      return await this.aggregate(pipeline);
    } catch (error) {
      throw new Error(`Get statistics failed: ${error.message}`);
    }
  }

  /**
   * Get application metrics for a job
   * @param {string} jobId
   * @returns {Promise<Object>}
   */
  async getJobMetrics(jobId) {
    const result = await this.aggregate([
      {
        $match: {
          job: new mongoose.Types.ObjectId(jobId),
          deleted_at: null,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          reviewing: {
            $sum: { $cond: [{ $eq: ["$status", "reviewing"] }, 1, 0] },
          },
          shortlisted: {
            $sum: { $cond: [{ $eq: ["$status", "shortlisted"] }, 1, 0] },
          },
          interviewed: {
            $sum: { $cond: [{ $eq: ["$status", "interviewed"] }, 1, 0] },
          },
          accepted: {
            $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
          avgResponseTime: { $avg: "$responseTime" },
        },
      },
    ]);

    return (
      result[0] || {
        total: 0,
        pending: 0,
        reviewing: 0,
        shortlisted: 0,
        interviewed: 0,
        accepted: 0,
        rejected: 0,
        avgResponseTime: null,
      }
    );
  }

  /**
   * Get company application metrics
   * @param {string} companyId
   * @param {number} [days=30]
   * @returns {Promise<Object>}
   */
  async getCompanyMetrics(companyId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const pipeline = [
      {
        $lookup: {
          from: "jobs",
          localField: "job",
          foreignField: "_id",
          as: "jobDetails",
        },
      },
      { $unwind: "$jobDetails" },
      {
        $match: {
          "jobDetails.company": new mongoose.Types.ObjectId(companyId),
          deleted_at: null,
          applied_date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalApplications: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          accepted: {
            $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
        },
      },
    ];

    const result = await this.aggregate(pipeline);
    return (
      result[0] || {
        totalApplications: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
      }
    );
  }

  /**
   * Get top applicant skills for a job
   * @param {string} jobId
   * @param {number} [limit=10]
   * @returns {Promise<Array>}
   */
  async getTopSkillsForJob(jobId, limit = 10) {
    const result = await this.aggregate([
      {
        $match: {
          job: new mongoose.Types.ObjectId(jobId),
          deleted_at: null,
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      { $unwind: "$studentDetails" },
      { $unwind: "$studentDetails.skills" },
      {
        $group: {
          _id: "$studentDetails.skills",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          skill: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    return result;
  }

  // ========================================
  // 7. SEARCH & FILTERING
  // ========================================

  /**
   * Search applications by student name or email
   * @param {string} searchTerm
   * @param {string} companyId
   * @param {number} [page=1]
   * @param {number} [limit=10]
   * @returns {Promise<{ data: Array, metadata: Object }>}
   */
  async searchApplications(searchTerm, companyId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $lookup: {
          from: "jobs",
          localField: "job",
          foreignField: "_id",
          as: "jobDetails",
        },
      },
      { $unwind: "$jobDetails" },
      {
        $match: {
          "jobDetails.company": new mongoose.Types.ObjectId(companyId),
          deleted_at: null,
        },
      },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "studentDetails",
        },
      },
      { $unwind: "$studentDetails" },
      {
        $lookup: {
          from: "users",
          localField: "studentDetails.user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $match: {
          $or: [
            {
              "studentDetails.first_name": {
                $regex: searchTerm,
                $options: "i",
              },
            },
            {
              "studentDetails.last_name": {
                $regex: searchTerm,
                $options: "i",
              },
            },
            { "userDetails.email": { $regex: searchTerm, $options: "i" } },
          ],
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          metadata: [{ $count: "total" }],
        },
      },
    ];

    const result = await this.aggregate(pipeline);
    const { data = [], metadata = [] } = result[0] || {};

    return {
      data,
      metadata: {
        page,
        limit,
        total: metadata[0]?.total || 0,
        pages: Math.ceil((metadata[0]?.total || 0) / limit),
      },
    };
  }

  // ========================================
  // 8. BULK OPERATIONS
  // ========================================

  /**
   * Bulk update application statuses
   * @param {string[]} applicationIds
   * @param {string} status
   * @param {string} userId
   * @returns {Promise<number>} - Number of updated applications
   */
  async bulkUpdateStatus(applicationIds, status, userId) {
    const result = await this.model.updateMany(
      { _id: { $in: applicationIds }, deleted_at: null },
      {
        status,
        updated_by: userId,
        updated_at: new Date(),
      }
    );
    return result.modifiedCount;
  }

  // ========================================
  // 9. PRIVATE HELPERS
  // ========================================

  /**
   * Convert service filters (job_id, student_id) to model fields (job, student)
   * @param {Object} filters
   * @returns {Object}
   * @private
   */
  _convertFiltersToModelFields(filters) {
    const converted = { ...filters };
    
    if (converted.job_id) {
      converted.job = converted.job_id;
      delete converted.job_id;
    }
    
    if (converted.student_id) {
      converted.student = converted.student_id;
      delete converted.student_id;
    }
    
    return converted;
  }

  /**
   * Convert filters for aggregation pipeline
   * @param {Object} filters
   * @returns {Object}
   * @private
   */
  _convertFiltersForAggregation(filters) {
    const converted = {};
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      // Convert ObjectId strings to ObjectId instances
      if (mongoose.Types.ObjectId.isValid(value) && typeof value === "string") {
        converted[key] = new mongoose.Types.ObjectId(value);
      } else if (value && typeof value === "object" && value.$in) {
        // Handle $in operator
        converted[key] = {
          $in: value.$in.map((id) => new mongoose.Types.ObjectId(id)),
        };
      } else {
        converted[key] = value;
      }
    });
    return converted;
  }
}

// Export singleton instance
export const applicationRepository = new ApplicationRepository();
export default applicationRepository;