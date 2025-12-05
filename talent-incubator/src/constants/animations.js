/**
 * Animation constants and configurations
 * Centralized definitions for all animations used in the application
 */

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: '150ms',
  NORMAL: '250ms',
  SLOW: '350ms',
  SLOWER: '500ms'
}

// Animation Easing Functions
export const ANIMATION_EASING = {
  SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)',
  BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
  EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)'
}

// Common Animation Configurations
export const ANIMATIONS = {
  FADE_IN: {
    duration: ANIMATION_DURATION.SLOW,
    easing: ANIMATION_EASING.SMOOTH,
    keyframes: {
      from: { opacity: 0, transform: 'translateY(10px)' },
      to: { opacity: 1, transform: 'translateY(0)' }
    }
  },
  SLIDE_UP: {
    duration: ANIMATION_DURATION.SLOW,
    easing: ANIMATION_EASING.SMOOTH,
    keyframes: {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0)' }
    }
  },
  SCALE_IN: {
    duration: ANIMATION_DURATION.NORMAL,
    easing: ANIMATION_EASING.BOUNCE,
    keyframes: {
      from: { opacity: 0, transform: 'scale(0.95)' },
      to: { opacity: 1, transform: 'scale(1)' }
    }
  },
  SPIN: {
    duration: '1s',
    easing: 'ease-in-out',
    iteration: 'infinite',
    keyframes: {
      to: { transform: 'rotate(360deg)' }
    }
  }
}

// Transition Configurations
export const TRANSITIONS = {
  ALL: `all ${ANIMATION_DURATION.NORMAL} ${ANIMATION_EASING.SMOOTH}`,
  COLOR: `color ${ANIMATION_DURATION.NORMAL} ${ANIMATION_EASING.SMOOTH}`,
  BACKGROUND: `background ${ANIMATION_DURATION.NORMAL} ${ANIMATION_EASING.SMOOTH}`,
  BORDER: `border-color ${ANIMATION_DURATION.NORMAL} ${ANIMATION_EASING.SMOOTH}`,
  TRANSFORM: `transform ${ANIMATION_DURATION.NORMAL} ${ANIMATION_EASING.SMOOTH}`,
  OPACITY: `opacity ${ANIMATION_DURATION.NORMAL} ${ANIMATION_EASING.SMOOTH}`,
  BOX_SHADOW: `box-shadow ${ANIMATION_DURATION.NORMAL} ${ANIMATION_EASING.SMOOTH}`
}

// Mobile Menu Animation Timings
export const MOBILE_MENU_ANIMATION = {
  SLIDE_DURATION: ANIMATION_DURATION.SLOW,
  OVERLAY_DURATION: ANIMATION_DURATION.NORMAL,
  HAMBURGER_DURATION: '300ms'
}

// Modal Animation Configurations
export const MODAL_ANIMATIONS = {
  BACKDROP: {
    enter: ANIMATION_DURATION.NORMAL,
    leave: ANIMATION_DURATION.NORMAL
  },
  CONTENT: {
    enter: ANIMATION_DURATION.SLOW,
    leave: ANIMATION_DURATION.NORMAL
  }
}

// Loading Animation Configurations
export const LOADING_ANIMATIONS = {
  SPINNER: {
    duration: '1s',
    easing: 'ease-in-out',
    iteration: 'infinite'
  },
  PULSE: {
    duration: '2s',
    easing: 'ease-in-out',
    iteration: 'infinite'
  },
  SKELETON: {
    duration: '1.5s',
    easing: 'ease-in-out',
    iteration: 'infinite'
  }
}