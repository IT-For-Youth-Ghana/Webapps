# Frontend Implementation Plan

**Priority Level:** CRITICAL - Foundation pages missing  
**Estimated Total Time:** 27-42 hours  
**Start Date:** [Today]  
**Backend Status:** All APIs ready ✅

---

## Phase 1: Core Student Journey (CRITICAL - 13-21 hours)

### ✅ Objective
Enable the complete user journey from registration through course enrollment to payment.

### Tasks

#### Task 1.1: Create Registration Flow Pages (3 pages, 4-6 hours)

**Overview:** Multi-step registration form for new users

**Step 1: `/frontend/app/register/page.tsx` OR `/frontend/app/register/step1/page.tsx`**

```typescript
// Purpose: Collect email and password
// Backend: POST /auth/register/start
// Form Fields:
//   - Email address
//   - Password
//   - Confirm password
//   - Password strength indicator
//   - Terms & conditions checkbox
// Actions:
//   - Validate email format
//   - Validate password strength
//   - Submit to backend
//   - Navigate to step 2

// Hooks needed:
// - useStartRegistration() - NEW
```

**Step 2: `/frontend/app/register/step2/page.tsx`**

```typescript
// Purpose: Verify email with OTP
// Backend: POST /auth/register/verify
// Form Fields:
//   - 6-digit OTP input
//   - Resend code button
//   - Countdown timer (60s)
// Actions:
//   - Validate OTP format
//   - Submit OTP to backend
//   - Show validation errors
//   - Navigate to step 3
//   - Handle resend with rate limiting

// Hooks needed:
// - useVerifyRegistrationEmail() - NEW
```

**Step 3: `/frontend/app/register/step3/page.tsx`**

```typescript
// Purpose: Complete profile
// Backend: POST /auth/register/complete
// Form Fields:
//   - First name
//   - Last name
//   - Phone number (optional)
// Actions:
//   - Submit form to backend
//   - Redirect to login or dashboard
//   - Show success message

// Hooks needed:
// - useCompleteRegistration() - NEW
```

**Implementation Checklist:**
- [ ] Create registration form components
- [ ] Implement form validation
- [ ] Add password strength indicator
- [ ] Create OTP input component
- [ ] Implement resend timer logic
- [ ] Create 3 new hooks in `/frontend/hooks/use-auth-flow.ts`
- [ ] Add route guards (prevent if already authenticated)
- [ ] Add form error handling
- [ ] Test with backend endpoints

---

#### Task 1.2: Create Course Browser Page (1 page, 3-4 hours)

**File:** `/frontend/app/(dashboard)/browse/page.tsx`

```typescript
// Purpose: Browse and discover available courses
// Backend: GET /courses, GET /courses/categories, GET /courses/popular
// Features:
//   - Search courses by title/description
//   - Filter by category (dropdown)
//   - Filter by difficulty level
//   - Pagination
//   - Popular courses section
//   - Course cards showing:
//     - Course image/thumbnail
//     - Title
//     - Description (truncated)
//     - Category
//     - Difficulty level
//     - Price
//     - Student count
//     - Rating (if available)
//   - "View Details" button → navigates to /dashboard/courses/:id
//   - "Enroll Now" button → starts enrollment

// Hooks needed:
// - useBrowseCourses(filters) - NEW (GET /courses with filters)
// - useCourseCategories() - NEW (GET /courses/categories)
// - usePopularCourses() - NEW (GET /courses/popular)
```

**UI Components:**
- Search input with debouncing
- Category filter dropdown
- Level filter dropdown
- Course grid layout (responsive)
- Course card component
- Pagination controls
- Empty state message
- Loading skeleton

**Implementation Checklist:**
- [ ] Create search input with debounce
- [ ] Create filter dropdowns
- [ ] Create course card component
- [ ] Create pagination logic
- [ ] Create 3 new hooks for course browsing
- [ ] Integrate with category API
- [ ] Implement search functionality
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test filtering and pagination

---

#### Task 1.3: Create Course Detail Page (1 page, 2-3 hours)

**File:** `/frontend/app/(dashboard)/courses/[courseId]/page.tsx`

