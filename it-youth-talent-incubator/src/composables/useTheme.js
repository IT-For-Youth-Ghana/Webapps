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
    primary: '#0D1117',
    secondary: '#161B22',
    tertiary: '#21262D',
    elevated: '#30363D',
    overlay: 'rgba(0, 0, 0, 0.7)'
  },
  text: {
    primary: '#ffffff',
    secondary: '#8fb2d6',
    tertiary: '#6E7681',
    disabled: '#8B949E'
  },
  border: {
    primary: '#30363d',
    secondary: '#21262d',
    focus: '#1b65b2',
    hover: '#484f58'
  },
  interactive: {
    primary: '#1b65b2',
    primaryHover: '#195aa5',
    secondary: 'rgba(143, 178, 214, 0.1)',
    secondaryHover: 'rgba(143, 178, 214, 0.2)'
  }
}

const LIGHT_THEME = {
  bg: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    elevated: '#ffffff',
    overlay: 'rgba(15, 23, 42, 0.6)'
  },
  text: {
    primary: '#1b65b2', // Blue text instead of white
    secondary: '#195aa5', // Dark blue instead of light blue
    tertiary: '#0d4a8a', // Darker blue
    disabled: '#1e5a96'
  },
  border: {
    primary: '#e2e8f0',
    secondary: '#cbd5e1',
    focus: '#1b65b2',
    hover: '#d1d5db'
  },
  interactive: {
    primary: '#1b65b2',
    primaryHover: '#195aa5',
    secondary: 'rgba(27, 101, 178, 0.1)',
    secondaryHover: 'rgba(27, 101, 178, 0.2)'
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
  console.log('Updating CSS properties...')
  const root = document.documentElement
  
  // Background colors
  root.style.setProperty('--bg-primary', themeObj.bg.primary)
  console.log('Set --bg-primary to:', themeObj.bg.primary)
  root.style.setProperty('--bg-secondary', themeObj.bg.secondary)
  root.style.setProperty('--bg-tertiary', themeObj.bg.tertiary)
  root.style.setProperty('--bg-elevated', themeObj.bg.elevated)
  root.style.setProperty('--bg-overlay', themeObj.bg.overlay)
  
  // Text colors
  root.style.setProperty('--text-primary', themeObj.text.primary)
  root.style.setProperty('--text-secondary', themeObj.text.secondary)
  root.style.setProperty('--text-tertiary', themeObj.text.tertiary)
  root.style.setProperty('--text-muted', themeObj.text.disabled)
  
  // Border colors
  root.style.setProperty('--border-primary', themeObj.border.primary)
  root.style.setProperty('--border-secondary', themeObj.border.secondary)
  root.style.setProperty('--border-focus', themeObj.border.focus)
  root.style.setProperty('--border-hover', themeObj.border.hover)
  
  // Interactive colors
  root.style.setProperty('--interactive-primary', themeObj.interactive.primary)
  root.style.setProperty('--interactive-primary-hover', themeObj.interactive.primaryHover)
  root.style.setProperty('--interactive-secondary', themeObj.interactive.secondary)
  root.style.setProperty('--interactive-secondary-hover', themeObj.interactive.secondaryHover)
}