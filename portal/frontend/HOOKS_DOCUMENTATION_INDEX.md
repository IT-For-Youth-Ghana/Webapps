# Frontend Hooks - Complete Documentation Index

**Last Updated:** February 7, 2026

## 📋 Documentation Files

### 1. **HOOKS_QUICK_REFERENCE.md** ⭐ START HERE
Quick snippets and examples for all hooks. Perfect for:
- Copy-paste examples
- Common usage patterns
- Error handling
- Type definitions
- Troubleshooting guide

### 2. **HOOKS_RESTRUCTURE_SUMMARY.md**
High-level overview of what changed:
- Before/after structure
- New hooks created
- Backward compatibility notes
- Quality metrics
- Benefits of restructuring

### 3. **HOOKS_API_COMPARISON.md**
Detailed API endpoint coverage analysis:
- All backend endpoints listed
- Which hooks cover which endpoints
- Coverage percentages per module
- Priority recommendations
- Implementation roadmap

### 4. **HOOKS_ARCHITECTURE.md**
Visual diagrams and architecture:
- File organization diagram
- Data flow diagram
- Module dependencies
- API endpoint summary
- Usage patterns

## 📁 Hook Files Organization

### Authentication & User
- **`auth-context.tsx`** - Core auth (login/logout)
- **`use-user.ts`** - Profile & notifications
- **`use-auth-flow.ts`** - Multi-step registration
- **`use-password.ts`** - Password & token management
- **`use-sso.ts`** - SSO/Moodle integration

### Domain-Specific
- **`use-courses.ts`** - Course browsing
- **`use-enrollments.ts`** - Course enrollment
- **`use-payments.ts`** - Payment processing

### Export/Import
- **`index.ts`** - Main export file (use this for imports)

## 🎯 Which Document Should I Use?

### "I want to use a hook in my component"
→ See **HOOKS_QUICK_REFERENCE.md**

### "I need to understand the architecture"
→ See **HOOKS_ARCHITECTURE.md**

### "I want to know what's changed"
→ See **HOOKS_RESTRUCTURE_SUMMARY.md**

### "I need to check if an endpoint is covered"
→ See **HOOKS_API_COMPARISON.md**

### "I need to add a new hook"
→ See this file + specific hook file's JSDoc

## 🔍 Quick Navigation

### By Functionality

#### 🔐 Authentication
| Need | Hook | File | Doc |
|------|------|------|-----|
| Login | `useAuth()` | `auth-context.tsx` | Quick Ref |
| Registration Step 1 | `useStartRegistration()` | `use-auth-flow.ts` | Quick Ref |
| Registration Step 2 | `useVerifyEmail()` | `use-auth-flow.ts` | Quick Ref |
| Registration Step 3 | `useCompleteRegistration()` | `use-auth-flow.ts` | Quick Ref |
| Forgot Password | `useForgotPassword()` | `use-password.ts` | Quick Ref |
| Reset Password | `useResetPassword()` | `use-password.ts` | Quick Ref |
| Change Password | `useChangePassword()` | `use-password.ts` | Quick Ref |
| Refresh Token | `useRefreshToken()` | `use-password.ts` | Quick Ref |
| SSO Login | `useMoodleSSOLogin()` | `use-sso.ts` | Quick Ref |

#### 👤 User Management
| Need | Hook | File | Doc |
|------|------|------|-----|
| Get Profile | `useProfile()` | `use-user.ts` | Quick Ref |
| Update Profile | `useProfile().updateProfile()` | `use-user.ts` | Quick Ref |
| Get Notifications | `useNotifications()` | `use-user.ts` | Quick Ref |
| Mark as Read | `useNotifications().markAsRead()` | `use-user.ts` | Quick Ref |

#### 📚 Courses
| Need | Hook | File | Doc |
|------|------|------|-----|
| List Courses | `useCourses()` | `use-courses.ts` | Quick Ref |
| Course Details | `useCourse()` | `use-courses.ts` | Quick Ref |
| Categories | `useCategories()` | `use-courses.ts` | Quick Ref |
| Popular Courses | `usePopularCourses()` | `use-courses.ts` | Quick Ref |

#### 📝 Enrollments
| Need | Hook | File | Doc |
|------|------|------|-----|
| My Enrollments | `useMyEnrollments()` | `use-enrollments.ts` | Quick Ref |
| Enrollment Details | `useEnrollment()` | `use-enrollments.ts` | Quick Ref |
| Enroll in Course | `useEnroll()` | `use-enrollments.ts` | Quick Ref |
| Update Progress | `useEnrollment().updateProgress()` | `use-enrollments.ts` | Quick Ref |
| Drop Course | `useEnrollment().dropCourse()` | `use-enrollments.ts` | Quick Ref |
| Certificate | `useGetCertificate()` | `use-enrollments.ts` | Quick Ref |

#### 💳 Payments
| Need | Hook | File | Doc |
|------|------|------|-----|
| Payment History | `usePayments()` | `use-payments.ts` | Quick Ref |
| Payment Details | `usePaymentDetails()` | `use-payments.ts` | Quick Ref |
| Initialize Payment | `useInitializePayment()` | `use-payments.ts` | Quick Ref |
| Verify Payment | `useVerifyPayment()` | `use-payments.ts` | Quick Ref |
| Retry Payment | `useRetryPayment()` | `use-payments.ts` | Quick Ref |

