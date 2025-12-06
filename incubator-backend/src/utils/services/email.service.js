/* eslint-disable no-undef */
/**
 * Email Service
 * Handles email sending using Nodemailer with:
 * - SMTP configuration (Gmail, SendGrid, AWS SES)
 * - HTML email templates
 * - Email queue support (via Agenda)
 * - Email verification, password reset, notifications
 */

import nodemailer from "nodemailer";
import path from "path";
import fs from "fs/promises";
import handlebars from "handlebars"; 
import { EMAIL_TEMPLATES } from "../constants";
import { configDotenv } from "dotenv";

configDotenv();

class EmailService {
  constructor() {
    this.transporter = null;
    this.from = process.env.EMAIL_FROM || "IT Youth Talent Incubator <noreply@incubator.com>";
    this.templatesDir = path.join(process.cwd(), "src", "templates", "emails");
    this.isReady = false;

    // Register Handlebars helpers
    this.registerHandlebarsHelpers();

    // Initialize transporter
    this.initialize();
  }

  /**
   * Register custom Handlebars helpers
   * @private
   */
  registerHandlebarsHelpers() {
    // Equality helper for comparisons
    handlebars.registerHelper('eq', function(a, b) {
      return a === b;
    });

    // Not equal helper
    handlebars.registerHelper('ne', function(a, b) {
      return a !== b;
    });

    // Greater than helper
    handlebars.registerHelper('gt', function(a, b) {
      return a > b;
    });

    // Less than helper
    handlebars.registerHelper('lt', function(a, b) {
      return a < b;
    });

    // Logical OR helper
    handlebars.registerHelper('or', function() {
      return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    });

    // Logical AND helper
    handlebars.registerHelper('and', function() {
      return Array.prototype.slice.call(arguments, 0, -1).every(Boolean);
    });

    // Format date helper
    handlebars.registerHelper('formatDate', function(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString();
    });

    // Capitalize helper
    handlebars.registerHelper('capitalize', function(str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    });
  }

  /**
   * Initialize email transporter
   * @private
   */
  async initialize() {
    try {
      const emailProvider = process.env.EMAIL_PROVIDER || "gmail";

      console.log(`Initializing email service with provider: ${emailProvider}`);

      switch (emailProvider.toLowerCase()) {
        case "gmail":
          this.transporter = this.createGmailTransporter();
          break;
        case "sendgrid":
          this.transporter = this.createSendGridTransporter();
          break;
        case "ses":
          this.transporter = this.createSESTransporter();
          break;
        case "smtp":
        default:
          this.transporter = this.createSMTPTransporter();
      }

      // Verify transporter configuration
      await this.transporter.verify();
      this.isReady = true;
      console.log(" Email service initialized successfully");
    } catch (error) {
      console.error("Email service initialization failed:", error.message);
      this.isReady = false;

      // Fallback to console logging in development
      if (process.env.NODE_ENV !== "production") {
        console.warn("Using console email preview in development");
        this.transporter = this.createTestTransporter();
      }
    }
  }

  // ========================================
  // TRANSPORTER CONFIGURATIONS
  // ========================================

