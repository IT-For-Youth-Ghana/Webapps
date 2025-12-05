// src/modules/user/routes/company.routes.js
import express from "express";
import companyController from "../controller/company.controller";
import { 
  authenticate, 
  authorize,
  optionalAuth 
} from "../../auth/middleware/auth.middleware";
import { ROLES } from "../../../utils/constants";
import multer from "multer";

const router = express.Router();

// Configure multer for logo uploads
const logoUpload = multer({
  dest: "uploads/logos/",
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for logos"));
    }
  },
});

// ========================================
// PUBLIC ROUTES (Company Directory)
// ========================================
router.get("/", optionalAuth, companyController.listCompanies);
// NOTE: Search endpoint - Currently handled by listCompanies with query params
// If dedicated search with advanced filters is needed, implement searchCompanies
// router.get("/search", optionalAuth, companyController.searchCompanies);
router.get("/:id", optionalAuth, companyController.getCompanyById);

// ========================================
// COMPANY SELF-SERVICE ROUTES
// ========================================

// Profile Management
router.get("/me", authenticate, authorize(ROLES.COMPANY), companyController.getMyProfile);
router.put("/me", authenticate, authorize(ROLES.COMPANY), companyController.updateMyProfile);
router.post("/me/logo", authenticate, authorize(ROLES.COMPANY), logoUpload.single("logo"), companyController.uploadLogo);

// Social Links
router.put("/me/social-links", authenticate, authorize(ROLES.COMPANY), companyController.updateSocialLinks);

// Job Management
router.get("/me/jobs", authenticate, authorize(ROLES.COMPANY), companyController.getMyJobs);
router.get("/me/jobs/stats", authenticate, authorize(ROLES.COMPANY), companyController.getJobStats);
router.get("/me/jobs/:jobId/analytics", authenticate, authorize(ROLES.COMPANY), companyController.getJobAnalytics);

// Application Management
router.get("/me/applications", authenticate, authorize(ROLES.COMPANY), companyController.getApplications);
router.get("/me/applications/:id", authenticate, authorize(ROLES.COMPANY), companyController.getApplicationById);
router.put("/me/applications/:id/status", authenticate, authorize(ROLES.COMPANY), companyController.updateApplicationStatus);
router.post("/me/applications/bulk-update", authenticate, authorize(ROLES.COMPANY), companyController.bulkUpdateApplications);

// Analytics
router.get("/me/analytics", authenticate, authorize(ROLES.COMPANY), companyController.getAnalytics);

// Team Management
router.get("/me/team", authenticate, authorize(ROLES.COMPANY), companyController.getTeamMembers);
router.post("/me/team/invite", authenticate, authorize(ROLES.COMPANY), companyController.inviteTeamMember);

// Preferences
router.get("/me/preferences", authenticate, authorize(ROLES.COMPANY), companyController.getPreferences);
router.put("/me/preferences", authenticate, authorize(ROLES.COMPANY), companyController.updatePreferences);

export default router;