## 📊 Coverage Summary

| Module | Endpoints | Hooks | Coverage |
|--------|-----------|-------|----------|
| Auth | 9 | 7 | 78% ✅ |
| Users | 5 | 2 | 100% ✅ |
| Courses | 4 | 4 | 100% ✅ |
| Enrollments | 6 | 4 | 100% ✅ |
| Payments | 5 | 5 | 100% ✅ |
| SSO | 3 | 3 | 100% ✅ |
| **Total** | **32** | **25** | **78%** ✅ |

## 🚀 Getting Started

### 1. Install/Setup (Already Done ✅)
```bash
# Hooks are already set up
# No additional installation needed
```

### 2. Import Hooks
```typescript
import { useAuth, usePayments } from '@/hooks'
```

### 3. Use in Components
```typescript
export function MyComponent() {
  const { user } = useAuth()
  const { payments } = usePayments()
  
  return <div>{user.firstName}</div>
}
```

## 📚 Complete File Structure

```
frontend/
├── hooks/
│   ├── index.ts                      ← Main export
│   ├── auth-context.tsx              ← Auth context
│   ├── use-user.ts                   ← User profile & notifications
│   ├── use-courses.ts                ← Course browsing
│   ├── use-enrollments.ts            ← Enrollment management
│   ├── use-payments.ts               ← Payment processing
│   ├── use-auth-flow.ts              ← Multi-step registration
│   ├── use-password.ts               ← Password management
│   └── use-sso.ts                    ← SSO integration
│
├── FRONTEND_STRUCTURE.md             ← App routing & structure
├── HOOKS_QUICK_REFERENCE.md          ← Code snippets & examples
├── HOOKS_RESTRUCTURE_SUMMARY.md      ← What changed
├── HOOKS_API_COMPARISON.md           ← API coverage analysis
├── HOOKS_ARCHITECTURE.md             ← Diagrams & architecture
└── HOOKS_DOCUMENTATION_INDEX.md      ← This file
```

## 🔧 Common Tasks

### Add a new hook to existing file
1. Go to the appropriate hook file (e.g., `use-courses.ts`)
2. Add function following existing pattern
3. Export from `hooks/index.ts`
4. Document with JSDoc

### Add a new hook file
1. Create `hooks/use-{module}.ts`
2. Implement hooks following pattern
3. Add exports to `hooks/index.ts`
4. Update this documentation

### Check API compatibility
1. See **HOOKS_API_COMPARISON.md** for endpoint mapping
2. Verify hook exists for your endpoint
3. If missing, refer to implementation roadmap

### Debug a hook
1. Check **HOOKS_QUICK_REFERENCE.md** for usage
2. Check individual hook file JSDoc
3. See **HOOKS_ARCHITECTURE.md** for data flow
4. Check browser DevTools Network tab

## ✅ Checklist for Implementation

- [x] Hooks restructured into separate files
- [x] All student-facing endpoints covered
- [x] TypeScript types exported
- [x] JSDoc comments added
- [x] Backward compatibility maintained
- [x] Documentation created
- [x] Example usages provided
- [x] Error handling patterns documented
- [x] Testing matrix provided

## ⚠️ Known Limitations

1. Admin endpoints not implemented (excluded by design)
2. Real-time features not yet implemented
3. Offline support not yet implemented
4. Caching strategy basic (improvements possible)

## 🎓 Learning Path

**Beginner**
1. Read: HOOKS_QUICK_REFERENCE.md
2. Find a simple hook
3. Use it in a component
4. Extend with error handling

**Intermediate**
1. Read: HOOKS_RESTRUCTURE_SUMMARY.md
2. Understand file organization
3. Understand TypeScript types
4. Add new hooks to existing files

**Advanced**
1. Read: HOOKS_API_COMPARISON.md & HOOKS_ARCHITECTURE.md
2. Add new hook files
3. Implement complex flows
4. Optimize performance

## 🤝 Contributing

When adding new hooks:
1. Follow existing patterns in similar files
2. Add JSDoc comments with endpoint info
3. Export types
4. Add tests
5. Update relevant documentation

## 📞 Support

- **For hooks usage**: See HOOKS_QUICK_REFERENCE.md
- **For API questions**: See HOOKS_API_COMPARISON.md
- **For structure questions**: See HOOKS_ARCHITECTURE.md
- **For changes**: See HOOKS_RESTRUCTURE_SUMMARY.md

---

## 📝 Document Maintenance

| Document | Last Updated | Accuracy |
|----------|-------------|----------|
| HOOKS_QUICK_REFERENCE.md | Feb 7, 2026 | ✅ Current |
| HOOKS_RESTRUCTURE_SUMMARY.md | Feb 7, 2026 | ✅ Current |
| HOOKS_API_COMPARISON.md | Feb 7, 2026 | ✅ Current |
| HOOKS_ARCHITECTURE.md | Feb 7, 2026 | ✅ Current |
| HOOKS_DOCUMENTATION_INDEX.md | Feb 7, 2026 | ✅ Current |

**Next review date:** February 21, 2026

---

**Start with:** [HOOKS_QUICK_REFERENCE.md](./HOOKS_QUICK_REFERENCE.md)
