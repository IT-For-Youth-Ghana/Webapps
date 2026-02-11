/**
 * Enhanced User Service
 * Business logic for user management with background job processing
 */

import User from "./user.model.js";
import Enrollment from "../enrollment/enrollment.model.js";
import Course from "../course/course.model.js";
import VerificationCode from "../auth/verification-code.model.js";
import Notification from "../notification/notification.model.js";
import { emitToUser } from "../../realtime/socket.js";
import crypto from "crypto";
import { Op } from "sequelize";
import { ValidationError, NotFoundError, UnauthorizedError, ConflictError } from "../../utils/errors.js";
import logger from "../../utils/logger.js";
import jwtUtil from "../shared/auth/jwt.util.js";
import cacheService from "../../config/redis.js";

// Queue imports
import { emailQueue, paymentQueue, enrollmentQueue } from "../../queues/index.js";

class UserService {
    /**
     * Validation helper
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ValidationError('Invalid email format');
        }
    }

    validatePassword(password) {
        const errors = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        if (errors.length > 0) {
            throw new ValidationError(errors.join(', '));
        }
    }

    validatePhone(phone) {
        // Ghana phone number format: +233XXXXXXXXX or 0XXXXXXXXX
        const ghanaPhoneRegex = /^(\+233|0)[0-9]{9}$/;
        if (!ghanaPhoneRegex.test(phone)) {
            throw new ValidationError('Invalid phone format. Use Ghana format: +233XXXXXXXXX or 0XXXXXXXXX');
        }
    }

    /**
     * Start registration - send verification code
     * Enhanced with queue and caching
     */
    async startRegistration({ email, firstName, lastName }) {
        // Validate input
        this.validateEmail(email);
        email = email.toLowerCase().trim();
        firstName = firstName.trim();
        lastName = lastName.trim();

        if (firstName.length < 2 || firstName.length > 50) {
            throw new ValidationError('First name must be 2-50 characters');
        }

        if (lastName.length < 2 || lastName.length > 50) {
            throw new ValidationError('Last name must be 2-50 characters');
        }

        // Check cache first (rate limiting)
        const rateLimitKey = cacheService.buildKey('registration', 'attempt', email);
        const recentAttempt = await cacheService.get(rateLimitKey);

        if (recentAttempt) {
            throw new ValidationError('Please wait 60 seconds before requesting another code');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            throw new ConflictError('Email already registered');
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

        // Queue verification email (async) - Phase 1
        await emailQueue.sendVerificationCode(email, code, firstName);

        // Set rate limit cache (60 seconds)
        await cacheService.set(rateLimitKey, true, 60);

        logger.info(`Registration started for ${email}`);

        return {
            success: true,
            email,
            message: 'Verification code sent to your email',
        };
    }

    /**
     * Verify email code
     * Enhanced with better error messages
     */
    async verifyCode(email, code) {
        email = email.toLowerCase().trim();
        code = code.trim();

        const verification = await VerificationCode.findOne({
            where: { email, code },
        });

        if (!verification) {
            throw new ValidationError('Invalid verification code');
        }

        if (verification.verified) {
            throw new ValidationError('Code already used');
        }

        if (new Date() > verification.expiresAt) {
            throw new ValidationError('Verification code expired. Please request a new one');
        }

        // Mark as verified
        await verification.update({ verified: true });

        // Generate temporary token (valid for 30 minutes)
        const tempToken = jwtUtil.generateToken(
            {
                email,
                temp: true,
                firstName: verification.registrationData.firstName,
                lastName: verification.registrationData.lastName,
            },
            '30m'
        );

        logger.info(`Email verified for ${email}`);

        return {
            success: true,
            tempToken,
            registrationData: verification.registrationData,
        };
    }

    /**
     * Gnerate password
     */
    generatePassword() {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = crypto.randomInt(0, charset.length);
            password += charset[randomIndex];
        }
        return password;
    }

