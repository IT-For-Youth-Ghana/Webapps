<template>
  <div id="app" :data-theme="theme">
    <!-- Use AppLayout for authenticated users, otherwise show raw router-view -->
    <template v-if="shouldUseLayout">
      <AppLayout>
        <router-view />
      </AppLayout>
    </template>
    <template v-else>
      <router-view />
    </template>
    
    <!-- Global User Switcher - visible on all pages -->
    <UserSwitcher />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@shared/stores/user.store.js'
import AppLayout from './components/AppLayout.vue'
import UserSwitcher from './components/UserSwitcher.vue'

export default {
  name: 'App',
  components: {
    AppLayout,
    UserSwitcher
  },
  setup() {
    console.log('App.vue setup called')
    const userStore = useUserStore()
    const theme = ref('light')
    
    // Always use AppLayout - no login required
    const shouldUseLayout = computed(() => {
      // Always return true since we want layout on all pages
      return true
    })
    
    onMounted(() => {
      console.log('App.vue mounted')
      // Load theme and shared styles
      const savedTheme = localStorage.getItem('theme') || 'dark'
      theme.value = savedTheme
      document.documentElement.setAttribute('data-theme', savedTheme)
      
      // Initialize user store
      userStore.initializeUser()
      
      // Register service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => console.log('SW registered'))
          .catch(error => console.log('SW registration failed'))
      }
      
      // Listen for theme changes
      window.addEventListener('theme-changed', (event) => {
        theme.value = event.detail.theme
        document.documentElement.setAttribute('data-theme', event.detail.theme)
      })
    })
    
    return {
      theme,
      shouldUseLayout
    }
  }
}
</script>

<style>
/* Using global styles from shared CSS variables */

#app {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

/* Add safe area support for mobile devices */
:root {
  --safe-area-inset-top: env(safe-area-inset-top, 0);
  --safe-area-inset-right: env(safe-area-inset-right, 0);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0);
  --safe-area-inset-left: env(safe-area-inset-left, 0);
}

/* PWA standalone app adjustments */
@media (display-mode: standalone) {
  #app {
    padding-top: var(--safe-area-inset-top);
  }
}

/* Dark mode transitions */
[data-theme="dark"] {
  color-scheme: dark;
}

[data-theme="light"] {
  color-scheme: light;
}

/* Focus visible for better accessibility */
:focus-visible {
  outline: 2px solid var(--brand-accent);
  outline-offset: 2px;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .glass {
    border: 2px solid var(--text-primary);
  }
}

/* Print styles */
@media print {
  .nav-header,
  .footer,
  .mobile-menu-toggle {
    display: none !important;
  }
  
  .glass-card {
    box-shadow: none !important;
    border: 1px solid #ccc !important;
  }
}
</style>