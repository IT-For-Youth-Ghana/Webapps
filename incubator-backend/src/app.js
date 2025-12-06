/* eslint-disable no-undef */
/**
 * Application Entry Point
 * Initializes Express, MongoDB, Agenda, and all routes
 */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import db from "./database/app.database";
import agendaManager from "./config/agenda.config";
import cache from "./utils/cache/cache.util";
import { setupAPIDocs } from "./config/swagger.config.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// ========================================

// Import routes
import routes from "./routes/app.routes";

// import applicationRoutes from "./modules/application/routes/application.routes";

const app = express();

// ========================================
// MIDDLEWARE
// ========================================

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
}));

// Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

// ========================================
// HEALTH CHECK
// ========================================

app.get("/api/v1/health", async (req, res) => {
  const dbHealth = await db.healthCheck();
  const cacheHealth = await cache.health();
  const agendaHealth = {
    status: agendaManager.isReady ? "healthy" : "unhealthy",
  };

  const overallStatus =
    dbHealth.status === "healthy" &&
    cacheHealth.status === "healthy" &&
    agendaHealth.status === "healthy"
      ? "healthy"
      : "unhealthy";

  res.status(overallStatus === "healthy" ? 200 : 503).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealth,
      cache: cacheHealth,
      agenda: agendaHealth,
    },
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the IT Youth Talent Incubator Backend API",
    version: "1.0.0",
    docs: "/docs",
    api_docs: {
      swagger: "/api-docs",
      redoc: "/api-docs/redoc",
      openapi_yaml: "/api-docs/openapi.yaml",
      openapi_json: "/api-docs/openapi.json"
    }
  });
});

// ========================================
// API DOCUMENTATION
// ========================================
setupAPIDocs(app);

// ========================================
// API ROUTES
// ========================================
app.use("/api/v1", routes);

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    path: req.originalUrl,
  });
});



// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Error:", err);

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message;

  res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// ========================================
// STARTUP
// ========================================

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    console.log("Starting IT Youth Talent Incubator Backend...");

    // 1. Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await db.connect();

    // 2. Connect to Redis/Cache
    console.log("Connecting to cache...");
    await cache.connect();

    // 3. Initialize Agenda.js
    console.log("Initializing Agenda.js...");
    await agendaManager.initialize();

    // 4. Setup recurring tasks
    console.log("Setting up recurring tasks...");
    await agendaManager.setupRecurringTasks();

    // 5. Start Express server
    app.listen(PORT, () => {
      console.log("Server started successfully!");
      console.log(`API: http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

async function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  try {
    // Stop accepting new requests
    console.log("Stopping HTTP server...");

    // Stop Agenda
    console.log("Stopping Agenda.js...");
    await agendaManager.stop();

    // Close database connection
    console.log("Closing database connection...");
    await db.gracefulShutdown(signal);

    // Close cache connection
    console.log("Closing cache connection...");
    await cache.disconnect();

    console.log("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});

// Start the server
if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;