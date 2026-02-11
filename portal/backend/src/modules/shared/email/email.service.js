/**
 * Email Service
 * Handles email sending using Nodemailer with:
 * - SMTP configuration (Gmail, SendGrid, AWS SES)
 * - HTML email templates (Handlebars)
 * - Health checks + test emails
 */

import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs/promises';
import handlebars from 'handlebars';
import config from '../../../config/index.js';
import logger from '../../../utils/logger.js';

const EMAIL_TEMPLATES = {
    VERIFICATION_CODE: 'verification_code',
    WELCOME: 'welcome_email',
    COURSE_ENROLLMENT: 'course_enrollment',
    PASSWORD_RESET: 'password_reset',
    PAYMENT_RECEIPT: 'payment_receipt',
};

class EmailService {
    constructor() {
        this.transporter = null;
        this.from = this.buildFromAddress();
        this.templatesDir = path.join(process.cwd(), 'src', 'templates', 'emails');
        this.isReady = false;

        this.registerHandlebarsHelpers();
        // Initialization should be explicit to avoid startup hangs
    }

    buildFromAddress() {
        const fromName =
            process.env.EMAIL_FROM_NAME ||
            process.env.EMAIL_FROM ||
            config.email?.from?.name ||
            'IT For Youth Ghana';

        const fromAddress =
            process.env.EMAIL_FROM_ADDRESS ||
            process.env.EMAIL_FROM ||
            config.email?.from?.address ||
            'noreply@itforyouthghana.org';

        return `${fromName} <${fromAddress}>`;
    }

