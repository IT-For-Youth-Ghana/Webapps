# ITFY Portal Backend

The backend API for IT For Youth Ghana's educational platform, providing authentication, course management, enrollment processing, and payment integration.

## 🏗️ Architecture

This is a **modular Node.js/Express** application with the following structure:

```
portal/backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── index.js         # Main config
│   │   ├── database.js      # Database config
│   │   └── redis.js         # Redis config (optional)
│   ├── database/            # Database setup
│   │   └── client.js        # Sequelize client
│   ├── middlewares/         # Express middlewares
│   │   ├── auth.middleware.js
│   │   ├── cors.middleware.js
│   │   ├── error.middleware.js
│   │   ├── logger.middleware.js
│   │   └── rateLimit.middleware.js
│   ├── modules/             # Feature modules
│   │   ├── shared/          # Shared modules
│   │   │   ├── auth/        # Authentication
│   │   │   ├── email/       # Email service
│   │   │   └── notification/ # Notifications
│   │   ├── user/            # User management
│   │   ├── course/          # Course management
│   │   ├── enrollment/      # Enrollment management
│   │   ├── payment/         # Payment processing
│   │   ├── admin/           # Admin features
│   │   └── system/          # System utilities
│   ├── integrations/        # External service integrations
│   │   ├── moodle/          # Moodle LMS
│   │   ├── paystack/        # Payment gateway
│   │   └── incubator/       # Jobs platform
│   ├── models/              # Database models index
│   ├── routes/              # Route definitions
│   ├── utils/               # Utility functions
│   │   ├── errors.js        # Custom error classes
│   │   ├── logger.js        # Winston logger
│   │   ├── response.js      # Response helpers
│   │   └── asyncHandler.js  # Async error wrapper
│   ├── app.js               # Express app setup
│   └── server.js            # Server entry point
├── scripts/                 # Utility scripts
├── tests/                   # Test files
├── .env.example             # Environment variables template
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.x
- PostgreSQL >= 13.x
- npm or yarn
- Redis (optional, for caching)

### Installation

1. **Clone the repository**

   ```bash
   cd portal/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration

4. **Set up the database**

   ```bash
   # Create database
   createdb itfy_portal

   # Run migrations (when ready)
   npm run migrate
   ```

5. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🔐 Authentication Flow

### Registration Process

1. **Start Registration** (`POST /api/auth/register/start`)
   - User provides email, firstName, lastName
   - System sends 6-digit verification code via email
   - Returns: `{ success, email, message }`

2. **Verify Email** (`POST /api/auth/register/verify`)
   - User submits email and code
   - Returns: `{ success, tempToken, registrationData }`

3. **Complete Registration** (`POST /api/auth/register/complete`)
   - User provides tempToken, phone, dateOfBirth, courseId (optional)
   - System creates user, auto-generates password, initiates payment
   - Returns: `{ userId, tempPassword, paymentUrl, reference }`

### Login

```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

### Protected Routes

Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register/start` - Start registration
- `POST /api/auth/register/verify` - Verify email code
- `POST /api/auth/register/complete` - Complete registration
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password (authenticated)
- `GET /api/auth/me` - Get current user profile

### Users (to be implemented)

- `GET /api/users` - List users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)

### Courses (to be implemented)

- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (admin)
- `PUT /api/courses/:id` - Update course (admin)
- `DELETE /api/courses/:id` - Delete course (admin)

### Enrollments (to be implemented)

- `GET /api/enrollments` - Get user enrollments
- `POST /api/enrollments` - Create enrollment
- `GET /api/enrollments/:id` - Get enrollment details
- `PUT /api/enrollments/:id/progress` - Update progress

### Payments (to be implemented)

- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/verify/:reference` - Verify payment
- `GET /api/payments/history` - Get payment history

## 🔧 Configuration

### Environment Variables

Key environment variables (see `.env.example` for complete list):

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_NAME=itfy_portal
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx

# Moodle
MOODLE_URL=https://moodle.example.com
MOODLE_TOKEN=your_token

# Email
EMAIL_PROVIDER=console
```

## 🗄️ Database Models

### Core Models

- **User** - User accounts and authentication
- **Course** - Course information
- **Enrollment** - Student course enrollments
- **Payment** - Payment transactions

### Supporting Models

- **CourseModule** - Course content modules
- **StudentProgress** - Progress tracking
- **CourseTeacher** - Teacher assignments
- **Notification** - User notifications
- **VerificationCode** - Email verification codes

### System Models

- **Admin** - Admin user profiles
- **AuditLog** - System audit trail
- **EmailLog** - Email delivery logs
- **SystemSetting** - System configuration

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- user.test.js
```

## 📦 Scripts

```json
{
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "test": "jest",
  "migrate": "node scripts/migrate.js",
  "seed": "node scripts/seed.js",
  "validate-models": "node scripts/validate-models.js"
}
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with configurable rounds
- **Rate Limiting** - Prevent abuse and DDoS
- **CORS Protection** - Configurable origin whitelist
- **Input Validation** - Request data validation
- **SQL Injection Protection** - Sequelize parameterized queries
- **XSS Protection** - Input sanitization

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Enable database SSL (`DB_SSL=true`)
- [ ] Configure proper CORS origins
- [ ] Set up Redis for caching
- [ ] Enable rate limiting
- [ ] Configure email provider (SendGrid/SMTP)
- [ ] Set up logging (file rotation)
- [ ] Configure monitoring (PM2, etc.)
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (Nginx)

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/server.js --name itfy-api

# Monitor
pm2 monit

# View logs
pm2 logs itfy-api

# Restart
pm2 restart itfy-api
```

## 🔗 Integration Services

### Moodle LMS

- User creation and enrollment
- Course synchronization
- Progress tracking

### Paystack

- Payment initialization
- Transaction verification
- Webhook handling

### Incubator (Jobs Platform)

- User synchronization
- Skills management
- Job matching

## 📝 Error Handling

The API uses standard HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

Error response format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "errors": [] // Optional validation errors
  }
}
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Run linter: `npm run lint`
5. Submit pull request

## 📄 License

ISC License - see LICENSE file

## 👥 Authors

- John Ametepe Agboku

## 📧 Support

For issues and questions, contact:
johnametepeagboku@live.com
