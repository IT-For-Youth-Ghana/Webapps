/**
 * Company Controller
 * Handles company-specific operations
 * - Company profile management
 * - Job posting management (CRUD)
 * - Application review and management
 * - Company directory (public)
 * - Analytics and insights
 */

import BaseController from "../../shared/base.controller";
import userService from "../service/user.service";
import companyRepository from "../repositories/company.repository";
import applicationService from "../../application/service/application.service";
import jobService from "../../job/service/job.service";
import { 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES, 
  ROLES 
} from "../../../utils/constants";

class CompanyController extends BaseController {
  constructor() {
    super({
      user: userService,
      application: applicationService,
      job: jobService,
    });
    this.companyRepo = companyRepository;
  }

  // ========================================
  // 1. COMPANY PROFILE MANAGEMENT
  // ========================================

  /**
   * Get current company's profile
   * GET /api/companies/me
   * Headers: Authorization: Bearer <token>
   */
  getMyProfile = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can access this resource");
    }

    this.log("info", { action: "getMyProfile", userId: user.id });

    // Call user service which handles profile population
    const result = await this.service("user").getMyProfile(user.id, {
      populate: true,
    });

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.COMPANY_NOT_FOUND);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, "Company profile retrieved successfully");
  });

  /**
   * Update company profile
   * PUT /api/companies/me
   * Headers: Authorization: Bearer <token>
   * Body: { name, description, industry, website, social_links }
   */
  updateMyProfile = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can update company profiles");
    }

    this.log("info", {
      action: "updateProfile",
      userId: user.id,
      fields: Object.keys(req.body),
    });

    // Call user service (handles validation)
    const result = await this.service("user").updateMyProfile(
      user.id,
      req.body
    );

    if (!result.success) {
      if (result.error.message.includes("Validation failed")) {
        return this.validationError(res, result.error.message);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, SUCCESS_MESSAGES.PROFILE_UPDATED);
  });

  /**
   * Upload company logo
   * POST /api/companies/me/logo
   * Headers: Authorization: Bearer <token>
   * Body: FormData with 'logo' field
   */
  uploadLogo = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can upload logos");
    }

    if (!req.file) {
      return this.badRequest(res, "Logo file is required");
    }

    this.log("info", {
      action: "uploadLogo",
      userId: user.id,
      fileName: req.file.originalname,
    });

    // Call user service (which updates photo_url)
    const result = await this.service("user").uploadPhoto(user.id, req.file);

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, result.data, "Logo uploaded successfully");
  });

  // ========================================
  // 2. SOCIAL LINKS MANAGEMENT
  // ========================================

  /**
   * Update social links
   * PUT /api/companies/me/social-links
   * Headers: Authorization: Bearer <token>
   * Body: { social_links: [{ name, url }] }
   */
  updateSocialLinks = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const { social_links } = req.body;

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can update social links");
    }

    if (!Array.isArray(social_links)) {
      return this.badRequest(res, "social_links must be an array");
    }

    if (social_links.length > 10) {
      return this.badRequest(res, "Maximum 10 social links allowed");
    }

    // Validate each link
    for (const link of social_links) {
      if (!link.name || !link.url) {
        return this.badRequest(res, "Each social link must have name and url");
      }
    }

    this.log("info", { action: "updateSocialLinks", userId: user.id });

    // Update profile
    const result = await this.companyRepo.updateProfile(
      { user: user.id },
      { social_links }
    );

    if (!result) {
      return this.error(res, new Error("Failed to update social links"));
    }

    return this.success(
      res,
      result.social_links,
      "Social links updated successfully"
    );
  });

  // ========================================
  // 3. PUBLIC COMPANY DIRECTORY
  // ========================================

  /**
   * List all active companies (Public)
   * GET /api/companies
   * Query: ?page=1&limit=10&industry=Technology
   */
  listCompanies = this.asyncHandler(async (req, res) => {
    this.log("info", { action: "listCompanies" });

    const { page, limit } = this.getPagination(req);
    const filters = {
      deleted_at: null,
    };

    // Filter by industry if provided
    if (req.query.industry) {
      filters.industry = req.query.industry;
    }

    const options = {
      sort: this.getSort(req, "-created_at"),
      select: "name description industry website social_links",
      populate: { path: "user", select: "photo_url" },
      lean: true,
    };

    // Get companies
    const result = await this.companyRepo.getActiveCompanies(
      filters,
      page,
      limit,
      options
    );

    return this.paginated(
      res,
      result.data,
      result.metadata.page,
      result.metadata.limit,
      result.metadata.total
    );
  });

  /**
   * Get company profile by ID (Public)
   * GET /api/companies/:id
   */
  getCompanyById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    this.log("info", { action: "getCompanyById", companyId: id });

    // Get company profile
    const company = await this.companyRepo.findById(id, {
      populate: { path: "user", select: "email photo_url" },
      lean: true,
    });

    if (!company || company.deleted_at) {
      return this.notFound(res, ERROR_MESSAGES.COMPANY_NOT_FOUND);
    }

    return this.success(res, company, "Company profile retrieved successfully");
  });

  /**
   * Search companies by name or industry
   * GET /api/companies/search
   * Query: ?q=searchTerm&page=1&limit=10
   */
  searchCompanies = this.asyncHandler(async (req, res) => {
    const { q: searchTerm } = req.query;

    if (!searchTerm) {
      return this.badRequest(res, "Search term is required");
    }

    this.log("info", { action: "searchCompanies", searchTerm });

    const { page, limit } = this.getPagination(req);

    // Build search filters
    const filters = {
      deleted_at: null,
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
        { industry: { $regex: searchTerm, $options: "i" } },
      ],
    };

    const options = {
      sort: { created_at: -1 },
      select: "name description industry website",
      lean: true,
    };

    const result = await this.companyRepo.findAll(
      filters,
      page,
      limit,
      options
    );

    return this.paginated(
      res,
      result.data,
      result.metadata.page,
      result.metadata.limit,
      result.metadata.total
    );
  });

  // ========================================
  // 4. JOB MANAGEMENT (Company's Jobs)
  // ========================================

  /**
   * Get my posted jobs
   * GET /api/companies/me/jobs
   * Headers: Authorization: Bearer <token>
   * Query: ?page=1&limit=10&status=active
   */
  getMyJobs = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can view their jobs");
    }

    const { page = 1, limit = 10, status } = req.query;

    this.log("info", { 
      action: "getMyJobs", 
      userId: user.id,
      page,
      limit,
      status
    });

    // Get jobs using JobService
    const result = await this.service("job").getCompanyJobs(user.id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      ...(status && { status }),
    });

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, result.data, "Jobs retrieved successfully");
  });

  /**
   * Get job statistics
   * GET /api/companies/me/jobs/stats
   * Headers: Authorization: Bearer <token>
   */
  getJobStats = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can view job statistics");
    }

    this.log("info", { action: "getJobStats", userId: user.id });

    // Get job statistics using JobService
    const result = await this.service("job").getCompanyJobStats(user.id);

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(res, result.data, "Job statistics retrieved successfully");
  });

  // ========================================
  // 5. APPLICATION MANAGEMENT
  // ========================================

  /**
   * Get applications for company's jobs
   * GET /api/companies/me/applications
   * Headers: Authorization: Bearer <token>
   * Query: ?page=1&limit=10&status=pending&job_id=xxx
   */
  getApplications = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can view applications");
    }

    const { page = 1, limit = 10, status, job_id } = req.query;

    this.log("info", {
      action: "getApplications",
      userId: user.id,
      filters: { page, limit, status, job_id },
    });

    // Get applications using ApplicationService
    const result = await this.service("application").getCompanyApplications(
      user.id,
      {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        ...(status && { status }),
        ...(job_id && { job_id }),
      }
    );

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(
      res,
      result.data,
      "Applications retrieved successfully"
    );
  });

  /**
   * Get single application details
   * GET /api/companies/me/applications/:id
   * Headers: Authorization: Bearer <token>
   */
  getApplicationById = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const { id } = req.params;

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can view applications");
    }

    this.log("info", {
      action: "getApplicationById",
      userId: user.id,
      applicationId: id,
    });

    // Get application details using ApplicationService
    const result = await this.service("application").getApplicationByIdForCompany(
      id,
      user.id
    );

    if (!result.success) {
      if (result.error.message?.includes("not found")) {
        return this.notFound(res, "Application not found");
      }
      return this.error(res, result.error);
    }

    return this.success(
      res,
      result.data,
      "Application retrieved successfully"
    );
  });

  /**
   * Update application status
   * PUT /api/companies/me/applications/:id/status
   * Headers: Authorization: Bearer <token>
   * Body: { status: 'reviewing' | 'approved' | 'rejected' }
   */
  updateApplicationStatus = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const { id } = req.params;
    const { status } = req.body;

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can update application status");
    }

    const validStatuses = ["pending", "reviewing", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return this.badRequest(
        res,
        `Status must be one of: ${validStatuses.join(", ")}`
      );
    }

    this.log("info", {
      action: "updateApplicationStatus",
      userId: user.id,
      applicationId: id,
      status,
    });

    // Update application status using ApplicationService
    const result = await this.service("application").updateApplicationStatus(
      id,
      user.id,
      { status }
    );

    if (!result.success) {
      if (result.error.message?.includes("not found")) {
        return this.notFound(res, "Application not found");
      }
      return this.error(res, result.error);
    }

    return this.success(
      res,
      result.data,
      "Application status updated successfully"
    );
  });

  /**
   * Bulk update application statuses
   * POST /api/companies/me/applications/bulk-update
   * Headers: Authorization: Bearer <token>
   * Body: { applicationIds: string[], status: string }
   */
  bulkUpdateApplications = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const { applicationIds, status } = req.body;

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can bulk update applications");
    }

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return this.badRequest(res, "applicationIds array is required");
    }

    const validStatuses = ["reviewing", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return this.badRequest(
        res,
        `Status must be one of: ${validStatuses.join(", ")}`
      );
    }

    this.log("info", {
      action: "bulkUpdateApplications",
      userId: user.id,
      count: applicationIds.length,
      status,
    });

    // Bulk update applications using ApplicationService
    const result = await this.service("application").bulkUpdateApplicationStatus(
      applicationIds,
      user.id,
      status
    );

    if (!result.success) {
      return this.error(res, result.error);
    }

    return this.success(
      res,
      result.data,
      `${result.data.count} applications updated successfully`
    );
  });

  // ========================================
  // 6. ANALYTICS & INSIGHTS
  // ========================================

  /**
   * Get company analytics dashboard
   * GET /api/companies/me/analytics
   * Headers: Authorization: Bearer <token>
   * Query: ?period=30 (days)
   */
  getAnalytics = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const period = parseInt(req.query.period, 10) || 30;

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can view analytics");
    }

    this.log("info", { action: "getAnalytics", userId: user.id, period });

    // Get comprehensive analytics from ApplicationService and JobService
    const jobStatsResult = await this.service("job").getCompanyJobStats(user.id);
    const appStatsResult = await this.service("application").getCompanyApplicationStats(
      user.id,
      period
    );

    if (!jobStatsResult.success || !appStatsResult.success) {
      return this.error(res, "Failed to retrieve analytics");
    }

    return this.success(res, {
      period,
      overview: {
        totalJobs: jobStatsResult.data.totalJobs || 0,
        activeJobs: jobStatsResult.data.activeJobs || 0,
        totalApplications: appStatsResult.data.totalApplications || 0,
        pendingReview: 0,
        approved: 0,
        rejected: 0,
      },
      trends: {
        applicationsPerDay: [],
        topSkills: [],
        conversionRate: 0,
      },
      topPerformingJobs: [],
    });
  });

  /**
   * Get application analytics for specific job
   * GET /api/companies/me/jobs/:jobId/analytics
   * Headers: Authorization: Bearer <token>
   */
  getJobAnalytics = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const { jobId } = req.params;

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can view job analytics");
    }

    this.log("info", {
      action: "getJobAnalytics",
      userId: user.id,
      jobId,
    });

    // Get job-specific analytics from ApplicationService
    const result = await this.service("application").getJobApplicationAnalytics(
      jobId,
      user.id
    );

    if (!result.success) {
      if (result.error.message?.includes("not found")) {
        return this.notFound(res, "Job not found");
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, "Job analytics retrieved successfully");
  });

  // ========================================
  // 7. TEAM MANAGEMENT (Future Feature)
  // ========================================

  /**
   * Get company team members
   * GET /api/companies/me/team
   * Headers: Authorization: Bearer <token>
   */
  getTeamMembers = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can view team members");
    }

    this.log("info", { action: "getTeamMembers", userId: user.id });

    // NOTE: Team management feature - Future implementation
    // This would involve creating a Team model with members linked to company
    // Team members would have roles (admin, recruiter, viewer) and permissions
    // Implementation: TeamService.getTeamMembers(companyId)
    return this.success(
      res,
      {
        members: [],
        message: "Team management feature coming soon",
      }
    );
  });

  /**
   * Invite team member
   * POST /api/companies/me/team/invite
   * Headers: Authorization: Bearer <token>
   * Body: { email, role }
   */
  inviteTeamMember = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const { email, role } = req.body;

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can invite team members");
    }

    if (!email) {
      return this.badRequest(res, "Email is required");
    }

    this.log("info", {
      action: "inviteTeamMember",
      userId: user.id,
      inviteeEmail: email,
    });

    // NOTE: Team invitation feature - Future implementation
    // This would send an invitation email with a unique token
    // Implementation: TeamService.inviteTeamMember(companyId, email, role)
    // Flow: Generate token → Send email → User accepts → Create team member record
    return this.success(
      res,
      null,
      "Team invitation feature coming soon"
    );
  });

  // ========================================
  // 8. NOTIFICATIONS & PREFERENCES
  // ========================================

  /**
   * Get notification preferences
   * GET /api/companies/me/preferences
   * Headers: Authorization: Bearer <token>
   */
  getPreferences = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can view preferences");
    }

    this.log("info", { action: "getPreferences", userId: user.id });

    // NOTE: Preferences management - Can be stored in Company model or separate Preferences model
    // For now, returning default preferences structure
    // Implementation: Store in company.preferences field or create UserPreferences model
    return this.success(res, {
      emailNotifications: {
        newApplications: true,
        applicationUpdates: true,
        weeklyDigest: true,
      },
      privacy: {
        showContactInfo: true,
        allowDirectMessages: false,
      },
    });
  });

  /**
   * Update notification preferences
   * PUT /api/companies/me/preferences
   * Headers: Authorization: Bearer <token>
   * Body: { emailNotifications, privacy }
   */
  updatePreferences = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.COMPANY) {
      return this.forbidden(res, "Only companies can update preferences");
    }

    this.log("info", { action: "updatePreferences", userId: user.id });

    // NOTE: Preferences update implementation
    // Store preferences in company.preferences or UserPreferences model
    // Implementation: await companyRepository.updatePreferences(companyId, req.body)
    // Or: await UserPreferencesService.update(userId, req.body)
    return this.success(
      res,
      req.body,
      "Preferences updated successfully (placeholder - implement persistence)"
    );
  });
}

// Export singleton instance
export default new CompanyController();