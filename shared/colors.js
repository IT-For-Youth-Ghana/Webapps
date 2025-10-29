/**
 * Globale Farbdefinitionen für alle IT Youth Talent Incubator Anwendungen
 * Diese Datei enthält alle Farbkonstanten die projektübergreifend verwendet werden
 */

// Primary Brand Colors
export const BRAND_COLORS = {
  PRIMARY: '#1b65b2',
  SECONDARY: '#195aa5', 
  ACCENT: '#8fb2d6',
  WHITE: '#ffffff'
  
}

// Background Colors (keep existing dark theme)
export const BACKGROUND_COLORS = {
  PRIMARY: '#0D1117',
  SECONDARY: '#161B22',
  TERTIARY: '#21262D',
  ELEVATED: '#30363D',
  OVERLAY: 'rgba(0, 0, 0, 0.7)'
}

// Text Colors
export const TEXT_COLORS = {
  PRIMARY: '#ffffff',
  SECONDARY: '#8fb2d6',
  TERTIARY: '#6E7681',
  MUTED: '#8B949E'
}

// Border Colors
export const BORDER_COLORS = {
  PRIMARY: '#30363D',
  SECONDARY: '#21262D',
  FOCUS: '#1b65b2',
  HOVER: '#484F58'
}

// Status Colors
export const STATUS_COLORS = {
  SUCCESS: '#32D74B',
  SUCCESS_HOVER: '#28CD41',
  WARNING: '#FF9F0A',
  DANGER: '#FF453A',
  DANGER_HOVER: '#D70015',
  INFO: '#1b65b2'
}

// Interactive Colors
export const INTERACTIVE_COLORS = {
  BUTTON_PRIMARY: BRAND_COLORS.PRIMARY,
  BUTTON_PRIMARY_HOVER: BRAND_COLORS.SECONDARY,
  BUTTON_SECONDARY_BG: `rgba(143, 178, 214, 0.1)`,
  BUTTON_SECONDARY_BORDER: BRAND_COLORS.ACCENT,
  BUTTON_SECONDARY_HOVER: `rgba(143, 178, 214, 0.2)`,
  LINK: BRAND_COLORS.PRIMARY,
  LINK_HOVER: BRAND_COLORS.SECONDARY
}

// Glassmorphism Effects
export const GLASS_EFFECTS = {
  SURFACE: 'rgba(255, 255, 255, 0.05)',
  SURFACE_HOVER: 'rgba(255, 255, 255, 0.08)',
  BACKDROP_BLUR: 'blur(20px)'
}

// Shadow Colors
export const SHADOW_COLORS = {
  SM: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  MD: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
  LG: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
  XL: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
  GLOW: `0 0 20px rgba(27, 101, 178, 0.3)`,
  BUTTON_PRIMARY: `0 4px 12px rgba(27, 101, 178, 0.4)`,
  BUTTON_SECONDARY: `0 4px 12px rgba(143, 178, 214, 0.25)`
}

// Status Badge Colors with transparency
export const STATUS_BADGE_COLORS = {
  PENDING: {
    bg: 'rgba(255, 159, 10, 0.1)',
    color: STATUS_COLORS.WARNING,
    border: 'rgba(255, 159, 10, 0.2)'
  },
  REVIEWING: {
    bg: 'rgba(27, 101, 178, 0.1)',
    color: BRAND_COLORS.PRIMARY,
    border: 'rgba(27, 101, 178, 0.2)'
  },
  APPROVED: {
    bg: 'rgba(50, 215, 75, 0.1)',
    color: STATUS_COLORS.SUCCESS,
    border: 'rgba(50, 215, 75, 0.2)'
  },
  REJECTED: {
    bg: 'rgba(255, 69, 58, 0.1)',
    color: STATUS_COLORS.DANGER,
    border: 'rgba(255, 69, 58, 0.2)'
  },
  INTERVIEW: {
    bg: 'rgba(143, 178, 214, 0.1)',
    color: BRAND_COLORS.ACCENT,
    border: 'rgba(143, 178, 214, 0.2)'
  }
}

// Gradient Definitions
export const GRADIENTS = {
  PRIMARY: `linear-gradient(135deg, ${BRAND_COLORS.PRIMARY} 0%, ${BRAND_COLORS.ACCENT} 100%)`,
  AVATAR: `linear-gradient(135deg, ${BRAND_COLORS.PRIMARY}, ${BRAND_COLORS.ACCENT})`,
  TEXT: `linear-gradient(135deg, ${BRAND_COLORS.PRIMARY} 0%, ${BRAND_COLORS.ACCENT} 100%)`
}

// Scrollbar Colors  
export const SCROLLBAR_COLORS = {
  TRACK: BRAND_COLORS.SECONDARY,
  THUMB: BRAND_COLORS.PRIMARY,
  THUMB_HOVER: BRAND_COLORS.ACCENT
}

// Helper function to get rgba color with custom opacity
export const withOpacity = (color, opacity) => {
  // Convert hex to rgba
  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

// Export all colors as a single object for easier importing
export const COLORS = {
  BRAND: BRAND_COLORS,
  BACKGROUND: BACKGROUND_COLORS,
  TEXT: TEXT_COLORS,
  BORDER: BORDER_COLORS,
  STATUS: STATUS_COLORS,
  INTERACTIVE: INTERACTIVE_COLORS,
  GLASS: GLASS_EFFECTS,
  SHADOW: SHADOW_COLORS,
  STATUS_BADGE: STATUS_BADGE_COLORS,
  GRADIENTS,
  SCROLLBAR: SCROLLBAR_COLORS
}