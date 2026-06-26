<template>
  <AppLayout>
    <div v-if="loading" class="ko-dash__loading"><LoadingSpinner /></div>

    <div v-else class="ko-dash">
      <!-- Greeting -->
      <div class="ko-dash__greet">
        <span class="ko-dash__avatar">{{ initial }}</span>
        <div class="ko-dash__greet-text">
          <h1 class="ko-dash__h1">{{ t('dashboard.welcomeBack') }}, {{ name }}</h1>
          <p class="ko-dash__lead">{{ t('dashboard.welcomeMessage') }}</p>
        </div>
        <router-link to="/keys" class="btn btn-primary ko-dash__cta">
          <component :is="icons.Key" :size="16" /> {{ t('nav.apiKeys') }}
        </router-link>
      </div>

      <!-- Stat tiles -->
      <div class="ko-dash__stats">
        <KitStatTile :label="t('dashboard.balance')" :value="`$${fmt2(balance)}`" accent :sub="`${stats?.active_api_keys ?? 0} ${t('common.active')}`" />
        <KitStatTile :label="t('dashboard.todayCost')" :value="`$${fmt2(stats?.today_actual_cost || 0)}`" :sub="`${t('common.total')}: $${fmt2(stats?.total_actual_cost || 0)}`" />
        <KitStatTile :label="t('dashboard.todayRequests')" :value="`${stats?.today_requests || 0}`" :sub="`${t('common.total')}: ${fmtNum(stats?.total_requests || 0)}`" />
        <KitStatTile :label="t('dashboard.avgResponse')" :value="fmtDuration(stats?.average_duration_ms || 0)" :sub="t('dashboard.averageTime')" />
      </div>

      <div class="ko-dash__grid">
        <!-- Left column -->
        <div class="ko-dash__col">
          <!-- Spend chart -->
          <div class="card ko-dash__chart">
            <div class="ko-dash__card-head">
              <span class="ko-dash__card-title">{{ t('dashboard.todayCost') }} · {{ trendData.length }}d</span>
              <span class="badge badge-primary">${{ fmt2(periodSpend) }}</span>
            </div>
            <div v-if="bars.length" class="ko-dash__bars">
              <div
                v-for="(b, i) in bars"
                :key="i"
                class="ko-dash__bar"
                :class="{ 'ko-dash__bar--last': i === bars.length - 1 }"
                :style="{ height: b.h + '%' }"
                :title="`${b.date}: $${fmt2(b.cost)}`"
              ></div>
            </div>
            <div v-else class="ko-dash__empty">{{ t('dashboard.noUsageRecords') }}</div>
          </div>

          <!-- Recent requests -->
          <div>
            <div class="ko-dash__section-head">
              <h3 class="ko-dash__h3">{{ t('dashboard.recentRequests') }}</h3>
              <router-link to="/logs" class="ko-dash__link">{{ t('dashboard.viewAllUsage') }}</router-link>
            </div>
            <div class="card ko-dash__flush">
              <div v-if="!recentUsage.length" class="ko-dash__empty">{{ t('dashboard.noUsageRecords') }}</div>
              <div v-for="(log, i) in recentUsage" :key="log.id" class="ko-dash__act" :class="{ 'ko-dash__act--bd': i > 0 }">
                <ModelIcon :model="log.model" size="20px" />
                <div class="ko-dash__act-id">
                  <div class="ko-dash__act-model">{{ log.model }}</div>
                  <div class="ko-dash__act-when">{{ formatDateTime(log.created_at) }} · {{ fmtTokens(log.input_tokens + log.output_tokens) }} tokens</div>
                </div>
                <span class="ko-dash__act-cost">${{ fmt4(log.actual_cost) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div class="ko-dash__col">
          <!-- Your models -->
          <div>
            <div class="ko-dash__section-head">
              <h3 class="ko-dash__h3">{{ t('dashboard.yourModels') }}</h3>
              <router-link to="/logs" class="ko-dash__link">{{ t('dashboard.viewUsage') }}</router-link>
            </div>
            <div class="card ko-dash__flush">
              <div v-if="!topModels.length" class="ko-dash__empty">{{ t('dashboard.noUsageRecords') }}</div>
              <router-link
                v-for="(m, i) in topModels"
                :key="m.model"
                to="/logs"
                class="ko-dash__model"
                :class="{ 'ko-dash__model--bd': i > 0 }"
              >
                <ModelIcon :model="m.model" size="20px" />
                <div class="ko-dash__model-id">
                  <div class="ko-dash__model-name">{{ m.model }}</div>
                  <div class="ko-dash__model-meta">{{ fmtNum(m.requests) }} {{ t('dashboard.requests') }} · {{ fmtTokens(m.total_tokens) }} tok</div>
                </div>
                <span class="ko-dash__model-arrow"><component :is="icons.Arrow" :size="15" /></span>
              </router-link>
            </div>
          </div>

          <!-- Quick actions -->
          <div class="card ko-dash__quick">
            <div class="ko-dash__card-title ko-dash__quick-title">{{ t('dashboard.quickActions') }}</div>
            <router-link to="/keys" class="ko-dash__qa">
              <span class="ko-dash__qa-ic"><component :is="icons.Key" :size="16" /></span>
              <span>{{ t('dashboard.createApiKey') }}</span>
              <component :is="icons.Arrow" :size="14" class="ko-dash__qa-arrow" />
            </router-link>
            <router-link to="/logs" class="ko-dash__qa">
              <span class="ko-dash__qa-ic"><component :is="icons.Chart" :size="16" /></span>
              <span>{{ t('dashboard.viewUsage') }}</span>
              <component :is="icons.Arrow" :size="14" class="ko-dash__qa-arrow" />
            </router-link>
            <router-link to="/redeem" class="ko-dash__qa">
              <span class="ko-dash__qa-ic ko-dash__qa-ic--pink"><component :is="icons.Sparkle" :size="16" /></span>
              <span>{{ t('dashboard.redeemCode') }}</span>
              <component :is="icons.Arrow" :size="14" class="ko-dash__qa-arrow" />
            </router-link>
          </div>

          <!-- Quickstart -->
          <div class="card ko-dash__quickstart">
            <div class="ko-dash__card-title ko-dash__quick-title">{{ t('dashboard.makeRequest') }}</div>
            <KitCodeBlock lang="bash" :code="quickCode" />
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { usageAPI, type UserDashboardStats } from '@/api/usage'
import type { TrendDataPoint, ModelStat, UsageLog } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ModelIcon from '@/components/common/ModelIcon.vue'
import KitStatTile from '@/components/kit/KitStatTile.vue'
import KitCodeBlock from '@/components/kit/KitCodeBlock.vue'
import { kitIcons as icons } from '@/components/kit/icons'
import { formatDateTime } from '@/utils/format'

const { t } = useI18n()
const authStore = useAuthStore()

const loading = ref(false)
const stats = ref<UserDashboardStats | null>(null)
const trendData = ref<TrendDataPoint[]>([])
const modelStats = ref<ModelStat[]>([])
const recentUsage = ref<UsageLog[]>([])

const balance = computed(() => authStore.user?.balance ?? 0)
const email = computed(() => authStore.user?.email || '')
const name = computed(() => {
  const u = authStore.user
  return u?.username || (email.value ? email.value.split('@')[0] : 'there')
})
const initial = computed(() => (name.value ? name.value.charAt(0).toUpperCase() : 'U'))

const topModels = computed(() => [...modelStats.value].sort((a, b) => b.total_tokens - a.total_tokens).slice(0, 4))
const periodSpend = computed(() => trendData.value.reduce((s, d) => s + (d.actual_cost || 0), 0))
const bars = computed(() => {
  const pts = trendData.value
  const max = Math.max(...pts.map((p) => p.actual_cost || 0), 0.0001)
  return pts.map((p) => ({ date: p.date, cost: p.actual_cost || 0, h: Math.max(4, Math.round(((p.actual_cost || 0) / max) * 100)) }))
})

const quickCode = computed(
  () => `curl ${window.location.origin}/v1/chat/completions \\
  -H "Authorization: Bearer sk-..." \\
  -d '{"model":"claude-3-5-sonnet"}'`
)

// Formatters
const fmt2 = (n: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
const fmt4 = (n: number) => n.toFixed(4)
const fmtNum = (n: number) => n.toLocaleString()
const fmtTokens = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`)
const fmtDuration = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms.toFixed(0)}ms`)

const ymd = (d: Date) => d.toISOString().split('T')[0]

async function loadAll() {
  loading.value = true
  const end = new Date()
  const start = new Date(Date.now() - 13 * 86400000)
  try {
    await authStore.refreshUser()
    const [s, trend, models, recent] = await Promise.all([
      usageAPI.getDashboardStats(),
      usageAPI.getDashboardTrend({ start_date: ymd(start), end_date: ymd(end), granularity: 'day' }),
      usageAPI.getDashboardModels({ start_date: ymd(start), end_date: ymd(end) }),
      usageAPI.getByDateRange(ymd(start), ymd(end)),
    ])
    stats.value = s
    trendData.value = trend.trend || []
    modelStats.value = models.models || []
    recentUsage.value = recent.items.slice(0, 5)
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)
</script>

<style scoped>
.ko-dash__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
}
.ko-dash {
  max-width: 1080px;
  margin: 0 auto;
}
.ko-dash__greet {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
}
.ko-dash__avatar {
  width: 56px;
  height: 56px;
  flex: none;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--grad-brand);
  color: #fff;
  font: var(--weight-bold) var(--text-lg) var(--font-sans);
}
.ko-dash__greet-text {
  flex: 1;
  min-width: 0;
}
.ko-dash__h1 {
  font: var(--weight-bold) var(--text-3xl) var(--font-sans);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.ko-dash__lead {
  font: var(--type-body);
  color: var(--text-muted);
  margin-top: 2px;
}
.ko-dash__cta {
  flex: none;
}
.ko-dash__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}
.ko-dash__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}
.ko-dash__col {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
@media (max-width: 900px) {
  .ko-dash__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .ko-dash__grid {
    grid-template-columns: 1fr;
  }
}
.ko-dash__chart {
  padding: 20px;
}
.ko-dash__card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.ko-dash__card-title {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
}
.ko-dash__bars {
  display: flex;
  align-items: flex-end;
  gap: 5px;
  height: 120px;
}
.ko-dash__bar {
  flex: 1;
  border-radius: 5px 5px 2px 2px;
  background: var(--coral-200);
  min-height: 4px;
}
.ko-dash__bar--last {
  background: var(--grad-brand);
}
.ko-dash__section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.ko-dash__h3 {
  font: var(--weight-semibold) var(--text-xl) var(--font-sans);
  color: var(--text-strong);
}
.ko-dash__link {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-link);
  text-decoration: none;
}
.ko-dash__flush {
  padding: 0;
  overflow: hidden;
}
.ko-dash__empty {
  padding: 22px 16px;
  text-align: center;
  font: var(--text-sm) var(--font-sans);
  color: var(--text-faint);
}
.ko-dash__act {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
}
.ko-dash__act--bd {
  border-top: 1px solid var(--border-subtle);
}
.ko-dash__act-id {
  min-width: 0;
}
.ko-dash__act-model {
  font: var(--text-sm) var(--font-mono);
  color: var(--text-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ko-dash__act-when {
  font: var(--text-2xs) var(--font-sans);
  color: var(--text-faint);
}
.ko-dash__act-cost {
  font: var(--weight-semibold) var(--text-sm) var(--font-mono);
  color: var(--text-strong);
}
.ko-dash__model {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px 16px;
  text-decoration: none;
  transition: background var(--dur-fast) var(--ease-out);
}
.ko-dash__model:hover {
  background: var(--surface-hover);
}
.ko-dash__model--bd {
  border-top: 1px solid var(--border-subtle);
}
.ko-dash__model-id {
  flex: 1;
  min-width: 0;
}
.ko-dash__model-name {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ko-dash__model-meta {
  font: var(--text-2xs) var(--font-sans);
  color: var(--text-faint);
}
.ko-dash__model-arrow {
  color: var(--text-faint);
  display: inline-flex;
}
.ko-dash__quick {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
}
.ko-dash__quick-title {
  margin-bottom: 6px;
}
.ko-dash__qa {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 8px;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-body);
  font: var(--weight-medium) var(--text-sm) var(--font-sans);
  transition: background var(--dur-fast) var(--ease-out);
}
.ko-dash__qa:hover {
  background: var(--surface-hover);
}
.ko-dash__qa span:nth-child(2) {
  flex: 1;
}
.ko-dash__qa-ic {
  width: 32px;
  height: 32px;
  flex: none;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--grad-brand-soft);
  border: 1px solid var(--coral-200);
  color: var(--coral-600);
}
.ko-dash__qa-ic--pink {
  background: var(--pink-50);
  border-color: var(--pink-200);
  color: var(--pink-600);
}
.ko-dash__qa-arrow {
  color: var(--text-faint);
  transition: transform var(--dur-fast) var(--ease-out);
}
.ko-dash__qa:hover .ko-dash__qa-arrow {
  transform: translateX(3px);
}
.ko-dash__quickstart {
  padding: 16px;
  min-width: 0;
}
</style>
