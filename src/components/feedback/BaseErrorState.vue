<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'

interface Props {
  message?: string
  retryLabel?: string
}

withDefaults(defineProps<Props>(), {
  message: 'Something went wrong. Please try again.',
  retryLabel: 'Try Again',
})

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="error-state" role="alert">
    <div class="error-state__icon" aria-hidden="true">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" stroke="var(--color-error-400)" stroke-width="2" fill="var(--color-error-50)" />
        <path d="M24 16v10M24 30h.02" stroke="var(--color-error-500)" stroke-width="2.5" stroke-linecap="round" />
      </svg>
    </div>
    <p class="error-state__message">{{ message }}</p>
    <BaseButton variant="secondary" size="md" @click="emit('retry')">
      {{ retryLabel }}
    </BaseButton>
  </div>
</template>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1.5rem;
  gap: 1rem;
}

.error-state__message {
  font-size: var(--text-base);
  color: var(--text-secondary);
  max-width: 320px;
  line-height: 1.6;
}
</style>
