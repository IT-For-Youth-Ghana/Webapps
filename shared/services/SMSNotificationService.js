/**
 * SMS Notification Service for IT Youth Incubator Ghana
 * 
 * Handles SMS notifications for offline users and critical announcements
 * Designed for Ghana's mobile-first environment with Twilio integration
 */

class SMSNotificationService {
  constructor() {
    // Configuration for Ghana and West Africa
    this.config = {
      // Twilio configuration (would be loaded from environment variables)
      twilioAccountSid: process.env.VUE_APP_TWILIO_ACCOUNT_SID || '',
      twilioAuthToken: process.env.VUE_APP_TWILIO_AUTH_TOKEN || '',
      twilioPhoneNumber: process.env.VUE_APP_TWILIO_PHONE_NUMBER || '',
      
      // Regional settings for Ghana
      defaultCountryCode: '+233',
      supportedCountries: ['+233', '+234', '+254', '+256'], // Ghana, Nigeria, Kenya, Uganda
      
      // Rate limiting and batching
      maxSMSPerHour: 100,
      batchSize: 50,
      retryAttempts: 3,
      retryDelay: 5000, // 5 seconds
      
      // Cost optimization for developing regions
      enableBatching: true,
      enableScheduling: true,
      enableCostControl: true,
      maxDailyCost: 50, // USD
      
      // Message templates for local context
      messageTemplates: {
        courseReminder: {
          en: 'Hi {name}! Your {course} class starts at {time}. Join at {link}',
          tw: 'Hi {name}! Wo {course} adesua fi ase wɔ {time}. Kɔ {link}',
          ha: 'Sannu {name}! {course} karatun ku zai fara da {time}. Shiga {link}'
        },
        assignmentDue: {
          en: 'Assignment "{assignment}" is due in {hours} hours. Submit at {link}',
          tw: 'Adwuma "{assignment}" no bedu awiei wɔ nnɔnhwerew {hours} mu. Fa kɔ {link}',
          ha: 'Aikin "{assignment}" zai kare cikin sa\'o\'i {hours}. Aika zuwa {link}'
        },
        gradeUpdate: {
          en: 'Your grade for {assignment} is {grade}. Check details at {link}',
          tw: 'Wo grade ma {assignment} ne {grade}. Hwɛ nkyerɛkyerɛmu wɔ {link}',
          ha: 'Maki na {assignment} shine {grade}. Duba cikakkun bayani a {link}'
        },
        systemAlert: {
          en: 'URGENT: {message}. Contact support if needed.',
          tw: 'AMONAHYIA: {message}. Frɛ mmoa sɛ ɛho hia a.',
          ha: 'GAGGAWA: {message}. Tuntuɓi tallafi idan ya cancanta.'
        }
      }
    }
    
    // Initialize state
    this.isInitialized = false
    this.smsQueue = []
    this.sentMessages = new Map()
    this.userPreferences = new Map()
    this.dailyCost = 0
    this.hourlyCount = 0
    this.lastHourReset = Date.now()
    
    // Offline storage for failed messages
    this.offlineQueue = this.loadOfflineQueue()
    
    this.init()
  }

  /**
   * Initialize the SMS service
   */
  async init() {
    try {
      // Load user preferences from local storage
      this.loadUserPreferences()
      
      // Set up periodic tasks
      this.setupPeriodicTasks()
      
      // Register service worker for background processing
      if ('serviceWorker' in navigator) {
        await this.registerServiceWorker()
      }
      
      // Monitor network status for offline handling
      this.setupNetworkMonitoring()
      
      this.isInitialized = true
      console.log('SMS Notification Service initialized for Ghana region')
    } catch (error) {
      console.error('Failed to initialize SMS service:', error)
    }
  }

