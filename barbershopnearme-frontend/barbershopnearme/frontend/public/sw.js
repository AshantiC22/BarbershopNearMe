/* ============================================================
   Barbershopnearme — Service Worker
   Handles: PWA install, offline cache, push notifications
   ============================================================ */

const CACHE    = 'bsnm-v2'
const PRECACHE = ['/', '/index.html']

/* ── Install: pre-cache shell ── */
self.addEventListener('install', e => {
  self.skipWaiting()
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE).catch(() => {}))
  )
})

/* ── Activate: clean old caches ── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

/* ── Fetch: network first, cache fallback for navigation ── */
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() =>
        caches.match('/index.html')
      )
    )
    return
  }
  /* API calls — always network, never cache */
  if (e.request.url.includes('/api/')) return
  /* Barber data — always network so photos update instantly */
  if (e.request.url.includes('barbers')) return
  /* Static assets — cache first */
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
    )
  )
})

/* ── Push: show notification ── */
self.addEventListener('push', e => {
  if (!e.data) return
  let payload
  try { payload = e.data.json() }
  catch { payload = { title: 'Barbershopnearme', body: e.data.text(), data: {} } }

  const title   = payload.title || 'Barbershopnearme ✂️'
  const options = {
    body:    payload.body  || '',
    icon:    '/icons/icon-192.png',
    badge:   '/icons/badge-96.png',
    image:   payload.image || undefined,
    vibrate: [200, 100, 200],
    tag:     payload.data?.type || 'general',
    renotify: true,
    data:    payload.data  || {},
    actions: payload.actions || [],
  }

  e.waitUntil(self.registration.showNotification(title, options))
})

/* ── Notification click: open the right page ── */
self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url || '/'

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      /* If app is already open, focus it and navigate */
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      /* Otherwise open a new window */
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
})

/* ── Background sync (future use) ── */
self.addEventListener('sync', e => {
  if (e.tag === 'sync-bookings') {
    /* placeholder for offline booking sync */
  }
})
