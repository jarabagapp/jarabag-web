import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useVendorStore = defineStore('vendor', () => {
  const authStore = useAuthStore()

  // Current vendor ID from the authenticated user profile
  const vendorId = computed(() => authStore.user?.id || 'v1')

  return {
    vendorId,
  }
})
