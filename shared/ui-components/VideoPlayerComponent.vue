<template>
  <div class="video-player-container" ref="playerContainer">
    <div class="video-wrapper" :class="{ 'fullscreen': isFullscreen }">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Loading video...</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-overlay">
        <div class="error-icon">⚠️</div>
        <h3>Video Error</h3>
        <p>{{ error }}</p>
        <button @click="retry" class="btn-retry">Retry</button>
      </div>

      <!-- Video Element -->
      <video
        ref="videoElement"
        :src="currentSrc"
        :poster="poster"
        @loadstart="onLoadStart"
        @loadedmetadata="onLoadedMetadata"
        @canplay="onCanPlay"
        @play="onPlay"
        @pause="onPause"
        @timeupdate="onTimeUpdate"
        @ended="onEnded"
        @error="onError"
        @waiting="onWaiting"
        @playing="onPlaying"
        preload="metadata"
        playsinline
        :class="{ 'video-hidden': isLoading || error }"
      ></video>

      <!-- Custom Controls -->
      <div class="video-controls" v-show="showControls && !isLoading && !error">
        <!-- Progress Bar -->
        <div class="progress-container" @click="seekTo">
          <div class="progress-bar">
            <div class="progress-buffered" :style="{ width: bufferedPercent + '%' }"></div>
            <div class="progress-played" :style="{ width: playedPercent + '%' }"></div>
            <div class="progress-thumb" :style="{ left: playedPercent + '%' }"></div>
          </div>
        </div>

        <!-- Control Buttons -->
        <div class="controls-row">
          <div class="controls-left">
            <!-- Play/Pause -->
            <button @click="togglePlay" class="control-btn play-btn">
              <span v-if="isPlaying">⏸️</span>
              <span v-else>▶️</span>
            </button>

            <!-- Skip Backward -->
            <button @click="skipBackward" class="control-btn">
              ⏪
            </button>

            <!-- Skip Forward -->
            <button @click="skipForward" class="control-btn">
              ⏩
            </button>

            <!-- Time Display -->
            <div class="time-display">
              {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
            </div>
          </div>

          <div class="controls-center">
            <!-- Quality Selector -->
            <div class="quality-selector" v-if="qualities.length > 1">
              <button @click="showQualityMenu = !showQualityMenu" class="control-btn">
                {{ currentQuality }}p
              </button>
              <div v-if="showQualityMenu" class="quality-menu">
                <div 
                  v-for="quality in qualities" 
                  :key="quality.label"
                  @click="changeQuality(quality)"
                  class="quality-option"
                  :class="{ active: quality.label === currentQuality }"
                >
                  {{ quality.label }}p
                  <span v-if="quality.label === 'Auto'" class="auto-badge">📶</span>
                </div>
              </div>
            </div>

            <!-- Speed Control -->
            <div class="speed-selector">
              <button @click="showSpeedMenu = !showSpeedMenu" class="control-btn">
                {{ playbackRate }}x
              </button>
              <div v-if="showSpeedMenu" class="speed-menu">
                <div 
                  v-for="speed in speeds" 
                  :key="speed"
                  @click="changeSpeed(speed)"
                  class="speed-option"
                  :class="{ active: speed === playbackRate }"
                >
                  {{ speed }}x
                </div>
              </div>
            </div>
          </div>

          <div class="controls-right">
            <!-- Volume Control -->
            <div class="volume-control">
              <button @click="toggleMute" class="control-btn volume-btn">
                <span v-if="isMuted || volume === 0">🔇</span>
                <span v-else-if="volume < 0.5">🔉</span>
                <span v-else>🔊</span>
              </button>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                v-model="volume"
                @input="updateVolume"
                class="volume-slider"
              />
            </div>

            <!-- Picture in Picture -->
            <button 
              v-if="supportsPiP"
              @click="togglePiP" 
              class="control-btn"
              :class="{ active: isPiP }"
            >
              📺
            </button>

            <!-- Fullscreen -->
            <button @click="toggleFullscreen" class="control-btn">
              <span v-if="isFullscreen">🔲</span>
              <span v-else>⛶</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Connection Status -->
      <div v-if="showConnectionStatus" class="connection-status" :class="connectionQuality">
        <div class="status-icon">
          <span v-if="connectionQuality === 'poor'">📶</span>
          <span v-else-if="connectionQuality === 'good'">📶</span>
          <span v-else>📶</span>
        </div>
        <span>{{ connectionMessage }}</span>
      </div>

      <!-- Data Saver Notice -->
      <div v-if="dataSaverMode" class="data-saver-notice">
        <span>📱 Data Saver Mode Active</span>
        <button @click="disableDataSaver" class="btn-small">Disable</button>
      </div>
    </div>

    <!-- Offline Download Option -->
    <div v-if="allowDownload && !isDownloaded" class="download-section">
      <button @click="downloadVideo" class="btn-download" :disabled="isDownloading">
        <span v-if="isDownloading">⬇️ Downloading... {{ downloadProgress }}%</span>
        <span v-else>💾 Download for Offline</span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'

export default {
  name: 'VideoPlayerComponent',
  props: {
    src: {
      type: [String, Array],
      required: true
    },
    poster: {
      type: String,
      default: ''
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    allowDownload: {
      type: Boolean,
      default: true
    },
    adaptiveQuality: {
      type: Boolean,
      default: true
    },
    dataSaverDefault: {
      type: Boolean,
      default: false
    }
  },
  emits: ['play', 'pause', 'ended', 'timeupdate', 'qualityChange'],
  setup(props, { emit }) {
    const videoElement = ref(null)
    const playerContainer = ref(null)
    
    // Player State
    const isLoading = ref(true)
    const isPlaying = ref(false)
    const currentTime = ref(0)
    const duration = ref(0)
    const bufferedTime = ref(0)
    const volume = ref(1)
    const isMuted = ref(false)
    const playbackRate = ref(1)
    const showControls = ref(true)
    const error = ref(null)
    
    // UI State
    const isFullscreen = ref(false)
    const isPiP = ref(false)
    const showQualityMenu = ref(false)
    const showSpeedMenu = ref(false)
    const showConnectionStatus = ref(false)
    
    // Quality Management
    const qualities = ref([])
    const currentQuality = ref('Auto')
    const currentSrc = ref('')
    
    // Connection & Performance
    const connectionQuality = ref('good')
    const connectionMessage = ref('')
    const dataSaverMode = ref(props.dataSaverDefault)
    
    // Download
    const isDownloading = ref(false)
    const downloadProgress = ref(0)
    const isDownloaded = ref(false)
    
    // Control visibility timer
    let controlsTimer = null
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

    // Computed Properties
    const playedPercent = computed(() => {
      return duration.value > 0 ? (currentTime.value / duration.value) * 100 : 0
    })

    const bufferedPercent = computed(() => {
      return duration.value > 0 ? (bufferedTime.value / duration.value) * 100 : 0
    })

    const supportsPiP = computed(() => {
      return document.pictureInPictureEnabled && videoElement.value
    })

    // Initialize video sources and qualities
    const initializeVideo = () => {
      if (typeof props.src === 'string') {
        currentSrc.value = props.src
        qualities.value = [{ label: 'Auto', src: props.src }]
      } else if (Array.isArray(props.src)) {
        // Multiple quality sources
        qualities.value = [
          { label: 'Auto', src: props.src[0].src },
          ...props.src.map(source => ({
            label: source.quality || 'Unknown',
            src: source.src
          }))
        ]
        
        // Auto-select quality based on connection
        if (props.adaptiveQuality) {
          selectOptimalQuality()
        } else {
          currentSrc.value = props.src[0].src
        }
      }
    }

    // Network-aware quality selection
    const selectOptimalQuality = () => {
      if ('connection' in navigator) {
        const connection = navigator.connection
        const effectiveType = connection.effectiveType
        
        let selectedQuality = '480' // Default fallback
        
        switch (effectiveType) {
          case 'slow-2g':
          case '2g':
            selectedQuality = '240'
            connectionQuality.value = 'poor'
            connectionMessage.value = 'Slow connection detected'
            break
          case '3g':
            selectedQuality = '360'
            connectionQuality.value = 'fair'
            connectionMessage.value = 'Limited bandwidth'
            break
          case '4g':
            selectedQuality = '720'
            connectionQuality.value = 'good'
            connectionMessage.value = 'Good connection'
            break
          default:
            selectedQuality = '480'
            connectionQuality.value = 'fair'
        }
        
        if (dataSaverMode.value) {
          selectedQuality = '240'
        }
        
        const quality = qualities.value.find(q => q.label === selectedQuality)
        if (quality) {
          currentSrc.value = quality.src
          currentQuality.value = selectedQuality
        } else {
          currentSrc.value = qualities.value[0].src
        }
        
        showConnectionStatus.value = true
        setTimeout(() => {
          showConnectionStatus.value = false
        }, 3000)
      } else {
        currentSrc.value = qualities.value[0].src
      }
    }

    // Event Handlers
    const onLoadStart = () => {
      isLoading.value = true
      error.value = null
    }

    const onLoadedMetadata = () => {
      duration.value = videoElement.value.duration
    }

    const onCanPlay = () => {
      isLoading.value = false
      if (props.autoplay) {
        play()
      }
    }

    const onPlay = () => {
      isPlaying.value = true
      emit('play')
    }

    const onPause = () => {
      isPlaying.value = false
      emit('pause')
    }

    const onTimeUpdate = () => {
      currentTime.value = videoElement.value.currentTime
      
      // Update buffered time
      const buffered = videoElement.value.buffered
      if (buffered.length > 0) {
        bufferedTime.value = buffered.end(buffered.length - 1)
      }
      
      emit('timeupdate', currentTime.value)
    }

    const onEnded = () => {
      isPlaying.value = false
      emit('ended')
    }

    const onError = (e) => {
      isLoading.value = false
      error.value = 'Failed to load video. Please check your connection.'
      console.error('Video error:', e)
    }

    const onWaiting = () => {
      isLoading.value = true
    }

    const onPlaying = () => {
      isLoading.value = false
    }

    // Control Methods
    const play = async () => {
      try {
        await videoElement.value.play()
      } catch (err) {
        console.error('Play error:', err)
        error.value = 'Unable to play video'
      }
    }

    const pause = () => {
      videoElement.value.pause()
    }

    const togglePlay = () => {
      if (isPlaying.value) {
        pause()
      } else {
        play()
      }
    }

    const seekTo = (event) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const percent = (event.clientX - rect.left) / rect.width
      const time = percent * duration.value
      videoElement.value.currentTime = time
    }

    const skipForward = () => {
      videoElement.value.currentTime = Math.min(
        videoElement.value.currentTime + 10,
        duration.value
      )
    }

    const skipBackward = () => {
      videoElement.value.currentTime = Math.max(
        videoElement.value.currentTime - 10,
        0
      )
    }

    const changeQuality = (quality) => {
      const currentTimeBackup = currentTime.value
      currentSrc.value = quality.src
      currentQuality.value = quality.label
      showQualityMenu.value = false
      
      // Restore playback position
      videoElement.value.addEventListener('loadedmetadata', () => {
        videoElement.value.currentTime = currentTimeBackup
      }, { once: true })
      
      emit('qualityChange', quality.label)
    }

    const changeSpeed = (speed) => {
      playbackRate.value = speed
      videoElement.value.playbackRate = speed
      showSpeedMenu.value = false
    }

    const updateVolume = () => {
      videoElement.value.volume = volume.value
      isMuted.value = volume.value === 0
    }

    const toggleMute = () => {
      if (isMuted.value) {
        videoElement.value.volume = volume.value || 0.5
        isMuted.value = false
      } else {
        videoElement.value.volume = 0
        isMuted.value = true
      }
    }

    const toggleFullscreen = () => {
      if (!isFullscreen.value) {
        if (playerContainer.value.requestFullscreen) {
          playerContainer.value.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
    }

    const togglePiP = async () => {
      try {
        if (!isPiP.value) {
          await videoElement.value.requestPictureInPicture()
        } else {
          await document.exitPictureInPicture()
        }
      } catch (err) {
        console.error('PiP error:', err)
      }
    }

    const retry = () => {
      error.value = null
      isLoading.value = true
      videoElement.value.load()
    }

    const disableDataSaver = () => {
      dataSaverMode.value = false
      selectOptimalQuality()
    }

    // Download functionality
    const downloadVideo = async () => {
      isDownloading.value = true
      downloadProgress.value = 0
      
      try {
        const response = await fetch(currentSrc.value)
        const contentLength = response.headers.get('content-length')
        const total = parseInt(contentLength, 10)
        let loaded = 0
        
        const reader = response.body.getReader()
        const chunks = []
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          chunks.push(value)
          loaded += value.length
          downloadProgress.value = Math.round((loaded / total) * 100)
        }
        
        const blob = new Blob(chunks, { type: 'video/mp4' })
        const url = URL.createObjectURL(blob)
        
        const a = document.createElement('a')
        a.href = url
        a.download = `video_${Date.now()}.mp4`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        
        isDownloaded.value = true
      } catch (err) {
        console.error('Download error:', err)
        error.value = 'Download failed'
      } finally {
        isDownloading.value = false
      }
    }

    // Utility Functions
    const formatTime = (seconds) => {
      if (!seconds || isNaN(seconds)) return '0:00'
      
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = Math.floor(seconds % 60)
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    }

    // Control visibility management
    const showControlsTemporarily = () => {
      showControls.value = true
      clearTimeout(controlsTimer)
      controlsTimer = setTimeout(() => {
        if (isPlaying.value) {
          showControls.value = false
        }
      }, 3000)
    }

    // Event Listeners
    const handleFullscreenChange = () => {
      isFullscreen.value = !!document.fullscreenElement
    }

    const handlePiPChange = () => {
      isPiP.value = document.pictureInPictureElement === videoElement.value
    }

    const handleKeydown = (e) => {
      if (!videoElement.value) return
      
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          skipBackward()
          break
        case 'ArrowRight':
          e.preventDefault()
          skipForward()
          break
        case 'ArrowUp':
          e.preventDefault()
          volume.value = Math.min(volume.value + 0.1, 1)
          updateVolume()
          break
        case 'ArrowDown':
          e.preventDefault()
          volume.value = Math.max(volume.value - 0.1, 0)
          updateVolume()
          break
        case 'KeyF':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'KeyM':
          e.preventDefault()
          toggleMute()
          break
      }
      
      showControlsTemporarily()
    }

    // Lifecycle
    onMounted(() => {
      initializeVideo()
      
      document.addEventListener('fullscreenchange', handleFullscreenChange)
      document.addEventListener('enterpictureinpicture', handlePiPChange)
      document.addEventListener('leavepictureinpicture', handlePiPChange)
      document.addEventListener('keydown', handleKeydown)
      
      // Mouse movement detection
      playerContainer.value.addEventListener('mousemove', showControlsTemporarily)
      playerContainer.value.addEventListener('click', showControlsTemporarily)
      
      // Connection change detection
      if ('connection' in navigator) {
        navigator.connection.addEventListener('change', selectOptimalQuality)
      }
    })

    onUnmounted(() => {
      clearTimeout(controlsTimer)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('enterpictureinpicture', handlePiPChange)
      document.removeEventListener('leavepictureinpicture', handlePiPChange)
      document.removeEventListener('keydown', handleKeydown)
      
      if ('connection' in navigator) {
        navigator.connection.removeEventListener('change', selectOptimalQuality)
      }
    })

    // Watch for src changes
    watch(() => props.src, () => {
      initializeVideo()
    })

    return {
      // Refs
      videoElement,
      playerContainer,
      
      // State
      isLoading,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      playbackRate,
      showControls,
      error,
      isFullscreen,
      isPiP,
      showQualityMenu,
      showSpeedMenu,
      showConnectionStatus,
      qualities,
      currentQuality,
      currentSrc,
      connectionQuality,
      connectionMessage,
      dataSaverMode,
      isDownloading,
      downloadProgress,
      isDownloaded,
      speeds,
      
      // Computed
      playedPercent,
      bufferedPercent,
      supportsPiP,
      
      // Methods
      togglePlay,
      seekTo,
      skipForward,
      skipBackward,
      changeQuality,
      changeSpeed,
      updateVolume,
      toggleMute,
      toggleFullscreen,
      togglePiP,
      retry,
      disableDataSaver,
      downloadVideo,
      formatTime,
      
      // Event handlers
      onLoadStart,
      onLoadedMetadata,
      onCanPlay,
      onPlay,
      onPause,
      onTimeUpdate,
      onEnded,
      onError,
      onWaiting,
      onPlaying
    }
  }
}
</script>

<style scoped>
.video-player-container {
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  background: #000;
}

.video-wrapper.fullscreen {
  padding-bottom: 0;
  height: 100vh;
}

video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 0.3s ease;
}

