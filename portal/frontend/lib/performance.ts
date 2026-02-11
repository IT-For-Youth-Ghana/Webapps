// Performance monitoring utilities for production

export interface PerformanceMetrics {
  FCP?: number
  LCP?: number
  FID?: number
  CLS?: number
  TTFB?: number
}

// Web Vitals tracking
export function trackWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    console.log('Web Vital:', metric)

    // Send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.value),
        non_interaction: true,
      })
    }

    // Send to monitoring service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      ;(window as any).Sentry.captureMessage(`Web Vital: ${metric.name}`, {
        level: 'info',
        tags: {
          metric: metric.name,
          value: metric.value,
        },
      })
    }
  }
}

// Performance observer for additional metrics
export function initPerformanceObserver() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return
  }

  try {
    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      trackWebVitals({
        name: 'LCP',
        value: lastEntry.startTime,
        id: 'v3-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      })
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        trackWebVitals({
          name: 'FID',
          value: entry.processingStart - entry.startTime,
          id: 'v3-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        })
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      trackWebVitals({
        name: 'CLS',
        value: clsValue,
        id: 'v3-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      })
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })

  } catch (error) {
    console.warn('Performance observer initialization failed:', error)
  }
}

// Memory usage monitoring
export function getMemoryUsage() {
  if (typeof window === 'undefined' || !(window as any).performance?.memory) {
    return null
  }

  const memory = (window as any).performance.memory
  return {
    used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
    total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
  }
}

// Network information
export function getNetworkInfo() {
  if (typeof window === 'undefined' || !(window as any).navigator?.connection) {
    return null
  }

  const connection = (window as any).navigator.connection
  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
  }
}

// Page load timing
export function getPageLoadTiming() {
  if (typeof window === 'undefined' || !window.performance?.timing) {
    return null
  }

  const timing = window.performance.timing
  return {
    dns: timing.domainLookupEnd - timing.domainLookupStart,
    tcp: timing.connectEnd - timing.connectStart,
    tls: timing.requestStart - timing.connectEnd,
    request: timing.responseStart - timing.requestStart,
    response: timing.responseEnd - timing.responseStart,
    dom: timing.domContentLoadedEventEnd - timing.navigationStart,
    load: timing.loadEventEnd - timing.navigationStart,
  }
}

// Resource timing
export function getResourceTiming() {
  if (typeof window === 'undefined' || !window.performance?.getEntriesByType) {
    return []
  }

  return window.performance.getEntriesByType('resource').map((entry: any) => ({
    name: entry.name,
    duration: entry.duration,
    size: entry.transferSize,
    type: entry.initiatorType,
  }))
}

// Error tracking
export function trackError(error: Error, context?: any) {
  console.error('Application Error:', error, context)

  if (process.env.NODE_ENV === 'production') {
    // Send to error reporting service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      ;(window as any).Sentry.captureException(error, {
        tags: context,
      })
    }

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      })
    }
  }
}

// User interaction tracking
export function trackInteraction(action: string, category: string, label?: string, value?: number) {
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}