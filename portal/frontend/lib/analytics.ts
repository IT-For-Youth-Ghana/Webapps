// Analytics and monitoring setup for production

import { trackWebVitals, trackError, trackInteraction } from './performance'

// Google Analytics 4
export function initGoogleAnalytics(measurementId: string) {
  if (typeof window === 'undefined' || !measurementId) return

  // Load Google Analytics script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  // Initialize gtag
  ;(window as any).dataLayer = (window as any).dataLayer || []
  function gtag(...args: any[]) {
    ;(window as any).dataLayer.push(args)
  }
  ;(window as any).gtag = gtag

  gtag('js', new Date())
  gtag('config', measurementId, {
    send_page_view: true,
    custom_map: {
      dimension1: 'user_type',
      dimension2: 'organization',
    },
  })

  // Track web vitals
  if (typeof window !== 'undefined' && 'web-vitals' in window) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(trackWebVitals)
      getFID(trackWebVitals)
      getFCP(trackWebVitals)
      getLCP(trackWebVitals)
      getTTFB(trackWebVitals)
    })
  }
}

// Hotjar analytics
export function initHotjar(hotjarId: string) {
  if (typeof window === 'undefined' || !hotjarId) return

  ;(function(h: any, o: any, t: any, j: any, a?: any, r?: any) {
    h.hj = h.hj || function() {
      (h.hj.q = h.hj.q || []).push(arguments)
    }
    h._hjSettings = { hjid: parseInt(hotjarId), hjsv: 6 }
    a = o.getElementsByTagName('head')[0]
    r = o.createElement('script')
    r.async = 1
    r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv
    a.appendChild(r)
  })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=')
}

// Sentry error reporting
export function initSentry(dsn: string) {
  if (typeof window === 'undefined' || !dsn) return

  import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      integrations: [
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
    })
  })
}

// Facebook Pixel
export function initFacebookPixel(pixelId: string) {
  if (typeof window === 'undefined' || !pixelId) return

  // Load Facebook Pixel script
  ;(function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    }
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = !0
    n.version = '2.0'
    n.queue = []
    t = b.createElement(e)
    t.async = !0
    t.src = v
    s = b.getElementsByTagName(e)[0]
    s.parentNode.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')

  ;(window as any).fbq('init', pixelId)
  ;(window as any).fbq('track', 'PageView')
}

// Custom event tracking
export function trackEvent(eventName: string, parameters: Record<string, any> = {}) {
  // Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', eventName, parameters)
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    ;(window as any).fbq('track', eventName, parameters)
  }

  // Custom tracking
  trackInteraction(eventName, 'user_action', parameters.category, parameters.value)
}

// Page view tracking
export function trackPageView(pagePath: string, pageTitle?: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('config', process.env.NEXT_PUBLIC_GA_TRACKING_ID, {
      page_path: pagePath,
      page_title: pageTitle,
    })
  }
}

// User identification
export function identifyUser(userId: string, traits: Record<string, any> = {}) {
  // Google Analytics user ID
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('config', process.env.NEXT_PUBLIC_GA_TRACKING_ID, {
      user_id: userId,
      custom_map: {
        dimension1: traits.user_type,
        dimension2: traits.organization,
      },
    })
  }

  // Hotjar user identification
  if (typeof window !== 'undefined' && (window as any).hj) {
    ;(window as any).hj('identify', userId, traits)
  }
}

// Error tracking wrapper
export function logError(error: Error, context?: Record<string, any>) {
  trackError(error, context)

  // Send to analytics as exception
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', 'exception', {
      description: error.message,
      fatal: false,
    })
  }
}

// Performance monitoring
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Long task > 50ms
            trackEvent('long_task', {
              duration: entry.duration,
              category: 'performance',
            })
          }
        }
      })
      observer.observe({ entryTypes: ['longtask'] })
    } catch (error) {
      console.warn('Long task monitoring not supported')
    }
  }

  // Monitor memory usage (Chrome only)
  if ('memory' in performance) {
    setInterval(() => {
      const memory = (performance as any).memory
      if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
        trackEvent('high_memory_usage', {
          used: memory.usedJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          category: 'performance',
        })
      }
    }, 30000) // Check every 30 seconds
  }
}

// Initialize all analytics services
export function initAnalytics() {
  if (process.env.NODE_ENV !== 'production') return

  // Initialize services if environment variables are set
  if (process.env.NEXT_PUBLIC_GA_TRACKING_ID) {
    initGoogleAnalytics(process.env.NEXT_PUBLIC_GA_TRACKING_ID)
  }

  if (process.env.NEXT_PUBLIC_HOTJAR_ID) {
    initHotjar(process.env.NEXT_PUBLIC_HOTJAR_ID)
  }

  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    initSentry(process.env.NEXT_PUBLIC_SENTRY_DSN)
  }

  if (process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID) {
    initFacebookPixel(process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID)
  }

  // Initialize performance monitoring
  initPerformanceMonitoring()
}