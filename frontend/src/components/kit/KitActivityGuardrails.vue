<template>
  <div class="kg">
    <div class="ko-alert ko-alert--info">
      <span class="ko-alert__icon"><component :is="icons.Sparkle" :size="20" /></span>
      <div>
        <div class="ko-alert__title">{{ t('usage.guardrails') }}</div>
        <div class="ko-alert__body">{{ t('guardrails.intro') }}</div>
      </div>
    </div>

    <div v-if="loading" class="kg-loading"><LoadingSpinner /></div>
    <template v-else>
      <!-- Spend limits (subscription) -->
      <div class="ko-card kg-card">
        <h3 class="kg-h3">{{ t('guardrails.spendLimits') }}</h3>
        <div v-if="spendWindows.length" class="kg-limits">
          <div v-for="lw in spendWindows" :key="lw.key" class="kg-limit">
            <div class="kg-limit__top">
              <span class="kg-limit__label">{{ lw.label }}</span>
              <span class="kg-limit__val">${{ (lw.w.used_usd || 0).toFixed(2) }}<span class="kg-limit__cap"> / {{ lw.w.limit_usd != null ? '$' + lw.w.limit_usd : t('pro.unlimited') }}</span></span>
            </div>
            <div class="kg-bar"><span class="kg-fill" :style="{ width: Math.min(100, lw.w.percentage || 0) + '%' }"></span></div>
          </div>
        </div>
        <p v-else class="kg-note">{{ t('guardrails.payg') }}</p>
      </div>

      <!-- API key rate limits (5h / 1d / 7d) -->
      <div class="ko-card kg-card">
        <h3 class="kg-h3">{{ t('guardrails.rateLimits') }}</h3>
        <p class="kg-sub">{{ t('guardrails.rateLimitsBody') }}</p>
        <div v-if="limitedKeys.length" class="kg-keys">
          <div v-for="k in limitedKeys" :key="k.id" class="kg-key">
            <div class="kg-key__name">{{ k.name }}</div>
            <div class="kg-key__windows">
              <div v-for="w in keyWindows(k)" :key="w.label" class="kg-kw">
                <div><span class="kg-kw__label">{{ w.label }}</span><span class="kg-kw__val">{{ fmtTok(w.used) }} / {{ fmtTok(w.limit) }}</span></div>
                <div class="kg-bar kg-bar--sm"><span class="kg-fill" :style="{ width: Math.min(100, w.limit ? (w.used / w.limit) * 100 : 0) + '%' }"></span></div>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="kg-note">{{ t('guardrails.noRateLimits') }}</p>
      </div>

      <!-- Allowed groups -->
      <div class="ko-card kg-card">
        <h3 class="kg-h3">{{ t('guardrails.allowedGroups') }}</h3>
        <div v-if="groups.length" class="kg-groups">
          <span v-for="g in groups" :key="g.id" class="ko-badge ko-badge--brand">{{ g.name }}</span>
        </div>
        <p v-else class="kg-note">{{ t('usage.noUsageRecords') }}</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { kitIcons as icons } from './icons'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { getSubscriptionsProgress } from '@/api/subscriptions'
import { keysAPI } from '@/api/keys'
import { userGroupsAPI } from '@/api/groups'
import type { ApiKey, Group } from '@/types'

const { t } = useI18n()
const loading = ref(true)
const progress = ref<any>(null)
const keys = ref<ApiKey[]>([])
const groups = ref<Group[]>([])

const spendWindows = computed(() => {
  const p = progress.value
  if (!p) return [] as { key: string; label: string; w: any }[]
  return [
    { key: 'daily', label: t('pro.daily'), w: p.daily },
    { key: 'weekly', label: t('pro.weekly'), w: p.weekly },
    { key: 'monthly', label: t('pro.monthly'), w: p.monthly },
  ].filter((x) => x.w)
})

const limitedKeys = computed(() =>
  keys.value.filter((k) => (k.rate_limit_5h || 0) > 0 || (k.rate_limit_1d || 0) > 0 || (k.rate_limit_7d || 0) > 0)
)
function keyWindows(k: ApiKey) {
  const out: { label: string; used: number; limit: number }[] = []
  if (k.rate_limit_5h > 0) out.push({ label: '5h', used: k.usage_5h || 0, limit: k.rate_limit_5h })
  if (k.rate_limit_1d > 0) out.push({ label: '24h', used: k.usage_1d || 0, limit: k.rate_limit_1d })
  if (k.rate_limit_7d > 0) out.push({ label: '7d', used: k.usage_7d || 0, limit: k.rate_limit_7d })
  return out
}
function fmtTok(n: number) {
  return n >= 1e9 ? (n / 1e9).toFixed(1) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : `${Math.round(n)}`
}

onMounted(async () => {
  try {
    const list: any[] = await getSubscriptionsProgress()
    const item = (list || []).find((x) => x?.progress) || (list || [])[0]
    progress.value = item?.progress || null
  } catch (e) {
    console.error('Failed to load subscription progress:', e)
  }
  try {
    const res = await keysAPI.list(1, 100)
    keys.value = res.items || []
  } catch (e) {
    console.error('Failed to load keys:', e)
  }
  try {
    groups.value = await userGroupsAPI.getAvailable()
  } catch (e) {
    console.error('Failed to load groups:', e)
  }
  loading.value = false
})
</script>

<style scoped>
.kg {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.kg-loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}
.kg-card {
  padding: 20px;
}
.kg-h3 {
  font: var(--weight-semibold) var(--text-md) var(--font-sans);
  color: var(--text-strong);
  margin-bottom: 14px;
}
.kg-sub {
  font: var(--text-sm) var(--font-sans);
  color: var(--text-muted);
  margin: -8px 0 14px;
}
.kg-note {
  font: var(--text-sm) var(--font-sans);
  color: var(--text-faint);
  margin: 0;
}
.kg-limits {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}
.kg-limit__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.kg-limit__label {
  font: var(--weight-semibold) var(--text-xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-faint);
}
.kg-limit__val {
  font: var(--weight-bold) var(--text-sm) var(--font-mono);
  color: var(--text-strong);
}
.kg-limit__cap {
  color: var(--text-faint);
  font-weight: var(--weight-medium);
}
.kg-bar {
  height: 6px;
  border-radius: 3px;
  background: var(--warm-100);
  overflow: hidden;
}
.kg-bar--sm {
  height: 5px;
  margin-top: 4px;
}
.kg-fill {
  display: block;
  height: 100%;
  background: var(--grad-brand);
  border-radius: 3px;
}
.kg-keys {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.kg-key {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.kg-key + .kg-key {
  border-top: 1px solid var(--border-subtle);
  padding-top: 16px;
}
.kg-key__name {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
}
.kg-key__windows {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 14px;
}
.kg-kw__label {
  font: var(--weight-bold) var(--text-2xs, 11px) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-faint);
  margin-right: 6px;
}
.kg-kw__val {
  font: var(--weight-semibold) var(--text-xs) var(--font-mono);
  color: var(--text-strong);
}
.kg-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
