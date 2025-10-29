/**
 * Offline Sync Service for IT Youth Incubator Ghana
 * 
 * Handles offline data synchronization for poor internet connectivity
 * Optimized for Ghana's mobile internet challenges with smart caching
 */

class OfflineSyncService {
  constructor() {
    // Configuration optimized for Ghana's internet conditions
    this.config = {
      // Sync strategies
      syncStrategies: {
        immediate: ['grades', 'announcements', 'emergencies'],
        priority: ['assignments', 'course_materials', 'messages'],
        background: ['analytics', 'logs', 'user_activity'],
        manual: ['video_content', 'large_files']
      },
      
      // Network awareness
      networkThresholds: {
        excellent: { downlink: 10, rtt: 50 },    // 4G
        good: { downlink: 1.5, rtt: 150 },       // 3G
        poor: { downlink: 0.5, rtt: 500 },       // 2G
        offline: { downlink: 0, rtt: Infinity }
      },
      
      // Data limits for cost-conscious users
      dataLimits: {
        daily: 50 * 1024 * 1024,    // 50MB per day
        session: 10 * 1024 * 1024,   // 10MB per session
        emergency: 5 * 1024 * 1024    // 5MB for emergency sync
      },
      
      // Retry and timing
      retryAttempts: 3,
      retryDelays: [1000, 5000, 15000], // Exponential backoff
      syncIntervals: {
        foreground: 30000,  // 30 seconds when app is active
        background: 300000, // 5 minutes in background
        offline: 60000      // 1 minute when offline detection
      },
      
      // Storage quotas (IndexedDB)
      storageQuotas: {
        courseContent: 100 * 1024 * 1024,  // 100MB
        userProgress: 20 * 1024 * 1024,    // 20MB
        messages: 10 * 1024 * 1024,        // 10MB
        cache: 50 * 1024 * 1024            // 50MB
      }
    }

    // Initialize state
    this.isOnline = navigator.onLine
    this.networkInfo = this.getNetworkInfo()
    this.syncQueue = new Map()
    this.conflictQueue = new Map()
    this.syncHistory = []
    this.lastSyncTime = null
    this.dailyDataUsage = 0
    this.sessionDataUsage = 0
    
    // Storage instances
    this.db = null
    this.cache = new Map()
    
    // Event system
    this.listeners = new Map()
    
    this.init()
  }

  /**
   * Initialize the offline sync service
   */
  async init() {
    try {
      // Initialize IndexedDB
      await this.initDatabase()
      
      // Load sync state from storage
      await this.loadSyncState()
      
      // Set up network monitoring
      this.setupNetworkMonitoring()
      
      // Register service worker for background sync
      await this.registerServiceWorker()
      
      // Start sync loops
      this.startSyncLoops()
      
      // Set up visibility change handling
      this.setupVisibilityHandling()
      
      console.log('Offline Sync Service initialized for Ghana')
      this.emit('initialized')
      
    } catch (error) {
      console.error('Failed to initialize Offline Sync Service:', error)
      this.emit('error', error)
    }
  }

