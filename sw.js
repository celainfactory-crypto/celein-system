// Service Worker v18.52 — NO CACHE — Network Only
const VERSION = 'v1852-' + Date.now();

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Never cache — always network
  e.respondWith(fetch(e.request, { cache: 'no-store' }));
});
