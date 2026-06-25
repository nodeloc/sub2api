<template>
  <div class="ue">
    <!-- Query builder toolbar -->
    <div class="ue-toolbar">
      <span class="ue-ctrl">
        <select v-model="metric" class="ko-input ko-select ue-select">
          <option value="spend">{{ t('usage.totalCost') }}</option>
          <option value="tokens">{{ t('usage.totalTokens') }}</option>
          <option value="requests">{{ t('usage.totalRequests') }}</option>
        </select>
        <span class="ue-chev"><component :is="chev" /></span>
      </span>
      <span class="ue-chip">{{ t('usage.by') }}</span>
      <span class="ue-ctrl">
        <select v-model="dimension" class="ko-input ko-select ue-select">
          <option value="model">{{ t('usage.model') }}</option>
          <option value="provider">{{ t('usage.provider') }}</option>
          <option value="api_key">{{ t('usage.apiKey') }}</option>
        </select>
        <span class="ue-chev"><component :is="chev" /></span>
      </span>
      <div class="ue-divider"></div>
      <span class="ue-chip">{{ t('usage.top') }}</span>
      <span class="ue-ctrl">
        <select v-model.number="topN" class="ko-input ko-select ue-select">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
        </select>
        <span class="ue-chev"><component :is="chev" /></span>
      </span>
      <div class="ue-spacer"></div>
      <span v-if="loading" class="ko-spinner"></span>
    </div>

    <!-- Proportion bar -->
    <div v-if="rows.length" class="ue-prop">
      <div v-for="(r, i) in rows" :key="r.key" :title="`${r.label}: ${fmt(r.v)}`" :style="{ flexGrow: Math.max(r.v, 0.0001), flexBasis: 0, minWidth: '2px', background: palette[i % palette.length] }"></div>
    </div>
    <div v-if="rows.length" class="ue-legend">
      <span v-for="(r, i) in rows.slice(0, 6)" :key="r.key" class="ue-legend__item">
        <i :style="{ background: palette[i % palette.length] }"></i>{{ r.label }}
      </span>
    </div>

    <!-- Table -->
    <div class="card ue-table">
      <div class="ue-table__head">
        <span>{{ dimLabel }}</span>
        <button class="ue-sort" @click="sortDesc = !sortDesc">{{ t('usage.value') }} {{ sortDesc ? '↓' : '↑' }}</button>
        <span class="ue-pct-head">% {{ t('usage.ofTotal') }}</span>
      </div>
      <div v-if="!rows.length && !loading" class="ue-empty">—</div>
      <div v-for="(r, i) in rows" :key="r.key" class="ue-row">
        <span class="ue-row__name">
          <span class="ue-row__avatar">{{ (r.label || '?').charAt(0).toUpperCase() }}</span>
          <span class="ue-row__label">{{ r.label }}</span>
        </span>
        <span class="ue-row__val">{{ fmt(r.v) }}</span>
        <span class="ue-row__pct">
          <span class="ue-row__bar"><span :style="{ width: pct(r) + '%', background: palette[i % palette.length] }"></span></span>
          <span class="ue-row__pctnum">{{ pct(r).toFixed(1) }}%</span>
        </span>
      </div>
    </div>
    <p class="ue-footnote">{{ rows.length }} {{ t('usage.rows') }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usageAPI } from '@/api'
import type { UsageAggregateRow } from '@/api/usage'

const props = defineProps<{ startDate?: string; endDate?: string }>()
const { t } = useI18n()

