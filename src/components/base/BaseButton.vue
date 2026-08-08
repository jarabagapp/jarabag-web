<script setup lang="ts">
import { computed } from 'vue'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  disabledReason?: string
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  fullWidth: false,
})

const emit = defineEmits<{ click: [e: MouseEvent] }>()

const isDisabled = computed(() => props.disabled || props.loading)

const classes = computed(() => [
  'base-btn',
  `base-btn--${props.variant}`,
  `base-btn--${props.size}`,
  {
    'base-btn--full': props.fullWidth,
    'base-btn--loading': props.loading,
  },
])

function handleClick(e: MouseEvent) {
  if (!isDisabled.value) {
    emit('click', e)
  }
}
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :aria-disabled="isDisabled || undefined"
    :aria-busy="loading || undefined"
    :title="disabled && disabledReason ? disabledReason : undefined"
    @click="handleClick"
  >
    <span v-if="loading" class="base-btn__spinner" aria-hidden="true">
      <svg class="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" opacity="0.3" />
        <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </span>
    <span :class="{ 'opacity-0': loading }" class="base-btn__content">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.base-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: var(--font-sans);
  font-weight: 600;
  border: 1.5px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition:
    background-color var(--duration-fast) ease-out,
    border-color var(--duration-fast) ease-out,
    transform var(--duration-fast) ease-out,
    box-shadow var(--duration-fast) ease-out;
}

/* ─── Sizes ─── */
.base-btn--sm {
  min-height: 36px;
  padding: 0.375rem 0.875rem;
  font-size: var(--text-sm);
}

.base-btn--md {
  min-height: 44px;
  padding: 0.625rem 1.25rem;
  font-size: var(--text-base);
}

.base-btn--lg {
  min-height: 52px;
  padding: 0.75rem 1.75rem;
  font-size: var(--text-lg);
}

.base-btn--full { width: 100%; }

/* ─── Variants ─── */
.base-btn--primary {
  background-color: var(--color-primary-500);
  color: white;
}

.base-btn--secondary {
  background-color: var(--surface-raised);
  color: var(--text-primary);
  border-color: var(--border-default);
}

.base-btn--ghost {
  background-color: transparent;
  color: var(--text-brand);
}

.base-btn--danger {
  background-color: var(--color-error-600);
  color: white;
}

/* ─── Hover (pointer-fine only) ─── */
@media (pointer: fine) {
  .base-btn--primary:not([aria-disabled='true']):hover {
    background-color: var(--color-primary-600);
    box-shadow: var(--shadow-md);
  }

  .base-btn--secondary:not([aria-disabled='true']):hover {
    background-color: var(--surface-sunken);
    border-color: var(--border-strong);
  }

  .base-btn--ghost:not([aria-disabled='true']):hover {
    background-color: var(--color-primary-50);
  }

  .base-btn--danger:not([aria-disabled='true']):hover {
    background-color: var(--color-error-700);
    box-shadow: var(--shadow-md);
  }
}

/* ─── Active ─── */
.base-btn:not([aria-disabled='true']):active {
  transform: scale(0.97);
}

/* ─── Focus ─── */
.base-btn:focus-visible {
  outline: var(--ring-width) solid var(--ring-color);
  outline-offset: var(--ring-offset);
}

/* ─── Disabled ─── */
.base-btn[aria-disabled='true'] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* ─── Loading ─── */
.base-btn--loading {
  pointer-events: none;
}

.base-btn__spinner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.base-btn__content {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity var(--duration-fast) ease-out;
}

/* ─── Touch targets ─── */
@media (pointer: coarse) {
  .base-btn--sm { min-height: 44px; }
}
</style>
