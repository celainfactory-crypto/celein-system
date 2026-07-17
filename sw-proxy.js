// Service Worker Proxy v18.51 - لا يكشف أي شيء من الكاش
const VERSION = 'celein-v18-51';

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.method !== 'GET') return;

  // servir directement depuis le réseau (pas de cache)
  event.respondWith(fetch(event.request));
});