```typescript
// Purpose: View full course information before enrolling
// Backend: GET /courses/:id
// Features:
//   - Full course title
//   - Full description
//   - Course thumbnail/image
//   - Instructor information
//   - Pricing
//   - Duration estimate
//   - Difficulty level
//   - Modules/curriculum list (collapsible)
//   - Student count / rating
//   - Requirements list
//   - "Enroll Now" button (if not enrolled)
//   - "Continue Learning" button (if enrolled)
//   - Enrollment status indicator

// Hooks needed:
// - useCourseDetail(courseId) - NEW (GET /courses/:id)
```

**UI Components:**
- Course header with image
- Course metadata section
- Description section
- Curriculum/modules accordion
- Requirements list
- Call-to-action button
- Related courses carousel (optional)

**Implementation Checklist:**
- [ ] Create course detail hook
- [ ] Create page layout
- [ ] Create modules accordion component
- [ ] Add enrollment status detection
- [ ] Implement "Enroll Now" flow
- [ ] Add error handling for invalid courseId
- [ ] Test course detail loading
- [ ] Verify "Continue Learning" button works

---

#### Task 1.4: Create Payment Checkout Page (1 page, 3-5 hours)

**File:** `/frontend/app/(dashboard)/checkout/page.tsx` OR `/frontend/app/(dashboard)/payments/checkout/page.tsx`

```typescript
// Purpose: Process course payment via Paystack
// Backend: POST /payments/initialize, GET /payments/verify/:reference
// Features:
//   - Course summary (name, price, thumbnail)
//   - Payment method selection (Paystack)
//   - Amount display with currency
//   - Discount/promo code field (optional)
//   - Terms acceptance checkbox
//   - "Pay Now" button
//   - Loading state during payment
//   - Redirect to Paystack payment gate
//   - Handle payment callback/redirect
//   - Show payment status (pending/success/failed)
//   - Retry payment option on failure

// Hooks needed:
// - useInitializePayment(courseId) - NEW (POST /payments/initialize)
// - useVerifyPayment(reference) - should exist or NEW
// - usePaymentDetail(paymentId) - NEW (GET /payments/:id)
```

**UI Components:**
- Course summary card
- Payment method selector
- Amount display
- Promo code input
- Payment form (Paystack integration)
- Payment status modal
- Loading spinner

**Implementation Checklist:**
- [ ] Create payment initialization hook
- [ ] Integrate Paystack JS library
- [ ] Create checkout form
- [ ] Implement payment callback handler
- [ ] Add query parameter parsing (courseId)
- [ ] Add success page after payment
- [ ] Implement payment verification
- [ ] Add error handling
- [ ] Test with Paystack sandbox

---

#### Task 1.5: Fix Navigation in Existing Pages (Various, 1-2 hours)

**Changes needed:**

1. **Courses Page** (`/frontend/app/(dashboard)/courses/page.tsx`)
   - Fix course card click → navigate to `/dashboard/courses/:courseId` (currently broken)
   - Fix "Browse Courses" button → navigate to `/dashboard/browse`

2. **Dashboard Topbar** (`/frontend/components/topbar.tsx`)
   - Add link to "Browse Courses" in navigation
   - Add link to "My Courses" in navigation

3. **Sidebar Navigation** (`/frontend/components/sidebar.tsx`)
   - Add "Browse Courses" menu item
   - Update links to use correct routes

**Implementation Checklist:**
- [ ] Update course card click handler
- [ ] Fix Browse Courses button link
- [ ] Update topbar navigation
- [ ] Update sidebar navigation
- [ ] Test all navigation links

---

### ✅ Phase 1 Deliverables

**New Pages:**
1. ✅ `/register/step1` - Registration start
2. ✅ `/register/step2` - Email verification
3. ✅ `/register/step3` - Complete profile
4. ✅ `/dashboard/browse` - Course browser
5. ✅ `/dashboard/courses/:id` - Course detail
6. ✅ `/dashboard/checkout` - Payment checkout

**Fixed Pages:**
1. ✅ `/dashboard/courses` - Fixed navigation
2. ✅ Navigation components - Updated links

**New Hooks:**
1. ✅ `useStartRegistration()` - Register start
2. ✅ `useVerifyRegistrationEmail()` - Email verification
3. ✅ `useCompleteRegistration()` - Complete registration
4. ✅ `useBrowseCourses()` - Browse courses
5. ✅ `useCourseCategories()` - Get categories
6. ✅ `usePopularCourses()` - Get popular courses
7. ✅ `useCourseDetail()` - Get course details
8. ✅ `useInitializePayment()` - Start payment
9. ✅ `useVerifyPayment()` - Verify payment status
10. ✅ `usePaymentDetail()` - Get payment details

