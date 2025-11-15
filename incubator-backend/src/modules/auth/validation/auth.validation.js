/**
 * Auth Validation Module
 * Joi schemas for all authentication flows
 * Uses updated constants & error messages
 */

import Joi from "joi";
import sanitize from "mongo-sanitize";
import {
  ERROR_MESSAGES,
  ROLES,
  PASSWORD_POLICY,
} from "../../../utils/constants";

class AuthValidation {
  /**
   * Sanitizes input data to prevent MongoDB injection
   * @param {Object} data - The data to sanitize
   * @returns {Object} - Sanitized data
   */
  static sanitizeInput(data) {
    return sanitize(data);
  }

  // ================================
  // 1. REGISTER
  // ================================

  /**
   * Schema for user registration
   * Reuses UserValidation.buildRegisterSchema(role) internally
   * But provides standalone schema for AuthService
   */
  static registerSchema = Joi.object({
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
    confirmPassword: Joi.any()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH,
        "any.required": "Confirm password is required",
      }),
    role: Joi.string()
      .valid(ROLES.STUDENT, ROLES.COMPANY, ROLES.ADMIN)
      .required()
      .messages({
        "any.only": ERROR_MESSAGES.INVALID_ROLE,
        "any.required": ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
      }),
    profile: Joi.object().unknown(true).required().messages({
      "any.required": "Profile data is required",
    }),
  }).options({ stripUnknown: true });

  // ================================
  // 2. LOGIN
  // ================================

  /**
   * Schema for user login
   */
  static loginSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.email": ERROR_MESSAGES.INVALID_EMAIL,
        "any.required": ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
      }),
    password: Joi.string()
      .min(1)
      .required()
      .messages({
        "any.required": ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
      }),
  }).options({ stripUnknown: true });

  // ================================
  // 3. TOKEN REFRESH
  // ================================

  /**
   * Schema for refreshing access token
   */
  static refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required().messages({
      "any.required": "Refresh token is required",
      "string.empty": "Refresh token cannot be empty",
    }),
  }).options({ stripUnknown: true });

  // ================================
  // 4. LOGOUT
  // ================================

  /**
   * Schema for logout (optional body)
   */
  static logoutSchema = Joi.object({
    refreshToken: Joi.string().optional(),
  }).options({ stripUnknown: true });

  // ================================
  // 5. PASSWORD RESET REQUEST
  // ================================

  /**
   * Schema for forgot password
   */
  static forgotPasswordSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        "string.email": ERROR_MESSAGES.INVALID_EMAIL,
        "any.required": ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
      }),
  }).options({ stripUnknown: true });

  // ================================
  // 6. PASSWORD RESET CONFIRM
  // ================================

  /**
   * Schema for resetting password with token
   */
  static resetPasswordSchema = Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Reset token is required",
      "string.empty": "Reset token cannot be empty",
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
  // 7. EMAIL VERIFICATION
  // ================================

  /**
   * Schema for email verification via token
   */
  static verifyEmailSchema = Joi.object({
    token: Joi.string().required().messages({
      "any.required": "Verification token is required",
      "string.empty": "Verification token cannot be empty",
    }),
  }).options({ stripUnknown: true });

  // ================================
  // 8. VALIDATION HELPER
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
}

export default AuthValidation;