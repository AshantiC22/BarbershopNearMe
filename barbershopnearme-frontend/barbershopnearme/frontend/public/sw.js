/* ============================================================
   Barbershopnearme — Service Worker v3
   Strategy: Network first for everything except fonts/icons.
   PWA users always get the latest version immediately.
   ============================================================ */

const CACHE    = 'bsnm-v3'
const PRECACHE = ['/']

/* ── Install: skip waiting immediately so new SW takes over right away ── */
self.addEventListener('install', e => {
  self.skipWaiting()  // activate immediately, don't wait
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE).catch(() => {}))
  )
})

/* ── Activate: claim all clients immediately + clean old caches ── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())  // take control of all open tabs now
      .then(() => {
        /* Tell all open clients to reload so they get the latest build */
        self.clients.matchAll({ type:'window', includeUncontrolled:true })
          .then(clients => clients.forEach(client => client.postMessage({ type:'SW_UPDATED' })))
      })
  )
})

/* ── Fetch strategy ── */
self.addEventListener('fetch', e => {
  const url = e.request.url

  /* Always go to network for API, barber data, auth — never cache */
  if (url.includes('/api/') ||
      url.includes('barbers') ||
      url.includes('gallery') ||
      url.includes('newsletter') ||
      url.includes('push') ||
      url.includes('token')) {
    return  // bypass SW completely — let browser handle
  }

  /* Navigation requests (page loads) — network first, cache fallback */
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          /* Cache a fresh copy */
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
          return res
        })
        .catch(() => caches.match('/') || caches.match('/index.html'))
    )
    return
  }

  /* Static assets (JS, CSS, fonts, icons) — network first, stale fallback */
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request))
  )
})

/* ── Push: show notification ── */
self.addEventListener('push', e => {
  if (!e.data) return
  let payload
  try { payload = e.data.json() }
  catch { payload = { title:'Barbershopnearme', body: e.data.text(), data:{} } }

  const title   = payload.title || 'Barbershopnearme ✂️'
  const options = {
    body:     payload.body   || '',
    icon:     '/icons/icon-192.png',
    badge:    '/icons/badge-96.png',
    vibrate:  [200, 100, 200],
    tag:      payload.data?.type || 'general',
    renotify: true,
    data:     payload.data   || {},
  }
  e.waitUntil(self.registration.showNotification(title, options))
})

/* ── Notification click: open the right page ── */
self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url || '/'
  e.waitUntil(
    self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(clients => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
})