  /**
   * Send SMS notification with Ghana-specific optimizations
   */
  async sendSMS(options) {
    const {
      to,
      message,
      template,
      templateData = {},
      priority = 'normal',
      userId,
      type = 'notification',
      language = 'en',
      scheduleFor = null
    } = options

    try {
      // Validate phone number format for Ghana/West Africa
      const formattedNumber = this.formatPhoneNumber(to)
      if (!formattedNumber) {
        throw new Error('Invalid phone number format')
      }

      // Check user preferences and consent
      if (!this.canSendToUser(userId, type)) {
        console.log(`SMS blocked by user preference: ${userId}`)
        return { success: false, reason: 'user_preference' }
      }

      // Prepare message content
      const finalMessage = template 
        ? this.formatTemplate(template, templateData, language)
        : message

      // Create SMS job
      const smsJob = {
        id: this.generateMessageId(),
        to: formattedNumber,
        message: finalMessage,
        priority,
        userId,
        type,
        language,
        createdAt: Date.now(),
        scheduleFor: scheduleFor || Date.now(),
        attempts: 0,
        status: 'pending'
      }

      // Handle scheduling
      if (scheduleFor && scheduleFor > Date.now()) {
        return this.scheduleMessage(smsJob)
      }

      // Check rate limits and cost controls
      if (!this.checkRateLimits() || !this.checkCostLimits()) {
        return this.queueMessage(smsJob)
      }

      // Send immediately
      return await this.sendSMSNow(smsJob)

    } catch (error) {
      console.error('SMS send error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send SMS immediately via Twilio
   */
  async sendSMSNow(smsJob) {
    try {
      // Check network connectivity
      if (!navigator.onLine) {
        return this.queueForOffline(smsJob)
      }

      // Call Twilio API
      const response = await this.callTwilioAPI(smsJob)
      
      if (response.success) {
        this.updateCounters()
        this.trackMessage(smsJob, 'sent')
        return { success: true, messageId: response.messageId }
      } else {
        throw new Error(response.error)
      }

    } catch (error) {
      console.error('Failed to send SMS:', error)
      
      // Retry logic for network issues
      if (smsJob.attempts < this.config.retryAttempts) {
        smsJob.attempts++
        smsJob.status = 'retry'
        setTimeout(() => this.sendSMSNow(smsJob), this.config.retryDelay)
        return { success: false, retry: true }
      }
      
      return { success: false, error: error.message }
    }
  }

  /**
   * Simulate Twilio API call (in production, use actual Twilio SDK)
   */
  async callTwilioAPI(smsJob) {
    // In production, this would be actual Twilio API call:
    /*
    const client = require('twilio')(this.config.twilioAccountSid, this.config.twilioAuthToken)
    
    const message = await client.messages.create({
      body: smsJob.message,
      from: this.config.twilioPhoneNumber,
      to: smsJob.to
    })
    
    return { success: true, messageId: message.sid }
    */

    // Simulation for development
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1 // 90% success rate
        if (success) {
          resolve({ 
            success: true, 
            messageId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
          })
        } else {
          resolve({ success: false, error: 'Network timeout' })
        }
      }, 1000 + Math.random() * 2000) // 1-3 second delay
    })
  }

  /**
   * Format phone number for Ghana/West Africa standards
   */
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return null

    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '')

    // Handle different formats
    if (cleaned.startsWith('0')) {
      // Local format (0XX XXXX XXXX) -> +233XX XXXX XXXX
      cleaned = '+233' + cleaned.substring(1)
    } else if (cleaned.startsWith('233')) {
      // Without country code prefix
      cleaned = '+' + cleaned
    } else if (!cleaned.startsWith('+')) {
      // Assume Ghana if no country code
      cleaned = '+233' + cleaned
    }

    // Validate Ghana number format (+233 XX XXXX XXXX)
    const ghanaPattern = /^\+233[245]\d{8}$/
    const nigeriaPattern = /^\+234[789]\d{9}$/
    const kenyaPattern = /^\+254[7]\d{8}$/

    if (ghanaPattern.test(cleaned) || nigeriaPattern.test(cleaned) || kenyaPattern.test(cleaned)) {
      return cleaned
    }

    return null
  }

  /**
   * Format message template with localization
   */
  formatTemplate(template, data, language = 'en') {
    const templates = this.config.messageTemplates[template]
    if (!templates) {
      console.warn(`Template not found: ${template}`)
      return `Error: Template ${template} not found`
    }

    let message = templates[language] || templates.en
    
    // Replace placeholders
    Object.keys(data).forEach(key => {
      const placeholder = `{${key}}`
      message = message.replace(new RegExp(placeholder, 'g'), data[key])
    })

    return message
  }

  /**
   * Check if SMS can be sent to user based on preferences
   */
  canSendToUser(userId, type) {
    if (!userId) return true

    const preferences = this.userPreferences.get(userId)
    if (!preferences) return true

    // Check global SMS consent
    if (!preferences.smsEnabled) return false

    // Check specific notification type
    const typePreferences = preferences.notificationTypes || {}
    return typePreferences[type] !== false
  }

  /**
   * Check rate limiting
   */
  checkRateLimits() {
    const now = Date.now()
    
    // Reset hourly counter if needed
    if (now - this.lastHourReset > 3600000) { // 1 hour
      this.hourlyCount = 0
      this.lastHourReset = now
    }

    return this.hourlyCount < this.config.maxSMSPerHour
  }

  /**
   * Check cost limits
   */
  checkCostLimits() {
    if (!this.config.enableCostControl) return true
    
    // Estimate cost (approximately $0.05 per SMS for Ghana)
    const estimatedCost = 0.05
    return (this.dailyCost + estimatedCost) <= this.config.maxDailyCost
  }

  /**
   * Update counters after sending
   */
  updateCounters() {
    this.hourlyCount++
    this.dailyCost += 0.05 // Estimated cost per SMS
  }

  /**
   * Queue message for later sending
   */
  queueMessage(smsJob) {
    smsJob.status = 'queued'
    this.smsQueue.push(smsJob)
    console.log(`SMS queued: ${smsJob.id}`)
    return { success: true, queued: true, messageId: smsJob.id }
  }

  /**
   * Schedule message for future sending
   */
  scheduleMessage(smsJob) {
    smsJob.status = 'scheduled'
    this.smsQueue.push(smsJob)
    console.log(`SMS scheduled for ${new Date(smsJob.scheduleFor)}: ${smsJob.id}`)
    return { success: true, scheduled: true, messageId: smsJob.id }
  }

  /**
   * Queue for offline sending
   */
  queueForOffline(smsJob) {
    smsJob.status = 'offline'
    this.offlineQueue.push(smsJob)
    this.saveOfflineQueue()
    console.log(`SMS queued for offline: ${smsJob.id}`)
    return { success: true, offline: true, messageId: smsJob.id }
  }

  /**
   * Process queued messages
   */
  async processQueue() {
    if (!this.isInitialized || this.smsQueue.length === 0) return

    const now = Date.now()
    const readyMessages = this.smsQueue.filter(msg => 
      msg.scheduleFor <= now && 
      (msg.status === 'queued' || msg.status === 'scheduled')
    )

    for (const message of readyMessages.slice(0, this.config.batchSize)) {
      if (!this.checkRateLimits() || !this.checkCostLimits()) {
        break
      }

      await this.sendSMSNow(message)
      this.smsQueue = this.smsQueue.filter(msg => msg.id !== message.id)
    }
  }

  /**
   * Process offline queue when back online
   */
  async processOfflineQueue() {
    if (!navigator.onLine || this.offlineQueue.length === 0) return

    console.log(`Processing ${this.offlineQueue.length} offline messages`)

    for (const message of [...this.offlineQueue]) {
      const result = await this.sendSMSNow(message)
      if (result.success) {
        this.offlineQueue = this.offlineQueue.filter(msg => msg.id !== message.id)
      }
    }

    this.saveOfflineQueue()
  }

  /**
   * Bulk send SMS notifications
   */
  async sendBulkSMS(recipients, template, templateData = {}, options = {}) {
    const results = []
    const {
      batchSize = this.config.batchSize,
      delayBetweenBatches = 1000,
      priority = 'normal'
    } = options

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize)
      const batchPromises = batch.map(recipient => 
        this.sendSMS({
          to: recipient.phone,
          template,
          templateData: { ...templateData, ...recipient },
          userId: recipient.id,
          priority,
          language: recipient.language || 'en'
        })
      )

      const batchResults = await Promise.allSettled(batchPromises)
      results.push(...batchResults)

      // Delay between batches to avoid overwhelming the API
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
      }
    }

    return results
  }

  /**
   * Set user SMS preferences
   */
  setUserPreferences(userId, preferences) {
    this.userPreferences.set(userId, {
      smsEnabled: preferences.smsEnabled ?? true,
      notificationTypes: {
        courseReminder: preferences.courseReminder ?? true,
        assignmentDue: preferences.assignmentDue ?? true,
        gradeUpdate: preferences.gradeUpdate ?? false,
        systemAlert: preferences.systemAlert ?? true,
        ...preferences.notificationTypes
      },
      language: preferences.language || 'en',
      quietHours: preferences.quietHours || { start: 22, end: 7 }, // 10 PM to 7 AM
      timezone: preferences.timezone || 'Africa/Accra'
    })

    this.saveUserPreferences()
  }

  /**
   * Track message for analytics
   */
  trackMessage(smsJob, status) {
    this.sentMessages.set(smsJob.id, {
      ...smsJob,
      status,
      sentAt: Date.now()
    })

    // Limit memory usage by keeping only recent messages
    if (this.sentMessages.size > 1000) {
      const entries = Array.from(this.sentMessages.entries())
      entries.sort((a, b) => b[1].sentAt - a[1].sentAt)
      this.sentMessages = new Map(entries.slice(0, 500))
    }
  }

  /**
   * Get SMS analytics
   */
  getAnalytics(timeframe = 'day') {
    const now = Date.now()
    const timeframes = {
      hour: 3600000,
      day: 86400000,
      week: 604800000,
      month: 2592000000
    }

    const cutoff = now - timeframes[timeframe]
    const recentMessages = Array.from(this.sentMessages.values())
      .filter(msg => msg.sentAt >= cutoff)

    return {
      total: recentMessages.length,
      sent: recentMessages.filter(msg => msg.status === 'sent').length,
      failed: recentMessages.filter(msg => msg.status === 'failed').length,
      queued: this.smsQueue.length,
      offline: this.offlineQueue.length,
      costEstimate: recentMessages.length * 0.05,
      byType: this.groupBy(recentMessages, 'type'),
      byLanguage: this.groupBy(recentMessages, 'language')
    }
  }

  /**
   * Setup periodic tasks
   */
  setupPeriodicTasks() {
    // Process queue every 30 seconds
    setInterval(() => this.processQueue(), 30000)

    // Reset daily cost at midnight Ghana time
    setInterval(() => {
      const now = new Date()
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        this.dailyCost = 0
        console.log('Daily SMS cost counter reset')
      }
    }, 60000) // Check every minute

    // Clean up old messages every hour
    setInterval(() => this.cleanup(), 3600000)
  }

  /**
   * Setup network monitoring for offline handling
   */
  setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      console.log('Network connection restored, processing offline queue')
      this.processOfflineQueue()
    })

    window.addEventListener('offline', () => {
      console.log('Network connection lost, queuing messages for offline')
    })
  }

  /**
   * Register service worker for background processing
   */
  async registerServiceWorker() {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/sw-sms.js')
        console.log('SMS Service Worker registered:', registration)
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  /**
   * Utility methods
   */
  generateMessageId() {
    return `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key] || 'unknown'
      groups[group] = (groups[group] || 0) + 1
      return groups
    }, {})
  }

  cleanup() {
    // Remove messages older than 24 hours
    const cutoff = Date.now() - 86400000
    for (const [id, message] of this.sentMessages) {
      if (message.sentAt < cutoff) {
        this.sentMessages.delete(id)
      }
    }

    // Remove old queued messages
    this.smsQueue = this.smsQueue.filter(msg => 
      (Date.now() - msg.createdAt) < 86400000
    )
  }

  /**
   * Local storage methods
   */
  loadUserPreferences() {
    try {
      const stored = localStorage.getItem('sms_user_preferences')
      if (stored) {
        const preferences = JSON.parse(stored)
        Object.entries(preferences).forEach(([userId, prefs]) => {
          this.userPreferences.set(userId, prefs)
        })
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error)
    }
  }

  saveUserPreferences() {
    try {
      const preferences = Object.fromEntries(this.userPreferences)
      localStorage.setItem('sms_user_preferences', JSON.stringify(preferences))
    } catch (error) {
      console.error('Failed to save user preferences:', error)
    }
  }

  loadOfflineQueue() {
    try {
      const stored = localStorage.getItem('sms_offline_queue')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load offline queue:', error)
      return []
    }
  }

  saveOfflineQueue() {
    try {
      localStorage.setItem('sms_offline_queue', JSON.stringify(this.offlineQueue))
    } catch (error) {
      console.error('Failed to save offline queue:', error)
    }
  }
}

// Export singleton instance
const smsNotificationService = new SMSNotificationService()

// Convenience functions for easy usage
export const sendSMS = (options) => smsNotificationService.sendSMS(options)
export const sendBulkSMS = (recipients, template, data, options) => 
  smsNotificationService.sendBulkSMS(recipients, template, data, options)
export const setUserSMSPreferences = (userId, preferences) => 
  smsNotificationService.setUserPreferences(userId, preferences)
export const getSMSAnalytics = (timeframe) => 
  smsNotificationService.getAnalytics(timeframe)

export default smsNotificationService

// Example usage:
/*
// Basic SMS
await sendSMS({
  to: '+233244123456',
  message: 'Hello from IT Youth Incubator!'
})

// Template SMS with localization
await sendSMS({
  to: '+233244123456',
  template: 'courseReminder',
  templateData: {
    name: 'Kwame',
    course: 'Web Development',
    time: '2:00 PM',
    link: 'https://app.example.com/join/12345'
  },
  language: 'tw', // Twi
  userId: 'user123'
})

// Bulk SMS
await sendBulkSMS(
  [
    { id: 'user1', phone: '+233244123456', name: 'Kwame', language: 'en' },
    { id: 'user2', phone: '+233244654321', name: 'Afia', language: 'tw' }
  ],
  'assignmentDue',
  {
    assignment: 'JavaScript Project',
    hours: 24,
    link: 'https://app.example.com/assignments/123'
  }
)

// Set user preferences
setUserSMSPreferences('user123', {
  smsEnabled: true,
  courseReminder: true,
  assignmentDue: true,
  gradeUpdate: false,
  language: 'tw',
  quietHours: { start: 22, end: 6 }
})
*/