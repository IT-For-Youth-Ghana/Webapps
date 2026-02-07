# Integration Layer & Configuration Examples

## 9. Integrations Layer

### Moodle Integration

```javascript
// src/integrations/moodle/moodle.client.js
const axios = require('axios');
const logger = require('../../utils/logger');
const { AppError } = require('../../utils/errors');

class MoodleClient {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
    this.client = axios.create({
      baseURL: `${baseURL}/webservice/rest/server.php`,
      timeout: 30000
    });
  }
  
  async call(wsfunction, params = {}) {
    try {
      const response = await this.client.post('', null, {
        params: {
          wstoken: this.token,
          wsfunction,
          moodlewsrestformat: 'json',
          ...params
        }
      });
      
      // Moodle returns errors as objects, not HTTP error codes
      if (response.data.exception) {
        throw new Error(response.data.message || 'Moodle API error');
      }
      
      return response.data;
      
    } catch (error) {
      logger.error(`Moodle API error [${wsfunction}]:`, error.message);
      throw new AppError(`Moodle API error: ${error.message}`, 502);
    }
  }
}

module.exports = MoodleClient;
```

```javascript
// src/integrations/moodle/moodle.service.js
const MoodleClient = require('./moodle.client');
const config = require('../../config');
const logger = require('../../utils/logger');

class MoodleService {
  constructor() {
    this.client = new MoodleClient(config.moodle.url, config.moodle.token);
  }
  
  /**
   * Create a user in Moodle
   */
  async createUser({ username, password, firstname, lastname, email }) {
    const users = await this.client.call('core_user_create_users', {
      'users[0][username]': username,
      'users[0][password]': password,
      'users[0][firstname]': firstname,
      'users[0][lastname]': lastname,
      'users[0][email]': email,
      'users[0][auth]': 'manual'
    });
    
    if (!users || !users[0]) {
      throw new Error('Failed to create Moodle user');
    }
    
    logger.info(`Moodle user created: ${users[0].id}`);
    
    return users[0];
  }
  
  /**
   * Enroll user in course
   */
  async enrollUser(userId, courseId, roleId = 5) {
    // Role ID 5 = Student role (default)
    await this.client.call('enrol_manual_enrol_users', {
      'enrolments[0][roleid]': roleId,
      'enrolments[0][userid]': userId,
      'enrolments[0][courseid]': courseId
    });
    
    logger.info(`User ${userId} enrolled in course ${courseId}`);
    
    return { success: true };
  }
  
  /**
   * Get all courses
   */
  async getCourses() {
    const courses = await this.client.call('core_course_get_courses');
    
    return courses.map(course => ({
      id: course.id,
      fullname: course.fullname,
      shortname: course.shortname,
      summary: course.summary,
      categoryid: course.categoryid
    }));
  }
  
  /**
   * Get course completion status
   */
  async getCourseCompletion(courseId, userId) {
    const completion = await this.client.call(
      'core_completion_get_course_completion_status',
      {
        courseid: courseId,
        userid: userId
      }
    );
    
    return {
      completed: completion.completionstatus?.completed || false,
      timecompleted: completion.completionstatus?.timecompleted || null
    };
  }
  
  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const users = await this.client.call('core_user_get_users_by_field', {
      'field': 'id',
      'values[0]': userId
    });
    
    return users[0] || null;
  }
  
  /**
   * Update user
   */
  async updateUser(userId, { firstname, lastname, email }) {
    await this.client.call('core_user_update_users', {
      'users[0][id]': userId,
      'users[0][firstname]': firstname,
      'users[0][lastname]': lastname,
      'users[0][email]': email
    });
    
    logger.info(`Moodle user ${userId} updated`);
    
    return { success: true };
  }
  
  /**
   * Assign role to user
   */
  async assignRole(userId, roleId, contextId) {
    await this.client.call('core_role_assign_roles', {
      'assignments[0][roleid]': roleId,
      'assignments[0][userid]': userId,
      'assignments[0][contextid]': contextId
    });
    
    logger.info(`Role ${roleId} assigned to user ${userId}`);
    
    return { success: true };
  }
}

module.exports = new MoodleService();
```

