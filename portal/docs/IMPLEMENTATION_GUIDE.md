# BullMQ Queue System - Implementation Guide

## Overview
This guide covers the complete setup and implementation of the BullMQ job queue system for background task processing.

---

## 1. Installation

### Install BullMQ

```bash
npm install bullmq
```

### Dependencies
BullMQ requires Redis (which you already have configured):
- `bullmq` - Job queue library
- `ioredis` - Redis client (dependency of bullmq)

---

## 2. Environment Variables

Add these to your `.env` file:

```env
# Queue System Configuration
EMAIL_QUEUE_CONCURRENCY=5
SYNC_QUEUE_CONCURRENCY=2
PAYMENT_QUEUE_CONCURRENCY=3
ENROLLMENT_QUEUE_CONCURRENCY=3
NOTIFICATION_QUEUE_CONCURRENCY=5
CLEANUP_QUEUE_CONCURRENCY=1

# Job Settings (optional - defaults are fine)
JOB_MAX_RETRIES=3
JOB_RETRY_DELAY=2000
```

Your existing Redis config variables are already sufficient:
```env
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # if needed
```

---

## 3. File Structure

All queue-related files are now in `/src/queues/`:

```
src/queues/
├── config.js                       # Queue configuration
├── manager.js                      # Queue manager (singleton)
├── index.js                        # Initialization entry point
├── processors/
│   └── email.processor.js          # Email job processors
└── services/
    └── email.queue.js              # High-level email queue API
```

---

## 4. Update Main Files

### 4.1 Update `src/server.js`

Replace the existing `server.js` with `server-updated.js`, or apply these changes:

```javascript
// Add this import at the top
import { initializeQueues, shutdownQueues } from './queues/index.js';

// In startServer(), add AFTER Redis initialization:
logger.info('🔌 Initializing queue system...');
await initializeQueues();

// In gracefulShutdown(), add BEFORE closing database:
logger.info('🔄 Shutting down queue system...');
await shutdownQueues();
```

### 4.2 Update `src/routes/index.js`

Add queue admin routes:

```javascript
import queueAdminRoutes from '../modules/admin/queue-admin.routes.js';

// Add this with other admin routes
router.use('/admin/queues', queueAdminRoutes);
```

---

## 5. Update Existing Services

### 5.1 User Service (`src/modules/user/user.service.js`)

**In `startRegistration()` method:**

```javascript
// OLD:
await emailService.sendVerificationCode(email, code, firstName);

// NEW:
const emailQueue = (await import('../../queues/services/email.queue.js')).default;
await emailQueue.sendVerificationCode(email, code, firstName);
```

### 5.2 Auth Service (`src/modules/shared/auth/auth.service.js`)

**In `requestPasswordReset()` method:**

```javascript
// OLD:
await emailService.sendPasswordReset(email, resetToken, user.firstName);

// NEW:
const emailQueue = (await import('../../queues/services/email.queue.js')).default;
await emailQueue.sendPasswordReset(email, resetToken, user.firstName);
```

### 5.3 Enrollment Service (`src/modules/enrollment/enrollment.service.js`)

**In `completeEnrollment()` method:**

```javascript
// OLD:
await emailService.sendWelcomeEmail(user, course);

// NEW:
const emailQueue = (await import('../../queues/services/email.queue.js')).default;
await emailQueue.sendWelcomeEmail(user.id, course.id);
```

### 5.4 Payment Service (`src/modules/payment/payment.service.js`)

**In `verifyPayment()` method:**

```javascript
// OLD:
await emailService.sendPaymentReceipt(payment.user, payment, payment.enrollment.course);

// NEW:
const emailQueue = (await import('../../queues/services/email.queue.js')).default;
await emailQueue.sendPaymentReceipt(payment.user.id, payment.id, payment.enrollment.course.id);
```

---

## 6. Testing

### 6.1 Start the Server

```bash
npm run dev
```

You should see:
```
✅ Queue created: email
✅ Worker created: email (concurrency: 5)
✅ Queue events listener created: email
✅ Queue system initialized with 1 queues
📋 Active queues: email
```

### 6.2 Test Email Queue

Register a new user - the verification email should be queued instead of sent synchronously.

**Check queue stats:**
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:5000/api/admin/queues/stats
```

**Response:**
```json
{
  "success": true,
  "message": "Queue statistics retrieved successfully",
  "data": {
    "email": {
      "name": "email",
      "waiting": 0,
      "active": 0,
      "completed": 5,
      "failed": 0,
      "delayed": 0,
      "paused": false,
      "total": 5
    }
  }
}
```

### 6.3 Monitor Jobs

**Get completed jobs:**
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:5000/api/admin/queues/email/jobs?status=completed"
```

**Get failed jobs:**
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  "http://localhost:5000/api/admin/queues/email/jobs?status=failed"
```

### 6.4 Retry Failed Jobs

If an email fails (e.g., SMTP is down), retry it:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:5000/api/admin/queues/email/job/JOB_ID/retry
```

