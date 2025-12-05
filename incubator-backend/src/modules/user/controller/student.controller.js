/**
 * Student Controller
 * Handles student-specific operations
 * - Profile management (education, experience, skills)
 * - CV/Resume upload and management
 * - Job application tracking
 * - Portfolio showcase
 * - Public student directory
 */

import BaseController from "../../shared/base.controller";
import userService from "../service/user.service";
import studentRepository from "../repositories/student.repository";
import applicationService from "../../application/service/application.service";
import UserValidation from "../validation/user.validation";
import { 
  ERROR_MESSAGES, 
  SUCCESS_MESSAGES, 
  ROLES,
  PROFILE_STATUSES 
} from "../../../utils/constants";

class StudentController extends BaseController {
  constructor() {
    super({
      user: userService,
      application: applicationService,
    });
    this.studentRepo = studentRepository;
  }

  // ========================================
  // 1. STUDENT PROFILE MANAGEMENT
  // ========================================

  /**
   * Get current student's profile
   * GET /api/students/me
   * Headers: Authorization: Bearer <token>
   */
  getMyProfile = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.STUDENT) {
      return this.forbidden(res, "Only students can access this resource");
    }

    this.log("info", { action: "getMyProfile", userId: user.id });

    // Call user service which handles profile population
    const result = await this.service("user").getMyProfile(user.id, {
      populate: true,
    });

    if (!result.success) {
      if (result.error.message.includes("not found")) {
        return this.notFound(res, ERROR_MESSAGES.PROFILE_NOT_FOUND);
      }
      return this.error(res, result.error);
    }

    return this.success(res, result.data, "Profile retrieved successfully");
  });

  /**
   * Update student profile
   * PUT /api/students/me
   * Headers: Authorization: Bearer <token>
   * Body: { first_name, last_name, bio, skills, education, work_experience, status }
   */
  updateMyProfile = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (user.role !== ROLES.STUDENT) {
      return this.forbidden(res, "Only students can update student profiles");
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

  // ========================================
  // 2. EDUCATION MANAGEMENT
  // ========================================

  /**
   * Add education entry
   * POST /api/students/me/education
   * Headers: Authorization: Bearer <token>
   * Body: { school, qualification, field_of_study, start_date, end_date, is_current }
   */
  addEducation = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    this.log("info", { action: "addEducation", userId: user.id });

    // Get current profile
    const profile = await this.studentRepo.getByUserId(user.id);

    if (!profile) {
      return this.notFound(res, ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }

    // Add new education entry
    const education = profile.education || [];
    education.push(req.body);

    // Update profile
    const result = await this.studentRepo.updateProfile(
      { user: user.id },
      { education }
    );

    if (!result) {
      return this.error(res, new Error("Failed to add education"));
    }

    return this.created(
      res,
      result.education,
      "Education entry added successfully"
    );
  });

  /**
   * Update education entry
   * PUT /api/students/me/education/:index
   * Headers: Authorization: Bearer <token>
   * Body: { school, qualification, field_of_study, start_date, end_date, is_current }
   */
  updateEducation = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const { index } = req.params;

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    this.log("info", { action: "updateEducation", userId: user.id, index });

    // Get current profile
    const profile = await this.studentRepo.getByUserId(user.id);

    if (!profile) {
      return this.notFound(res, ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }

    const educationIndex = parseInt(index, 10);

    if (
      isNaN(educationIndex) ||
      educationIndex < 0 ||
      educationIndex >= profile.education.length
    ) {
      return this.badRequest(res, "Invalid education index");
    }

    // Update education entry
    profile.education[educationIndex] = {
      ...profile.education[educationIndex],
      ...req.body,
    };

    // Save
    const result = await this.studentRepo.updateProfile(
      { user: user.id },
      { education: profile.education }
    );

    if (!result) {
      return this.error(res, new Error("Failed to update education"));
    }

    return this.success(
      res,
      result.education,
      "Education entry updated successfully"
    );
  });

  /**
   * Delete education entry
   * DELETE /api/students/me/education/:index
   * Headers: Authorization: Bearer <token>
   */
  deleteEducation = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const { index } = req.params;

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    this.log("info", { action: "deleteEducation", userId: user.id, index });

    // Get current profile
    const profile = await this.studentRepo.getByUserId(user.id);

    if (!profile) {
      return this.notFound(res, ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }

    const educationIndex = parseInt(index, 10);

    if (
      isNaN(educationIndex) ||
      educationIndex < 0 ||
      educationIndex >= profile.education.length
    ) {
      return this.badRequest(res, "Invalid education index");
    }

    // Remove education entry
    profile.education.splice(educationIndex, 1);

    // Save
    const result = await this.studentRepo.updateProfile(
      { user: user.id },
      { education: profile.education }
    );

    if (!result) {
      return this.error(res, new Error("Failed to delete education"));
    }

    return this.success(res, null, "Education entry deleted successfully");
  });

  // ========================================
  // 3. WORK EXPERIENCE MANAGEMENT
  // ========================================

  /**
   * Add work experience entry
   * POST /api/students/me/experience
   * Headers: Authorization: Bearer <token>
   * Body: { title, company, location, start_date, end_date, is_current, description }
   */
  addExperience = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    this.log("info", { action: "addExperience", userId: user.id });

    // Get current profile
    const profile = await this.studentRepo.getByUserId(user.id);

    if (!profile) {
      return this.notFound(res, ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }

    // Add new experience entry
    const work_experience = profile.work_experience || [];
    work_experience.push(req.body);

    // Update profile
    const result = await this.studentRepo.updateProfile(
      { user: user.id },
      { work_experience }
    );

    if (!result) {
      return this.error(res, new Error("Failed to add experience"));
    }

    return this.created(
      res,
      result.work_experience,
      "Work experience added successfully"
    );
  });

  /**
   * Update work experience entry
   * PUT /api/students/me/experience/:index
   * Headers: Authorization: Bearer <token>
   */
  updateExperience = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const { index } = req.params;

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    this.log("info", { action: "updateExperience", userId: user.id, index });

    // Get current profile
    const profile = await this.studentRepo.getByUserId(user.id);

    if (!profile) {
      return this.notFound(res, ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }

    const experienceIndex = parseInt(index, 10);

    if (
      isNaN(experienceIndex) ||
      experienceIndex < 0 ||
      experienceIndex >= profile.work_experience.length
    ) {
      return this.badRequest(res, "Invalid experience index");
    }

    // Update experience entry
    profile.work_experience[experienceIndex] = {
      ...profile.work_experience[experienceIndex],
      ...req.body,
    };

    // Save
    const result = await this.studentRepo.updateProfile(
      { user: user.id },
      { work_experience: profile.work_experience }
    );

    if (!result) {
      return this.error(res, new Error("Failed to update experience"));
    }

    return this.success(
      res,
      result.work_experience,
      "Work experience updated successfully"
    );
  });

  /**
   * Delete work experience entry
   * DELETE /api/students/me/experience/:index
   * Headers: Authorization: Bearer <token>
   */
  deleteExperience = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const { index } = req.params;

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    this.log("info", { action: "deleteExperience", userId: user.id, index });

    // Get current profile
    const profile = await this.studentRepo.getByUserId(user.id);

    if (!profile) {
      return this.notFound(res, ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }

    const experienceIndex = parseInt(index, 10);

    if (
      isNaN(experienceIndex) ||
      experienceIndex < 0 ||
      experienceIndex >= profile.work_experience.length
    ) {
      return this.badRequest(res, "Invalid experience index");
    }

    // Remove experience entry
    profile.work_experience.splice(experienceIndex, 1);

    // Save
    const result = await this.studentRepo.updateProfile(
      { user: user.id },
      { work_experience: profile.work_experience }
    );

    if (!result) {
      return this.error(res, new Error("Failed to delete experience"));
    }

    return this.success(res, null, "Work experience deleted successfully");
  });

  // ========================================
  // 4. CV/RESUME MANAGEMENT
  // ========================================

  /**
   * Upload CV/Resume
   * POST /api/students/me/cv
   * Headers: Authorization: Bearer <token>
   * Body: FormData with 'cv' field (PDF)
   */
  uploadCV = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (!req.file) {
      return this.badRequest(res, "CV file is required");
    }

    // Validate file type
    if (req.file.mimetype !== "application/pdf") {
      return this.badRequest(res, "Only PDF files are allowed for CV");
    }

    this.log("info", {
      action: "uploadCV",
      userId: user.id,
      fileName: req.file.originalname,
    });

    // NOTE: File storage implementation
    // For local: Multer already saved to uploads/resumes/ via upload.middleware.js
    // For cloud: Integrate FileStorage service (S3/Cloudinary)
    // Example: const cvUrl = await FileStorage.uploadDocument(req.file);
    const cvUrl = `/uploads/resumes/${req.file.filename}`;

    // Update profile with CV URL
    const result = await this.studentRepo.updateProfile(
      { user: user.id },
      { cv_url: cvUrl }
    );

    if (!result) {
      return this.error(res, new Error("Failed to update CV"));
    }

    return this.success(
      res,
      { cv_url: cvUrl },
      SUCCESS_MESSAGES.FILE_UPLOADED
    );
  });

  /**
   * Delete CV/Resume
   * DELETE /api/students/me/cv
   * Headers: Authorization: Bearer <token>
   */
  deleteCV = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    this.log("info", { action: "deleteCV", userId: user.id });

    // Update profile to remove CV URL
    const result = await this.studentRepo.updateProfile(
      { user: user.id },
      { cv_url: null }
    );

    if (!result) {
      return this.error(res, new Error("Failed to delete CV"));
    }

    // NOTE: File deletion implementation
    // For local storage: Use fs.unlink() to remove file from uploads/resumes/
    // For cloud storage: Call FileStorage.delete(cvUrl) or s3Client.deleteObject()
    // Example local: if (result.cv_url) { fs.unlinkSync(path.join(process.cwd(), result.cv_url)); }
    // Example cloud: await FileStorage.delete(result.cv_url);

    return this.success(res, null, "CV deleted successfully");
  });

  // ========================================
  // 5. SKILLS MANAGEMENT
  // ========================================

  /**
   * Update skills
   * PUT /api/students/me/skills
   * Headers: Authorization: Bearer <token>
   * Body: { skills: string[] }
   */
  updateSkills = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const { skills } = req.body;

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (!Array.isArray(skills)) {
      return this.badRequest(res, "Skills must be an array");
    }

    if (skills.length > 20) {
      return this.badRequest(res, ERROR_MESSAGES.SKILLS_LIMIT_EXCEEDED);
    }

    this.log("info", { action: "updateSkills", userId: user.id });

    // Update profile
    const result = await this.studentRepo.updateProfile(
      { user: user.id },
      { skills }
    );

    if (!result) {
      return this.error(res, new Error("Failed to update skills"));
    }

    return this.success(res, result.skills, "Skills updated successfully");
  });

  // ========================================
  // 6. STUDENT STATUS MANAGEMENT
  // ========================================

  /**
   * Update job seeking status
   * PUT /api/students/me/status
   * Headers: Authorization: Bearer <token>
   * Body: { status: 'active' | 'job_seeking' | 'inactive' }
   */
  updateStatus = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);
    const { status } = req.body;

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    const validStatuses = [
      PROFILE_STATUSES.ACTIVE,
      PROFILE_STATUSES.JOB_SEEKING,
      PROFILE_STATUSES.INACTIVE,
    ];

    if (!validStatuses.includes(status)) {
      return this.badRequest(
        res,
        `Status must be one of: ${validStatuses.join(", ")}`
      );
    }

    this.log("info", { action: "updateStatus", userId: user.id, status });

    // Update profile
    const result = await this.studentRepo.updateProfile(
      { user: user.id },
      { status }
    );

    if (!result) {
      return this.error(res, new Error("Failed to update status"));
    }

    return this.success(res, { status: result.status }, "Status updated successfully");
  });

  // ========================================
  // 7. PUBLIC STUDENT DIRECTORY
  // ========================================

  /**
   * List all active students (Public/Companies)
   * GET /api/students
   * Query: ?page=1&limit=10&skills=JavaScript,React&status=job_seeking
   */
  listStudents = this.asyncHandler(async (req, res) => {
    this.log("info", { action: "listStudents" });

    const { page, limit } = this.getPagination(req);
    const filters = {
      deleted_at: null,
    };

    // Filter by status if provided
    if (req.query.status) {
      filters.status = req.query.status;
    }

    // Filter by skills if provided
    if (req.query.skills) {
      const skillsArray = req.query.skills.split(",").map((s) => s.trim());
      filters.skills = { $in: skillsArray };
    }

    const options = {
      sort: this.getSort(req, "-created_at"),
      select: "first_name last_name bio skills cv_url status social_links",
      lean: true,
    };

    // Get students
    const result = await this.studentRepo.findAll(
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
   * Get job-seeking students (Companies)
   * GET /api/students/job-seeking
   * Query: ?page=1&limit=10&skills=JavaScript
   */
  getJobSeekingStudents = this.asyncHandler(async (req, res) => {
    this.log("info", { action: "getJobSeekingStudents" });

    const { page, limit } = this.getPagination(req);
    const filters = {};

    // Filter by skills if provided
    if (req.query.skills) {
      const skillsArray = req.query.skills.split(",").map((s) => s.trim());
      filters.skills = { $in: skillsArray };
    }

    const options = {
      sort: this.getSort(req, "-created_at"),
      select: "first_name last_name bio skills cv_url social_links",
      lean: true,
    };

    // Get job-seeking students
    const result = await this.studentRepo.getJobSeekingStudents(
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
   * Get student profile by ID (Public)
   * GET /api/students/:id
   */
  getStudentById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    this.log("info", { action: "getStudentById", studentId: id });

    // Get student profile
    const student = await this.studentRepo.findById(id, {
      populate: { path: "user", select: "email photo_url" },
      lean: true,
    });

    if (!student || student.deleted_at) {
      return this.notFound(res, "Student profile not found");
    }

    return this.success(res, student, "Student profile retrieved successfully");
  });

  // ========================================
  // 8. MY APPLICATIONS (Student)
  // ========================================

  /**
   * Get my applications
   * GET /api/students/me/applications
   * Headers: Authorization: Bearer <token>
   * Query: ?page=1&limit=10&status=pending
   */
  getMyApplications = this.asyncHandler(async (req, res) => {
    const user = this.getUser(req);

    if (!user) {
      return this.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
    }

    const { page = 1, limit = 10, status } = req.query;

    this.log("info", {
      action: "getMyApplications",
      userId: user.id,
      page,
      limit,
      status,
    });

    // Get applications using ApplicationService
    const result = await this.service("application").getStudentApplications(
      user.id,
      {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        ...(status && { status }),
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
}

// Export singleton instance
export default new StudentController();