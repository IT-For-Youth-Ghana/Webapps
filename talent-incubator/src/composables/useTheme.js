/**
 * Theme Management Composable
 * 
 * Provides theme switching functionality between dark and light modes
 * Persists theme preference in localStorage
 */
import { ref, computed, watch } from 'vue'

// Theme definitions directly in composable
const DARK_THEME = {
  bg: {
    primary: '#0D1117',        // Dark main background
    secondary: '#161B22',      // Dark cards
    tertiary: '#21262D',       // Dark elevated elements
    elevated: '#30363D',       // Highest elevation
    overlay: 'rgba(0, 0, 0, 0.7)'
  },
  text: {
    primary: '#ffffff',        // White main text
    secondary: '#8fb2d6',      // Light blue secondary text
    tertiary: '#6E7681',       // Gray tertiary text
    disabled: '#8B949E',       // Disabled text
    inverse: '#0D1117'         // Dark text for light backgrounds
  },
  border: {
    primary: '#30363d',        // Dark borders
    secondary: '#21262d',      // Darker borders
    tertiary: '#161b22',       // Darkest borders
    focus: '#1b65b2',          // Blue focus ring
    hover: '#484f58'           // Hover borders
  },
  interactive: {
    primary: '#1b65b2',        // Primary buttons
    primaryHover: '#195aa5',   // Primary hover
    secondary: 'rgba(143, 178, 214, 0.1)',     // Secondary buttons
    secondaryHover: 'rgba(143, 178, 214, 0.2)', // Secondary hover
    tertiary: 'rgba(255, 255, 255, 0.05)',     // Tertiary buttons
    tertiaryHover: 'rgba(255, 255, 255, 0.1)'  // Tertiary hover
  },
  form: {
    background: '#21262d',     // Form field backgrounds
    border: '#30363d',        // Form field borders
    borderFocus: '#1b65b2',   // Form field focus
    text: '#ffffff',          // Form text (white)
    placeholder: '#6e7681',   // Placeholder text
    disabled: '#161b22'       // Disabled form fields
  },
  status: {
    success: 'rgba(50, 215, 75, 0.1)',         // Success backgrounds
    successBorder: 'rgba(50, 215, 75, 0.3)',
    successText: '#32D74B',
    warning: 'rgba(255, 159, 10, 0.1)',        // Warning backgrounds
    warningBorder: 'rgba(255, 159, 10, 0.3)',
    warningText: '#FF9F0A',
    error: 'rgba(255, 69, 58, 0.1)',           // Error backgrounds
    errorBorder: 'rgba(255, 69, 58, 0.3)',
    errorText: '#FF453A',
    info: 'rgba(27, 101, 178, 0.1)',           // Info backgrounds
    infoBorder: 'rgba(27, 101, 178, 0.3)',
    infoText: '#1b65b2'
  }
}

