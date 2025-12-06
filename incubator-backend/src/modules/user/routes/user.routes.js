// src/modules/user/routes/user.routes.js
import express from "express";
import userController from "../controller/user.controller";
import { 
  authenticate, 
  authorize, 
  requireAdminPermission 
} from "../../auth/middleware/auth.middleware";
import { ROLES } from "../../../utils/constants";
import { fileService } from "../../../utils/services/file.service.js";

const router = express.Router();

// ========================================
// SELF-SERVICE ROUTES (Authenticated)
// ========================================
router.get("/me", authenticate, userController.getMyProfile);
router.put("/me", authenticate, userController.updateMyProfile);
router.post("/me/photo", authenticate, fileService.uploadProfilePhoto, userController.uploadPhoto);
router.delete("/me", authenticate, userController.deleteMyAccount);

// ========================================
// ADMIN ROUTES
// ========================================

// User listing and search
router.get(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  userController.listUsers
);

router.get(
  "/search",
  authenticate,
  authorize(ROLES.ADMIN),
  userController.searchUsers
);

// Role-specific lists
router.get(
  "/students",
  authenticate,
  authorize(ROLES.ADMIN),
  userController.listStudents
);

router.get(
  "/companies",
  authenticate,
  authorize(ROLES.ADMIN),
  userController.listCompanies
);

router.get(
  "/admins",
  authenticate,
  authorize(ROLES.ADMIN),
  requireAdminPermission("super"),
  userController.listAdmins
);

// Analytics
router.get(
  "/stats",
  authenticate,
  authorize(ROLES.ADMIN),
  userController.getUserStats
);

// User approval workflow
router.post(
  "/:id/approve",
  authenticate,
  authorize(ROLES.ADMIN),
  requireAdminPermission("create", "super"),
  userController.approveUser
);

router.post(
  "/:id/reject",
  authenticate,
  authorize(ROLES.ADMIN),
  requireAdminPermission("create", "super"),
  userController.rejectUser
);

router.post(
  "/bulk-approve",
  authenticate,
  authorize(ROLES.ADMIN),
  requireAdminPermission("create", "super"),
  userController.bulkApprove
);

// Account activation
router.put(
  "/:id/activate",
  authenticate,
  authorize(ROLES.ADMIN),
  requireAdminPermission("update", "super"),
  userController.activateUser
);

router.put(
  "/:id/deactivate",
  authenticate,
  authorize(ROLES.ADMIN),
  requireAdminPermission("update", "super"),
  userController.deactivateUser
);

// Deletion and restoration
router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN),
  requireAdminPermission("delete", "super"),
  userController.deleteUser
);

router.delete(
  "/:id/force",
  authenticate,
  authorize(ROLES.ADMIN),
  requireAdminPermission("super"),
  userController.forceDeleteUser
);

router.post(
  "/:id/restore",
  authenticate,
  authorize(ROLES.ADMIN),
  requireAdminPermission("update", "super"),
  userController.restoreUser
);

// Get user by ID (must be last to avoid route conflicts)
router.get(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN),
  userController.getUserById
);

export default router;