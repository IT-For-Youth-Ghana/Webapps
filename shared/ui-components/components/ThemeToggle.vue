<template>
  <button 
    class="theme-toggle"
    @click="toggleTheme"
    :title="`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`"
    :aria-label="`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`"
  >
    <span class="theme-icon">
      <transition name="theme-switch" mode="out-in">
        <span 
          :key="currentTheme" 
          class="icon"
          v-text="currentTheme === 'dark' ? '🌙' : '☀️'"
        ></span>
      </transition>
    </span>
    <span class="theme-label" v-if="showLabel">
      {{ currentTheme === 'dark' ? 'Dark' : 'Light' }}
    </span>
  </button>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'ThemeToggle',
  props: {
    showLabel: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    }
  },
  setup() {
    const currentTheme = ref('dark')
    
    // Toggle theme
    const toggleTheme = () => {
      const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
      currentTheme.value = newTheme
      
      // Update DOM
      document.documentElement.setAttribute('data-theme', newTheme)
      localStorage.setItem('theme', newTheme)
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('theme-changed', { 
        detail: { theme: newTheme } 
      }))
    }
    
    // Load saved theme
    onMounted(() => {
      const savedTheme = localStorage.getItem('theme')
      const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
      
      currentTheme.value = savedTheme || systemTheme
      document.documentElement.setAttribute('data-theme', currentTheme.value)
      
      // Listen for system theme changes
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          currentTheme.value = e.matches ? 'light' : 'dark'
          document.documentElement.setAttribute('data-theme', currentTheme.value)
        }
      })
    })
    
    return {
      currentTheme,
      toggleTheme
    }
  }
}
</script>

<style scoped>
@import '../styles/shared.css';

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.theme-toggle:hover {
  background: var(--bg-tertiary);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.theme-toggle:active {
  transform: scale(0.95);
}

.theme-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  font-size: 1.2rem;
}

.theme-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}

/* Size Variants */
.theme-toggle.small {
  padding: 0.25rem;
}

.theme-toggle.small .theme-icon {
  width: 1.25rem;
  height: 1.25rem;
  font-size: 1rem;
}

.theme-toggle.small .theme-label {
  font-size: 0.8rem;
}

.theme-toggle.large {
  padding: 0.75rem 1rem;
}

.theme-toggle.large .theme-icon {
  width: 2rem;
  height: 2rem;
  font-size: 1.5rem;
}

.theme-toggle.large .theme-label {
  font-size: 1rem;
}

/* Theme Switch Animation */
.theme-switch-enter-active,
.theme-switch-leave-active {
  transition: all 0.3s ease;
}

.theme-switch-enter-from {
  opacity: 0;
  transform: rotate(-180deg) scale(0.5);
}

.theme-switch-leave-to {
  opacity: 0;
  transform: rotate(180deg) scale(0.5);
}

.theme-switch-enter-to,
.theme-switch-leave-from {
  opacity: 1;
  transform: rotate(0) scale(1);
}

/* Icon Styling */
.icon {
  display: inline-block;
  animation: float 3s ease-in-out infinite;
}

.theme-toggle[data-theme="light"] .icon {
  animation-delay: 0s;
}

.theme-toggle[data-theme="dark"] .icon {
  animation-delay: 1.5s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

/* Focus States */
.theme-toggle:focus-visible {
  outline: 2px solid var(--brand-accent);
  outline-offset: 2px;
}

/* PWA Touch Optimizations */
@media (hover: none) {
  .theme-toggle:hover {
    transform: none;
  }
  
  .theme-toggle:active {
    transform: scale(0.95);
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .theme-switch-enter-active,
  .theme-switch-leave-active {
    transition: none;
  }
  
  .icon {
    animation: none;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: high) {
  .theme-toggle {
    border-width: 2px;
  }
  
  .theme-toggle:focus-visible {
    outline-width: 3px;
  }
}

/* Mobile Optimizations */
@media (max-width: 480px) {
  .theme-toggle {
    padding: 0.5rem;
  }
  
  .theme-label {
    display: none;
  }
}

/* Print Styles */
@media print {
  .theme-toggle {
    display: none;
  }
}
</style>