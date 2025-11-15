/**
 * The entry point of the app
 */
import express from "express";
import indexRoutes from "./routes/index.routes.js";
import db from "./database/app.database.js";

// start database connection
db.connect();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the IT Youth Talent Incubator Backend API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/v1/", indexRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  // eslint-disable-next-line no-undef
  const isDevelopment = process.env.NODE_ENV === "development";
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.name || "Internal Server Error",
    message: err.message || "Something went wrong",
    ...(isDevelopment && { stack: err.stack }),
  });
});

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3001;

app.listen(PORT, () =>
  console.log(`Server started on port ${PORT}\nURL: http://localhost:${PORT}`)
);




