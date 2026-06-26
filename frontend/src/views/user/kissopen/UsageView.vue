<template>
  <AppLayout>
    <div class="kact-head">
      <div>
        <h1 class="kact-title">{{ t('nav.activity') }}</h1>
        <p class="kact-sub">{{ t('usage.description') }}</p>
      </div>
      <div class="kact-head__actions">
        <div class="kact-range">
          <div class="ko-select-wrap">
            <select v-model="rangeDays" class="ko-input ko-select" @change="applyRange">
              <option value="7">{{ t('usage.past1Week') }}</option>
              <option value="30">{{ t('usage.past30Days') }}</option>
              <option value="90">{{ t('usage.past90Days') }}</option>
            </select>
            <span class="ko-select-wrap__chev"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg></span>
          </div>
        </div>
      </div>
    </div>
    <div class="kact-tabs"><KitTabs v-model="pageView" :items="tabs" /></div>
    <div v-show="pageView === 'overview'" class="kact-pane"><KitActivityOverview :data="realOverview" @explore="pageView = 'explore'" /></div>
    <div v-show="pageView === 'trends'" class="kact-pane"><KitActivityTrends :start-date="startDate" :end-date="endDate" /></div>
    <div v-show="pageView === 'explore'" class="kact-pane"><KitUsageExplore :start-date="startDate" :end-date="endDate" /></div>
    <div v-show="pageView === 'guardrails'" class="kact-pane"><KitActivityGuardrails /></div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usageAPI } from '@/api'
import AppLayout from '@/components/layout/AppLayout.vue'
import KitTabs from '@/components/kit/KitTabs.vue'
import KitActivityOverview from '@/components/kit/KitActivityOverview.vue'
import type { ActivityOverviewData } from '@/components/kit/KitActivityOverview.vue'
import KitUsageExplore from '@/components/kit/KitUsageExplore.vue'
import KitActivityTrends from '@/components/kit/KitActivityTrends.vue'
import KitActivityGuardrails from '@/components/kit/KitActivityGuardrails.vue'
import type { UsageAggregateRow } from '@/api/usage'
import type { UsageStatsResponse, TrendDataPoint, ModelStat } from '@/types'

const { t } = useI18n()

const usageStats = ref<UsageStatsResponse | null>(null)

// 缓存命中率 = cache_read / (input + cache_creation + cache_read)；分母为 0 时显示 '-'
const cacheStats = computed(() => {
  const cacheRead = usageStats.value?.total_cache_read_tokens || 0
  const cacheCreate = usageStats.value?.total_cache_creation_tokens || 0
  const input = usageStats.value?.total_input_tokens || 0
  const totalInput = input + cacheCreate + cacheRead
  const ratePercent = totalInput > 0 ? `${((cacheRead / totalInput) * 100).toFixed(1)}%` : '-'
  return { cacheRead, totalInput, ratePercent }
})

const pageView = ref<'overview' | 'trends' | 'explore' | 'guardrails'>('overview')
const rangeDays = ref('7')
const tabs = computed(() => [
  { value: 'overview', label: t('usage.overview') },
  { value: 'trends', label: t('usage.trends') },
  { value: 'explore', label: t('usage.explore') },
  { value: 'guardrails', label: t('usage.guardrails') },
])
const overviewTrend = ref<TrendDataPoint[]>([])
const overviewModels = ref<ModelStat[]>([])
const topKeysAgg = ref<UsageAggregateRow[]>([])
const topAppsAgg = ref<UsageAggregateRow[]>([])

const fmtTok = (n: number) =>
  n >= 1e9 ? (n / 1e9).toFixed(1) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : `${n}`