    /**
     * Complete registration with queue integration
     * Enhanced with robust error handling and rollback
     */
    async completeRegistration({ tempToken, phone, dateOfBirth, courseId }) {
        // Validate temp token
        const decoded = jwtUtil.verifyToken(tempToken);

        if (!decoded.temp) {
            throw new UnauthorizedError('Invalid token');
        }

        // Validate phone
        if (phone) {
            this.validatePhone(phone);
        }

        // Validate date of birth
        const dob = new Date(dateOfBirth);
        const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

        if (age < 13) {
            throw new ValidationError('You must be at least 13 years old to register');
        }

        if (age > 120) {
            throw new ValidationError('Invalid date of birth');
        }

        // Get verification data
        const verification = await VerificationCode.findOne({
            where: { email: decoded.email, verified: true },
        });

        if (!verification) {
            throw new ValidationError('Email not verified');
        }

        // Create user with transaction and rollback on error
        const result = await User.executeInTransaction(async (transaction) => {
            // Double-check user doesn't exist (race condition protection)
            const existingUser = await User.findOne({
                where: { email: decoded.email },
                transaction,
            });

            if (existingUser) {
                throw new ConflictError('Email already registered');
            }

            // Create user
            const newUser = await User.create(
                {
                    email: decoded.email,
                    passwordHash: this.generatePassword(), // No password - user will set one later if needed
                    firstName: verification.registrationData.firstName,
                    lastName: verification.registrationData.lastName,
                    phone,
                    dateOfBirth,
                    role: 'student',
                    emailVerified: true,
                    status: 'active',
                },
                { transaction }
            );

            let enrollment = null;
            let payment = null;

            // Create pending enrollment if courseId provided
            if (courseId) {
                // Verify course exists
                const course = await Course.findByPk(courseId, { transaction });

                if (!course) {
                    throw new NotFoundError('Course not found');
                }

                if (course.status !== 'active') {
                    throw new ValidationError('Course is not available');
                }

                const enrollmentService = (await import('../enrollment/enrollment.service.js')).default;
                enrollment = await enrollmentService.createPending(
                    newUser.id,
                    courseId,
                    { transaction }
                );

                // Initialize payment
                const paymentService = (await import('../payment/payment.service.js')).default;
                payment = await paymentService.initialize({
                    userId: newUser.id,
                    enrollmentId: enrollment.id,
                    courseId,
                    transaction,
                });
            }

            // Send welcome email (no password needed)
            await emailQueue.sendWelcomeEmail(newUser.id, courseId || null);

            return {
                user: newUser,
                enrollment,
                payment,
            };
        });

        // Generate JWT tokens for automatic login
        const accessToken = jwtUtil.generateToken({
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
        });

        const refreshToken = jwtUtil.generateRefreshToken({
            id: result.user.id,
            email: result.user.email,
        });

        // Clean up verification code (outside transaction)
        await verification.destroy();

        // Queue background tasks (async - Phase 2)
        try {
            // Queue Moodle account creation (non-blocking)
            if (result.enrollment) {
                await enrollmentQueue.createMoodleAccount(result.user.id);
                await enrollmentQueue.createIncubatorAccount(result.user.id);
            }
        } catch (error) {
            // Log but don't fail registration
            logger.warn('Failed to queue account creation jobs', {
                userId: result.user.id,
                error: error.message,
            });
        }

        // Invalidate cache
        await cacheService.delete(cacheService.buildKey('user', result.user.id));

        logger.info(`User ${result.user.id} registered successfully`);

        return {
            userId: result.user.id,
            accessToken,
            refreshToken,
            user: result.user.toPublicJSON(),
            message: "Registration successful. Welcome to ITFY Portal!",
            paymentUrl: result.payment?.authorizationUrl || null,
            reference: result.payment?.reference || result.payment?.paystackReference || null,
            isFree: result.payment?.isFree || false,
        };
    }

    /**
     * Login user
     * Enhanced with rate limiting and caching
     */
    async login(email, password) {
        email = email.toLowerCase().trim();

        // Rate limiting
        const rateLimitKey = cacheService.buildKey('login', 'attempt', email);
        const attempts = await cacheService.get(rateLimitKey) || 0;

        if (attempts >= 5) {
            throw new UnauthorizedError('Too many login attempts. Please try again in 15 minutes');
        }

        // Find user
        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Increment attempts even for non-existent users (prevent enumeration)
            await cacheService.set(rateLimitKey, attempts + 1, 900); // 15 minutes

            // Intentional delay to prevent timing attacks
            await new Promise(resolve => setTimeout(resolve, 1000));

            throw new UnauthorizedError('Invalid credentials');
        }

        // Verify password
        const isValid = await user.verifyPassword(password);

        if (!isValid) {
            // Increment failed attempts
            await cacheService.set(rateLimitKey, attempts + 1, 900);

            // Intentional delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            throw new UnauthorizedError('Invalid credentials');
        }

        // Check if active
        if (user.status !== 'active') {
            throw new UnauthorizedError(`Account is ${user.status}`);
        }

