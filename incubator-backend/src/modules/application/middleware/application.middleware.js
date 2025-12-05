/**
 * Application Middleware
 * Handles application-specific middleware for authorization and validation
 * Features: Ownership checks, permission verification, file upload handling
 */

import ApplicationValidation from "../validation/application.validation";
import { applicationRepository } from "../repositories/application.repository";
import { jobRepository } from "../../job/repositories/job.repository";
import { studentRepository } from "../../user/repositories/student.repository";
import { companyRepository } from "../../user/repositories/company.repository";
import { ERROR_MESSAGES } from "../../../utils/constants";
import multer from "multer";
import path from "path";

// ========================================
// 1. OWNERSHIP & PERMISSION CHECKS
// ========================================

/**
 * Verify student owns the application
 * Middleware to check if current user is the owner of the application
 */
export const verifyApplicationOwnership = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;
    const userId = req.user._id;

    // Get application
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: ERROR_MESSAGES.APPLICATION_NOT_FOUND,
      });
    }

    // Get student profile
    const student = await studentRepository.getByUserId(userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: ERROR_MESSAGES.PROFILE_NOT_FOUND,
      });
    }

    // Check ownership
    if (application.student.toString() !== student._id.toString()) {
      return res.status(403).json({
        success: false,
        error: ERROR_MESSAGES.FORBIDDEN,
      });
    }

    // Attach to request for use in controller
    req.application = application;
    req.studentProfile = student;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to verify application ownership",
    });
  }
};

/**
 * Verify company owns the job (for accessing job applications)
 */
export const verifyJobOwnership = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    // Get job
    const job = await jobRepository.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: ERROR_MESSAGES.JOB_NOT_FOUND,
      });
    }

    // Get company profile
    const company = await companyRepository.getByUserId(userId);
    if (!company) {
      return res.status(404).json({
        success: false,
        error: "Company profile not found",
      });
    }

    // Check ownership
    if (job.company.toString() !== company._id.toString()) {
      return res.status(403).json({
        success: false,
        error: ERROR_MESSAGES.FORBIDDEN,
      });
    }

    // Attach to request
    req.job = job;
    req.companyProfile = company;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to verify job ownership",
    });
  }
};

/**
 * Verify user can access application
 * Used for viewing application details
 */
export const verifyApplicationAccess = async (req, res, next) => {
  try {
    const { id: applicationId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Get application with populated data
    const application = await applicationRepository.findById(applicationId, {
      populate: [{ path: "job" }, { path: "student" }],
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: ERROR_MESSAGES.APPLICATION_NOT_FOUND,
      });
    }

    // Admin can access all
    if (userRole === "admin") {
      req.application = application;
      return next();
    }

    // Student can access their own
    if (userRole === "student") {
      const student = await studentRepository.getByUserId(userId);
      if (
        !student ||
        application.student._id.toString() !== student._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          error: ERROR_MESSAGES.FORBIDDEN,
        });
      }
      req.application = application;
      req.studentProfile = student;
      return next();
    }

    // Company can access applications for their jobs
    if (userRole === "company") {
      const company = await companyRepository.getByUserId(userId);
      if (
        !company ||
        application.job.company.toString() !== company._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          error: ERROR_MESSAGES.FORBIDDEN,
        });
      }
      req.application = application;
      req.companyProfile = company;
      return next();
    }

    return res.status(403).json({
      success: false,
      error: ERROR_MESSAGES.UNAUTHORIZED,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to verify application access",
    });
  }
};

// ========================================
// 2. VALIDATION MIDDLEWARE
// ========================================

/**
 * Validate application creation
 */
export const validateCreateApplication = (req, res, next) => {
  try {
    req.body = ApplicationValidation.validate(
      req.body,
      ApplicationValidation.createApplicationSchema
    );
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Validation failed",
    });
  }
};

/**
 * Validate application update
 */
export const validateUpdateApplication = (req, res, next) => {
  try {
    req.body = ApplicationValidation.validate(
      req.body,
      ApplicationValidation.updateApplicationSchema
    );
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Validation failed",
    });
  }
};

/**
 * Validate status update
 */
export const validateStatusUpdate = (req, res, next) => {
  try {
    req.body = ApplicationValidation.validate(
      req.body,
      ApplicationValidation.updateStatusSchema
    );
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Validation failed",
    });
  }
};

/**
 * Validate search/filter parameters
 */
export const validateSearchApplications = (req, res, next) => {
  try {
    req.query = ApplicationValidation.validate(
      { ...req.query, ...req.params },
      ApplicationValidation.searchApplicationsSchema
    );
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Validation failed",
    });
  }
};

