/**
 * Job Validation Module
 * Joi schemas for job-related operations
 */

import Joi from "joi";
import JoiObjectId from "joi-objectid";
import sanitize from "mongo-sanitize";
import { ERROR_MESSAGES } from "../../../utils/constants";

// Initialize JoiObjectId
const objectId = JoiObjectId(Joi);

class JobValidation {
  /**
   * Sanitizes input data to prevent MongoDB injection
   * @param {Object} data - The data to sanitize
   * @returns {Object} - Sanitized data
   */
  static sanitizeInput(data) {
    return sanitize(data);
  }

  // ========================================
  // 1. CREATE JOB SCHEMA
  // ========================================

  /**
   * Schema for creating a new job
   */
  static createJobSchema = Joi.object({
    company: objectId().required().messages({
      "string.pattern.name": "Invalid company ID format",
      "any.required": "Company ID is required",
    }),

    title: Joi.string()
      .trim()
      .min(5)
      .max(200)
      .required()
      .messages({
        "string.min": "Job title must be at least 5 characters",
        "string.max": "Job title cannot exceed 200 characters",
        "any.required": "Job title is required",
      }),

    description: Joi.string()
      .trim()
      .min(50)
      .max(5000)
      .required()
      .messages({
        "string.min": "Job description must be at least 50 characters",
        "string.max": "Job description cannot exceed 5000 characters",
        "any.required": "Job description is required",
      }),

    location: Joi.string()
      .trim()
      .max(100)
      .default("Remote")
      .messages({
        "string.max": "Location cannot exceed 100 characters",
      }),

    salary_range: Joi.object({
      min: Joi.number().positive().allow(null).messages({
        "number.positive": "Minimum salary must be positive",
      }),
      max: Joi.number()
        .positive()
        .greater(Joi.ref("min"))
        .allow(null)
        .messages({
          "number.positive": "Maximum salary must be positive",
          "number.greater": "Maximum salary must be greater than minimum",
        }),
      currency: Joi.string()
        .valid("GHS", "USD", "EUR", "GBP")
        .default("GHS"),
      display: Joi.string().allow(null, ""),
    }).optional(),

    job_type: Joi.string()
      .valid("full-time", "part-time", "internship", "contract", "remote", "hybrid")
      .required()
      .messages({
        "any.only": "Invalid job type",
        "any.required": "Job type is required",
      }),

    experience_level: Joi.string()
      .valid("entry", "junior", "mid", "senior", "lead", "executive")
      .default("entry"),

    skills: Joi.array()
      .items(Joi.string().trim().max(50))
      .max(20)
      .default([])
      .messages({
        "array.max": "Cannot have more than 20 skills",
      }),

    requirements: Joi.array()
      .items(Joi.string().trim().max(500))
      .max(15)
      .default([])
      .messages({
        "array.max": "Cannot have more than 15 requirements",
      }),

    benefits: Joi.array()
      .items(Joi.string().trim().max(200))
      .max(20)
      .default([]),

    status: Joi.string()
      .valid("open", "draft", "paused")
      .default("draft"),

    closing_date: Joi.date()
      .greater("now")
      .allow(null)
      .messages({
        "date.greater": "Closing date must be in the future",
      }),

    application_url: Joi.string()
      .uri()
      .allow(null, "")
      .messages({
        "string.uri": "Application URL must be a valid URL",
      }),

    is_featured: Joi.boolean().default(false),

    featured_until: Joi.date().greater("now").allow(null),
  }).options({ stripUnknown: true });

  // ========================================
  // 2. UPDATE JOB SCHEMA
  // ========================================

  /**
   * Schema for updating a job
   */
  static updateJobSchema = Joi.object({
    title: Joi.string().trim().min(5).max(200).messages({
      "string.min": "Job title must be at least 5 characters",
      "string.max": "Job title cannot exceed 200 characters",
    }),

    description: Joi.string().trim().min(50).max(5000).messages({
      "string.min": "Job description must be at least 50 characters",
      "string.max": "Job description cannot exceed 5000 characters",
    }),

    location: Joi.string().trim().max(100),

    salary_range: Joi.object({
      min: Joi.number().positive().allow(null),
      max: Joi.number().positive().allow(null),
      currency: Joi.string().valid("GHS", "USD", "EUR", "GBP"),
      display: Joi.string().allow(null, ""),
    }).optional(),

    job_type: Joi.string().valid(
      "full-time",
      "part-time",
      "internship",
      "contract",
      "remote",
      "hybrid"
    ),

    experience_level: Joi.string().valid(
      "entry",
      "junior",
      "mid",
      "senior",
      "lead",
      "executive"
    ),

    skills: Joi.array()
      .items(Joi.string().trim().max(50))
      .max(20)
      .messages({
        "array.max": "Cannot have more than 20 skills",
      }),

    requirements: Joi.array()
      .items(Joi.string().trim().max(500))
      .max(15)
      .messages({
        "array.max": "Cannot have more than 15 requirements",
      }),

    benefits: Joi.array()
      .items(Joi.string().trim().max(200))
      .max(20),

    closing_date: Joi.date().greater("now").allow(null).messages({
      "date.greater": "Closing date must be in the future",
    }),

    application_url: Joi.string().uri().allow(null, "").messages({
      "string.uri": "Application URL must be a valid URL",
    }),

    is_featured: Joi.boolean(),

    featured_until: Joi.date().greater("now").allow(null),
  })
    .min(1)
    .options({ stripUnknown: true })
    .messages({
      "object.min": "At least one field must be provided for update",
    });

