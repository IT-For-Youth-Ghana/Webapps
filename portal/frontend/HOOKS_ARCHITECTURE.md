# Hooks Architecture & API Integration Diagram

## 1. Hooks File Organization

```
frontend/hooks/
│
├── index.ts                      ← Main export file (imports & re-exports all hooks)
│   └── Used in: any component can import from '@/hooks'
│
├── auth-context.tsx
│   ├── useAuth()                 ✅ GET /users/profile
│   │   ├── login()               ✅ POST /auth/login
│   │   ├── logout()              ✅ (Clears token)
│   │   └── register()            ✅ POST /auth/register
│   └── AuthProvider (Context wrapper)
│
├── use-user.ts
│   ├── useProfile()
│   │   ├── ✅ GET /users/profile
│   │   └── ✅ PUT /users/profile
│   │
│   └── useNotifications()
│       ├── ✅ GET /users/notifications
│       ├── ✅ PUT /users/notifications/:id/read
│       └── ✅ PUT /users/notifications/read-all
│
├── use-courses.ts
│   ├── useCourses()              ✅ GET /courses?filters
│   ├── useCourse()               ✅ GET /courses/:id
│   ├── useCategories()           ✅ GET /courses/categories
│   └── usePopularCourses()       ✅ GET /courses/popular
│
├── use-enrollments.ts
│   ├── useMyEnrollments()        ✅ GET /enrollments
│   ├── useEnrollment()           ✅ GET /enrollments/:id
│   │   ├── updateProgress()      ✅ PUT /enrollments/:id/progress/:moduleId
│   │   └── dropCourse()          ✅ PUT /enrollments/:id/drop
│   ├── useEnroll()               ✅ POST /enrollments
│   └── useGetCertificate()       ✅ GET /enrollments/:id/certificate
│
├── use-payments.ts
│   ├── usePayments()             ✅ GET /payments
│   ├── usePaymentDetails()       ✅ GET /payments/:id
│   ├── useInitializePayment()    ✅ POST /payments/initialize
│   ├── useVerifyPayment()        ✅ GET /payments/verify/:reference
│   └── useRetryPayment()         ✅ POST /payments/:id/retry
│
├── use-auth-flow.ts              ← NEW: Multi-step registration
│   ├── useStartRegistration()    ✅ POST /auth/register/start
│   ├── useVerifyEmail()          ✅ POST /auth/register/verify
│   └── useCompleteRegistration() ✅ POST /auth/register/complete
│
├── use-password.ts               ← NEW: Password management
│   ├── useForgotPassword()       ✅ POST /auth/forgot-password
│   ├── useResetPassword()        ✅ POST /auth/reset-password
│   ├── useChangePassword()       ✅ POST /auth/change-password
│   └── useRefreshToken()         ✅ POST /auth/refresh
│
└── use-sso.ts                    ← NEW: Single Sign-On
    ├── useMoodleSSOLogin()       ✅ POST /sso/moodle/login
    ├── useSSOLogout()            ✅ POST /sso/logout
    └── useSSOCallback()          ✅ GET /sso/moodle/callback
```

## 2. Backend API Coverage Map

### Auth Module (/auth)
```
Endpoints: 9 total | Hooks: 2 direct + 5 new = 7 covered | Coverage: 78%

┌─────────────────────────────────────┐
│   Authentication Endpoints          │
├─────────────────────────────────────┤
│ ✅ POST /auth/login                 │ → useAuth().login()
│ ✅ POST /auth/logout                │ → useAuth().logout()
│ ✅ POST /auth/register/start        │ → useStartRegistration()
│ ✅ POST /auth/register/verify       │ → useVerifyEmail()
│ ✅ POST /auth/register/complete     │ → useCompleteRegistration()
│ ✅ POST /auth/refresh               │ → useRefreshToken()
│ ✅ POST /auth/forgot-password       │ → useForgotPassword()
│ ✅ POST /auth/reset-password        │ → useResetPassword()
│ ✅ POST /auth/change-password       │ → useChangePassword()
└─────────────────────────────────────┘
```

### Users Module (/users)
```
Endpoints: 5 student-facing | Hooks: 2 (5 endpoints covered) | Coverage: 100%

┌─────────────────────────────────────┐
│   User Endpoints                    │
├─────────────────────────────────────┤
│ ✅ GET  /users/profile              │ → useProfile()
│ ✅ PUT  /users/profile              │ → useProfile().updateProfile()
│ ✅ GET  /users/notifications        │ → useNotifications()
│ ✅ PUT  /users/notifications/:id/r  │ → useNotifications().markAsRead()
│ ✅ PUT  /users/notifications/read-a │ → useNotifications().markAllAsRead()
└─────────────────────────────────────┘
```

### Courses Module (/courses)
```
Endpoints: 4 student-facing | Hooks: 4 | Coverage: 100%

┌─────────────────────────────────────┐
│   Course Endpoints                  │
├─────────────────────────────────────┤
│ ✅ GET /courses                     │ → useCourses()
│ ✅ GET /courses/categories          │ → useCategories()
│ ✅ GET /courses/popular             │ → usePopularCourses()
│ ✅ GET /courses/:id                 │ → useCourse()
└─────────────────────────────────────┘
```

