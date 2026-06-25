<template>
  <div class="kao">
    <!-- Stat cards -->
    <div class="kao-stats">
      <div v-for="s in d.stats" :key="s.label" class="ko-card kao-stat">
        <div class="kao-stat__body">
          <div class="kao-stat__label">{{ s.label }}</div>
          <div class="kao-stat__value">{{ s.value }}</div>
          <div class="kao-stat__sub">{{ s.sub }}</div>
        </div>
        <KitSpark v-if="s.pts.length > 1" :pts="s.pts" :color="s.color" />
      </div>
    </div>

    <!-- Top keys + apps -->
    <div class="kao-grid2">
      <div class="ko-card">
        <component :is="CardHead" :title="d.topKeysTitle" />
        <div class="kao-toplist">
          <div v-for="(it, i) in d.topKeys" :key="i" class="kao-toprow">
            <span class="kao-toprow__rank">{{ i + 1 }}</span>
            <span class="kao-toprow__icon"><component :is="icons.Key" :size="15" /></span>
            <div class="kao-toprow__id">
              <div class="kao-toprow__name">{{ it.name }}</div>
              <div v-if="it.sub" class="kao-toprow__sub">{{ it.sub }}</div>
            </div>
            <span class="kao-toprow__tok">{{ it.tok }}</span>
          </div>
          <div v-if="!d.topKeys.length" class="kao-empty">—</div>
        </div>
      </div>
      <div class="ko-card">
        <component :is="CardHead" :title="d.topAppsTitle" />
        <div class="kao-toplist">
          <div v-for="(it, i) in d.topApps" :key="i" class="kao-toprow">
            <span class="kao-toprow__rank">{{ i + 1 }}</span>
            <span class="kao-toprow__icon"><component :is="icons.Bolt" :size="15" /></span>
            <div class="kao-toprow__id"><div class="kao-toprow__name">{{ it.name }}</div></div>
            <span class="kao-toprow__tok">{{ it.tok }}</span>
          </div>
          <div v-if="!d.topApps.length" class="kao-empty">—</div>
        </div>
      </div>
    </div>

    <!-- Usage by model -->
    <div class="ko-card">
      <component :is="CardHead" :title="d.byModel.title" />
      <div class="kao-chart">
        <component :is="YAxis" :max="d.byModel.max" :fmt="d.byModel.fmt" />
        <KitBars :data="d.byModel.data" :keys="d.byModel.keys" :colors="d.byModel.colors" :max="d.byModel.max" :labels="d.byModel.labels || d.days" />
      </div>
      <component :is="Legend" :items="d.byModel.legend" />
    </div>

    <!-- Usage type + Request volume -->
    <div class="kao-grid2">
      <div class="ko-card">
        <component :is="CardHead" :title="d.usageType.title" />
        <div class="kao-chart">
          <component :is="YAxis" :max="d.usageType.max" :fmt="d.usageType.fmt" />
          <KitArea :pts="d.usageType.pts" :max="d.usageType.max" :color="d.usageType.color" :labels="d.usageType.labels || d.days" />
        </div>
        <component :is="Legend" :items="d.usageType.legend" />
      </div>
      <div class="ko-card">
        <component :is="CardHead" :title="d.reqVol.title" />
        <div class="kao-chart">
          <component :is="YAxis" :max="d.reqVol.max" :fmt="d.reqVol.fmt" />
          <KitBars :data="d.reqVol.data" :keys="d.reqVol.keys" :colors="d.reqVol.colors" :max="d.reqVol.max" :labels="d.reqVol.labels || d.days" />
        </div>
        <component :is="Legend" :items="d.reqVol.legend" />
      </div>
    </div>

    <!-- Token breakdown + caching -->
    <div class="kao-grid2">
      <div class="ko-card">
        <component :is="CardHead" :title="d.tokBreak.title" />
        <div class="kao-chart">
          <component :is="YAxis" :max="d.tokBreak.max" :fmt="d.tokBreak.fmt" />
          <KitBars :data="d.tokBreak.data" :keys="d.tokBreak.keys" :colors="d.tokBreak.colors" :max="d.tokBreak.max" :labels="d.tokBreak.labels || d.days" />
        </div>
        <component :is="Legend" :items="d.tokBreak.legend" />
      </div>
      <div class="ko-card">
        <component :is="CardHead" :title="d.caching.title" />
        <div class="kao-chart">
          <component :is="YAxis" :max="d.caching.max" :fmt="d.caching.fmt" />
          <KitBars :data="d.caching.data" :keys="d.caching.keys" :colors="d.caching.colors" :max="d.caching.max" :labels="d.caching.labels || d.days" />
        </div>
        <component :is="Legend" :items="d.caching.legend" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import KitSpark from './KitSpark.vue'