---

### Paystack Integration

```javascript
// src/integrations/paystack/paystack.client.js
const axios = require('axios');
const crypto = require('crypto');
const config = require('../../config');
const logger = require('../../utils/logger');
const { AppError } = require('../../utils/errors');

class PaystackClient {
  constructor(secretKey) {
    this.secretKey = secretKey;
    this.client = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }
  
  /**
   * Initialize a transaction
   */
  async initializeTransaction({ email, amount, reference, metadata = {} }) {
    try {
      const response = await this.client.post('/transaction/initialize', {
        email,
        amount: amount * 100, // Convert to kobo/pesewas
        reference,
        callback_url: config.paystack.callbackUrl,
        metadata
      });
      
      if (!response.data.status) {
        throw new Error(response.data.message || 'Failed to initialize payment');
      }
      
      return response.data.data;
      
    } catch (error) {
      logger.error('Paystack initialization error:', error.message);
      throw new AppError('Payment initialization failed', 502);
    }
  }
  
  /**
   * Verify a transaction
   */
  async verifyTransaction(reference) {
    try {
      const response = await this.client.get(`/transaction/verify/${reference}`);
      
      if (!response.data.status) {
        throw new Error('Transaction verification failed');
      }
      
      return response.data.data;
      
    } catch (error) {
      logger.error(`Paystack verification error [${reference}]:`, error.message);
      throw new AppError('Payment verification failed', 502);
    }
  }
  
  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload, signature) {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return hash === signature;
  }
}

module.exports = PaystackClient;
```

```javascript
// src/integrations/paystack/paystack.service.js
const PaystackClient = require('./paystack.client');
const config = require('../../config');
const paymentRepository = require('../../repositories/payment.repository');
const courseRepository = require('../../repositories/course.repository');
const logger = require('../../utils/logger');
const { v4: uuidv4 } = require('uuid');

class PaystackService {
  constructor() {
    this.client = new PaystackClient(config.paystack.secretKey);
  }
  
  async initializePayment({ userId, enrollmentId, courseId }) {
    // Get course details
    const course = await courseRepository.findById(courseId);
    
    if (!course) {
      throw new Error('Course not found');
    }
    
    // Generate unique reference
    const reference = `ref_${uuidv4().replace(/-/g, '')}`;
    
    // Get user details
    const userRepository = require('../../repositories/user.repository');
    const user = await userRepository.findById(userId);
    
    // Initialize transaction with Paystack
    const transaction = await this.client.initializeTransaction({
      email: user.email,
      amount: course.price,
      reference,
      metadata: {
        user_id: userId,
        enrollment_id: enrollmentId,
        course_id: courseId,
        course_title: course.title
      }
    });
    
    // Store payment record
    await paymentRepository.create({
      userId,
      enrollmentId,
      amount: course.price,
      currency: course.currency || 'GHS',
      paystackReference: reference,
      paystackAccessCode: transaction.access_code,
      authorizationUrl: transaction.authorization_url,
      status: 'pending',
      metadata: { course_id: courseId }
    });
    
    logger.info(`Payment initialized: ${reference}`);
    
    return {
      authorization_url: transaction.authorization_url,
      access_code: transaction.access_code,
      reference
    };
  }
  
  async verifyPayment(reference) {
    // Verify with Paystack
    const transaction = await this.client.verifyTransaction(reference);
    
    // Get payment record
    const payment = await paymentRepository.findByReference(reference);
    
    if (!payment) {
      throw new Error('Payment record not found');
    }
    
    // Update payment status
    await paymentRepository.update(payment.id, {
      status: transaction.status === 'success' ? 'success' : 'failed',
      paymentMethod: transaction.channel,
      paidAt: transaction.status === 'success' ? new Date() : null
    });
    
    logger.info(`Payment verified: ${reference} - ${transaction.status}`);
    
    return {
      status: transaction.status,
      amount: transaction.amount / 100, // Convert back from kobo
      payment_id: payment.id,
      enrollment_id: payment.enrollment_id
    };
  }
  
  verifyWebhookSignature(payload, signature) {
    return this.client.verifyWebhookSignature(payload, signature);
  }
}

module.exports = new PaystackService();
```

