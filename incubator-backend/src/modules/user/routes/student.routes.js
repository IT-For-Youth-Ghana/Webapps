// src/modules/user/routes/student.routes.js
import express from "express";
import studentController from "../controller/student.controller";
import { 
  authenticate, 
  authorize,
  optionalAuth 
} from "../../auth/middleware/auth.middleware";
import { ROLES } from "../../../utils/constants";
import multer from "multer";

const router = express.Router();

// Configure multer for CV uploads
const cvUpload = multer({
  dest: "uploads/resumes/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.includes("application/pdf") ||
     file.mimetype.includes("application/msword") || 
     file.mimetype.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed for CV"));
    }
  },
});

// ========================================
// PUBLIC ROUTES (Student Directory)
// ========================================
router.get("/", optionalAuth, studentController.listStudents);
router.get("/job-seeking", optionalAuth, studentController.getJobSeekingStudents);
router.get("/:id", optionalAuth, studentController.getStudentById);

// ========================================
// STUDENT SELF-SERVICE ROUTES
// ========================================

// Profile
router.get("/me", authenticate, authorize(ROLES.STUDENT), studentController.getMyProfile);
router.put("/me", authenticate, authorize(ROLES.STUDENT), studentController.updateMyProfile);

// Education
router.post("/me/education", authenticate, authorize(ROLES.STUDENT), studentController.addEducation);
router.put("/me/education/:index", authenticate, authorize(ROLES.STUDENT), studentController.updateEducation);
router.delete("/me/education/:index", authenticate, authorize(ROLES.STUDENT), studentController.deleteEducation);

// Work Experience
router.post("/me/experience", authenticate, authorize(ROLES.STUDENT), studentController.addExperience);
router.put("/me/experience/:index", authenticate, authorize(ROLES.STUDENT), studentController.updateExperience);
router.delete("/me/experience/:index", authenticate, authorize(ROLES.STUDENT), studentController.deleteExperience);

// CV/Resume
router.post("/me/cv", authenticate, authorize(ROLES.STUDENT), cvUpload.single("cv"), studentController.uploadCV);
router.delete("/me/cv", authenticate, authorize(ROLES.STUDENT), studentController.deleteCV);

// Skills
router.put("/me/skills", authenticate, authorize(ROLES.STUDENT), studentController.updateSkills);

// Status
router.put("/me/status", authenticate, authorize(ROLES.STUDENT), studentController.updateStatus);

// Applications
router.get("/me/applications", authenticate, authorize(ROLES.STUDENT), studentController.getMyApplications);

export default router;