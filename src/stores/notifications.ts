import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { PushNotification } from '@/types'

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString()
}

const mockNotifications: PushNotification[] = [
  {
    id: 'n-1',
    title: 'Flash Deal! 🔥',
    body: 'Mama Titi just listed 5 Buka Surprise Bags at 70% off. Grab yours before they run out!',
    type: 'deal',
    read: false,
    createdAt: hoursAgo(0.5),
  },
  {
    id: 'n-2',
    title: 'Order Ready for Pickup 🛍️',
    body: 'Your Jollof Rice Special is ready. Head over to ChopBar Express! (🚗 ~15 mins away)',
    type: 'order-update',
    read: false,
    createdAt: hoursAgo(2),
  },
  {
    id: 'n-3',
    title: 'Welcome to JaraBag! 🌱',
    body: 'Thanks for joining the movement to rescue food and save money.',
    type: 'system',
    read: true,
    createdAt: hoursAgo(48),
  },
]

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<PushNotification[]>(mockNotifications)

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  function markAsRead(id: string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(n => n.read = true)
  }

  function clearAll() {
    notifications.value = []
  }

  function addNotification(title: string, body: string, type: 'deal' | 'order-update' | 'system', data?: Record<string, unknown>) {
    const newNotification: PushNotification = {
      id: `n-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      body,
      type,
      data,
      read: false,
      createdAt: new Date().toISOString(),
    }
    notifications.value.unshift(newNotification)
    return newNotification
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    addNotification,
  }
})
