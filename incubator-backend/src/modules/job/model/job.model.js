/**
 * Job Model
 * Enhanced with additional fields, validation, and indexes
 */
import { BaseModel } from "../../shared/base.model.js";
import mongoose from "mongoose";

class Job extends BaseModel {
  constructor() {
    const schemaDefinition = {
      // Company reference
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
        index: true, // Index for faster company queries
      },

      // Basic job information
      title: {
        type: String,
        required: [true, "Job title is required"],
        trim: true,
        maxlength: [200, "Job title cannot exceed 200 characters"],
        index: true, // Index for search
      },

      description: {
        type: String,
        required: [true, "Job description is required"],
        minlength: [50, "Job description must be at least 50 characters"],
        maxlength: [5000, "Job description cannot exceed 5000 characters"],
      },

      // Location details
      location: {
        type: String,
        required: false,
        default: "Remote",
        index: true, // Index for location-based queries
      },

      // Salary information
      salary_range: {
        min: {
          type: Number,
          required: false,
        },
        max: {
          type: Number,
          required: false,
        },
        currency: {
          type: String,
          default: "GHS", // Ghana Cedis
          enum: ["GHS", "USD", "EUR", "GBP"],
        },
        display: {
          type: String, // e.g., "GHS 5,000 - 10,000"
          required: false,
        },
      },

      // Job type
      job_type: {
        type: String,
        enum: {
          values: [
            "full-time",
            "part-time",
            "internship",
            "contract",
            "remote",
            "hybrid",
          ],
          message: "{VALUE} is not a valid job type",
        },
        required: [true, "Job type is required"],
        index: true, // Index for filtering
      },

      // Experience level
      experience_level: {
        type: String,
        enum: ["entry", "junior", "mid", "senior", "lead", "executive"],
        default: "entry",
        index: true,
      },

      // Required skills
      skills: {
        type: [String],
        default: [],
        validate: {
          validator: function (skills) {
            return skills.length <= 20;
          },
          message: "Cannot have more than 20 skills",
        },
      },

      // Requirements (bullet points)
      requirements: {
        type: [String],
        default: [],
        validate: {
          validator: function (requirements) {
            return requirements.length <= 15;
          },
          message: "Cannot have more than 15 requirements",
        },
      },

      // Benefits
      benefits: {
        type: [String],
        default: [],
      },

      // Job status
      status: {
        type: String,
        enum: {
          values: ["open", "closed", "paused", "draft", "deleted"],
          message: "{VALUE} is not a valid status",
        },
        default: "draft",
        index: true, // Index for status filtering
      },

      // Application tracking
      application_count: {
        type: Number,
        default: 0,
        min: 0,
      },

      view_count: {
        type: Number,
        default: 0,
        min: 0,
      },

      // Dates
      posted_at: {
        type: Date,
        default: null, // Set when status changes to 'open'
      },

      closing_date: {
        type: Date,
        required: false,
        validate: {
          validator: function (value) {
            if (!value) return true;
            return value > new Date();
          },
          message: "Closing date must be in the future",
        },
      },

      // Application URL (optional external link)
      application_url: {
        type: String,
        required: false,
        validate: {
          validator: function (value) {
            if (!value) return true;
            return /^https?:\/\/.+/.test(value);
          },
          message: "Application URL must be a valid URL",
        },
      },

      // Featured job (for premium listings)
      is_featured: {
        type: Boolean,
        default: false,
        index: true,
      },

      featured_until: {
        type: Date,
        required: false,
      },

      // SEO fields
      slug: {
        type: String,
        unique: true,
        sparse: true, // Allow null values
      },

      // Metadata
      deleted_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
    };

    const options = {
      timestamps: true, // created_at, updated_at
    };

    super(schemaDefinition, options);

    // ========================================
    // INDEXES
    // ========================================
    
    // Compound index for filtering
    this.schema.index({ status: 1, posted_at: -1 });
    this.schema.index({ company: 1, status: 1 });
    
    // Text index for search
    this.schema.index({
      title: "text",
      description: "text",
      location: "text",
    });

    // Featured jobs index
    this.schema.index({ is_featured: 1, featured_until: 1 });

    // ========================================
    // PRE-SAVE HOOKS
    // ========================================

    // Auto-generate slug
    this.schema.pre("save", function (next) {
      if (this.isModified("title") && !this.slug) {
        this.slug = this.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();
        
        // Add random suffix to ensure uniqueness
        this.slug += `-${Date.now().toString(36)}`;
      }
      next();
    });

    // Set posted_at when status changes to 'open'
    this.schema.pre("save", function (next) {
      if (this.isModified("status") && this.status === "open" && !this.posted_at) {
        this.posted_at = new Date();
      }
      next();
    });

    // ========================================
    // VIRTUAL PROPERTIES
    // ========================================

    // Check if job is expired
    this.schema.virtual("isExpired").get(function () {
      if (!this.closing_date) return false;
      return new Date() > this.closing_date;
    });

    // Check if job is accepting applications
    this.schema.virtual("isAcceptingApplications").get(function () {
      return (
        this.status === "open" &&
        !this.isExpired &&
        !this.deleted_at
      );
    });

    // Check if job is featured and active
    this.schema.virtual("isFeaturedActive").get(function () {
      if (!this.is_featured) return false;
      if (!this.featured_until) return true;
      return new Date() < this.featured_until;
    });

    // Days since posted
    this.schema.virtual("daysPosted").get(function () {
      if (!this.posted_at) return 0;
      const diff = Date.now() - this.posted_at.getTime();
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    });

    // ========================================
    // INSTANCE METHODS
    // ========================================

    /**
     * Increment view count
     */
    this.schema.methods.incrementViews = async function () {
      this.view_count += 1;
      return await this.save();
    };

    /**
     * Increment application count
     */
    this.schema.methods.incrementApplications = async function () {
      this.application_count += 1;
      return await this.save();
    };

    /**
     * Close job
     */
    this.schema.methods.close = async function () {
      this.status = "closed";
      return await this.save();
    };

    /**
     * Pause job
     */
    this.schema.methods.pause = async function () {
      this.status = "paused";
      return await this.save();
    };

    /**
     * Publish job (from draft)
     */
    this.schema.methods.publish = async function () {
      this.status = "open";
      if (!this.posted_at) {
        this.posted_at = new Date();
      }
      return await this.save();
    };

    /**
     * Check if user can edit this job
     */
    this.schema.methods.canEdit = function () {
      return ["draft", "open", "paused"].includes(this.status);
    };

    // ========================================
    // STATIC METHODS
    // ========================================

    /**
     * Find active jobs (open and not expired)
     */
    this.schema.statics.findActive = function (filters = {}) {
      return this.find({
        status: "open",
        deleted_at: null,
        $or: [
          { closing_date: { $exists: false } },
          { closing_date: null },
          { closing_date: { $gt: new Date() } },
        ],
        ...filters,
      });
    };

    /**
     * Find featured jobs
     */
    this.schema.statics.findFeatured = function (limit = 10) {
      return this.find({
        is_featured: true,
        status: "open",
        deleted_at: null,
        $or: [
          { featured_until: { $exists: false } },
          { featured_until: null },
          { featured_until: { $gt: new Date() } },
        ],
      })
        .sort({ posted_at: -1 })
        .limit(limit);
    };

    /**
     * Search jobs by text
     */
    this.schema.statics.searchJobs = function (searchTerm, filters = {}) {
      return this.find({
        $text: { $search: searchTerm },
        status: "open",
        deleted_at: null,
        ...filters,
      }).sort({ score: { $meta: "textScore" } });
    };
  }
}

export default new Job().getModel("Job");