<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'

interface Props {
  title: string
  description?: string
  actionLabel?: string
}

defineProps<Props>()
const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <div class="empty-state" role="status">
    <div class="empty-state__illustration">
      <slot name="illustration">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
          <circle cx="60" cy="60" r="50" fill="var(--color-primary-100)" />
          <path d="M40 55c0-11.046 8.954-20 20-20s20 8.954 20 20v5H40v-5z" fill="var(--color-primary-300)" />
          <rect x="35" y="58" width="50" height="25" rx="4" fill="var(--color-primary-400)" />
          <path d="M45 68h30M45 74h20" stroke="white" stroke-width="2" stroke-linecap="round" />
          <circle cx="60" cy="45" r="4" fill="var(--color-accent-400)" />
        </svg>
      </slot>
    </div>
    <h3 class="empty-state__title">{{ title }}</h3>
    <p v-if="description" class="empty-state__description">{{ description }}</p>
    <BaseButton v-if="actionLabel" variant="primary" size="md" @click="emit('action')">
      {{ actionLabel }}
    </BaseButton>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 1.5rem;
  gap: 1rem;
}

.empty-state__illustration {
  margin-bottom: 0.5rem;
}

.empty-state__title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.empty-state__description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  max-width: 320px;
  line-height: 1.6;
}
</style>
