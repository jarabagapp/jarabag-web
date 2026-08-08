<script setup lang="ts">
interface Props {
  shape?: 'rect' | 'circle' | 'text'
  width?: string
  height?: string
  lines?: number
}

withDefaults(defineProps<Props>(), {
  shape: 'rect',
  width: '100%',
  height: '1rem',
  lines: 3,
})
</script>

<template>
  <div v-if="shape === 'text'" class="skeleton-text" role="status" :aria-label="'Loading'">
    <div
      v-for="i in lines"
      :key="i"
      class="skeleton animate-shimmer"
      :style="{
        height,
        width: i === lines ? '70%' : '100%',
        borderRadius: 'var(--radius-sm)',
      }"
    />
  </div>
  <div
    v-else
    class="skeleton animate-shimmer"
    role="status"
    :aria-label="'Loading'"
    :style="{
      width,
      height,
      borderRadius: shape === 'circle' ? 'var(--radius-full)' : 'var(--radius-md)',
    }"
  />
</template>

<style scoped>
.skeleton {
  background-color: var(--color-neutral-200);
}

.skeleton-text {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']) .skeleton {
    background-color: var(--color-neutral-800);
  }
}

[data-theme='dark'] .skeleton {
  background-color: var(--color-neutral-800);
}
</style>
