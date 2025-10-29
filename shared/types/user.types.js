/**
 * 🔐 Enhanced User Types & Role Management
 * Cross-platform user profiles with role-based access control
 */

export const USER_ROLES = {
  GUEST: 'guest',
  STUDENT: 'student', 
  ADMIN: 'admin',
  TEACHER: 'teacher',
  COMPANY: 'company'
}

export const USER_MODULES = {
  INCUBATOR: 'incubator',
  COURSES: 'courses',
  ADMIN: 'admin',
  TEACHING: 'teaching'
}

export const ROLE_PERMISSIONS = {
  [USER_ROLES.GUEST]: {
    modules: [],
    routes: ['/login', '/register', '/about'],
    features: ['view_public_courses']
  },
  
  [USER_ROLES.STUDENT]: {
    modules: [USER_MODULES.INCUBATOR, USER_MODULES.COURSES],
    routes: [
      '/talent/student/*',
      '/courses/*',
      '/profile/*'
    ],
    features: [
      'view_courses',
      'enroll_courses', 
      'submit_assignments',
      'view_progress',
      'apply_jobs',
      'manage_applications'
    ]
  },
  
  [USER_ROLES.ADMIN]: {
    modules: [USER_MODULES.INCUBATOR, USER_MODULES.COURSES, USER_MODULES.ADMIN],
    routes: [
      '/talent/*',
      '/courses/*', 
      '/admin/*',
      '/teaching/*'
    ],
    features: [
      'view_all_courses',
      'manage_courses',
      'manage_users',
      'view_analytics',
      'system_settings',
      'manage_jobs',
      'view_all_applications'
    ]
  },
  
  [USER_ROLES.TEACHER]: {
    modules: [USER_MODULES.COURSES, USER_MODULES.TEACHING, USER_MODULES.INCUBATOR],
    routes: [
      '/courses/*',
      '/teaching/*',
      '/talent/mentor/*'
    ],
    features: [
      'create_courses',
      'manage_own_courses',
      'upload_materials',
      'create_assignments',
      'grade_assignments',
      'manage_students',
      'view_analytics',
      'schedule_meetings',
      'communicate_students'
    ]
  },
  
  [USER_ROLES.COMPANY]: {
    modules: [USER_MODULES.INCUBATOR],
    routes: [
      '/talent/company/*',
      '/jobs/post',
      '/applications/manage'
    ],
    features: [
      'post_jobs',
      'view_applications',
      'manage_job_posts',
      'contact_students'
    ]
  }
}

// JavaScript implementation without TypeScript interfaces
// Type definitions are handled via JSDoc comments for IDE support