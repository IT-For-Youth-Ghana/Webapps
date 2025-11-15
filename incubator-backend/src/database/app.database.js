/* eslint-disable no-undef */
/**
 * Database Configuration & Connection Manager
 * Centralizes MongoDB connection, model registration, and health checks
 * Supports: connection pooling, retries, graceful shutdown, health endpoint
 */

import mongoose from "mongoose";
import { userModel } from "../modules/user/model/user.model.js";
import { studentModel } from "../modules/user/model/student.model.js";
import { companyModel } from "../modules/user/model/company.model.js";
import { adminModel } from "../modules/user/model/admin.model.js";
import { jobModel } from "../modules/job/model/job.model.js"; // Future
import { applicationModel } from "../modules/application/model/application.model.js"; // Future

class DatabaseManager {
  constructor() {
    this.isConnected = false;
    this.connectionRetries = 0;
    this.maxRetries = parseInt(process.env.DB_MAX_RETRIES, 10) || 5;
    this.retryDelayMs = parseInt(process.env.DB_RETRY_DELAY_MS, 10) || 5000;
    this.models = new Map();
  }

  /**
   * Initialize database connection with retry logic
   */
  async connect() {
    if (this.isConnected) {
      console.log("MongoDB already connected.");
      return;
    }

    const dbUri = process.env.MONGODB_URI || "mongodb://localhost:27017/incubator";

    const mongooseOptions = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      autoIndex: process.env.NODE_ENV !== "production", // Disable in prod
      connectTimeoutMS: 10000,
    };

    try {
      console.log(`Connecting to MongoDB... (${dbUri.replace(/mongodb:\/\/[^@]+@/, "mongodb://***@")})`);

      await mongoose.connect(dbUri, mongooseOptions);

      this.isConnected = true;
      this.connectionRetries = 0;

      this._registerModels();
      this._setupEventListeners();

      console.log("MongoDB connected successfully");
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);

      if (this.connectionRetries < this.maxRetries) {
        this.connectionRetries++;
        console.log(`Retrying connection in ${this.retryDelayMs / 1000}s... (Attempt ${this.connectionRetries}/${this.maxRetries})`);
        setTimeout(() => this.connect(), this.retryDelayMs);
      } else {
        console.error("Max retries reached. Exiting...");
        process.exit(1);
      }
    }
  }

  /**
   * Register all models with BaseModel behavior
   * @private
   */
  _registerModels() {
    const modelRegistry = [
      { name: "User", model: userModel },
      { name: "Student", model: studentModel },
      { name: "Company", model: companyModel },
      { name: "Admin", model: adminModel },
      { name: "Job", model: jobModel },
      { name: "Application", model: applicationModel },
    ];

    modelRegistry.forEach(({ name, model }) => {
      if (model && model.modelName) {
        this.models.set(name, model);
        console.log(`Model registered: ${name}`);
      }
    });

    // Apply BaseModel global query helpers
    this._applyGlobalQueryHelpers();
  }

  /**
   * Apply soft-delete bypass and default filters globally
   * @private
   */
  _applyGlobalQueryHelpers() {
    mongoose.Query.prototype.softDelete = function () {
      return this.findOneAndUpdate(
        {},
        { deleted_at: new Date() },
        { new: true }
      );
    };

    // Auto-exclude soft-deleted unless includeDeleted flag is set
    const originalExec = mongoose.Query.prototype.exec;
    mongoose.Query.prototype.exec = async function (...args) {
      if (!this._includeDeleted && !this.op?.includes("aggregate")) {
        this.where({ deleted_at: null });
      }
      return originalExec.apply(this, args);
    };
  }

  /**
   * Setup Mongoose event listeners
   * @private
   */
  _setupEventListeners() {
    const db = mongoose.connection;

    db.on("connected", () => {
      console.log("Mongoose connected to MongoDB");
      this.isConnected = true;
    });

    db.on("error", (err) => {
      console.error("Mongoose connection error:", err);
      this.isConnected = false;
    });

    db.on("disconnected", () => {
      console.warn("Mongoose disconnected from MongoDB");
      this.isConnected = false;
    });

    db.on("reconnected", () => {
      console.log("Mongoose reconnected");
      this.isConnected = true;
    });

    // Graceful shutdown
    process.on("SIGINT", () => this.gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => this.gracefulShutdown("SIGTERM"));
  }

  /**
   * Graceful shutdown with connection close
   * @param {string} signal
   */
  async gracefulShutdown(signal) {
    console.log(`Received ${signal}. Closing MongoDB connection...`);
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  }

  /**
   * Health check endpoint
   * @returns {Promise<{ status: string, db: string, uptime: number }>}
   */
  async healthCheck() {
    const uptime = process.uptime();

    if (!this.isConnected) {
      return {
        status: "unhealthy",
        db: "disconnected",
        uptime,
        error: "Database not connected",
      };
    }

    try {
      // Ping MongoDB
      await mongoose.connection.db.admin().ping();
      return {
        status: "healthy",
        db: "connected",
        uptime,
        models: Array.from(this.models.keys()),
      };
    } catch (error) {
      return {
        status: "unhealthy",
        db: "error",
        uptime,
        error: error.message,
      };
    }
  }

  /**
   * Get registered model by name
   * @param {string} name
   * @returns {mongoose.Model|null}
   */
  getModel(name) {
    return this.models.get(name) || null;
  }

  /**
   * Start a transaction session
   * @returns {Promise<mongoose.ClientSession>}
   */
  async startSession() {
    return await mongoose.startSession();
  }

  /**
   * Reset connection (for testing)
   */
  async reset() {
    if (process.env.NODE_ENV !== "test") {
      throw new Error("Database reset only allowed in test environment");
    }
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    this.isConnected = false;
    this.models.clear();
  }
}

// Export singleton instance
export const db = new DatabaseManager();
export default db;