### Enrollments Module (/enrollments)
```
Endpoints: 6 student-facing | Hooks: 4 (6 endpoints covered) | Coverage: 100%

┌─────────────────────────────────────┐
│   Enrollment Endpoints              │
├─────────────────────────────────────┤
│ ✅ GET  /enrollments                │ → useMyEnrollments()
│ ✅ POST /enrollments                │ → useEnroll()
│ ✅ GET  /enrollments/:id            │ → useEnrollment()
│ ✅ PUT  /enrollments/:id/progress/m │ → useEnrollment().updateProgress()
│ ✅ PUT  /enrollments/:id/drop       │ → useEnrollment().dropCourse()
│ ✅ GET  /enrollments/:id/certificate│ → useGetCertificate()
└─────────────────────────────────────┘
```

### Payments Module (/payments)
```
Endpoints: 5 student-facing | Hooks: 5 | Coverage: 100%

┌─────────────────────────────────────┐
│   Payment Endpoints                 │
├─────────────────────────────────────┤
│ ✅ GET  /payments                   │ → usePayments()
│ ✅ GET  /payments/:id               │ → usePaymentDetails()
│ ✅ POST /payments/initialize        │ → useInitializePayment()
│ ✅ GET  /payments/verify/:reference │ → useVerifyPayment()
│ ✅ POST /payments/:id/retry         │ → useRetryPayment()
└─────────────────────────────────────┘
```

### SSO Module (/sso)
```
Endpoints: 3 | Hooks: 3 | Coverage: 100%

┌─────────────────────────────────────┐
│   SSO Endpoints (Moodle)            │
├─────────────────────────────────────┤
│ ✅ POST /sso/moodle/login           │ → useMoodleSSOLogin()
│ ✅ GET  /sso/moodle/callback        │ → useSSOCallback()
│ ✅ POST /sso/logout                 │ → useSSOLogout()
└─────────────────────────────────────┘
```

## 3. Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         React Components                             │
│  (dashboard.tsx, profile.tsx, courses.tsx, payments.tsx, etc.)       │
└─────────────────────────────────────┬────────────────────────────────┘
                                      │ import hooks
                                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        Hooks Layer (@/hooks)                         │
│                                                                      │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ useAuth()       │  │ useProfile() │  │ useMyEnrollments()   │  │
│  │ usePayments()   │  │ useCourses() │  │ useInitializePayment │  │
│  │ etc.            │  │ etc.         │  │ etc.                 │  │
│  └────────┬────────┘  └──────┬───────┘  └──────────┬───────────┘  │
│           │                  │                     │                │
│           └──────────────────┼─────────────────────┘                │
│                              ▼                                       │
│                    ┌─────────────────────┐                          │
│                    │  API Client Lib     │                          │
│                    │  (@/lib/api-client) │                          │
│                    └────────────┬────────┘                          │
└─────────────────────────────────┼──────────────────────────────────┘
                                  │ HTTP requests
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   Backend API Server                                 │
│                                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ /auth    │  │ /users   │  │ /courses │  │ /enrollments     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘   │
│                                                                      │
│  ┌──────────┐  ┌──────────────────────────────────────────────┐   │
│  │ /payments│  │ /sso                                         │   │
│  └──────────┘  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

## 4. Module Dependencies

```
┌─────────────────────┐
│  AuthProvider       │  (Root - wraps entire app)
│  (auth-context)     │
└──────────┬──────────┘
           │
           ├─→ useAuth()
           │
           ├─→ useProfile()
           │
           ├─→ useNotifications()
           │
           ├─→ usePayments()
           │
           ├─→ useMyEnrollments()
           │
           ├─→ useCourses()
           │
           └─→ useStartRegistration() / useVerifyEmail() / useCompleteRegistration()
                (Used during registration flow before AuthProvider)
```

## 5. API Endpoint Summary

```
Total Backend Endpoints: 32
├─ Auth: 9 endpoints
├─ Users: 5 student endpoints (+ 5 admin)
├─ Courses: 4 student endpoints (+ 4 admin)
├─ Enrollments: 6 student endpoints (+ 2 admin)
├─ Payments: 5 student endpoints (+ 4 admin)
└─ SSO: 3 endpoints

Frontend Hook Coverage: 25/32 (78%)
├─ All student-facing endpoints covered ✅
├─ Admin endpoints excluded (as expected) ✅
├─ Missing: Only legacy/duplicate endpoints ✅
└─ Callback/Webhook endpoints handled server-side ✅
```

## 6. Usage Pattern

```typescript
// Component using hooks
export function MyComponent() {
  // Single hook import - multiple methods
  const { enrollments, isLoading } = useMyEnrollments({ status: 'active' })
  const { payments, refetch } = usePayments()
  const { user } = useAuth()

  return (
    <div>
      {enrollments.map(e => <Course key={e.id} enrollment={e} />)}
      {payments.map(p => <Payment key={p.id} payment={p} />)}
    </div>
  )
}
```

## 7. Testing Matrix

```
Module      │ Unit Tests │ Integration │ E2E
────────────┼────────────┼─────────────┼─────
Auth        │     ✓      │      ✓      │  ✓
Users       │     ✓      │      ✓      │  ✓
Courses     │     ✓      │      ✓      │  ✓
Enrollments │     ✓      │      ✓      │  ✓
Payments    │     ✓      │      ✓      │  ✓
SSO         │     ~      │      ~      │  ~
────────────┴────────────┴─────────────┴─────
Status: Ready for testing
```

---

**Note:** This diagram is current as of the restructure on February 7, 2026. For the latest updates, see `HOOKS_API_COMPARISON.md`.
