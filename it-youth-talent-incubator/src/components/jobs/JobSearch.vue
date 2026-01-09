<script setup>
/**
 * JobSearch Component
 * Search input with debounce for job listings
 */
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { COLORS } from '../../constants/colors.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Search jobs by title, company, or skills...'
  },
  loading: {
    type: Boolean,
    default: false
  },
  debounce: {
    type: Number,
    default: 300
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'clear'])

const localValue = ref(props.modelValue)
const inputRef = ref(null)
let debounceTimer = null

// Sync with prop
watch(() => props.modelValue, (newVal) => {
  if (newVal !== localValue.value) {
    localValue.value = newVal
  }
})

// Debounced emit
watch(localValue, (newVal) => {
  emit('update:modelValue', newVal)

  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    emit('search', newVal)
  }, props.debounce)
})

const handleClear = () => {
  localValue.value = ''
  emit('clear')
  inputRef.value?.focus()
}

const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    handleClear()
  } else if (e.key === 'Enter') {
    // Trigger immediate search on Enter
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    emit('search', localValue.value)
  }
}

// Cleanup
onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>

<template>
  <div class="job-search">
    <div class="search-wrapper">
      <!-- Search Icon -->
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="M21 21l-4.35-4.35"/>
      </svg>

      <!-- Input -->
      <input
        ref="inputRef"
        v-model="localValue"
        type="text"
        :placeholder="placeholder"
        :disabled="loading"
        @keydown="handleKeydown"
        class="search-input"
      />

      <!-- Loading Spinner -->
      <div v-if="loading" class="search-loading">
        <span class="loading-spinner"></span>
      </div>

      <!-- Clear Button -->
      <button
        v-else-if="localValue"
        @click="handleClear"
        class="clear-btn"
        type="button"
        title="Clear search"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Search Suggestions (optional slot) -->
    <slot name="suggestions"></slot>
  </div>
</template>

<style scoped>
.job-search {
  position: relative;
  width: 100%;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  width: 20px;
  height: 20px;
  color: v-bind('COLORS.TEXT.MUTED');
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem;
  padding-left: 3rem;
  padding-right: 3rem;
  background: v-bind('COLORS.BACKGROUND.CARD');
  border: 1px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-radius: 12px;
  color: v-bind('COLORS.TEXT.PRIMARY');
  font-size: 1rem;
  transition: all 0.2s;
}

.search-input::placeholder {
  color: v-bind('COLORS.TEXT.MUTED');
}

.search-input:focus {
  outline: none;
  border-color: v-bind('COLORS.BRAND.PRIMARY');
  box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.15);
}

.search-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-loading {
  position: absolute;
  right: 1rem;
  display: flex;
  align-items: center;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid v-bind('COLORS.BACKGROUND.BORDER');
  border-top-color: v-bind('COLORS.BRAND.PRIMARY');
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.clear-btn {
  position: absolute;
  right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: v-bind('COLORS.BACKGROUND.PRIMARY');
  border: none;
  border-radius: 6px;
  color: v-bind('COLORS.TEXT.MUTED');
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: v-bind('COLORS.BACKGROUND.BORDER');
  color: v-bind('COLORS.TEXT.PRIMARY');
}

.clear-btn svg {
  width: 16px;
  height: 16px;
}

/* Large variant */
.job-search.large .search-input {
  padding: 1rem 1.25rem;
  padding-left: 3.25rem;
  padding-right: 3.25rem;
  font-size: 1.125rem;
  border-radius: 16px;
}

.job-search.large .search-icon {
  left: 1.125rem;
  width: 22px;
  height: 22px;
}

.job-search.large .clear-btn {
  right: 0.875rem;
  width: 32px;
  height: 32px;
}

/* Responsive */
@media (max-width: 768px) {
  .search-input {
    padding: 0.75rem 0.875rem;
    padding-left: 2.75rem;
    padding-right: 2.75rem;
    font-size: 0.9375rem;
  }

  .search-icon {
    left: 0.875rem;
    width: 18px;
    height: 18px;
  }
}
</style>
