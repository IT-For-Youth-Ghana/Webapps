# Frontend Hooks vs Backend API - Comparison & Coverage Analysis

**Last Updated:** February 7, 2026

## Overview

This document compares the frontend React hooks with the available backend API endpoints to ensure complete coverage and identify any gaps or missing functionality.

---

## 1. Authentication Module (`/auth`)

### Backend Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/auth/register/start` | POST | Start registration (send verification code) | ⚠️ PARTIAL |
| `/auth/register/verify` | POST | Verify email with code | ⚠️ PARTIAL |
| `/auth/register/complete` | POST | Complete registration with password | ⚠️ PARTIAL |
| `/auth/login` | POST | User login | ✅ COVERED |
| `/auth/logout` | POST | User logout | ✅ COVERED |
| `/auth/refresh` | POST | Refresh authentication token | ❌ MISSING |
| `/auth/forgot-password` | POST | Request password reset | ❌ MISSING |
| `/auth/reset-password` | POST | Reset password with token | ❌ MISSING |
| `/auth/change-password` | POST | Change password (authenticated) | ❌ MISSING |

### Frontend Hooks

- `useAuth()` - Basic login/logout and registration
- Located in: `hooks/auth-context.tsx`

### Coverage Status: ⚠️ PARTIAL (5/9 endpoints)

### Gaps to Address

1. **`useRefreshToken()`** - Hook to refresh expired tokens
2. **`useForgotPassword()`** - Hook to request password reset
3. **`useResetPassword()`** - Hook to reset password with token
4. **`useChangePassword()`** - Hook to change password when authenticated
5. **Detailed registration flow** - Split into separate steps (start → verify → complete)

---

## 2. User Module (`/users`)

### Backend Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/users/profile` | GET | Get current user profile | ✅ COVERED |
| `/users/profile` | PUT | Update user profile | ✅ COVERED |
| `/users/notifications` | GET | Get user notifications | ✅ COVERED |
| `/users/notifications/:id/read` | PUT | Mark notification as read | ✅ COVERED |
| `/users/notifications/read-all` | PUT | Mark all notifications as read | ✅ COVERED |
| `/users/` | GET | List all users (admin) | ❌ NOT NEEDED |
| `/users/stats` | GET | Get user statistics (admin) | ❌ NOT NEEDED |
| `/users/:id` | GET | Get user by ID (admin) | ❌ NOT NEEDED |
| `/users/:id/suspend` | PUT | Suspend user (admin) | ❌ NOT NEEDED |
| `/users/:id/activate` | PUT | Activate user (admin) | ❌ NOT NEEDED |

### Frontend Hooks

- `useProfile()` - Get and update profile
- `useNotifications()` - Get and manage notifications
- Located in: `hooks/use-user.ts`

### Coverage Status: ✅ COMPLETE (5/5 user endpoints needed)

---

## 3. Course Module (`/courses`)

### Backend Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/courses` | GET | List all courses (paginated, filterable) | ✅ COVERED |
| `/courses/categories` | GET | Get course categories | ✅ COVERED |
| `/courses/popular` | GET | Get popular courses | ✅ COVERED |
| `/courses/:id` | GET | Get course details | ✅ COVERED |
| `/courses/:id/create` | POST | Create course (admin) | ❌ NOT NEEDED |
| `/courses/:id/update` | PUT | Update course (admin) | ❌ NOT NEEDED |
| `/courses/:id/delete` | DELETE | Delete course (admin) | ❌ NOT NEEDED |
| `/courses/:id/reviews` | GET | Get course reviews | ❌ MISSING |

### Frontend Hooks

- `useCourses()` - List courses with filters
- `useCourse()` - Get course details
- `useCategories()` - Get categories
- `usePopularCourses()` - Get popular courses
- Located in: `hooks/use-courses.ts`

### Coverage Status: ✅ COMPLETE (4/4 student-facing endpoints)

### Optional Enhancement

- **`useCourseReviews()`** - Hook to fetch course reviews (if needed)

---

## 4. Enrollment Module (`/enrollments`)

### Backend Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/enrollments` | GET | Get user's enrollments | ✅ COVERED |
| `/enrollments` | POST | Create enrollment (enroll in course) | ✅ COVERED |
| `/enrollments/:id` | GET | Get enrollment details | ✅ COVERED |
| `/enrollments/:id/progress/:moduleId` | PUT | Update progress on module | ✅ COVERED |
| `/enrollments/:id/drop` | PUT | Drop course | ✅ COVERED |
| `/enrollments/:id/certificate` | GET | Download certificate | ✅ COVERED |
| `/enrollments/admin/stats` | GET | Get enrollment stats (admin) | ❌ NOT NEEDED |
| `/enrollments/course/:courseId` | GET | Get course enrollments (admin) | ❌ NOT NEEDED |

### Frontend Hooks

- `useMyEnrollments()` - Get user's enrollments
- `useEnrollment()` - Get enrollment details and update progress
- `useEnroll()` - Enroll in course
- `useGetCertificate()` - Get certificate
- Located in: `hooks/use-enrollments.ts`

### Coverage Status: ✅ COMPLETE (6/6 student-facing endpoints)

---

## 5. Payment Module (`/payments`)

