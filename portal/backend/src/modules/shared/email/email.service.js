/**
 * Email Service
 * Handles sending emails via configured provider
 */

import config from '../../../config/index.js';
import logger from '../../../utils/logger.js';

class EmailService {
    constructor() {
        this.provider = config.email.provider || 'console';
        this.from = `${config.email.from.name} <${config.email.from.address}>`;

        this.transport = null;
        this.queue = [];
        this.processing = 0;
        this.maxConcurrency = parseInt(process.env.EMAIL_QUEUE_CONCURRENCY || '2', 10);
        this.maxQueue = parseInt(process.env.EMAIL_QUEUE_MAX || '1000', 10);
        this.initialized = false;
    }

    /**
     * Initialize provider (lazy)
     */
    async initProvider() {
        if (this.initialized) return;

        this.initialized = true;

        if (this.provider === 'smtp') {
            const { default: nodemailer } = await import('nodemailer');

            this.transport = nodemailer.createTransport({
                host: config.email.smtp.host,
                port: config.email.smtp.port,
                secure: config.email.smtp.port === 465,
                auth: config.email.smtp.user
                    ? { user: config.email.smtp.user, pass: config.email.smtp.password }
                    : undefined,
            });
        }
    }

    /**
     * Send email (fire-and-forget by default)
     */
    async send({ to, subject, html, text }, { fireAndForget = true } = {}) {
        if (fireAndForget) {
            return this.enqueue({ to, subject, html, text });
        }

        return this.sendNow({ to, subject, html, text });
    }

    /**
     * Enqueue email for background send
     */
    async enqueue(payload) {
        if (this.queue.length >= this.maxQueue) {
            logger.warn('Email queue full, dropping message', {
                to: payload.to,
                subject: payload.subject,
            });
            return { success: false, queued: false, reason: 'queue_full' };
        }

        this.queue.push(payload);
        this.processQueue();

        return { success: true, queued: true };
    }

    /**
     * Process queue with limited concurrency
     */
    processQueue() {
        while (this.processing < this.maxConcurrency && this.queue.length > 0) {
            const payload = this.queue.shift();
            this.processing += 1;

            this.sendNow(payload)
                .catch((error) => {
                    logger.error(`Failed to send email to ${payload.to}`, error);
                })
                .finally(() => {
                    this.processing -= 1;
                    this.processQueue();
                });
        }
    }

    /**
     * Send immediately (internal)
     */
    async sendNow({ to, subject, html, text }) {
        try {
            if (this.provider === 'console') {
                // Development mode - log to console
                logger.info(`📧 Email sent to ${to}`, { subject });
                return { success: true, messageId: `dev_${Date.now()}` };
            }

            await this.initProvider();

            if (this.provider === 'smtp') {
                const info = await this.transport.sendMail({
                    from: this.from,
                    to,
                    subject,
                    html,
                    text,
                });

                logger.info(`Email sent to ${to}`, { subject, messageId: info.messageId });
                return { success: true, messageId: info.messageId };
            }

            logger.warn(`Unknown email provider: ${this.provider}. Falling back to console.`);
            logger.info(`📧 Email sent to ${to}`, { subject });
            return { success: true, messageId: `dev_${Date.now()}` };
        } catch (error) {
            logger.error(`Failed to send email to ${to}`, error);
            throw error;
        }
    }

    /**
     * Send verification code email
     */
    async sendVerificationCode(email, code, firstName) {
        return this.send({
            to: email,
            subject: 'Verify your email - IT For Youth Ghana',
            html: `
        <h2>Hello ${firstName}!</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #4F46E5;">${code}</h1>
        <p>This code expires in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
        });
    }

    /**
     * Send welcome email after enrollment
     */
    async sendWelcomeEmail(user, course) {
        return this.send({
            to: user.email,
            subject: `Welcome to ${course.title} - IT For Youth Ghana`,
            html: `
        <h2>Welcome, ${user.firstName}!</h2>
        <p>You have been successfully enrolled in <strong>${course.title}</strong>.</p>
        <p>Your temporary password is: <code>${user.tempPassword || 'Check your registration email'}</code></p>
        <p>Please change it after your first login.</p>
        <p>Get started by logging into the learning portal.</p>
        <a href="${process.env.MOODLE_URL}" style="display: inline-block; padding: 10px 20px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
          Access Course
        </a>
      `,
        });
    }

    /**
     * Send password reset email
     */
    async sendPasswordReset(email, resetToken, firstName) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        return this.send({
            to: email,
            subject: 'Password Reset - IT For Youth Ghana',
            html: `
        <h2>Hello ${firstName}!</h2>
        <p>You requested a password reset.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
        });
    }

    /**
     * Send payment receipt
     */
    async sendPaymentReceipt(user, payment, course) {
        return this.send({
            to: user.email,
            subject: `Payment Receipt - ${course.title}`,
            html: `
        <h2>Payment Successful!</h2>
        <p>Thank you for your payment, ${user.firstName}.</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td>Course:</td>
            <td><strong>${course.title}</strong></td>
          </tr>
          <tr>
            <td>Amount:</td>
            <td><strong>${payment.currency} ${payment.amount}</strong></td>
          </tr>
          <tr>
            <td>Reference:</td>
            <td>${payment.paystackReference}</td>
          </tr>
          <tr>
            <td>Date:</td>
            <td>${new Date().toLocaleDateString()}</td>
          </tr>
        </table>
      `,
        });
    }
}

export default new EmailService();
