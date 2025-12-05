/**
 * The index router that combines all module routes
 */
import express from "express";
import authRoutes from "../modules/auth/routes/auth.routes.js";
import userRoutes from "../modules/user/routes/user.routes.js";
import studentRoutes from "../modules/user/routes/student.routes.js";
import companyRoutes from "../modules/user/routes/company.routes.js";
import jobRoutes from "../modules/job/routes/job.routes.js";

const router = express.Router();

// Mount module routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/users/students", studentRoutes);
router.use("/users/companies", companyRoutes);
router.use("/jobs", jobRoutes);
// router.use("/applications", applicationRoutes);

export default router;  