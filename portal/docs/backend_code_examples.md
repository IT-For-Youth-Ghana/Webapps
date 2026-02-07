# Backend Code Structure Examples

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── routes/           # Route definitions
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── repositories/     # Data access
│   ├── models/           # Data models/types
│   ├── integrations/     # External API clients
│   ├── middlewares/      # Express middlewares
│   ├── validators/       # Input validation schemas
│   ├── utils/            # Utility functions
│   ├── database/         # DB migrations & client
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── bot/                 # Telegram bot (separate process)
├── tests/               # Test files
├── .env                 # Environment variables
├── package.json
└── README.md
```

---

## 1. Entry Point: `server.js`

```javascript
// src/server.js
require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');
const { connectDatabase } = require('./database/client');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');
    
    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
```

---

## 2. App Setup: `app.js`

```javascript
// src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

// Middleware imports
const { corsMiddleware } = require('./middlewares/cors.middleware');
const { loggerMiddleware } = require('./middlewares/logger.middleware');
const { errorMiddleware } = require('./middlewares/error.middleware');
const { notFoundMiddleware } = require('./middlewares/notFound.middleware');

// Route imports
const apiRoutes = require('./routes/api');
const webhookRoutes = require('./routes/webhooks');

const app = express();

// ==================== GLOBAL MIDDLEWARES ====================

// Security headers
app.use(helmet());

// CORS
app.use(corsMiddleware);

// Request logging
app.use(morgan('combined'));
app.use(loggerMiddleware);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

// ==================== ROUTES ====================

// API routes (requires authentication for most)
app.use('/api', apiRoutes);

// Webhook routes (no authentication, signature verification)
app.use('/api/webhooks', webhookRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use(notFoundMiddleware);

// Global error handler (must be last)
app.use(errorMiddleware);

module.exports = app;
```

---

## 3. Routes Layer

```javascript
// src/routes/api/index.js
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const studentRoutes = require('./student.routes');
const courseRoutes = require('./course.routes');
const paymentRoutes = require('./payment.routes');
const ssoRoutes = require('./sso.routes');
const adminRoutes = require('./admin.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/student', studentRoutes);
router.use('/courses', courseRoutes);
router.use('/payments', paymentRoutes);
router.use('/sso', ssoRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
```

```javascript
// src/routes/api/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth.controller');
const { validateRegistrationStart, validateVerifyCode, validateCompleteRegistration } = require('../../validators/auth.validator');
const { rateLimitMiddleware } = require('../../middlewares/rateLimit.middleware');

// Public routes
router.post(
  '/register/start',
  rateLimitMiddleware({ max: 5, windowMs: 15 * 60 * 1000 }), // 5 requests per 15 min
  validateRegistrationStart,
  authController.startRegistration
);

router.post(
  '/register/verify',
  validateVerifyCode,
  authController.verifyCode
);

router.post(
  '/register/complete',
  validateCompleteRegistration,
  authController.completeRegistration
);

router.post('/login', authController.login);

module.exports = router;
```

```javascript
// src/routes/api/student.routes.js
const express = require('express');
const router = express.Router();
const studentController = require('../../controllers/student.controller');
const { authenticateUser } = require('../../middlewares/auth.middleware');

// All student routes require authentication
router.use(authenticateUser);

router.get('/profile', studentController.getProfile);
router.get('/enrollments', studentController.getEnrollments);
router.get('/progress/:enrollment_id', studentController.getProgress);
router.get('/notifications', studentController.getNotifications);

module.exports = router;
```

---

## 4. Controllers Layer

```javascript
// src/controllers/auth.controller.js
const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');
const { asyncHandler } = require('../utils/asyncHandler');

class AuthController {
  
  // Start registration - send verification code
  startRegistration = asyncHandler(async (req, res) => {
    const { email, first_name, last_name } = req.body;
    
    const result = await authService.startRegistration({
      email,
      firstName: first_name,
      lastName: last_name
    });
    
    return successResponse(res, {
      message: 'Verification code sent to your email',
      data: result
    });
  });
  
  // Verify email code
  verifyCode = asyncHandler(async (req, res) => {
    const { email, code } = req.body;
    
    const result = await authService.verifyCode(email, code);
    
    return successResponse(res, {
      message: 'Email verified successfully',
      data: result
    });
  });
  
  // Complete registration
  completeRegistration = asyncHandler(async (req, res) => {
    const { temp_token, phone, date_of_birth, course_id } = req.body;
    
    const result = await authService.completeRegistration({
      tempToken: temp_token,
      phone,
      dateOfBirth: date_of_birth,
      courseId: course_id
    });
    
    return successResponse(res, {
      message: 'Registration completed. Please complete payment.',
      data: result
    }, 201);
  });
  
  // Login
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    const result = await authService.login(email, password);
    
    return successResponse(res, {
      message: 'Login successful',
      data: result
    });
  });
}

