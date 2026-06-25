<template>
  <div class="kit-catalog">
    <div class="kit-catalog__head">
      <div>
        <h1 class="kit-h1">Models</h1>
        <p class="kit-lead">One API key, every model. Prices update live from each provider.</p>
      </div>
      <span class="ko-badge ko-badge--mono">240 available</span>
    </div>

    <div class="kit-catalog__tabs">
      <KitTabs v-model="filter" :items="tabs" />
    </div>

    <div class="kit-catalog__grid">
      <div
        v-for="m in list"
        :key="m.provider"
        class="ko-card ko-card--hover kit-mcard"
        @click="$emit('open', m)"
      >
        <div class="kit-mcard__top">
          <KitModelAvatar :model="m.name" :size="38" />
          <div class="kit-mcard__id">
            <div class="kit-mcard__name">{{ m.name }}</div>
            <div class="kit-mcard__provider">{{ m.provider }}</div>
          </div>
          <span class="ko-badge" :class="statusClass(m.status)"><span class="ko-badge__dot"></span>{{ statusLabel(m.status) }}</span>
        </div>
        <p class="kit-mcard__desc">{{ m.description }}</p>
        <div class="kit-mcard__tags">
          <span class="ko-badge ko-badge--mono">{{ m.context }} ctx</span>
          <span v-for="tag in m.tags" :key="tag" class="ko-badge ko-badge--pink">{{ tag }}</span>
        </div>
        <div class="kit-mcard__prices">
          <div>
            <div class="kit-price__label">Input</div>
            <div class="kit-price__val">{{ m.priceIn }} / M</div>
          </div>
          <div>
            <div class="kit-price__label">Output</div>
            <div class="kit-price__val">{{ m.priceOut }} / M</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import KitTabs from './KitTabs.vue'
import KitModelAvatar from './KitModelAvatar.vue'
import { KIT_MODELS, type KitModel } from './models'

defineEmits<{ (e: 'open', model: KitModel): void }>()

const filter = ref('all')
const tabs = [
  { value: 'all', label: 'All' },
  { value: 'frontier', label: 'Frontier' },
  { value: 'reasoning', label: 'Reasoning' },
  { value: 'open', label: 'Open weight' },
]
const list = computed(() =>
  filter.value === 'all' ? KIT_MODELS : KIT_MODELS.filter((m) => m.cat === filter.value)
)

function statusLabel(s: string) {
  if (s === 'new') return 'New'
  if (s === 'degraded') return 'Degraded'
  return 'Operational'
}
function statusClass(s: string) {
  if (s === 'new') return 'ko-badge--brand'
  if (s === 'degraded') return 'ko-badge--warning'
  return 'ko-badge--success'
}
</script>

<style scoped>
.kit-catalog {
  max-width: 1080px;
  margin: 0 auto;
}
.kit-catalog__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 6px;
}
.kit-h1 {
  font: var(--weight-bold) var(--text-3xl) var(--font-sans);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.kit-lead {
  font: var(--type-body);
  color: var(--text-muted);
  margin-top: 4px;
}
.kit-catalog__tabs {
  margin: 18px 0 20px;
}
.kit-catalog__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}
.kit-mcard {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.kit-mcard__top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.kit-mcard__id {
  flex: 1;
  min-width: 0;
}
.kit-mcard__name {
  font: var(--weight-bold) var(--text-md) var(--font-sans);
  letter-spacing: -0.01em;
  color: var(--text-strong);
}
.kit-mcard__provider {
  font: var(--text-xs) var(--font-mono);
  color: var(--text-faint);
}
.kit-mcard__desc {
  font: var(--text-sm)/1.5 var(--font-sans);
  color: var(--text-muted);
  margin: 0;
}
.kit-mcard__tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.kit-mcard__prices {
  display: flex;
  gap: 18px;
  padding-top: 10px;
  border-top: 1px solid var(--border-subtle);
}
.kit-price__label {
  font: var(--weight-semibold) var(--text-2xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-faint);
}
.kit-price__val {
  font: var(--weight-semibold) var(--text-sm) var(--font-mono);
  color: var(--text-strong);
}
</style>