const chev = () =>
  h('svg', { viewBox: '0 0 24 24', width: 13, height: 13, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, [h('path', { d: 'M6 9l6 6 6-6' })])

const metric = ref<'spend' | 'tokens' | 'requests'>('spend')
const dimension = ref<'model' | 'provider' | 'api_key'>('model')
const topN = ref(10)
const sortDesc = ref(true)
const loading = ref(false)
const raw = ref<UsageAggregateRow[]>([])

const palette = ['var(--coral-400)', 'var(--pink-400)', 'var(--lens-solid)', 'var(--coral-600)', 'var(--pink-600)', 'var(--amber-500)', 'var(--blue-500)', 'var(--green-500)', 'var(--coral-300)', 'var(--pink-300)']
const dimLabel = computed(() => ({ model: t('usage.model'), provider: t('usage.provider'), api_key: t('usage.apiKey') }[dimension.value]))

async function load() {
  loading.value = true
  try {
    const resp = await usageAPI.getUsageAggregate({
      dimension: dimension.value,
      start_date: props.startDate,
      end_date: props.endDate,
    })
    raw.value = resp.rows || []
  } catch (e) {
    console.error('Failed to load aggregate:', e)
    raw.value = []
  } finally {
    loading.value = false
  }
}

const rows = computed(() => {
  const M = metric.value
  const list = raw.value.map((r) => ({
    key: r.key,
    label: r.label,
    v: M === 'spend' ? r.actual_cost : M === 'tokens' ? r.total_tokens : r.requests,
  }))
  list.sort((a, b) => (sortDesc.value ? b.v - a.v : a.v - b.v))
  return list.slice(0, topN.value)
})
const total = computed(() => rows.value.reduce((s, r) => s + r.v, 0) || 1)

function fmtTokens(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return `${n}`
}
function fmt(v: number) {
  if (metric.value === 'spend') return '$' + v.toFixed(2)
  if (metric.value === 'tokens') return fmtTokens(v)
  return v.toLocaleString()
}
function pct(r: { v: number }) {
  return (r.v / total.value) * 100
}

watch([dimension, () => props.startDate, () => props.endDate], load)
onMounted(load)
</script>

<style scoped>
.ue-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.ue-ctrl {
  position: relative;
  flex: none;
}
.ue-select {
  height: 32px;
  font-size: var(--text-xs);
  font-weight: 600;
  padding: 0 28px 0 10px;
  width: auto;
}
.ue-chev {
  position: absolute;
  right: 9px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-muted);
  display: inline-flex;
}
.ue-chip {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-default);
  background: var(--surface-sunken);
  font: var(--text-xs) var(--font-sans);
  color: var(--text-muted);
  flex: none;
}
.ue-divider {
  width: 1px;
  height: 18px;
  background: var(--border-default);
  margin: 0 4px;
}
.ue-spacer {
  margin-left: auto;
}
.ue-prop {
  display: flex;
  gap: 2px;
  height: 26px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: 12px;
}
.ue-legend {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.ue-legend__item {
  display: flex;
  align-items: center;
  gap: 6px;
  font: var(--text-xs) var(--font-sans);
  color: var(--text-muted);
}
.ue-legend__item i {
  width: 9px;
  height: 9px;
  border-radius: 3px;
}
.ue-table {
  padding: 0;
  overflow: hidden;
}
.ue-table__head {
  display: grid;
  grid-template-columns: 1.6fr 0.8fr 1.1fr;
  gap: 10px;
  padding: 11px 18px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--surface-sunken);
  font: var(--weight-bold) var(--text-2xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-faint);
}
.ue-sort {
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
  color: inherit;
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}
.ue-pct-head {
  text-align: right;
}
.ue-empty {
  padding: 22px;
  text-align: center;
  color: var(--text-faint);
}
.ue-row {
  display: grid;
  grid-template-columns: 1.6fr 0.8fr 1.1fr;
  gap: 10px;
  padding: 12px 18px;
  border-top: 1px solid var(--border-subtle);
  align-items: center;
}
.ue-row__name {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}
.ue-row__avatar {
  width: 22px;
  height: 22px;
  flex: none;
  border-radius: 5px;
  background: var(--warm-100);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font: var(--weight-bold) 10px var(--font-sans);
  color: var(--text-strong);
}
.ue-row__label {
  font: var(--text-sm) var(--font-mono);
  color: var(--text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ue-row__val {
  text-align: right;
  font: var(--weight-semibold) var(--text-sm) var(--font-mono);
  color: var(--text-strong);
}
.ue-row__pct {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
.ue-row__bar {
  width: 64px;
  height: 7px;
  border-radius: var(--radius-pill);
  background: var(--warm-200);
  overflow: hidden;
  display: flex;
}
.ue-row__bar span {
  display: block;
  height: 100%;
}
.ue-row__pctnum {
  width: 46px;
  text-align: right;
  font: var(--text-xs) var(--font-mono);
  color: var(--text-muted);
}
.ue-footnote {
  font: var(--text-xs) var(--font-sans);
  color: var(--text-faint);
  margin-top: 10px;
}
</style>