/**
 * Validate bulk operations
 */
export const validateBulkUpdate = (req, res, next) => {
  try {
    req.body = ApplicationValidation.validate(
      req.body,
      ApplicationValidation.bulkUpdateStatusSchema
    );
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Validation failed",
    });
  }
};

// ========================================
// 3. FILE UPLOAD MIDDLEWARE
// ========================================

/**
 * Configure multer storage for resume uploads
 */
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resumes/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

/**
 * File filter for resume uploads (PDF, DOC, DOCX only)
 */
const resumeFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF and Word documents are allowed."
      ),
      false
    );
  }
};

/**
 * Multer upload configuration for resumes
 */
export const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single("resume");

/**
 * Handle multer errors
 */
export const handleResumeUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: ERROR_MESSAGES.FILE_TOO_LARGE,
      });
    }
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message || "File upload failed",
    });
  }

  next();
};

// ========================================
// 4. APPLICATION STATE CHECKS
// ========================================

/**
 * Check if application is editable (only pending applications)
 */
export const checkApplicationEditable = async (req, res, next) => {
  try {
    const application = req.application; // Attached by previous middleware

    if (!application) {
      return res.status(404).json({
        success: false,
        error: ERROR_MESSAGES.APPLICATION_NOT_FOUND,
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "Cannot edit application after it has been reviewed",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to check application state",
    });
  }
};

/**
 * Check if application can be withdrawn
 */
export const checkApplicationWithdrawable = async (req, res, next) => {
  try {
    const application = req.application;

    if (!application) {
      return res.status(404).json({
        success: false,
        error: ERROR_MESSAGES.APPLICATION_NOT_FOUND,
      });
    }

    if (["accepted", "rejected"].includes(application.status)) {
      return res.status(400).json({
        success: false,
        error:
          "Cannot withdraw application that has been accepted or rejected",
      });
    }

    if (application.deleted_at) {
      return res.status(400).json({
        success: false,
        error: "Application has already been withdrawn",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to check application state",
    });
  }
};

/**
 * Check if job is still accepting applications
 */
export const checkJobAcceptingApplications = async (req, res, next) => {
  try {
    const { job_id } = req.body;

    const job = await jobRepository.findById(job_id);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: ERROR_MESSAGES.JOB_NOT_FOUND,
      });
    }

    if (job.status !== "active") {
      return res.status(400).json({
        success: false,
        error: ERROR_MESSAGES.JOB_CLOSED,
      });
    }

    if (job.application_deadline && new Date(job.application_deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        error: "Job application deadline has passed",
      });
    }

    req.job = job;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to check job status",
    });
  }
};

/**
 * Check for duplicate application
 */
export const checkDuplicateApplication = async (req, res, next) => {
  try {
    const { job_id } = req.body;
    const userId = req.user._id;

    // Get student profile
    const student = await studentRepository.getByUserId(userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: ERROR_MESSAGES.PROFILE_NOT_FOUND,
      });
    }

    // Check for existing application
    const existingApplication = await applicationRepository.findDuplicate(
      job_id,
      student._id
    );

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        error: ERROR_MESSAGES.APPLICATION_EXISTS,
      });
    }

    req.studentProfile = student;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to check for duplicate application",
    });
  }
};

// ========================================
// 5. RATE LIMITING (Optional)
// ========================================

/**
 * Rate limit application submissions per student
 * Prevents spam applications
 */
export const rateLimitApplications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const student = await studentRepository.getByUserId(userId);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: ERROR_MESSAGES.PROFILE_NOT_FOUND,
      });
    }

    // Check applications in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentApplications = await applicationRepository.model
      .countDocuments({
        student: student._id,
        applied_date: { $gte: oneDayAgo },
        deleted_at: null,
      });

    // Limit to 10 applications per day
    if (recentApplications >= 10) {
      return res.status(429).json({
        success: false,
        error: "Application limit reached. Maximum 10 applications per day.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to check rate limit",
    });
  }
};

// ========================================
// 6. EXPORT ALL MIDDLEWARE
// ========================================

export default {
  // Ownership & Access
  verifyApplicationOwnership,
  verifyJobOwnership,
  verifyApplicationAccess,

  // Validation
  validateCreateApplication,
  validateUpdateApplication,
  validateStatusUpdate,
  validateSearchApplications,
  validateBulkUpdate,

  // File Upload
  uploadResume,
  handleResumeUploadError,

  // State Checks
  checkApplicationEditable,
  checkApplicationWithdrawable,
  checkJobAcceptingApplications,
  checkDuplicateApplication,

  // Rate Limiting
  rateLimitApplications,
};