---

### Incubator Integration

```javascript
// src/integrations/incubator/incubator.client.js
const axios = require('axios');
const config = require('../../config');
const logger = require('../../utils/logger');
const { AppError } = require('../../utils/errors');

class IncubatorClient {
  constructor(baseURL, internalSecret) {
    this.baseURL = baseURL;
    this.internalSecret = internalSecret;
    this.client = axios.create({
      baseURL,
      headers: {
        'X-Internal-Secret': internalSecret,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }
  
  async createUser({ email, firstName, lastName, centralUserId }) {
    try {
      const response = await this.client.post('/api/internal/users/create', {
        email,
        firstName,
        lastName,
        centralUserId,
        authMethod: 'sso'
      });
      
      return response.data;
      
    } catch (error) {
      logger.error('Incubator user creation error:', error.message);
      throw new AppError('Failed to create incubator user', 502);
    }
  }
  
  async updateUser(incubatorUserId, data) {
    try {
      const response = await this.client.put(
        `/api/internal/users/${incubatorUserId}`,
        data
      );
      
      return response.data;
      
    } catch (error) {
      logger.error('Incubator user update error:', error.message);
      throw new AppError('Failed to update incubator user', 502);
    }
  }
  
  async getUserByCentralId(centralUserId) {
    try {
      const response = await this.client.get(
        `/api/internal/users/by-central-id/${centralUserId}`
      );
      
      return response.data;
      
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new AppError('Failed to fetch incubator user', 502);
    }
  }
}

module.exports = IncubatorClient;
```

```javascript
// src/integrations/incubator/incubator.service.js
const IncubatorClient = require('./incubator.client');
const config = require('../../config');
const logger = require('../../utils/logger');

class IncubatorService {
  constructor() {
    this.client = new IncubatorClient(
      config.incubator.url,
      config.incubator.internalSecret
    );
  }
  
  async createUser({ email, firstName, lastName, centralUserId }) {
    const user = await this.client.createUser({
      email,
      firstName,
      lastName,
      centralUserId
    });
    
    logger.info(`Incubator user created: ${user._id} for central user ${centralUserId}`);
    
    return user;
  }
  
  async syncUser(centralUser) {
    // Check if user exists in incubator
    let incubatorUser = await this.client.getUserByCentralId(centralUser.id);
    
    if (!incubatorUser) {
      // Create new user
      incubatorUser = await this.createUser({
        email: centralUser.email,
        firstName: centralUser.first_name,
        lastName: centralUser.last_name,
        centralUserId: centralUser.id
      });
    } else {
      // Update existing user
      incubatorUser = await this.client.updateUser(incubatorUser._id, {
        firstName: centralUser.first_name,
        lastName: centralUser.last_name,
        email: centralUser.email
      });
    }
    
    return incubatorUser;
  }
}

module.exports = new IncubatorService();
```

---

### Email Integration

```javascript
// src/integrations/email/email.client.js
const nodemailer = require('nodemailer');
const config = require('../../config');
const logger = require('../../utils/logger');

class EmailClient {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password
      }
    });
  }
  
  async send({ to, subject, html, text }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${config.email.fromName}" <${config.email.fromAddress}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      });
      
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      
      return {
        messageId: info.messageId,
        success: true
      };
      
    } catch (error) {
      logger.error(`Email send error [${to}]:`, error.message);
      throw error;
    }
  }
  
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }
}

module.exports = EmailClient;
```

