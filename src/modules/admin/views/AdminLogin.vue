<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiClient } from '@/services/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const getTargetRoute = () => {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/admin') && redirect !== '/admin/login') {
    return redirect
  }
  return '/admin'
}

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Please enter both email and password'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const { data: responseBody } = await apiClient.post('/auth/login', {
      email: email.value,
      password: password.value,
    })

    const payload = responseBody?.data

    if (payload && payload.accessToken) {
      localStorage.setItem('jarabag_access_token', payload.accessToken)
      authStore.user = payload.user
      authStore.authStep = 'authenticated'
      authStore.persist()

      if (payload.user.role === 'admin' || payload.user.role === 'superadmin') {
        router.push(getTargetRoute())
      } else {
        error.value = 'Access denied. You must be an administrator to log in here.'
        authStore.logout()
      }
    } else {
      error.value = 'Invalid login response from server'
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Invalid email or password'
  } finally {
    loading.value = false
  }
}

// Dev login helper
const handleDevLogin = async (role: 'admin' | 'superadmin') => {
  loading.value = true
  error.value = ''
  try {
    await authStore.devLogin(role)
    if (authStore.user?.role === 'admin' || authStore.user?.role === 'superadmin') {
      router.push(getTargetRoute())
    } else {
      error.value = 'Bypass role returned is not admin-level.'
      authStore.logout()
    }
  } catch {
    error.value = 'Dev login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-orange-500 selection:text-white">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center mb-6">
        <img src="/jarabag-icon.svg" alt="Jarabag Logo" class="w-14 h-14 object-contain drop-shadow-md" />
      </div>
      <h2 class="text-center text-3xl font-extrabold text-white font-display">
        Admin Portal
      </h2>
      <p class="mt-2 text-center text-sm text-neutral-400">
        Sign in to control Jarabag operations
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-neutral-900 border border-neutral-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div v-if="error" class="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm">
            {{ error }}
          </div>

          <div>
            <label for="email" class="block text-xs font-bold uppercase tracking-wider text-neutral-400">Email Address</label>
            <div class="mt-2">
              <input
                id="email"
                v-model="email"
                name="email"
                type="email"
                required
                autocomplete="email"
                class="w-full bg-neutral-950 border border-neutral-800 focus:border-orange-500 rounded-lg px-4 py-2.5 text-white focus:outline-none transition-colors"
                placeholder="admin@jarabag.com"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-xs font-bold uppercase tracking-wider text-neutral-400">Password</label>
            <div class="mt-2">
              <input
                id="password"
                v-model="password"
                name="password"
                type="password"
                required
                autocomplete="current-password"
                class="w-full bg-neutral-950 border border-neutral-800 focus:border-orange-500 rounded-lg px-4 py-2.5 text-white focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-orange-600/50 text-white font-bold py-2.5 px-4 rounded-lg focus:outline-none shadow-lg shadow-orange-600/20 active:scale-98 transition-all"
            >
              <span v-if="loading">Signing in...</span>
              <span v-else>Sign In</span>
            </button>
          </div>
        </form>

        <!-- Dev Bypass Tool -->
        <div class="mt-8 border-t border-neutral-800 pt-6">
          <p class="text-xs font-bold uppercase tracking-wider text-neutral-400 text-center mb-4">
            🛠️ Developer Quick Bypass
          </p>
          <div class="grid grid-cols-2 gap-4">
            <button
              @click="handleDevLogin('admin')"
              class="px-4 py-2 text-xs font-semibold bg-neutral-950 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 rounded-lg text-neutral-300"
            >
              Mock Standard Admin
            </button>
            <button
              @click="handleDevLogin('superadmin')"
              class="px-4 py-2 text-xs font-semibold bg-neutral-950 border border-neutral-800 hover:border-neutral-700 hover:bg-orange-500/20 rounded-lg text-neutral-300 hover:text-orange-500"
            >
              Mock Super Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
