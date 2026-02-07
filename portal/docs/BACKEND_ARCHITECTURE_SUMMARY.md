# Backend Architecture Summary

## Overview

The IT For Youth Ghana backend follows a **clean, modular, layered architecture** designed for:
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Testability**: Each layer can be tested independently
- ✅ **Scalability**: Easy to scale horizontally or split into microservices
- ✅ **Security**: Built-in authentication, authorization, and validation
- ✅ **Speed**: Optimized for your Sunday MVP deadline

---

## Architecture Pattern

**Layered Architecture with Dependency Injection**

```
┌─────────────────────────────────────────────┐
│           CLIENT (Portal/Bot)                │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│        ROUTES (API Endpoints)               │
│  - Authentication                           │
│  - Request routing                          │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│      MIDDLEWARES (Cross-cutting)            │
│  - Auth verification                        │
│  - Validation                               │
│  - Rate limiting                            │
│  - Error handling                           │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│      CONTROLLERS (Request Handlers)         │
│  - Parse request                            │
│  - Call services                            │
│  - Format response                          │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│       SERVICES (Business Logic)             │
│  - Domain logic                             │
│  - Orchestration                            │
│  - Transaction management                   │
└──────┬─────────┬────────────┬───────────────┘
       │         │            │
       ▼         ▼            ▼
┌──────────┐ ┌────────┐ ┌─────────────┐
│REPOSITORY│ │EXTERNAL│ │ NOTIFICATION│
│   (DB)   │ │  APIs  │ │   Services  │
└──────────┘ └────────┘ └─────────────┘
```

---

## Directory Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── index.js         # Central config
│   │   ├── database.js      # DB config
│   │   └── redis.js         # Cache config
│   │
│   ├── routes/              # API route definitions
│   │   ├── api/
│   │   │   ├── auth.routes.js
│   │   │   ├── student.routes.js
│   │   │   ├── course.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── sso.routes.js
│   │   │   ├── admin.routes.js
│   │   │   └── index.js
│   │   └── webhooks/
│   │       ├── paystack.routes.js
│   │       └── moodle.routes.js
│   │
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.js
│   │   ├── student.controller.js
│   │   ├── course.controller.js
│   │   ├── payment.controller.js
│   │   ├── sso.controller.js
│   │   ├── admin.controller.js
│   │   └── webhook.controller.js
│   │
│   ├── services/            # Business logic layer
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── course.service.js
│   │   ├── enrollment.service.js
│   │   ├── payment.service.js
│   │   ├── email.service.js
│   │   ├── notification.service.js
│   │   ├── sync.service.js
│   │   └── sso.service.js
│   │
│   ├── repositories/        # Data access layer
│   │   ├── base.repository.js
│   │   ├── user.repository.js
│   │   ├── course.repository.js
│   │   ├── enrollment.repository.js
│   │   ├── payment.repository.js
│   │   ├── verification.repository.js
│   │   └── emailLog.repository.js
│   │
│   ├── integrations/        # External API clients
│   │   ├── moodle/
│   │   │   ├── moodle.client.js
│   │   │   └── moodle.service.js
│   │   ├── paystack/
│   │   │   ├── paystack.client.js
│   │   │   └── paystack.service.js
│   │   ├── incubator/
│   │   │   ├── incubator.client.js
│   │   │   └── incubator.service.js
│   │   └── email/
│   │       ├── email.client.js
│   │       └── templates.js
│   │
│   ├── middlewares/         # Express middlewares
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   ├── cors.middleware.js
│   │   └── logger.middleware.js
│   │
│   ├── validators/          # Input validation
│   │   ├── auth.validator.js
│   │   ├── course.validator.js
│   │   └── payment.validator.js
│   │
│   ├── utils/              # Utility functions
│   │   ├── jwt.util.js
│   │   ├── crypto.util.js
│   │   ├── logger.js
│   │   ├── response.js
│   │   ├── asyncHandler.js
│   │   └── errors.js
│   │
│   ├── database/           # Database setup
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── client.js
│   │
│   ├── app.js             # Express app setup
│   └── server.js          # Server entry point
│
├── bot/                   # Telegram bot (separate)
│   ├── commands/
│   ├── handlers/
│   └── bot.js
│
├── tests/                # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Key Design Principles

### 1. **Separation of Concerns**
Each layer has a single responsibility:
- **Routes**: Define endpoints and route to controllers
- **Controllers**: Handle HTTP request/response
- **Services**: Contain business logic
- **Repositories**: Access data
- **Integrations**: Communicate with external APIs