import KitBars from './KitBars.vue'
import KitArea from './KitArea.vue'
import { kitIcons as icons } from './icons'

interface StatCard { label: string; value: string; sub: string; pts: number[]; color: string }
interface TopRow { name: string; sub?: string; tok: string }
interface LegendItem { label: string; color: string }
interface BarSpec { title: string; data: Record<string, number>[]; keys: string[]; colors: string[]; max: number; fmt: (v: number) => string; legend: LegendItem[]; labels?: string[] }
interface AreaSpec { title: string; pts: number[]; max: number; color: string; fmt: (v: number) => string; legend: LegendItem[]; labels?: string[] }
export interface ActivityOverviewData {
  days: string[]
  stats: StatCard[]
  topKeysTitle: string
  topKeys: TopRow[]
  topAppsTitle: string
  topApps: TopRow[]
  byModel: BarSpec
  usageType: AreaSpec
  reqVol: BarSpec
  tokBreak: BarSpec
  caching: BarSpec
}

const props = defineProps<{ data?: Partial<ActivityOverviewData> }>()
const emit = defineEmits<{ (e: 'explore'): void }>()

const C = { coral: 'var(--coral-400)', pink: 'var(--pink-400)', lens: 'var(--lens-solid)', pink5: 'var(--pink-500)', warm: 'var(--warm-300)', lensMid: 'var(--lens-mid)' }
const days = ['6/15', '6/16', '6/17', '6/18', '6/19', '6/20', '6/21']

// Demo defaults — identical to the design dashboard Activity overview.
const defaults: ActivityOverviewData = {
  days,
  stats: [
    { label: 'Total spend', value: '$182.40', sub: '+12% WoW', pts: [2, 3, 2.6, 4, 5, 4.4, 6.2], color: 'var(--coral-400)' },
    { label: 'Requests', value: '48.2K', sub: '+8% WoW', pts: [3, 4, 3.6, 5, 6, 5.6, 7], color: 'var(--pink-500)' },
    { label: 'Token volume', value: '140M', sub: '−3% WoW', pts: [5, 4.6, 5.2, 4, 4.4, 3.8, 3.2], color: 'var(--lens-solid)' },
    { label: 'Cache hit rate', value: '32.4%', sub: '+5pt WoW', pts: [1, 1.4, 2, 2.6, 3, 3.6, 4.2], color: 'var(--green-500)' },
  ],
  topKeysTitle: 'Top API keys',
  topKeys: [
    { name: 'Production', sub: 'sk-ko-0b3f…784', tok: '1.02M tok' },
    { name: 'Staging', sub: 'sk-ko-9f1a…p8x', tok: '520K tok' },
    { name: 'Local dev', sub: 'sk-ko-44c2…k0m', tok: '210K tok' },
  ],
  topAppsTitle: 'Top apps',
  topApps: [
    { name: 'cline', tok: '820K tok' },
    { name: 'Playground', tok: '610K tok' },
    { name: 'acme-prod', tok: '320K tok' },
  ],
  byModel: {
    title: 'Usage by model',
    data: [{ a: 0.4, b: 0.2 }, { a: 0.6, b: 0.3 }, { a: 0.9, b: 0.4 }, { a: 1.3, b: 0.6 }, { a: 1.9, b: 0.8 }, { a: 2.6, b: 1.1 }, { a: 3.3, b: 1.5 }],
    keys: ['a', 'b'], colors: [C.coral, C.pink], max: 5, fmt: (v) => '$' + v.toFixed(0),
    legend: [{ label: 'Claude Opus', color: C.coral }, { label: 'GPT-5', color: C.pink }],
  },
  usageType: {
    title: 'Usage type', pts: [0.2, 0.4, 0.7, 1.4, 2.6, 4.0, 4.8], max: 6, color: 'var(--coral-500)', fmt: (v) => '$' + v.toFixed(0),
    legend: [{ label: 'Gateway spend', color: 'var(--coral-500)' }, { label: 'BYOK', color: C.lens }],
  },
  reqVol: {
    title: 'Request volume by model',
    data: [{ a: 6, b: 3 }, { a: 9, b: 4 }, { a: 12, b: 6 }, { a: 18, b: 8 }, { a: 22, b: 11 }, { a: 28, b: 13 }, { a: 33, b: 16 }],
    keys: ['a', 'b'], colors: [C.coral, C.pink], max: 50, fmt: (v) => v.toFixed(0),
    legend: [{ label: 'Claude Opus', color: C.coral }, { label: 'GPT-5', color: C.pink }],
  },
  tokBreak: {
    title: 'Token breakdown',
    data: [{ p: 0.3, c: 0.1, r: 0.05 }, { p: 0.5, c: 0.2, r: 0.08 }, { p: 0.7, c: 0.3, r: 0.1 }, { p: 1.0, c: 0.4, r: 0.15 }, { p: 1.3, c: 0.5, r: 0.2 }, { p: 1.5, c: 0.6, r: 0.25 }, { p: 1.7, c: 0.7, r: 0.3 }],
    keys: ['p', 'c', 'r'], colors: [C.coral, C.lensMid, C.pink5], max: 2.6, fmt: (v) => v.toFixed(1) + 'M',
    legend: [{ label: 'Prompt', color: C.coral }, { label: 'Completion', color: C.lensMid }, { label: 'Reasoning', color: C.pink5 }],
  },
  caching: {
    title: 'Prompt token caching',
    data: [{ u: 0.3, c: 0.1 }, { u: 0.5, c: 0.2 }, { u: 0.7, c: 0.4 }, { u: 1.0, c: 0.6 }, { u: 1.3, c: 0.9 }, { u: 1.5, c: 1.1 }, { u: 1.7, c: 1.4 }],
    keys: ['u', 'c'], colors: [C.warm, C.coral], max: 3.2, fmt: (v) => v.toFixed(1) + 'M',
    legend: [{ label: 'Uncached', color: C.warm }, { label: 'Cached', color: C.coral }],
  },
}

