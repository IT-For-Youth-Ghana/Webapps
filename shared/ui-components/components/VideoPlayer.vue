<template>
  <div class="video-player">
    <div class="video-container">
      <video
        ref="videoElement"
        :src="videoSrc"
        :poster="poster"
        :controls="showControls"
        :autoplay="autoplay"
        :muted="muted"
        :loop="loop"
        class="video-element"
        @loadedmetadata="onLoadedMetadata"
        @timeupdate="onTimeUpdate"
        @ended="onVideoEnded"
        @error="onVideoError"
      >
        Your browser does not support the video tag.
      </video>

      <!-- Custom Controls -->
      <div v-if="!showControls" class="custom-controls">
        <div class="progress-bar" @click="seekVideo">
          <div class="progress-buffered" :style="{ width: bufferedProgress + '%' }"></div>
          <div class="progress-played" :style="{ width: playProgress + '%' }"></div>
        </div>

        <div class="controls-row">
          <div class="controls-left">
            <button @click="togglePlay" class="control-btn">
              <svg v-if="!isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            </button>

            <button @click="toggleMute" class="control-btn">
              <svg v-if="!isMuted" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            </button>

            <div class="time-display">
              {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
            </div>
          </div>

          <div class="controls-right">
            <button @click="toggleFullscreen" class="control-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
      </div>

      <!-- Error Overlay -->
      <div v-if="error" class="error-overlay">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{{ error }}</p>
      </div>
    </div>

    <!-- Video Info -->
    <div v-if="title || description" class="video-info">
      <h3 v-if="title" class="video-title">{{ title }}</h3>
      <p v-if="description" class="video-description">{{ description }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  poster: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  autoplay: {
    type: Boolean,
    default: false
  },
  muted: {
    type: Boolean,
    default: false
  },
  loop: {
    type: Boolean,
    default: false
  },
  controls: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['loaded', 'ended', 'error', 'timeupdate'])

const videoElement = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const isMuted = ref(props.muted)
const volume = ref(1)
const isLoading = ref(true)
const error = ref('')
const buffered = ref(0)

const videoSrc = computed(() => props.src)
const showControls = computed(() => props.controls)
const autoplay = computed(() => props.autoplay)
const muted = computed(() => props.muted)
const loop = computed(() => props.loop)

const playProgress = computed(() => {
  return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
})

const bufferedProgress = computed(() => {
  return duration.value > 0 ? (buffered.value / duration.value) * 100 : 0
})

const togglePlay = () => {
  if (!videoElement.value) return

  if (isPlaying.value) {
    videoElement.value.pause()
  } else {
    videoElement.value.play()
  }
}

const toggleMute = () => {
  if (!videoElement.value) return

  isMuted.value = !isMuted.value
  videoElement.value.muted = isMuted.value
}

const seekVideo = (event) => {
  if (!videoElement.value || !duration.value) return

  const rect = event.currentTarget.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = clickX / rect.width
  const seekTime = percentage * duration.value

  videoElement.value.currentTime = seekTime
  currentTime.value = seekTime
}

const toggleFullscreen = () => {
  if (!videoElement.value) return

  if (!document.fullscreenElement) {
    videoElement.value.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

const formatTime = (seconds) => {
  if (!isFinite(seconds)) return '0:00'

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const onLoadedMetadata = () => {
  if (videoElement.value) {
    duration.value = videoElement.value.duration
    isLoading.value = false
    emit('loaded', {
      duration: duration.value,
      videoElement: videoElement.value
    })
  }
}

const onTimeUpdate = () => {
  if (videoElement.value) {
    currentTime.value = videoElement.value.currentTime
    
    // Update buffered
    if (videoElement.value.buffered.length > 0) {
      buffered.value = videoElement.value.buffered.end(videoElement.value.buffered.length - 1)
    }

    emit('timeupdate', {
      currentTime: currentTime.value,
      duration: duration.value,
      progress: playProgress.value
    })
  }
}

const onVideoEnded = () => {
  isPlaying.value = false
  emit('ended')
}

const onVideoError = (event) => {
  isLoading.value = false
  error.value = 'Failed to load video'
  emit('error', event)
}

// Watch for src changes
watch(() => props.src, () => {
  if (videoElement.value) {
    isLoading.value = true
    error.value = ''
    currentTime.value = 0
    videoElement.value.load()
  }
})

onMounted(() => {
  // Set up video element event listeners
  if (videoElement.value) {
    videoElement.value.addEventListener('play', () => {
      isPlaying.value = true
    })

    videoElement.value.addEventListener('pause', () => {
      isPlaying.value = false
    })

    videoElement.value.addEventListener('volumechange', () => {
      isMuted.value = videoElement.value.muted
      volume.value = videoElement.value.volume
    })
  }
})

onUnmounted(() => {
  // Clean up event listeners
  if (videoElement.value) {
    videoElement.value.removeEventListener('play', () => {})
    videoElement.value.removeEventListener('pause', () => {})
    videoElement.value.removeEventListener('volumechange', () => {})
  }
})

// Expose video element methods
defineExpose({
  play: () => videoElement.value?.play(),
  pause: () => videoElement.value?.pause(),
  seek: (time) => {
    if (videoElement.value) {
      videoElement.value.currentTime = time
      currentTime.value = time
    }
  },
  setVolume: (vol) => {
    if (videoElement.value) {
      videoElement.value.volume = vol
      volume.value = vol
    }
  },
  getVideoElement: () => videoElement.value
})
</script>

<style scoped>
.video-player {
  background: var(--bg-primary);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.video-container {
  position: relative;
  width: 100%;
  background: #000;
}

.video-element {
  width: 100%;
  height: auto;
  display: block;
}

.custom-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 1rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-container:hover .custom-controls {
  opacity: 1;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  cursor: pointer;
  margin-bottom: 0.75rem;
  position: relative;
}

.progress-buffered {
  height: 100%;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 2px;
  position: absolute;
  top: 0;
  left: 0;
  transition: width 0.1s ease;
}

.progress-played {
  height: 100%;
  background: var(--primary, #3b82f6);
  border-radius: 2px;
  position: absolute;
  top: 0;
  left: 0;
  transition: width 0.1s ease;
}

.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.controls-left,
.controls-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.time-display {
  color: white;
  font-size: 0.875rem;
  font-family: monospace;
  min-width: 100px;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-overlay svg {
  margin-bottom: 1rem;
  opacity: 0.8;
}

.error-overlay p {
  margin: 0;
  text-align: center;
  opacity: 0.9;
}

.video-info {
  padding: 1rem;
  background: var(--bg-secondary);
}

.video-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.video-description {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .time-display {
    font-size: 0.75rem;
    min-width: 80px;
  }
  
  .control-btn {
    padding: 0.375rem;
  }
  
  .video-info {
    padding: 0.75rem;
  }
  
  .video-title {
    font-size: 1rem;
  }
}
</style>