### 2. **Dependency Injection**
Services receive dependencies via constructor:
```javascript
class EnrollmentService {
  constructor(
    enrollmentRepo,
    moodleService,
    incubatorService,
    emailService
  ) {
    this.enrollmentRepo = enrollmentRepo;
    this.moodleService = moodleService;
    // ...
  }
}
```

**Benefits:**
- Easy to test (mock dependencies)
- Loose coupling
- Configurable at runtime

### 3. **Repository Pattern**
All database access goes through repositories:
```javascript
// ❌ DON'T DO THIS in a service:
const user = await db.query('SELECT * FROM users WHERE id = ?', [id]);

// ✅ DO THIS:
const user = await userRepository.findById(id);
```

**Benefits:**
- Database-agnostic
- Centralized query logic
- Easy to optimize/cache
- Testable (mock repository)

### 4. **Async Error Handling**
All async handlers wrapped with `asyncHandler`:
```javascript
router.post('/login', asyncHandler(async (req, res) => {
  // Any error thrown here is caught and passed to error middleware
  const result = await authService.login(req.body);
  res.json(result);
}));
```

### 5. **Custom Error Classes**
Semantic error types for better error handling:
```javascript
throw new ValidationError('Invalid email', 'email');  // 400
throw new UnauthorizedError('Invalid token');         // 401
throw new NotFoundError('Course not found');          // 404
throw new AppError('Payment failed', 502);            // 502
```

### 6. **Centralized Configuration**
All config in one place (`src/config/index.js`):
```javascript
const config = require('./config');

// Access anywhere:
config.moodle.url
config.jwt.secret
config.database.url
```

---

## Request Flow Example

**POST /api/auth/register/start**

```
1. CLIENT → POST /api/auth/register/start
   { email, first_name, last_name }
   
2. ROUTE → auth.routes.js
   - Apply rate limiting (5 req/15min)
   - Validate input (email format, required fields)
   - Route to controller
   
3. CONTROLLER → auth.controller.startRegistration()
   - Extract request data
   - Call service
   - Format response
   
4. SERVICE → auth.service.startRegistration()
   - Check if user exists (userRepository)
   - Generate verification code
   - Save to DB (verificationRepository)
   - Send email (emailService)
   - Return result
   
5. CONTROLLER → Format & send response
   { success: true, message: "Code sent" }
   
6. CLIENT ← 200 OK
```

**Error Flow:**
```
SERVICE → throw ValidationError("Email exists")
   ↓
CONTROLLER → caught by asyncHandler
   ↓
ERROR MIDDLEWARE → Log error, format response
   ↓
CLIENT ← 400 { success: false, error: {...} }
```

---

## Data Access Pattern

### Base Repository (DRY principle)
```javascript
class BaseRepository {
  create(data)
  findById(id)
  findOne(criteria)
  findMany(criteria, options)
  update(id, data)
  delete(id)
}
```

### Specialized Repositories
```javascript
class UserRepository extends BaseRepository {
  // Inherits all base methods
  
  // Add specialized methods:
  findByEmail(email)
  findWithEnrollments(id)
  updateMoodleId(id, moodleId)
}
```

**Usage in Service:**
```javascript
// Simple queries use base methods:
const user = await userRepository.findById(123);

// Complex queries use specialized methods:
const userWithEnrollments = await userRepository.findWithEnrollments(123);
```

---

## External Integration Pattern

Each external service has:
1. **Client** (low-level API communication)
2. **Service** (business logic wrapper)

**Example: Moodle**
```javascript
// moodle.client.js - handles HTTP, auth, errors
class MoodleClient {
  async call(wsfunction, params) {
    // Make API request
    // Handle errors
    // Return data
  }
}

// moodle.service.js - business logic
class MoodleService {
  async createUser(userData) {
    // Validate data
    // Call client
    // Transform response
    // Log action
    return user;
  }
}
```

---

## Security Layers

### 1. **Authentication Middleware**
```javascript
// Protects routes
router.use('/api/student', authenticateUser);

// Middleware verifies JWT, attaches user to req
function authenticateUser(req, res, next) {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token);
  req.user = await userRepository.findById(decoded.id);
  next();
}
```

### 2. **Authorization**
```javascript
// Require specific role
router.use('/api/admin', requireAdmin);

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    throw new ForbiddenError();
  }
  next();
}
```

