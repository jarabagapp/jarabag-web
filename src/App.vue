<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
const isDev = import.meta.env.DEV
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>

  <!-- TanStack Query Devtools only in development mode -->
  <VueQueryDevtools v-if="isDev" />
</template>

<style>
/* Page transition */
.page-enter-active {
  animation: fade-in 200ms ease-out;
}

.page-leave-active {
  animation: fade-out 150ms ease-in;
}
</style>