  /**
   * Initialize IndexedDB for offline storage
   */
  async initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GhanaEducationApp', 3)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        // Create object stores for different data types
        const stores = [
          'courses', 'lessons', 'assignments', 'grades', 
          'messages', 'announcements', 'user_progress',
          'sync_queue', 'conflicts', 'user_data'
        ]
        
        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id' })
            store.createIndex('timestamp', 'timestamp')
            store.createIndex('userId', 'userId')
            if (storeName === 'sync_queue') {
              store.createIndex('priority', 'priority')
              store.createIndex('status', 'status')
            }
          }
        })
      }
    })
  }

  /**
   * Queue data for synchronization
   */
  async queueForSync(data) {
    const {
      type,
      operation, // 'create', 'update', 'delete'
      id,
      payload,
      priority = 'normal',
      userId,
      retryCount = 0
    } = data

    const syncItem = {
      id: this.generateSyncId(),
      type,
      operation,
      dataId: id,
      payload,
      priority,
      userId,
      retryCount,
      createdAt: Date.now(),
      status: 'pending',
      networkRequired: this.requiresNetwork(type)
    }

    // Add to memory queue
    this.syncQueue.set(syncItem.id, syncItem)
    
    // Persist to IndexedDB
    await this.saveToDB('sync_queue', syncItem)
    
    // Emit event
    this.emit('itemQueued', syncItem)
    
    // Try immediate sync if conditions are favorable
    if (this.canSyncNow(syncItem)) {
      this.processSyncItem(syncItem)
    }

    return syncItem.id
  }

  /**
   * Process individual sync item
   */
  async processSyncItem(syncItem) {
    try {
      syncItem.status = 'processing'
      this.emit('itemProcessing', syncItem)

      // Check network conditions
      if (syncItem.networkRequired && !this.canUseNetwork()) {
        syncItem.status = 'waiting_network'
        return false
      }

      // Execute the sync operation
      const result = await this.executeSyncOperation(syncItem)
      
      if (result.success) {
        syncItem.status = 'completed'
        syncItem.completedAt = Date.now()
        
        // Remove from queue
        this.syncQueue.delete(syncItem.id)
        await this.removeFromDB('sync_queue', syncItem.id)
        
        // Update local data if needed
        if (result.data) {
          await this.updateLocalData(syncItem.type, result.data)
        }
        
        this.emit('itemCompleted', syncItem)
        return true
        
      } else if (result.conflict) {
        // Handle data conflict
        await this.handleConflict(syncItem, result.serverData)
        return false
        
      } else {
        throw new Error(result.error || 'Sync operation failed')
      }

    } catch (error) {
      console.error('Sync item processing error:', error)
      
      syncItem.retryCount++
      syncItem.lastError = error.message
      
      if (syncItem.retryCount >= this.config.retryAttempts) {
        syncItem.status = 'failed'
        this.emit('itemFailed', syncItem)
      } else {
        syncItem.status = 'retry'
        // Schedule retry with exponential backoff
        const delay = this.config.retryDelays[syncItem.retryCount - 1] || 15000
        setTimeout(() => this.processSyncItem(syncItem), delay)
      }
      
      await this.saveToDB('sync_queue', syncItem)
      return false
    }
  }

  /**
   * Execute the actual sync operation
   */
  async executeSyncOperation(syncItem) {
    const { type, operation, payload, dataId } = syncItem
    
    // Track data usage
    const payloadSize = JSON.stringify(payload).length
    this.trackDataUsage(payloadSize)

    try {
      // Simulate API call (replace with actual API in production)
      const apiResponse = await this.callAPI({
        endpoint: `/api/${type}`,
        method: this.getHTTPMethod(operation),
        body: payload,
        id: dataId
      })

      return {
        success: true,
        data: apiResponse.data,
        serverVersion: apiResponse.version
      }

    } catch (error) {
      if (error.status === 409) {
        // Conflict - server has newer version
        return {
          success: false,
          conflict: true,
          serverData: error.data
        }
      }
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Handle data conflicts using Ghana-appropriate strategies
   */
  async handleConflict(syncItem, serverData) {
    const conflictId = this.generateConflictId()
    
    const conflict = {
      id: conflictId,
      syncItemId: syncItem.id,
      type: syncItem.type,
      localData: syncItem.payload,
      serverData: serverData,
      createdAt: Date.now(),
      status: 'pending',
      resolutionStrategy: this.getConflictStrategy(syncItem.type)
    }

    // Store conflict for resolution
    this.conflictQueue.set(conflictId, conflict)
    await this.saveToDB('conflicts', conflict)
    
    // Auto-resolve if strategy is defined
    if (conflict.resolutionStrategy === 'server_wins') {
      await this.resolveConflict(conflictId, 'accept_server')
    } else if (conflict.resolutionStrategy === 'client_wins') {
      await this.resolveConflict(conflictId, 'accept_local')
    } else {
      // Require manual resolution
      this.emit('conflictRequiresResolution', conflict)
    }
  }

  /**
   * Resolve data conflict
   */
  async resolveConflict(conflictId, resolution) {
    const conflict = this.conflictQueue.get(conflictId)
    if (!conflict) return false

    try {
      let finalData
      
      switch (resolution) {
        case 'accept_server':
          finalData = conflict.serverData
          break
        case 'accept_local':
          finalData = conflict.localData
          break
        case 'merge':
          finalData = await this.mergeData(conflict.localData, conflict.serverData)
          break
        default:
          throw new Error(`Unknown resolution: ${resolution}`)
      }

      // Update local data
      await this.updateLocalData(conflict.type, finalData)
      
      // Mark conflict as resolved
      conflict.status = 'resolved'
      conflict.resolution = resolution
      conflict.resolvedAt = Date.now()
      
      // Remove from queue
      this.conflictQueue.delete(conflictId)
      await this.removeFromDB('conflicts', conflictId)
      
      this.emit('conflictResolved', conflict)
      return true

    } catch (error) {
      console.error('Conflict resolution error:', error)
      return false
    }
  }

  /**
   * Smart data merging for common scenarios
   */
  async mergeData(localData, serverData) {
    // Basic merge strategy - prefer newer timestamps
    const merged = { ...serverData }
    
    // Merge arrays (like tags, categories)
    Object.keys(localData).forEach(key => {
      if (Array.isArray(localData[key]) && Array.isArray(serverData[key])) {
        merged[key] = [...new Set([...serverData[key], ...localData[key]])]
      } else if (localData.lastModified > serverData.lastModified) {
        merged[key] = localData[key]
      }
    })
    
    merged.mergedAt = Date.now()
    return merged
  }

  /**
   * Sync all pending items
   */
  async syncAll(options = {}) {
    const {
      priority = null,
      maxItems = 50,
      respectDataLimits = true
    } = options

    this.emit('syncStarted')
    
    const startTime = Date.now()
    let processed = 0
    let successful = 0
    let failed = 0

    try {
      // Get items to sync
      const items = Array.from(this.syncQueue.values())
        .filter(item => item.status === 'pending' || item.status === 'retry')
        .filter(item => !priority || this.matchesPriority(item, priority))
        .sort((a, b) => this.priorityScore(b) - this.priorityScore(a))
        .slice(0, maxItems)

      // Check data limits
      if (respectDataLimits && !this.canUseDataForSync()) {
        this.emit('syncSkipped', { reason: 'data_limit' })
        return { processed: 0, successful: 0, failed: 0 }
      }

      // Process items
      for (const item of items) {
        if (respectDataLimits && this.sessionDataUsage > this.config.dataLimits.session) {
          break
        }

        const success = await this.processSyncItem(item)
        processed++
        
        if (success) {
          successful++
        } else {
          failed++
        }

        // Small delay to prevent overwhelming the network
        await new Promise(resolve => setTimeout(resolve, 100))
      }

    } catch (error) {
      console.error('Sync all error:', error)
      this.emit('syncError', error)
    }

    const duration = Date.now() - startTime
    const result = { processed, successful, failed, duration }
    
    this.emit('syncCompleted', result)
    return result
  }

  /**
   * Download course content for offline use
   */
  async downloadCourseOffline(courseId, options = {}) {
    const {
      includeLessons = true,
      includeAssignments = true,
      includeVideos = false, // Videos are large, opt-in only
      quality = 'medium'
    } = options

    try {
      this.emit('downloadStarted', { courseId })

      // Check storage quota
      const estimatedSize = await this.estimateDownloadSize(courseId, options)
      if (!await this.checkStorageQuota(estimatedSize)) {
        throw new Error('Insufficient storage space')
      }

      const downloadTasks = []

      // Course basic info
      downloadTasks.push(this.downloadCourseData(courseId))

      if (includeLessons) {
        downloadTasks.push(this.downloadLessons(courseId))
      }

      if (includeAssignments) {
        downloadTasks.push(this.downloadAssignments(courseId))
      }

      if (includeVideos) {
        downloadTasks.push(this.downloadVideos(courseId, quality))
      }

      // Execute downloads with progress tracking
      const results = await Promise.allSettled(downloadTasks)
      
      const summary = {
        courseId,
        downloadedAt: Date.now(),
        includedContent: { includeLessons, includeAssignments, includeVideos },
        results: results.map(r => ({ 
          status: r.status, 
          value: r.value, 
          reason: r.reason 
        }))
      }

      this.emit('downloadCompleted', summary)
      return summary

    } catch (error) {
      console.error('Course download error:', error)
      this.emit('downloadError', { courseId, error })
      throw error
    }
  }

  /**
   * Get sync status and statistics
   */
  getSyncStatus() {
    const queueItems = Array.from(this.syncQueue.values())
    
    return {
      online: this.isOnline,
      networkQuality: this.getNetworkQuality(),
      queue: {
        total: queueItems.length,
        pending: queueItems.filter(i => i.status === 'pending').length,
        processing: queueItems.filter(i => i.status === 'processing').length,
        retry: queueItems.filter(i => i.status === 'retry').length,
        failed: queueItems.filter(i => i.status === 'failed').length
      },
      conflicts: {
        total: this.conflictQueue.size,
        pending: Array.from(this.conflictQueue.values())
          .filter(c => c.status === 'pending').length
      },
      dataUsage: {
        daily: this.dailyDataUsage,
        session: this.sessionDataUsage,
        remainingDaily: this.config.dataLimits.daily - this.dailyDataUsage,
        remainingSession: this.config.dataLimits.session - this.sessionDataUsage
      },
      lastSync: this.lastSyncTime,
      storage: this.getStorageInfo()
    }
  }

  /**
   * Network quality assessment for Ghana's conditions
   */
  getNetworkQuality() {
    if (!this.isOnline) return 'offline'
    
    const connection = navigator.connection
    if (!connection) return 'unknown'

    const { downlink, rtt } = connection
    const thresholds = this.config.networkThresholds

    if (downlink >= thresholds.excellent.downlink && rtt <= thresholds.excellent.rtt) {
      return 'excellent'
    } else if (downlink >= thresholds.good.downlink && rtt <= thresholds.good.rtt) {
      return 'good'
    } else if (downlink >= thresholds.poor.downlink && rtt <= thresholds.poor.rtt) {
      return 'poor'
    } else {
      return 'very_poor'
    }
  }

  /**
   * Intelligent sync strategy based on conditions
   */
  getOptimalSyncStrategy() {
    const networkQuality = this.getNetworkQuality()
    const dataRemaining = this.config.dataLimits.daily - this.dailyDataUsage
    const batteryLevel = navigator.getBattery ? 
      (navigator.getBattery().then(b => b.level)) : 1

    if (networkQuality === 'offline') {
      return { strategy: 'none', reason: 'offline' }
    }

    if (dataRemaining < this.config.dataLimits.emergency) {
      return { 
        strategy: 'emergency_only', 
        reason: 'data_limit',
        types: this.config.syncStrategies.immediate 
      }
    }

    if (networkQuality === 'poor' || networkQuality === 'very_poor') {
      return { 
        strategy: 'priority_only', 
        reason: 'poor_network',
        types: [...this.config.syncStrategies.immediate, ...this.config.syncStrategies.priority]
      }
    }

    return { 
      strategy: 'full', 
      reason: 'optimal_conditions',
      types: Object.values(this.config.syncStrategies).flat()
    }
  }

  /**
   * Event system for monitoring
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Event listener error for ${event}:`, error)
        }
      })
    }
  }

  /**
   * Utility methods
   */
  generateSyncId() {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  generateConflictId() {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  requiresNetwork(dataType) {
    const offlineTypes = ['user_progress', 'notes', 'bookmarks']
    return !offlineTypes.includes(dataType)
  }

  canSyncNow(syncItem) {
    if (!this.isOnline && syncItem.networkRequired) return false
    if (!this.canUseNetwork()) return false
    return true
  }

  canUseNetwork() {
    const quality = this.getNetworkQuality()
    return quality !== 'offline' && quality !== 'very_poor'
  }

  canUseDataForSync() {
    return this.sessionDataUsage < this.config.dataLimits.session &&
           this.dailyDataUsage < this.config.dataLimits.daily
  }

  trackDataUsage(bytes) {
    this.sessionDataUsage += bytes
    this.dailyDataUsage += bytes
  }

  priorityScore(item) {
    const priorityScores = { high: 3, normal: 2, low: 1 }
    const typeScores = {
      grades: 10, announcements: 9, assignments: 8,
      messages: 7, course_materials: 6, user_progress: 5
    }
    
    return (priorityScores[item.priority] || 2) + (typeScores[item.type] || 0)
  }

  matchesPriority(item, priority) {
    if (priority === 'immediate') {
      return this.config.syncStrategies.immediate.includes(item.type)
    }
    if (priority === 'high') {
      return item.priority === 'high'
    }
    return true
  }

  getHTTPMethod(operation) {
    const methods = { create: 'POST', update: 'PUT', delete: 'DELETE' }
    return methods[operation] || 'POST'
  }

  getConflictStrategy(dataType) {
    const strategies = {
      grades: 'server_wins',
      announcements: 'server_wins',
      user_progress: 'client_wins',
      notes: 'merge'
    }
    return strategies[dataType] || 'manual'
  }

  /**
   * Setup methods
   */
  setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.networkInfo = this.getNetworkInfo()
      this.emit('networkStatusChanged', { online: true })
      this.syncAll({ priority: 'immediate' })
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.emit('networkStatusChanged', { online: false })
    })

    // Monitor connection changes
    if (navigator.connection) {
      navigator.connection.addEventListener('change', () => {
        this.networkInfo = this.getNetworkInfo()
        this.emit('networkQualityChanged', this.getNetworkQuality())
      })
    }
  }

  setupVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // App became active - sync important data
        this.syncAll({ priority: 'immediate', maxItems: 10 })
      }
    })
  }

  startSyncLoops() {
    // Foreground sync loop
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.syncAll({ maxItems: 10, respectDataLimits: true })
      }
    }, this.config.syncIntervals.foreground)

    // Background sync loop
    setInterval(() => {
      if (document.visibilityState === 'hidden') {
        this.syncAll({ priority: 'priority', maxItems: 5 })
      }
    }, this.config.syncIntervals.background)
  }

  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw-sync.js')
        console.log('Sync Service Worker registered:', registration)
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  getNetworkInfo() {
    const connection = navigator.connection
    return connection ? {
      downlink: connection.downlink,
      rtt: connection.rtt,
      effectiveType: connection.effectiveType,
      saveData: connection.saveData
    } : null
  }

  // Simplified versions of complex methods for demo
  async callAPI(options) {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) {
          resolve({ data: { id: 'test', version: Date.now() } })
        } else {
          reject({ status: 500, message: 'Server error' })
        }
      }, 1000 + Math.random() * 2000)
    })
  }

  async loadSyncState() {
    // Load from IndexedDB
    return Promise.resolve()
  }

  async saveToDB(storeName, data) {
    // Save to IndexedDB
    return Promise.resolve()
  }

  async removeFromDB(storeName, id) {
    // Remove from IndexedDB
    return Promise.resolve()
  }

  async updateLocalData(type, data) {
    // Update local cache/storage
    return Promise.resolve()
  }

  async estimateDownloadSize(courseId, options) {
    // Estimate download size
    return 10 * 1024 * 1024 // 10MB estimate
  }

  async checkStorageQuota(size) {
    // Check if enough storage space
    return true
  }

  async downloadCourseData(courseId) {
    // Download course data
    return Promise.resolve()
  }

  async downloadLessons(courseId) {
    // Download lessons
    return Promise.resolve()
  }

  async downloadAssignments(courseId) {
    // Download assignments
    return Promise.resolve()
  }

  async downloadVideos(courseId, quality) {
    // Download videos
    return Promise.resolve()
  }

  getStorageInfo() {
    return {
      used: 0,
      available: 100 * 1024 * 1024,
      quota: 500 * 1024 * 1024
    }
  }
}

