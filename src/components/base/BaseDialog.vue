<script setup lang="ts">
import {
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from 'reka-ui'
import { useMediaQuery } from '@vueuse/core'

interface Props {
  open?: boolean
  title: string
  description?: string
}

defineProps<Props>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()
const isMobile = useMediaQuery('(max-width: 639px)')
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogTrigger as-child>
      <slot name="trigger" />
    </DialogTrigger>

    <DialogPortal>
      <DialogOverlay class="dialog-overlay" />

      <DialogContent
        :class="['dialog-content', isMobile ? 'dialog-content--sheet' : 'dialog-content--modal']"
      >
        <!-- Drag handle (mobile) -->
        <div v-if="isMobile" class="dialog-drag-handle" aria-hidden="true">
          <div class="dialog-drag-handle__bar" />
        </div>

        <!-- Header -->
        <div class="dialog-header">
          <div>
            <DialogTitle class="dialog-title">{{ title }}</DialogTitle>
            <DialogDescription v-if="description" class="dialog-description">
              {{ description }}
            </DialogDescription>
          </div>
          <DialogClose class="dialog-close tap-target" :aria-label="'Close'">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </DialogClose>
        </div>

        <!-- Body -->
        <div class="dialog-body">
          <slot />
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="dialog-footer">
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  background-color: oklch(0 0 0 / 0.5);
  animation: fade-in var(--duration-normal) ease-out;
}

.dialog-content {
  position: fixed;
  z-index: var(--z-modal);
  display: flex;
  flex-direction: column;
  background-color: var(--surface-raised);
  box-shadow: var(--shadow-xl);
  outline: none;
  max-height: 85vh;
}

/* ─── Centered Modal (≥640px) ───
   Use inset + margin:auto centering instead of transform:translate(-50%,-50%)
   so the scale-in animation doesn't fight the centering transform. */
.dialog-content--modal {
  inset: 0;
  margin: auto;
  width: 90%;
  max-width: 520px;
  height: fit-content;
  border-radius: var(--radius-xl);
  animation: modal-enter var(--duration-normal) cubic-bezier(0.16, 1, 0.3, 1);
}

/* ─── Bottom Sheet (<640px) ─── */
.dialog-content--sheet {
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  max-height: 90vh;
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  padding-bottom: var(--safe-area-bottom);
  animation: slide-in-bottom var(--duration-normal) cubic-bezier(0.16, 1, 0.3, 1);
}

.dialog-drag-handle {
  display: flex;
  justify-content: center;
  padding: 0.75rem 0 0.25rem;
}

.dialog-drag-handle__bar {
  width: 36px;
  height: 4px;
  border-radius: var(--radius-full);
  background-color: var(--color-neutral-300);
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem 0.75rem;
}

.dialog-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.dialog-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.dialog-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color var(--duration-fast) ease-out;
}

@media (pointer: fine) {
  .dialog-close:hover {
    background-color: var(--surface-sunken);
    color: var(--text-primary);
  }
}

.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 1.5rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem 1.25rem;
  border-top: 1px solid var(--border-default);
}

/* ─── Touch target ─── */
@media (pointer: coarse) {
  .dialog-close { width: 44px; height: 44px; }
}

/* ─── Keyframes ─── */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes slide-in-bottom {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