const d = computed<ActivityOverviewData>(() => ({ ...defaults, ...(props.data || {}) }))

const YAxis = (p: { max: number; fmt: (v: number) => string }) =>
  h('div', { class: 'kao-yaxis' }, [h('span', p.fmt(p.max)), h('span', p.fmt(p.max / 2)), h('span', '0')])
const Legend = (p: { items: LegendItem[] }) =>
  h('div', { class: 'kao-legend' }, p.items.map((it) => h('span', { key: it.label, class: 'kao-legend__item' }, [h('i', { style: { background: it.color } }), it.label])))
const CardHead = (p: { title: string }) =>
  h('div', { class: 'kao-cardhead' }, [
    h('span', { class: 'kao-cardhead__title' }, p.title),
    h('a', { href: '#', class: 'kao-cardhead__explore', onClick: (e: Event) => { e.preventDefault(); emit('explore') } }, 'Explore ›'),
  ])
</script>

<style scoped>
.kao {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.kao-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
@media (max-width: 900px) {
  .kao-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.kao-stat {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}
.kao-stat__body {
  min-width: 0;
}
.kao-stat__label {
  font: var(--text-2xs) var(--font-sans);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-faint);
}
.kao-stat__value {
  font: var(--weight-extra) var(--text-2xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
  margin: 6px 0 3px;
}
.kao-stat__sub {
  font: var(--text-xs) var(--font-sans);
  color: var(--text-faint);
  white-space: nowrap;
}
.kao-grid2 {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
}
@media (max-width: 820px) {
  .kao-grid2 {
    grid-template-columns: 1fr;
  }
}
.kao-chart {
  display: flex;
}
.kao-toplist {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.kao-empty {
  color: var(--text-faint);
  padding: 8px 0;
}
.kao-toprow {
  display: flex;
  align-items: center;
  gap: 11px;
}
.kao-toprow__rank {
  font: var(--weight-bold) var(--text-sm) var(--font-mono);
  color: var(--text-faint);
  width: 14px;
}
.kao-toprow__icon {
  width: 30px;
  height: 30px;
  flex: none;
  border-radius: var(--radius-sm);
  background: var(--warm-100);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--coral-600);
}
.kao-toprow__id {
  flex: 1;
  min-width: 0;
}
.kao-toprow__name {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
}
.kao-toprow__sub {
  font: var(--text-2xs) var(--font-mono);
  color: var(--text-faint);
}
.kao-toprow__tok {
  font: var(--text-xs) var(--font-mono);
  color: var(--text-muted);
}
.kao :deep(.kao-yaxis) {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 150px;
  padding-right: 8px;
  font: 10px var(--font-mono);
  color: var(--text-faint);
  text-align: right;
  flex: none;
  min-width: 34px;
}
.kao :deep(.kao-legend) {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 14px;
}
.kao :deep(.kao-legend__item) {
  display: flex;
  align-items: center;
  gap: 6px;
  font: var(--text-xs) var(--font-sans);
  color: var(--text-muted);
}
.kao :deep(.kao-legend__item i) {
  width: 9px;
  height: 9px;
  border-radius: 3px;
  display: inline-block;
}
.kao :deep(.kao-cardhead) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.kao :deep(.kao-cardhead__title) {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
}
.kao :deep(.kao-cardhead__explore) {
  font: var(--weight-semibold) var(--text-xs) var(--font-sans);
  color: var(--text-link);
  text-decoration: none;
}
</style>