        // Clear failed attempts
        await cacheService.delete(rateLimitKey);

        // Generate JWT tokens
        const accessToken = jwtUtil.generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = jwtUtil.generateRefreshToken({
            id: user.id,
            email: user.email,
        });

        // Cache user data
        const cacheKey = cacheService.buildKey('user', user.id);
        await cacheService.set(cacheKey, user.toPublicJSON(), cacheService.ttl.userProfile);

        logger.info(`User ${user.id} logged in successfully`);

        return {
            accessToken,
            refreshToken,
            user: user.toPublicJSON(),
        };
    }

    /**
     * Get user profile with caching
     */
    async getProfile(userId) {
        // Try cache first
        const cacheKey = cacheService.buildKey('user', userId);
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        // Fetch from database
        const user = await User.findByPk(userId, {
            include: [
                {
                    model: Enrollment,
                    as: 'enrollments',
                    include: [
                        {
                            model: Course,
                            as: 'course',
                            attributes: ['id', 'title', 'thumbnailUrl', 'slug'],
                        },
                    ],
                    order: [['enrolledAt', 'DESC']],
                    limit: 10,
                },
            ],
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        const profile = user.toPublicJSON();

        // Cache for 5 minutes
        await cacheService.set(cacheKey, profile, cacheService.ttl.userProfile);

        return profile;
    }

    /**
     * Update user profile
     * Enhanced with cache invalidation
     */
    async updateProfile(userId, data) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Validate allowed fields
        const allowedFields = ['firstName', 'lastName', 'phone', 'dateOfBirth'];
        const updateData = {};

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                // Validate phone if provided
                if (field === 'phone' && data[field]) {
                    this.validatePhone(data[field]);
                }

                // Validate date of birth if provided
                if (field === 'dateOfBirth' && data[field]) {
                    const dob = new Date(data[field]);
                    const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

                    if (age < 13 || age > 120) {
                        throw new ValidationError('Invalid date of birth');
                    }
                }

                updateData[field] = data[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            throw new ValidationError('No valid fields to update');
        }

        await user.update(updateData);

        // Invalidate cache
        await cacheService.delete(cacheService.buildKey('user', userId));

        // Queue profile sync to external systems (Phase 2)
        try {
            if (user.incubatorUserId) {
                await enrollmentQueue.syncIncubatorProfile(userId);
            }
        } catch (error) {
            logger.warn('Failed to queue profile sync', { userId, error: error.message });
        }

        logger.info(`User ${userId} profile updated`);

        return user.toPublicJSON();
    }

    /**
     * Change password
     * Enhanced with validation
     */
    async changePassword(userId, currentPassword, newPassword) {
        // Validate new password
        this.validatePassword(newPassword);

        const user = await User.findByPk(userId);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        // Verify current password
        const isValid = await user.verifyPassword(currentPassword);

        if (!isValid) {
            throw new ValidationError('Current password is incorrect');
        }

        // Check if new password is same as current
        const isSame = await user.verifyPassword(newPassword);
        if (isSame) {
            throw new ValidationError('New password must be different from current password');
        }

        // Update password (hook will hash it)
        await user.update({
            passwordHash: newPassword,
            tempPassword: null
        });

        // Invalidate all user sessions (optional - requires session management)
        await cacheService.deletePattern(cacheService.buildKey('session', userId, '*'));

        // Queue password change notification email (Phase 1)
        // await emailQueue.sendPasswordChanged(userId);

        logger.info(`User ${userId} changed password`);

        return { success: true };
    }

    /**
     * Get all users with filtering and pagination (Admin)
     * Enhanced with caching
     */
    async getAllUsers(filters = {}) {
        const { page = 1, limit = 20, role, status, search } = filters;

        // Build cache key from filters
        const cacheKey = cacheService.buildKey('users', 'list', JSON.stringify(filters));
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

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
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['passwordHash', 'tempPassword'] },
        });

        const response = {
            users: result.data.map((u) => u.toPublicJSON()),
            pagination: result.pagination,
        };

        // Cache for 2 minutes (shorter for admin data)
        await cacheService.set(cacheKey, response, 120);

        return response;
    }

    /**
     * Find user by ID
     * Enhanced with caching
     */
    async findById(userId) {
        const cacheKey = cacheService.buildKey('user', userId);
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            return User.build(cached);
        }

        const user = await User.findByPk(userId);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        await cacheService.set(cacheKey, user.toJSON(), cacheService.ttl.userProfile);

        return user;
    }

    /**
     * Find user by email
     */
    async findByEmail(email) {
        email = email.toLowerCase().trim();
        return await User.findOne({ where: { email } });
    }

    /**
     * Update Moodle user ID
     */
    async updateMoodleId(userId, moodleUserId) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        await user.update({ moodleUserId });

        // Invalidate cache
        await cacheService.delete(cacheService.buildKey('user', userId));

        logger.info(`User ${userId} Moodle ID updated: ${moodleUserId}`);

        return user;
    }

    /**
     * Update Incubator user ID
     */
    async updateIncubatorId(userId, incubatorUserId) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        await user.update({ incubatorUserId });

        // Invalidate cache
        await cacheService.delete(cacheService.buildKey('user', userId));

        logger.info(`User ${userId} Incubator ID updated: ${incubatorUserId}`);

        return user;
    }

    /**
     * Get user notifications with caching
     */
    async getNotifications(userId, filters = {}) {
        const { page = 1, limit = 20, unreadOnly = false } = filters;

        const where = { userId };

        if (unreadOnly) {
            where.isRead = false;
        }

        const result = await Notification.paginate({
            page,
            limit,
            where,
            order: [['createdAt', 'DESC']],
        });

        return {
            notifications: result.data.map((n) => n.toJSON()),
            pagination: result.pagination,
        };
    }

    /**
     * Mark notification as read
     */
    async markNotificationRead(userId, notificationId) {
        const notification = await Notification.findOne({
            where: { id: notificationId, userId },
        });

        if (!notification) {
            throw new NotFoundError('Notification not found');
        }

        await notification.update({ isRead: true, readAt: new Date() });

        // Emit real-time event
        emitToUser(userId, 'notification:read', { id: notificationId });

        return { success: true };
    }

    /**
     * Mark all notifications as read
     */
    async markAllNotificationsRead(userId) {
        const updated = await Notification.update(
            { isRead: true, readAt: new Date() },
            { where: { userId, isRead: false } }
        );

        // Emit real-time event
        emitToUser(userId, 'notification:read-all', { userId });

        logger.info(`Marked ${updated[0]} notifications as read for user ${userId}`);

        return { success: true, count: updated[0] };
    }

    /**
     * Suspend user (Admin only)
     */
    async suspendUser(userId, reason, adminId) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (user.status === 'suspended') {
            throw new ValidationError('User is already suspended');
        }

        await user.update({ status: 'suspended' });

        // Invalidate cache and sessions
        await cacheService.delete(cacheService.buildKey('user', userId));
        await cacheService.deletePattern(cacheService.buildKey('session', userId, '*'));

        // TODO: Queue suspension notification email

        logger.info(`User ${userId} suspended by admin ${adminId}. Reason: ${reason}`);

        return user.toPublicJSON();
    }

    /**
     * Activate user (Admin only)
     */
    async activateUser(userId, adminId) {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (user.status === 'active') {
            throw new ValidationError('User is already active');
        }

        await user.update({ status: 'active' });

        // Invalidate cache
        await cacheService.delete(cacheService.buildKey('user', userId));

        // TODO: Queue activation notification email

        logger.info(`User ${userId} activated by admin ${adminId}`);

        return user.toPublicJSON();
    }

    /**
     * Get user statistics (Admin)
     * Enhanced with caching
     */
    async getStats() {
        const cacheKey = cacheService.buildKey('users', 'stats');
        const cached = await cacheService.get(cacheKey);

        if (cached) {
            return cached;
        }

        const [
            totalUsers,
            activeUsers,
            suspendedUsers,
            studentCount,
            teacherCount,
            adminCount,
            recentRegistrations,
        ] = await Promise.all([
            User.count(),
            User.count({ where: { status: 'active' } }),
            User.count({ where: { status: 'suspended' } }),
            User.count({ where: { role: 'student' } }),
            User.count({ where: { role: 'teacher' } }),
            User.count({ where: { role: { [Op.in]: ['admin', 'super_admin'] } } }),
            User.count({
                where: {
                    createdAt: {
                        [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                    },
                },
            }),
        ]);

        const stats = {
            totalUsers,
            activeUsers,
            suspendedUsers,
            usersByRole: {
                students: studentCount,
                teachers: teacherCount,
                admins: adminCount,
            },
            recentRegistrations,
        };

        // Cache for 5 minutes
        await cacheService.set(cacheKey, stats, 300);

        return stats;
    }
}

export default new UserService();