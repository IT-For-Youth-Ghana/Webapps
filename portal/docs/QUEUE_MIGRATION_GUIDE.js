/**
 * QUEUE MIGRATION GUIDE
 * How to update existing services to use the queue system
 * 
 * This file shows before/after examples for migrating to queued email sending
 */

// ============================================================================
// EXAMPLE 1: User Service - Registration Email
// ============================================================================

// BEFORE (Synchronous - SLOW):
async startRegistration({ email, firstName, lastName }) {
    const code = crypto.randomInt(100000, 999999).toString();
    
    await VerificationCode.upsert({
        email,
        code,
        registrationData: { firstName, lastName },
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        verified: false,
    });

    // ❌ BLOCKS the request for 2-5 seconds
    await emailService.sendVerificationCode(email, code, firstName);
    
    logger.info(`Verification code sent to ${email}`);
    
    return {
        success: true,
        email,
        message: 'Verification code sent to your email',
    };
}

// AFTER (Asynchronous - FAST):
async startRegistration({ email, firstName, lastName }) {
    const code = crypto.randomInt(100000, 999999).toString();
    
    await VerificationCode.upsert({
        email,
        code,
        registrationData: { firstName, lastName },
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        verified: false,
    });

    // ✅ QUEUES the email (returns immediately ~50ms)
    const emailQueue = (await import('../../queues/services/email.queue.js')).default;
    await emailQueue.sendVerificationCode(email, code, firstName);
    
    logger.info(`Verification code queued for ${email}`);
    
    return {
        success: true,
        email,
        message: 'Verification code sent to your email',
    };
}

// ============================================================================
// EXAMPLE 2: Auth Service - Password Reset
// ============================================================================

// BEFORE (Synchronous):
async requestPasswordReset(email) {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
        logger.info(`Password reset requested for non-existent email: ${email}`);
        return {
            success: true,
            message: 'If the email exists, a reset link has been sent',
        };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await VerificationCode.upsert({
        email,
        code: resetToken,
        expiresAt,
        verified: false,
        registrationData: { type: 'password_reset' },
    });

    // ❌ BLOCKS
    await emailService.sendPasswordReset(email, resetToken, user.firstName);

    logger.info(`Password reset requested for: ${email}`);

    return {
        success: true,
        message: 'Password reset instructions sent to your email',
    };
}

// AFTER (Asynchronous):
async requestPasswordReset(email) {
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
        logger.info(`Password reset requested for non-existent email: ${email}`);
        return {
            success: true,
            message: 'If the email exists, a reset link has been sent',
        };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await VerificationCode.upsert({
        email,
        code: resetToken,
        expiresAt,
        verified: false,
        registrationData: { type: 'password_reset' },
    });

    // ✅ QUEUES
    const emailQueue = (await import('../../queues/services/email.queue.js')).default;
    await emailQueue.sendPasswordReset(email, resetToken, user.firstName);

    logger.info(`Password reset email queued for: ${email}`);

    return {
        success: true,
        message: 'Password reset instructions sent to your email',
    };
}

// ============================================================================
// EXAMPLE 3: Enrollment Service - Welcome Email
// ============================================================================

// BEFORE (Synchronous):
async completeEnrollment(enrollmentId, paymentReference) {
    const enrollment = await Enrollment.findByPk(enrollmentId);
    
    if (!enrollment) {
        throw new NotFoundError("Enrollment not found");
    }

    const user = await User.findByPk(enrollment.userId);
    const course = await Course.findByPk(enrollment.courseId);

    // ... enrollment logic ...

    // ❌ BLOCKS (and if SMTP fails, the whole enrollment fails!)
    await emailService.sendWelcomeEmail(user, course);

    await notificationService.notifyEnrollmentSuccess(user.id, course);

    return { success: true };
}

// AFTER (Asynchronous):
async completeEnrollment(enrollmentId, paymentReference) {
    const enrollment = await Enrollment.findByPk(enrollmentId);
    
    if (!enrollment) {
        throw new NotFoundError("Enrollment not found");
    }

    const user = await User.findByPk(enrollment.userId);
    const course = await Course.findByPk(enrollment.courseId);

    // ... enrollment logic ...

    // ✅ QUEUES (enrollment succeeds even if email fails - retries automatically)
    const emailQueue = (await import('../../queues/services/email.queue.js')).default;
    await emailQueue.sendWelcomeEmail(user.id, course.id);

    await notificationService.notifyEnrollmentSuccess(user.id, course);

    return { success: true };
}

// ============================================================================
// EXAMPLE 4: Payment Service - Receipt Email
// ============================================================================

// BEFORE (Synchronous):
async verifyPayment(reference) {
    const payment = await Payment.findOne({
        where: { paystackReference: reference },
        include: [
            { model: User, as: "user" },
            {
                model: Enrollment,
                as: "enrollment",
                include: [{ model: Course, as: "course" }],
            },
        ],
    });

    if (!payment) {
        throw new NotFoundError("Payment not found");
    }

    const paystackData = await paystackService.verifyTransaction(reference);
    const isSuccess = paystackData.status === "success";

    await payment.update({
        status: isSuccess ? "success" : "failed",
        paymentMethod: paystackData.channel || payment.paymentMethod,
        paidAt: isSuccess ? new Date(paystackData.paidAt || Date.now()) : null,
    });

    if (isSuccess && payment.enrollment) {
        const enrollmentService = (await import("../enrollment/enrollment.service.js")).default;
        await enrollmentService.completeEnrollment(payment.enrollmentId, reference);

        // ❌ BLOCKS
        await emailService.sendPaymentReceipt(
            payment.user,
            payment,
            payment.enrollment.course
        );

        await notificationService.notifyPaymentSuccess(
            payment.userId,
            payment.amount,
            payment.currency,
            payment.enrollment.course.title
        );
    }

    return {
        success: isSuccess,
        status: isSuccess ? "success" : "failed",
        amount: paystackData.amount,
        paymentId: payment.id,
        enrollmentId: payment.enrollmentId,
    };
}

