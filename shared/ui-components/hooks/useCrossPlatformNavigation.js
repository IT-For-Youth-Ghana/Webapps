/**
 * 🚀 Cross-Platform Navigation Hook
 * Enables seamless navigation between Incubator and Course Management platforms
 */

import { ref, computed } from 'vue'

export function useCrossPlatformNavigation() {
  const currentPlatform = ref('incubator')
  const isNavigating = ref(false)
  
  // Platform configurations
  const platforms = {
    incubator: {
      name: 'Talent Incubator',
      icon: '💼',
      baseUrl: 'http://localhost:5173',
      routes: {
        dashboard: '/talent/student/dashboard',
        adminDashboard: '/talent/admin/dashboard',
        jobs: '/talent/student/jobs',
        applications: '/talent/student/applications',
        adminJobs: '/talent/admin/jobs',
        students: '/talent/admin/students'
      }
    },
    courses: {
      name: 'Course Management',
      icon: '📚',
      baseUrl: 'http://localhost:5174',
      routes: {
        dashboard: '/courses/dashboard',
        list: '/courses/list',
        manage: '/courses/manage',
        progress: '/courses/progress',
        certificates: '/courses/certificates'
      }
    }
  }
  
  // Get current platform info
  const currentPlatformInfo = computed(() => {
    return platforms[currentPlatform.value]
  })
  
  // Detect current platform from URL
  const detectCurrentPlatform = () => {
    const hostname = window.location.hostname
    const port = window.location.port
    
    if (port === '5173') {
      currentPlatform.value = 'incubator'
    } else if (port === '5174') {
      currentPlatform.value = 'courses'
    }
    
    return currentPlatform.value
  }
  
  // Navigate to different platform
  const navigateToPlatform = (platform, route = null) => {
    if (isNavigating.value) return
    
    isNavigating.value = true
    
    try {
      const platformInfo = platforms[platform]
      if (!platformInfo) {
        console.error(`Platform ${platform} not found`)
        return
      }
      
      let url = platformInfo.baseUrl
      
      if (route) {
        if (route.startsWith('/')) {
          url += route
        } else if (platformInfo.routes[route]) {
          url += platformInfo.routes[route]
        } else {
          console.warn(`Route ${route} not found for platform ${platform}`)
        }
      }
      
      // Store navigation state in sessionStorage for smooth transition
      sessionStorage.setItem('crossPlatformNavigation', JSON.stringify({
        from: currentPlatform.value,
        to: platform,
        timestamp: Date.now()
      }))
      
      // Navigate
      window.location.href = url
      
    } catch (error) {
      console.error('Navigation error:', error)
      isNavigating.value = false
    }
  }
  
  // Get user modules from auth service
  const getUserModules = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.modules || []
  }
  
  // Check if user can access platform
  const canAccessPlatform = (platform) => {
    const modules = getUserModules()
    const moduleMap = {
      incubator: 'incubator',
      courses: 'courses'
    }
    
    return modules.includes(moduleMap[platform])
  }
  
  // Get accessible platforms for current user
  const getAccessiblePlatforms = () => {
    const modules = getUserModules()
    return Object.keys(platforms).filter(platform => {
      const moduleMap = {
        incubator: 'incubator',
        courses: 'courses'
      }
      return modules.includes(moduleMap[platform])
    })
  }
  
  // Initialize
  detectCurrentPlatform()
  
  return {
    currentPlatform: computed(() => currentPlatform.value),
    currentPlatformInfo,
    platforms,
    isNavigating: computed(() => isNavigating.value),
    navigateToPlatform,
    detectCurrentPlatform,
    getUserModules,
    canAccessPlatform,
    getAccessiblePlatforms
  }
}

export default useCrossPlatformNavigation