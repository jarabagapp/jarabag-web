import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User, UserRole } from '@/types'
import {
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useDevLoginMutation,
  useUpdateProfileMutation,
} from '../modules/auth/composables/useAuthQuery'

export type AuthStep = 'idle' | 'verifying-otp' | 'authenticated'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(
    typeof window !== 'undefined' && localStorage.getItem('jarabag_user')
      ? JSON.parse(localStorage.getItem('jarabag_user')!)
      : null
  )
  const authStep = ref<AuthStep>(
    typeof window !== 'undefined' && (localStorage.getItem('jarabag_auth_step') as AuthStep)
      ? (localStorage.getItem('jarabag_auth_step') as AuthStep)
      : 'idle'
  )
  const isLoading = ref(false)
  const pendingPhone = ref('')
  const pendingRole = ref<UserRole>('consumer')

  const isAuthenticated = computed(() => !!user.value)
  const isVendor = computed(() => user.value?.role === 'vendor')
  const isConsumer = computed(() => user.value?.role === 'consumer')
  const displayName = computed(() => user.value?.name ?? 'Guest')
  const initials = computed(() => {
    if (!user.value?.name) return '?'
    return user.value.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  })

  function persist() {
    if (typeof window !== 'undefined') {
      if (user.value) {
        localStorage.setItem('jarabag_user', JSON.stringify(user.value))
        localStorage.setItem('jarabag_auth_step', authStep.value)
      } else {
        localStorage.removeItem('jarabag_user')
        localStorage.removeItem('jarabag_auth_step')
        localStorage.removeItem('jarabag_access_token')
      }
    }
  }

  const requestOtpMutation = useRequestOtpMutation()
  const verifyOtpMutation = useVerifyOtpMutation()
  const devLoginMutation = useDevLoginMutation()
  const updateProfileMutation = useUpdateProfileMutation()

  /**
   * Real login — sends OTP to phone number via backend
   */
  async function requestOtp(phone: string, role: UserRole = 'consumer', name?: string) {
    isLoading.value = true
    pendingPhone.value = phone
    pendingRole.value = role

    try {
      await requestOtpMutation.mutateAsync({ phone, role, name })
      authStep.value = 'verifying-otp'
      persist()
    } catch (err) {
      console.error('Request OTP failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Real OTP verification — validates against NestJS
   */
  async function verifyOtp(code: string) {
    isLoading.value = true
    console.log('[Store Auth] Verifying OTP code:', code, 'for phone:', pendingPhone.value)

    try {
      const data = await verifyOtpMutation.mutateAsync({
        phone: pendingPhone.value,
        code,
      })

      console.log('[Store Auth] OTP validation response data:', data)

      if (data && data.accessToken) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('jarabag_access_token', data.accessToken)
        }
        user.value = data.user
        authStep.value = 'authenticated'
        persist()
        console.log('[Store Auth] Session verified successfully and persisted. User:', user.value)
      } else {
        console.warn('[Store Auth] Response missing accessToken or data wrapper.', data)
      }
    } catch (err) {
      console.error('[Store Auth] Verify OTP failed with error:', err)
    } finally {
      isLoading.value = false
    }

    console.log('[Store Auth] Final auth step status:', authStep.value)
    return authStep.value === 'authenticated'
  }

  /**
   * Quick login for dev/demo via NestJS Dev-Login endpoint
   */
  async function devLogin(role: UserRole = 'consumer') {
    isLoading.value = true
    try {
      const data = await devLoginMutation.mutateAsync(role)
      if (data && data.accessToken) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('jarabag_access_token', data.accessToken)
        }
        user.value = data.user
        authStep.value = 'authenticated'
        persist()
      }
    } catch (err) {
      console.error('Dev login failed:', err)
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value = null
    authStep.value = 'idle'
    pendingPhone.value = ''
    persist()
  }

  async function updateProfile(updates: Partial<Pick<User, 'name' | 'email' | 'phone'>>) {
    if (!user.value) return
    isLoading.value = true
    try {
      const updatedUser = await updateProfileMutation.mutateAsync(updates)
      user.value = updatedUser
      persist()
    } catch (err) {
      console.error('Update profile failed:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    authStep,
    isLoading,
    pendingPhone,
    pendingRole,
    isAuthenticated,
    isVendor,
    isConsumer,
    displayName,
    initials,
    persist,
    requestOtp,
    verifyOtp,
    devLogin,
    logout,
    updateProfile,
  }
})
