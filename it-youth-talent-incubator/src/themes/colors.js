/**
 * Complete Theme Color System - Perfect Inversion
 * Blue ⇄ White theme switching with smooth transitions
 */

// Brand Colors (constant across themes)
export const BRAND = {
  primary: '#1b65b2',
  secondary: '#195aa5',
  accent: '#8fb2d6',
  success: '#32D74B',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#007AFF'
}

// Dark Theme - Current Design
export const DARK_THEME = {
  // Backgrounds (Blue family in dark theme)
  bg: {
    primary: '#0D1117',      // Main background
    secondary: '#161B22',    // Cards, modals
    tertiary: '#21262D',     // Elevated elements
    elevated: '#30363D',     // Highest elevation
    overlay: 'rgba(0, 0, 0, 0.7)'
  },
  
  // Text (White family in dark theme)
  text: {
    primary: '#ffffff',      // Main text
    secondary: '#f0f6fc',    // Secondary text
    tertiary: '#e6edf3',     // Muted text
    disabled: '#7d8590',     // Disabled text
    inverse: '#0d1117'       // Text on light backgrounds
  },
  
  // Borders (Blue-gray family)
  border: {
    primary: '#30363d',
    secondary: '#21262d', 
    tertiary: '#161b22',
    focus: '#1b65b2',
    hover: '#484f58'
  },
  
  // Interactive Elements
  interactive: {
    primary: '#1b65b2',      // Primary buttons
    primaryHover: '#195aa5',
    secondary: 'rgba(143, 178, 214, 0.1)', // Secondary buttons
    secondaryHover: 'rgba(143, 178, 214, 0.2)',
    tertiary: 'rgba(240, 246, 252, 0.1)',
    tertiaryHover: 'rgba(240, 246, 252, 0.2)'
  },
  
  // Form Elements
  form: {
    background: '#21262d',
    border: '#30363d',
    borderFocus: '#1b65b2',
    text: '#f0f6fc',
    placeholder: '#7d8590',
    disabled: '#161b22'
  },
  
  // Status Colors with transparency
  status: {
    success: 'rgba(50, 215, 75, 0.1)',
    successBorder: 'rgba(50, 215, 75, 0.3)',
    warning: 'rgba(255, 159, 10, 0.1)',
    warningBorder: 'rgba(255, 159, 10, 0.3)',
    error: 'rgba(255, 69, 58, 0.1)',
    errorBorder: 'rgba(255, 69, 58, 0.3)',
    info: 'rgba(0, 122, 255, 0.1)',
    infoBorder: 'rgba(0, 122, 255, 0.3)'
  }
}

// Light Theme - Complete Inversion
export const LIGHT_THEME = {
  // Backgrounds (White family - inverted from dark blue)
  bg: {
    primary: '#ffffff',      // White background (was dark blue)
    secondary: '#f8fafc',    // Light gray (was dark blue-gray)
    tertiary: '#f1f5f9',     // Slightly darker gray
    elevated: '#ffffff',     // Pure white for elevation
    overlay: 'rgba(15, 23, 42, 0.7)'
  },
  
  // Text (Blue family - inverted from white)
  text: {
    primary: '#0f172a',      // Dark blue text (was white)
    secondary: '#1e293b',    // Medium blue (was light gray)
    tertiary: '#334155',     // Lighter blue (was lighter gray)
    disabled: '#94a3b8',     // Light blue-gray (was dark gray)
    inverse: '#ffffff'       // White text on dark backgrounds
  },
  
  // Borders (Light gray family - inverted)
  border: {
    primary: '#e2e8f0',
    secondary: '#cbd5e1',
    tertiary: '#f1f5f9',
    focus: '#1b65b2',        // Keep brand color for focus
    hover: '#d1d5db'
  },
  
  // Interactive Elements
  interactive: {
    primary: '#1b65b2',      // Keep brand colors
    primaryHover: '#195aa5',
    secondary: 'rgba(27, 101, 178, 0.1)',
    secondaryHover: 'rgba(27, 101, 178, 0.2)',
    tertiary: 'rgba(15, 23, 42, 0.05)',
    tertiaryHover: 'rgba(15, 23, 42, 0.1)'
  },
  
  // Form Elements
  form: {
    background: '#ffffff',
    border: '#d1d5db',
    borderFocus: '#1b65b2',
    text: '#0f172a',
    placeholder: '#9ca3af',
    disabled: '#f3f4f6'
  },
  
  // Status Colors (keep same for consistency)
  status: {
    success: 'rgba(50, 215, 75, 0.1)',
    successBorder: 'rgba(50, 215, 75, 0.3)',
    warning: 'rgba(255, 159, 10, 0.1)',
    warningBorder: 'rgba(255, 159, 10, 0.3)',
    error: 'rgba(255, 69, 58, 0.1)',
    errorBorder: 'rgba(255, 69, 58, 0.3)',
    info: 'rgba(0, 122, 255, 0.1)',
    infoBorder: 'rgba(0, 122, 255, 0.3)'
  }
}

// Shadow definitions for both themes
export const SHADOWS = {
  dark: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.6)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.7)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.8)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.9)'
  },
  light: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  }
}

export default { BRAND, DARK_THEME, LIGHT_THEME, SHADOWS }