<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const iconPaths: Record<string, string> = {
  success: 'M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z',
  error: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01M5.07 19h13.86c1.5 0 2.47-1.6 1.73-2.88L13.73 4.24c-.74-1.28-2.72-1.28-3.46 0L3.34 16.12C2.6 17.4 3.57 19 5.07 19z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}
</script>

<template>
  <div class="toast-container" aria-live="polite" aria-relevant="additions removals">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast--${toast.type}`]"
        :role="toast.type === 'error' ? 'alert' : 'status'"
      >
        <svg class="toast__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path :d="iconPaths[toast.type]" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <p class="toast__message">{{ toast.message }}</p>
        <button
          class="toast__close tap-target"
          aria-label="Dismiss"
          @click="removeToast(toast.id)"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
        <div
          v-if="toast.duration && toast.duration > 0"
          class="toast__progress"
          :style="{ animationDuration: `${toast.duration}ms` }"
        />
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: calc(var(--bottomnav-height) + var(--safe-area-bottom) + 0.75rem);
  left: var(--gutter);
  right: var(--gutter);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

@media (min-width: 640px) {
  .toast-container {
    bottom: 1.5rem;
    left: auto;
    right: 1.5rem;
    width: 380px;
  }
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: var(--radius-lg);
  background-color: var(--surface-raised);
  border: 1px solid var(--border-default);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  position: relative;
  overflow: hidden;
}

.toast--success { border-inline-start: 3px solid var(--color-success-500); }
.toast--error { border-inline-start: 3px solid var(--color-error-500); }
.toast--warning { border-inline-start: 3px solid var(--color-warning-500); }
.toast--info { border-inline-start: 3px solid var(--color-info-500); }

.toast--success .toast__icon { color: var(--color-success-500); }
.toast--error .toast__icon { color: var(--color-error-500); }
.toast--warning .toast__icon { color: var(--color-warning-500); }
.toast--info .toast__icon { color: var(--color-info-500); }

.toast__icon { flex-shrink: 0; margin-top: 0.125rem; }

.toast__message {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--text-primary);
  line-height: 1.5;
}

.toast__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  flex-shrink: 0;
}

.toast__close:hover { color: var(--text-primary); }

.toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-neutral-300);
  transform-origin: left;
  animation: toast-progress linear forwards;
}

/* Transition */
.toast-enter-active { animation: slide-up var(--duration-normal) ease-out; }
.toast-leave-active { animation: fade-out var(--duration-fast) ease-in; }
.toast-move { transition: transform var(--duration-normal) ease-out; }
</style>
