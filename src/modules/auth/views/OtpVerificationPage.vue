<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useI18n } from '@/i18n'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const { t } = useI18n()

const digits = ref(['', '', '', ''])
const inputRefs = ref<HTMLInputElement[]>([])
const error = ref('')
const isResending = ref(false)

onMounted(() => {
  // Redirect if no pending OTP
  if (auth.authStep !== 'verifying-otp') {
    router.replace('/auth/login')
    return
  }
  // Auto-focus first input
  nextTick(() => inputRefs.value[0]?.focus())
})

function setInputRef(el: unknown, index: number) {
  if (el instanceof HTMLInputElement) {
    inputRefs.value[index] = el
  }
}

function handleInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '')

  digits.value[index] = value.slice(-1)

  if (value && index < 3) {
    nextTick(() => inputRefs.value[index + 1]?.focus())
  }

  // Auto-submit when all 4 digits filled
  if (digits.value.every((d) => d !== '')) {
    submitOtp()
  }
}

function handleKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    nextTick(() => inputRefs.value[index - 1]?.focus())
  }
}

function handlePaste(event: ClipboardEvent) {
  const pasted = event.clipboardData?.getData('text')?.replace(/\D/g, '') ?? ''
  if (pasted.length >= 4) {
    event.preventDefault()
    for (let i = 0; i < 4; i++) {
      digits.value[i] = pasted[i] || ''
    }
    nextTick(() => {
      inputRefs.value[3]?.focus()
      submitOtp()
    })
  }
}

async function submitOtp() {
  const code = digits.value.join('')
  if (code.length < 4) return

  error.value = ''
  const success = await auth.verifyOtp(code)

  if (success) {
    toast.success('Welcome to JaraBag! 🎉')
    router.push(auth.isVendor ? '/vendor' : '/')
  } else {
    error.value = 'Invalid code. Please try again.'
    digits.value = ['', '', '', '']
    nextTick(() => inputRefs.value[0]?.focus())
  }
}

async function resendCode() {
  isResending.value = true
  await auth.requestOtp(auth.pendingPhone, auth.pendingRole)
  isResending.value = false
  toast.info('New code sent to ' + auth.pendingPhone)
}

function maskPhone(phone: string): string {
  if (phone.length < 6) return phone
  return phone.slice(0, 4) + '••••' + phone.slice(-4)
}
</script>

<template>
  <div class="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-[var(--surface-base)]">
    <!-- Brand header -->
    <div class="text-center mb-8">
      <div
        class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-primary-500 to-accent-500 mb-4 shadow-lg"
      >
        <span class="text-3xl">🔐</span>
      </div>
      <h1 class="text-2xl font-extrabold text-[var(--text-primary)] font-[var(--font-display)]">
        {{ t('auth.otpLabel') }}
      </h1>
      <p class="text-sm text-[var(--text-secondary)] mt-2 max-w-xs mx-auto">
        {{ t('auth.otpHint', { destination: maskPhone(auth.pendingPhone) }) }}
      </p>
    </div>

    <!-- OTP Card -->
    <div
      class="w-full max-w-sm bg-[var(--surface-raised)] rounded-2xl border border-[var(--border-default)] p-6 shadow-md"
    >
      <!-- OTP Inputs -->
      <div class="flex justify-center gap-3 mb-6" @paste="handlePaste">
        <input
          v-for="(_, index) in 4"
          :key="index"
          :ref="(el) => setInputRef(el, index)"
          :value="digits[index]"
          type="text"
          inputmode="numeric"
          maxlength="1"
          autocomplete="one-time-code"
          :aria-label="`Digit ${index + 1}`"
          :class="[
            'w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 transition-all outline-none',
            error
              ? 'border-[var(--color-error-500)] bg-[var(--color-error-50)]'
              : digits[index]
                ? 'border-primary-400 bg-primary-50 text-primary-700'
                : 'border-[var(--border-default)] bg-[var(--surface-sunken)] text-[var(--text-primary)]',
            'focus:border-primary-500 focus:ring-2 focus:ring-primary-200',
          ]"
          @input="handleInput(index, $event)"
          @keydown="handleKeydown(index, $event)"
        />
      </div>

      <!-- Error message -->
      <p v-if="error" class="text-center text-sm text-[var(--color-error-600)] font-medium mb-4" role="alert">
        {{ error }}
      </p>

      <!-- Verify button -->
      <BaseButton
        variant="primary"
        size="lg"
        :loading="auth.isLoading"
        :disabled="digits.some((d) => !d)"
        class="w-full mb-4"
        @click="submitOtp"
      >
        Verify Code
      </BaseButton>

      <!-- Resend -->
      <div class="text-center">
        <button
          :disabled="isResending"
          class="text-sm text-[var(--text-brand)] font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          @click="resendCode"
        >
          {{ isResending ? 'Sending…' : 'Resend Code' }}
        </button>
      </div>

      <!-- Demo hint -->
      <p class="text-center text-xs text-[var(--text-tertiary)] mt-4 p-3 bg-[var(--surface-sunken)] rounded-lg">
        💡 Demo: Enter any 4 digits to verify
      </p>
    </div>

    <!-- Back to login -->
    <button
      class="mt-6 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 min-h-[44px]"
      @click="router.push('/auth/login')"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M10 4L6 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      {{ t('common.back') }}
    </button>
  </div>
</template>
