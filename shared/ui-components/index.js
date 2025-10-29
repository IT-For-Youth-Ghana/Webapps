/**
 * 🚀 Shared UI Components for IT Youth Talent Incubator & Course Management
 * 
 * PURPOSE: Reusable UI components that maintain consistent design across platforms
 * - Responsive layouts with PWA support
 * - Theme system with light/dark mode
 * - Glass morphism design elements
 * - Mobile-first responsive approach
 */

export { default as BaseLayout } from './layouts/BaseLayout.vue'
export { default as CourseCard } from './components/CourseCard.vue'
export { default as DashboardCard } from './components/DashboardCard.vue'
export { default as NavigationBar } from './components/NavigationBar.vue'
export { default as ThemeToggle } from './components/ThemeToggle.vue'

// Export shared styles
export { default as sharedStyles } from './styles/shared.css'