.video-hidden {
  opacity: 0;
}

.loading-overlay, .error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.btn-retry {
  background: #ff4444;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
}

.btn-retry:hover {
  background: #cc3333;
}

.video-controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 1rem;
  transition: opacity 0.3s ease;
}

.progress-container {
  margin-bottom: 1rem;
  cursor: pointer;
}

.progress-bar {
  position: relative;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.progress-buffered {
  position: absolute;
  height: 100%;
  background: rgba(255, 255, 255, 0.4);
  transition: width 0.3s ease;
}

.progress-played {
  position: absolute;
  height: 100%;
  background: #667eea;
  transition: width 0.1s ease;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: #667eea;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: left 0.1s ease;
}

.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.controls-left, .controls-center, .controls-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.control-btn.active {
  background: #667eea;
}

.play-btn {
  font-size: 1.5rem;
}

.time-display {
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 120px;
}

.quality-selector, .speed-selector {
  position: relative;
}

.quality-menu, .speed-menu {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  border-radius: 8px;
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
  min-width: 80px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.quality-option, .speed-option {
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.3s ease;
}

.quality-option:hover, .speed-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.quality-option.active, .speed-option.active {
  background: #667eea;
}

.auto-badge {
  font-size: 0.8rem;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.volume-slider {
  width: 80px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  background: #667eea;
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  background: #667eea;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.connection-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 5;
}

.connection-status.poor {
  background: rgba(255, 68, 68, 0.9);
}

.connection-status.fair {
  background: rgba(255, 193, 7, 0.9);
}

.connection-status.good {
  background: rgba(76, 175, 80, 0.9);
}

.data-saver-notice {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(102, 126, 234, 0.9);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 5;
}

.btn-small {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  cursor: pointer;
}

.download-section {
  padding: 1rem;
  background: #f8f9ff;
  border-top: 1px solid #eee;
}

.btn-download {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
  transition: all 0.3s ease;
}

.btn-download:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-download:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .video-controls {
    padding: 0.5rem;
  }
  
  .controls-row {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .controls-center {
    order: 3;
    width: 100%;
    justify-content: center;
    margin-top: 0.5rem;
  }
  
  .control-btn {
    font-size: 1rem;
    min-width: 2rem;
    height: 2rem;
  }
  
  .time-display {
    font-size: 0.8rem;
    min-width: 100px;
  }
  
  .volume-slider {
    width: 60px;
  }
  
  .connection-status, .data-saver-notice {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .progress-thumb {
    width: 16px;
    height: 16px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>