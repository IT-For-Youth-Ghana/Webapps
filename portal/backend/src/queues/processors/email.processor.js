/**
 * Email Job Processors
 * Handles all email-related background jobs
 */

import emailService from '../../modules/shared/email/email.service.js';
import User from '../../modules/user/user.model.js';
import Course from '../../modules/course/course.model.js';
import Payment from '../../modules/payment/payment.model.js';
import EmailLog from '../../modules/system/email-log.model.js';
import logger from '../../utils/logger.js';

/**
 * Email job types
 */
export const EMAIL_JOBS = {
    SEND_VERIFICATION_CODE: 'send-verification-code',
    SEND_WELCOME_EMAIL: 'send-welcome-email',
    SEND_COURSE_ENROLLMENT: 'send-course-enrollment',
    SEND_PASSWORD_RESET: 'send-password-reset',
    SEND_PAYMENT_RECEIPT: 'send-payment-receipt',
    SEND_COURSE_COMPLETION: 'send-course-completion',
    SEND_ENROLLMENT_REMINDER: 'send-enrollment-reminder',
    SEND_PAYMENT_REMINDER: 'send-payment-reminder',
};

/**
 * Main email processor
 * Routes to specific handlers based on job name
 */
export const emailProcessor = async (job) => {
    const { name, data } = job;

    logger.info(`Processing email job: ${name}`, {
        jobId: job.id,
        attemptsMade: job.attemptsMade,
    });

    try {
        // Update progress
        await job.updateProgress(10);

        // Route to appropriate handler
        switch (name) {
            case EMAIL_JOBS.SEND_VERIFICATION_CODE:
                return await handleVerificationCode(job, data);

            case EMAIL_JOBS.SEND_WELCOME_EMAIL:
                return await handleWelcomeEmail(job, data);

            case EMAIL_JOBS.SEND_COURSE_ENROLLMENT:
                return await handleCourseEnrollment(job, data);

            case EMAIL_JOBS.SEND_PASSWORD_RESET:
                return await handlePasswordReset(job, data);

            case EMAIL_JOBS.SEND_PAYMENT_RECEIPT:
                return await handlePaymentReceipt(job, data);

            case EMAIL_JOBS.SEND_COURSE_COMPLETION:
                return await handleCourseCompletion(job, data);

            case EMAIL_JOBS.SEND_ENROLLMENT_REMINDER:
                return await handleEnrollmentReminder(job, data);

            case EMAIL_JOBS.SEND_PAYMENT_REMINDER:
                return await handlePaymentReminder(job, data);

            default:
                throw new Error(`Unknown email job type: ${name}`);
        }
    } catch (error) {
        logger.error(`Email job failed: ${name}`, {
            jobId: job.id,
            error: error.message,
            stack: error.stack,
        });

        // Log failure
        if (data.userId) {
            await logEmailFailure(data.userId, data.email || 'unknown', name, error.message);
        }

        throw error; // Re-throw to trigger retry
    }
};

/**
 * Handle verification code email
 */
async function handleVerificationCode(job, data) {
    const { email, code, firstName } = data;

    await job.updateProgress(30);

    // Send email
    const result = await emailService.sendVerificationCode(email, code, firstName);

    await job.updateProgress(80);

    // Log email
    await logEmailSuccess(null, email, EMAIL_JOBS.SEND_VERIFICATION_CODE, result.messageId);

    await job.updateProgress(100);

    return {
        success: true,
        messageId: result.messageId,
        email,
    };
}

/**
 * Handle welcome email
 */
async function handleWelcomeEmail(job, data) {
    const { userId, courseId } = data;

    await job.updateProgress(20);

    // Fetch user and course (if courseId provided)
    const [user, course] = await Promise.all([
        User.findByPk(userId),
        courseId ? Course.findByPk(courseId) : Promise.resolve(null),
    ]);

    if (!user) {
        throw new Error(`User not found: ${userId}`);
    }

    if (courseId && !course) {
        throw new Error(`Course not found: ${courseId}`);
    }

    await job.updateProgress(50);

    // Send email
    const result = await emailService.sendWelcomeEmail(user, course, data.autopassword);

    await job.updateProgress(80);

    // Log email
    await logEmailSuccess(userId, user.email, EMAIL_JOBS.SEND_WELCOME_EMAIL, result.messageId);

    await job.updateProgress(100);

    return {
        success: true,
        messageId: result.messageId,
        userId,
        courseId,
    };
}

/**
 * Handle course enrollment email
 */
async function handleCourseEnrollment(job, data) {
    const { userId, courseId } = data;

    await job.updateProgress(20);

    // Fetch user and course
    const [user, course] = await Promise.all([
        User.findByPk(userId),
        Course.findByPk(courseId),
    ]);

    if (!user) {
        throw new Error(`User not found: ${userId}`);
    }

    if (!course) {
        throw new Error(`Course not found: ${courseId}`);
    }

    await job.updateProgress(50);

    // Send email
    const result = await emailService.sendCourseEnrollmentEmail(user, course);

    await job.updateProgress(80);

    // Log email
    await logEmailSuccess(userId, user.email, EMAIL_JOBS.SEND_COURSE_ENROLLMENT, result.messageId);

    await job.updateProgress(100);

    return {
        success: true,
        messageId: result.messageId,
        userId,
        courseId,
    };
}

/**
 * Handle password reset email
 */
