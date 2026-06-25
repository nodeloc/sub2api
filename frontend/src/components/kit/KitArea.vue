<template>
  <div style="flex: 1; min-width: 0">
    <svg width="100%" :height="h" :viewBox="`0 0 ${w} ${h}`" preserveAspectRatio="none" class="karea__svg">
      <defs>
        <linearGradient :id="gid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.45" />
          <stop offset="100%" :stop-color="color" stop-opacity="0.04" />
        </linearGradient>
      </defs>
      <path :d="`M0,${h} L${line} L${w},${h} Z`" :fill="`url(#${gid})`" />
      <path :d="`M${line}`" fill="none" :stroke="color" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round" />
    </svg>
    <div class="karea__labels">
      <span v-for="(l, i) in labels" :key="i">{{ l }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ pts: number[]; max: number; color: string; labels: string[] }>()
const w = 100
const h = 150

const line = computed(() =>
  props.pts.map((p, i) => `${(i / (props.pts.length - 1)) * w},${h - (p / props.max) * h}`).join(' L')
)
const gid = computed(() => 'ag' + props.color.replace(/[^a-z0-9]/gi, ''))
</script>

<style scoped>
.karea__svg {
  display: block;
  border-bottom: 1px solid var(--border-subtle);
}
.karea__labels {
  display: flex;
  gap: 7px;
  margin-top: 6px;
}
.karea__labels span {
  flex: 1;
  text-align: center;
  font: 10px var(--font-mono);
  color: var(--text-faint);
}
</style>
