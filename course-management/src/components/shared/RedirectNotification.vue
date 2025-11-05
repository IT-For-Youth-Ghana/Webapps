<template>
  <div v-if="isVisible" class="redirect-overlay">
    <div class="redirect-modal">
      <div class="redirect-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </div>
      
      <h3 class="redirect-title">Redirecting to External Content</h3>
      
      <div class="content-info">
        <div class="content-type-badge" :class="contentType">
          {{ formatContentType(contentType) }}
        </div>
        <h4 class="content-title">{{ title }}</h4>
        <p class="content-description">{{ description }}</p>
      </div>
      
      <div class="redirect-warning">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>You will be redirected to external content. This will open in a new window.</span>
      </div>
      
      <div class="redirect-actions">
        <button @click="$emit('cancel')" class="btn-cancel">
          Cancel
        </button>
        <button @click="handleRedirect" class="btn-continue">
          Continue to Content
        </button>
      </div>
      
      <div class="countdown" v-if="countdown > 0">
        Redirecting automatically in {{ countdown }} seconds...
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RedirectNotification',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    contentType: {
      type: String,
      required: true
    },
    redirectUrl: {
      type: String,
      required: true
    },
    autoRedirect: {
      type: Boolean,
      default: true
    },
    autoRedirectDelay: {
      type: Number,
      default: 5
    }
  },
  emits: ['cancel', 'redirect'],
  data() {
    return {
      countdown: 0,
      countdownInterval: null
    }
  },
  watch: {
    isVisible(newValue) {
      if (newValue && this.autoRedirect) {
        this.startCountdown()
      } else {
        this.stopCountdown()
      }
    }
  },
  methods: {
    formatContentType(type) {
      const types = {
        url: 'External Link',
        video: 'Video Content',
        pdf: 'PDF Document',
        interactive: 'Interactive Content',
        quiz: 'Quiz',
        assignment: 'Assignment'
      }
      return types[type] || type
    },
    
    startCountdown() {
      this.countdown = this.autoRedirectDelay
      this.countdownInterval = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          this.handleRedirect()
        }
      }, 1000)
    },
    
    stopCountdown() {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval)
        this.countdownInterval = null
      }
      this.countdown = 0
    },
    
    handleRedirect() {
      this.stopCountdown()
      // Open in new window/tab
      window.open(this.redirectUrl, '_blank', 'noopener,noreferrer')
      this.$emit('redirect', this.redirectUrl)
    }
  },
  
  beforeUnmount() {
    this.stopCountdown()
  }
}
</script>

<style scoped>
.redirect-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.redirect-modal {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-light);
}

.redirect-icon {
  color: var(--interactive-primary);
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.redirect-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
}

.content-info {
  margin-bottom: 1.5rem;
  text-align: left;
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
}

.content-type-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.content-type-badge.url {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.content-type-badge.video {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.content-type-badge.pdf {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.content-type-badge.interactive,
.content-type-badge.quiz,
.content-type-badge.assignment {
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
}

.content-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.content-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.redirect-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 6px;
  color: #f59e0b;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.redirect-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-cancel,
.btn-continue {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-cancel {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.btn-cancel:hover {
  background: var(--bg-tertiary);
}

.btn-continue {
  background: var(--interactive-primary);
  color: white;
}

.btn-continue:hover {
  background: var(--interactive-primary-hover);
  transform: translateY(-1px);
}

.countdown {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-style: italic;
}

@media (max-width: 768px) {
  .redirect-modal {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .redirect-actions {
    flex-direction: column;
  }
  
  .btn-cancel,
  .btn-continue {
    width: 100%;
  }
}
</style>