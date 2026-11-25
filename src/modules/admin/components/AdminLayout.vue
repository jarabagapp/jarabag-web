<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const currentTheme = ref('dark')
const mobileMenuOpen = ref(false)
let idleTimeout: ReturnType<typeof setTimeout> | null = null

const isSuperAdmin = computed(() => authStore.user?.role === 'superadmin')
const userPermissions = computed<string[]>(() => {
  if (isSuperAdmin.value) return ['all']
  const u: any = authStore.user
  if (u?.customRole?.permissions?.length) return u.customRole.permissions
  return u?.permissions || []
})

const hasPerm = (perm: string) => isSuperAdmin.value || userPermissions.value.includes(perm)

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
  },
)

const handleLogout = () => {
  if (idleTimeout) clearTimeout(idleTimeout)
  authStore.logout()
  router.push('/admin/login')
}

const resetIdleTimer = () => {
  if (idleTimeout) clearTimeout(idleTimeout)
  idleTimeout = setTimeout(() => {
    handleLogout()
  }, 20 * 60 * 1000) // 20 minutes idle session timeout
}

const toggleTheme = () => {
  const current = document.documentElement.getAttribute('data-theme')
  const systemPrefersDark =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  const effectiveTheme = current ?? (systemPrefersDark ? 'dark' : 'light')

  const nextTheme = effectiveTheme === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', nextTheme)
  localStorage.setItem('jarabag_theme', nextTheme)
  currentTheme.value = nextTheme
}

onMounted(() => {
  const savedTheme = localStorage.getItem('jarabag_theme')
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme)
    currentTheme.value = savedTheme
  } else {
    const systemPrefersDark =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false
    currentTheme.value = systemPrefersDark ? 'dark' : 'light'
  }

  const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
  events.forEach((event) => {
    window.addEventListener(event, resetIdleTimer)
  })
  resetIdleTimer()
})

onUnmounted(() => {
  const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
  events.forEach((event) => {
    window.removeEventListener(event, resetIdleTimer)
  })
  if (idleTimeout) clearTimeout(idleTimeout)
})
</script>

