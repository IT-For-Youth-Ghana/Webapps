import { COLORS } from '../constants/colors.js'
import { SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants/layout.js'
import { ANIMATION_DURATION, ANIMATION_EASING } from '../constants/animations.js'

/**
 * Centralized theme configuration using design tokens
 * This theme object combines all design constants for consistent styling
 */
export const theme = {
  colors: COLORS,
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