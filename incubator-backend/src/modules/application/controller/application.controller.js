/**
 * Application Controller
 * Handles HTTP requests for job applications
 * Maps requests to service methods and formats responses
 */

import { applicationService } from "../service/application.service.js";
import { sendSuccessResponse, sendErrorResponse } from "../../../utils/helpers/response.helpers.js";
import { HTTP_STATUS_CODES } from "../../../utils/constants.js";

class ApplicationController {
  // ========================================
  // 1. CREATE APPLICATION
  // ========================================

  /**
   * Submit job application
   * POST /api/applications
   * @access Student
   */
  async createApplication(req, res) {
    try {
      const userId = req.user._id; // From auth middleware
      const applicationData = req.body;

      const result = await applicationService.createApplication(
        userId,
        applicationData
      );

      if (!result.success) {
        return sendErrorResponse(
          res,
          result.error,
          "Failed to submit application",
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      return sendSuccessResponse(
        res,
        result.data,
        result.message || "Application submitted successfully",
        HTTP_STATUS_CODES.CREATED
      );
    } catch (error) {
      console.error("Create application error:", error);
      return sendErrorResponse(
        res,
        error,
        "Failed to submit application",
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ========================================
  // 2. UPDATE APPLICATION (Student)
  // ========================================

  /**
   * Update application (student only, before review)
   * PUT /api/applications/:id
   * @access Student
   */
  async updateApplication(req, res) {
    try {
      const applicationId = req.params.id;
      const userId = req.user._id;
      const updates = req.body;

      const result = await applicationService.updateApplication(
        applicationId,
        userId,
        updates
      );

      if (!result.success) {
        return sendErrorResponse(
          res,
          result.error,
          "Failed to update application",
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      return sendSuccessResponse(
        res,
        result.data,
        result.message || "Application updated successfully"
      );
    } catch (error) {
      console.error("Update application error:", error);
      return sendErrorResponse(
        res,
        error,
        "Failed to update application",
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ========================================
  // 3. UPDATE STATUS (Company/Admin)
  // ========================================

  /**
   * Update application status
   * PATCH /api/applications/:id/status
   * @access Company, Admin
   */
  async updateApplicationStatus(req, res) {
    try {
      const applicationId = req.params.id;
      const userId = req.user._id;
      const userRole = req.user.role;
      const statusData = req.body;

      const result = await applicationService.updateApplicationStatus(
        applicationId,
        userId,
        userRole,
        statusData
      );

      if (!result.success) {
        return sendErrorResponse(
          res,
          result.error,
          "Failed to update application status",
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      return sendSuccessResponse(
        res,
        result.data,
        result.message || "Application status updated successfully"
      );
    } catch (error) {
      console.error("Update status error:", error);
      return sendErrorResponse(
        res,
        error,
        "Failed to update application status",
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ========================================
  // 4. WITHDRAW APPLICATION (Student)
  // ========================================

  /**
   * Withdraw application
   * DELETE /api/applications/:id
   * @access Student
   */
  async withdrawApplication(req, res) {
    try {
      const applicationId = req.params.id;
      const userId = req.user._id;
      const { withdrawal_reason } = req.body;

      const result = await applicationService.withdrawApplication(
        applicationId,
        userId,
        { withdrawal_reason }
      );

      if (!result.success) {
        return sendErrorResponse(
          res,
          result.error,
          "Failed to withdraw application",
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      return sendSuccessResponse(
        res,
        result.data,
        result.message || "Application withdrawn successfully"
      );
    } catch (error) {
      console.error("Withdraw application error:", error);
      return sendErrorResponse(
        res,
        error,
        "Failed to withdraw application",
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ========================================
  // 5. GET APPLICATION BY ID
  // ========================================

  /**
   * Get single application details
   * GET /api/applications/:id
   * @access Student (own), Company (own jobs), Admin
   */
  async getApplicationById(req, res) {
    try {
      const applicationId = req.params.id;
      const userId = req.user._id;
      const userRole = req.user.role;
      const options = {
        with_job_details: req.query.with_job_details !== "false",
        with_student_details: req.query.with_student_details !== "false",
        include_deleted: req.query.include_deleted === "true",
      };

      const result = await applicationService.getApplicationById(
        applicationId,
        userId,
        userRole,
        options
      );

      if (!result.success) {
        return sendErrorResponse(
          res,
          result.error,
          "Failed to fetch application",
          HTTP_STATUS_CODES.NOT_FOUND
        );
      }

      return sendSuccessResponse(
        res,
        result.data,
        "Application retrieved successfully"
      );
    } catch (error) {
      console.error("Get application error:", error);
      return sendErrorResponse(
        res,
        error,
        "Failed to fetch application",
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ========================================
  // 6. LIST APPLICATIONS
  // ========================================

  /**
   * List/search applications with filters
   * GET /api/applications
   * @access Student (own), Company (own jobs), Admin (all)
   */
  async listApplications(req, res) {
    try {
      const userId = req.user._id;
      const userRole = req.user.role;

      const filters = {
        job_id: req.query.job_id,
        student_id: req.query.student_id,
        company_id: req.query.company_id,
        status: req.query.status,
        applied_after: req.query.applied_after,
        applied_before: req.query.applied_before,
      };

      const pagination = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
      };

      const options = {
        sort_by: req.query.sort_by || "applied_date",
        sort_order: req.query.sort_order || "desc",
        include_deleted: req.query.include_deleted === "true",
        with_job_details: req.query.with_job_details !== "false",
        with_student_details: req.query.with_student_details !== "false",
      };

      const result = await applicationService.listApplications(
        filters,
        pagination,
        userId,
        userRole,
        options
      );

      if (!result.success) {
        return sendErrorResponse(
          res,
          result.error,
          "Failed to list applications",
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      return sendSuccessResponse(
        res,
        result.data.data,
        "Applications retrieved successfully",
        HTTP_STATUS_CODES.OK,
        result.data.metadata
      );
    } catch (error) {
      console.error("List applications error:", error);
      return sendErrorResponse(
        res,
        error,
        "Failed to list applications",
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ========================================
  // 7. GET MY APPLICATIONS (Student)
  // ========================================

  /**
   * Get current student's applications
   * GET /api/applications/me
   * @access Student
   */
  async getMyApplications(req, res) {
    try {
      const userId = req.user._id;

      const filters = {
        status: req.query.status,
      };

      const pagination = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
      };

      const result = await applicationService.getMyApplications(
        userId,
        filters,
        pagination
      );

      if (!result.success) {
        return sendErrorResponse(
          res,
          result.error,
          "Failed to fetch your applications",
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      return sendSuccessResponse(
        res,
        result.data.data,
        "Your applications retrieved successfully",
        HTTP_STATUS_CODES.OK,
        result.data.metadata
      );
    } catch (error) {
      console.error("Get my applications error:", error);
      return sendErrorResponse(
        res,
        error,
        "Failed to fetch your applications",
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ========================================
  // 8. GET JOB APPLICATIONS (Company)
  // ========================================

  /**
   * Get applications for a specific job
   * GET /api/jobs/:jobId/applications
   * @access Company (own jobs), Admin
   */
  async getJobApplications(req, res) {
    try {
      const jobId = req.params.jobId;
      const userId = req.user._id;

      const filters = {
        status: req.query.status,
      };

      const pagination = {
        page: parseInt(req.query.page, 10) || 1,
        limit: parseInt(req.query.limit, 10) || 10,
      };

      const result = await applicationService.getJobApplications(
        jobId,
        userId,
        filters,
        pagination
      );

      if (!result.success) {
        return sendErrorResponse(
          res,
          result.error,
          "Failed to fetch job applications",
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      return sendSuccessResponse(
        res,
        result.data.data,
        "Job applications retrieved successfully",
        HTTP_STATUS_CODES.OK,
        result.data.metadata
      );
    } catch (error) {
      console.error("Get job applications error:", error);
      return sendErrorResponse(
        res,
        error,
        "Failed to fetch job applications",
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ========================================
  // 9. BULK OPERATIONS
  // ========================================

  /**
   * Bulk update application statuses
   * PATCH /api/applications/bulk/status
   * @access Company, Admin
   */
  async bulkUpdateStatus(req, res) {
    try {
      const userId = req.user._id;
      const userRole = req.user.role;
      const { application_ids, status, rejection_reason } = req.body;

      const result = await applicationService.bulkUpdateStatus(
        application_ids,
        { status, rejection_reason },
        userId,
        userRole
      );

      if (!result.success) {
        return sendErrorResponse(
          res,
          result.error,
          "Failed to bulk update applications",
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      return sendSuccessResponse(
        res,
        result.data,
        result.message || "Applications updated successfully"
      );
    } catch (error) {
      console.error("Bulk update error:", error);
      return sendErrorResponse(
        res,
        error,
        "Failed to bulk update applications",
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Bulk delete applications
   * DELETE /api/applications/bulk
   * @access Admin 
   */
    async bulkDelete(req, res) {
    try {
      const { application_ids } = req.body;

      const result = await applicationService.bulkDelete(application_ids);

      if (!result.success) {
        return sendErrorResponse(
          res,
          result.error,
          "Failed to bulk delete applications",
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      return sendSuccessResponse(
        res,
        result.data,
        result.message || "Applications deleted successfully"
      );
    } catch (error) {
      console.error("Bulk delete error:", error);
      return sendErrorResponse(
        res,
        error,
        "Failed to bulk delete applications",
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }

  // ========================================
  // 10. STATISTICS & ANALYTICS
  // ========================================

  /**
   * Get application statistics
   * GET /api/applications/statistics
   * @access Company (own jobs), Admin
   */
  async getStatistics(req, res) {
    try {
      const userId = req.user._id;
      const userRole = req.user.role;

      const filters = {
        job_id: req.query.job_id,
        student_id: req.query.student_id,
        company_id: req.query.company_id,
        date_from: req.query.date_from,
        date_to: req.query.date_to,
        group_by: req.query.group_by || "status",
      };

      const result = await applicationService.getStatistics(
        filters,
        userId,
        userRole
      );

      if (!result.success) {
        return sendErrorResponse(
          res,
          result.error,
          "Failed to fetch statistics",
          HTTP_STATUS_CODES.BAD_REQUEST
        );
      }

      return sendSuccessResponse(
        res,
        result.data,
        "Statistics retrieved successfully"
      );
    } catch (error) {
      console.error("Get statistics error:", error);
      return sendErrorResponse(
        res,
        error,
        "Failed to fetch statistics",
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }
}

// Export singleton instance
export const applicationController = new ApplicationController();
export default applicationController;