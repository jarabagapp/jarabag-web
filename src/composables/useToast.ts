import { ref } from 'vue'
import type { Toast, ToastType } from '@/types'

const toasts = ref<Toast[]>([])
const MAX_TOASTS = 3
let toastIdCounter = 0

function addToast(type: ToastType, message: string, duration = 5000) {
  const id = `toast-${++toastIdCounter}`
  const toast: Toast = { id, type, message, duration }

  if (toasts.value.length >= MAX_TOASTS) {
    toasts.value.shift()
  }

  toasts.value.push(toast)

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }

  return id
}

function removeToast(id: string) {
  const index = toasts.value.findIndex((t) => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

export function useToast() {
  const success = (message: string, duration?: number) => addToast('success', message, duration)
  const error = (message: string, duration?: number) => addToast('error', message, duration ?? 8000)
  const info = (message: string, duration?: number) => addToast('info', message, duration)
  const warning = (message: string, duration?: number) => addToast('warning', message, duration)

  return {
    toasts,
    success,
    error,
    info,
    warning,
    removeToast,
  }
}