<template>
  <div class="h-screen overflow-hidden bg-surface-base text-text-main flex font-sans transition-colors duration-normal selection:bg-orange-500 selection:text-white">
    <!-- Mobile Drawer Backdrop -->
    <div
      v-if="mobileMenuOpen"
      @click="mobileMenuOpen = false"
      class="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
      class="fixed lg:static inset-y-0 left-0 w-64 border-r border-border-subtle bg-surface-base flex flex-col z-40 transition-transform duration-200 ease-out"
    >
      <!-- Brand Logo -->
      <div class="h-20 border-b border-border-subtle flex items-center justify-between px-6">
        <div class="flex items-center gap-3">
          <img src="/jarabag-icon.svg" alt="Jarabag Logo" class="w-8 h-8 object-contain drop-shadow-sm" />
          <span class="font-bold text-lg tracking-tight bg-gradient-to-r from-text-main to-text-sub bg-clip-text text-transparent">
            Jarabag Admin
          </span>
        </div>
        <button
          @click="mobileMenuOpen = false"
          class="lg:hidden p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-raised cursor-pointer"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <router-link
          to="/admin"
          exact-active-class="bg-orange-600/10 text-orange-500 border border-orange-500/20"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-sub hover:text-text-main hover:bg-surface-raised border border-transparent transition-all"
        >
          <span class="text-lg">📊</span> Overview
        </router-link>

        <router-link
          v-if="hasPerm('manage_customers')"
          to="/admin/users"
          active-class="bg-orange-600/10 text-orange-500 border border-orange-500/20"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-sub hover:text-text-main hover:bg-surface-raised border border-transparent transition-all"
        >
          <span class="text-lg">👤</span> User Control
        </router-link>

        <router-link
          v-if="isSuperAdmin"
          to="/admin/roles"
          active-class="bg-orange-600/10 text-orange-500 border border-orange-500/20"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-sub hover:text-text-main hover:bg-surface-raised border border-transparent transition-all"
        >
          <span class="text-lg">🛡️</span> Roles & Perms
        </router-link>

        <router-link
          v-if="hasPerm('manage_vendors')"
          to="/admin/vendors"
          active-class="bg-orange-600/10 text-orange-500 border border-orange-500/20"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-sub hover:text-text-main hover:bg-surface-raised border border-transparent transition-all"
        >
          <span class="text-lg">🏪</span> Vendor Profiles
        </router-link>

        <router-link
          v-if="hasPerm('manage_vendors')"
          to="/admin/bags"
          active-class="bg-orange-600/10 text-orange-500 border border-orange-500/20"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-sub hover:text-text-main hover:bg-surface-raised border border-transparent transition-all"
        >
          <span class="text-lg">🍲</span> Deal Listings
        </router-link>

        <router-link
          v-if="hasPerm('manage_payments')"
          to="/admin/wallets"
          active-class="bg-orange-600/10 text-orange-500 border border-orange-500/20"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-sub hover:text-text-main hover:bg-surface-raised border border-transparent transition-all"
        >
          <span class="text-lg">💳</span> Wallets & Ledger
        </router-link>

        <router-link
          v-if="hasPerm('manage_vendors') && hasPerm('manage_customers')"
          to="/admin/orders"
          active-class="bg-orange-600/10 text-orange-500 border border-orange-500/20"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-sub hover:text-text-main hover:bg-surface-raised border border-transparent transition-all"
        >
          <span class="text-lg">🛍️</span> Order Overrides
        </router-link>

        <router-link
          v-if="hasPerm('manage_vendors') && hasPerm('manage_customers')"
          to="/admin/disputes"
          active-class="bg-orange-600/10 text-orange-500 border border-orange-500/20"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-sub hover:text-text-main hover:bg-surface-raised border border-transparent transition-all"
        >
          <span class="text-lg">⚖️</span> Disputes Hub
        </router-link>

        <router-link
          v-if="hasPerm('schedule_emails')"
          to="/admin/emails"
          active-class="bg-orange-600/10 text-orange-500 border border-orange-500/20"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-sub hover:text-text-main hover:bg-surface-raised border border-transparent transition-all"
        >
          <span class="text-lg">📣</span> Campaigns & Push
        </router-link>

        <router-link
          v-if="isSuperAdmin"
          to="/admin/settings"
          active-class="bg-orange-600/10 text-orange-500 border border-orange-500/20"
          class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-sub hover:text-text-main hover:bg-surface-raised border border-transparent transition-all"
        >
          <span class="text-lg">⚙️</span> Platform Settings
        </router-link>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-4 border-t border-border-subtle flex items-center justify-between">
        <div>
          <p class="text-xs text-text-muted">Log Out</p>
          <p class="text-sm font-bold text-text-sub line-clamp-1 hover:text-text-main transition-colors cursor-pointer" @click="handleLogout">
            Exit Panel →
          </p>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Bar -->
      <header class="h-20 border-b border-border-subtle flex items-center justify-between px-4 sm:px-8 bg-surface-base/50 backdrop-blur-md sticky top-0 z-10 transition-colors duration-normal">
        <div class="flex items-center gap-3">
          <button
            @click="mobileMenuOpen = true"
            class="lg:hidden p-2 border border-border-strong bg-surface-base hover:bg-surface-raised rounded-lg text-text-main cursor-pointer"
            aria-label="Open navigation menu"
          >
            ☰
          </button>
          <h1 class="text-base sm:text-lg font-bold text-text-main font-display">System Operations</h1>
        </div>

        <div class="flex items-center gap-2.5 sm:gap-4">
          <div class="hidden sm:flex flex-col items-end">
            <span class="text-sm font-semibold text-text-main">{{ authStore.user?.name ?? 'Admin User' }}</span>
            <span
              :class="authStore.user?.role === 'superadmin' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-surface-raised text-text-sub border border-border-strong'"
              class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-0.5"
            >
              {{ authStore.user?.role }}
            </span>
          </div>

          <button
            @click="toggleTheme"
            class="p-2 border border-border-strong hover:bg-surface-raised bg-surface-base rounded-lg text-xs text-text-sub hover:text-text-main transition-all flex items-center gap-1.5 cursor-pointer font-semibold shadow-sm"
            title="Toggle theme"
          >
            <span v-if="currentTheme === 'dark'">☀️ Light</span>
            <span v-else>🌙 Dark</span>
          </button>

          <button
            @click="handleLogout"
            class="p-2 border border-border-strong hover:bg-surface-raised bg-surface-base rounded-lg text-xs text-text-sub hover:text-text-main transition-all cursor-pointer font-semibold shadow-sm"
          >
            Logout
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-4 sm:p-8 overflow-y-auto bg-surface-base transition-colors duration-normal">
        <slot></slot>
      </main>
    </div>
  </div>
</template>