// Export singleton instance
const offlineSyncService = new OfflineSyncService()

// Convenience functions
export const queueForSync = (data) => offlineSyncService.queueForSync(data)
export const syncAll = (options) => offlineSyncService.syncAll(options)
export const downloadCourseOffline = (courseId, options) => 
  offlineSyncService.downloadCourseOffline(courseId, options)
export const getSyncStatus = () => offlineSyncService.getSyncStatus()
export const resolveConflict = (conflictId, resolution) => 
  offlineSyncService.resolveConflict(conflictId, resolution)

export default offlineSyncService

// Example usage:
/*
// Queue data for sync
await queueForSync({
  type: 'assignment_submission',
  operation: 'create',
  id: 'assignment_123',
  payload: {
    studentId: 'student_456',
    answers: ['A', 'B', 'C'],
    submittedAt: Date.now()
  },
  priority: 'high'
})

// Download course for offline use
await downloadCourseOffline('course_123', {
  includeLessons: true,
  includeAssignments: true,
  includeVideos: false // Save data in Ghana
})

// Monitor sync events
offlineSyncService.on('syncCompleted', (result) => {
  console.log(`Synced ${result.successful} items successfully`)
})

offlineSyncService.on('conflictRequiresResolution', (conflict) => {
  // Show UI for manual conflict resolution
  showConflictResolutionDialog(conflict)
})
*/