import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

// Import global styles
import './styles/global.css'

const app = createApp(App)

// Setup Pinia store
const pinia = createPinia()
app.use(pinia)

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Component info:', info)
}

app.mount('#app')

