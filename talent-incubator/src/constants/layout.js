/**
 * Layout constants and responsive design tokens
 * Centralized definitions for spacing, breakpoints, and layout configurations
 */

// Spacing Scale
export const SPACING = {
  XS: '0.25rem',    // 4px
  SM: '0.5rem',     // 8px
  MD: '1rem',       // 16px
  LG: '1.5rem',     // 24px
  XL: '2rem',       // 32px
  '2XL': '3rem',    // 48px
  '3XL': '4rem',    // 64px
  '4XL': '6rem',    // 96px
  '5XL': '8rem'     // 128px
}

// Border Radius Scale
export const BORDER_RADIUS = {
  NONE: '0',
  SM: '0.375rem',   // 6px
  MD: '0.5rem',     // 8px
  LG: '0.75rem',    // 12px
  XL: '1rem',       // 16px
  '2XL': '1.5rem',  // 24px
  FULL: '9999px'
}

// Typography Scale
export const FONT_SIZE = {
  XS: '0.75rem',    // 12px
  SM: '0.875rem',   // 14px
  BASE: '1rem',     // 16px
  LG: '1.125rem',   // 18px
  XL: '1.25rem',    // 20px
  '2XL': '1.5rem',  // 24px
  '3XL': '1.875rem', // 30px
  '4XL': '2.25rem'  // 36px
}

// Font Weights
export const FONT_WEIGHT = {
  LIGHT: '300',
  NORMAL: '400',
  MEDIUM: '500',
  SEMIBOLD: '600',
  BOLD: '700'
}

// Line Heights
export const LINE_HEIGHT = {
  TIGHT: 1.25,
  NORMAL: 1.5,
  RELAXED: 1.6,
  LOOSE: 1.8
}

// Responsive Breakpoints
export const BREAKPOINTS = {
  SM: '480px',   // Mobile
  MD: '768px',   // Tablet
  LG: '1024px',  // Desktop
  XL: '1280px',  // Large Desktop
  '2XL': '1536px' // Extra Large Desktop
}

// Container Sizes
export const CONTAINER = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1400px'
}

// Z-Index Scale
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080
}

// Navigation Dimensions
export const NAVIGATION = {
  HEIGHT: '4rem',           // 64px
  MOBILE_HEIGHT: '4rem',    // 64px
  SIDEBAR_WIDTH: '16rem',   // 256px
  SIDEBAR_COLLAPSED: '4rem' // 64px
}

// Content Layout
export const CONTENT = {
  MAX_WIDTH: '1400px',
  PADDING_DESKTOP: SPACING.XL,
  PADDING_TABLET: SPACING.LG,
  PADDING_MOBILE: SPACING.MD
}

// Card Dimensions
export const CARD = {
  MIN_HEIGHT: '12rem',
  PADDING: SPACING.LG,
  PADDING_MOBILE: SPACING.MD,
  BORDER_RADIUS: BORDER_RADIUS.XL
}

// Form Element Dimensions
export const FORM = {
  INPUT_HEIGHT: '2.75rem',   // 44px
  INPUT_PADDING: SPACING.MD,
  BUTTON_HEIGHT: '2.75rem',  // 44px
  BUTTON_PADDING_X: SPACING.LG,
  BUTTON_PADDING_Y: SPACING.MD
}

// Avatar Sizes
export const AVATAR = {
  XS: '1.5rem',   // 24px
  SM: '2rem',     // 32px
  MD: '2.5rem',   // 40px
  LG: '3rem',     // 48px
  XL: '4rem'      // 64px
}

// Grid System
export const GRID = {
  COLUMNS: 12,
  GAP: SPACING.LG,
  GAP_MOBILE: SPACING.MD
}

// Modal Dimensions
export const MODAL = {
  MAX_WIDTH_SM: '28rem',   // 448px
  MAX_WIDTH_MD: '32rem',   // 512px
  MAX_WIDTH_LG: '42rem',   // 672px
  MAX_WIDTH_XL: '48rem',   // 768px
  MAX_WIDTH_2XL: '64rem',  // 1024px
  MAX_HEIGHT: '90vh',
  PADDING: SPACING.LG
}