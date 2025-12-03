// Simple service worker: cache shell and runtime caching for API
const CACHE_NAME = 'pwa-bomba-v1';
const ASSETS = [
'/',
'/index.html',
'/manifest.json',
'/icon-192.png',
'/icon-512.png'
];


self.addEventListener('install', (event) => {
event.waitUntil(
caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
);
self.skipWaiting();
});


self.addEventListener('activate', (event) => {
event.waitUntil(
caches.keys().then(keys => Promise.all(
keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
))
);
self.clients.claim();
});


self.addEventListener('fetch', (event) => {
const req = event.request;
const url = new URL(req.url);


// For API calls to local ESP32, prefer network then cache fallback
if (url.pathname.startsWith('/status') || url.pathname.startsWith('/command')) {
event.respondWith(
fetch(req).catch(() => caches.match(req))
);
return;
}


// For navigation (HTML), serve cache first then network
if (req.mode === 'navigate') {
event.respondWith(
caches.match('/index.html').then(resp => resp || fetch(req))
);
return;
}


// For other assets, cache-first
event.respondWith(
caches.match(req).then(resp => resp || fetch(req))
);
});
