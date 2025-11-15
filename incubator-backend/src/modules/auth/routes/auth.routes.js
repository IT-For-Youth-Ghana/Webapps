/**
 * The authentication and authorisation router
 */
import express from "express";
import authController from "../controller/auth.controller";
import { 
  authenticate, 
  authorize, 
  authRateLimit 
} from "../middleware/auth.middleware";
import { ROLES } from "../../../utils/constants";

const router = express.Router();

// Public routes (with rate limiting)
router.post("/register", authRateLimit(3, 15), authController.register);
router.post("/login", authRateLimit(5, 15), authController.login);
router.post("/forgot-password", authRateLimit(3, 15), authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authRateLimit(3, 15), authController.resendVerification);

// Token management (no full auth needed)
router.post("/refresh", authController.refreshToken);
router.get("/check", authenticate, authController.checkAuth);

// Authenticated routes
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getCurrentUser);
router.put("/change-password", authenticate, authController.changePassword);
router.post("/revoke-all", authenticate, authController.revokeAllTokens);

// Admin only
router.post("/unlock/:userId", authenticate, authorize(ROLES.ADMIN), authController.unlockAccount);

export default router;