---

## Phase 2: User Account Management (5-8 hours)

### ✅ Objective
Enable users to manage their account, passwords, and profile information.

### Tasks

#### Task 2.1: Create Forgot Password Flow (2 pages, 2-3 hours)

**File 1:** `/frontend/app/forgot-password/page.tsx`

```typescript
// Purpose: Request password reset email
// Backend: POST /auth/forgot-password
// Form Fields:
//   - Email address
// Actions:
//   - Validate email
//   - Submit to backend
//   - Show success message
//   - Optionally navigate to confirmation page

// Hooks needed:
// - useForgotPassword() - NEW
```

**File 2:** `/frontend/app/reset-password/page.tsx`

```typescript
// Purpose: Reset password with token
// Backend: POST /auth/reset-password
// Form Fields:
//   - New password
//   - Confirm password
//   - Password strength indicator
// URL Params:
//   - token (from email link)
// Actions:
//   - Validate passwords
//   - Submit with token to backend
//   - Redirect to login on success

// Hooks needed:
// - useResetPassword() - NEW or update existing
```

**Implementation Checklist:**
- [ ] Create forgot password form
- [ ] Create reset password form
- [ ] Create 2 new hooks (or update existing)
- [ ] Add password strength indicator
- [ ] Add email validation
- [ ] Test token parsing from URL
- [ ] Add success/error messaging
- [ ] Test with backend endpoints

---

#### Task 2.2: Create Edit Profile Page (1 page, 2-3 hours)

**File:** `/frontend/app/(dashboard)/profile/edit/page.tsx`

```typescript
// Purpose: Update user profile information
// Backend: PUT /users/profile
// Form Fields:
//   - First name (editable)
//   - Last name (editable)
//   - Email (read-only display)
//   - Phone number (editable)
//   - Avatar upload (optional, if backend supports)
// Actions:
//   - Pre-fill with current user data
//   - Validate form
//   - Submit changes to backend
//   - Show success message
//   - Redirect back to profile page

// Hooks needed:
// - useUpdateProfile() - NEW
```

**UI Components:**
- Form with pre-filled values
- File upload input for avatar (optional)
- Save/Cancel buttons
- Success toast notification
- Error message display

**Implementation Checklist:**
- [ ] Create edit form component
- [ ] Pre-fill with current user data
- [ ] Create update profile hook
- [ ] Add form validation
- [ ] Implement file upload (optional)
- [ ] Add loading state during save
- [ ] Add success/error messaging
- [ ] Test profile update

---

#### Task 2.3: Create Change Password Page (1 page, 1-2 hours)

**File:** `/frontend/app/(dashboard)/profile/change-password/page.tsx`

```typescript
// Purpose: Change account password
// Backend: POST /auth/change-password
// Form Fields:
//   - Current password
//   - New password
//   - Confirm new password
//   - Password strength indicator
// Actions:
//   - Validate current password is provided
//   - Validate new passwords match
//   - Validate password strength
//   - Submit to backend
//   - Show success message
//   - Optionally redirect to profile

// Hooks needed:
// - useChangePassword() - might exist, verify
```

**UI Components:**
- Password input fields with visibility toggle
- Password strength meter
- Submit/Cancel buttons
- Success/error messages

**Implementation Checklist:**
- [ ] Create change password form
- [ ] Add password visibility toggle
- [ ] Create/verify change password hook
- [ ] Add password strength validation
- [ ] Add confirmation validation
- [ ] Add loading state
- [ ] Test password change

---

### ✅ Phase 2 Deliverables

**New Pages:**
1. ✅ `/forgot-password` - Request password reset
2. ✅ `/reset-password` - Reset password
3. ✅ `/dashboard/profile/edit` - Edit profile
4. ✅ `/dashboard/profile/change-password` - Change password

**Updated Pages:**
1. ✅ `/dashboard/profile` - Add navigation links to edit/change password

**New Hooks:**
1. ✅ `useForgotPassword()` - Request reset
2. ✅ `useResetPassword()` - Complete reset
3. ✅ `useUpdateProfile()` - Update profile
4. ✅ `useChangePassword()` - Change password (verify if exists)

---

