// NEBULA // 100TODO - Service Worker
const CACHE = 'nebula-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

// Push notification received
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data?.json() ?? {}; } catch {}

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'NEBULA // 100TODO', {
      body: data.body ?? '你的星云在等你 ✦',
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: 'nebula-daily',
      renotify: true,
      data: { url: data.url ?? '/' },
      vibrate: [200, 100, 200, 100, 200],
    })
  );
});

// Notification click → open/focus the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus();
      }
      return clients.openWindow(targetUrl);
    })
  );
});
