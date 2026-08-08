<script setup lang="ts">
import { useI18n } from '@/i18n'

const { t } = useI18n()
</script>

<template>
  <a href="#main-content" class="skip-link">
    {{ t('common.skipToContent') }}
  </a>
</template>

<style scoped>
.skip-link {
  position: absolute;
  inset-inline-start: var(--gutter);
  top: calc(-100% - 1px);
  z-index: var(--z-tooltip);
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--text-on-brand);
  background-color: var(--surface-brand);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: top var(--duration-fast) ease-out;
}

.skip-link:focus {
  top: var(--gutter);
}
</style>
