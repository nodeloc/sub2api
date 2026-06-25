<template>
  <div class="kt">
    <div class="kt-section__head">
      <h3 class="kt-h3">{{ t('usage.trends') }}</h3>
      <div class="kt-select">
        <div class="ko-select-wrap">
          <select v-model="metric" class="ko-input ko-select">
            <option value="spend">{{ t('usage.spend') }}</option>
            <option value="tokens">{{ t('usage.tokens') }}</option>
            <option value="requests">{{ t('usage.requests') }}</option>
          </select>
          <span class="ko-select-wrap__chev"><component :is="chev" /></span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="kt-empty"><LoadingSpinner /></div>
    <div v-else-if="!points.length" class="kt-empty">{{ t('usage.noUsageRecords') }}</div>
    <div v-else class="kt-grid">
      <!-- Over time -->
      <div class="ko-card">
        <div class="kt-card-head">
          <span class="kt-card-title">{{ metricLabel }} {{ t('usage.overTime') }}</span>
          <span class="kt-total">{{ fmtMetric(totalMetric) }}</span>
        </div>
        <div class="kt-bars">
          <div class="kt-yaxis">
            <span>{{ fmtAxis(yMax) }}</span><span>{{ fmtAxis(yMax / 2) }}</span><span>0</span>
          </div>
          <div class="kt-bars__plot">
            <div class="kt-bars__row">
              <div
                v-for="(p, i) in points"
                :key="i"
                class="kt-bar"
                :title="`${p.label}: ${fmtMetric(p.v)}`"
                :style="{ height: (yMax ? (p.v / yMax) * 100 : 0) + '%', background: i === points.length - 1 ? 'var(--brand)' : 'var(--warm-200)' }"
              ></div>
            </div>
            <div class="kt-bars__labels">
              <span v-for="(p, i) in points" :key="i">{{ showLabel(i) ? p.label : '' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Top models -->
      <div class="ko-card">
        <div class="kt-card-head">
          <span class="kt-card-title">{{ t('usage.topModels') }}</span>
          <router-link to="/models" class="kt-explore">{{ t('models.allModels') }} ›</router-link>
        </div>
        <div v-if="!topModels.length" class="kt-trending-empty">{{ t('usage.noUsageRecords') }}</div>
        <div v-else class="kt-trending">
          <div v-for="m in topModels" :key="m.key" class="kt-trow">
            <span class="kt-trow__avatar"><ModelIcon :model="m.label" size="18px" /></span>
            <div class="kt-trow__id">
              <div class="kt-trow__name">{{ m.label }}</div>
              <div class="kt-trow__barwrap"><span class="kt-trow__bar" :style="{ width: topShare(m) + '%' }"></span></div>
            </div>
            <span class="kt-trow__val">{{ fmtMetric(modelVal(m)) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { usageAPI } from '@/api'
import type { UsageAggregateRow } from '@/api/usage'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ModelIcon from '@/components/common/ModelIcon.vue'

const props = defineProps<{ startDate?: string; endDate?: string }>()
const { t } = useI18n()

type Metric = 'spend' | 'tokens' | 'requests'
const metric = ref<Metric>('spend')
const loading = ref(false)
const trend = ref<any[]>([])
const models = ref<UsageAggregateRow[]>([])

const metricLabel = computed(() => metric.value === 'spend' ? t('usage.spend') : metric.value === 'tokens' ? t('usage.tokens') : t('usage.requests'))

function pointVal(p: any): number {
  if (metric.value === 'spend') return Number(p.actual_cost ?? p.cost ?? 0)
  if (metric.value === 'tokens') return Number(p.total_tokens ?? 0)
  return Number(p.requests ?? 0)
}
function modelVal(m: UsageAggregateRow): number {
  if (metric.value === 'spend') return Number(m.actual_cost ?? m.cost ?? 0)
  if (metric.value === 'tokens') return Number(m.total_tokens ?? 0)
  return Number(m.requests ?? 0)
}

const points = computed(() =>
  trend.value.map((p) => {
    const d = new Date(p.date)
    return { label: `${d.getMonth() + 1}/${d.getDate()}`, v: pointVal(p) }
  })
)
const yMax = computed(() => Math.max(...points.value.map((p) => p.v), 0))
const totalMetric = computed(() => points.value.reduce((s, p) => s + p.v, 0))
const topModels = computed(() => [...models.value].sort((a, b) => modelVal(b) - modelVal(a)).slice(0, 6))
const topMax = computed(() => Math.max(...topModels.value.map(modelVal), 1))
function topShare(m: UsageAggregateRow) {
  return (modelVal(m) / topMax.value) * 100
}
function showLabel(i: number) {
  const n = points.value.length
  const step = n > 14 ? Math.ceil(n / 7) : 1
  return i % step === 0 || i === n - 1
}

function fmtTok(n: number) {
  return n >= 1e9 ? (n / 1e9).toFixed(1) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : `${Math.round(n)}`
}
function fmtMetric(n: number) {
  if (metric.value === 'spend') return '$' + n.toFixed(2)
  if (metric.value === 'tokens') return fmtTok(n)
  return fmtTok(n)
}
function fmtAxis(n: number) {
  if (metric.value === 'spend') return '$' + (n >= 100 ? Math.round(n) : n.toFixed(1))
  return fmtTok(n)
}

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

async function load() {
  loading.value = true
  try {
    const end = props.endDate || ymd(new Date())
    const start = props.startDate || ymd(new Date(Date.now() - 6 * 86400000))
    const [tr, agg] = await Promise.all([
      usageAPI.getDashboardTrend({ start_date: start, end_date: end }),
      usageAPI.getUsageAggregate({ dimension: 'model', start_date: start, end_date: end }),
    ])
    trend.value = (tr as any)?.trend || []
    models.value = agg?.rows || []
  } catch (e) {
    console.error('Failed to load trends:', e)
    trend.value = []
    models.value = []
  } finally {
    loading.value = false
  }
}

const chev = () =>
  h('svg', { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M6 9l6 6 6-6' })])

watch(() => [props.startDate, props.endDate], load)
onMounted(load)
</script>

<style scoped>
.kt {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.kt-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.kt-h3 {
  font: var(--weight-semibold) var(--text-xl) var(--font-sans);
  color: var(--text-strong);
}
.kt-select {
  width: 130px;
}
.kt-empty {
  display: flex;
  justify-content: center;
  padding: 40px 0;
  color: var(--text-faint);
}
.kt-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 16px;
}
@media (max-width: 820px) {
  .kt-grid {
    grid-template-columns: 1fr;
  }
}
.kt-card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 14px;
}
.kt-card-title {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
  text-transform: capitalize;
}
.kt-total {
  font: var(--weight-bold) var(--text-sm) var(--font-mono);
  color: var(--text-strong);
}
.kt-explore {
  font: var(--weight-semibold) var(--text-xs) var(--font-sans);
  color: var(--text-link, var(--brand));
  text-decoration: none;
}
.kt-bars {
  display: flex;
}
.kt-yaxis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 160px;
  padding-right: 8px;
  font: 10px var(--font-mono);
  color: var(--text-faint);
  text-align: right;
  flex: none;
}
.kt-bars__plot {
  flex: 1;
  min-width: 0;
}
.kt-bars__row {
  display: flex;
  align-items: flex-end;
  gap: 5px;
  height: 160px;
  border-bottom: 1px solid var(--border-subtle);
}
.kt-bar {
  flex: 1;
  min-height: 2px;
  border-radius: 4px 4px 0 0;
}
.kt-bars__labels {
  display: flex;
  gap: 5px;
  margin-top: 6px;
}
.kt-bars__labels span {
  flex: 1;
  text-align: center;
  font: 10px var(--font-mono);
  color: var(--text-faint);
  white-space: nowrap;
  overflow: hidden;
}
.kt-trending {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.kt-trending-empty {
  font: var(--text-sm) var(--font-sans);
  color: var(--text-faint);
  padding: 8px 0;
}
.kt-trow {
  display: flex;
  align-items: center;
  gap: 11px;
}
.kt-trow__avatar {
  width: 30px;
  height: 30px;
  flex: none;
  border-radius: var(--radius-sm);
  background: var(--warm-100);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.kt-trow__id {
  flex: 1;
  min-width: 0;
}
.kt-trow__name {
  font: var(--weight-semibold) var(--text-xs) var(--font-mono);
  color: var(--text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.kt-trow__barwrap {
  height: 5px;
  border-radius: 3px;
  background: var(--warm-100);
  margin-top: 5px;
  overflow: hidden;
}
.kt-trow__bar {
  display: block;
  height: 100%;
  background: var(--grad-brand);
  border-radius: 3px;
}
.kt-trow__val {
  font: var(--weight-bold) var(--text-xs) var(--font-mono);
  color: var(--text-strong);
  flex: none;
}
</style>
