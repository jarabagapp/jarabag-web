import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const isSearchOpen = ref(false)
  const isMobileMenuOpen = ref(false)
  const isNotificationsOpen = ref(false)

  function openSearch() {
    isSearchOpen.value = true
  }

  function closeSearch() {
    isSearchOpen.value = false
  }

  function toggleSearch() {
    isSearchOpen.value = !isSearchOpen.value
    if (isSearchOpen.value) isNotificationsOpen.value = false
  }

  function toggleNotifications() {
    isNotificationsOpen.value = !isNotificationsOpen.value
    if (isNotificationsOpen.value) isSearchOpen.value = false
  }

  return {
    isSearchOpen,
    isMobileMenuOpen,
    isNotificationsOpen,
    openSearch,
    closeSearch,
    toggleSearch,
    toggleNotifications,
  }
})
