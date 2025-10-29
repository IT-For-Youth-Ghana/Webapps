<template>
  <div class="base-layout" :data-theme="theme">
    <!-- Navigation Header -->
    <NavigationBar 
      :user="user"
      :current-platform="currentPlatform"
      @toggle-theme="toggleTheme"
      @switch-platform="switchPlatform"
    />
    
    <!-- Mobile Menu Toggle -->
    <button 
      class="mobile-menu-toggle btn btn-secondary"
      @click="toggleMobileMenu"
      v-if="isMobile"
      :aria-expanded="mobileMenuOpen"
      aria-label="Toggle navigation menu"
    >
      <span v-if="!mobileMenuOpen">☰</span>
      <span v-else>✕</span>
    </button>
    
    <!-- Main Content Area -->
    <main class="main-content" :class="{ 'mobile-menu-open': mobileMenuOpen }">
      <!-- Breadcrumb Navigation -->
      <nav class="breadcrumb" v-if="breadcrumbs.length">
        <ol>
          <li v-for="(crumb, index) in breadcrumbs" :key="index">
            <a 
              v-if="crumb.link" 
              :href="crumb.link"
              class="breadcrumb-link"
            >
              {{ crumb.label }}
            </a>
            <span v-else class="breadcrumb-current">{{ crumb.label }}</span>
            <span v-if="index < breadcrumbs.length - 1" class="breadcrumb-separator">/</span>
          </li>
        </ol>
      </nav>
      
      <!-- Page Content -->
      <div class="content-wrapper">
        <slot />
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-grid">
          <div class="footer-section">
            <h3>IT Youth Talent Incubator</h3>
            <p>Empowering the next generation of tech talent in Ghana</p>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/talent" class="footer-link">Job Portal</a></li>
              <li><a href="/courses" class="footer-link">Course Management</a></li>
              <li><a href="/about" class="footer-link">About Us</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Contact</h4>
            <p>Email: info@itforyouthghana.org</p>
            <p>Location: Accra, Ghana</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 IT Youth Talent Ghana. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import NavigationBar from './NavigationBar.vue'

export default {
  name: 'BaseLayout',
  components: {
    NavigationBar
  },
  props: {
    user: {
      type: Object,
      default: null
    },
    breadcrumbs: {
      type: Array,
      default: () => []
    },
    currentPlatform: {
      type: String,
      default: 'incubator',
      validator: value => ['incubator', 'courses'].includes(value)
    }
  },
  setup(props) {
    const theme = ref('dark')
    const mobileMenuOpen = ref(false)
    const isMobile = ref(false)
    
    // Check mobile screen size
    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768
      if (!isMobile.value) {
        mobileMenuOpen.value = false
      }
    }
    
    // Toggle theme
    const toggleTheme = () => {
      theme.value = theme.value === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', theme.value)
      document.documentElement.setAttribute('data-theme', theme.value)
    }
    
    // Toggle mobile menu
    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value
    }
    
    // Switch between platforms
    const switchPlatform = (platform) => {
      if (platform === 'incubator') {
        window.location.href = 'http://localhost:5173'
      } else {
        window.location.href = 'http://localhost:5174'
      }
    }
    
    // Initialize
    onMounted(() => {
      // Load saved theme
      const savedTheme = localStorage.getItem('theme') || 'dark'
      theme.value = savedTheme
      document.documentElement.setAttribute('data-theme', savedTheme)
      
      // Check mobile on mount and resize
      checkMobile()
      window.addEventListener('resize', checkMobile)
      
      // PWA setup
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
      }
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile)
    })
    
    return {
      theme,
      mobileMenuOpen,
      isMobile,
      toggleTheme,
      toggleMobileMenu,
      switchPlatform
    }
  }
}
</script>

<style scoped>
@import '../styles/shared.css';

.base-layout {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.mobile-menu-toggle {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  font-size: 1.2rem;
}

.main-content {
  min-height: calc(100vh - 80px);
  padding: 1rem;
  transition: all 0.3s ease;
}

@media (min-width: 769px) {
  .main-content {
    padding: 2rem;
  }
}

.breadcrumb {
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--glass-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.breadcrumb ol {
  display: flex;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 0.5rem;
}

.breadcrumb-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumb-link:hover {
  color: var(--brand-accent);
}

.breadcrumb-current {
  color: var(--text-primary);
  font-weight: 600;
}

.breadcrumb-separator {
  color: var(--text-tertiary);
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

.footer {
  background: var(--glass-bg);
  border-top: 1px solid var(--glass-border);
  margin-top: auto;
  padding: 2rem 1rem 1rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h3,
.footer-section h4 {
  color: var(--brand-primary);
  margin-bottom: 1rem;
}

.footer-link {
  color: var(--text-secondary);
  text-decoration: none;
  display: block;
  padding: 0.25rem 0;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: var(--brand-accent);
}

.footer-bottom {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid var(--glass-border);
  color: var(--text-tertiary);
  font-size: 0.9rem;
}

/* Mobile Menu Animation */
.main-content.mobile-menu-open {
  transform: translateX(-100%);
}

@media (max-width: 768px) {
  .breadcrumb {
    font-size: 0.9rem;
  }
  
  .footer {
    padding: 1rem 0.5rem 0.5rem;
  }
  
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    text-align: center;
  }
}
</style>