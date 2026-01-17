// Service Worker for Health Buddy App

const CACHE_NAME = 'health-buddy-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/src/main.jsx',
  '/src/styles/index.css',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  // Skip for API calls, WebSocket connections, and development-related requests
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('ws://') || 
      event.request.url.includes('wss://') || 
      event.request.url.includes('sockjs-node') ||
      event.request.url.includes('__vite_hmr') ||
      event.request.url.includes('hot-update') ||
      event.request.url.includes('?t=') ||
      event.request.url.includes('src/') ||
      event.request.url.includes('@vite/client')) {
    return;
  }
  
  // Add error handling for fetch events
  try {
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(error => {
          console.error('Fetch failed in service worker:', error);
          // Return a fallback response or let the error propagate
          return new Response('Network error occurred', { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
  } catch (error) {
    console.error('Error in fetch event handler:', error);
    // Don't prevent the default behavior if our handler fails
    return;
  }
});