  // ========================================
  // 3. STATUS UPDATE SCHEMA
  // ========================================

  /**
   * Schema for updating job status
   */
  static updateStatusSchema = Joi.object({
    status: Joi.string()
      .valid("open", "closed", "paused", "draft")
      .required()
      .messages({
        "any.only": "Invalid status value",
        "any.required": "Status is required",
      }),
  }).options({ stripUnknown: true });

  // ========================================
  // 4. SEARCH & FILTER SCHEMAS
  // ========================================

  /**
   * Schema for searching jobs
   */
  static searchJobsSchema = Joi.object({
    q: Joi.string().trim().min(2).required().messages({
      "string.min": "Search term must be at least 2 characters",
      "any.required": "Search term is required",
    }),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    location: Joi.string().trim().allow(""),
    job_type: Joi.string().valid(
      "full-time",
      "part-time",
      "internship",
      "contract",
      "remote",
      "hybrid"
    ),
    experience_level: Joi.string().valid(
      "entry",
      "junior",
      "mid",
      "senior",
      "lead",
      "executive"
    ),
  }).options({ stripUnknown: true });

  /**
   * Schema for filtering jobs
   */
  static filterJobsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    location: Joi.string().trim().allow(""),
    job_type: Joi.string().valid(
      "full-time",
      "part-time",
      "internship",
      "contract",
      "remote",
      "hybrid"
    ),
    experience_level: Joi.string().valid(
      "entry",
      "junior",
      "mid",
      "senior",
      "lead",
      "executive"
    ),
    skills: Joi.alternatives()
      .try(
        Joi.string().trim(), // Single skill as string
        Joi.array().items(Joi.string().trim()) // Multiple skills as array
      )
      .messages({
        "alternatives.match": "Skills must be a string or array of strings",
      }),
    min_salary: Joi.number().positive().allow(null),
    max_salary: Joi.number().positive().allow(null),
    company: objectId().messages({
      "string.pattern.name": "Invalid company ID format",
    }),
    sort: Joi.string()
      .valid("recent", "oldest", "views", "applications", "salary_low", "salary_high")
      .default("recent"),
  }).options({ stripUnknown: true });

  /**
   * Schema for getting jobs list
   */
  static listJobsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      "number.min": ERROR_MESSAGES.INVALID_PAGE,
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.max": ERROR_MESSAGES.INVALID_LIMIT,
    }),
    status: Joi.string().valid("open", "closed", "paused", "draft", "deleted"),
    sort: Joi.string().default("-posted_at"),
  }).options({ stripUnknown: true });

  // ========================================
  // 5. BULK OPERATIONS SCHEMA
  // ========================================

  /**
   * Schema for bulk status update
   */
  static bulkUpdateStatusSchema = Joi.object({
    jobIds: Joi.array()
      .items(objectId())
      .min(1)
      .max(50)
      .required()
      .messages({
        "array.min": "At least one job ID is required",
        "array.max": "Cannot update more than 50 jobs at once",
        "any.required": "Job IDs array is required",
      }),
    status: Joi.string()
      .valid("open", "closed", "paused")
      .required()
      .messages({
        "any.only": "Invalid status value",
        "any.required": "Status is required",
      }),
  }).options({ stripUnknown: true });

  // ========================================
  // 6. ANALYTICS SCHEMA
  // ========================================

  /**
   * Schema for analytics query
   */
  static analyticsSchema = Joi.object({
    period: Joi.number().integer().min(1).max(365).default(30).messages({
      "number.min": "Period must be at least 1 day",
      "number.max": "Period cannot exceed 365 days",
    }),
  }).options({ stripUnknown: true });

  // ========================================
  // 7. VALIDATION HELPER
  // ========================================

  /**
   * Validates and sanitizes input data against a schema
   * @param {Object} data - The data to validate
   * @param {Joi.Schema} schema - The Joi schema to validate against
   * @returns {Object} - Validated and sanitized data
   * @throws {Error} - If validation fails
   */
  static validate(data, schema) {
    const sanitizedData = this.sanitizeInput(data);
    const { error, value } = schema.validate(sanitizedData, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessages = error.details
        .map((detail) => detail.message)
        .join("; ");
      throw new Error(`Validation failed: ${errorMessages}`);
    }

    return value;
  }

  // ========================================
  // 8. HELPER: PARSE SKILLS
  // ========================================

  /**
   * Parse skills from string or array
   * @param {string|Array} skills
   * @returns {Array}
   */
  static parseSkills(skills) {
    if (Array.isArray(skills)) {
      return skills;
    }
    if (typeof skills === "string") {
      return skills.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }

  // ========================================
  // 9. HELPER: BUILD SORT OBJECT
  // ========================================

  /**
   * Convert sort string to MongoDB sort object
   * @param {string} sortStr - e.g., 'recent', 'views', 'salary_high'
   * @returns {Object}
   */
  static buildSortObject(sortStr) {
    const sortMap = {
      recent: { posted_at: -1 },
      oldest: { posted_at: 1 },
      views: { view_count: -1 },
      applications: { application_count: -1 },
      salary_low: { "salary_range.min": 1 },
      salary_high: { "salary_range.max": -1 },
    };

    return sortMap[sortStr] || { posted_at: -1 };
  }
}

export default JobValidation;