  /**
   * Create Gmail transporter
   * Requires: EMAIL_USER, EMAIL_PASSWORD (app password)
   */
  createGmailTransporter() {
    console.log(`Using Gmail transporter, ${process.env.EMAIL_USER}`);
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Create SendGrid transporter
   * Requires: SENDGRID_API_KEY
   */
  createSendGridTransporter() {
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  /**
   * Create AWS SES transporter
   * Requires: AWS_SES_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
   */
  createSESTransporter() {
    return nodemailer.createTransport({
      host: `email.${process.env.AWS_SES_REGION || "us-east-1"}.amazonaws.com`,
      port: 587,
      secure: false,
      auth: {
        user: process.env.AWS_ACCESS_KEY_ID,
        pass: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  /**
   * Create generic SMTP transporter
   * Requires: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
   */
  createSMTPTransporter() {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Create test transporter (logs to console)
   * Used in development when SMTP is not configured
   */
  createTestTransporter() {
    return {
      sendMail: async (mailOptions) => {
        console.log("\n===== EMAIL PREVIEW =====");
        console.log("To:", mailOptions.to);
        console.log("Subject:", mailOptions.subject);
        console.log("Text:", mailOptions.text?.substring(0, 200));
        console.log("========================\n");
        return { messageId: "test-" + Date.now() };
      },
      verify: async () => true,
    };
  }

  // ========================================
  // CORE EMAIL SENDING
  // ========================================

  /**
   * Send email
   * @param {Object} options - { to, subject, text, html, attachments }
   * @returns {Promise<Object>}
   */
  async sendEmail(options) {
    try {
      if (!this.isReady && process.env.NODE_ENV === "production") {
        throw new Error("Email service not ready");
      }

      const mailOptions = {
        from: options.from || this.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log(` Email sent: ${info.messageId} to ${options.to}`);
      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      console.error("Email send failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send email using template
   * @param {Object} options - { to, subject, template, context }
   * @returns {Promise<Object>}
   */
  async sendTemplateEmail(options) {
    try {
      console.log(`Preparing to send template email: ${options.template} to ${options.to}`);
      const { to, subject, template, context } = options;

      // Load and compile template
      const html = await this.renderTemplate(template, context);
      const text = this.htmlToText(html);

      return await this.sendEmail({
        to,
        subject,
        html,
        text,
      });
    } catch (error) {
      console.error("Template email send failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ========================================
  // EMAIL TEMPLATES
  // ========================================

  /**
   * Load and render email template
   * @param {string} templateName - Template file name (without .hbs)
   * @param {Object} context - Template variables
   * @returns {Promise<string>} - Rendered HTML
   */
  async renderTemplate(templateName, context = {}) {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
      const templateSource = await fs.readFile(templatePath, "utf-8");
      const template = handlebars.compile(templateSource);

      // Add common context variables
      const fullContext = {
        ...context,
        appName: "IT Youth Talent Incubator",
        appUrl: process.env.APP_URL || "http://localhost:3000",
        currentYear: new Date().getFullYear(),
        supportEmail: process.env.SUPPORT_EMAIL || "support@incubator.com",
      };

      return template(fullContext);
    } catch (error) {
      console.error(`Template render failed for ${templateName}:`, error);
      // Return basic fallback HTML
      return this.getFallbackTemplate(context);
    }
  }

  /**
   * Fallback template when template file is missing
   * @param {Object} context
   * @returns {string}
   * @private
   */
  getFallbackTemplate(context) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>IT Youth Talent Incubator</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>IT Youth Talent Incubator</h2>
          <div style="margin: 20px 0;">
            ${context.message || ""}
          </div>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            © ${new Date().getFullYear()} IT Youth Talent Incubator. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Convert HTML to plain text
   * @param {string} html
   * @returns {string}
   * @private
   */
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // ========================================
  // PRE-BUILT EMAIL METHODS
  // ========================================

  /**
   * Send welcome email
   * @param {Object} data - { to, name, role, verificationUrl }
   * @returns {Promise<Object>}
   */
  async sendWelcomeEmail(data) {
    return await this.sendTemplateEmail({
      to: data.to || data.email,
      subject: "Welcome to IT Youth Talent Incubator! 🎉",
      template: EMAIL_TEMPLATES.WELCOME,
      context: {
        name: data.name,
        email: data.to || data.email,
        role: data.role,
        verificationUrl: data.verificationUrl,
      },
    });
  }

  /**
   * Send email verification
   * @param {Object} data - { to, name, verificationUrl }
   * @returns {Promise<Object>}
   */
  async sendVerificationEmail(data) {
    return await this.sendTemplateEmail({
      to: data.to || data.email,
      subject: "Verify Your Email Address",
      template: EMAIL_TEMPLATES.EMAIL_VERIFICATION,
      context: {
        name: data.name,
        verificationUrl: data.verificationUrl,
      },
    });
  }

  /**
   * Send password reset email
   * @param {Object} data - { to, name, resetUrl }
   * @returns {Promise<Object>}
   */
  async sendPasswordResetEmail(data) {
    return await this.sendTemplateEmail({
      to: data.to || data.email,
      subject: "Reset Your Password",
      template: EMAIL_TEMPLATES.PASSWORD_RESET,
      context: {
        name: data.name,
        resetUrl: data.resetUrl,
      },
    });
  }

  /**
   * Send password changed confirmation
   * @param {Object} data - { to, name }
   * @returns {Promise<Object>}
   */
  async sendPasswordChangedEmail(data) {
    return await this.sendTemplateEmail({
      to: data.to || data.email,
      subject: "Your Password Has Been Changed",
      template: EMAIL_TEMPLATES.PASSWORD_CHANGED,
      context: {
        name: data.name,
        changeDate: new Date().toLocaleString(),
      },
    });
  }

  /**
   * Send account locked notification
   * @param {Object} data - { to, name, duration }
   * @returns {Promise<Object>}
   */
  async sendAccountLockedEmail(data) {
    return await this.sendTemplateEmail({
      to: data.to || data.email,
      subject: "Your Account Has Been Temporarily Locked",
      template: EMAIL_TEMPLATES.ACCOUNT_LOCKED,
      context: {
        name: data.name,
        duration: data.duration || "15",
      },
    });
  }

  /**
   * Send account approved notification
   * @param {Object} data - { to, name, role }
   * @returns {Promise<Object>}
   */
  async sendAccountApprovedEmail(data) {
    return await this.sendTemplateEmail({
      to: data.to || data.email,
      subject: "Your Account Has Been Approved! 🎉",
      template: EMAIL_TEMPLATES.ACCOUNT_APPROVED,
      context: {
        name: data.name,
        role: data.role,
        loginUrl: `${process.env.APP_URL}/login`,
      },
    });
  }

  /**
   * Send account rejected notification
   * @param {Object} data - { to, name, reason }
   * @returns {Promise<Object>}
   */
  async sendAccountRejectedEmail(data) {
    return await this.sendTemplateEmail({
      to: data.to || data.email,
      subject: "Application Status Update",
      template: EMAIL_TEMPLATES.ACCOUNT_REJECTED,
      context: {
        name: data.name,
        reason: data.reason || "Your application did not meet our requirements",
      },
    });
  }

  /**
   * Send application received confirmation (to student)
   * @param {Object} data - { to, studentName, jobTitle, companyName }
   * @returns {Promise<Object>}
   */
  async sendApplicationReceivedEmail(data) {
    return await this.sendTemplateEmail({
      to: data.to || data.email,
      subject: `Application Received - ${data.jobTitle}`,
      template: EMAIL_TEMPLATES.APPLICATION_RECEIVED,
      context: {
        studentName: data.studentName || data.name,
        jobTitle: data.jobTitle,
        companyName: data.companyName,
      },
    });
  }

  /**
   * Send new application notification (to company)
   * @param {Object} data - { to, companyName, studentName, jobTitle }
   * @returns {Promise<Object>}
   */
  async sendNewApplicationNotification(data) {
    return await this.sendTemplateEmail({
      to: data.to || data.email,
      subject: `New Application - ${data.jobTitle}`,
      template: EMAIL_TEMPLATES.NEW_APPLICATION,
      context: {
        companyName: data.companyName,
        studentName: data.studentName,
        jobTitle: data.jobTitle,
        applicationDate: new Date().toLocaleDateString(),
        applicationUrl: data.applicationUrl || `${process.env.APP_URL}/company/applications`,
      },
    });
  }

  /**
   * Send application status update (to student)
   * @param {Object} data - { to, studentName, jobTitle, status }
   * @returns {Promise<Object>}
   */
  async sendApplicationStatusUpdate(data) {
    const statusMessages = {
      reviewing: "is now under review",
      shortlisted: "has been shortlisted",
      interviewed: "interview scheduled",
      accepted: "has been accepted! 🎉",
      rejected: "was not successful this time",
    };

    return await this.sendTemplateEmail({
      to: data.to || data.email,
      subject: `Application Update - ${data.jobTitle}`,
      template: EMAIL_TEMPLATES.APPLICATION_STATUS_UPDATE,
      context: {
        studentName: data.studentName || data.name,
        jobTitle: data.jobTitle,
        status: data.status,
        statusMessage: statusMessages[data.status] || "has been updated",
        notes: data.notes,
      },
    });
  }

  /**
   * Send job posted notification (to admin)
   * @param {Object} data - { to, companyName, jobTitle }
   * @returns {Promise<Object>}
   */
  async sendJobPostedNotification(data) {
    return await this.sendTemplateEmail({
      to: data.to || data.email,
      subject: `New Job Posted - ${data.jobTitle}`,
      template: EMAIL_TEMPLATES.JOB_POSTED,
      context: {
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        postDate: new Date().toLocaleDateString(),
        jobUrl: data.jobUrl || `${process.env.APP_URL}/admin/jobs`,
      },
    });
  }

  // ========================================
  // BULK EMAIL SENDING
  // ========================================

  /**
   * Send email to multiple recipients
   * @param {Array} recipients - Array of email addresses
   * @param {Object} options - { subject, template, context }
   * @returns {Promise<Object>}
   */
  async sendBulkEmail(recipients, options) {
    try {
      const results = {
        sent: [],
        failed: [],
      };

      for (const recipient of recipients) {
        const result = await this.sendTemplateEmail({
          to: recipient,
          ...options,
        });

        if (result.success) {
          results.sent.push(recipient);
        } else {
          results.failed.push({ email: recipient, error: result.error });
        }

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      console.log(`Bulk email sent: ${results.sent.length} success, ${results.failed.length} failed`);
      
      return {
        success: true,
        sent: results.sent.length,
        failed: results.failed.length,
        details: results,
      };
    } catch (error) {
      console.error("Bulk email failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Verify email service configuration
   * @returns {Promise<boolean>}
   */
  async verify() {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error("Email verification failed:", error);
      return false;
    }
  }

  /**
   * Get email service health status
   * @returns {Promise<Object>}
   */
  async healthCheck() {
    try {
      const isVerified = await this.verify();
      return {
        status: isVerified ? "healthy" : "unhealthy",
        provider: process.env.EMAIL_PROVIDER || "smtp",
        isReady: this.isReady,
        from: this.from,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
      };
    }
  }

  /**
   * Create test email for development
   * @param {string} to - Test recipient
   * @returns {Promise<Object>}
   */
  async sendTestEmail(to) {
    return await this.sendEmail({
      to,
      subject: "Test Email from IT Youth Talent Incubator",
      html: this.getFallbackTemplate({
        message: `
          <h3>Test Email</h3>
          <p>This is a test email from the IT Youth Talent Incubator platform.</p>
          <p>If you received this, the email service is working correctly! </p>
          <p>Time: ${new Date().toLocaleString()}</p>
        `,
      }),
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;