```javascript
// src/integrations/email/templates.js
const config = require('../../config');

class EmailTemplates {
  
  static verificationCode(firstName, code) {
    return {
      subject: 'Verify Your Email - IT For Youth Ghana',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; }
            .code { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px; text-align: center; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>IT For Youth Ghana</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName}!</h2>
              <p>Thank you for registering with IT For Youth Ghana. Please use the verification code below to complete your registration:</p>
              <div class="code">${code}</div>
              <p>This code will expire in 15 minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} IT For Youth Ghana. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
  
  static welcomeEmail(user, course, credentials) {
    return {
      subject: `Welcome to ${course.title}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; }
            .credentials { background: white; border: 2px solid #2563eb; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to IT For Youth Ghana!</h1>
            </div>
            <div class="content">
              <h2>Hi ${user.first_name}!</h2>
              <p>Congratulations! You've successfully enrolled in <strong>${course.title}</strong>.</p>
              
              <div class="credentials">
                <h3>Your Login Credentials:</h3>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Temporary Password:</strong> ${credentials.password}</p>
                <p style="color: #dc2626; font-size: 14px;">⚠️ Please change your password after your first login.</p>
              </div>
              
              <h3>What's Next?</h3>
              <ul>
                <li>Access your courses on our Learning Management System (Moodle)</li>
                <li>Explore job opportunities in our Talent Incubator</li>
                <li>Track your progress in the Student Portal</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${config.app.portalUrl}" class="button">Go to Student Portal</a>
              </div>
              
              <p>If you have any questions, feel free to reply to this email.</p>
              
              <p>Best regards,<br>The IT For Youth Ghana Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} IT For Youth Ghana. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
  
  static teacherWelcome(teacher, course, credentials) {
    return {
      subject: 'Welcome as a Teacher - IT For Youth Ghana',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { background: #f9fafb; padding: 30px; }
            .credentials { background: white; border: 2px solid #2563eb; padding: 20px; margin: 20px 0; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👨‍🏫 Welcome, ${teacher.first_name}!</h1>
            </div>
            <div class="content">
              <p>You've been added as a teacher for <strong>${course.title}</strong> on IT For Youth Ghana's Learning Platform.</p>
              
              <div class="credentials">
                <h3>Your Moodle LMS Access:</h3>
                <p><strong>URL:</strong> ${config.moodle.url}</p>
                <p><strong>Username:</strong> ${credentials.username}</p>
                <p><strong>Password:</strong> ${credentials.password}</p>
                <p style="color: #dc2626; font-size: 14px;">⚠️ Please change your password on first login.</p>
              </div>
              
              <h3>What You Can Do:</h3>
              <ul>
                <li>Upload course materials (PDFs, videos, documents)</li>
                <li>Create quizzes and assignments</li>
                <li>Grade student submissions</li>
                <li>Track student progress and engagement</li>
                <li>Communicate with students via announcements</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${config.moodle.url}" class="button">Access Moodle LMS</a>
              </div>
              
              <p>If you need help getting started, check out the <a href="${config.moodle.url}/help">Moodle Teacher Guide</a>.</p>
              
              <p>Questions? Reply to this email anytime.</p>
              
              <p>Best regards,<br>The IT For Youth Ghana Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} IT For Youth Ghana. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
}

module.exports = EmailTemplates;
```

```javascript
// src/services/email.service.js
const EmailClient = require('../integrations/email/email.client');
const EmailTemplates = require('../integrations/email/templates');
const emailLogRepository = require('../repositories/emailLog.repository');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.client = new EmailClient();
  }
  
  async sendVerificationCode(email, code, firstName) {
    const template = EmailTemplates.verificationCode(firstName, code);
    
    try {
      const result = await this.client.send({
        to: email,
        subject: template.subject,
        html: template.html
      });
      
      // Log email
      await emailLogRepository.create({
        toEmail: email,
        subject: template.subject,
        template: 'verification_code',
        status: 'sent',
        providerId: result.messageId,
        sentAt: new Date()
      });
      
      return result;
      
    } catch (error) {
      // Log failure
      await emailLogRepository.create({
        toEmail: email,
        subject: template.subject,
        template: 'verification_code',
        status: 'failed',
        errorMessage: error.message
      });
      
      throw error;
    }
  }
  
  async sendWelcomeEmail(user, course) {
    const template = EmailTemplates.welcomeEmail(user, course, {
      password: user.temp_password
    });
    
    try {
      const result = await this.client.send({
        to: user.email,
        subject: template.subject,
        html: template.html
      });
      
      await emailLogRepository.create({
        userId: user.id,
        toEmail: user.email,
        subject: template.subject,
        template: 'welcome',
        status: 'sent',
        providerId: result.messageId,
        sentAt: new Date()
      });
      
      return result;
      
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      // Don't throw - email failure shouldn't block enrollment
      return null;
    }
  }
  
  async sendTeacherWelcome(teacher, course, credentials) {
    const template = EmailTemplates.teacherWelcome(teacher, course, credentials);
    
    try {
      const result = await this.client.send({
        to: teacher.email,
        subject: template.subject,
        html: template.html
      });
      
      await emailLogRepository.create({
        userId: teacher.id,
        toEmail: teacher.email,
        subject: template.subject,
        template: 'teacher_welcome',
        status: 'sent',
        providerId: result.messageId,
        sentAt: new Date()
      });
      
      return result;
      
    } catch (error) {
      logger.error('Failed to send teacher welcome email:', error);
      return null;
    }
  }
}

