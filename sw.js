/* USC app shell: always try the network first so updates show straight away;
   fall back to the last saved copy when offline. Supabase and other sites are never cached.
   Also shows push notifications (food ready, game reminders, players joining). */
const CACHE = 'usc-v2';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: req.mode === 'navigate' }))
  );
});
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { title: 'United Sports Club', body: e.data && e.data.text() }; }
  const base = new URL('./', self.registration.scope).href;
  e.waitUntil(self.registration.showNotification(d.title || 'United Sports Club', {
    body: d.body || '', icon: base + 'icons/icon-192.png', badge: base + 'icons/icon-192.png',
    data: { url: d.url || base }, tag: d.tag || undefined,
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || self.registration.scope;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) if (c.url.startsWith(self.registration.scope) && 'focus' in c) { c.navigate(url); return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
