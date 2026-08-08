<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/i18n'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import type { UserRole } from '@/types'

const router = useRouter()
const auth = useAuthStore()
const { t } = useI18n()

const phone = ref('')
const selectedRole = ref<UserRole>('consumer')
const phoneError = ref('')

function validatePhone(value: string): boolean {
  // Nigerian phone format: starts with +234 or 0, followed by 10-11 digits
  const cleaned = value.replace(/[\s\-()]/g, '')
  if (cleaned.length < 10) {
    phoneError.value = 'Phone number is too short'
    return false
  }
  phoneError.value = ''
  return true
}

async function handleSubmit() {
  if (!validatePhone(phone.value)) return

  await auth.requestOtp(phone.value, selectedRole.value)
  router.push('/auth/verify')
}

function quickLogin(role: UserRole) {
  auth.devLogin(role)
  router.push(role === 'vendor' ? '/vendor' : '/')
}
</script>

<template>
  <div class="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-[var(--surface-base)]">
    <!-- Brand header -->
    <div class="text-center mb-10">
      <div
        class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-linear-to-br from-primary-500 to-accent-500 mb-5 shadow-lg"
      >
        <span class="text-4xl">🛍️</span>
      </div>
      <h1 class="text-3xl font-extrabold text-[var(--text-primary)] font-[var(--font-display)]">
        {{ t('common.appName') }}
      </h1>
      <p class="text-sm text-[var(--text-secondary)] mt-1">{{ t('common.tagline') }}</p>
    </div>

    <!-- Login form -->
    <div
      class="w-full max-w-sm bg-[var(--surface-raised)] rounded-2xl border border-[var(--border-default)] p-6 shadow-md"
    >
      <h2 class="text-xl font-bold text-[var(--text-primary)] mb-6">{{ t('auth.login') }}</h2>

      <!-- Role selector -->
      <div class="flex gap-2 mb-6">
        <button
          v-for="role in (['consumer', 'vendor'] as UserRole[])"
          :key="role"
          :class="[
            'flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all border-2',
            selectedRole === role
              ? 'bg-primary-50 border-primary-400 text-primary-700 shadow-sm'
              : 'bg-[var(--surface-sunken)] border-transparent text-[var(--text-secondary)] hover:border-[var(--border-strong)]',
          ]"
          @click="selectedRole = role"
        >
          <span class="text-lg block mb-1">{{ role === 'consumer' ? '🍽️' : '🏪' }}</span>
          {{ role === 'consumer' ? 'I want to eat' : 'I sell food' }}
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <BaseInput
          v-model="phone"
          :label="t('auth.phoneLabel')"
          type="tel"
          placeholder="+234 801 234 5678"
          inputmode="tel"
          autocomplete="tel"
          enterkeyhint="next"
          :error="phoneError"
          required
        />

        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          :loading="auth.isLoading"
          :disabled="!phone.trim()"
          class="w-full"
        >
          Continue with Phone
        </BaseButton>
      </form>

      <!-- Divider -->
      <div class="flex items-center gap-4 my-6">
        <div class="flex-1 h-px bg-[var(--border-default)]"></div>
        <span class="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">or</span>
        <div class="flex-1 h-px bg-[var(--border-default)]"></div>
      </div>

      <!-- Quick login for demo -->
      <div class="flex flex-col gap-2">
        <p class="text-xs text-[var(--text-tertiary)] text-center mb-1">Quick demo login</p>
        <div class="flex gap-2">
          <BaseButton variant="secondary" size="sm" class="flex-1" @click="quickLogin('consumer')">
            🍽️ As Consumer
          </BaseButton>
          <BaseButton variant="secondary" size="sm" class="flex-1" @click="quickLogin('vendor')">
            🏪 As Vendor
          </BaseButton>
        </div>
      </div>

      <!-- Sign up link -->
      <p class="text-center text-sm text-[var(--text-secondary)] mt-6">
        {{ t('auth.noAccount') }}
        <router-link
          to="/auth/register"
          class="text-[var(--text-brand)] font-semibold hover:underline"
        >
          {{ t('auth.signup') }}
        </router-link>
      </p>
    </div>
  </div>
</template>
