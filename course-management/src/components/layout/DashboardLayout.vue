<template>
  <div class="dashboard-layout">
    <DashboardSidebar 
      :isOpen="sidebarOpen" 
      :userRole="userRole"
      @close="sidebarOpen = false"
    />
    
    <div class="dashboard-main" :class="{ 'sidebar-open': sidebarOpen }">
      <DashboardHeader 
        :userRole="userRole"
        :notifications="notifications"
        @toggle-sidebar="sidebarOpen = !sidebarOpen"
        @logout="handleLogout"
      />
      
      <main class="dashboard-content">
        <div class="container">
          <slot />
        </div>
      </main>
    </div>
    
    <OfflineIndicator v-if="!isOnline" />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@shared/stores/user.store.js'
import DashboardSidebar from './DashboardSidebar.vue'
import DashboardHeader from './DashboardHeader.vue'
import OfflineIndicator from '../common/OfflineIndicator.vue'

export default {
  name: 'DashboardLayout',
  components: {
    DashboardSidebar,
    DashboardHeader,
    OfflineIndicator
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    
    const sidebarOpen = ref(false)
    const isOnline = ref(navigator.onLine)
    
    const userRole = computed(() => userStore.userRole)
    const notifications = computed(() => userStore.notifications || [])
    
    const handleOnlineStatus = () => {
      isOnline.value = navigator.onLine
    }
    
    const handleLogout = async () => {
      try {
        await userStore.logout()
        router.push('/login')
      } catch (error) {
        console.error('Logout failed:', error)
      }
    }
    
    onMounted(() => {
      window.addEventListener('online', handleOnlineStatus)
      window.addEventListener('offline', handleOnlineStatus)
    })
    
    onUnmounted(() => {
      window.removeEventListener('online', handleOnlineStatus)
      window.removeEventListener('offline', handleOnlineStatus)
    })
    
    return {
      sidebarOpen,
      isOnline,
      userRole,
      notifications,
      handleLogout
    }
  }
}
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s ease;
}

.dashboard-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: 1rem;
  }
  
  .dashboard-main.sidebar-open {
    margin-left: 0;
  }
}
</style>