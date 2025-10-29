/**
 * 🚀 Responsive Design Hook
 * Provides responsive breakpoints and utilities for mobile-first design
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useResponsive() {
  const windowWidth = ref(0)
  const windowHeight = ref(0)
  
  // Breakpoints
  const breakpoints = {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  }
  
  // Update window dimensions
  const updateDimensions = () => {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
  }
  
  // Computed breakpoint states
  const isMobile = computed(() => windowWidth.value < breakpoints.md)
  const isTablet = computed(() => windowWidth.value >= breakpoints.md && windowWidth.value < breakpoints.lg)
  const isDesktop = computed(() => windowWidth.value >= breakpoints.lg)
  const isSmall = computed(() => windowWidth.value < breakpoints.sm)
  const isLarge = computed(() => windowWidth.value >= breakpoints.xl)
  
  // Current breakpoint
  const currentBreakpoint = computed(() => {
    const width = windowWidth.value
    if (width >= breakpoints['2xl']) return '2xl'
    if (width >= breakpoints.xl) return 'xl'
    if (width >= breakpoints.lg) return 'lg'
    if (width >= breakpoints.md) return 'md'
    if (width >= breakpoints.sm) return 'sm'
    return 'xs'
  })
  
  // Touch device detection
  const isTouchDevice = computed(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })
  
  // Device orientation
  const orientation = computed(() => {
    if (!windowWidth.value || !windowHeight.value) return 'unknown'
    return windowWidth.value > windowHeight.value ? 'landscape' : 'portrait'
  })
  
  // PWA detection
  const isPWA = computed(() => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://')
  })
  
  // Safe area insets (for mobile devices)
  const safeAreaInsets = computed(() => {
    const style = getComputedStyle(document.documentElement)
    return {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
    }
  })
  
  // Responsive value helper
  const responsiveValue = (values) => {
    const breakpoint = currentBreakpoint.value
    
    if (typeof values === 'string' || typeof values === 'number') {
      return values
    }
    
    // Return value for current breakpoint or fallback
    return values[breakpoint] || 
           values.lg || 
           values.md || 
           values.sm || 
           values.xs || 
           Object.values(values)[0]
  }
  
  // Grid columns based on screen size
  const gridColumns = computed(() => {
    if (isSmall.value) return 1
    if (isTablet.value) return 2
    if (isDesktop.value) return 3
    return 4
  })
  
  // Container max width
  const containerMaxWidth = computed(() => {
    const breakpoint = currentBreakpoint.value
    const widths = {
      xs: '100%',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    }
    return widths[breakpoint] || '100%'
  })
  
  // Initialize
  onMounted(() => {
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    window.addEventListener('orientationchange', updateDimensions)
  })
  
  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('resize', updateDimensions)
    window.removeEventListener('orientationchange', updateDimensions)
  })
  
  return {
    // State
    windowWidth: computed(() => windowWidth.value),
    windowHeight: computed(() => windowHeight.value),
    
    // Breakpoints
    breakpoints,
    currentBreakpoint,
    
    // Device States
    isMobile,
    isTablet,
    isDesktop,
    isSmall,
    isLarge,
    isTouchDevice,
    orientation,
    isPWA,
    
    // Layout Helpers
    gridColumns,
    containerMaxWidth,
    safeAreaInsets,
    
    // Utilities
    responsiveValue,
    updateDimensions
  }
}

export default useResponsive