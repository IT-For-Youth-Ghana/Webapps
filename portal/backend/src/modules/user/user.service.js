/**
 * User Service
 * Business logic for user management
 */

import User from "./user.model.js";
import Enrollment from "../enrollment/enrollment.model.js";
import Course from "../course/course.model.js";
import VerificationCode from "../auth/verification-code.model.js";
import Notification from "../notification/notification.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Op } from "sequelize";
import { ValidationError, NotFoundError, UnauthorizedError } from "../../utils/errors.js";
import logger from "../../utils/logger.js";
import emailService from "../shared/email/email.service.js";
import jwtUtil from "../shared/auth/jwt.util.js";

class UserService {

    /**
     * Start registration - send verification code
     */
    async startRegistration({ email, firstName, lastName }) {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            throw new ValidationError("Email already registered");
        }

        // Generate 6-digit verification code
        const code = crypto.randomInt(100000, 999999).toString();

        // Store verification code (upsert to handle re-sends)
        await VerificationCode.upsert({
            email,
            code,
            registrationData: { firstName, lastName },
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
            verified: false,
        });

        // Send verification email
        await emailService.sendVerificationCode(email, code, firstName);

        logger.info(`Verification code sent to ${email}`);

        return {
            success: true,
            email,
            message: "Verification code sent to your email",
        };
    }

    /**
     * Verify email code
     */
    async verifyCode(email, code) {
        const verification = await VerificationCode.findOne({
            where: { email },
        });

        if (!verification) {
            throw new ValidationError("Invalid verification code");
        }

        if (new Date() > verification.expiresAt) {
            throw new ValidationError("Verification code expired");
        }

        if (verification.code !== code) {
            throw new ValidationError("Invalid verification code");
        }

        // Mark as verified
        await verification.update({ verified: true });

        // Generate temporary token (valid for 30 minutes)
        const tempToken = jwtUtil.generateToken(
            { email, temp: true },
            "30m"
        );

        logger.info(`Email verified for ${email}`);

        return {
            success: true,
            tempToken,
            registrationData: verification.registrationData,
        };
    }

    /**
     * Complete registration
     */
    async completeRegistration({ tempToken, phone, dateOfBirth, courseId }) {
        // Verify temp token
        const decoded = jwtUtil.verifyToken(tempToken);

        if (!decoded.temp) {
            throw new UnauthorizedError("Invalid token");
        }

        // Get verification data
        const verification = await VerificationCode.findOne({
            where: { email: decoded.email, verified: true },
        });

        if (!verification) {
            throw new ValidationError("Email not verified");
        }

        // Auto-generate password
        const autoPassword = crypto.randomBytes(8).toString("hex");

        // Create user with transaction
        const result = await User.executeInTransaction(async (transaction) => {
            const newUser = await User.create(
                {
                    email: decoded.email,
                    passwordHash: autoPassword, // Will be hashed by hook
                    firstName: verification.registrationData.firstName,
                    lastName: verification.registrationData.lastName,
                    phone,
                    dateOfBirth,
                    role: "student",
                    tempPassword: autoPassword,
                    emailVerified: true,
                },
                { transaction }
            );

            // Create pending enrollment if courseId provided
            let enrollment = null;
            let payment = null;

            if (courseId) {
                const enrollmentService = (await import("../enrollment/enrollment.service.js")).default;
                enrollment = await enrollmentService.createPending(
                    newUser.id,
                    courseId,
                    { transaction }
                );

                // Initialize payment
                const paymentService = (await import("../payment/payment.service.js")).default;
                payment = await paymentService.initialize({
                    userId: newUser.id,
                    enrollmentId: enrollment.id,
                    courseId,
                    transaction,
                });
            }

            logger.info(`User ${newUser.id} registered`);

            return {
                user: newUser,
                enrollment,
                payment,
            };
        });

        // Clean up verification code
        await verification.destroy();

        return {
            userId: result.user.id,
            tempPassword: autoPassword,
            paymentUrl: result.payment?.authorizationUrl || null,
            reference: result.payment?.paystackReference || null,
        };
    }

    /**
     * Login user
     */
    async login(email, password) {
        // Find user
        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw new UnauthorizedError("Invalid credentials");
        }

        // Verify password
        const isValid = await user.verifyPassword(password);

        // If password is not valid lets intentionally hang the process
        // to simulate a delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (!isValid) {
            throw new UnauthorizedError("Invalid credentials");
        }

        // Check if active
        if (user.status !== "active") {
            throw new UnauthorizedError("Account is inactive");
        }

        // Generate JWT
        const token = jwtUtil.generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        logger.info(`User ${user.id} logged in`);

        return {
            token,
            user: user.toPublicJSON(),
        };
    }

    /**
     * Get user profile with enrollments
     */
    async getProfile(userId) {
        const user = await User.findByPk(userId, {
            include: [
                {
                    model: Enrollment,
                    as: "enrollments",
                    include: [
                        {
                            model: Course,
                            as: "course",
                        },
                    ],
                },
            ],
        });

        if (!user) {
            throw new NotFoundError("User not found");
        }

        return user.toPublicJSON();
    }

    /**
     * Update user profile
     */
    async updateProfile(userId, data) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new NotFoundError("User not found");
        }

        // Only allow updating certain fields
        const allowedFields = ["firstName", "lastName", "phone", "dateOfBirth"];
        const updateData = {};

        allowedFields.forEach((field) => {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        });

        await user.update(updateData);

        logger.info(`User ${userId} profile updated`);

        return user.toPublicJSON();
    }

    /**
     * Change password
     */
    async changePassword(userId, currentPassword, newPassword) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new NotFoundError("User not found");
        }

        // Verify current password
        const isValid = await user.verifyPassword(currentPassword);

        if (!isValid) {
            throw new ValidationError("Current password is incorrect");
        }

        // Update password (hook will hash it)
        await user.update({ passwordHash: newPassword, tempPassword: null });

        logger.info(`User ${userId} changed password`);

        return { success: true };
    }

    /**
     * Get all users (Admin only)
     */
    async getAllUsers(filters = {}) {
        const { page = 1, limit = 20, role, status, search } = filters;

        const where = {};

        if (role) where.role = role;
        if (status) where.status = status;

        if (search) {
            where[Op.or] = [
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const result = await User.paginate({
            page,
            limit,
            where,
            order: [["createdAt", "DESC"]],
        });

        return {
            users: result.data.map((u) => u.toPublicJSON()),
            pagination: result.pagination,
        };
    }

    /**
     * Find user by ID
     */
    async findById(userId) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new NotFoundError("User not found");
        }

        return user;
    }

    /**
     * Find user by email
     */
    async findByEmail(email) {
        return await User.findOne({ where: { email } });
    }

    /**
     * Update Moodle user ID
     */
    async updateMoodleId(userId, moodleUserId) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new NotFoundError("User not found");
        }

        await user.update({ moodleUserId });

        logger.info(`User ${userId} Moodle ID updated: ${moodleUserId}`);

        return user;
    }

    /**
     * Update Incubator user ID
     */
    async updateIncubatorId(userId, incubatorUserId) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new NotFoundError("User not found");
        }

        await user.update({ incubatorUserId });

        logger.info(`User ${userId} Incubator ID updated: ${incubatorUserId}`);

        return user;
    }

    /**
     * Get user notifications
     */
    async getNotifications(userId, unreadOnly = false) {
        const where = { userId };

        if (unreadOnly) {
            where.isRead = false;
        }

        const notifications = await Notification.findAll({
            where,
            order: [["createdAt", "DESC"]],
            limit: 50,
        });

        return notifications.map((n) => n.toJSON());
    }

    /**
     * Mark notification as read
     */
    async markNotificationRead(userId, notificationId) {
        const notification = await Notification.findOne({
            where: { id: notificationId, userId },
        });

        if (!notification) {
            throw new NotFoundError("Notification not found");
        }

        await notification.update({ isRead: true, readAt: new Date() });

        return { success: true };
    }

    /**
     * Suspend user (Admin only)
     */
    async suspendUser(userId, adminId) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new NotFoundError("User not found");
        }

        await user.update({ status: "suspended" });

        logger.info(`User ${userId} suspended by admin ${adminId}`);

        return user.toPublicJSON();
    }

    /**
     * Activate user (Admin only)
     */
    async activateUser(userId, adminId) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new NotFoundError("User not found");
        }

        await user.update({ status: "active" });

        logger.info(`User ${userId} activated by admin ${adminId}`);

        return user.toPublicJSON();
    }
}

export default new UserService();
