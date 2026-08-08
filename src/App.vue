<script setup lang="ts">
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
</script>

<template>
  <RouterView v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>

  <!-- TanStack Query Devtools -->
  <VueQueryDevtools />
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
