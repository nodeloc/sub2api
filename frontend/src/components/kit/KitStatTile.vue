<template>
  <div class="kit-stat">
    <div class="kit-stat__label">{{ label }}</div>
    <div class="kit-stat__row">
      <div class="kit-stat__value" :class="{ 'kit-stat__value--accent': accent }">{{ value }}</div>
      <span v-if="trend" class="kit-stat__trend" :class="`kit-stat__trend--${trend.dir}`">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor"
          stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path v-if="trend.dir === 'up'" d="M6 15l6-6 6 6" />
          <path v-else d="M6 9l6 6 6-6" />
        </svg>
        {{ trend.value }}
      </span>
    </div>
    <div v-if="sub" class="kit-stat__sub">{{ sub }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string
  trend?: { dir: 'up' | 'down'; value: string }
  sub?: string
  accent?: boolean
}>()
</script>

<style scoped>
.kit-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  /* Self-contained card chrome (was relying on the demo-only .ko-card). */
  padding: var(--space-5);
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}
.kit-stat__label {
  font: var(--weight-semibold) var(--text-2xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-faint);
}
.kit-stat__row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.kit-stat__value {
  font: var(--weight-extra) var(--text-2xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.kit-stat__value--accent {
  color: var(--brand);
}
.kit-stat__trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font: var(--weight-semibold) var(--text-xs) var(--font-sans);
}
.kit-stat__trend--up {
  color: var(--success);
}
.kit-stat__trend--down {
  color: var(--danger);
}
.kit-stat__sub {
  font: var(--text-xs) var(--font-sans);
  color: var(--text-faint);
}
</style>
