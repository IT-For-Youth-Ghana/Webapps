// Router Configuration for IT Youth Talent Incubator
// Defines all application routes and navigation logic
//
// TODO for co-programmers:
// - Add authentication guards for protected routes
// - Implement role-based routing (student vs admin routes)
// - Add route definitions for all pages (login, register, dashboard, etc.)
// - Set up nested routes for admin and student sections
// - Add route meta fields for page titles and permissions
// - Implement route transition animations
// - Add lazy loading for route components
// - Set up redirect logic for unauthenticated users
// - Add 404 not found route handling

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../pages/HomePage.vue'),
      meta: { requiresAuth: false }
    },
    
    // TALENT INCUBATOR ROUTES (Jobs & Applications)
    {
      path: '/talent',
      children: [
        {
          path: 'student/dashboard',
          name: 'StudentDashboard',
          component: () => import('../pages/StudentDashboard.vue'),
          meta: { requiresAuth: true, role: 'student' }
        },
        {
          path: 'student/jobs',
          name: 'StudentJobs',
          component: () => import('../pages/StudentJobsPage.vue'),
          meta: { requiresAuth: true, role: 'student' }
        },
        {
          path: 'student/applications',
          name: 'StudentApplications',
          component: () => import('../pages/StudentApplicationsPage.vue'),
          meta: { requiresAuth: true, role: 'student' }
        },
        {
          path: 'admin/dashboard',
          name: 'AdminDashboard',
          component: () => import('../pages/AdminDashboard.vue'),
          meta: { requiresAuth: true, role: 'admin' }
        },
        {
          path: 'admin/jobs',
          name: 'AdminJobs',
          component: () => import('../pages/AdminJobsPage.vue'),
          meta: { requiresAuth: true, role: 'admin' }
        },
        {
          path: 'admin/students',
          name: 'AdminStudents',
          component: () => import('../pages/AdminStudentsPage.vue'),
          meta: { requiresAuth: true, role: 'admin' }
        },
        {
          path: 'company/dashboard',
          name: 'CompanyDashboard',
          component: () => import('../pages/CompanyDashboard.vue'),
          meta: { requiresAuth: true, role: 'company' }
        }
      ]
    }
  ],
})

// Navigation guards will be added here
// router.beforeEach((to, from, next) => {
//   // Authentication and authorization logic
// })

export default router