async function handlePasswordReset(job, data) {
    const { email, resetToken, firstName } = data;

    await job.updateProgress(30);

    // Send email
    const result = await emailService.sendPasswordReset(email, resetToken, firstName);

    await job.updateProgress(80);

    // Log email
    await logEmailSuccess(null, email, EMAIL_JOBS.SEND_PASSWORD_RESET, result.messageId);

    await job.updateProgress(100);

    return {
        success: true,
        messageId: result.messageId,
        email,
    };
}

/**
 * Handle payment receipt email
 */
async function handlePaymentReceipt(job, data) {
    const { userId, paymentId, courseId } = data;

    await job.updateProgress(20);

    // Fetch user, payment, and course
    const [user, payment, course] = await Promise.all([
        User.findByPk(userId),
        Payment.findByPk(paymentId),
        Course.findByPk(courseId),
    ]);

    if (!user) {
        throw new Error(`User not found: ${userId}`);
    }

    if (!payment) {
        throw new Error(`Payment not found: ${paymentId}`);
    }

    if (!course) {
        throw new Error(`Course not found: ${courseId}`);
    }

    await job.updateProgress(50);

    // Send email
    const result = await emailService.sendPaymentReceipt(user, payment, course);

    await job.updateProgress(80);

    // Log email
    await logEmailSuccess(userId, user.email, EMAIL_JOBS.SEND_PAYMENT_RECEIPT, result.messageId);

    await job.updateProgress(100);

    return {
        success: true,
        messageId: result.messageId,
        userId,
        paymentId,
    };
}

/**
 * Handle course completion email
 */
async function handleCourseCompletion(job, data) {
    const { userId, courseId } = data;

    await job.updateProgress(20);

    // Fetch user and course
    const [user, course] = await Promise.all([
        User.findByPk(userId),
        Course.findByPk(courseId),
    ]);

    if (!user) {
        throw new Error(`User not found: ${userId}`);
    }

    if (!course) {
        throw new Error(`Course not found: ${courseId}`);
    }

    await job.updateProgress(50);

    // Send email (you'll need to create this template)
    // For now, using a generic approach
    const result = await emailService.sendEmail({
        to: user.email,
        subject: `Congratulations on completing ${course.title}!`,
        html: `
            <h2>Congratulations, ${user.firstName}!</h2>
            <p>You've successfully completed <strong>${course.title}</strong>.</p>
            <p>Your certificate is now available.</p>
        `,
    });

    await job.updateProgress(80);

    // Log email
    await logEmailSuccess(userId, user.email, EMAIL_JOBS.SEND_COURSE_COMPLETION, result.messageId);

    await job.updateProgress(100);

    return {
        success: true,
        messageId: result.messageId,
        userId,
        courseId,
    };
}

/**
 * Handle enrollment reminder email
 */
async function handleEnrollmentReminder(job, data) {
    const { userId, courseId } = data;

    await job.updateProgress(20);

    // Fetch user and course
    const [user, course] = await Promise.all([
        User.findByPk(userId),
        Course.findByPk(courseId),
    ]);

    if (!user) {
        throw new Error(`User not found: ${userId}`);
    }

    if (!course) {
        throw new Error(`Course not found: ${courseId}`);
    }

    await job.updateProgress(50);

    // Send reminder email
    const result = await emailService.sendEmail({
        to: user.email,
        subject: `Don't forget about ${course.title}!`,
        html: `
            <h2>Hi ${user.firstName},</h2>
            <p>We noticed you haven't started <strong>${course.title}</strong> yet.</p>
            <p>Start learning today and unlock your potential!</p>
        `,
    });

    await job.updateProgress(80);

    // Log email
    await logEmailSuccess(userId, user.email, EMAIL_JOBS.SEND_ENROLLMENT_REMINDER, result.messageId);

    await job.updateProgress(100);

    return {
        success: true,
        messageId: result.messageId,
        userId,
        courseId,
    };
}

/**
 * Handle payment reminder email
 */
async function handlePaymentReminder(job, data) {
    const { userId, enrollmentId } = data;

    await job.updateProgress(20);

    const user = await User.findByPk(userId);

    if (!user) {
        throw new Error(`User not found: ${userId}`);
    }

    await job.updateProgress(50);

    // Send reminder email
    const result = await emailService.sendEmail({
        to: user.email,
        subject: 'Complete your payment to access your course',
        html: `
            <h2>Hi ${user.firstName},</h2>
            <p>You have a pending payment for your course enrollment.</p>
            <p>Complete your payment to start learning!</p>
        `,
    });

    await job.updateProgress(80);

    // Log email
    await logEmailSuccess(userId, user.email, EMAIL_JOBS.SEND_PAYMENT_REMINDER, result.messageId);

    await job.updateProgress(100);

    return {
        success: true,
        messageId: result.messageId,
        userId,
        enrollmentId,
    };
}

/**
 * Log successful email
 */
async function logEmailSuccess(userId, toEmail, template, providerId) {
    try {
        await EmailLog.create({
            userId,
            toEmail,
            subject: template,
            template,
            status: 'sent',
            providerId,
            sentAt: new Date(),
        });
    } catch (error) {
        logger.error('Failed to log email success', error);
        // Don't throw - logging failure shouldn't fail the job
    }
}

/**
 * Log failed email
 */
async function logEmailFailure(userId, toEmail, template, errorMessage) {
    try {
        await EmailLog.create({
            userId,
            toEmail,
            subject: template,
            template,
            status: 'failed',
            errorMessage,
        });
    } catch (error) {
        logger.error('Failed to log email failure', error);
    }
}