Or retry all failed jobs:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit": 100}' \
  http://localhost:5000/api/admin/queues/email/jobs/retry-failed
```

---

## 7. Admin Endpoints

All endpoints require admin authentication.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/queues/health` | GET | Queue system health check |
| `/api/admin/queues/stats` | GET | All queue statistics |
| `/api/admin/queues/:name/stats` | GET | Specific queue stats |
| `/api/admin/queues/:name/jobs` | GET | List jobs (by status) |
| `/api/admin/queues/:name/job/:id` | GET | Get job details |
| `/api/admin/queues/:name/job/:id/retry` | POST | Retry a job |
| `/api/admin/queues/:name/job/:id` | DELETE | Remove a job |
| `/api/admin/queues/:name/pause` | POST | Pause queue processing |
| `/api/admin/queues/:name/resume` | POST | Resume queue processing |
| `/api/admin/queues/:name/clean` | POST | Clean old jobs |
| `/api/admin/queues/:name/jobs/retry-failed` | POST | Retry all failed jobs |

---

## 8. Performance Improvements

### Before (Synchronous Email):
```
Registration Request:
├── Validate input (10ms)
├── Create user (50ms)
├── Send email (2000-5000ms) ← BLOCKING!
└── Return response

Total: ~2-5 seconds
```

### After (Queued Email):
```
Registration Request:
├── Validate input (10ms)
├── Create user (50ms)
├── Queue email (20ms) ← FAST!
└── Return response

Total: ~80ms

Background:
└── Email sent (2000ms) ← Doesn't block user
```

**Result: 25-60x faster API responses!**

---

## 9. Monitoring & Alerts

### Check Queue Health

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:5000/api/admin/queues/health
```

**Healthy response:**
```json
{
  "healthy": true,
  "issues": [],
  "stats": {
    "email": {
      "waiting": 5,
      "active": 2,
      "completed": 1234,
      "failed": 3
    }
  }
}
```

**Unhealthy response:**
```json
{
  "healthy": false,
  "issues": [
    "email: 150 failed jobs",
    "email: 1200 waiting jobs"
  ],
  "stats": {...}
}
```

### Set Up Alerts

Monitor these metrics:
- **Failed jobs > 10** → Investigate immediately
- **Waiting jobs > 100** → May need more workers
- **Active jobs stuck** → Workers may be stalled

---

## 10. Troubleshooting

### Problem: Jobs not processing

**Check:**
1. Is Redis running? `redis-cli ping` should return `PONG`
2. Are workers started? Check logs for "Worker created"
3. Is queue paused? `GET /api/admin/queues/email/stats`

### Problem: Emails still slow

**Check:**
- Are you calling `emailService` directly instead of `emailQueue`?
- Check the migration guide for proper usage

### Problem: Jobs failing

**Check:**
1. View failed jobs: `GET /api/admin/queues/email/jobs?status=failed`
2. Check error messages in job details
3. Common causes:
   - SMTP server down
   - Invalid email templates
   - Database records not found

### Problem: Memory usage high

**Solution:**
- Clean old jobs regularly
- Adjust `removeOnComplete` and `removeOnFail` settings in config
- Run: `POST /api/admin/queues/email/clean`

---

## 11. Next Steps (Phase 2+)

After email queues are working well, implement:

### Phase 2: Payment Verification Queue
- Background payment polling
- Webhook backup verification
- Automatic enrollment completion

### Phase 3: External System Sync
- Scheduled Moodle course sync
- Incubator profile sync
- User enrollment sync

### Phase 4: Scheduled Tasks
- Cleanup expired verification codes
- Send course reminders
- Generate reports

---

## 12. Production Checklist

Before deploying to production:

- [ ] Redis is running and configured
- [ ] Environment variables are set
- [ ] Queue admin routes are protected (admin only)
- [ ] Monitoring is set up (health checks)
- [ ] Alerts configured for failed jobs
- [ ] Tested with production SMTP settings
- [ ] Graceful shutdown works correctly
- [ ] Load tested with high volume
- [ ] Backup strategy for job data
- [ ] Documentation updated

---

## 13. Support

**Logs:**
```bash
# View queue-related logs
pm2 logs | grep -i queue

# View email job logs
pm2 logs | grep -i "email job"
```

**Metrics:**
- Queue stats: `/api/admin/queues/stats`
- Health check: `/api/admin/queues/health`
- Job details: `/api/admin/queues/email/job/:id`

---

## Summary

✅ **Fast API responses** - No more waiting for SMTP
✅ **Automatic retries** - Failed emails retry automatically
✅ **Better reliability** - Enrollment succeeds even if email fails
✅ **Monitoring** - Full visibility into job processing
✅ **Manual control** - Pause/resume/retry from admin panel
✅ **Scalability** - Process hundreds of emails concurrently
✅ **Future-ready** - Easy to add more job types

**Performance gain: 25-60x faster API responses!**
