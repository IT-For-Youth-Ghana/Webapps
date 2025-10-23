<!--
🚀 IT Youth Talent Incubator - Theme Toggle Component

PURPOSE: Toggle button to switch between dark and light themes

WHAT IT DOES:
- Provides a button to toggle between dark and light themes
- Shows current theme state with icons
- Smooth transition animations
- Persists theme choice in localStorage
-->
<script setup>
import { useTheme } from '../../composables/useTheme.js'

// Use theme composable
const { currentTheme, toggleTheme, isDark } = useTheme()

// Handle theme toggle
const handleToggle = () => {
  console.log('Theme toggle clicked, current theme:', currentTheme.value)
  toggleTheme()
  console.log('Theme after toggle:', currentTheme.value)
}
</script>

<template>
  <button 
    @click="handleToggle"
    class="theme-toggle"
    :class="{ 'dark': isDark }"
    :title="`Switch to ${isDark ? 'light' : 'dark'} theme`"
    aria-label="Toggle theme"
  >
    <div class="toggle-track">
      <div class="toggle-thumb">
        <span class="theme-icon">
          {{ isDark ? '🌙' : '☀️' }}
        </span>
      </div>
    </div>
  </button>
</template>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle:hover {
  transform: scale(1.05);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.toggle-track {
  width: 52px;
  height: 28px;
  background: linear-gradient(135deg, var(--interactive-primary, #1b65b2), var(--text-secondary, #8fb2d6));
  border-radius: 24px;
  padding: 2px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(27, 101, 178, 0.2);
}

.theme-toggle.dark .toggle-track {
  background: linear-gradient(135deg, var(--bg-elevated, #30363D), var(--bg-tertiary, #21262D));
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.2);
}

.toggle-thumb {
  width: 24px;
  height: 24px;
  background: var(--bg-primary, #ffffff);
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(0);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.theme-toggle.dark .toggle-thumb {
  transform: translateX(24px);
  background: var(--bg-primary, #0D1117);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.theme-icon {
  font-size: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.theme-toggle:hover .toggle-track {
  transform: scale(1.02);
}

.theme-toggle:hover .toggle-thumb {
  transform: translateX(0) scale(1.1);
}

.theme-toggle.dark:hover .toggle-thumb {
  transform: translateX(24px) scale(1.1);
}

/* Accessibility improvements */
.theme-toggle:focus {
  outline: 2px solid var(--interactive-primary, #1b65b2);
  outline-offset: 2px;
}

.theme-toggle:focus:not(:focus-visible) {
  outline: none;
}

/* Animation for theme change */
.toggle-thumb,
.toggle-track {
  will-change: transform, background-color, box-shadow;
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  .theme-toggle,
  .toggle-track,
  .toggle-thumb,
  .theme-icon {
    transition: none;
  }
}
</style>