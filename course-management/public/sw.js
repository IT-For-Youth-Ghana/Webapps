// Professional Service Worker for Ghana Learning Management System
// Version: 1.0.0
// Implements: Cache-First for static assets, Network-First for dynamic data, Background Sync

const CACHE_NAME = 'ghana-lms-v1.0.0';
const DYNAMIC_CACHE_NAME = 'ghana-lms-dynamic-v1.0.0';
const OFFLINE_CACHE_NAME = 'ghana-lms-offline-v1.0.0';

// Define cache strategies for different resource types
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/src/styles/global.css',
  '/shared/styles/dashboard.css',
  '/offline.html'
];

// Cache patterns for different resource types
const CACHE_PATTERNS = [
  {
    pattern: /\.(js|css|woff2?|png|jpg|jpeg|svg|ico)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: CACHE_NAME
  },
  {
    pattern: /\/api\/(courses|assignments|materials)/,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: DYNAMIC_CACHE_NAME
  },
  {
    pattern: /\/api\/user/,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: DYNAMIC_CACHE_NAME
  }
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error caching static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && 
                     cacheName !== DYNAMIC_CACHE_NAME && 
                     cacheName !== OFFLINE_CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Find matching cache pattern
  const pattern = CACHE_PATTERNS.find(p => p.pattern.test(url.pathname + url.search));
  
  if (pattern) {
    event.respondWith(handleCacheStrategy(request, pattern));
  } else {
    // Default to network-first for unmatched requests
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
  }
});

// Handle different caching strategies
async function handleCacheStrategy(request, pattern) {
  switch (pattern.strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, pattern.cacheName);
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, pattern.cacheName);
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, pattern.cacheName);
    default:
      return networkFirst(request, pattern.cacheName);
  }
}

// Cache-first strategy (for static assets)
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    console.log('[SW] Fetching and caching:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first error:', error);
    return getOfflinePage();
  }
}

// Network-first strategy (for dynamic data)
async function networkFirst(request, cacheName) {
  try {
    console.log('[SW] Trying network first:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
      console.log('[SW] Network response cached:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving stale content from cache:', request.url);
      return cachedResponse;
    }
    
    console.error('[SW] Network-first error:', error);
    return getOfflinePage();
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Update cache in background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    console.log('[SW] Serving from cache (stale-while-revalidate):', request.url);
    return cachedResponse;
  }
  
  // Otherwise wait for network
  console.log('[SW] Waiting for network (stale-while-revalidate):', request.url);
  return fetchPromise;
}

// Get offline page
async function getOfflinePage() {
  try {
    const cache = await caches.open(OFFLINE_CACHE_NAME);
    return await cache.match('/offline.html');
  } catch (error) {
    return new Response('Offline - Please check your connection', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Background sync for offline uploads
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-assignments') {
    event.waitUntil(syncOfflineAssignments());
  } else if (event.tag === 'background-sync-messages') {
    event.waitUntil(syncOfflineMessages());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'You have new course updates',
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/badge-72x72.png',
    tag: 'course-update',
    data: {
      url: '/dashboard'
    },
    actions: [
      {
        action: 'view',
        title: 'View Dashboard'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  if (event.data) {
    try {
      const pushData = event.data.json();
      options.body = pushData.body || options.body;
      options.data = pushData.data || options.data;
      options.tag = pushData.tag || options.tag;
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('Ghana LMS', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    const url = event.notification.data?.url || '/dashboard';
    
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          // Check if there's already a window open
          for (const client of clientList) {
            if (client.url.includes(url) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Open new window
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});

console.log('[SW] Service Worker loaded successfully');