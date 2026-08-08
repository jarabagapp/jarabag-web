<script setup lang="ts">
import {
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent,
  TooltipArrow,
  TooltipProvider
} from 'reka-ui'

interface Props {
  content?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
}

withDefaults(defineProps<Props>(), {
  side: 'top',
  align: 'center',
  delayDuration: 200,
})
</script>

<template>
  <TooltipProvider>
    <TooltipRoot :delay-duration="delayDuration">
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      
      <TooltipPortal>
        <TooltipContent
          class="rt-tooltip-content"
          :side="side"
          :align="align"
          :side-offset="8"
        >
          <slot name="content">
            {{ content }}
          </slot>
          <TooltipArrow class="rt-tooltip-arrow" :width="12" :height="6" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<style>
.rt-tooltip-content {
  z-index: 100;
  padding: 0.625rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.4;
  color: white;
  background-color: #1a1a1a; /* Solid fallback */
  background-color: oklch(0.2 0.04 30 / 0.9); /* Deep premium glass */
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 
    0 10px 25px -5px rgba(0, 0, 0, 0.3),
    0 8px 10px -6px rgba(0, 0, 0, 0.3);
  user-select: none;
  max-width: 240px;
  
  /* Animations */
  animation-duration: 300ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
}

.rt-tooltip-content[data-state='open'][data-side='top'] { animation-name: slideDownAndFade; }
.rt-tooltip-content[data-state='open'][data-side='right'] { animation-name: slideLeftAndFade; }
.rt-tooltip-content[data-state='open'][data-side='bottom'] { animation-name: slideUpAndFade; }
.rt-tooltip-content[data-state='open'][data-side='left'] { animation-name: slideRightAndFade; }

.rt-tooltip-arrow {
  fill: oklch(0.2 0.04 30 / 0.9);
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 1px;
}

@keyframes slideUpAndFade {
  from { opacity: 0; transform: translateY(8px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes slideRightAndFade {
  from { opacity: 0; transform: translateX(-8px) scale(0.95); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}

@keyframes slideDownAndFade {
  from { opacity: 0; transform: translateY(-8px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes slideLeftAndFade {
  from { opacity: 0; transform: translateX(8px) scale(0.95); }
  to { opacity: 1; transform: translateX(0) scale(1); }
}
</style>
