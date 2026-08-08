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

const name = ref('')
const email = ref('')
const phone = ref('')
const selectedRole = ref<UserRole>('consumer')
const errors = ref<Record<string, string>>({})

function validate(): boolean {
  errors.value = {}
  if (!name.value.trim()) errors.value.name = 'Name is required'
  if (!email.value.trim()) errors.value.email = 'Email is required'
  if (!phone.value.trim()) errors.value.phone = 'Phone number is required'
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  await auth.requestOtp(phone.value, selectedRole.value, name.value)
  router.push('/auth/verify')
}
</script>

<template>
  <div class="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-[var(--surface-base)]">
    <!-- Brand header -->
    <div class="text-center mb-8">
      <div
        class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-linear-to-br from-primary-500 to-accent-500 mb-5 shadow-lg"
      >
        <span class="text-4xl">🛍️</span>
      </div>
      <h1 class="text-3xl font-extrabold text-[var(--text-primary)] font-[var(--font-display)]">
        Create Account
      </h1>
      <p class="text-sm text-[var(--text-secondary)] mt-1">Join the food rescue movement</p>
    </div>

    <!-- Register form -->
    <div
      class="w-full max-w-sm bg-[var(--surface-raised)] rounded-2xl border border-[var(--border-default)] p-6 shadow-md"
    >
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

      <!-- Vendor extra info -->
      <div
        v-if="selectedRole === 'vendor'"
        class="p-3 rounded-lg bg-[var(--color-info-50)] border border-[var(--color-info-500)]/20 text-xs text-[var(--color-info-700)] mb-4 leading-relaxed"
      >
        🏪 As a vendor, you'll be able to list surplus food bags, manage orders, and track your sales.
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <BaseInput
          v-model="name"
          label="Full Name"
          type="text"
          placeholder="Adeola Johnson"
          autocomplete="name"
          :error="errors.name"
          required
        />

        <BaseInput
          v-model="email"
          :label="t('auth.emailLabel')"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
          inputmode="email"
          :error="errors.email"
          required
        />

        <BaseInput
          v-model="phone"
          :label="t('auth.phoneLabel')"
          type="tel"
          placeholder="+234 801 234 5678"
          inputmode="tel"
          autocomplete="tel"
          :error="errors.phone"
          required
        />

        <BaseButton
          type="submit"
          variant="primary"
          size="lg"
          :loading="auth.isLoading"
          :disabled="!name.trim() || !email.trim() || !phone.trim()"
          class="w-full mt-2"
        >
          {{ t('auth.signup') }}
        </BaseButton>
      </form>

      <!-- Login link -->
      <p class="text-center text-sm text-[var(--text-secondary)] mt-6">
        {{ t('auth.hasAccount') }}
        <router-link
          to="/auth/login"
          class="text-[var(--text-brand)] font-semibold hover:underline"
        >
          {{ t('auth.login') }}
        </router-link>
      </p>
    </div>
  </div>
</template>
