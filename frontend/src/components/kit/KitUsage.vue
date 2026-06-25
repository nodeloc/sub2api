<template>
  <div class="ku">
    <div class="ku-head">
      <div>
        <h1 class="ku-h1">Activity</h1>
        <p class="ku-lead">Your usage across models.</p>
      </div>
      <div class="ku-head__actions">
        <button class="ko-iconbtn ko-iconbtn--outline" aria-label="Filter"><component :is="icons.Filter" :size="16" /></button>
        <div class="ku-range">
          <div class="ko-select-wrap">
            <select v-model="range" class="ko-input ko-select">
              <option value="7">Past 1 week</option>
              <option value="30">Past 30 days</option>
              <option value="90">Past 90 days</option>
            </select>
            <span class="ko-select-wrap__chev"><component :is="chev" /></span>
          </div>
        </div>
      </div>
    </div>

    <div class="ku-tabs">
      <KitTabs v-model="view" :items="tabs" />
    </div>

    <KitActivityOverview v-if="view === 'overview'" @explore="view = 'explore'" />
    <KitActivityTrends v-else-if="view === 'trends'" />
    <KitActivityExplore v-else-if="view === 'explore'" :range="range" />
    <KitActivityGuardrails v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import KitTabs from './KitTabs.vue'
import KitActivityOverview from './KitActivityOverview.vue'
import KitActivityTrends from './KitActivityTrends.vue'
import KitActivityExplore from './KitActivityExplore.vue'
import KitActivityGuardrails from './KitActivityGuardrails.vue'
import { kitIcons as icons } from './icons'

const view = ref('overview')
const range = ref('7')
const tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'trends', label: 'Trends' },
  { value: 'explore', label: 'Explore' },
  { value: 'guardrails', label: 'Guardrails' },
]

const chev = () =>
  h('svg', { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M6 9l6 6 6-6' })])
</script>

<style scoped>
.ku {
  max-width: 1120px;
  margin: 0 auto;
}
.ku-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}
.ku-h1 {
  font: var(--weight-bold) var(--text-3xl) var(--font-sans);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.ku-lead {
  font: var(--type-body);
  color: var(--text-muted);
  margin-top: 4px;
}
.ku-head__actions {
  display: flex;
  gap: 10px;
  flex: none;
}
.ku-range {
  width: 160px;
}
.ku-tabs {
  margin-bottom: 22px;
  overflow-x: auto;
}
</style>
