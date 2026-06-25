<template>
  <AppLayout>
    <div class="kp">
      <div class="kp-head">
        <div>
          <h1 class="kp-title">{{ t('nav.providers') }}</h1>
          <p class="kp-sub">{{ t('usage.providersSub') }}</p>
        </div>
        <div class="kp-range">
          <div class="ko-select-wrap">
            <select v-model="rangeDays" class="ko-input ko-select" @change="load">
              <option value="7">{{ t('usage.past1Week') }}</option>
              <option value="30">{{ t('usage.past30Days') }}</option>
              <option value="90">{{ t('usage.past90Days') }}</option>
            </select>
            <span class="ko-select-wrap__chev"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg></span>
          </div>
        </div>
      </div>

      <div v-if="loading" class="kp-loading"><LoadingSpinner /></div>
      <div v-else-if="!rows.length" class="kp-empty">{{ t('usage.noUsageRecords') }}</div>
      <div v-else class="kp-grid">
        <div v-for="p in rows" :key="p.key" class="card kp-card">
          <div class="kp-card__top">
            <span class="kp-card__avatar"><ModelIcon :model="iconModel(p.key)" size="24px" /></span>
            <div class="kp-card__id">
              <div class="kp-card__name">{{ p.label }}</div>
              <div class="kp-card__share">{{ share(p) }}% {{ t('usage.ofTotal') }}</div>
            </div>
          </div>
          <div class="kp-card__bar"><span class="kp-card__fill" :style="{ width: share(p) + '%' }"></span></div>
          <div class="kp-card__stats">
            <div class="kp-stat">
              <span class="kp-stat__v">{{ fmtNum(p.requests) }}</span>
              <span class="kp-stat__l">{{ t('usage.totalRequests') }}</span>
            </div>
            <div class="kp-stat">
              <span class="kp-stat__v">{{ fmtTok(p.total_tokens) }}</span>
              <span class="kp-stat__l">{{ t('usage.tokens') }}</span>
            </div>
            <div class="kp-stat">
              <span class="kp-stat__v">${{ p.actual_cost.toFixed(2) }}</span>
              <span class="kp-stat__l">{{ t('usage.cost') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usageAPI } from '@/api'
import type { UsageAggregateRow } from '@/api/usage'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ModelIcon from '@/components/common/ModelIcon.vue'

const { t } = useI18n()
const rangeDays = ref('30')
const loading = ref(false)
const rows = ref<UsageAggregateRow[]>([])

const totalTok = computed(() => rows.value.reduce((s, r) => s + r.total_tokens, 0) || 1)
function share(p: UsageAggregateRow) {
  return Math.round((p.total_tokens / totalTok.value) * 100)
}
// Map a provider platform to a model string ModelIcon recognises, so each
// provider shows its real brand icon (anthropic→Claude, google→Gemini, …).
const PLATFORM_ICON: Record<string, string> = {
  anthropic: 'claude',
  claude: 'claude',
  openai: 'gpt-4o',
  azure: 'gpt-4o',
  google: 'gemini',
  gemini: 'gemini',
  vertex: 'gemini',
  deepseek: 'deepseek',
  meta: 'llama',
  llama: 'llama',
  mistral: 'mistral',
  alibaba: 'qwen',
  qwen: 'qwen',
  zhipu: 'glm',
  xai: 'grok',
  grok: 'grok',
  moonshot: 'kimi',
  doubao: 'doubao',
  minimax: 'minimax',
  baidu: 'ernie',
  cohere: 'command',
}
function iconModel(key: string) {
  return PLATFORM_ICON[(key || '').toLowerCase()] || key
}
function fmtNum(n: number) {
  return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : `${n}`
}
function fmtTok(n: number) {
  return n >= 1e9 ? (n / 1e9).toFixed(1) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : `${n}`
}
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

async function load() {
  loading.value = true
  try {
    const days = Number(rangeDays.value)
    const end = new Date()
    const start = new Date(Date.now() - (days - 1) * 86400000)
    const res = await usageAPI.getUsageAggregate({ dimension: 'provider', start_date: ymd(start), end_date: ymd(end) })
    rows.value = (res.rows || []).slice().sort((a, b) => b.total_tokens - a.total_tokens)
  } catch (e) {
    console.error('Failed to load providers:', e)
    rows.value = []
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>

<style scoped>
.kp {
  max-width: 1000px;
  margin: 0 auto;
}
.kp-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 20px;
}
.kp-title {
  font: var(--weight-extra) var(--text-3xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.kp-sub {
  font: var(--type-body);
  color: var(--text-muted);
  margin-top: 4px;
}
.kp-range {
  width: 160px;
  flex: none;
}
.kp-loading,
.kp-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: var(--text-faint);
}
.kp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.kp-card {
  padding: 18px;
}
.kp-card__top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.kp-card__avatar {
  width: 42px;
  height: 42px;
  flex: none;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--warm-100);
  color: var(--text-strong);
}
.kp-card__id {
  min-width: 0;
}
.kp-card__name {
  font: var(--weight-bold) var(--text-md) var(--font-sans);
  color: var(--text-strong);
  text-transform: capitalize;
}
.kp-card__share {
  font: var(--weight-semibold) var(--text-xs) var(--font-mono);
  color: var(--text-muted);
  margin-top: 2px;
}
.kp-card__bar {
  height: 6px;
  border-radius: 3px;
  background: var(--warm-100);
  overflow: hidden;
  margin-bottom: 16px;
}
.kp-card__fill {
  display: block;
  height: 100%;
  background: var(--grad-brand);
  border-radius: 3px;
}
.kp-card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.kp-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.kp-stat__v {
  font: var(--weight-bold) var(--text-md) var(--font-mono);
  color: var(--text-strong);
}
.kp-stat__l {
  font: var(--weight-semibold) var(--text-2xs, 11px) var(--font-sans);
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
