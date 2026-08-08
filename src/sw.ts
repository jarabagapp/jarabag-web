/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'

declare let self: ServiceWorkerGlobalScope

// Precache all assets compiled by Vite
precacheAndRoute(self.__WB_MANIFEST || [])

// Standard PWA Web Push Notification listener (VAPID backend compatible)
self.addEventListener('push', (event) => {
  let title = 'JaraBag'
  let body = 'New surplus food bags available near you!'
  let url = '/'

  if (event.data) {
    try {
      const parsed = event.data.json()
      if (parsed && parsed.notification) {
        title = parsed.notification.title || title
        body = parsed.notification.body || body
        url = parsed.notification.data?.url || parsed.notification.url || url
      } else {
        title = parsed.title || title
        body = parsed.body || body
        url = parsed.url || url
      }
    } catch {
      body = event.data.text() || body
    }
  }

  const options: any = {
    body: body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: { url }, // Attach data object containing redirect target URL
    tag: 'jarabag-proximity-alert', // Standard tag: overwrites previous notification to prevent spamming
    renotify: true,
  }

  // Post message to all window clients so the open app updates in real-time
  const broadcastPromise = self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    for (const client of clientList) {
      client.postMessage({
        type: 'PUSH_NOTIFICATION_RECEIVED',
        title,
        body,
        url
      })
    }
  })

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      broadcastPromise
    ])
  )
})

// Handle Notification clicks (routes user directly to the app + target view)
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  // Retrieve redirect URL from notification data payload, default to root homepage
  const notificationData = event.notification.data || {}
  const targetUrl = notificationData.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 1. If an app tab is already open, focus it and navigate to target page
      for (const client of clientList) {
        if ('focus' in client && 'navigate' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      // 2. If no window is open, open a new window of our PWA pointing to the target URL
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})
