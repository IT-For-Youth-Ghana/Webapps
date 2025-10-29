/**
 * 🏗️ Course Management Router with Teacher Features
 * Role-based routing for course management platform
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'

// Route definitions - no login required
const routes = [
  // Direct dashboard route
  {
    path: '/',
    name: 'Home',
    redirect: '/student/dashboard',
    meta: { 
      title: 'Course Management - IT Youth Talent Ghana'
    }
  },
  
  // STUDENT ROUTES
  {
    path: '/student',
    meta: { 
      title: 'Student Portal'
    },
    children: [
      {
        path: 'dashboard',
        name: 'StudentDashboard',
        component: () => import('../pages/UnifiedDashboard.vue'),
        meta: { 
          title: 'Student Dashboard'
        }
      },
      {
        path: 'courses',
        name: 'StudentCourses',
        component: () => import('../pages/student/StudentCoursesPage.vue'),
        meta: { 
          title: 'My Courses'
        }
      },
      {
        path: 'assignments',
        name: 'StudentAssignments',
        component: () => import('../pages/student/StudentAssignmentsPage.vue'),
        meta: { 
          title: 'My Assignments'
        }
      },
      {
        path: 'progress',
        name: 'StudentProgress',
        component: () => import('../pages/student/StudentProgressPage.vue'),
        meta: { 
          title: 'My Progress'
        }
      }
    ]
  },
  
  // TEACHER ROUTES - PRIORITY FEATURES
  {
    path: '/teacher',
    meta: { 
      title: 'Teacher Portal'
    },
    children: [
      {
        path: 'dashboard',
        name: 'TeacherDashboard',
        component: () => import('../pages/UnifiedDashboard.vue'),
        meta: { 
          title: 'Teacher Dashboard'
        }
      },
      {
        path: 'courses',
        name: 'TeacherCourses',
        component: () => import('../pages/teacher/TeacherCoursesPage.vue'),
        meta: { 
          title: 'Course Management'
        }
      },
      {
        path: 'create-course',
        name: 'CreateCourse',
        component: () => import('../pages/teacher/CreateCoursePage.vue'),
        meta: { 
          title: 'Create Course'
        }
      },
      {
        path: 'edit-course/:id',
        name: 'EditCourse',
        component: () => import('../pages/teacher/EditCoursePage.vue'),
        meta: { 
          title: 'Edit Course'
        }
      },
      {
        path: 'materials',
        name: 'TeacherMaterials',
        component: () => import('../pages/teacher/TeacherMaterialsPage.vue'),
        meta: { 
          title: 'Learning Materials'
        }
      },
      {
        path: 'assignments',
        name: 'TeacherAssignments',
        component: () => import('../pages/teacher/TeacherAssignmentsPage.vue'),
        meta: { 
          title: 'Assignments & Grading'
        }
      },
      {
        path: 'grading',
        name: 'TeacherGrading',
        component: () => import('../pages/teacher/TeacherGradingPage.vue'),
        meta: { 
          title: 'Grading Center'
        }
      },
      {
        path: 'analytics',
        name: 'TeacherAnalytics',
        component: () => import('../pages/teacher/TeacherAnalyticsPage.vue'),
        meta: { 
          title: 'Class Analytics'
        }
      },
      {
        path: 'schedule',
        name: 'TeacherSchedule',
        component: () => import('../pages/teacher/TeacherSchedulePage.vue'),
        meta: { 
          title: 'Schedule & Office Hours'
        }
      },
      {
        path: 'announcements',
        name: 'TeacherAnnouncements',
        component: () => import('../pages/teacher/TeacherAnnouncementsPage.vue'),
        meta: { 
          title: 'Announcements'
        }
      }
    ]
  },
  
  // ADMIN ROUTES
  {
    path: '/admin',
    meta: { 
      title: 'Admin Portal'
    },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('../pages/UnifiedDashboard.vue'),
        meta: { 
          title: 'Admin Dashboard'
        }
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../pages/admin/AdminUsersPage.vue'),
        meta: { 
          title: 'User Management'
        }
      },
      {
        path: 'courses',
        name: 'AdminCourses',
        component: () => import('../pages/admin/AdminCoursesPage.vue'),
        meta: { 
          title: 'Course Management'
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

// Simple navigation guard - no authentication required
router.beforeEach(async (to, from, next) => {
  console.log('Router navigation to:', to.name, to.path)
  
  const userStore = useUserStore()
  
  // Initialize mock user if not already loaded
  if (!userStore.currentUser && !userStore.isLoading) {
    try {
      // Set user based on the route they're trying to access
      let userData = {
        id: 1,
        name: 'Kwame Student',
        email: 'kwame.student@ityouth.com',
        role: 'student',
        avatar: null,
        modules: ['courses']
      }
      
      // If accessing teacher routes, set user as teacher
      if (to.path.startsWith('/teacher') || to.name?.startsWith('Teacher')) {
        userData = {
          id: 2,
          name: 'Dr. Jane Smith',
          email: 'jane.smith@ityouth.com',
          role: 'teacher',
          avatar: null,
          modules: ['courses', 'teaching'],
          teacherId: 'TC2024001',
          department: 'Computer Science',
          specialization: 'Web Development'
        }
      }
      
      // If accessing admin routes, set user as admin
      if (to.path.startsWith('/admin') || to.name?.startsWith('Admin')) {
        userData = {
          id: 3,
          name: 'Admin User',
          email: 'admin@ityouth.com',
          role: 'admin',
          avatar: null,
          modules: ['courses', 'teaching', 'admin'],
          adminLevel: 'super',
          permissions: ['all']
        }
      }
      
      userStore.currentUser = userData
      userStore.isLoading = false
      userStore.error = null
    } catch (error) {
      console.error('User initialization failed:', error)
    }
  }
  
  // Update page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - IT Youth Talent Ghana`
  }
  
  // Allow all navigation - no auth checks
  console.log('Navigation allowed - no authentication required')
  next()
})

export default router