## Phase 3: Enhanced Features (9-13 hours)

### ✅ Objective
Add advanced features for better user experience and course completion.

### Tasks

#### Task 3.1: Create Enrollment Detail Page (1 page, 3-4 hours)

**File:** `/frontend/app/(dashboard)/enrollments/[enrollmentId]/page.tsx`

```typescript
// Purpose: View enrollment details and complete course modules
// Backend: GET /enrollments/:id, PUT /enrollments/:id/progress/:moduleId
// Features:
//   - Course title and description
//   - Progress percentage with visual bar
//   - Module list with completion status
//   - Module content viewer (if available)
//   - "Mark Module Complete" button
//   - "Drop Course" button (with confirmation)
//   - Time spent tracking (if available)
//   - Completion date display (if completed)

// Hooks needed:
// - useEnrollmentDetail(enrollmentId) - NEW
// - useUpdateProgress(enrollmentId, moduleId) - NEW
// - useDropCourse(enrollmentId) - NEW
```

**UI Components:**
- Course header with progress bar
- Module accordion/tabs
- Module content viewer
- Progress update buttons
- Drop course confirmation dialog
- Completion badge

**Implementation Checklist:**
- [ ] Create enrollment detail hook
- [ ] Create enrollment layout
- [ ] Create module accordion component
- [ ] Implement progress update
- [ ] Add drop course confirmation
- [ ] Create update progress hook
- [ ] Create drop course hook
- [ ] Add error handling
- [ ] Test module completion

---

#### Task 3.2: Create Certificate View Page (1 page, 2-3 hours)

**File:** `/frontend/app/(dashboard)/certificates/[enrollmentId]/page.tsx`

```typescript
// Purpose: View and download course completion certificate
// Backend: GET /enrollments/:id/certificate
// Features:
//   - Certificate display (image/PDF)
//   - Course name and completion date
//   - Student name
//   - Certificate number/ID
//   - "Download PDF" button
//   - "Share on Social Media" button (optional)
//   - Print button

// Hooks needed:
// - useCertificate(enrollmentId) - NEW
```

**UI Components:**
- Certificate display canvas
- Download button
- Share button
- Print button
- Certificate preview

**Implementation Checklist:**
- [ ] Create certificate hook
- [ ] Create certificate display component
- [ ] Implement PDF download
- [ ] Add print functionality
- [ ] Add social share (optional)
- [ ] Test certificate generation
- [ ] Verify certificate data display

---

#### Task 3.3: Enhance Payments Page (1 page, 2-3 hours)

**File:** `/frontend/app/(dashboard)/payments/page.tsx` (Updated)

```typescript
// Add:
//   - Payment detail modal/drawer
//   - "Retry Payment" button for failed payments
//   - Invoice download button
//   - Payment method display
//   - More detailed information

// Hooks needed:
// - useRetryPayment(paymentId) - NEW
// - usePaymentDetail(paymentId) - NEW
```

**Implementation Checklist:**
- [ ] Add retry payment functionality
- [ ] Create payment detail modal
- [ ] Implement invoice download
- [ ] Create retry payment hook
- [ ] Add success messaging after retry
- [ ] Test payment retry flow

---

#### Task 3.4: Enhance Existing Pages

**Profile Page Updates** (30 min)
- Update "Edit Profile" button to navigate to `/dashboard/profile/edit`
- Update "Change Password" button to navigate to `/dashboard/profile/change-password`

**Dashboard Updates** (30 min)
- Add "Browse Courses" link in welcome section
- Add quick action buttons to explore new courses

**Settings Page** (2-3 hours)
- Research if backend has notification settings API
- Implement settings save functionality
- Add more setting options:
  - Email notifications toggle
  - SMS notifications toggle
  - Newsletter subscription
  - Privacy settings

---

### ✅ Phase 3 Deliverables

**New Pages:**
1. ✅ `/dashboard/enrollments/:id` - Enrollment detail
2. ✅ `/dashboard/certificates/:id` - Certificate view

**Updated Pages:**
1. ✅ `/dashboard/payments` - Add retry and detail views
2. ✅ `/dashboard/profile` - Fix navigation buttons
3. ✅ `/dashboard/settings` - Implement functionality
4. ✅ `/dashboard` - Add quick actions

