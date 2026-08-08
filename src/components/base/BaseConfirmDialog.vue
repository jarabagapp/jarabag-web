<script setup lang="ts">
import BaseDialog from './BaseDialog.vue'
import BaseButton from './BaseButton.vue'

interface Props {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'danger',
  loading: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('update:open', false)
  emit('cancel')
}
</script>

<template>
  <BaseDialog
    :open="open"
    :title="title"
    :description="description"
    @update:open="emit('update:open', $event)"
  >
    <div class="flex flex-col items-center text-center py-4">
      <div
        :class="[
          'w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4',
          variant === 'danger' ? 'bg-[var(--color-error-500)]/10 text-[var(--color-error-500)]' : 'bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)]'
        ]"
      >
        {{ variant === 'danger' ? '⚠️' : '❓' }}
      </div>
      <slot />
    </div>

    <template #footer>
      <div class="flex gap-3 w-full">
        <BaseButton
          variant="secondary"
          class="flex-1"
          @click="handleCancel"
          :disabled="loading"
        >
          {{ cancelLabel }}
        </BaseButton>
        <BaseButton
          :variant="variant"
          class="flex-1"
          @click="handleConfirm"
          :loading="loading"
        >
          {{ confirmLabel }}
        </BaseButton>
      </div>
    </template>
  </BaseDialog>
</template>