module.exports = new AuthController();
```

```javascript
// src/controllers/student.controller.js
const studentService = require('../services/student.service');
const { successResponse } = require('../utils/response');
const { asyncHandler } = require('../utils/asyncHandler');

class StudentController {
  
  getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id; // From auth middleware
    
    const profile = await studentService.getProfile(userId);
    
    return successResponse(res, { data: profile });
  });
  
  getEnrollments = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { status, limit = 10, offset = 0 } = req.query;
    
    const enrollments = await studentService.getEnrollments(userId, {
      status,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    return successResponse(res, { data: enrollments });
  });
  
  getProgress = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { enrollment_id } = req.params;
    
    const progress = await studentService.getDetailedProgress(
      userId, 
      parseInt(enrollment_id)
    );
    
    return successResponse(res, { data: progress });
  });
  
  getNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { unread_only = false } = req.query;
    
    const notifications = await studentService.getNotifications(
      userId,
      unread_only === 'true'
    );
    
    return successResponse(res, { data: notifications });
  });
}

module.exports = new StudentController();
```

---

## 5. Services Layer (Business Logic)

```javascript
// src/services/auth.service.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const verificationRepository = require('../repositories/verification.repository');
const emailService = require('./email.service');
const jwtUtil = require('../utils/jwt.util');
const { AppError, ValidationError, UnauthorizedError } = require('../utils/errors');
const logger = require('../utils/logger');

class AuthService {
  
  async startRegistration({ email, firstName, lastName }) {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }
    
    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    
    // Store verification code (expires in 15 minutes)
    await verificationRepository.create({
      email,
      code,
      registrationData: { firstName, lastName },
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });
    
    // Send verification email
    await emailService.sendVerificationCode(email, code, firstName);
    
    logger.info(`Verification code sent to ${email}`);
    
