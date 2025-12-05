/**
 * Application Validation Module
 * Joi schemas for job application operations
 * Covers: create, update, search, status changes, and bulk operations
 */

import Joi from "joi";
import JoiObjectId from "joi-objectid";
import sanitize from "mongo-sanitize";
import {
  ERROR_MESSAGES,
  DEFAULT_PAGINATION,
} from "../../../utils/constants";

// Initialize JoiObjectId
const objectId = JoiObjectId(Joi);

class ApplicationValidation {
  /**
   * Sanitizes input data to prevent MongoDB injection
   * @param {Object} data - The data to sanitize
   * @returns {Object} - Sanitized data
   */
  static sanitizeInput(data) {
    return sanitize(data);
  }

  // ================================
  // 1. CREATE APPLICATION
  // ================================

  /**
   * Schema for submitting a job application
   */
  static createApplicationSchema = Joi.object({
    job_id: objectId().required().messages({
      "string.pattern.name": "Invalid job ID format",
      "any.required": "Job ID is required",
    }),
    cover_letter: Joi.string()
      .min(50)
      .max(2000)
      .required()
      .messages({
        "string.min": "Cover letter must be at least 50 characters",
        "string.max": "Cover letter must not exceed 2000 characters",
        "any.required": "Cover letter is required",
      }),
    resume_url: Joi.string().uri().optional().messages({
      "string.uri": "Resume URL must be valid",
    }),
    additional_info: Joi.string().max(1000).optional().messages({
      "string.max": "Additional info must not exceed 1000 characters",
    }),
  }).options({ stripUnknown: true });

  // ================================
  // 2. UPDATE APPLICATION
  // ================================

  /**
   * Schema for updating application (student only, before review)
   */
  static updateApplicationSchema = Joi.object({
    cover_letter: Joi.string().min(50).max(2000).optional().messages({
      "string.min": "Cover letter must be at least 50 characters",
      "string.max": "Cover letter must not exceed 2000 characters",
    }),
    resume_url: Joi.string().uri().optional().messages({
      "string.uri": "Resume URL must be valid",
    }),
    additional_info: Joi.string().max(1000).optional().messages({
      "string.max": "Additional info must not exceed 1000 characters",
    }),
  })
    .min(1)
    .options({ stripUnknown: true })
    .messages({
      "object.min": "At least one field must be provided for update",
    });

  // ================================
  // 3. UPDATE APPLICATION STATUS
  // ================================

  /**
   * Schema for updating application status (company/admin)
   */
  static updateStatusSchema = Joi.object({
    status: Joi.string()
      .valid("pending", "reviewing", "approved", "rejected")
      .required()
      .messages({
        "any.only":
          "Status must be one of: pending, reviewing, approved, rejected",
        "any.required": "Status is required",
      }),
    rejection_reason: Joi.string()
      .max(500)
      .when("status", {
        is: "rejected",
        then: Joi.optional(),
        otherwise: Joi.forbidden(),
      })
      .messages({
        "string.max": "Rejection reason must not exceed 500 characters",
        "any.unknown": "Rejection reason only allowed when status is rejected",
      }),
    notes: Joi.string().max(1000).optional().messages({
      "string.max": "Notes must not exceed 1000 characters",
    }),
  }).options({ stripUnknown: true });

  // ================================
  // 4. BULK OPERATIONS
  // ================================

  /**
   * Schema for bulk status update
   */
  static bulkUpdateStatusSchema = Joi.object({
    application_ids: Joi.array()
      .items(objectId())
      .min(1)
      .max(50)
      .required()
      .messages({
        "array.min": "At least one application ID is required",
        "array.max": "Cannot update more than 50 applications at once",
        "any.required": "Application IDs are required",
      }),
    status: Joi.string()
      .valid("pending", "reviewing", "approved", "rejected")
      .required()
      .messages({
        "any.only":
          "Status must be one of: pending, reviewing, approved, rejected",
        "any.required": "Status is required",
      }),
    rejection_reason: Joi.string()
      .max(500)
      .when("status", {
        is: "rejected",
        then: Joi.optional(),
        otherwise: Joi.forbidden(),
      }),
  }).options({ stripUnknown: true });

