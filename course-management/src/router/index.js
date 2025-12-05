import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/courses',
    name: 'Courses',
    component: () => import('../pages/CoursesPage.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../pages/CoursesDashboard.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router