**New Hooks:**
1. ✅ `useEnrollmentDetail()` - Enrollment details
2. ✅ `useUpdateProgress()` - Progress updates
3. ✅ `useDropCourse()` - Drop course
4. ✅ `useCertificate()` - Certificate data
5. ✅ `useRetryPayment()` - Retry payment
6. ✅ `usePaymentDetail()` - Payment details

---

## Implementation Order Recommendation

### Order by Dependency:

1. **Hooks First** (all phases)
   - Ensure all data fetching hooks are created
   - Test hooks independently

2. **Registration & Auth** (Phase 1)
   - Users can't access anything without signup
   - Foundation for all other features

3. **Course Browser & Detail** (Phase 1)
   - Core feature discovery
   - Enables enrollment flow

4. **Payment** (Phase 1)
   - Unlocks revenue generation
   - Critical for platform viability

5. **User Management** (Phase 2)
   - Secondary features
   - User convenience

6. **Advanced Features** (Phase 3)
   - Nice-to-haves
   - Quality of life improvements

---

## Testing Strategy

### Unit Tests
- [ ] Test all new hooks with mock API responses
- [ ] Test form validation
- [ ] Test navigation logic

### Integration Tests
- [ ] Test complete registration flow
- [ ] Test course enrollment flow
- [ ] Test payment flow
- [ ] Test profile update flow

### E2E Tests
- [ ] Test complete user journey from signup to course completion
- [ ] Test payment processing
- [ ] Test certificate generation

### Manual Testing
- [ ] Test with real backend
- [ ] Test error scenarios
- [ ] Test edge cases

---

## Success Criteria

### Phase 1 Complete ✅
- [ ] User can register (3-step process)
- [ ] User can browse courses
- [ ] User can view course details
- [ ] User can enroll in courses
- [ ] User can make payments
- [ ] All pages have working navigation

### Phase 2 Complete ✅
- [ ] User can change password
- [ ] User can reset forgotten password
- [ ] User can edit profile
- [ ] User can update profile information

### Phase 3 Complete ✅
- [ ] User can view course progress
- [ ] User can complete course modules
- [ ] User can view certificates
- [ ] User can retry failed payments
- [ ] Settings page functional

---

## File Structure Reference

```
/frontend/app/
├── page.tsx (existing - root router)
├── layout.tsx (existing)
├── login/
│   └── page.tsx (existing)
├── register/
│   ├── page.tsx OR step1/page.tsx (NEW)
│   ├── step2/
│   │   └── page.tsx (NEW)
│   └── step3/
│       └── page.tsx (NEW)
├── forgot-password/
│   └── page.tsx (NEW)
├── reset-password/
│   └── page.tsx (NEW)
└── (dashboard)/
    ├── layout.tsx (existing)
    ├── dashboard/
    │   └── page.tsx (existing)
    ├── browse/
    │   └── page.tsx (NEW)
    ├── courses/
    │   ├── page.tsx (existing - update)
    │   ├── [courseId]/
    │   │   └── page.tsx (NEW)
    │   └── edit/
    │       └── page.tsx (NEW)
    ├── enrollments/
    │   └── [enrollmentId]/
    │       └── page.tsx (NEW)
    ├── payments/
    │   ├── page.tsx (existing - update)
    │   └── checkout/
    │       └── page.tsx (NEW)
    ├── certificates/
    │   └── [enrollmentId]/
    │       └── page.tsx (NEW)
    ├── profile/
    │   ├── page.tsx (existing - update)
    │   ├── edit/
    │   │   └── page.tsx (NEW)
    │   └── change-password/
    │       └── page.tsx (NEW)
    └── settings/
        └── page.tsx (existing - update)

/frontend/hooks/
├── index.ts (existing - update exports)
├── auth-context.tsx (existing)
├── use-auth-flow.ts (NEW - registration flow)
├── use-courses.ts (NEW or update - course browsing)
├── use-password.ts (NEW - password management)
├── use-enrollments.ts (NEW or update - enrollment management)
├── use-payments.ts (NEW or update - payment management)
└── ... (other existing hooks)
```

---

## Notes

- All endpoints have backend support - no API changes needed
- Paystack integration required for payments (already in backend)
- Consider adding UI loading skeletons for better UX
- Add proper error boundaries
- Implement form validation on client and server side
- Add analytics tracking for user flows
- Consider dark mode support for all new pages
- Ensure mobile responsiveness for all new pages