const formatTokens = (value: number): string => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`
  return value.toLocaleString()
}

// Build the shared Activity-overview data shape from real API data.
const realOverview = computed<Partial<ActivityOverviewData>>(() => {
  const tr = overviewTrend.value
  const days = tr.map((d) => d.date.slice(5))
  const models = [...overviewModels.value].sort((a, b) => b.actual_cost - a.actual_cost).slice(0, 7)
  const modelLabels = models.map((m) => m.model.split('/').pop() || m.model)
  const byModelData = models.map((m) => ({ v: m.actual_cost }))
  const reqByModelData = models.map((m) => ({ v: m.requests }))
  const tokBreakData = tr.map((d) => ({ p: (d.input_tokens || 0) / 1e6, c: (d.output_tokens || 0) / 1e6, r: 0 }))
  const cacheData = tr.map((d) => ({ u: Math.max(0, (d.input_tokens || 0) - (d.cache_read_tokens || 0)) / 1e6, c: (d.cache_read_tokens || 0) / 1e6 }))
  const usagePts = tr.map((d) => d.actual_cost)
  const s = usageStats.value
  return {
    days,
    stats: [
      { label: t('usage.totalCost'), value: '$' + (s?.total_actual_cost || 0).toFixed(2), sub: t('usage.actualCost'), pts: tr.map((d) => d.actual_cost), color: 'var(--coral-400)' },
      { label: t('usage.totalRequests'), value: (s?.total_requests || 0).toLocaleString(), sub: t('usage.inSelectedRange'), pts: tr.map((d) => d.requests), color: 'var(--pink-500)' },
      { label: t('usage.totalTokens'), value: formatTokens(s?.total_tokens || 0), sub: `${t('usage.in')} ${formatTokens(s?.total_input_tokens || 0)} · ${t('usage.out')} ${formatTokens(s?.total_output_tokens || 0)}`, pts: tr.map((d) => d.total_tokens), color: 'var(--lens-solid)' },
      { label: t('usage.cacheHitRate'), value: cacheStats.value.ratePercent, sub: `${t('usage.cacheHit')} ${formatTokens(s?.total_cache_read_tokens || 0)}`, pts: tr.map((d) => { const ti = (d.input_tokens || 0) + (d.cache_creation_tokens || 0) + (d.cache_read_tokens || 0); return ti > 0 ? (d.cache_read_tokens / ti) * 100 : 0 }), color: 'var(--green-500)' },
    ],
    topKeysTitle: t('usage.apiKey'),
    topKeys: topKeysAgg.value.slice(0, 3).map((r) => ({ name: r.label, tok: fmtTok(r.total_tokens) + ' tok' })),
    topAppsTitle: t('usage.provider'),
    topApps: topAppsAgg.value.slice(0, 3).map((r) => ({ name: r.label, tok: fmtTok(r.total_tokens) + ' tok' })),
    byModel: { title: t('usage.model'), data: byModelData, keys: ['v'], colors: ['var(--coral-400)'], max: Math.max(...byModelData.map((x) => x.v), 0.0001), fmt: (v) => '$' + v.toFixed(0), legend: [{ label: t('usage.totalCost'), color: 'var(--coral-400)' }], labels: modelLabels },
    usageType: { title: t('usage.totalCost'), pts: usagePts, max: Math.max(...usagePts, 0.0001), color: 'var(--coral-500)', fmt: (v) => '$' + v.toFixed(0), legend: [{ label: t('usage.actualCost'), color: 'var(--coral-500)' }], labels: days },
    reqVol: { title: t('usage.totalRequests'), data: reqByModelData, keys: ['v'], colors: ['var(--pink-400)'], max: Math.max(...reqByModelData.map((x) => x.v), 1), fmt: (v) => v.toFixed(0), legend: [{ label: t('usage.totalRequests'), color: 'var(--pink-400)' }], labels: modelLabels },
    tokBreak: { title: t('usage.totalTokens'), data: tokBreakData, keys: ['p', 'c', 'r'], colors: ['var(--coral-400)', 'var(--lens-mid)', 'var(--pink-500)'], max: Math.max(...tokBreakData.map((x) => x.p + x.c + x.r), 0.0001), fmt: (v) => v.toFixed(1) + 'M', legend: [{ label: t('usage.in'), color: 'var(--coral-400)' }, { label: t('usage.out'), color: 'var(--lens-mid)' }], labels: days },
    caching: { title: t('usage.cacheHitRate'), data: cacheData, keys: ['u', 'c'], colors: ['var(--warm-300)', 'var(--coral-400)'], max: Math.max(...cacheData.map((x) => x.u + x.c), 0.0001), fmt: (v) => v.toFixed(1) + 'M', legend: [{ label: 'Uncached', color: 'var(--warm-300)' }, { label: 'Cached', color: 'var(--coral-400)' }], labels: days },
  }
})

const fmtLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const now = new Date()
const startDate = ref(fmtLocal(new Date(now.getTime() - 6 * 864e5)))
const endDate = ref(fmtLocal(now))

const loadOverview = async () => {
  try {
    const [trend, models, keysAgg, provAgg] = await Promise.all([
      usageAPI.getDashboardTrend({ start_date: startDate.value, end_date: endDate.value, granularity: 'day' }),
      usageAPI.getDashboardModels({ start_date: startDate.value, end_date: endDate.value }),
      usageAPI.getUsageAggregate({ dimension: 'api_key', start_date: startDate.value, end_date: endDate.value }),
      usageAPI.getUsageAggregate({ dimension: 'provider', start_date: startDate.value, end_date: endDate.value }),
    ])
    overviewTrend.value = trend.trend || []
    overviewModels.value = models.models || []
    topKeysAgg.value = (keysAgg.rows || []).slice().sort((a, b) => b.total_tokens - a.total_tokens)
    topAppsAgg.value = (provAgg.rows || []).slice().sort((a, b) => b.total_tokens - a.total_tokens)
  } catch (error) {
    console.error('Failed to load activity overview:', error)
  }
}

const loadUsageStats = async () => {
  try {
    usageStats.value = await usageAPI.getStatsByDateRange(startDate.value, endDate.value)
  } catch (error) {
    console.error('Failed to load usage stats:', error)
  }
  void loadOverview()
}

const applyRange = () => {
  const days = Number(rangeDays.value)
  startDate.value = fmtLocal(new Date(Date.now() - (days - 1) * 864e5))
  endDate.value = fmtLocal(new Date())
  loadUsageStats()
}

onMounted(loadUsageStats)
</script>

<style scoped>
.kact-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.kact-title {
  font: var(--weight-bold) var(--text-2xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.kact-sub {
  font: var(--type-body);
  color: var(--text-muted);
  margin-top: 4px;
}
.kact-head__actions { display: flex; align-items: center; gap: 10px; flex: none; }
.kact-range { width: 160px; }
.kact-tabs { overflow-x: auto; margin-bottom: 16px; }
.kact-pane { max-width: 1120px; }
</style>