### Backend Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/payments/callback` | GET | Paystack payment callback | ⚠️ PARTIAL |
| `/payments/webhook` | POST | Paystack webhook handler | ⚠️ PARTIAL |
| `/payments/initialize` | POST | Initialize payment | ✅ COVERED |
| `/payments/verify/:reference` | GET | Verify payment | ✅ COVERED |
| `/payments` | GET | Get payment history | ✅ COVERED |
| `/payments/:id` | GET | Get payment details | ✅ COVERED |
| `/payments/:id/retry` | POST | Retry failed payment | ✅ COVERED |
| `/payments/history` | GET | Alternative history endpoint | ⚠️ DUPLICATE |
| `/payments/admin/stats` | GET | Revenue stats (admin) | ❌ NOT NEEDED |
| `/payments/admin/all` | GET | All payments (admin) | ❌ NOT NEEDED |

### Frontend Hooks

- `usePayments()` - Get payment history
- `useInitializePayment()` - Initialize payment
- `useVerifyPayment()` - Verify payment
- `useRetryPayment()` - Retry failed payment
- `usePaymentDetails()` - Get payment details
- Located in: `hooks/use-payments.ts`

### Coverage Status: ✅ COMPLETE (5/5 student-facing endpoints)

**Note:** Callback and webhook are handled server-side and don't require frontend hooks

---

## 6. SSO Module (`/sso`) 

### Backend Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/sso/moodle/login` | POST | Moodle SSO login | ❌ NOT IMPLEMENTED |
| `/sso/moodle/callback` | GET | Moodle SSO callback | ❌ NOT IMPLEMENTED |
| `/sso/logout` | POST | SSO logout | ❌ NOT IMPLEMENTED |

### Frontend Hooks

- None currently

### Coverage Status: ❌ NOT IMPLEMENTED

### Gap to Address

- **`useSSO()` or specific SSO hooks** - For Moodle integration (if needed)

---

## Summary Table

| Module | Endpoints Available | Endpoints Covered | Coverage % | Status |
|--------|-------------------|------------------|-----------|--------|
| Auth | 9 | 2 | 22% | ⚠️ PARTIAL |
| Users | 5 | 5 | 100% | ✅ COMPLETE |
| Courses | 4 | 4 | 100% | ✅ COMPLETE |
| Enrollments | 6 | 6 | 100% | ✅ COMPLETE |
| Payments | 5 | 5 | 100% | ✅ COMPLETE |
| SSO | 3 | 0 | 0% | ❌ MISSING |
| **TOTAL** | **32** | **22** | **69%** | ⚠️ |

---

## Priority Recommendations

### 🔴 HIGH PRIORITY

1. **Complete Auth Flow** - Add hooks for:
   - `useRefreshToken()` - Token refresh
   - `useForgotPassword()` - Password reset request
   - `useResetPassword()` - Password reset completion
   - `useChangePassword()` - Password change

2. **Multi-step Registration** - Refactor registration to handle:
   - Step 1: Email verification
   - Step 2: Email code verification
   - Step 3: Account creation with password

### 🟡 MEDIUM PRIORITY

3. **SSO Integration** - If Moodle integration is active:
   - `useSSOMoodleLogin()` - Moodle single sign-on
   - `useSSOLogout()` - SSO logout

### 🟢 LOW PRIORITY

4. **Course Reviews** - If needed:
   - `useCourseReviews()` - Fetch and display reviews
   - `useSubmitReview()` - Submit course review

---

## Implementation Roadmap

### Phase 1: Complete Authentication (Week 1)
- [ ] Create `use-auth-flow.ts` for multi-step registration
- [ ] Create `use-password.ts` for password reset/change
- [ ] Update `auth-context.tsx` with new methods
- [ ] Update login flow in pages

### Phase 2: Add Missing Password Management (Week 1)
- [ ] Implement `useRefreshToken()` interceptor
- [ ] Implement `useForgotPassword()`
- [ ] Implement `useResetPassword()`
- [ ] Implement `useChangePassword()`

### Phase 3: SSO Integration (Week 2 - if needed)
- [ ] Create `use-sso.ts`
- [ ] Implement Moodle SSO login
- [ ] Update auth context with SSO fallback
- [ ] Add SSO error handling

---

## Notes

- ✅ **Covered**: Hook exists and properly handles the endpoint
- ⚠️ **Partial**: Hook exists but may need enhancement or endpoint not fully utilized
- ❌ **Missing**: Endpoint exists on backend but no hook yet
- ❌ **Not Needed**: Endpoint is admin-only or not needed for student portal

---

## File Structure

```
hooks/
├── index.ts                      # Re-exports all hooks
├── auth-context.tsx             # Auth context and login/logout
├── use-user.ts                  # Profile and notifications
├── use-courses.ts               # Course browsing
├── use-enrollments.ts           # Enrollment management
├── use-payments.ts              # Payment processing
├── use-auth-flow.ts             # [TODO] Multi-step auth
├── use-password.ts              # [TODO] Password reset/change
└── use-sso.ts                   # [TODO] SSO integration
```

---

## Next Steps

1. Review this document with the team
2. Prioritize which missing features to implement
3. Create tasks for each phase
4. Update hooks as needed
5. Test thoroughly with backend
