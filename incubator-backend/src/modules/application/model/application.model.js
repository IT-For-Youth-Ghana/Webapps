/**
 * Application Model
 * Tracks job applications from students
 */
import { BaseModel } from "../../shared/base.model";
import mongoose from "mongoose";

class Application extends BaseModel {
  constructor() {
    const schemaDefinition = {
      // References
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        index: true,
      },

      job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true,
        index: true,
      },

      // Application content
      cover_letter: {
        type: String,
        required: false,
        maxlength: [2000, "Cover letter cannot exceed 2000 characters"],
      },

      resume_url: {
        type: String,
        required: false,
      },

      // Status tracking
      status: {
        type: String,
        enum: {
          values: ["pending", "reviewing", "shortlisted", "interviewed", "accepted", "rejected"],
          message: "{VALUE} is not a valid status",
        },
        default: "pending",
        index: true,
      },

      // Dates
      applied_date: {
        type: Date,
        default: Date.now,
        index: true,
      },

      reviewed_at: {
        type: Date,
        required: false,
      },

      // Review notes (company use)
      company_notes: {
        type: String,
        maxlength: [1000, "Notes cannot exceed 1000 characters"],
      },

      // Rating (company use)
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: false,
      },

      // Updated by (for audit trail)
      updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },

      // Rejection reason (optional)
      rejection_reason: {
        type: String,
        maxlength: [500, "Rejection reason cannot exceed 500 characters"],
      },
    };

    const options = {
      timestamps: true,
    };

    super(schemaDefinition, options);

    // ========================================
    // INDEXES
    // ========================================

    // Compound indexes for common queries
    this.schema.index({ student: 1, job: 1 }, { unique: true }); // One application per job per student
    this.schema.index({ job: 1, status: 1 });
    this.schema.index({ student: 1, status: 1 });
    this.schema.index({ status: 1, applied_date: -1 });

    // ========================================
    // PRE-SAVE HOOKS
    // ========================================

    // Set reviewed_at when status changes from pending
    this.schema.pre("save", function (next) {
      if (this.isModified("status") && this.status !== "pending" && !this.reviewed_at) {
        this.reviewed_at = new Date();
      }
      next();
    });

    // ========================================
    // VIRTUAL PROPERTIES
    // ========================================

    // Days since application
    this.schema.virtual("daysSinceApplied").get(function () {
      const diff = Date.now() - this.applied_date.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    });

    // Response time (if reviewed)
    this.schema.virtual("responseTime").get(function () {
      if (!this.reviewed_at) return null;
      const diff = this.reviewed_at.getTime() - this.applied_date.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24)); // in days
    });

    // Is pending review
    this.schema.virtual("isPending").get(function () {
      return this.status === "pending";
    });

    // ========================================
    // INSTANCE METHODS
    // ========================================

    /**
     * Update status
     */
    this.schema.methods.updateStatus = async function (status, userId) {
      this.status = status;
      this.updated_by = userId;
      
      if (status !== "pending" && !this.reviewed_at) {
        this.reviewed_at = new Date();
      }
      
      return await this.save();
    };

    /**
     * Add company notes
     */
    this.schema.methods.addNotes = async function (notes, userId) {
      this.company_notes = notes;
      this.updated_by = userId;
      return await this.save();
    };

    /**
     * Rate application
     */
    this.schema.methods.rate = async function (rating, userId) {
      if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }
      this.rating = rating;
      this.updated_by = userId;
      return await this.save();
    };

    /**
     * Reject with reason
     */
    this.schema.methods.reject = async function (reason, userId) {
      this.status = "rejected";
      this.rejection_reason = reason;
      this.updated_by = userId;
      
      if (!this.reviewed_at) {
        this.reviewed_at = new Date();
      }
      
      return await this.save();
    };

    // ========================================
    // STATIC METHODS
    // ========================================

    /**
     * Check if student already applied for job
     */
    this.schema.statics.hasApplied = async function (studentId, jobId) {
      const application = await this.findOne({
        student: studentId,
        job: jobId,
        deleted_at: null,
      });
      return !!application;
    };

    /**
     * Get applications by status
     */
    this.schema.statics.findByStatus = function (status, filters = {}) {
      return this.find({
        status,
        deleted_at: null,
        ...filters,
      });
    };

    /**
     * Get pending applications for company
     */
    this.schema.statics.getPendingForCompany = async function (companyId) {
      return await this.find({
        status: "pending",
        deleted_at: null,
      })
        .populate({
          path: "job",
          match: { company: companyId },
          select: "title status",
        })
        .populate("student", "first_name last_name skills cv_url");
    };

    /**
     * Count applications by status for job
     */
    this.schema.statics.countByStatus = async function (jobId) {
      const result = await this.aggregate([
        {
          $match: {
            job: mongoose.Types.ObjectId(jobId),
            deleted_at: null,
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const statusCounts = {
        pending: 0,
        reviewing: 0,
        shortlisted: 0,
        interviewed: 0,
        accepted: 0,
        rejected: 0,
      };

      result.forEach((item) => {
        statusCounts[item._id] = item.count;
      });

      return statusCounts;
    };
  }
}

export default new Application().getModel("Application");