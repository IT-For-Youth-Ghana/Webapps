/**
 * Router Configuration for IT Youth Talent Incubator
 * Defines all application routes, navigation logic, and route guards
 *
 * Route Meta Fields:
 * - requiresAuth: boolean - Route requires authenticated user
 * - requiresGuest: boolean - Route only accessible to non-authenticated users
 * - role: string | string[] - Required user role(s) to access route
 * - title: string - Page title for document.title
 * - requiresEmailVerified: boolean - Requires verified email
 * - requiresApproved: boolean - Requires approved account status
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

// ===========================================
// Route Definitions
// ===========================================

const routes = [
  // -------------------------
  // Public Routes
  // -------------------------
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/HomePage.vue'),
    meta: { title: 'IT Youth Talent Incubator', public: true }
  },
  {
    path: '/jobs',
    name: 'PublicJobs',
    component: () => import('../pages/JobsPage.vue'),
    meta: { title: 'Job Listings', public: true }
  },

  // -------------------------
  // Auth Routes (Guest Only)
  // -------------------------
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/auth/LoginPage.vue'),
    meta: { requiresGuest: true, title: 'Login' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../pages/auth/RegisterPage.vue'),
    meta: { requiresGuest: true, title: 'Register' }
  },
  {
    path: '/register/student',
    name: 'RegisterStudent',
    component: () => import('../pages/auth/RegisterStudentPage.vue'),
    meta: { requiresGuest: true, title: 'Student Registration' }
  },
  {
    path: '/register/company',
    name: 'RegisterCompany',
    component: () => import('../pages/auth/RegisterCompanyPage.vue'),
    meta: { requiresGuest: true, title: 'Company Registration' }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../pages/auth/ForgotPasswordPage.vue'),
    meta: { requiresGuest: true, title: 'Forgot Password' }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../pages/auth/ResetPasswordPage.vue'),
    meta: { requiresGuest: true, title: 'Reset Password' }
  },
  {
    path: '/verify-email',
    name: 'VerifyEmail',
    component: () => import('../pages/auth/VerifyEmailPage.vue'),
    meta: { title: 'Verify Email' }
  },

  // -------------------------
  // Student Routes
  // -------------------------
  {
    path: '/student',
    redirect: '/student/dashboard'
  },
  {
    path: '/student/dashboard',
    name: 'StudentDashboard',
    component: () => import('../pages/StudentDashboardIntegrated.vue'),
    meta: {
      requiresAuth: true,
      role: 'student',
      title: 'Student Dashboard',
      requiresEmailVerified: true
    }
  },
  {
    path: '/student/profile',
    name: 'StudentProfile',
    component: () => import('../pages/StudentProfilePageIntegrated.vue'),
    meta: {
      requiresAuth: true,
      role: 'student',
      title: 'My Profile',
      requiresEmailVerified: true
    }
  },
  {
    path: '/student/jobs',
    name: 'StudentJobs',
    component: () => import('../pages/StudentJobsPageIntegrated.vue'),
    meta: {
      requiresAuth: true,
      role: 'student',
      title: 'Browse Jobs',
      requiresEmailVerified: true
    }
  },
  {
    path: '/student/applications',
    name: 'StudentApplications',
    component: () => import('../pages/student/StudentApplicationsPageIntegrated.vue'),
    meta: {
      requiresAuth: true,
      role: 'student',
      title: 'My Applications',
      requiresEmailVerified: true
    }
  },

  // -------------------------
  // Company Routes
  // -------------------------
  {
    path: '/company',
    redirect: '/company/dashboard'
  },
  {
    path: '/company/dashboard',
    name: 'CompanyDashboard',
    component: () => import('../pages/company/CompanyDashboardIntegrated.vue'),
    meta: {
      requiresAuth: true,
      role: 'company',
      title: 'Company Dashboard',
      requiresEmailVerified: true,
      requiresApproved: true
    }
  },
  {
    path: '/company/profile',
    name: 'CompanyProfile',
    component: () => import('../pages/company/CompanyProfilePageIntegrated.vue'),
    meta: {
      requiresAuth: true,
      role: 'company',
      title: 'Company Profile',
      requiresEmailVerified: true
    }
  },
  {
    path: '/company/jobs',
    name: 'CompanyJobs',
    component: () => import('../pages/company/CompanyDashboardIntegrated.vue'),
    meta: {
      requiresAuth: true,
      role: 'company',
      title: 'Manage Jobs',
      requiresEmailVerified: true,
      requiresApproved: true
    }
  },
  {
    path: '/company/applications',
    name: 'CompanyApplications',
    component: () => import('../pages/company/CompanyDashboardIntegrated.vue'),
    meta: {
      requiresAuth: true,
      role: 'company',
      title: 'Applications',
      requiresEmailVerified: true,
      requiresApproved: true
    }
  },

  // -------------------------
  // Admin Routes
  // -------------------------
  {
    path: '/admin',
    redirect: '/admin/dashboard'
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('../pages/admin/AdminDashboardPage.vue'),
    meta: {
      requiresAuth: true,
      role: 'admin',
      title: 'Admin Dashboard'
    }
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('../pages/admin/AdminUsersPage.vue'),
    meta: {
      requiresAuth: true,
      role: 'admin',
      title: 'Manage Users'
    }
  },
  {
    path: '/admin/companies',
    name: 'AdminCompanies',
    component: () => import('../pages/admin/AdminCompaniesPage.vue'),
    meta: {
      requiresAuth: true,
      role: 'admin',
      title: 'Manage Companies'
    }
  },
  {
    path: '/admin/jobs',
    name: 'AdminJobs',
    component: () => import('../pages/admin/AdminJobsPage.vue'),
    meta: {
      requiresAuth: true,
      role: 'admin',
      title: 'Manage Jobs'
    }
  },

  // -------------------------
  // Error Routes
  // -------------------------
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('../pages/errors/UnauthorizedPage.vue'),
    meta: { title: 'Unauthorized' }
  },
  {
    path: '/pending-approval',
    name: 'PendingApproval',
    component: () => import('../pages/errors/PendingApprovalPage.vue'),
    meta: { requiresAuth: true, title: 'Pending Approval' }
  },
  {
    path: '/verify-email-required',
    name: 'VerifyEmailRequired',
    component: () => import('../pages/errors/VerifyEmailRequiredPage.vue'),
    meta: { requiresAuth: true, title: 'Email Verification Required' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/errors/NotFoundPage.vue'),
    meta: { title: 'Page Not Found' }
  }
]

// ===========================================
// Router Instance
// ===========================================

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Restore scroll position on back/forward navigation
    if (savedPosition) {
      return savedPosition
    }
    // Scroll to hash if present
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    // Scroll to top for new pages
    return { top: 0 }
  }
})

// ===========================================
// Navigation Guards
// ===========================================

/**
 * Global before guard - runs before each navigation
 * Handles authentication, authorization, and redirects
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth to initialize if not already done
  if (!authStore.isInitialized) {
    await authStore.initialize()
  }

  const { isAuthenticated, userRole, isEmailVerified, isPendingApproval } = authStore

  // Update document title
  const defaultTitle = 'IT Youth Talent Incubator'
  document.title = to.meta.title ? `${to.meta.title} | ${defaultTitle}` : defaultTitle

  // -------------------------
  // Guest-only routes (login, register)
  // -------------------------
  if (to.meta.requiresGuest && isAuthenticated) {
    // Redirect authenticated users to their dashboard
    return next(getDashboardRoute(userRole))
  }

  // -------------------------
  // Protected routes
  // -------------------------
  if (to.meta.requiresAuth) {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Save intended destination and redirect to login
      return next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
    }

    // Check email verification requirement
    if (to.meta.requiresEmailVerified && !isEmailVerified) {
      return next({ name: 'VerifyEmailRequired' })
    }

    // Check approval requirement (for companies)
    if (to.meta.requiresApproved && isPendingApproval) {
      return next({ name: 'PendingApproval' })
    }

    // Check role-based access
    if (to.meta.role) {
      const allowedRoles = Array.isArray(to.meta.role) ? to.meta.role : [to.meta.role]

      if (!allowedRoles.includes(userRole)) {
        // User doesn't have required role
        console.warn(`Access denied: User role "${userRole}" not in allowed roles:`, allowedRoles)
        return next({ name: 'Unauthorized' })
      }
    }
  }

  // All checks passed, proceed with navigation
  next()
})

/**
 * Global after guard - runs after each navigation
 * Can be used for analytics, logging, etc.
 */
