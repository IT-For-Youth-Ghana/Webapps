/**
 * 🔗 Cross-Platform User Store (Pinia)
 * Shared user state management for Incubator & Course Management
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { USER_ROLES, ROLE_PERMISSIONS } from '../types/user.types.js'
import AuthService from '../auth/AuthService.js'

export const useUserStore = defineStore('user', () => {
  // State
  const currentUser = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  
  // Computed
  const isAuthenticated = computed(() => !!currentUser.value)
  const userRole = computed(() => currentUser.value?.role || USER_ROLES.GUEST)
  const userModules = computed(() => currentUser.value?.modules || [])
  const userPermissions = computed(() => ROLE_PERMISSIONS[userRole.value] || ROLE_PERMISSIONS[USER_ROLES.GUEST])
  
  // Helper computed properties
  const isStudent = computed(() => userRole.value === USER_ROLES.STUDENT)
  const isAdmin = computed(() => userRole.value === USER_ROLES.ADMIN)
  const isTeacher = computed(() => userRole.value === USER_ROLES.TEACHER)
  const isGuest = computed(() => userRole.value === USER_ROLES.GUEST)
  const isCompany = computed(() => userRole.value === USER_ROLES.COMPANY)
  
  // Multi-platform user check
  const hasIncubatorAccess = computed(() => userModules.value.includes('incubator'))
  const hasCoursesAccess = computed(() => userModules.value.includes('courses'))
  const hasTeachingAccess = computed(() => userModules.value.includes('teaching'))
  const hasAdminAccess = computed(() => userModules.value.includes('admin'))
  
  // Role display helper
  const userRoleDisplay = computed(() => {
    const roleNames = {
      [USER_ROLES.STUDENT]: 'Student',
      [USER_ROLES.TEACHER]: 'Teacher', 
      [USER_ROLES.ADMIN]: 'Administrator',
      [USER_ROLES.GUEST]: 'Guest',
      [USER_ROLES.COMPANY]: 'Company'
    }
    return roleNames[userRole.value] || 'Guest'
  })
  
  // Permission checking
  const hasPermission = (permission) => {
    return userPermissions.value.features.includes(permission)
  }
  
  const canAccessRoute = (route) => {
    return userPermissions.value.routes.some(allowedRoute => {
      if (allowedRoute.includes('*')) {
        const baseRoute = allowedRoute.replace('*', '')
        return route.startsWith(baseRoute)
      }
      return allowedRoute === route
    })
  }
  
  const canAccessModule = (module) => {
    return userModules.value.includes(module)
  }
  
  // Actions
  const initializeUser = async () => {
    if (isLoading.value) return
    
    isLoading.value = true
    error.value = null
    
    try {
      const authService = new AuthService(import.meta.env.VITE_API_URL || 'http://localhost:3000')
      
      if (authService.isAuthenticated()) {
        // Try to get fresh profile from backend
        try {
          const profile = await authService.getProfile()
          currentUser.value = createProfileFromAuth(profile)
        } catch (profileError) {
          // Fallback to stored user data
          const storedUser = authService.getUser()
          if (storedUser) {
            currentUser.value = createProfileFromAuth(storedUser)
          }
        }
      }
    } catch (err) {
      console.error('User initialization error:', err)
      error.value = 'Failed to initialize user'
      
      // Clear corrupted auth data
      const authService = new AuthService(import.meta.env.VITE_API_URL || 'http://localhost:3000')
      authService.clearAuth()
      currentUser.value = null
    } finally {
      isLoading.value = false
    }
  }
  
  const login = async (loginData) => {
    if (isLoading.value) return
    
    isLoading.value = true
    error.value = null
    
    try {
      // Demo authentication for development
      const demoUsers = {
        'student@demo.com': {
          id: 'demo-student-1',
          name: 'John Doe',
          email: 'student@demo.com',
          role: USER_ROLES.STUDENT,
          modules: ['courses'],
          avatar: null,
          studentId: 'ST2024001',
          level: 'Undergraduate',
          major: 'Computer Science'
        },
        'teacher@demo.com': {
          id: 'demo-teacher-1',
          name: 'Dr. Jane Smith',
          email: 'teacher@demo.com',
          role: USER_ROLES.TEACHER,
          modules: ['courses', 'teaching'],
          avatar: null,
          teacherId: 'TC2024001',
          department: 'Computer Science',
          specialization: 'Web Development'
        },
        'admin@demo.com': {
          id: 'demo-admin-1',
          name: 'Admin User',
          email: 'admin@demo.com',
          role: USER_ROLES.ADMIN,
          modules: ['courses', 'teaching', 'admin'],
          avatar: null,
          adminLevel: 'super',
          permissions: ['all']
        }
      }
      
      // Check demo credentials
      const demoUser = demoUsers[loginData.email]
      if (demoUser && loginData.password === 'demo123') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        currentUser.value = createProfileFromAuth(demoUser)
        
        // Store authentication
        const authData = {
          token: 'demo-jwt-token',
          refreshToken: 'demo-refresh-token',
          user: demoUser
        }
        
        localStorage.setItem('auth_token', authData.token)
        localStorage.setItem('refresh_token', authData.refreshToken)
        localStorage.setItem('user', JSON.stringify(demoUser))
        
        if (loginData.rememberMe) {
          localStorage.setItem('remember_login', 'true')
        }
        
        return {
          success: true,
          user: currentUser.value,
          message: 'Login successful'
        }
      }
      
      // Try real authentication service if available
      try {
        const authService = new AuthService(import.meta.env.VITE_API_URL || 'http://localhost:3000')
        const response = await authService.login(loginData.email, loginData.password)
        
        currentUser.value = createProfileFromAuth(response.user)
        
        return {
          success: true,
          user: currentUser.value,
          message: 'Login successful'
        }
      } catch (authError) {
        // Return demo auth error if no real service
        return {
          success: false,
          message: 'Invalid email or password. Try demo accounts: student@demo.com, teacher@demo.com, admin@demo.com (password: demo123)'
        }
      }
      
    } catch (err) {
      error.value = err.message || 'Login failed'
      return {
        success: false,
        error: error.value
      }
    } finally {
      isLoading.value = false
    }
  }
  
  const register = async (userData) => {
    if (isLoading.value) return
    
    isLoading.value = true
    error.value = null
    
    try {
      const authService = new AuthService(import.meta.env.VITE_API_URL || 'http://localhost:3000')
      const response = await authService.register(userData)
      
      currentUser.value = createProfileFromAuth(response.user)
      
      return {
        success: true,
        user: currentUser.value,
        message: 'Registration successful'
      }
    } catch (err) {
      error.value = err.message || 'Registration failed'
      return {
        success: false,
        error: error.value
      }
    } finally {
      isLoading.value = false
    }
  }
  
  const logout = async () => {
    try {
      const authService = new AuthService(import.meta.env.VITE_API_URL || 'http://localhost:3000')
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      currentUser.value = null
      error.value = null
    }
  }
  
  const updateProfile = async (profileData) => {
    if (!currentUser.value || isLoading.value) return
    
    isLoading.value = true
    error.value = null
    
    try {
      const authService = new AuthService(import.meta.env.VITE_API_URL || 'http://localhost:3000')
      const updatedUser = await authService.updateProfile(profileData)
      
      currentUser.value = { ...currentUser.value, ...createProfileFromAuth(updatedUser) }
      
      return {
        success: true,
        user: currentUser.value,
        message: 'Profile updated successfully'
      }
    } catch (err) {
      error.value = err.message || 'Profile update failed'
      return {
        success: false,
        error: error.value
      }
    } finally {
      isLoading.value = false
    }
  }
  
  const switchRole = (newRole) => {
    if (!currentUser.value) return
    
    // For demo purposes, allow any authenticated user to switch roles
    // In production, this would be restricted to admins only
    const newPermissions = ROLE_PERMISSIONS[newRole]
    if (!newPermissions) {
      console.warn('Invalid role:', newRole)
      return
    }
    
    currentUser.value = {
      ...currentUser.value,
      role: newRole,
      modules: newPermissions.modules
    }
    
    // Update local storage
    localStorage.setItem('user', JSON.stringify(currentUser.value))
    
    console.log(`Role switched to: ${newRole}`)
  }
  
  // Helper function to create profile from auth response
  const createProfileFromAuth = (authUser) => {
    return {
      id: authUser.id || authUser._id,
      name: authUser.name || `${authUser.firstName} ${authUser.lastName}`.trim(),
      email: authUser.email,
      role: authUser.role || USER_ROLES.STUDENT,
      modules: authUser.modules || ROLE_PERMISSIONS[authUser.role || USER_ROLES.STUDENT].modules,
      avatar: authUser.avatar,
      bio: authUser.bio,
      phone: authUser.phone,
      location: authUser.location,
      website: authUser.website,
      social: authUser.social,
      preferences: {
        theme: authUser.preferences?.theme || 'dark',
        language: authUser.preferences?.language || 'en',
        notifications: authUser.preferences?.notifications ?? true,
        emailNotifications: authUser.preferences?.emailNotifications ?? true
      },
      createdAt: authUser.createdAt || new Date().toISOString(),
      lastLogin: authUser.lastLogin || new Date().toISOString(),
      isActive: authUser.isActive ?? true,
      
      // Role-specific fields
      studentId: authUser.studentId,
      level: authUser.level,
      major: authUser.major,
      gpa: authUser.gpa,
      
      teacherId: authUser.teacherId,
      department: authUser.department,
      specialization: authUser.specialization,
      rating: authUser.rating,
      coursesTaught: authUser.coursesTaught,
      
      adminLevel: authUser.adminLevel,
      permissions: authUser.permissions,
      
      companyId: authUser.companyId,
      company: authUser.company,
      position: authUser.position,
      industry: authUser.industry
    }
  }
  
  return {
    // State
    currentUser,
    isLoading,
    error,
    
    // Computed
    isAuthenticated,
    userRole,
    userRoleDisplay,
    userModules,
    userPermissions,
    isStudent,
    isAdmin,
    isTeacher,
    isGuest,
    isCompany,
    hasIncubatorAccess,
    hasCoursesAccess,
    hasTeachingAccess,
    hasAdminAccess,
    
    // Methods
    hasPermission,
    canAccessRoute,
    canAccessModule,
    initializeUser,
    login,
    register,
    logout,
    updateProfile,
    switchRole
  }
})