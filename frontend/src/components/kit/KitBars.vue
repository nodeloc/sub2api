<template>
  <div style="flex: 1; min-width: 0">
    <div class="kbars">
      <div
        v-for="(d, i) in data"
        :key="i"
        class="kbars__col"
        :style="{ height: (total(d) / max) * 100 + '%' }"
      >
        <div
          v-for="(k, ki) in keys"
          :key="k"
          :title="`${k}: ${d[k]}`"
          :style="{ height: (total(d) ? (d[k] / total(d)) * 100 : 0) + '%', background: colors[ki] }"
        ></div>
      </div>
    </div>
    <div class="kbars__labels">
      <span v-for="(l, i) in labels" :key="i">{{ l }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: Record<string, number>[]
  keys: string[]
  colors: string[]
  max: number
  labels: string[]
}>()

function total(d: Record<string, number>) {
  return props.keys.reduce((s, k) => s + (d[k] || 0), 0)
}
</script>

<style scoped>
.kbars {
  display: flex;
  align-items: flex-end;
  gap: 7px;
  height: 150px;
  border-bottom: 1px solid var(--border-subtle);
}
.kbars__col {
  flex: 1;
  display: flex;
  flex-direction: column-reverse;
  border-radius: 5px 5px 0 0;
  overflow: hidden;
  min-width: 0;
}
.kbars__labels {
  display: flex;
  gap: 7px;
  margin-top: 6px;
}
.kbars__labels span {
  flex: 1;
  text-align: center;
  font: 10px var(--font-mono);
  color: var(--text-faint);
}
</style>
