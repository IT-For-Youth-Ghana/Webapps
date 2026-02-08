# Frontend Restructure Documentation

## Overview
The frontend has been restructured to follow Next.js 13+ App Router best practices with proper route organization and shared layouts.

## New Directory Structure

```
app/
├── layout.tsx                    # Root layout with AuthProvider
├── page.tsx                      # Root page (auth router)
├── login/
│   └── page.tsx                 # Login page (/login)
└── (dashboard)/                 # Route group for dashboard pages
    ├── layout.tsx               # Shared dashboard layout (sidebar + topbar)
    ├── dashboard/
    │   └── page.tsx            # Dashboard home (/dashboard)
    ├── courses/
    │   └── page.tsx            # Courses page (/courses)
    ├── payments/
    │   └── page.tsx            # Payments page (/payments)
    ├── profile/
    │   └── page.tsx            # Profile page (/profile)
    └── settings/
        └── page.tsx            # Settings page (/settings)
```

## Key Features

### 1. Route Organization
- **Root Routes**: Login and authentication pages at root level
- **Route Group (dashboard)**: All dashboard pages grouped under `(dashboard)` which doesn't affect URL but shares layout
- **Simplified URLs**: All dashboard pages are accessible directly (e.g., `/dashboard`, `/courses`, `/payments`)

### 2. Shared Layout
- All dashboard pages share the same layout with:
  - Sidebar navigation component
  - Top bar with user info and logout
  - Responsive design with mobile-friendly sidebar

### 3. Navigation
- Sidebar menu items automatically highlight based on current route
- Page navigation uses Next.js `useRouter` for client-side routing
- Sidebar navigation properly routes between pages via the `onPageChange` handler

### 4. Auth Flow
- Root page redirects based on authentication status
- Authenticated users → `/dashboard`
- Unauthenticated users → `/login`
- AuthProvider wraps entire app for state management

## Pages

### 1. Login Page (`/login`)
- Email/password authentication
- Redirects to dashboard if already authenticated
- Beautiful UI with interactive elements

### 2. Dashboard (`/dashboard`)
- Welcome message with user name
- Statistics cards (enrolled courses, completed, pending payments)
- Quick action buttons
- Recent notifications

### 3. Courses (`/courses`)
- List of enrolled courses
- Progress indicators for each course
- Click to view course details
- Empty state with "Browse Courses" button

### 4. Payments (`/payments`)
- Payment history table
- Shows course, amount, status, and date
- Status badges (success, pending, failed)
- Empty state message

### 5. Profile (`/profile`)
- User avatar with initials
- Profile information display
- Edit profile and change password buttons
- Read-only user details

### 6. Settings (`/settings`)
- Notification preferences
- Email and SMS notification toggles
- Save settings button

## Navigation Flow

```
Login (/login)
  ↓ (after authentication)
Dashboard (/dashboard)
  ├─→ Courses (/courses)
  ├─→ Payments (/payments)
  ├─→ Profile (/profile)
  ├─→ Settings (/settings)
  └─→ Logout → Login (/login)
```

## Sidebar Navigation

The sidebar component automatically detects the active page based on the pathname using Next.js `usePathname()` hook:

```typescript
const getActivePage = () => {
  if (pathname.includes('/dashboard')) return 'dashboard'
  if (pathname.includes('/courses')) return 'courses'
  if (pathname.includes('/payments')) return 'payments'
  if (pathname.includes('/profile')) return 'profile'
  if (pathname.includes('/settings')) return 'settings'
  return activePage
}
```

## Benefits of This Structure

1. **Code Reusability**: Shared layout reduces duplication
2. **Maintainability**: Clear separation of concerns
3. **Scalability**: Easy to add new dashboard pages
4. **Performance**: Optimized routing with Next.js
5. **User Experience**: Smooth navigation between pages
6. **Type Safety**: Full TypeScript support
7. **Responsive Design**: Mobile-friendly with toggle sidebar

## Mobile Responsiveness

- Desktop: Sidebar always visible
- Mobile: Collapsible sidebar with overlay
- Toggle button in top bar for mobile navigation

## Future Enhancements

1. Add more dashboard pages under `(dashboard)` without changing URLs
2. Add public pages (about, pricing) outside the route group
3. Implement breadcrumb navigation
4. Add route transitions/animations
5. Add loading skeletons for data fetching
6. Implement error boundaries for error handling
