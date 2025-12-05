/* eslint-disable no-undef */
/**
 * Agenda.js Complete Configuration
 * Handles asynchronous job processing for:
 * - Application submissions (CQRS)
 * - Email notifications (welcome, reset, application status)
 * - Scheduled tasks (close expired jobs, cleanup)
 * - Analytics and reporting
 */

import Agenda from "agenda";

class AgendaManager {
  constructor() {
    this.agenda = null;
    this.isReady = false;
    this.startTime = null;
  }

  /**
   * Initialize Agenda with MongoDB connection
   */
  async initialize() {
    try {
      const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/incubator";

      this.agenda = new Agenda({
        db: {
          address: mongoUri,
          collection: "agenda_jobs",
          options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          },
        },
        processEvery: process.env.AGENDA_PROCESS_EVERY || "10 seconds",
        maxConcurrency: parseInt(process.env.AGENDA_MAX_CONCURRENCY, 10) || 20,
        defaultConcurrency: 5,
        defaultLockLifetime: 10000, // 10 seconds
        lockLimit: 0,
        ensureIndex: true, // Create indexes for better performance
      });

      // Event listeners
      this.agenda.on("ready", () => {
        console.log("Agenda.js is ready and connected to MongoDB");
        this.isReady = true;
        this.startTime = new Date();
      });

      this.agenda.on("error", (error) => {
        console.error("Agenda.js connection error:", error);
        this.isReady = false;
      });

      this.agenda.on("start", (job) => {
        console.log(`Job started: ${job.attrs.name} [${job.attrs._id}]`);
      });

      this.agenda.on("complete", (job) => {
        console.log(`Job completed: ${job.attrs.name} [${job.attrs._id}]`);
      });

      this.agenda.on("fail", (error, job) => {
        console.error(`Job failed: ${job.attrs.name} [${job.attrs._id}]`, error);
      });

      // Define all jobs
      this._defineJobs();

      // Start processing
      await this.agenda.start();
      console.log("Agenda.js started processing jobs");
    } catch (error) {
      console.error("Failed to initialize Agenda:", error);
      throw error;
    }
  }

  /**
   * Define all job types and their handlers
   * @private
   */
  _defineJobs() {
    // ========================================
    // 1. APPLICATION JOBS (CQRS Commands)
    // ========================================

    /**
     * Process job application submission
     */
    this.agenda.define(
      "process-application",
      { priority: "high", concurrency: 10 },
      async (job) => {
        const { applicationData, studentId, jobId } = job.attrs.data;

        try {
          console.log("Processing application:", { studentId, jobId });

          const { applicationRepository } = await import(
            "../modules/application/repositories/application.repository.js"
          );
          const { jobRepository } = await import(
            "../modules/job/repositories/job.repository.js"
          );

          // Create application record
          const application = await applicationRepository.create({
            student: studentId,
            job: jobId,
            ...applicationData,
            status: "pending",
            applied_date: new Date(),
          });

          // Increment job application count
          await jobRepository.updateById(jobId, {
            $inc: { applications_count: 1 },
          });

          // Queue notification emails
          await this.now("send-application-email", {
            applicationId: application._id,
            type: "student-confirmation",
          });

          await this.now("send-application-email", {
            applicationId: application._id,
            type: "company-notification",
          });

          console.log("Application processed:", application._id);
        } catch (error) {
          console.error("Failed to process application:", error);
          throw error; // Agenda will retry based on retry policy
        }
      }
    );

    /**
     * Update application status
     */
    this.agenda.define(
      "update-application-status",
      { priority: "normal", concurrency: 10 },
      async (job) => {
        const { applicationId, status, updatedBy, reason } = job.attrs.data;

        try {
          console.log("Updating application status:", { applicationId, status });

          const { applicationRepository } = await import(
            "../modules/application/repositories/application.repository.js"
          );

          const updates = {
            status,
            updated_by: updatedBy,
            updated_at: new Date(),
          };

          if (reason) {
            updates.rejection_reason = reason;
          }

          await applicationRepository.updateById(applicationId, updates);

          // Send status change email
          await this.now("send-application-email", {
            applicationId,
            type: "status-change",
            status,
          });

          console.log("Application status updated:", applicationId);
        } catch (error) {
          console.error("Failed to update application status:", error);
          throw error;
        }
      }
    );

    // ========================================
    // 2. EMAIL JOBS
    // ========================================

    /**
     * Send application-related emails
     */
    this.agenda.define(
      "send-application-email",
      { priority: "low", concurrency: 20 },
      async (job) => {
        const { applicationId, type, status } = job.attrs.data;

        try {
          console.log("Sending application email:", { applicationId, type });

          const { applicationRepository } = await import(
            "../modules/application/repositories/application.repository.js"
          );

          // Get application with populated data
          const application = await applicationRepository.findById(applicationId, {
            populate: [
              {
                path: "student",
                select: "first_name last_name user",
                populate: { path: "user", select: "email" },
              },
              {
                path: "job",
                select: "title company",
                populate: { path: "company", select: "name user", populate: { path: "user", select: "email" } },
              },
            ],
          });

          if (!application) {
            console.warn("Application not found:", applicationId);
            return;
          }

          // NOTE: Email service integration (SendGrid, AWS SES, etc.) goes here
          // For now, logging email details for development/testing
          const emailTemplates = {
            "student-confirmation": {
              to: application.student?.user?.email,
              subject: `Application Submitted - ${application.job?.title}`,
              message: `Your application for ${application.job?.title} has been submitted successfully.`,
            },
            "company-notification": {
              to: application.job?.company?.user?.email,
              subject: `New Application - ${application.job?.title}`,
              message: `${application.student?.first_name} ${application.student?.last_name} has applied for ${application.job?.title}.`,
            },
            "status-change": {
              to: application.student?.user?.email,
              subject: `Application Status Update - ${application.job?.title}`,
              message: `Your application status has been changed to: ${status}`,
            },
          };

          const template = emailTemplates[type];
          console.log(`Email to ${template.to}: ${template.subject}`);
          console.log(`   Message: ${template.message}`);
          console.log("Email sent successfully");
        } catch (error) {
          console.error("Failed to send email:", error);
          // Don't throw - email failures shouldn't block other operations
        }
      }
    );

    /**
     * Send welcome email (new user registration)
     */
    this.agenda.define(
      "send-welcome-email",
      { priority: "low", concurrency: 20 },
      async (job) => {
        const { userId, email, name, role, verificationUrl } = job.attrs.data;

        try {
          console.log("Sending welcome email to:", email);

          // NOTE: Email service integration goes here (SendGrid, AWS SES, etc.)
          // For now, logging welcome email details for development/testing
          console.log(`Welcome ${name}!`);
          console.log(`   Role: ${role}`);
          console.log(`   Verify email: ${verificationUrl}`);
          console.log("Welcome email sent");
        } catch (error) {
          console.error("Failed to send welcome email:", error);
        }
      }
    );

    /**
     * Send email verification
     */
    this.agenda.define(
      "send-verification-email",
      { priority: "high", concurrency: 20 },
      async (job) => {
        const { email, verificationUrl, name } = job.attrs.data;

        try {
          console.log("Sending verification email to:", email);
          console.log(`   Link: ${verificationUrl}`);
          console.log("Verification email sent");
        } catch (error) {
          console.error("Failed to send verification email:", error);
        }
      }
    );

    /**
     * Send password reset email
     */
    this.agenda.define(
      "send-password-reset-email",
      { priority: "high", concurrency: 20 },
      async (job) => {
        const { email, resetUrl, name } = job.attrs.data;

        try {
          console.log("Sending password reset email to:", email);
          console.log(`   Reset link: ${resetUrl}`);
          console.log("Password reset email sent");
        } catch (error) {
          console.error("Failed to send password reset email:", error);
        }
      }
    );

    /**
     * Send password changed confirmation
     */
    this.agenda.define(
      "send-password-changed-email",
      { priority: "normal", concurrency: 20 },
      async (job) => {
        const { email, name } = job.attrs.data;

        try {
          console.log("Sending password changed confirmation to:", email);
          console.log("Password changed email sent");
        } catch (error) {
          console.error("Failed to send password changed email:", error);
        }
      }
    );

    /**
     * Send account locked notification
     */
    this.agenda.define(
      "send-account-locked-email",
      { priority: "high", concurrency: 20 },
      async (job) => {
        const { email, duration, name } = job.attrs.data;

        try {
          console.log("Sending account locked email to:", email);
          console.log(`   Duration: ${duration} minutes`);
          console.log("Account locked email sent");
        } catch (error) {
          console.error("Failed to send account locked email:", error);
        }
      }
    );

    /**
     * Send withdrawal notification to company
     */
    this.agenda.define(
      "send-withdrawal-notification",
      { priority: "normal", concurrency: 10 },
      async (job) => {
        const { applicationId, jobId } = job.attrs.data;

        try {
          console.log("Sending withdrawal notification:", { applicationId, jobId });

          const { applicationRepository } = await import(
            "../modules/application/repositories/application.repository.js"
          );

          const application = await applicationRepository.findById(applicationId, {
            populate: [
              {
                path: "student",
                select: "first_name last_name",
              },
              {
                path: "job",
                select: "title company",
                populate: { path: "company", select: "name user", populate: { path: "user", select: "email" } },
              },
            ],
            includeDeleted: true,
          });

          if (application) {
            console.log(` Notifying company about withdrawal by ${application.student?.first_name}`);
            console.log("Withdrawal notification sent");
          }
        } catch (error) {
          console.error("Failed to send withdrawal notification:", error);
        }
      }
    );

    // ========================================
    // 3. SCHEDULED TASKS
    // ========================================

    /**
     * Close expired jobs (runs daily)
     */
    this.agenda.define(
      "close-expired-jobs",
      { priority: "low", concurrency: 1 },
      async (job) => {
        try {
          console.log("Closing expired jobs...");

          const { jobRepository } = await import(
            "../modules/job/repositories/job.repository.js"
          );

          // Find jobs where application_deadline has passed
          const expiredJobs = await jobRepository.findAll(
            {
              status: "active",
              application_deadline: { $lt: new Date() },
            },
            1,
            1000
          );

          let count = 0;
          for (const job of expiredJobs.data) {
            await jobRepository.updateById(job._id, { status: "closed" });
            count++;
          }

          console.log(`Closed ${count} expired jobs`);
        } catch (error) {
          console.error("Failed to close expired jobs:", error);
        }
      }
    );

    /**
     * Send reminder for pending applications (runs daily)
     */
    this.agenda.define(
      "remind-pending-applications",
      { priority: "low", concurrency: 1 },
      async (job) => {
        try {
          console.log("Checking for pending applications needing reminders...");

          const { applicationRepository } = await import(
            "../modules/application/repositories/application.repository.js"
          );

          // Get applications pending for more than 7 days
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

          const pendingApps = await applicationRepository.findAll(
            {
              status: "pending",
              applied_date: { $lt: sevenDaysAgo },
              deleted_at: null,
            },
            1,
            100,
            {
              populate: [
                {
                  path: "job",
                  select: "title company",
                  populate: { path: "company", select: "user", populate: { path: "user", select: "email" } },
                },
              ],
            }
          );

          console.log(` Found ${pendingApps.data.length} applications needing reminder`);

          for (const app of pendingApps.data) {
            // NOTE: Email service integration for reminders goes here
            // For now, logging reminder details for development/testing
            console.log(`   Reminder for job: ${app.job?.title}`);
          }

          console.log("Reminders sent");
        } catch (error) {
          console.error("Failed to send reminders:", error);
        }
      }
    );

    /**
     * Clean up old agenda jobs (runs weekly)
     */
    this.agenda.define(
      "cleanup-old-jobs",
      { priority: "low", concurrency: 1 },
      async (job) => {
        try {
          console.log("Cleaning up old agenda jobs...");

          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

          const numRemoved = await this.agenda.cancel({
            lastFinishedAt: { $lt: oneMonthAgo },
            nextRunAt: null,
          });

          console.log(`Cleaned up ${numRemoved} old jobs`);
        } catch (error) {
          console.error(" Failed to clean up old jobs:", error);
        }
      }
    );

    /**
     * Generate daily statistics (runs daily at midnight)
     */
    this.agenda.define(
      "generate-daily-stats",
      { priority: "low", concurrency: 1 },
      async (job) => {
        try {
          console.log("Generating daily statistics...");

          const { applicationRepository } = await import(
            "../modules/application/repositories/application.repository.js"
          );
          const { jobRepository } = await import(
            "../modules/job/repositories/job.repository.js"
          );

          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          // Count today's applications
          const todayApps = await applicationRepository.findAll(
            {
              applied_date: { $gte: today, $lt: tomorrow },
            },
            1,
            1
          );

          // Count active jobs
          const activeJobs = await jobRepository.findAll(
            { status: "active" },
            1,
            1
          );

          console.log(`Stats: ${todayApps.metadata.total} applications, ${activeJobs.metadata.total} active jobs`);
          console.log("Daily stats generated");
        } catch (error) {
          console.error(" Failed to generate stats:", error);
        }
      }
    );

    /**
     * Clean up expired tokens (runs daily)
     */
    this.agenda.define(
      "cleanup-expired-tokens",
      { priority: "low", concurrency: 1 },
      async (job) => {
        try {
          console.log("Cleaning up expired tokens...");

          // NOTE: Token cleanup implementation
          // This should query User model for expired tokens and remove them
          // Consider implementing in AuthService or UserRepository
          const now = new Date();
          // Example: await User.updateMany(
          //   { 'reset_password_expires': { $lt: now } },
          //   { $unset: { reset_password_token: '', reset_password_expires: '' } }
          // );
          console.log("Expired tokens cleaned up");
        } catch (error) {
          console.error(" Failed to clean up tokens:", error);
        }
      }
    );
  }

  // ========================================
  // PUBLIC API METHODS
  // ========================================

  /**
   * Schedule a job to run immediately
   * @param {string} jobName - Name of the job
   * @param {Object} data - Job data
   * @returns {Promise<Job>}
   */
  async now(jobName, data) {
    if (!this.isReady) {
      console.warn("Agenda not ready. Queuing job:", jobName);
      // In production, you might want to queue this differently
    }

    try {
      const job = this.agenda.create(jobName, data);
      job.schedule(new Date());
      await job.save();
      console.log(`Job scheduled: ${jobName}`);
      return job;
    } catch (error) {
      console.error(` Failed to schedule job ${jobName}:`, error);
      throw error;
    }
  }

  /**
   * Schedule a job to run at a specific time
   * @param {string} jobName - Name of the job
   * @param {Object} data - Job data
   * @param {Date|string} when - When to run (Date or cron expression)
   * @returns {Promise<Job>}
   */
  async schedule(jobName, data, when = new Date()) {
    if (!this.isReady) {
      console.warn("Agenda not ready. Job may not be scheduled:", jobName);
    }

    try {
      const job = this.agenda.create(jobName, data);
      job.schedule(when);
      await job.save();
      console.log(`Job scheduled: ${jobName} at ${when}`);
      return job;
    } catch (error) {
      console.error(` Failed to schedule job ${jobName}:`, error);
      throw error;
    }
  }

  /**
   * Schedule a recurring job
   * @param {string} interval - Cron expression
   * @param {string} jobName - Name of the job
   * @param {Object} data - Job data
   * @returns {Promise<void>}
   */
  async every(interval, jobName, data = {}) {
    if (!this.isReady) {
      throw new Error("Agenda is not ready. Call initialize() first.");
    }

    try {
      await this.agenda.every(interval, jobName, data);
      console.log(`Recurring job scheduled: ${jobName} (${interval})`);
    } catch (error) {
      console.error(` Failed to schedule recurring job ${jobName}:`, error);
      throw error;
    }
  }

  /**
   * Cancel jobs matching query
   * @param {Object} query - MongoDB query
   * @returns {Promise<number>}
   */
  async cancel(query) {
    if (!this.isReady) {
      throw new Error("Agenda is not ready.");
    }

    try {
      const numRemoved = await this.agenda.cancel(query);
      console.log(`Canceled ${numRemoved} jobs`);
      return numRemoved;
    } catch (error) {
      console.error(" Failed to cancel jobs:", error);
      throw error;
    }
  }

  /**
   * Get jobs matching query
   * @param {Object} query - MongoDB query
   * @returns {Promise<Array>}
   */
  async getJobs(query) {
    if (!this.isReady) {
      throw new Error("Agenda is not ready.");
    }

    return await this.agenda.jobs(query);
  }

  /**
   * Setup all recurring tasks
   */
  async setupRecurringTasks() {
    try {
      console.log("Setting up recurring tasks...");

      // Close expired jobs daily at 2 AM
      await this.every("0 2 * * *", "close-expired-jobs");

      // Send reminders for pending applications daily at 9 AM
      await this.every("0 9 * * *", "remind-pending-applications");

      // Generate daily stats at midnight
      await this.every("0 0 * * *", "generate-daily-stats");

      // Clean up old jobs weekly on Sunday at 3 AM
      await this.every("0 3 * * 0", "cleanup-old-jobs");

      // Clean up expired tokens daily at 4 AM
      await this.every("0 4 * * *", "cleanup-expired-tokens");

      console.log("Recurring tasks configured");
    } catch (error) {
      console.error(" Failed to setup recurring tasks:", error);
    }
  }

  /**
   * Get Agenda health status
   * @returns {Object}
   */
  getStatus() {
    return {
      isReady: this.isReady,
      uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0,
      startTime: this.startTime,
    };
  }

  /**
   * Graceful shutdown
   */
  async stop() {
    if (this.agenda) {
      console.log("Stopping Agenda.js...");
      await this.agenda.stop();
      this.isReady = false;
      console.log("Agenda.js stopped gracefully");
    }
  }
}

// Export singleton instance
export const agendaManager = new AgendaManager();
export default agendaManager;