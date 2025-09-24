/**
 * Global Theme Context with complete color inversion support
 * Provides smooth theme switching with CSS custom properties
 */
import { ref, computed, watch } from 'vue'
import { DARK_THEME, LIGHT_THEME, SHADOWS } from '../themes/colors.js'

// Theme state
const currentTheme = ref('dark')
const isTransitioning = ref(false)

// Load saved theme preference
const savedTheme = localStorage.getItem('app-theme')
if (savedTheme && ['dark', 'light'].includes(savedTheme)) {
  currentTheme.value = savedTheme
}

// Theme composable
export const useTheme = () => {
  // Computed theme object
  const theme = computed(() => {
    return currentTheme.value === 'dark' ? DARK_THEME : LIGHT_THEME
  })

  // Computed shadows
  const shadows = computed(() => {
    return currentTheme.value === 'dark' ? SHADOWS.dark : SHADOWS.light
  })

  // Toggle theme with smooth transition
  const toggleTheme = () => {
    isTransitioning.value = true
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
    
    // Reset transition flag after animation
    setTimeout(() => {
      isTransitioning.value = false
    }, 300)
  }

  // Set specific theme
  const setTheme = (themeName) => {
    if (['dark', 'light'].includes(themeName)) {
      isTransitioning.value = true
      currentTheme.value = themeName
      
      setTimeout(() => {
        isTransitioning.value = false
      }, 300)
    }
  }

  return {
    currentTheme,
    theme,
    shadows,
    toggleTheme,
    setTheme,
    isTransitioning,
    isDark: computed(() => currentTheme.value === 'dark'),
    isLight: computed(() => currentTheme.value === 'light')
  }
}

// Watch for theme changes and update CSS properties
watch(currentTheme, (newTheme) => {
  // Save to localStorage
  localStorage.setItem('app-theme', newTheme)
  
  // Update CSS custom properties
  updateCSSProperties(newTheme)
  
  // Update document class for additional styling
  document.documentElement.className = newTheme + '-theme'
}, { immediate: true })

// Update CSS custom properties for smooth theme switching
const updateCSSProperties = (themeName) => {
  const root = document.documentElement
  const themeObj = themeName === 'dark' ? DARK_THEME : LIGHT_THEME
  const shadowObj = themeName === 'dark' ? SHADOWS.dark : SHADOWS.light

  // Background colors
  root.style.setProperty('--bg-primary', themeObj.bg.primary)
  root.style.setProperty('--bg-secondary', themeObj.bg.secondary)
  root.style.setProperty('--bg-tertiary', themeObj.bg.tertiary)
  root.style.setProperty('--bg-elevated', themeObj.bg.elevated)
  root.style.setProperty('--bg-overlay', themeObj.bg.overlay)

  // Text colors
  root.style.setProperty('--text-primary', themeObj.text.primary)
  root.style.setProperty('--text-secondary', themeObj.text.secondary)
  root.style.setProperty('--text-tertiary', themeObj.text.tertiary)
  root.style.setProperty('--text-disabled', themeObj.text.disabled)
  root.style.setProperty('--text-inverse', themeObj.text.inverse)

  // Border colors
  root.style.setProperty('--border-primary', themeObj.border.primary)
  root.style.setProperty('--border-secondary', themeObj.border.secondary)
  root.style.setProperty('--border-tertiary', themeObj.border.tertiary)
  root.style.setProperty('--border-focus', themeObj.border.focus)
  root.style.setProperty('--border-hover', themeObj.border.hover)

  // Interactive colors
  root.style.setProperty('--interactive-primary', themeObj.interactive.primary)
  root.style.setProperty('--interactive-primary-hover', themeObj.interactive.primaryHover)
  root.style.setProperty('--interactive-secondary', themeObj.interactive.secondary)
  root.style.setProperty('--interactive-secondary-hover', themeObj.interactive.secondaryHover)
  root.style.setProperty('--interactive-tertiary', themeObj.interactive.tertiary)
  root.style.setProperty('--interactive-tertiary-hover', themeObj.interactive.tertiaryHover)

  // Form colors
  root.style.setProperty('--form-bg', themeObj.form.background)
  root.style.setProperty('--form-border', themeObj.form.border)
  root.style.setProperty('--form-border-focus', themeObj.form.borderFocus)
  root.style.setProperty('--form-text', themeObj.form.text)
  root.style.setProperty('--form-placeholder', themeObj.form.placeholder)
  root.style.setProperty('--form-disabled', themeObj.form.disabled)

  // Status colors
  root.style.setProperty('--status-success', themeObj.status.success)
  root.style.setProperty('--status-success-border', themeObj.status.successBorder)
  root.style.setProperty('--status-warning', themeObj.status.warning)
  root.style.setProperty('--status-warning-border', themeObj.status.warningBorder)
  root.style.setProperty('--status-error', themeObj.status.error)
  root.style.setProperty('--status-error-border', themeObj.status.errorBorder)
  root.style.setProperty('--status-info', themeObj.status.info)
  root.style.setProperty('--status-info-border', themeObj.status.infoBorder)

  // Shadows
  root.style.setProperty('--shadow-sm', shadowObj.sm)
  root.style.setProperty('--shadow-md', shadowObj.md)
  root.style.setProperty('--shadow-lg', shadowObj.lg)
  root.style.setProperty('--shadow-xl', shadowObj.xl)
}

export { useTheme }
export default useTheme