import { createApp } from 'vue'

import App from './App.vue'

// Import global styles
import './styles/global.css'

const app = createApp(App)

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Component info:', info)
}

app.mount('#app')
