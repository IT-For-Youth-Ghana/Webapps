// Counter Store (Example/Template Store)
// This is a template store that should be replaced with actual application stores
//
// TODO for co-programmers:
// - Replace this example store with actual application stores:
//   * useAuthStore - for user authentication state
//   * useJobStore - for job listings and management
//   * useApplicationStore - for student applications
//   * useUserStore - for user profile and preferences
//   * useNotificationStore - for app notifications
// - Implement proper state persistence for relevant stores
// - Add loading and error states for async operations
// - Implement store composition patterns for complex state
// - Add store plugins for debugging and devtools integration

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// This example store should be removed once actual stores are implemented
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

// Example of stores that should be implemented:
//
// export const useAuthStore = defineStore('auth', () => {
//   const user = ref(null)
//   const isAuthenticated = computed(() => !!user.value)
//   const isAdmin = computed(() => user.value?.role === 'admin')
//   
//   async function login(credentials) {
//     // Authentication logic
//   }
//   
//   async function logout() {
//     // Logout logic
//   }
//   
//   return { user, isAuthenticated, isAdmin, login, logout }
// })
//
// export const useJobStore = defineStore('jobs', () => {
//   const jobs = ref([])
//   const loading = ref(false)
//   const error = ref(null)
//   
//   async function fetchJobs() {
//     // Fetch jobs logic
//   }
//   
//   async function createJob(jobData) {
//     // Create job logic
//   }
//   
//   return { jobs, loading, error, fetchJobs, createJob }
// })