const LIGHT_THEME = {
  bg: {
    primary: '#ffffff',        // Pure white main background
    secondary: '#f8fafc',      // Very light gray cards
    tertiary: '#f1f5f9',       // Light gray elevated elements  
    elevated: '#ffffff',       // White elevated elements
    overlay: 'rgba(15, 23, 42, 0.6)'
  },
  text: {
    primary: '#0f172a',        // Dark blue-gray text (main text)
    secondary: '#1b65b2',      // Brand blue (secondary text)
    tertiary: '#334155',       // Medium blue-gray
    disabled: '#64748b',       // Light blue-gray (disabled)
    inverse: '#ffffff'         // White text for dark backgrounds
  },
  border: {
    primary: '#e2e8f0',        // Light gray borders
    secondary: '#cbd5e1',      // Medium gray borders
    tertiary: '#f1f5f9',       // Very light borders
    focus: '#1b65b2',          // Blue focus ring
    hover: '#d1d5db'           // Hover state borders
  },
  interactive: {
    primary: '#1b65b2',        // Primary buttons (blue)
    primaryHover: '#195aa5',   // Primary button hover
    secondary: 'rgba(27, 101, 178, 0.08)', // Secondary buttons
    secondaryHover: 'rgba(27, 101, 178, 0.12)', // Secondary hover
    tertiary: 'rgba(15, 23, 42, 0.04)',     // Tertiary buttons  
    tertiaryHover: 'rgba(15, 23, 42, 0.08)'  // Tertiary hover
  },
  form: {
    background: '#ffffff',     // Form field backgrounds
    border: '#d1d5db',        // Form field borders
    borderFocus: '#1b65b2',   // Form field focus
    text: '#0f172a',          // Form text
    placeholder: '#9ca3af',   // Placeholder text
    disabled: '#f3f4f6'       // Disabled form fields
  },
  status: {
    success: 'rgba(34, 197, 94, 0.1)',      // Success backgrounds
    successBorder: 'rgba(34, 197, 94, 0.3)',
    successText: '#166534',
    warning: 'rgba(245, 158, 11, 0.1)',     // Warning backgrounds  
    warningBorder: 'rgba(245, 158, 11, 0.3)',
    warningText: '#92400e',
    error: 'rgba(239, 68, 68, 0.1)',        // Error backgrounds
    errorBorder: 'rgba(239, 68, 68, 0.3)',
    errorText: '#991b1b',
    info: 'rgba(59, 130, 246, 0.1)',        // Info backgrounds
    infoBorder: 'rgba(59, 130, 246, 0.3)',
    infoText: '#1e40af'
  }
}

// Global theme state
const currentTheme = ref('dark') // 'dark' or 'light'

// Load theme from localStorage on initialization
const savedTheme = localStorage.getItem('theme')
if (savedTheme && ['dark', 'light'].includes(savedTheme)) {
  currentTheme.value = savedTheme
}

export const useTheme = () => {
  // Computed theme object
  const theme = computed(() => {
    return currentTheme.value === 'dark' ? DARK_THEME : LIGHT_THEME
  })

  // Toggle theme function
  const toggleTheme = () => {
    console.log('Toggling theme from:', currentTheme.value)
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
    console.log('Theme changed to:', currentTheme.value)
  }

  // Set specific theme
  const setTheme = (themeName) => {
    if (['dark', 'light'].includes(themeName)) {
      currentTheme.value = themeName
    }
  }

  // Watch for theme changes and persist to localStorage
  watch(currentTheme, (newTheme) => {
    console.log('Theme watcher triggered:', newTheme)
    localStorage.setItem('theme', newTheme)
    // Update CSS custom properties for reactive styling
    const themeObj = newTheme === 'dark' ? DARK_THEME : LIGHT_THEME
    console.log('Applying theme object:', themeObj)
    updateCSSProperties(themeObj)
    
    // Force immediate update
    setTimeout(() => {
      updateCSSProperties(themeObj)
    }, 100)
  }, { immediate: true })

  return {
    currentTheme,
    theme,
    toggleTheme,
    setTheme,
    isDark: computed(() => currentTheme.value === 'dark'),
    isLight: computed(() => currentTheme.value === 'light')
  }
}

// Update CSS custom properties for dynamic theming
const updateCSSProperties = (themeObj) => {
  console.log('Updating CSS properties for:', themeObj === DARK_THEME ? 'DARK' : 'LIGHT', 'theme')
  const root = document.documentElement
  
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
  root.style.setProperty('--status-success-text', themeObj.status.successText)
  root.style.setProperty('--status-warning', themeObj.status.warning)
  root.style.setProperty('--status-warning-border', themeObj.status.warningBorder)
  root.style.setProperty('--status-warning-text', themeObj.status.warningText)
  root.style.setProperty('--status-error', themeObj.status.error)
  root.style.setProperty('--status-error-border', themeObj.status.errorBorder)
  root.style.setProperty('--status-error-text', themeObj.status.errorText)
  root.style.setProperty('--status-info', themeObj.status.info)
  root.style.setProperty('--status-info-border', themeObj.status.infoBorder)
  root.style.setProperty('--status-info-text', themeObj.status.infoText)
  
  console.log('✅ Theme variables updated successfully!')
}