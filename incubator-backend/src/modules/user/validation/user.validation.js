/**
 * The user validation file
 * Defines Joi schemas for validating user-related inputs
 * Uses updated constants, error messages, and password policy
 */

import Joi from "joi";
import JoiObjectId from "joi-objectid";
import sanitize from "mongo-sanitize";
import {
  ERROR_MESSAGES,
  ROLES,
  USER_STATUSES,
  PROFILE_STATUSES,
  PASSWORD_POLICY,
} from "../../../utils/constants";

// Initialize JoiObjectId
const objectId = JoiObjectId(Joi);

class UserValidation {
  /**
   * Sanitizes input data to prevent MongoDB injection
   * @param {Object} data - The data to sanitize
   * @returns {Object} - Sanitized data
   */
  static sanitizeInput(data) {
    return sanitize(data);
  }

  // ================================
  // 1. CORE USER SCHEMAS
  // ================================

  /**
   * Schema for creating a new user (used in register)
   */
  static createUserSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.email": ERROR_MESSAGES.INVALID_EMAIL,
        "any.required": ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
      }),
    password: Joi.string()
      .min(PASSWORD_POLICY.MIN_LENGTH)
      .pattern(
        new RegExp(
          `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{${PASSWORD_POLICY.MIN_LENGTH},}$`
        )
      )
      .required()
      .messages({
        "string.min": `Password must be at least ${PASSWORD_POLICY.MIN_LENGTH} characters long`,
        "string.pattern.base": ERROR_MESSAGES.INVALID_PASSWORD,
        "any.required": ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
      }),
    role: Joi.string()
      .valid(ROLES.STUDENT, ROLES.COMPANY, ROLES.ADMIN)
      .required()
      .messages({
        "any.only": ERROR_MESSAGES.INVALID_ROLE,
        "any.required": ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
      }),
    status: Joi.string()
      .valid(
        USER_STATUSES.PENDING,
        USER_STATUSES.APPROVED,
        USER_STATUSES.REJECTED,
        USER_STATUSES.DELETED
      )
      .default(USER_STATUSES.PENDING),
    is_active: Joi.boolean().default(true),
    photo_url: Joi.string().uri().allow(null),
    email_verified: Joi.boolean().default(false),
  }).options({ stripUnknown: true });

  /**
   * Schema for user login
   */
  static loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": ERROR_MESSAGES.INVALID_EMAIL,
      "any.required": ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
    }),
    password: Joi.string().required().messages({
      "any.required": ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
    }),
  }).options({ stripUnknown: true });

  /**
   * Schema for password reset request
   */
  static requestPasswordResetSchema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": ERROR_MESSAGES.INVALID_EMAIL,
      "any.required": ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
    }),
  }).options({ stripUnknown: true });

  /**
   * Schema for resetting password
   */
  static resetPasswordSchema = Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Reset token is required",
    }),
    password: Joi.string()
      .min(PASSWORD_POLICY.MIN_LENGTH)
      .pattern(
        new RegExp(
          `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{${PASSWORD_POLICY.MIN_LENGTH},}$`
        )
      )
      .required()
      .messages({
        "string.min": `Password must be at least ${PASSWORD_POLICY.MIN_LENGTH} characters long`,
        "string.pattern.base": ERROR_MESSAGES.INVALID_PASSWORD,
        "any.required": ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
      }),
    confirmPassword: Joi.any()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH,
        "any.required": "Confirm password is required",
      }),
  }).options({ stripUnknown: true });

  // ================================
  // 2. PROFILE SCHEMAS (ROLE-SPECIFIC)
  // ================================

  /**
   * Student profile fields
   */
  static studentProfileSchema = Joi.object({
    first_name: Joi.string().trim().max(50).required().messages({
      "string.max": "First name must not exceed 50 characters",
      "any.required": "First name is required",
    }),
    last_name: Joi.string().trim().max(50).required().messages({
      "string.max": "Last name must not exceed 50 characters",
      "any.required": "Last name is required",
    }),
    bio: Joi.string().allow("").max(1000).default(""),
    social_links: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required().messages({
            "any.required": "Social link name is required",
          }),
          url: Joi.string().uri().required().messages({
            "string.uri": "Social link URL must be valid",
            "any.required": "Social link URL is required",
          }),
        })
      )
      .max(10)
      .default([]),
    cv_url: Joi.string().uri().allow(null),
    skills: Joi.array()
      .items(Joi.string().trim().max(30))
      .max(20)
      .default([])
      .messages({
        "array.max": ERROR_MESSAGES.SKILLS_LIMIT_EXCEEDED,
      }),
    education: Joi.array()
      .items(
        Joi.object({
          school: Joi.string().required(),
          qualification: Joi.string().required(),
          field_of_study: Joi.string().required(),
          start_date: Joi.date().required(),
          end_date: Joi.date().allow(null),
          is_current: Joi.boolean().default(false),
        })
      )
      .max(10)
      .default([]),
    work_experience: Joi.array()
      .items(
        Joi.object({
          title: Joi.string().required(),
          company: Joi.string().required(),
          location: Joi.string().required(),
          start_date: Joi.date().required(),
          end_date: Joi.date().allow(null),
          is_current: Joi.boolean().default(false),
          description: Joi.string().allow("").max(2000).default(""),
        })
      )
      .max(10)
      .default([]),
    status: Joi.string()
      .valid(PROFILE_STATUSES.ACTIVE, PROFILE_STATUSES.JOB_SEEKING, PROFILE_STATUSES.INACTIVE)
      .default(PROFILE_STATUSES.ACTIVE),
  }).options({ stripUnknown: true });

  /**
   * Company profile fields
   */
  static companyProfileSchema = Joi.object({
    name: Joi.string().trim().max(100).required().messages({
      "any.required": ERROR_MESSAGES.COMPANY_NAME_REQUIRED,
    }),
    description: Joi.string().trim().max(2000).required().messages({
      "any.required": "Company description is required",
    }),
    industry: Joi.string().trim().required().messages({
      "any.required": ERROR_MESSAGES.INDUSTRY_REQUIRED,
    }),
    website: Joi.string().uri().allow("").default(""),
    social_links: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          url: Joi.string().uri().required(),
        })
      )
      .max(10)
      .default([]),
  }).options({ stripUnknown: true });

  /**
   * Admin profile fields
   */
  static adminProfileSchema = Joi.object({
    name: Joi.string().trim().max(100).required(),
    permissions: Joi.array()
      .items(Joi.string().valid("create", "read", "update", "delete", "super"))
      .default(["read"]),
    title: Joi.string().default("moderator"),
  }).options({ stripUnknown: true });

  // ================================
  // 3. UPDATE SCHEMAS
  // ================================

  /**
   * Generic update schema for user fields
   */
  static updateUserSchema = Joi.object({
    photo_url: Joi.string().uri().allow(null),
    is_active: Joi.boolean(),
  }).options({ stripUnknown: true });

  /**
   * Dynamic update schema — will be combined with role-specific schema
   */
  static updateProfileSchema = Joi.object({}).unknown(true);

  // ================================
  // 4. SEARCH & PAGINATION
  // ================================

  /**
   * Schema for searching users
   */
  static searchUsersSchema = Joi.object({
    searchTerm: Joi.string().min(1).optional().messages({
      "string.min": "Search term must be at least 1 character",
    }),
    page: Joi.number().integer().min(1).default(1).messages({
      "number.min": ERROR_MESSAGES.INVALID_PAGE,
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.max": ERROR_MESSAGES.INVALID_LIMIT,
    }),
    includeDeleted: Joi.boolean().default(false),
    role: Joi.string().valid(ROLES.STUDENT, ROLES.COMPANY, ROLES.ADMIN).optional(),
    status: Joi.string()
      .valid(
        USER_STATUSES.PENDING,
        USER_STATUSES.APPROVED,
        USER_STATUSES.REJECTED
      )
      .optional(),
  }).options({ stripUnknown: true });

  /**
   * Schema for deleting or restoring a user
   */
  static deleteOrRestoreUserSchema = Joi.object({
    id: objectId().required().messages({
      "string.pattern.name": "Invalid user ID format",
      "any.required": "User ID is required",
    }),
  }).options({ stripUnknown: true });

  /**
   * Schema for file upload (photo/CV)
   */
  static fileUploadSchema = Joi.object({
    file: Joi.any().required().messages({
      "any.required": "File is required",
    }),
  }).unknown(true);

  /**
   * Schema for education entry
   */
  static educationSchema = Joi.object({
    school: Joi.string().trim().max(100).required().messages({
      "any.required": "School name is required",
    }),
    qualification: Joi.string().trim().max(100).required().messages({
      "any.required": "Qualification is required",
    }),
    field_of_study: Joi.string().trim().max(100).required().messages({
      "any.required": "Field of study is required",
    }),
    start_date: Joi.date().required().messages({
      "any.required": "Start date is required",
    }),
    end_date: Joi.date().allow(null),
    is_current: Joi.boolean().default(false),
  }).options({ stripUnknown: true });
   

  // ================================
  // 5. VALIDATION HELPER
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
  // 6. DYNAMIC SCHEMA BUILDER
  // ================================

  /**
   * Build registration schema with role-specific profile
   * @param {string} role
   * @returns {Joi.Schema}
   */
  static buildRegisterSchema(role) {
    let profileSchema;
    switch (role) {
      case ROLES.STUDENT:
        profileSchema = this.studentProfileSchema;
        break;
      case ROLES.COMPANY:
        profileSchema = this.companyProfileSchema;
        break;
      case ROLES.ADMIN:
        profileSchema = this.adminProfileSchema;
        break;
      default:
        throw new Error(ERROR_MESSAGES.INVALID_ROLE);
    }

    return this.createUserSchema.keys({
      profile: profileSchema.required(),
    });
  }

  /**
   * Build profile update schema based on role
   * @param {string} role
   * @returns {Joi.Schema}
   */
  static buildUpdateProfileSchema(role) {
    let profileSchema;
    switch (role) {
      case ROLES.STUDENT:
        profileSchema = this.studentProfileSchema;
        break;
      case ROLES.COMPANY:
        profileSchema = this.companyProfileSchema;
        break;
      case ROLES.ADMIN:
        profileSchema = this.adminProfileSchema;
        break;
      default:
        throw new Error(ERROR_MESSAGES.INVALID_ROLE);
    }

    return this.updateUserSchema.concat(profileSchema.fork([], (field) => field.optional()));
  }
}

export default UserValidation;