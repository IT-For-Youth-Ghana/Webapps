/**
 * Sequelize Database Client
 * Configured with connection pooling, retry logic, and logging
 */

import { Sequelize } from "sequelize";
import logger from "../utils/logger.js"; // Assuming you have a logger

const dbDialect = process.env.DB_DIALECT || "mysql";

// Database configuration
const config = {
  dialect: dbDialect,
  host: process.env.DB_HOST || "localhost",
  username: process.env.DB_USER || "itfy",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "itfyportal",
  
  // Connection pool configuration
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 10, // Maximum number of connections
    min: parseInt(process.env.DB_POOL_MIN) || 2,  // Minimum number of connections
    acquire: 30000, // Maximum time (ms) to get connection before throwing error
    idle: 10000,    // Maximum time (ms) a connection can be idle before being released
  },
  
  // Logging configuration
  logging: process.env.NODE_ENV === "development" 
    ? (msg) => logger.debug(msg) 
    : false, // Disable logging in production
  
  // Query options
  define: {
    timestamps: true,        // Automatically add createdAt and updatedAt
    underscored: true,       // Use snake_case in database (created_at instead of createdAt)
    freezeTableName: false,  // Pluralize table names automatically
    paranoid: true,         // Enable soft deletes globally (set to true if you want)
  },
  
  // Retry configuration
  retry: {
    max: 3, // Maximum retry attempts
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /TimeoutError/,
    ],
  },
  
  // Dialect-specific options
  dialectOptions:
    dbDialect === "postgres"
      ? {
          ssl:
            process.env.DB_SSL === "true"
              ? {
                  require: true,
                  rejectUnauthorized: false, // For self-signed certificates (use carefully)
                }
              : false,
          // Statement timeout (30 seconds)
          statement_timeout: 30000,
          // Idle timeout (Postgres only)
          idle_in_transaction_session_timeout: 60000,
        }
      : {},
  
  // Timezone
  timezone: process.env.DB_TIMEZONE || "+00:00", // UTC by default
};

// Create Sequelize instance
const sequelize = new Sequelize(config);

/**
 * Test database connection with retry logic
 */
async function testConnection(retries = 3, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      logger.info("✅ Database connection established successfully");
      logger.info(`📊 Database: ${config.database} on ${config.host}:${config.port}`);
      return true;
    } catch (error) {
      logger.error(`❌ Database connection attempt ${i + 1}/${retries} failed:`, error.message);
      
      if (i < retries - 1) {
        logger.info(`⏳ Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        logger.error("💥 All database connection attempts failed");
        throw error;
      }
    }
  }
}

/**
 * Sync database (create tables)
 * WARNING: Use carefully in production!
 */
async function syncDatabase(options = {}) {
  try {
    const {
      force = false,  // Drop tables before recreating (DANGEROUS!)
      alter = false,  // Alter tables to match models (safer than force)
    } = options;

    if (force) {
      logger.warn("⚠️  WARNING: Dropping all tables and recreating (force: true)");
    }

    await sequelize.sync({ force, alter });
    
    logger.info("✅ Database synchronized successfully");
  } catch (error) {
    logger.error("❌ Database sync failed:", error);
    throw error;
  }
}

/**
 * Close database connection
 */
async function closeConnection() {
  try {
    await sequelize.close();
    logger.info("Database connection closed");
  } catch (error) {
    logger.error("Error closing database connection:", error);
    throw error;
  }
}

/**
 * Get connection pool stats
 */
function getPoolStats() {
  const pool = sequelize.connectionManager.pool;
  
  return {
    total: pool.size,
    active: pool.using,
    idle: pool.available,
    waiting: pool.waiting,
  };
}

/**
 * Health check
 */
async function healthCheck() {
  try {
    await sequelize.authenticate();
    const poolStats = getPoolStats();
    
    return {
      status: "healthy",
      database: config.database,
      host: config.host,
      port: config.port,
      pool: poolStats,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
    };
  }
}

/**
 * Execute raw query with error handling
 */
async function executeQuery(sql, options = {}) {
  try {
    const [results, metadata] = await sequelize.query(sql, {
      ...options,
      logging: process.env.NODE_ENV === "development",
    });
    
    return results;
  } catch (error) {
    logger.error(`Query execution failed: ${sql}`, error);
    throw error;
  }
}

/**
 * Transaction wrapper
 */
async function transaction(callback) {
  const t = await sequelize.transaction();
  
  try {
    const result = await callback(t);
    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    logger.error("Transaction rolled back:", error);
    throw error;
  }
}

// Test connection on import
testConnection().catch((error) => {
  logger.error("Failed to connect to database on startup:", error);
  // Decide whether to exit process or continue
  if (process.env.NODE_ENV === "production") {
    process.exit(1); // Exit in production if DB is not available
  }
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, closing database connection...");
  await closeConnection();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, closing database connection...");
  await closeConnection();
  process.exit(0);
});

sequelize.sync()

export default sequelize;

export {
  testConnection,
  syncDatabase,
  closeConnection,
  getPoolStats,
  healthCheck,
  executeQuery,
  transaction,
};
