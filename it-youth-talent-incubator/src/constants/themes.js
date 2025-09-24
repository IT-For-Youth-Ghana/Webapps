/**
 * Theme Constants for IT Youth Talent Incubator
 * 
 * Defines dark and light theme variations of the existing design
 * Maintains the same brand colors and design tokens while providing 
 * appropriate contrast for both themes
 */
import { BRAND_COLORS, STATUS_COLORS, INTERACTIVE_COLORS, STATUS_BADGE_COLORS, GRADIENTS, SHADOW_COLORS, SCROLLBAR_COLORS } from './colors.js'
import { SPACING, BORDER_RADIUS, FONT_SIZE } from './layout.js'
import { ANIMATION_DURATION, ANIMATION_EASING } from './animations.js'

// Dark Theme (existing theme)
export const DARK_THEME = {
  colors: {
    BRAND: BRAND_COLORS,
    
    // Dark theme backgrounds
    BACKGROUND: {
      PRIMARY: '#0D1117',
      SECONDARY: '#161B22',
      TERTIARY: '#21262D', 
      ELEVATED: '#30363D',
      OVERLAY: 'rgba(0, 0, 0, 0.7)'
    },
    
    // Dark theme text
    TEXT: {
      PRIMARY: '#ffffff',
      SECONDARY: '#8fb2d6',
      TERTIARY: '#6E7681',
      MUTED: '#8B949E'
    },
    
    // Dark theme borders
    BORDER: {
      PRIMARY: '#30363D',
      SECONDARY: '#21262D',
      FOCUS: '#1b65b2',
      HOVER: '#484F58'
    },
    
    // Dark theme glass effects
    GLASS: {
      SURFACE: 'rgba(255, 255, 255, 0.05)',
      SURFACE_HOVER: 'rgba(255, 255, 255, 0.08)',
      BACKDROP_BLUR: 'blur(20px)'
    },
    
    STATUS: STATUS_COLORS,
    INTERACTIVE: INTERACTIVE_COLORS,
    STATUS_BADGE: STATUS_BADGE_COLORS,
    GRADIENTS,
    SHADOW: SHADOW_COLORS,
    SCROLLBAR: SCROLLBAR_COLORS
  },
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  fontSize: FONT_SIZE,
  animation: {
    duration: ANIMATION_DURATION,
    easing: ANIMATION_EASING
  },
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
    }
  }
}

// Light Theme (inverted - dark blue becomes white, white becomes blue)
export const LIGHT_THEME = {
  colors: {
    BRAND: BRAND_COLORS, // Keep same brand colors
    
    // Light theme backgrounds (white where it was dark blue)
    BACKGROUND: {
      PRIMARY: '#ffffff',
      SECONDARY: '#f8fafc', 
      TERTIARY: '#f1f5f9',
      ELEVATED: '#ffffff',
      OVERLAY: 'rgba(15, 23, 42, 0.6)'
    },
    
    // Light theme text (blue where it was white)
    TEXT: {
      PRIMARY: '#1b65b2', // Blue instead of white
      SECONDARY: '#195aa5', // Dark blue instead of light blue
      TERTIARY: '#0d4a8a', // Darker blue
      MUTED: '#1e5a96'
    },
    
    // Light theme borders
    BORDER: {
      PRIMARY: '#e2e8f0',
      SECONDARY: '#cbd5e1',
      FOCUS: '#1b65b2',
      HOVER: '#d1d5db'
    },
    
    // Light theme glass effects (blue tint instead of white)
    GLASS: {
      SURFACE: 'rgba(27, 101, 178, 0.08)',
      SURFACE_HOVER: 'rgba(27, 101, 178, 0.12)',
      BACKDROP_BLUR: 'blur(20px)'
    },
    
    STATUS: STATUS_COLORS, // Keep same status colors for consistency
    INTERACTIVE: {
      BUTTON_PRIMARY: BRAND_COLORS.PRIMARY,
      BUTTON_PRIMARY_HOVER: BRAND_COLORS.SECONDARY,
      BUTTON_SECONDARY_BG: `rgba(143, 178, 214, 0.1)`,
      BUTTON_SECONDARY_BORDER: BRAND_COLORS.ACCENT,
      BUTTON_SECONDARY_HOVER: `rgba(143, 178, 214, 0.2)`,
      LINK: BRAND_COLORS.PRIMARY,
      LINK_HOVER: BRAND_COLORS.SECONDARY
    },
    STATUS_BADGE: STATUS_BADGE_COLORS, // Keep same badge colors
    GRADIENTS,
    
    // Light theme shadows
    SHADOW: {
      SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      GLOW: `0 0 20px rgba(27, 101, 178, 0.15)`,
      BUTTON_PRIMARY: `0 4px 12px rgba(27, 101, 178, 0.25)`,
      BUTTON_SECONDARY: `0 4px 12px rgba(143, 178, 214, 0.15)`
    },
    
    // Light theme scrollbar
    SCROLLBAR: {
      TRACK: '#f1f5f9',
      THUMB: BRAND_COLORS.ACCENT,
      THUMB_HOVER: BRAND_COLORS.PRIMARY
    }
  },
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  fontSize: FONT_SIZE,
  animation: {
    duration: ANIMATION_DURATION,
    easing: ANIMATION_EASING
  },
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
    }
  }
}