  /**
   * Schema for bulk delete
   */
  static bulkDeleteSchema = Joi.object({
    application_ids: Joi.array()
      .items(objectId())
      .min(1)
      .max(50)
      .required()
      .messages({
        "array.min": "At least one application ID is required",
        "array.max": "Cannot delete more than 50 applications at once",
        "any.required": "Application IDs are required",
      }),
  }).options({ stripUnknown: true });

  // ================================
  // 5. SEARCH & FILTER
  // ================================

  /**
   * Schema for searching/filtering applications
   */
  static searchApplicationsSchema = Joi.object({
    // Pagination
    page: Joi.number()
      .integer()
      .min(1)
      .default(DEFAULT_PAGINATION.PAGE)
      .messages({
        "number.min": ERROR_MESSAGES.INVALID_PAGE,
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(DEFAULT_PAGINATION.MAX_LIMIT)
      .default(DEFAULT_PAGINATION.LIMIT)
      .messages({
        "number.max": ERROR_MESSAGES.INVALID_LIMIT,
      }),

    // Filters
    job_id: objectId().optional().messages({
      "string.pattern.name": "Invalid job ID format",
    }),
    student_id: objectId().optional().messages({
      "string.pattern.name": "Invalid student ID format",
    }),
    company_id: objectId().optional().messages({
      "string.pattern.name": "Invalid company ID format",
    }),
    status: Joi.string()
      .valid("pending", "reviewing", "approved", "rejected")
      .optional()
      .messages({
        "any.only":
          "Status must be one of: pending, reviewing, approved, rejected",
      }),

    // Date filters
    applied_after: Joi.date().iso().optional().messages({
      "date.format": "Applied after date must be in ISO format (YYYY-MM-DD)",
    }),
    applied_before: Joi.date().iso().optional().messages({
      "date.format": "Applied before date must be in ISO format (YYYY-MM-DD)",
    }),

    // Sorting
    sort_by: Joi.string()
      .valid("applied_date", "updated_at", "status")
      .default("applied_date")
      .optional(),
    sort_order: Joi.string().valid("asc", "desc").default("desc").optional(),

    // Options
    include_deleted: Joi.boolean().default(false).optional(),
    with_job_details: Joi.boolean().default(false).optional(),
    with_student_details: Joi.boolean().default(false).optional(),
  }).options({ stripUnknown: true });

  // ================================
  // 6. GET BY ID
  // ================================

  /**
   * Schema for getting single application
   */
  static getApplicationSchema = Joi.object({
    id: objectId().required().messages({
      "string.pattern.name": "Invalid application ID format",
      "any.required": "Application ID is required",
    }),
    with_job_details: Joi.boolean().default(true).optional(),
    with_student_details: Joi.boolean().default(true).optional(),
    include_deleted: Joi.boolean().default(false).optional(),
  }).options({ stripUnknown: true });

  // ================================
  // 7. WITHDRAW APPLICATION
  // ================================

  /**
   * Schema for withdrawing application (student)
   */
  static withdrawApplicationSchema = Joi.object({
    id: objectId().required().messages({
      "string.pattern.name": "Invalid application ID format",
      "any.required": "Application ID is required",
    }),
    withdrawal_reason: Joi.string().max(500).optional().messages({
      "string.max": "Withdrawal reason must not exceed 500 characters",
    }),
  }).options({ stripUnknown: true });

  // ================================
  // 8. STATISTICS & ANALYTICS
  // ================================

  /**
   * Schema for getting application statistics
   */
  static getStatisticsSchema = Joi.object({
    job_id: objectId().optional().messages({
      "string.pattern.name": "Invalid job ID format",
    }),
    student_id: objectId().optional().messages({
      "string.pattern.name": "Invalid student ID format",
    }),
    company_id: objectId().optional().messages({
      "string.pattern.name": "Invalid company ID format",
    }),
    date_from: Joi.date().iso().optional().messages({
      "date.format": "Date from must be in ISO format (YYYY-MM-DD)",
    }),
    date_to: Joi.date().iso().optional().messages({
      "date.format": "Date to must be in ISO format (YYYY-MM-DD)",
    }),
    group_by: Joi.string()
      .valid("status", "job", "student", "date", "company")
      .default("status")
      .optional(),
  }).options({ stripUnknown: true });

  // ================================
  // 9. SHORTLIST OPERATIONS
  // ================================

  /**
   * Schema for shortlisting application
   */
  static shortlistApplicationSchema = Joi.object({
    id: objectId().required().messages({
      "string.pattern.name": "Invalid application ID format",
      "any.required": "Application ID is required",
    }),
    shortlist_notes: Joi.string().max(500).optional().messages({
      "string.max": "Shortlist notes must not exceed 500 characters",
    }),
  }).options({ stripUnknown: true });

  // ================================
  // 10. DUPLICATE CHECK
  // ================================

  /**
   * Schema for checking duplicate application
   */
  static checkDuplicateSchema = Joi.object({
    job_id: objectId().required().messages({
      "string.pattern.name": "Invalid job ID format",
      "any.required": "Job ID is required",
    }),
    student_id: objectId().optional().messages({
      "string.pattern.name": "Invalid student ID format",
    }),
  }).options({ stripUnknown: true });

  // ================================
  // 11. VALIDATION HELPER
  // ================================

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

  // ================================
  // 12. CUSTOM VALIDATORS
  // ================================

  /**
   * Validate application can be updated
   * @param {Object} application - Application document
   * @param {string} userId - User attempting update
   * @param {string} userRole - User's role
   * @returns {boolean}
   * @throws {Error} - If validation fails
   */
  static validateCanUpdate(application, userId, userRole) {
    // Students can only update their own pending applications
    if (userRole === "student") {
      if (application.student_id.toString() !== userId) {
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      }
      if (application.status !== "pending") {
        throw new Error(
          "Cannot update application after it has been reviewed"
        );
      }
      return true;
    }

    // Companies can update status of applications for their jobs
    if (userRole === "company") {
      // This check would need job details to verify company ownership
      return true;
    }

    // Admins can update anything
    if (userRole === "admin") {
      return true;
    }

    throw new Error(ERROR_MESSAGES.FORBIDDEN);
  }

  /**
   * Validate application can be withdrawn
   * @param {Object} application - Application document
   * @param {string} userId - User attempting withdrawal
   * @returns {boolean}
   * @throws {Error} - If validation fails
   */
  static validateCanWithdraw(application, userId) {
    if (application.student_id.toString() !== userId) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (["approved", "rejected"].includes(application.status)) {
      throw new Error(
        "Cannot withdraw application that has been approved or rejected"
      );
    }

    if (application.deleted_at) {
      throw new Error("Application has already been withdrawn");
    }

    return true;
  }

  /**
   * Validate status transition is allowed
   * @param {string} currentStatus - Current application status
   * @param {string} newStatus - New status to set
   * @returns {boolean}
   * @throws {Error} - If transition is invalid
   */
  static validateStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      pending: ["reviewing", "approved", "rejected"],
      reviewing: ["approved", "rejected", "pending"],
      approved: ["reviewing"], // Can revert to reviewing if needed
      rejected: ["reviewing"], // Can reconsider
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }

    return true;
  }

  /**
   * Validate file upload for application
   * @param {Object} file - Multer file object
   * @returns {boolean}
   * @throws {Error} - If file is invalid
   */
  static validateResumeUpload(file) {
    if (!file) {
      throw new Error(ERROR_MESSAGES.RESUME_REQUIRED);
    }

    const allowedTypes = ["application/pdf", "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(
        "Resume must be PDF or Word document (DOC, DOCX)"
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
    }

    return true;
  }

  /**
   * Validate date range
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {boolean}
   * @throws {Error} - If range is invalid
   */
  static validateDateRange(startDate, endDate) {
    if (startDate && endDate && startDate > endDate) {
      throw new Error("Start date must be before end date");
    }

    // Prevent queries that are too broad (e.g., more than 1 year)
    if (startDate && endDate) {
      const daysDiff = Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24);
      if (daysDiff > 365) {
        throw new Error("Date range cannot exceed 365 days");
      }
    }

    return true;
  }
}

export default ApplicationValidation;