### 3. **Input Validation**
```javascript
const { body } = require('express-validator');

const validateLogin = [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  validationMiddleware // Checks errors
];

router.post('/login', validateLogin, controller.login);
```

### 4. **Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 5. **Webhook Signature Verification**
```javascript
// Paystack webhook
router.post('/webhooks/paystack', (req, res, next) => {
  const signature = req.headers['x-paystack-signature'];
  const isValid = paystack.verifySignature(req.body, signature);
  
  if (!isValid) {
    throw new UnauthorizedError('Invalid signature');
  }
  next();
});
```

---

## Testing Strategy

### Unit Tests (Services, Repositories)
```javascript
describe('AuthService', () => {
  it('should create user and send verification code', async () => {
    // Mock dependencies
    const mockUserRepo = { findByEmail: jest.fn().mockResolvedValue(null) };
    const mockEmailService = { send: jest.fn() };
    
    const authService = new AuthService(mockUserRepo, mockEmailService);
    
    await authService.startRegistration({
      email: 'test@example.com',
      firstName: 'John'
    });
    
    expect(mockEmailService.send).toHaveBeenCalled();
  });
});
```

### Integration Tests (API Endpoints)
```javascript
const request = require('supertest');
const app = require('./app');

describe('POST /api/auth/register/start', () => {
  it('should send verification code', async () => {
    const res = await request(app)
      .post('/api/auth/register/start')
      .send({ email: 'test@example.com', first_name: 'John', last_name: 'Doe' })
      .expect(200);
    
    expect(res.body.success).toBe(true);
  });
});
```

---

## Caching Strategy

Using Redis for performance:

```javascript
// Cache course list (1 hour TTL)
async function getCourses(filters) {
  const cacheKey = `courses:${hashFilters(filters)}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Query database
  const courses = await courseRepository.findMany(filters);
  
  // Store in cache
  await redis.set(cacheKey, JSON.stringify(courses), 'EX', 3600);
  
  return courses;
}

// Invalidate on update
async function updateCourse(id, data) {
  const course = await courseRepository.update(id, data);
  
  // Invalidate all course list caches
  await redis.del('courses:*');
  
  return course;
}
```

---

## Environment Variables

```bash
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/itforyouth

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
SSO_SECRET=shared-with-incubator-and-moodle

# Moodle
MOODLE_URL=https://lms.itforyouthghana.org
MOODLE_TOKEN=your-moodle-web-service-token

# Paystack
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...

# Incubator
INCUBATOR_URL=https://incubator.itforyouthghana.org
INCUBATOR_INTERNAL_SECRET=shared-secret-for-internal-api

# Email
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=noreply@itforyouthghana.org
EMAIL_PASSWORD=your-password
EMAIL_FROM_NAME=IT For Youth Ghana
EMAIL_FROM_ADDRESS=noreply@itforyouthghana.org

# Telegram
TELEGRAM_BOT_TOKEN=your-bot-token
ADMIN_CHAT_IDS=123456789,987654321

# URLs
PORTAL_URL=https://portal.itforyouthghana.org
PAYSTACK_CALLBACK_URL=https://portal.itforyouthghana.org/payment/callback
```

---

## Package Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "axios": "^1.6.0",
    "nodemailer": "^6.9.7",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "winston": "^3.11.0",
    "redis": "^4.6.11",
    "uuid": "^9.0.1",
    "node-telegram-bot-api": "^0.64.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "nodemon": "^3.0.2"
  }
}
```

---

## Advantages of This Architecture

### ✅ For MVP (this week):
- **Fast to implement**: Clear patterns, copy-paste ready
- **Easy to debug**: Each layer logs and handles errors
- **Flexible**: Can skip features without breaking others

### ✅ For Production (later):
- **Maintainable**: Easy to find and fix bugs
- **Testable**: Each layer can be tested independently
- **Scalable**: Can split into microservices when needed
- **Secure**: Multiple security layers built-in

### ✅ For Team Growth:
- **Onboarding**: New developers understand structure quickly
- **Collaboration**: Multiple devs can work on different layers
- **Standards**: Consistent patterns across codebase

---

## Next Steps

1. **Review the code examples** in `backend_code_examples.md`
2. **Check integration layer** in `integration_examples.md`
3. **View PlantUML diagrams** for visual understanding
4. **Set up your development environment**
5. **Start with database migrations** (Day 1)
6. **Build auth endpoints** (Day 1-2)
7. **Add payment integration** (Day 3)

---

**Questions? Check the PlantUML diagrams for visual flow or the code examples for implementation details!**
