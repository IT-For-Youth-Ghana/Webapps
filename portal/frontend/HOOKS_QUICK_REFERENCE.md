# Quick Reference - Frontend Hooks

## Import Patterns

```typescript
// Option 1: Import from index (recommended)
import { 
  useAuth, 
  usePayments, 
  useMyEnrollments 
} from '@/hooks'

// Option 2: Import from specific files
import { useMyEnrollments } from '@/hooks/use-enrollments'
import { usePayments } from '@/hooks/use-payments'
```

## Common Hooks Usage

### Authentication
```typescript
// Login/Logout
const { login, logout, user, isAuthenticated } = useAuth()

// Start registration
const { startRegistration, isLoading } = useStartRegistration()

// Verify email
const { verifyEmail } = useVerifyEmail()

// Complete registration
const { completeRegistration } = useCompleteRegistration()

// Password reset
const { forgotPassword } = useForgotPassword()
const { resetPassword } = useResetPassword()
const { changePassword } = useChangePassword()
```

### User Profile
```typescript
// Get and update profile
const { profile, updateProfile, refetch } = useProfile()

// Manage notifications
const { 
  notifications, 
  markAsRead, 
  markAllAsRead 
} = useNotifications({ 
  limit: 10, 
  unreadOnly: true 
})
```

### Courses
```typescript
// List courses
const { courses, pagination, isLoading } = useCourses({
  page: 1,
  limit: 20,
  category: 'Programming',
  level: 'beginner',
  search: 'Python'
})

// Single course
const { course } = useCourse(courseId)

// Categories and popular
const { categories } = useCategories()
const { courses: popularCourses } = usePopularCourses()
```

### Enrollments
```typescript
// My enrollments
const { enrollments, isLoading } = useMyEnrollments({
  status: 'active' // pending|active|completed|dropped
})

// Enrollment details
const { enrollment, updateProgress, dropCourse } = useEnrollment(enrollmentId)
await updateProgress('module-1', { progressPercentage: 50 })
await dropCourse()

// Enroll in course
const { enroll, isEnrolling } = useEnroll()
await enroll(courseId)

// Get certificate
const { getCertificate } = useGetCertificate(enrollmentId)
const cert = await getCertificate()
```

### Payments
```typescript
// Payment history
const { payments, refetch } = usePayments()

// Initialize payment
const { initializePayment } = useInitializePayment()
const { authorizationUrl, reference } = await initializePayment({
  courseId: 'course-1'
})

// Verify payment
const { verifyPayment } = useVerifyPayment()
const result = await verifyPayment(reference)

// Get payment details
const { payment } = usePaymentDetails(paymentId)

// Retry failed payment
const { retryPayment } = useRetryPayment()
await retryPayment(paymentId)
```

### SSO
```typescript
// Moodle login
const { loginWithMoodle } = useMoodleSSOLogin()
const { user, token } = await loginWithMoodle()

// SSO logout
const { logout } = useSSOLogout()
await logout()

// Handle callback
const { handleCallback } = useSSOCallback()
const result = await handleCallback(code, state)
```

## Hook Return Values

### Standard Pattern
```typescript
const {
  // Data
  data: T,
  
  // Loading/Error states
  isLoading: boolean,
  error: Error | null,
  
  // Methods
  refetch: () => Promise<void>,
  // ... other methods specific to hook
} = useHook()
```

### With Mutations
```typescript
const {
  // For mutation hooks
  mutationFunction: (data) => Promise<T>,
  isMutating: boolean,
  error: Error | null
} = useMutationHook()
```

## Error Handling

```typescript
const { enrollments, isLoading, error, refetch } = useMyEnrollments()

if (error) {
  return <ErrorMessage error={error} onRetry={refetch} />
}

if (isLoading) {
  return <Loading />
}

return <EnrollmentList enrollments={enrollments} />
```

## Type Definitions

```typescript
// User Types
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  status: string
}

// Course Types
interface Course {
  id: string
  title: string
  description: string
  category: string
  level: string
  image?: string
  price?: number
}

// Enrollment Types
interface Enrollment {
  id: string
  courseId: string
  enrollmentStatus: 'pending' | 'active' | 'completed' | 'dropped'
  progressPercentage: number
  enrolledAt: string
  course?: Course
}

// Payment Types
interface Payment {
  id: string
  reference: string
  amount: number
  currency: string
  status: 'pending' | 'success' | 'failed'
  enrollmentId?: string
  createdAt: string
}

// Notification Types
interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}
```

## Common Patterns

### Fetching Data
```typescript
export function CourseList() {
  const { courses, isLoading, error } = useCourses({
    page: 1,
    limit: 20
  })

  return (
    <>
      {isLoading && <Skeleton />}
      {error && <ErrorAlert error={error} />}
      {courses?.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </>
  )
}
```

### Updating Data
```typescript
export function ProfileForm() {
  const { profile, updateProfile, isLoading } = useProfile()
  const [name, setName] = useState(profile?.firstName || '')

  const handleSave = async () => {
    try {
      await updateProfile({ firstName: name })
      // Success - component re-renders with new data
    } catch (error) {
      // Handle error
    }
  }

  return (
    <>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button onClick={handleSave} disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </>
  )
}
```

### Dependent Requests
```typescript
export function CourseDetails({ courseId }: Props) {
  // Fetch course details
  const { course, isLoading: courseLoading } = useCourse(courseId)

  // Fetch user's enrollment in this course
  const { enrollments } = useMyEnrollments()
  const myEnrollment = enrollments.find(e => e.courseId === courseId)

  // Fetch certificate if completed
  const { getCertificate } = useGetCertificate(
    myEnrollment?.enrollmentStatus === 'completed' ? myEnrollment.id : null
  )

  return (
    <>
      {courseLoading && <Loading />}
      <Course course={course} enrollment={myEnrollment} />
    </>
  )
}
```

## Troubleshooting

### "useAuth must be used within AuthProvider"
- Make sure `AuthProvider` wraps your app in `app/layout.tsx`
- Check that `AuthProvider` is at the root level

### Hook returns undefined data
- Check if `isLoading` is true
- Verify the API endpoint is correct
- Check browser network tab for errors

### Token expiration
- Use `useRefreshToken()` to refresh before making requests
- Consider adding automatic token refresh in API client

### Type errors
- Import types from `@/hooks` or `/hooks` directly
- Check exported types in hook files
- Verify you're using correct request/response types

## Performance Tips

1. **Use dependent requests** - Chain requests based on previous results
2. **Memoize callbacks** - Prevent infinite loops with `useCallback`
3. **Lazy load data** - Only fetch what you need
4. **Batch requests** - Combine multiple queries when possible
5. **Cache results** - Reuse hook results across components

## Best Practices

1. ✅ Always handle `isLoading` state
2. ✅ Always handle `error` state
3. ✅ Use TypeScript for type safety
4. ✅ Extract hooks to custom hooks for reusability
5. ✅ Keep hook usage close to components
6. ❌ Don't call hooks conditionally
7. ❌ Don't use hooks in loops
8. ❌ Don't use hooks in async functions

---

**For more details, see:**
- `HOOKS_API_COMPARISON.md` - API endpoint details
- `HOOKS_ARCHITECTURE.md` - Architecture diagrams
- Individual hook files for JSDoc comments