    return { 
      success: true,
      email 
    };
  }
  
  async verifyCode(email, code) {
    // Find verification record
    const verification = await verificationRepository.findByEmail(email);
    
    if (!verification) {
      throw new ValidationError('Invalid verification code');
    }
    
    // Check if expired
    if (new Date() > new Date(verification.expires_at)) {
      throw new ValidationError('Verification code expired');
    }
    
    // Check if code matches
    if (verification.code !== code) {
      throw new ValidationError('Invalid verification code');
    }
    
    // Mark as verified
    await verificationRepository.update(verification.id, { verified: true });
    
    // Generate temporary token (valid for 30 minutes)
    const tempToken = jwtUtil.generateTempToken({ email }, '30m');
    
    logger.info(`Email verified for ${email}`);
    
    return {
      success: true,
      temp_token: tempToken
    };
  }
  
  async completeRegistration({ tempToken, phone, dateOfBirth, courseId }) {
    // Verify temp token
    const decoded = jwtUtil.verifyToken(tempToken);
    const email = decoded.email;
    
    // Get verification data
    const verification = await verificationRepository.findByEmail(email);
    
    if (!verification || !verification.verified) {
      throw new ValidationError('Email not verified');
    }
    
    // Auto-generate password
    const autoPassword = crypto.randomBytes(8).toString('hex');
    const passwordHash = await bcrypt.hash(autoPassword, 10);
    
    // Create user
    const user = await userRepository.create({
      email,
      passwordHash,
      firstName: verification.registration_data.firstName,
      lastName: verification.registration_data.lastName,
      phone,
      dateOfBirth,
      role: 'student',
      tempPassword: autoPassword // Store for email
    });
    
    // Create enrollment (pending payment)
    const enrollmentService = require('./enrollment.service');
    const enrollment = await enrollmentService.createPendingEnrollment(
      user.id,
      courseId
    );
    
    // Initialize payment
    const paymentService = require('./payment.service');
    const payment = await paymentService.initializePayment({
      userId: user.id,
      enrollmentId: enrollment.id,
      courseId
    });
    
    logger.info(`User ${user.id} registered, payment initialized`);
    
    return {
      user_id: user.id,
      payment_url: payment.authorization_url,
      reference: payment.reference
    };
  }
  
  async login(email, password) {
    // Find user
    const user = await userRepository.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }
    
    // Generate JWT
    const token = jwtUtil.generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    logger.info(`User ${user.id} logged in`);
    
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    };
  }
}

module.exports = new AuthService();
```

```javascript
// src/services/enrollment.service.js
const enrollmentRepository = require('../repositories/enrollment.repository');
const courseRepository = require('../repositories/course.repository');
const moodleService = require('../integrations/moodle/moodle.service');
const incubatorService = require('../integrations/incubator/incubator.service');
const emailService = require('./email.service');
const notificationService = require('./notification.service');
const logger = require('../utils/logger');
const { NotFoundError, AppError } = require('../utils/errors');

class EnrollmentService {
  
  async createPendingEnrollment(userId, courseId) {
    // Verify course exists
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    
    // Check for duplicate enrollment
    const existing = await enrollmentRepository.findByUserAndCourse(userId, courseId);
    if (existing) {
      throw new AppError('Already enrolled in this course', 409);
    }
    
    // Create enrollment
    const enrollment = await enrollmentRepository.create({
      userId,
      courseId,
      paymentStatus: 'pending',
      enrollmentStatus: 'pending'
    });
    
    logger.info(`Pending enrollment created: ${enrollment.id}`);
    
    return enrollment;
  }
  
  async completeEnrollment(enrollmentId, paymentReference) {
    const enrollment = await enrollmentRepository.findById(enrollmentId);
    
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }
    
    // Get user and course data
    const userRepository = require('../repositories/user.repository');
    const user = await userRepository.findById(enrollment.user_id);
    const course = await courseRepository.findById(enrollment.course_id);
    
