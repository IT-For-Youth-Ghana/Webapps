// Service Worker for IT Youth Talent Incubator & Course Management
// Provides PWA functionality for both platforms

const CACHE_NAME = 'it-youth-talent-v1'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  // Add your static assets here
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE
            })
            .map((cacheName) => {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    event.respondWith(fetch(request))
    return
  }
  
  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    event.respondWith(fetch(request))
    return
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('🎯 Serving from cache:', request.url)
          return cachedResponse
        }
        
        // Otherwise fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache if not successful
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }
            
            // Clone response for caching
            const responseToCache = response.clone()
            
            // Cache successful responses
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                console.log('💾 Caching new resource:', request.url)
                cache.put(request, responseToCache)
              })
            
            return response
          })
          .catch(() => {
            // Return offline page for HTML requests
            if (request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/offline.html')
            }
            
            // Return offline placeholder for images
            if (request.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
              return new Response(
                '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ccc"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666">Offline</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              )
            }
            
            // Return offline JSON for API requests
            if (request.url.includes('/api/')) {
              return new Response(
                JSON.stringify({ 
                  error: 'Offline', 
                  message: 'No network connection available' 
                }),
                { 
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                }
              )
            }
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from IT Youth Talent',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('IT Youth Talent', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open app
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/')
        }
      })
    )
  }
})

// Background sync helper function
async function doBackgroundSync() {
  // Get all pending actions from IndexedDB
  const pendingActions = await getPendingActions()
  
  for (const action of pendingActions) {
    try {
      await syncAction(action)
      await removePendingAction(action.id)
    } catch (error) {
      console.error('Sync failed for action:', action, error)
    }
  }
}

// IndexedDB helpers for offline storage
async function getPendingActions() {
  // Implementation would go here
  return []
}

async function removePendingAction(id) {
  // Implementation would go here
}

async function syncAction(action) {
  // Implementation would go here
  // This would retry failed API calls
}

// Message handler for manual cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    )
  }
})