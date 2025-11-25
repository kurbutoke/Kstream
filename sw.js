const CACHE_NAME = 'kstream-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './home.js',
    './player.js',
    './utils.js',
    './manifest.json',
    './img/favicon.png',
    './img/logo.png',
    './img/logo.svg',
    './img/empty.png'
];

// Install event: cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching all: app shell and content');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// Fetch event: Network first for API, Stale-while-revalidate for others
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // API calls: Network first, fall back to nothing (or offline JSON if we had it)
    if (url.hostname.includes('api.themoviedb.org')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                // Return null or a custom offline JSON response if desired
                return new Response(JSON.stringify({ error: 'Network error' }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
        return;
    }

    // Static assets: Stale-while-revalidate
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // Update cache with new version
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            });

            // Return cached response immediately if available, otherwise wait for network
            return cachedResponse || fetchPromise;
        })
    );
});
