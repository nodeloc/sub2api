<template>
  <div>
    <!-- Query builder toolbar -->
    <div class="ke-toolbar">
      <span class="ke-ctrl">
        <select v-model="metric" class="ko-input ko-select ke-select">
          <option value="spend">Total usage ($)</option>
          <option value="tokens">Token volume</option>
          <option value="requests">Requests</option>
        </select>
        <span class="ke-chev"><component :is="chev" /></span>
      </span>
      <span class="ke-chip">by</span>
      <span class="ke-ctrl">
        <select v-model="dim" class="ko-input ko-select ke-select" @change="subgroup = 'none'">
          <option value="model">Model</option>
          <option value="provider">Provider</option>
          <option value="app">App</option>
          <option value="key">API key</option>
        </select>
        <span class="ke-chev"><component :is="chev" /></span>
      </span>

      <span v-if="SG" class="ke-chip ke-chip--sg">
        <component :is="icons.Plus" :size="13" /> {{ dimLabel[SG] }}
        <button class="ke-chip__x" aria-label="Remove subgroup" @click="subgroup = 'none'">✕</button>
      </span>
      <span v-else class="ke-ctrl">
        <select v-model="subgroup" class="ko-input ko-select ke-select">
          <option value="none">+ Subgroup</option>
          <option v-for="s in subOpts" :key="s" :value="s">{{ dimLabel[s] }}</option>
        </select>
        <span class="ke-chev"><component :is="chev" /></span>
      </span>

      <div class="ke-divider"></div>
      <span class="ke-chip">Top</span>
      <span class="ke-ctrl">
        <select v-model.number="topN" class="ko-input ko-select ke-select">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
        </select>
        <span class="ke-chev"><component :is="chev" /></span>
      </span>
      <span class="ke-ctrl">
        <select v-model="rollup" class="ko-input ko-select ke-select">
          <option value="total">Rollup: Total</option>
          <option value="mean">Rollup: Mean/day</option>
        </select>
        <span class="ke-chev"><component :is="chev" /></span>
      </span>
      <div class="ke-spacer"></div>
      <button class="ko-iconbtn ko-iconbtn--sm ko-iconbtn--outline" aria-label="Settings"><component :is="icons.Settings" :size="15" /></button>
      <button class="ko-btn ko-btn--secondary ko-btn--sm"><component :is="icons.Arrow" :size="14" /> Expand</button>
    </div>

    <!-- Proportion bar -->
    <div class="ke-prop">
      <template v-if="SG">
        <div v-for="(v, j) in subAgg" :key="j" :title="`${subMembers[j]}: ${fmt(v)}`" :style="{ flexGrow: Math.max(v, 0.0001), flexBasis: 0, minWidth: '2px', background: palette[j % palette.length] }"></div>
      </template>
      <template v-else>
        <div v-for="(r, i) in rows" :key="r.label" :title="`${r.label}: ${fmt(r.v)}`" :style="{ flexGrow: Math.max(r.v, 0.0001), flexBasis: 0, minWidth: '2px', background: palette[i % palette.length] }"></div>
      </template>
    </div>
    <!-- Legend -->
    <div class="ke-legend">
      <span v-for="(label, i) in legend" :key="label" class="ke-legend__item">
        <i :style="{ background: palette[i % palette.length] }"></i>{{ label }}
      </span>
    </div>

    <!-- Table -->
    <div class="ko-card ke-table">
      <div class="ke-table__head">
        <span>{{ dimLabel[dim] }}{{ SG ? ' › ' + dimLabel[SG] : '' }}</span>
        <button class="ke-sort" @click="sortDesc = !sortDesc">Value {{ sortDesc ? '↓' : '↑' }}</button>
        <span class="ke-pct-head">% of total</span>
      </div>
      <div v-for="(r, i) in rows" :key="r.label" class="ke-row">
        <span class="ke-row__name">
          <span class="ke-row__avatar">{{ r.initial }}</span>
          <span class="ke-row__label">{{ r.label }}</span>
        </span>
        <span class="ke-row__val">{{ fmt(r.v) }}</span>
        <span class="ke-row__pct">
          <span class="ke-row__bar">
            <template v-if="SG">
              <span v-for="(_, j) in subMembers" :key="j" :style="{ height: '100%', width: pct(r) * ratioFor(i)[j] + '%', background: palette[j % palette.length] }"></span>
            </template>
            <span v-else :style="{ display: 'block', height: '100%', width: pct(r) + '%', background: palette[i % palette.length] }"></span>
          </span>
          <span class="ke-row__pctnum">{{ pct(r).toFixed(1) }}%</span>
        </span>
      </div>
    </div>
    <p class="ke-footnote">{{ rows.length }} rows{{ SG ? ' × ' + subMembers.length + ' ' + dimLabel[SG].toLowerCase() : '' }} · 9ms</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { kitIcons as icons } from './icons'
