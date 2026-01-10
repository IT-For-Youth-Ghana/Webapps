import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

// Import global styles
import './styles/global.css'

// Initialize theme system (must be before app mounts)
import { useTheme } from './composables/useTheme.js'

const app = createApp(App)

// Setup Pinia store
const pinia = createPinia()
app.use(pinia)

// Setup Router
import router from './router'
app.use(router)

// Initialize theme immediately after app setup
// This ensures CSS variables are set before first render
const { currentTheme } = useTheme()
console.log('🎨 Theme initialized:', currentTheme.value)

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Component info:', info)
}

app.mount('#app')