// AFTER (Asynchronous):
async verifyPayment(reference) {
    const payment = await Payment.findOne({
        where: { paystackReference: reference },
        include: [
            { model: User, as: "user" },
            {
                model: Enrollment,
                as: "enrollment",
                include: [{ model: Course, as: "course" }],
            },
        ],
    });

    if (!payment) {
        throw new NotFoundError("Payment not found");
    }

    const paystackData = await paystackService.verifyTransaction(reference);
    const isSuccess = paystackData.status === "success";

    await payment.update({
        status: isSuccess ? "success" : "failed",
        paymentMethod: paystackData.channel || payment.paymentMethod,
        paidAt: isSuccess ? new Date(paystackData.paidAt || Date.now()) : null,
    });

    if (isSuccess && payment.enrollment) {
        const enrollmentService = (await import("../enrollment/enrollment.service.js")).default;
        await enrollmentService.completeEnrollment(payment.enrollmentId, reference);

        // ✅ QUEUES
        const emailQueue = (await import('../../queues/services/email.queue.js')).default;
        await emailQueue.sendPaymentReceipt(
            payment.user.id,
            payment.id,
            payment.enrollment.course.id
        );

        await notificationService.notifyPaymentSuccess(
            payment.userId,
            payment.amount,
            payment.currency,
            payment.enrollment.course.title
        );
    }

    return {
        success: isSuccess,
        status: isSuccess ? "success" : "failed",
        amount: paystackData.amount,
        paymentId: payment.id,
        enrollmentId: payment.enrollmentId,
    };
}

// ============================================================================
// EXAMPLE 5: Scheduled Emails - Reminders
// ============================================================================

// NEW FEATURE - Send payment reminder 24 hours after pending enrollment:
async createPendingEnrollment(userId, courseId) {
    const enrollment = await Enrollment.create({
        userId,
        courseId,
        enrollmentStatus: 'pending',
        paymentStatus: 'pending',
    });

    // ✅ Schedule reminder email to be sent in 24 hours
    const emailQueue = (await import('../../queues/services/email.queue.js')).default;
    await emailQueue.sendPaymentReminder(userId, enrollment.id, 24);

    return enrollment;
}

// NEW FEATURE - Send course reminder 7 days after enrollment:
async completeEnrollment(enrollmentId) {
    await Enrollment.update(
        { enrollmentStatus: 'enrolled', enrolledAt: new Date() },
        { where: { id: enrollmentId } }
    );

    const enrollment = await Enrollment.findByPk(enrollmentId);

    // ✅ Schedule reminder email to be sent in 7 days
    const emailQueue = (await import('../../queues/services/email.queue.js')).default;
    await emailQueue.sendEnrollmentReminder(enrollment.userId, enrollment.courseId, 7);

    return enrollment;
}

// ============================================================================
// MIGRATION CHECKLIST
// ============================================================================

/*
1. ✅ Install BullMQ:
   npm install bullmq

2. ✅ Update .env file:
   Add Redis connection details (already exists in your config)

3. ✅ Initialize queues in server.js:
   import { initializeQueues, shutdownQueues } from './queues/index.js';
   
   await initializeQueues(); // After Redis, before starting HTTP server
   
   process.on('SIGTERM', async () => {
       await shutdownQueues();
       // ... rest of shutdown
   });

4. ✅ Update routes to include queue admin:
   import queueAdminRoutes from '../modules/admin/queue-admin.routes.js';
   router.use('/admin/queues', queueAdminRoutes);

5. ✅ Update services one by one:
   - user.service.js (verification emails)
   - auth.service.js (password reset)
   - enrollment.service.js (welcome emails)
   - payment.service.js (receipts)

6. ✅ Test in development:
   - Send test email
   - Check queue stats: GET /api/admin/queues/stats
   - Monitor failed jobs: GET /api/admin/queues/email/jobs?status=failed
   - Retry failed: POST /api/admin/queues/email/job/{jobId}/retry

7. ✅ Monitor in production:
   - Set up alerts for failed jobs
   - Monitor queue depth
   - Track email delivery rate
*/

// ============================================================================
// BENEFITS SUMMARY
// ============================================================================

/*
✅ Faster API responses (2-5 seconds → 50ms)
✅ Better reliability (automatic retries on SMTP failures)
✅ Resilience (enrollments succeed even if email fails)
✅ Scheduled emails (reminders, notifications)
✅ Monitoring dashboard (admin can see all email jobs)
✅ Manual retry (admin can retry failed emails)
✅ Better user experience (no waiting for external services)
✅ Scalability (can process hundreds of emails concurrently)
*/