    /**
     * Register custom Handlebars helpers
     * @private
     */
    registerHandlebarsHelpers() {
        handlebars.registerHelper('eq', (a, b) => a === b);
        handlebars.registerHelper('ne', (a, b) => a !== b);
        handlebars.registerHelper('gt', (a, b) => a > b);
        handlebars.registerHelper('lt', (a, b) => a < b);
        handlebars.registerHelper('or', (...args) => args.slice(0, -1).some(Boolean));
        handlebars.registerHelper('and', (...args) => args.slice(0, -1).every(Boolean));
        handlebars.registerHelper('formatDate', (date) => {
            if (!date) return '';
            return new Date(date).toLocaleDateString();
        });
        handlebars.registerHelper('capitalize', (str) => {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1);
        });
    }

    /**
     * Initialize email transporter
     */
    async initialize() {
        try {
            const emailProvider = (process.env.EMAIL_PROVIDER || config.email?.provider || 'smtp').toLowerCase();

            logger.info(`Initializing email service with provider: ${emailProvider}`);

            switch (emailProvider) {
                case 'gmail':
                    this.transporter = this.createGmailTransporter();
                    break;
                case 'sendgrid':
                    this.transporter = this.createSendGridTransporter();
                    break;
                case 'ses':
                    this.transporter = this.createSESTransporter();
                    break;
                case 'console':
                    this.transporter = this.createTestTransporter();
                    break;
                case 'smtp':
                default:
                    this.transporter = this.createSMTPTransporter();
            }

            await this.transporter.verify();
            this.isReady = true;
            logger.info('Email service initialized successfully');

            //send test email in non-production environments
            if (process.env.NODE_ENV !== 'production') {
                const testEmail = process.env.EMAIL_TEST_ADDRESS || config.email?.testAddress;
                if (testEmail) {
                    await this.sendTestEmail(testEmail);
                    logger.info(`Test email sent successfully to ${testEmail}`);
                } else {
                    logger.warn('No test email address configured, skipping test email');
                }
            }
        } catch (error) {
            logger.error('Email service initialization failed', error);
            this.isReady = false;

            if (process.env.NODE_ENV !== 'production') {
                logger.warn('Using console email preview in development');
                this.transporter = this.createTestTransporter();
            }
        }
    }

    // ========================================
    // TRANSPORTER CONFIGURATIONS
    // ========================================

    createGmailTransporter() {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    createSendGridTransporter() {
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY,
            },
        });
    }

    createSESTransporter() {
        return nodemailer.createTransport({
            host: `email.${process.env.AWS_SES_REGION || 'us-east-1'}.amazonaws.com`,
            port: 587,
            secure: false,
            auth: {
                user: process.env.AWS_ACCESS_KEY_ID,
                pass: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }

    createSMTPTransporter() {
        const host = process.env.SMTP_HOST || config.email?.smtp?.host || process.env.EMAIL_HOST;
        const port =
            parseInt(process.env.SMTP_PORT, 10) ||
            config.email?.smtp?.port ||
            parseInt(process.env.EMAIL_PORT, 10) ||
            587;
        const secure = process.env.SMTP_SECURE === 'true' || port === 465;
        const user = process.env.SMTP_USER || config.email?.smtp?.user || process.env.EMAIL_USER;
        const pass = process.env.SMTP_PASSWORD || config.email?.smtp?.password || process.env.EMAIL_PASSWORD;

        return nodemailer.createTransport({
            host,
            port,
            secure,
            auth: user ? { user, pass } : undefined,
        });
    }

    createTestTransporter() {
        return {
            sendMail: async (mailOptions) => {
                logger.info('===== EMAIL PREVIEW =====', {
                    to: mailOptions.to,
                    subject: mailOptions.subject,
                    text: mailOptions.text?.substring(0, 200),
                });
                return { messageId: `test-${Date.now()}` };
            },
            verify: async () => true,
        };
    }

    // ========================================
    // CORE EMAIL SENDING
    // ========================================

    async ensureReady() {
        if (!this.transporter) {
            await this.initialize();
        }

        if (!this.isReady && process.env.NODE_ENV === 'production') {
            throw new Error('Email service not ready');
        }
    }

    /**
     * Send email
     * @param {Object} options - { to, subject, text, html, attachments, from }
     */
    async sendEmail(options) {
        try {
            await this.ensureReady();

            const mailOptions = {
                from: options.from || this.from,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
                attachments: options.attachments,
            };

            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Email sent to ${options.to}`, { messageId: info.messageId });

            return {
                success: true,
                messageId: info.messageId,
                response: info.response,
            };
        } catch (error) {
            logger.error('Email send failed', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Send email using template
     * @param {Object} options - { to, subject, template, context }
     */
    async sendTemplateEmail(options) {
        try {
            const { to, subject, template, context } = options;
            const html = await this.renderTemplate(template, context);
            const text = this.htmlToText(html);

            return await this.sendEmail({
                to,
                subject,
                html,
                text,
            });
        } catch (error) {
            logger.error('Template email send failed', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // ========================================
    // EMAIL TEMPLATES
    // ========================================

    async renderTemplate(templateName, context = {}) {
        try {
            const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
            const templateSource = await fs.readFile(templatePath, 'utf-8');
            const template = handlebars.compile(templateSource);

            const fullContext = {
                ...context,
                appName: 'IT For Youth Ghana',
                appUrl: config.frontend?.url || process.env.FRONTEND_URL || 'http://localhost:3000',
                currentYear: new Date().getFullYear(),
                supportEmail: process.env.SUPPORT_EMAIL || 'support@itforyouthghana.org',
                moodleUrl: config.moodle?.url || process.env.MOODLE_URL,
            };

            return template(fullContext);
        } catch (error) {
            logger.error(`Template render failed for ${templateName}`, error);
            return this.getFallbackTemplate(context);
        }
    }

    getFallbackTemplate(context) {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>IT For Youth Ghana</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>IT For Youth Ghana</h2>
          <div style="margin: 20px 0;">
            ${context.message || ''}
          </div>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            © ${new Date().getFullYear()} IT For Youth Ghana. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;
    }

    htmlToText(html) {
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // ========================================
    // PRE-BUILT EMAIL METHODS
    // ========================================

    async sendVerificationCode(email, code, firstName) {
        return this.sendTemplateEmail({
            to: email,
            subject: 'Verify your email - IT For Youth Ghana',
            template: EMAIL_TEMPLATES.VERIFICATION_CODE,
            context: {
                firstName,
                code,
            },
        });
    }

    async sendWelcomeEmail(user, course, autoPassword = null) {
        const portalUrl = config.frontend?.url || process.env.FRONTEND_URL || 'https://portal.itforyouthghana.org';
        const moodleUrl = config.moodle?.url || process.env.MOODLE_URL;

        return this.sendTemplateEmail({
            to: user.email,
            subject: course ? `Welcome to ${course.title} - IT For Youth Ghana` : 'Welcome to IT For Youth Ghana',
            template: EMAIL_TEMPLATES.WELCOME,
            context: {
                firstName: user.firstName,
                courseTitle: course?.title,
                tempPassword: autoPassword, // Will be null for auto-login registrations
                portalUrl: portalUrl,
                courseUrl: moodleUrl,
                appName: 'IT For Youth Ghana',
                currentYear: new Date().getFullYear(),
                supportEmail: 'support@itforyouthghana.org',
            },
        });
    }

    async sendCourseEnrollmentEmail(user, course) {
        const portalUrl = `${config.frontend?.url || process.env.FRONTEND_URL || 'https://portal.itforyouthghana.org'}/dashboard/courses`;
        const moodleUrl = config.moodle?.url || process.env.MOODLE_URL;

        return this.sendTemplateEmail({
            to: user.email,
            subject: `🎓 You're Enrolled in ${course.title} - IT For Youth Ghana`,
            template: EMAIL_TEMPLATES.COURSE_ENROLLMENT,
            context: {
                firstName: user.firstName,
                courseTitle: course.title,
                courseDescription: course.description || course.shortDescription,
                portalUrl: portalUrl,
                courseUrl: moodleUrl,
                appName: 'IT For Youth Ghana',
                currentYear: new Date().getFullYear(),
                supportEmail: 'support@itforyouthghana.org',
            },
        });
    }

    async sendPasswordReset(email, resetToken, firstName) {
        const resetUrl = `${config.frontend?.url || process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        return this.sendTemplateEmail({
            to: email,
            subject: 'Password Reset - IT For Youth Ghana',
            template: EMAIL_TEMPLATES.PASSWORD_RESET,
            context: {
                firstName,
                resetUrl,
            },
        });
    }

    async sendPaymentReceipt(user, payment, course) {
        return this.sendTemplateEmail({
            to: user.email,
            subject: `Payment Receipt - ${course.title}`,
            template: EMAIL_TEMPLATES.PAYMENT_RECEIPT,
            context: {
                firstName: user.firstName,
                courseTitle: course.title,
                amount: payment.amount,
                currency: payment.currency,
                reference: payment.paystackReference,
                date: new Date().toLocaleDateString(),
            },
        });
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    async verify() {
        try {
            await this.transporter.verify();
            return true;
        } catch (error) {
            logger.error('Email verification failed', error);
            return false;
        }
    }

    async healthCheck() {
        try {
            const isVerified = await this.verify();
            return {
                status: isVerified ? 'healthy' : 'unhealthy',
                provider: process.env.EMAIL_PROVIDER || config.email?.provider || 'smtp',
                isReady: this.isReady,
                from: this.from,
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
            };
        }
    }

    async sendTestEmail(to) {
        return this.sendEmail({
            to,
            subject: 'Test Email from IT For Youth Ghana',
            html: this.getFallbackTemplate({
                message: `
          <h3>Test Email</h3>
          <p>This is a test email from the IT For Youth Ghana platform.</p>
          <p>If you received this, the email service is working correctly!</p>
          <p>Time: ${new Date().toLocaleString()}</p>
        `,
            }),
        });
    }
}
const emailService = new EmailService();
export default emailService;