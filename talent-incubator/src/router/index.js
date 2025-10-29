/**
 * 🏗️ Enhanced Router with Role-Based Access Control
 * Cross-platform navigation with permission checking
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../../shared/stores/user.store.js'

// Route definitions with role-based access
const routes = [
  // Public routes
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/shared/HomePage.vue'),
    meta: { 
      requiresAuth: false,
      title: 'IT Youth Talent Ghana'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/shared/LoginPage.vue'),
    meta: { 
      requiresAuth: false,
      title: 'Login'
    }
  },
  {
    path: '/register',
    name: 'Register', 
    component: () => import('../pages/shared/RegisterPage.vue'),
    meta: { 
      requiresAuth: false,
      title: 'Register'
    }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../pages/shared/AboutPage.vue'),
    meta: { 
      requiresAuth: false,
      title: 'About Us'
    }
  },
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('../pages/shared/UnauthorizedPage.vue'),
    meta: { 
      requiresAuth: false,
      title: 'Access Denied'
    }
  },
  
  // TALENT INCUBATOR ROUTES
  {
    path: '/talent',
    meta: { 
      requiresAuth: true,
      module: 'incubator',
      title: 'Talent Incubator'
    },
    children: [
      // Student routes
      {
        path: 'student/dashboard',
        name: 'StudentDashboard',
        component: () => import('../pages/student/StudentDashboard.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['student', 'admin', 'teacher'],
          title: 'Student Dashboard'
        }
      },
      {
        path: 'student/jobs',
        name: 'StudentJobs',
        component: () => import('../pages/student/StudentJobsPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['student', 'admin'],
          title: 'Available Jobs'
        }
      },
      {
        path: 'student/applications',
        name: 'StudentApplications',
        component: () => import('../pages/student/StudentApplicationsPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['student', 'admin'],
          title: 'My Applications'
        }
      },
      {
        path: 'student/profile',
        name: 'StudentProfile',
        component: () => import('../pages/student/StudentProfilePage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['student', 'admin', 'teacher'],
          title: 'My Profile'
        }
      },
      
      // Admin routes
      {
        path: 'admin/dashboard',
        name: 'AdminDashboard',
        component: () => import('../pages/admin/AdminDashboard.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['admin'],
          title: 'Admin Dashboard'
        }
      },
      {
        path: 'admin/jobs',
        name: 'AdminJobs',
        component: () => import('../pages/admin/AdminJobsPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['admin'],
          title: 'Job Management'
        }
      },
      {
        path: 'admin/students',
        name: 'AdminStudents',
        component: () => import('../pages/admin/AdminStudentsPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['admin'],
          title: 'Student Management'
        }
      },
      {
        path: 'admin/users',
        name: 'AdminUsers',
        component: () => import('../pages/admin/AdminUsersPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['admin'],
          title: 'User Management'
        }
      },
      {
        path: 'admin/analytics',
        name: 'AdminAnalytics',
        component: () => import('../pages/admin/AdminAnalyticsPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['admin'],
          title: 'Analytics'
        }
      },
      
      // Company routes
      {
        path: 'company/dashboard',
        name: 'CompanyDashboard',
        component: () => import('../pages/company/CompanyDashboard.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['company', 'admin'],
          title: 'Company Dashboard'
        }
      },
      {
        path: 'company/jobs',
        name: 'CompanyJobs',
        component: () => import('../pages/company/CompanyJobsPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['company', 'admin'],
          title: 'My Job Postings'
        }
      },
      {
        path: 'company/applications',
        name: 'CompanyApplications',
        component: () => import('../pages/company/CompanyApplicationsPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['company', 'admin'],
          title: 'Applications Received'
        }
      }
    ]
  },
  
  // COURSE MANAGEMENT ROUTES
  {
    path: '/courses',
    meta: { 
      requiresAuth: true,
      module: 'courses',
      title: 'Course Management'
    },
    children: [
      // Student routes
      {
        path: 'dashboard',
        name: 'CoursesDashboard',
        component: () => import('../pages/student/CoursesDashboard.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['student', 'admin', 'teacher'],
          title: 'Courses Dashboard'
        }
      },
      {
        path: 'list',
        name: 'CoursesList',
        component: () => import('../pages/student/CoursesListPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['student', 'admin', 'teacher'],
          title: 'Available Courses'
        }
      },
      {
        path: 'my-courses',
        name: 'MyCourses',
        component: () => import('../pages/student/MyCoursesPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['student', 'admin', 'teacher'],
          title: 'My Courses'
        }
      },
      {
        path: 'course/:id',
        name: 'CourseDetail',
        component: () => import('../pages/student/CourseDetailPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['student', 'admin', 'teacher'],
          title: 'Course Details'
        }
      },
      {
        path: 'assignments',
        name: 'StudentAssignments',
        component: () => import('../pages/student/StudentAssignmentsPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['student', 'admin', 'teacher'],
          title: 'My Assignments'
        }
      },
      {
        path: 'progress',
        name: 'StudentProgress',
        component: () => import('../pages/student/StudentProgressPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['student', 'admin', 'teacher'],
          title: 'My Progress'
        }
      },
      {
        path: 'certificates',
        name: 'StudentCertificates',
        component: () => import('../pages/student/StudentCertificatesPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['student', 'admin', 'teacher'],
          title: 'My Certificates'
        }
      },
      
      // Teacher routes
      {
        path: 'teaching/dashboard',
        name: 'TeacherDashboard',
        component: () => import('../pages/teacher/TeacherDashboard.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['teacher', 'admin'],
          title: 'Teacher Dashboard'
        }
      },
      {
        path: 'teaching/courses',
        name: 'TeacherCourses',
        component: () => import('../pages/teacher/TeacherCoursesPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['teacher', 'admin'],
          title: 'My Courses'
        }
      },
      {
        path: 'teaching/create-course',
        name: 'CreateCourse',
        component: () => import('../pages/teacher/CreateCoursePage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['teacher', 'admin'],
          title: 'Create Course'
        }
      },
      {
        path: 'teaching/course/:id/edit',
        name: 'EditCourse',
        component: () => import('../pages/teacher/EditCoursePage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['teacher', 'admin'],
          title: 'Edit Course'
        }
      },
      {
        path: 'teaching/materials',
        name: 'TeacherMaterials',
        component: () => import('../pages/teacher/TeacherMaterialsPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['teacher', 'admin'],
          title: 'Course Materials'
        }
      },
      {
        path: 'teaching/assignments',
        name: 'TeacherAssignments',
        component: () => import('../pages/teacher/TeacherAssignmentsPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['teacher', 'admin'],
          title: 'Assignments'
        }
      },
      {
        path: 'teaching/grading',
        name: 'TeacherGrading',
        component: () => import('../pages/teacher/TeacherGradingPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['teacher', 'admin'],
          title: 'Grading'
        }
      },
      {
        path: 'teaching/analytics',
        name: 'TeacherAnalytics',
        component: () => import('../pages/teacher/TeacherAnalyticsPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['teacher', 'admin'],
          title: 'Class Analytics'
        }
      },
      {
        path: 'teaching/schedule',
        name: 'TeacherSchedule',
        component: () => import('../pages/teacher/TeacherSchedulePage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['teacher', 'admin'],
          title: 'Schedule & Office Hours'
        }
      },
      {
        path: 'teaching/announcements',
        name: 'TeacherAnnouncements',
        component: () => import('../pages/teacher/TeacherAnnouncementsPage.vue'),
        meta: { 
          requiresAuth: true,
          roles: ['teacher', 'admin'],
          title: 'Announcements'
        }
      }
    ]
  },
  
  // 404 Not Found
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/shared/NotFoundPage.vue'),
    meta: { 
      requiresAuth: false,
      title: 'Page Not Found'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards with enhanced permission checking
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // Initialize user if not already loaded
  if (!userStore.currentUser && !userStore.isLoading) {
    await userStore.initializeUser()
  }
  
  // Show loading state
  if (userStore.isLoading) {
    // You could show a loading component here
    next()
    return
  }
  
  // Update page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - IT Youth Talent Ghana`
  }
  
  // Check authentication requirements
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  // Check module access
  if (to.meta.module && !userStore.canAccessModule(to.meta.module)) {
    next({ name: 'Unauthorized' })
    return
  }
  
  // Check role-based access
  if (to.meta.roles) {
    const hasRequiredRole = to.meta.roles.some(role => userStore.userRole === role)
    if (!hasRequiredRole) {
      next({ name: 'Unauthorized' })
      return
    }
  }
  
  // Check custom permissions
  if (to.meta.permission && !userStore.hasPermission(to.meta.permission)) {
    next({ name: 'Unauthorized' })
    return
  }
  
  // Redirect authenticated users away from auth pages
  if (userStore.isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
    // Redirect based on user role and modules
    if (userStore.hasIncubatorAccess) {
      next({ name: 'StudentDashboard' })
    } else if (userStore.hasCoursesAccess) {
      next({ name: 'CoursesDashboard' })
    } else {
      next({ name: 'Home' })
    }
    return
  }
  
  next()
})

// Error handling
router.onError((error) => {
  console.error('Router error:', error)
  // You could navigate to an error page here
})

export default router