    try {
      // 1. Create user in Moodle
      if (!user.moodle_user_id) {
        const moodleUser = await moodleService.createUser({
          username: `${user.email.split('@')[0]}_${user.id}`,
          password: user.temp_password || crypto.randomBytes(8).toString('hex'),
          firstname: user.first_name,
          lastname: user.last_name,
          email: user.email
        });
        
        // Update user with Moodle ID
        await userRepository.update(user.id, {
          moodleUserId: moodleUser.id
        });
        
        user.moodle_user_id = moodleUser.id;
      }
      
      // 2. Enroll in Moodle course
      await moodleService.enrollUser(
        user.moodle_user_id,
        course.moodle_course_id
      );
      
      // 3. Create user in Incubator
      if (!user.incubator_user_id) {
        const incubatorUser = await incubatorService.createUser({
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          centralUserId: user.id
        });
        
        await userRepository.update(user.id, {
          incubatorUserId: incubatorUser._id
        });
      }
      
      // 4. Update enrollment status
      await enrollmentRepository.update(enrollmentId, {
        paymentStatus: 'completed',
        enrollmentStatus: 'enrolled',
        paymentReference,
        enrolledAt: new Date()
      });
      
      // 5. Send welcome email
      await emailService.sendWelcomeEmail(user, course);
      
      // 6. Create notification
      await notificationService.create({
        userId: user.id,
        type: 'enrollment_success',
        title: `Welcome to ${course.title}!`,
        message: `You have been successfully enrolled in ${course.title}`,
        link: `/courses/${course.id}`
      });
      
      logger.info(`Enrollment ${enrollmentId} completed successfully`);
      
      return {
        success: true,
        enrollment_id: enrollmentId
      };
      
    } catch (error) {
      logger.error(`Failed to complete enrollment ${enrollmentId}:`, error);
      
      // Rollback enrollment status
      await enrollmentRepository.update(enrollmentId, {
        enrollmentStatus: 'failed'
      });
      
      throw new AppError('Failed to complete enrollment', 500);
    }
  }
  
  async updateProgress(enrollmentId, moduleId, status, score) {
    // Update student_progress table
    const progressRepository = require('../repositories/progress.repository');
    await progressRepository.upsert({
      enrollmentId,
      moduleId,
      status,
      score,
      completedAt: status === 'completed' ? new Date() : null
    });
    
    // Recalculate overall progress
    const progress = await this.calculateProgress(enrollmentId);
    
    // Update enrollment
    await enrollmentRepository.update(enrollmentId, {
      progressPercentage: progress.percentage,
      enrollmentStatus: progress.percentage === 100 ? 'completed' : 'enrolled',
      completedAt: progress.percentage === 100 ? new Date() : null
    });
    
    logger.info(`Progress updated for enrollment ${enrollmentId}: ${progress.percentage}%`);
    
    return progress;
  }
  
  async calculateProgress(enrollmentId) {
    const progressRepository = require('../repositories/progress.repository');
    const moduleRepository = require('../repositories/module.repository');
    
    const enrollment = await enrollmentRepository.findById(enrollmentId);
    const totalModules = await moduleRepository.countByCourse(enrollment.course_id);
    const completedModules = await progressRepository.countCompleted(enrollmentId);
    
    const percentage = totalModules > 0 
      ? Math.round((completedModules / totalModules) * 100) 
      : 0;
    
    return {
      total_modules: totalModules,
      completed_modules: completedModules,
      percentage
    };
  }
}

module.exports = new EnrollmentService();
```

---

## 6. Repository Layer (Data Access)

```javascript
// src/repositories/base.repository.js
class BaseRepository {
  constructor(db, tableName) {
    this.db = db;
    this.tableName = tableName;
  }
  
  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${this.tableName} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await this.db.query(query, values);
    return this.mapToModel(result.rows[0]);
  }
  
  async findById(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const result = await this.db.query(query, [id]);
    
    return result.rows[0] ? this.mapToModel(result.rows[0]) : null;
  }
  
  async findOne(criteria) {
    const { where, values } = this.buildWhereClause(criteria);
    const query = `SELECT * FROM ${this.tableName} WHERE ${where} LIMIT 1`;
    
    const result = await this.db.query(query, values);
    return result.rows[0] ? this.mapToModel(result.rows[0]) : null;
  }
  
  async findMany(criteria, options = {}) {
    const { where, values } = this.buildWhereClause(criteria);
    const { limit = 10, offset = 0, orderBy = 'id', order = 'ASC' } = options;
    
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE ${where}
      ORDER BY ${orderBy} ${order}
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;
    
    const result = await this.db.query(query, [...values, limit, offset]);
    return result.rows.map(row => this.mapToModel(row));
  }
  
  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const sets = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    
    const query = `
      UPDATE ${this.tableName}
      SET ${sets}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.db.query(query, [id, ...values]);
    return result.rows[0] ? this.mapToModel(result.rows[0]) : null;
  }
  
  async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`;
    const result = await this.db.query(query, [id]);
    return result.rowCount > 0;
  }
  
  buildWhereClause(criteria) {
    const keys = Object.keys(criteria);
    const where = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
    const values = Object.values(criteria);
    
    return { where: where || '1=1', values };
  }
  
  mapToModel(row) {
    // Override in child classes for custom mapping
    return row;
  }
}

