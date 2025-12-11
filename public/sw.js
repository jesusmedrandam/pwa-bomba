self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  clients.claim();
});

// Required minimal fetch to make PWA installable
self.addEventListener("fetch", () => {});