module.exports = new EmailService();
```

---

## 10. Configuration

```javascript
// src/config/index.js
require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
  
  app: {
    name: 'IT For Youth Ghana API',
    portalUrl: process.env.PORTAL_URL || 'http://localhost:3001',
    mainSiteUrl: process.env.MAIN_SITE_URL || 'https://itforyouthghana.org'
  },
  
  database: {
    url: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    }
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: {
      courseList: 3600, // 1 hour
      courseDetails: 3600,
      userEnrollments: 900, // 15 minutes
      stats: 3600,
      session: 604800 // 7 days
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d',
    tempExpiresIn: '30m'
  },
  
  moodle: {
    url: process.env.MOODLE_URL,
    token: process.env.MOODLE_TOKEN
  },
  
  paystack: {
    secretKey: process.env.PAYSTACK_SECRET_KEY,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY,
    callbackUrl: process.env.PAYSTACK_CALLBACK_URL
  },
  
  incubator: {
    url: process.env.INCUBATOR_URL,
    internalSecret: process.env.INCUBATOR_INTERNAL_SECRET
  },
  
  sso: {
    secret: process.env.SSO_SECRET, // Shared with Incubator & Moodle
    expiresIn: '5m' // Short-lived for security
  },
  
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    fromName: process.env.EMAIL_FROM_NAME || 'IT For Youth Ghana',
    fromAddress: process.env.EMAIL_FROM_ADDRESS
  },
  
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    adminChatIds: (process.env.ADMIN_CHAT_IDS || '').split(',').filter(Boolean)
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
    credentials: true
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // requests per window
  }
};

// Validate required config
const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'SSO_SECRET',
  'MOODLE_URL',
  'MOODLE_TOKEN',
  'PAYSTACK_SECRET_KEY'
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = config;
```

```javascript
// src/config/database.js
const { Pool } = require('pg');
const config = require('./index');
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: config.database.url,
  min: config.database.pool.min,
  max: config.database.pool.max
});

pool.on('error', (err) => {
  logger.error('Unexpected database error:', err);
  process.exit(-1);
});

module.exports = pool;
```

```javascript
// src/database/client.js
const pool = require('../config/database');
const logger = require('../utils/logger');

async function connectDatabase() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    logger.info('Database connected successfully at', result.rows[0].now);
    
    return pool;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  
  logger.debug('Executed query', { text, duration, rows: result.rowCount });
  
  return result;
}

module.exports = {
  connectDatabase,
  query,
  pool
};
```

---

This completes the integration layer with production-ready implementations of:
- ✅ Moodle API client & service
- ✅ Paystack payment integration
- ✅ Incubator user sync
- ✅ Email service with templates
- ✅ Centralized configuration
- ✅ Database client with connection pooling

All services are:
- Testable (can be mocked)
- Have proper error handling
- Include logging
- Follow consistent patterns

Want me to add validators, database migrations, or the Telegram bot code next?
