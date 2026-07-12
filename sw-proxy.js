// Service Worker Proxy - يحول طلبات Netlify إلى jsDelivr
const VERSION = 'celein-v19-proxy';
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/celainfactory-crypto/celein-system@main';

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
  
  // تحويل طلبات الملفات إلى jsDelivr
  const path = url.pathname;
  if (path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.json')) {
    const cdnUrl = CDN_BASE + path + (path.includes('?') ? '' : '');
    event.respondWith(
      fetch(cdnUrl, { cache: 'no-cache' })
        .catch(() => fetch(event.request, { cache: 'no-cache' }))
    );
  }
});
