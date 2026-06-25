<template>
  <svg :width="w" :height="h" :viewBox="`0 0 ${w} ${h}`" preserveAspectRatio="none" style="flex: none">
    <path :d="d" fill="none" :stroke="color" :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{ pts: number[]; color: string; w?: number; h?: number; strokeWidth?: number }>(),
  { w: 116, h: 36, strokeWidth: 2 }
)

const d = computed(() => {
  const { pts, w, h } = props
  const mx = Math.max(...pts)
  const mn = Math.min(...pts)
  const rng = mx - mn || 1
  return 'M' + pts.map((p, i) => `${(i / (pts.length - 1)) * w},${h - ((p - mn) / rng) * (h - 4) - 2}`).join(' L')
})
</script>