module.exports = BaseRepository;
```

```javascript
// src/repositories/user.repository.js
const BaseRepository = require('./base.repository');
const db = require('../database/client');

class UserRepository extends BaseRepository {
  constructor() {
    super(db, 'users');
  }
  
  async findByEmail(email) {
    return this.findOne({ email });
  }
  
  async findWithEnrollments(userId) {
    const query = `
      SELECT 
        u.*,
        json_agg(
          json_build_object(
            'id', e.id,
            'course_id', e.course_id,
            'course_title', c.title,
            'status', e.enrollment_status,
            'progress', e.progress_percentage
          )
        ) FILTER (WHERE e.id IS NOT NULL) as enrollments
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.user_id
      LEFT JOIN courses c ON e.course_id = c.id
      WHERE u.id = $1
      GROUP BY u.id
    `;
    
    const result = await this.db.query(query, [userId]);
    return result.rows[0] || null;
  }
  
  async updateMoodleId(userId, moodleUserId) {
    return this.update(userId, { moodle_user_id: moodleUserId });
  }
  
  async updateIncubatorId(userId, incubatorUserId) {
    return this.update(userId, { incubator_user_id: incubatorUserId });
  }
}

module.exports = new UserRepository();
```

---

## 7. Middleware Layer

```javascript
// src/middlewares/auth.middleware.js
const jwtUtil = require('../utils/jwt.util');
const { UnauthorizedError } = require('../utils/errors');
const userRepository = require('../repositories/user.repository');

async function authenticateUser(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }
    
    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = jwtUtil.verifyToken(token);
    
    // Get user from database (optional: could cache this)
    const user = await userRepository.findById(decoded.id);
    
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    
    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

async function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return next(new ForbiddenError('Admin access required'));
  }
  next();
}

module.exports = {
  authenticateUser,
  requireAdmin
};
```

```javascript
// src/middlewares/error.middleware.js
const logger = require('../utils/logger');

function errorMiddleware(err, req, res, next) {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    user: req.user?.id
  });
  
  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Determine error code
  const errorCode = err.code || 'INTERNAL_ERROR';
  
  // Build response
  const response = {
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected error occurred'
    }
  };
  
  // Add field info for validation errors
  if (err.field) {
    response.error.field = err.field;
  }
  
  // Add request ID for tracking (in production)
  if (process.env.NODE_ENV === 'production') {
    response.error.request_id = req.id || 'unknown';
  } else {
    // Include stack trace in development
    response.error.stack = err.stack;
  }
  
  res.status(statusCode).json(response);
}

module.exports = { errorMiddleware };
```

---

## 8. Utils Layer

```javascript
// src/utils/asyncHandler.js
/**
 * Wraps async route handlers to catch errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
```

```javascript
// src/utils/response.js
function successResponse(res, { message, data }, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

function errorResponse(res, { message, code }, statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message
    }
  });
}

module.exports = {
  successResponse,
  errorResponse
};
```

```javascript
// src/utils/errors.js
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', resource = null, id = null) {
    super(message, 404, 'NOT_FOUND');
    this.resource = resource;
    this.id = id;
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError
};
```

---

This is a solid, production-ready modular architecture with:
- **Clear separation of concerns** (Routes → Controllers → Services → Repositories)
- **Dependency injection ready** (services can be easily tested/mocked)
- **Centralized error handling**
- **Reusable base classes**
- **Type-safe patterns**

Want me to continue with more examples (integrations, validators, database client)?
