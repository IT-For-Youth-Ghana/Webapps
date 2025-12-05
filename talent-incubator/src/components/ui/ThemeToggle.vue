<!--
🎨 Professional Theme Toggle Component
Perfect color inversion switch with smooth animations
-->
<template>
  <button 
    @click="handleToggle"
    class="theme-toggle"
    :class="{ 'is-light': isLight, 'is-transitioning': isTransitioning }"
    :title="`Switch to ${isDark ? 'light' : 'dark'} theme`"
    aria-label="Toggle theme"
  >
    <div class="toggle-track">
      <div class="toggle-background"></div>
      <div class="toggle-thumb">
        <div class="toggle-icon">
          <transition name="icon-fade" mode="out-in">
            <component 
              :is="isDark ? SunIcon : MoonIcon" 
              :key="currentTheme"
            />
          </transition>
        </div>
      </div>
    </div>
    <span class="toggle-label">
      {{ isDark ? 'Light' : 'Dark' }}
    </span>
  </button>
</template>

<script setup>
import { useTheme } from '../../context/ThemeContext.js'

// Theme composable
const { 
  currentTheme, 
  toggleTheme, 
  isDark, 
  isLight, 
  isTransitioning 
} = useTheme()

// Icon components (inline SVGs for better performance)
const SunIcon = {
  template: `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <circle cx="12" cy="12" r="5"/>
      <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>
    </svg>
  `
}

const MoonIcon = {
  template: `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  `
}

// Handle toggle with haptic feedback simulation
const handleToggle = () => {
  toggleTheme()
  
  // Simulate haptic feedback on mobile
  if ('vibrate' in navigator) {
    navigator.vibrate(50)
  }
}
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.theme-toggle:hover {
  background: var(--interactive-tertiary);
  transform: scale(1.02);
}

.theme-toggle:active {
  transform: scale(0.98);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

.toggle-track {
  position: relative;
  width: 48px;
  height: 26px;
  border-radius: 13px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-primary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-background {
  position: absolute;
  top: 1px;
  left: 1px;
  right: 1px;
  bottom: 1px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  background: var(--bg-primary);
  border-radius: 50%;
  border: 1px solid var(--border-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.toggle-icon {
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 3rem;
  text-align: left;
}

/* Light theme state */
.theme-toggle.is-light .toggle-thumb {
  transform: translateX(22px);
  background: var(--interactive-primary);
  border-color: var(--interactive-primary);
}

.theme-toggle.is-light .toggle-icon {
  color: white;
}

.theme-toggle.is-light .toggle-track {
  background: var(--interactive-secondary);
  border-color: var(--border-focus);
}

/* Transitioning state */
.theme-toggle.is-transitioning .toggle-thumb {
  transform: translateX(11px) scale(0.9);
}

/* Icon transition */
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-fade-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}

.icon-fade-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.8);
}

/* Hover effects */
.theme-toggle:hover .toggle-thumb {
  transform: var(--thumb-transform, translateX(0)) scale(1.05);
  box-shadow: var(--shadow-md);
}

.theme-toggle.is-light:hover .toggle-thumb {
  --thumb-transform: translateX(22px);
}

/* Focus ring for accessibility */
.theme-toggle:focus-visible .toggle-track {
  box-shadow: 0 0 0 3px var(--border-focus);
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .theme-toggle,
  .toggle-track,
  .toggle-background,
  .toggle-thumb,
  .toggle-icon,
  .toggle-label {
    transition: none;
  }
  
  .icon-fade-enter-active,
  .icon-fade-leave-active {
    transition: none;
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .theme-toggle {
    gap: 0.5rem;
  }
  
  .toggle-label {
    font-size: 0.8rem;
    min-width: 2.5rem;
  }
  
  .toggle-track {
    width: 44px;
    height: 24px;
  }
  
  .toggle-thumb {
    width: 20px;
    height: 20px;
  }
  
  .theme-toggle.is-light .toggle-thumb {
    transform: translateX(20px);
  }
}
</style>