import { KIT_MODELS } from './models'

const props = withDefaults(defineProps<{ range?: string }>(), { range: '7' })

const chev = () =>
  h('svg', { viewBox: '0 0 24 24', width: 13, height: 13, fill: 'none', stroke: 'currentColor', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, [h('path', { d: 'M6 9l6 6 6-6' })])

const metric = ref<'spend' | 'tokens' | 'requests'>('spend')
const dim = ref<'model' | 'provider' | 'app' | 'key'>('model')
const subgroup = ref('none')
const topN = ref(10)
const rollup = ref<'total' | 'mean'>('total')
const sortDesc = ref(true)

interface Row { label: string; initial: string; spend: number; tokens: number; requests: number; v: number }

const ds = computed<Record<string, Omit<Row, 'v'>[]>>(() => ({
  model: KIT_MODELS.map((m) => ({
    label: m.name, initial: m.providerInitial,
    spend: Math.round(parseFloat(m.tokensWeek) * m.priceInNum * 100) / 100,
    tokens: parseFloat(m.tokensWeek),
    requests: Math.round(parseFloat(m.tokensWeek) * 1.1 * 10) / 10,
  })),
  provider: [
    { label: 'Anthropic', initial: 'A', spend: 161.2, tokens: 44, requests: 20 },
    { label: 'OpenAI', initial: 'O', spend: 151.0, tokens: 60, requests: 24 },
    { label: 'Google', initial: 'G', spend: 47.5, tokens: 38, requests: 3 },
    { label: 'Meta', initial: 'M', spend: 16.6, tokens: 55, requests: 15 },
    { label: 'Together', initial: 'T', spend: 12.0, tokens: 28, requests: 9 },
    { label: 'Mistral', initial: 'M', spend: 5.9, tokens: 15, requests: 4 },
    { label: 'DeepSeek', initial: 'D', spend: 4.3, tokens: 31, requests: 8 },
  ],
  app: [
    { label: 'cline', initial: 'C', spend: 96.0, tokens: 38, requests: 12 },
    { label: 'acme-prod', initial: 'A', spend: 78.0, tokens: 60, requests: 18 },
    { label: 'Playground', initial: 'P', spend: 41.0, tokens: 14, requests: 6 },
    { label: 'Roo Code', initial: 'R', spend: 33.0, tokens: 10, requests: 4 },
    { label: 'acme-staging', initial: 'A', spend: 22.0, tokens: 12, requests: 5 },
  ],
  key: [
    { label: 'Production', initial: 'K', spend: 156.0, tokens: 90, requests: 30 },
    { label: 'Staging', initial: 'K', spend: 22.0, tokens: 14, requests: 8 },
    { label: 'Local dev', initial: 'K', spend: 4.4, tokens: 2, requests: 3 },
  ],
}))

const dimLabel: Record<string, string> = { model: 'Model', provider: 'Provider', app: 'App', key: 'API key' }
const palette = ['var(--coral-400)', 'var(--pink-400)', 'var(--lens-solid)', 'var(--coral-600)', 'var(--pink-600)', 'var(--amber-500)', 'var(--blue-500)', 'var(--green-500)', 'var(--coral-300)', 'var(--pink-300)']
const subPools: Record<string, string[]> = {
  provider: ['Anthropic', 'OpenAI', 'Together'],
  model: ['Claude Opus', 'GPT-5', 'Llama 4 70B'],
  app: ['cline', 'Playground', 'acme-prod'],
}
const subRatios = [[0.55, 0.30, 0.15], [0.42, 0.38, 0.20], [0.60, 0.25, 0.15], [0.34, 0.33, 0.33], [0.50, 0.30, 0.20]]
function ratioFor(i: number) {
  return subRatios[i % subRatios.length]
}

const subOpts = computed(() => ['model', 'provider', 'app'].filter((s) => s !== dim.value))
const SG = computed(() => (subgroup.value !== 'none' && subPools[subgroup.value] ? subgroup.value : null))
const subMembers = computed(() => (SG.value ? subPools[SG.value] : []))

const rows = computed<Row[]>(() => {
  const mul = rollup.value === 'mean' ? 1 / 7 : 1
  const rScale = ({ '7': 1, '30': 4.2, '90': 12.5 } as Record<string, number>)[props.range] || 1
  const M = metric.value
  const list = (ds.value[dim.value] || ds.value.model).map((r) => ({ ...r, v: (r[M] || 0) * mul * rScale }))
  list.sort((a, b) => (sortDesc.value ? b.v - a.v : a.v - b.v))
  return list.slice(0, topN.value)
})
const total = computed(() => rows.value.reduce((s, r) => s + r.v, 0) || 1)
const subAgg = computed(() => (SG.value ? subMembers.value.map((_, j) => rows.value.reduce((s, r, ri) => s + r.v * ratioFor(ri)[j], 0)) : []))
const legend = computed(() => (SG.value ? subMembers.value : rows.value.slice(0, 6).map((r) => r.label)))

function fmt(v: number) {
  if (metric.value === 'spend') return '$' + v.toFixed(2)
  if (metric.value === 'tokens') return v.toFixed(1) + 'B'
  return v.toFixed(1) + 'K'
}
function pct(r: Row) {
  return (r.v / total.value) * 100
}
</script>

<style scoped>
.ke-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.ke-ctrl {
  position: relative;
  flex: none;
}
.ke-select {
  height: 32px;
  font-size: var(--text-xs);
  font-weight: 600;
  padding: 0 28px 0 10px;
  width: auto;
}
.ke-chev {
  position: absolute;
  right: 9px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-muted);
  display: inline-flex;
}
.ke-chip {
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
.ke-chip--sg {
  gap: 6px;
  color: var(--coral-700);
  background: var(--coral-50);
  border-color: var(--coral-200);
  padding-right: 6px;
}
.ke-chip__x {
  display: inline-flex;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--coral-600);
  padding: 0;
  margin-left: 2px;
}
.ke-divider {
  width: 1px;
  height: 18px;
  background: var(--border-default);
  margin: 0 4px;
}
.ke-spacer {
  margin-left: auto;
}
.ke-prop {
  display: flex;
  gap: 2px;
  height: 26px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: 12px;
}
.ke-legend {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.ke-legend__item {
  display: flex;
  align-items: center;
  gap: 6px;
  font: var(--text-xs) var(--font-sans);
  color: var(--text-muted);
}
.ke-legend__item i {
  width: 9px;
  height: 9px;
  border-radius: 3px;
}
.ke-table {
  padding: 0;
  overflow: hidden;
}
.ke-table__head {
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
.ke-sort {
  background: none;
  border: none;
  cursor: pointer;
  font: inherit;
  color: inherit;
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}
.ke-pct-head {
  text-align: right;
}
.ke-row {
  display: grid;
  grid-template-columns: 1.6fr 0.8fr 1.1fr;
  gap: 10px;
  padding: 12px 18px;
  border-top: 1px solid var(--border-subtle);
  align-items: center;
}
.ke-row:first-of-type {
  border-top: none;
}
.ke-row__name {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}
.ke-row__avatar {
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
.ke-row__label {
  font: var(--text-sm) var(--font-sans);
  color: var(--text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ke-row__val {
  text-align: right;
  font: var(--weight-semibold) var(--text-sm) var(--font-mono);
  color: var(--text-strong);
}
.ke-row__pct {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
.ke-row__bar {
  width: 64px;
  height: 7px;
  border-radius: var(--radius-pill);
  background: var(--warm-200);
  overflow: hidden;
  display: flex;
}
.ke-row__pctnum {
  width: 46px;
  text-align: right;
  font: var(--text-xs) var(--font-mono);
  color: var(--text-muted);
}
.ke-footnote {
  font: var(--text-xs) var(--font-sans);
  color: var(--text-faint);
  margin-top: 10px;
}
</style>
