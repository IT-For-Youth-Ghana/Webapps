// Main application entry point for IT Youth Talent Incubator
// This file initializes the Vue.js application with all necessary plugins and configurations
//
// TODO for co-programmers:
// - Add global error handling with app.config.errorHandler
// - Implement authentication check before mounting the app
// - Add global components registration (if needed)
// - Configure axios interceptors for API calls
// - Add performance monitoring/analytics initialization
// - Implement service worker registration for PWA features

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
