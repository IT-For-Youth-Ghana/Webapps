<template>
  <div v-if="!isOnline" class="offline-indicator slide-in">
    <div class="offline-content">
      <WifiIcon class="w-5 h-5" />
      <span>You're offline. Some features may be limited.</span>
    </div>
    <button 
      v-if="hasOfflineData" 
      @click="syncOfflineData" 
      class="sync-button"
      :disabled="syncing"
    >
      <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': syncing }" />
      {{ syncing ? 'Syncing...' : 'Sync' }}
    </button>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { WifiIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'OfflineIndicator',
  components: {
    WifiIcon,
    ArrowPathIcon
  },
  setup() {
    const isOnline = ref(navigator.onLine)
    const hasOfflineData = ref(false)
    const syncing = ref(false)
    
    const updateOnlineStatus = () => {
      isOnline.value = navigator.onLine
      
      if (navigator.onLine && hasOfflineData.value) {
        // Auto-sync when back online
        syncOfflineData()
      }
    }
    
    const syncOfflineData = async () => {
      if (!navigator.onLine || syncing.value) return
      
      syncing.value = true
      
      try {
        // Simulate offline data sync
        await new Promise(resolve => setTimeout(resolve, 2000))
        hasOfflineData.value = false
        
        // Dispatch sync complete event
        window.dispatchEvent(new CustomEvent('offline-data-synced'))
      } catch (error) {
        console.error('Sync failed:', error)
      } finally {
        syncing.value = false
      }
    }
    
    const checkOfflineData = () => {
      // Check if there's any offline data to sync
      const offlineData = localStorage.getItem('offline-data')
      hasOfflineData.value = !!offlineData
    }
    
    onMounted(() => {
      window.addEventListener('online', updateOnlineStatus)
      window.addEventListener('offline', updateOnlineStatus)
      checkOfflineData()
    })
    
    onUnmounted(() => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    })
    
    return {
      isOnline,
      hasOfflineData,
      syncing,
      syncOfflineData
    }
  }
}
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: var(--status-warning);
  color: var(--status-warning-text);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--status-warning-border);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  z-index: 1000;
  min-width: 280px;
  box-shadow: var(--shadow-lg);
}

.offline-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.sync-button {
  background: var(--status-warning-text);
  color: var(--bg-primary);
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.sync-button:hover:not(:disabled) {
  background: var(--status-warning-border);
}

.sync-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.slide-in {
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .offline-indicator {
    top: auto;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    min-width: auto;
  }
}
</style>