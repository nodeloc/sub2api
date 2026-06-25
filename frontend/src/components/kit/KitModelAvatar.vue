<template>
  <span class="kit-avatar" :style="{ width: box, height: box, borderRadius: radius }">
    <ModelIcon :model="model" :size="iconSize" />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ModelIcon from '@/components/common/ModelIcon.vue'

const props = withDefaults(
  defineProps<{
    model: string
    size?: number
    radius?: string
  }>(),
  { size: 38, radius: 'var(--radius-md)' }
)

const box = computed(() => `${props.size}px`)
const iconSize = computed(() => `${Math.round(props.size * 0.58)}px`)
</script>

<style scoped>
.kit-avatar {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--warm-100);
  color: var(--text-strong);
}
</style>
