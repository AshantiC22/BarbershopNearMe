import { useEffect, useCallback } from 'react'
import api from '@/services/api.js'

/* Convert a base64url string to a Uint8Array for VAPID */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw     = window.atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

export function usePushNotifications() {
  /* Register service worker on mount */
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => console.log('[SW] registered:', reg.scope))
      .catch(err => console.warn('[SW] registration failed:', err))
  }, [])

  /* Subscribe to push notifications — call after user logs in */
  const subscribe = useCallback(async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
      /* Ask permission */
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      /* Get VAPID public key from backend */
      const { public_key } = await api.get('push/vapid-key/')
      if (!public_key) return

      /* Get SW registration */
      const reg = await navigator.serviceWorker.ready

      /* Check if already subscribed */
      let sub = await reg.pushManager.getSubscription()
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(public_key),
        })
      }

      /* Send subscription to backend */
      await api.post('push/subscribe/', {
        endpoint:  sub.endpoint,
        p256dh:    btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')))),
        auth:      btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')))),
      })
      console.log('[Push] subscribed successfully')
    } catch (err) {
      console.warn('[Push] subscription failed:', err)
    }
  }, [])

  /* Unsubscribe — call on logout */
  const unsubscribe = useCallback(async () => {
    try {
      if (!('serviceWorker' in navigator)) return
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        await api.delete('push/subscribe/')
      }
    } catch (err) {
      console.warn('[Push] unsubscribe failed:', err)
    }
  }, [])

  return { subscribe, unsubscribe }
}
