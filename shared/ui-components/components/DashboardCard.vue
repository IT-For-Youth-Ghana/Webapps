<template>
  <div class="dashboard-card glass-card" :class="[variant, { interactive: isInteractive }]">
    <!-- Card Header -->
    <div class="card-header" v-if="title || icon || $slots.header">
      <div class="header-content">
        <div class="header-icon" v-if="icon">
          <span class="icon">{{ icon }}</span>
        </div>
        <div class="header-text">
          <h3 class="card-title" v-if="title">{{ title }}</h3>
          <p class="card-subtitle" v-if="subtitle">{{ subtitle }}</p>
        </div>
      </div>
      <div class="header-actions" v-if="$slots.actions">
        <slot name="actions" />
      </div>
    </div>
    
    <!-- Card Content -->
    <div class="card-content">
      <slot />
    </div>
    
    <!-- Card Footer -->
    <div class="card-footer" v-if="$slots.footer || footerText">
      <slot name="footer">
        <span class="footer-text">{{ footerText }}</span>
      </slot>
    </div>
    
    <!-- Loading Overlay -->
    <div class="loading-overlay" v-if="loading">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'DashboardCard',
  props: {
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value) => [
        'default', 'stats', 'chart', 'list', 'image', 'featured'
      ].includes(value)
    },
    loading: {
      type: Boolean,
      default: false
    },
    clickable: {
      type: Boolean,
      default: false
    },
    footerText: {
      type: String,
      default: ''
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const isInteractive = computed(() => props.clickable || props.loading)
    
    const handleClick = () => {
      if (props.clickable && !props.loading) {
        emit('click')
      }
    }
    
    return {
      isInteractive,
      handleClick
    }
  }
}
</script>

<style scoped>
@import '../styles/shared.css';

.dashboard-card {
  position: relative;
  padding: 1.5rem;
  transition: all 0.3s ease;
  overflow: hidden;
}

.dashboard-card.interactive {
  cursor: pointer;
}

.dashboard-card.interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

/* Variant Styles */
.dashboard-card.stats {
  text-align: center;
  padding: 2rem 1.5rem;
}

.dashboard-card.chart {
  padding: 1rem;
}

.dashboard-card.list {
  padding: 0;
}

.dashboard-card.featured {
  border: 2px solid var(--brand-primary);
  box-shadow: 0 8px 30px rgba(37, 99, 235, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--glass-border);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-accent));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
}

.card-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.card-content {
  margin-bottom: 1rem;
}

.card-footer {
  padding-top: 1rem;
  border-top: 1px solid var(--glass-border);
  margin-top: auto;
}

.footer-text {
  font-size: 0.9rem;
  color: var(--text-tertiary);
  font-style: italic;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  z-index: 10;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--glass-border);
  border-top: 3px solid var(--brand-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Stats Variant Specific Styles */
.dashboard-card.stats .header-icon {
  width: 4rem;
  height: 4rem;
  font-size: 2rem;
  margin: 0 auto 1rem;
}

.dashboard-card.stats .card-title {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.dashboard-card.stats .card-content {
  margin: 1.5rem 0;
}

.dashboard-card.stats .stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--brand-primary);
  margin-bottom: 0.5rem;
}

.dashboard-card.stats .stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* List Variant Specific Styles */
.dashboard-card.list .card-header {
  padding: 1.5rem 1.5rem 1rem;
}

.dashboard-card.list .card-content {
  padding: 0 1.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.dashboard-card.list .card-footer {
  padding: 1rem 1.5rem 1.5rem;
}

/* Chart Variant Specific Styles */
.dashboard-card.chart .card-content {
  padding: 0;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, var(--bg-tertiary) 25%, transparent 25%, transparent 75%, var(--bg-tertiary) 75%, var(--bg-tertiary)),
              linear-gradient(45deg, var(--bg-tertiary) 25%, transparent 25%, transparent 75%, var(--bg-tertiary) 75%, var(--bg-tertiary));
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
  border-radius: var(--radius-md);
  opacity: 0.3;
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-card {
    padding: 1rem;
  }
  
  .dashboard-card.stats {
    padding: 1.5rem 1rem;
  }
  
  .header-content {
    gap: 0.75rem;
  }
  
  .header-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.2rem;
  }
  
  .dashboard-card.stats .header-icon {
    width: 3rem;
    height: 3rem;
    font-size: 1.5rem;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
  
  .dashboard-card.stats .stat-value {
    font-size: 2rem;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .header-actions {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .dashboard-card {
    padding: 0.75rem;
  }
  
  .dashboard-card.stats {
    padding: 1rem 0.75rem;
  }
  
  .dashboard-card.stats .stat-value {
    font-size: 1.8rem;
  }
  
  .dashboard-card.chart {
    padding: 0.5rem;
  }
  
  .card-title {
    font-size: 1rem;
  }
  
  .card-subtitle {
    font-size: 0.85rem;
  }
}

/* PWA Touch Optimizations */
@media (hover: none) {
  .dashboard-card.interactive:active {
    transform: scale(0.98);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .dashboard-card,
  .loading-spinner {
    transition: none;
    animation: none;
  }
  
  .dashboard-card.interactive:hover {
    transform: none;
  }
}

/* Focus States for Accessibility */
.dashboard-card.interactive:focus-visible {
  outline: 2px solid var(--brand-accent);
  outline-offset: 2px;
}

/* Dark Mode Adjustments */
[data-theme="light"] .loading-overlay {
  background: rgba(255, 255, 255, 0.9);
}
</style>