router.afterEach((to, from) => {
  // Log navigation for debugging (can be removed in production)
  if (import.meta.env.DEV) {
    console.log(`[Router] Navigated from "${from.fullPath}" to "${to.fullPath}"`)
  }
})

/**
 * Error handler for navigation failures
 */
router.onError((error) => {
  console.error('[Router] Navigation error:', error)

  // Handle chunk loading errors (e.g., after deployment)
  if (error.message.includes('Failed to fetch dynamically imported module')) {
    // Reload the page to get fresh chunks
    window.location.reload()
  }
})

// ===========================================
// Helper Functions
// ===========================================

/**
 * Get the appropriate dashboard route based on user role
 * @param {string|null} role - User's role
 * @returns {object} Route location object
 */
function getDashboardRoute(role) {
  switch (role) {
    case 'student':
      return { name: 'StudentDashboard' }
    case 'company':
      return { name: 'CompanyDashboard' }
    case 'admin':
      return { name: 'AdminDashboard' }
    default:
      return { name: 'Home' }
  }
}

/**
 * Programmatic navigation helper - navigate to user's dashboard
 * Can be used from components: router.push(getHomeDashboard())
 */
export function getHomeDashboard() {
  const authStore = useAuthStore()
  return getDashboardRoute(authStore.userRole)
}

/**
 * Check if current user can access a route
 * Useful for conditionally showing navigation items
 * @param {string} routeName - Name of the route to check
 * @returns {boolean}
 */
export function canAccessRoute(routeName) {
  const authStore = useAuthStore()
  const route = router.getRoutes().find(r => r.name === routeName)

  if (!route) return false

  const meta = route.meta || {}

  // Check auth requirement
  if (meta.requiresAuth && !authStore.isAuthenticated) {
    return false
  }

  // Check guest requirement
  if (meta.requiresGuest && authStore.isAuthenticated) {
    return false
  }

  // Check role requirement
  if (meta.role) {
    const allowedRoles = Array.isArray(meta.role) ? meta.role : [meta.role]
    if (!allowedRoles.includes(authStore.userRole)) {
      return false
    }
  }

  // Check email verification
  if (meta.requiresEmailVerified && !authStore.isEmailVerified) {
    return false
  }

  // Check approval status
  if (meta.requiresApproved && authStore.isPendingApproval) {
    return false
  }

  return true
}

export default router
