<template>
  <AppLayout>
    <div class="gp">
      <div class="gp-head">
        <h1 class="gp-title">{{ t('pro.title') }}</h1>
        <p class="gp-sub">{{ t('pro.sub') }}</p>
      </div>

      <!-- Current subscription (套餐 + 用量) -->
      <div class="card gp-current">
        <div v-if="loading" class="gp-current__loading"><LoadingSpinner /></div>
        <template v-else-if="activeSub">
          <div class="gp-current__top">
            <span class="ko-badge ko-badge--success"><span class="ko-badge__dot"></span>{{ t('pro.active') }}</span>
            <span class="gp-current__name">{{ activeSub.group?.name || t('pro.yourPlan') }}</span>
          </div>
          <!-- Plan limits & usage (weekly / monthly windows) -->
          <div v-if="limitWindows.length" class="gp-limits">
            <div v-for="lw in limitWindows" :key="lw.key" class="gp-limit">
              <div class="gp-limit__top">
                <span class="gp-limit__label">{{ lw.label }}</span>
                <span class="gp-limit__val">
                  ${{ (lw.w!.used_usd || 0).toFixed(2) }}<span class="gp-limit__cap"> / {{ lw.w!.limit_usd != null ? '$' + lw.w!.limit_usd : t('pro.unlimited') }}</span>
                </span>
              </div>
              <div class="gp-limit__bar"><span class="gp-limit__fill" :style="{ width: Math.min(100, lw.w!.percentage || 0) + '%' }"></span></div>
              <div v-if="lw.w!.resets_in_seconds != null" class="gp-limit__reset">{{ t('pro.resetsIn') }} {{ resetLabel(lw.w!.resets_in_seconds) }}</div>
            </div>
          </div>
          <div v-else class="gp-current__stats">
            <div class="gp-stat">
              <span class="gp-stat__l">{{ t('pro.usageThisMonth') }}</span>
              <span class="gp-stat__v">${{ (activeSub.monthly_usage_usd || 0).toFixed(2) }}</span>
            </div>
            <div class="gp-stat">
              <span class="gp-stat__l">{{ t('pro.usageThisWeek') }}</span>
              <span class="gp-stat__v">${{ (activeSub.weekly_usage_usd || 0).toFixed(2) }}</span>
            </div>
            <div class="gp-stat">
              <span class="gp-stat__l">{{ t('pro.renews') }}</span>
              <span class="gp-stat__v gp-stat__v--sm">{{ activeSub.expires_at ? fmtDate(activeSub.expires_at) : t('pro.never') }}</span>
            </div>
          </div>
          <div class="gp-current__foot">
            <span v-if="activeSub.expires_at" class="gp-current__renew">{{ t('pro.renews') }}: {{ fmtDate(activeSub.expires_at) }}</span>
            <router-link to="/subscriptions" class="gp-current__link">{{ t('pro.manage') }} →</router-link>
          </div>
        </template>
        <template v-else>
          <div class="gp-current__top">
            <span class="ko-badge ko-badge--mono">{{ t('pro.free') }}</span>
            <span class="gp-current__name">{{ t('pro.payg') }}</span>
          </div>
          <p class="gp-current__hint">{{ t('pro.upgradeHint') }}</p>
        </template>
      </div>

      <!-- Plans -->
      <div v-if="!loading && plans.length" class="gp-plans">
        <div v-for="p in plans" :key="p.id" class="card gp-plan gp-plan--featured">
          <span class="ko-badge ko-badge--solid gp-plan__tag">{{ t('pro.recommended') }}</span>
          <h3 class="gp-plan__name">{{ p.name }}</h3>
          <div class="gp-plan__price">
            <span class="gp-plan__amount">${{ fmtPrice(p.price) }}</span>
            <span class="gp-plan__note">/ {{ p.validity_days }} {{ p.validity_unit }}{{ p.validity_days > 1 ? 's' : '' }}</span>
            <span v-if="p.original_price" class="gp-plan__strike">${{ fmtPrice(p.original_price) }}</span>
          </div>
          <p v-if="p.description" class="gp-plan__desc">{{ p.description }}</p>
          <div class="gp-plan__feats">
            <div v-for="f in featList(p.features)" :key="f" class="gp-plan__feat">
              <span class="gp-check"><component :is="icons.Check" :size="16" /></span>{{ f }}
            </div>
          </div>
          <router-link :to="`/purchase?plan_id=${p.id}`" class="ko-btn ko-btn--gradient ko-btn--block">
            {{ t('pro.subscribe') }} <component :is="icons.Arrow" :size="16" />
          </router-link>
        </div>
      </div>
      <div v-else-if="!loading" class="gp-empty">{{ t('pro.noPlans') }}</div>

      <!-- Billing rule (Claude-style) -->
      <div class="gp-rule">
        <h2 class="gp-h2">{{ t('pro.billingRule') }}</h2>
        <p class="gp-lead">{{ t('pro.billingRuleSub') }}</p>
        <div class="card gp-rule__card">
          <div v-for="r in rule" :key="r.k" class="gp-rule__row">
            <span class="gp-rule__k">{{ r.k }}</span>
            <span class="gp-rule__v">{{ r.v }}</span>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { kitIcons as icons } from '@/components/kit/icons'
import { paymentAPI } from '@/api/payment'
import { getActiveSubscriptions, getSubscriptionsProgress } from '@/api/subscriptions'
import type { UserSubscription } from '@/types'

interface Window { used_usd: number; limit_usd: number | null; percentage: number; resets_in_seconds: number | null }

const { t } = useI18n()
const loading = ref(true)
const plans = ref<any[]>([])
const activeSub = ref<UserSubscription | null>(null)
const progress = ref<any>(null)

const limitWindows = computed(() => {
  const p = progress.value
  if (!p) return []
  return [
    { key: 'daily', label: t('pro.daily'), w: p.daily as Window | null },
    { key: 'weekly', label: t('pro.weekly'), w: p.weekly as Window | null },
    { key: 'monthly', label: t('pro.monthly'), w: p.monthly as Window | null },
  ].filter((x) => x.w)
})
function resetLabel(seconds: number | null) {
  if (seconds == null) return ''
  const h = Math.floor(seconds / 3600)
  if (h >= 24) return `${Math.floor(h / 24)}d`
  if (h >= 1) return `${h}h`
  return `${Math.max(1, Math.floor(seconds / 60))}m`
}

const rule = [
  { k: t('pro.ruleInOut'), v: t('pro.ruleInOutV') },
  { k: t('pro.ruleCacheWrite'), v: '1.25× input (5-min) · 2× input (1-hour)' },
  { k: t('pro.ruleCacheRead'), v: '0.1× input' },
  { k: t('pro.ruleBatch'), v: '0.5× (flex tier)' },
  { k: t('pro.ruleLongCtx'), v: t('pro.ruleLongCtxV') },
]

function fmtPrice(n: number) {
  return Number(n).toFixed(n % 1 ? 2 : 0)
}
function fmtDate(s: string) {
  const d = new Date(s)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function featList(features: string) {
  return String(features || '').split('\n').map((x) => x.trim()).filter(Boolean)
}

onMounted(async () => {
  try {
    const res: any = await paymentAPI.getPlans()
    plans.value = Array.isArray(res) ? res : (res?.data ?? [])
  } catch (e) {
    console.error('Failed to load plans:', e)
  }
  try {
    const subs = await getActiveSubscriptions()
    activeSub.value = (subs || []).find((s) => s.status === 'active') || null
    if (activeSub.value) {
      try {
        const list: any[] = await getSubscriptionsProgress()
        const item = (list || []).find((x) => x?.progress?.id === activeSub.value!.id) || (list || [])[0]
        progress.value = item?.progress || null
      } catch (e) {
        console.error('Failed to load subscription progress:', e)
      }
    }
  } catch (e) {
    console.error('Failed to load subscriptions:', e)
  }
  loading.value = false
})
</script>

<style scoped>
.gp {
  max-width: 900px;
  margin: 0 auto;
}
.gp-head {
  margin-bottom: 20px;
}
.gp-title {
  font: var(--weight-extra) var(--text-3xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.gp-sub {
  font: var(--type-body);
  color: var(--text-muted);
  margin-top: 4px;
}
.gp-current {
  padding: 20px;
  margin-bottom: 22px;
}
.gp-current__loading {
  display: flex;
  justify-content: center;
  padding: 16px;
}
.gp-current__top {
  display: flex;
  align-items: center;
  gap: 12px;
}
.gp-current__name {
  font: var(--weight-bold) var(--text-lg) var(--font-sans);
  color: var(--text-strong);
  text-transform: capitalize;
}
.gp-current__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin: 16px 0 6px;
}
.gp-stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.gp-stat__l {
  font: var(--weight-semibold) var(--text-2xs, 11px) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-faint);
}
.gp-stat__v {
  font: var(--weight-extra) var(--text-xl) var(--font-mono);
  color: var(--text-strong);
}
.gp-stat__v--sm {
  font-size: var(--text-md);
}
.gp-limits {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin: 16px 0 14px;
}
.gp-limit__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.gp-limit__label {
  font: var(--weight-semibold) var(--text-xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-faint);
}
.gp-limit__val {
  font: var(--weight-bold) var(--text-sm) var(--font-mono);
  color: var(--text-strong);
}
.gp-limit__cap {
  color: var(--text-faint);
  font-weight: var(--weight-medium);
}
.gp-limit__bar {
  height: 6px;
  border-radius: 3px;
  background: var(--warm-100);
  overflow: hidden;
}
.gp-limit__fill {
  display: block;
  height: 100%;
  background: var(--grad-brand);
  border-radius: 3px;
}
.gp-limit__reset {
  font: var(--text-2xs, 11px) var(--font-sans);
  color: var(--text-faint);
  margin-top: 5px;
}
.gp-current__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.gp-current__renew {
  font: var(--text-sm) var(--font-sans);
  color: var(--text-muted);
}
.gp-current__link {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--brand);
  text-decoration: none;
}
.gp-current__hint {
  font: var(--type-body);
  color: var(--text-muted);
  margin: 8px 0 0;
}
.gp-plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 8px;
}
.gp-plan {
  position: relative;
  padding: 22px;
}
.gp-plan--featured {
  border-color: var(--coral-300);
  box-shadow: var(--shadow-lg);
}
.gp-plan__tag {
  position: absolute;
  top: -11px;
  left: 20px;
}
.gp-plan__name {
  font: var(--weight-semibold) var(--text-xl) var(--font-sans);
  color: var(--text-strong);
}
.gp-plan__price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 10px 0 12px;
  flex-wrap: wrap;
}
.gp-plan__amount {
  font: var(--weight-extra) var(--text-3xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.gp-plan__note {
  font: var(--text-sm) var(--font-sans);
  color: var(--text-faint);
}
.gp-plan__strike {
  font: var(--text-sm) var(--font-mono);
  color: var(--text-faint);
  text-decoration: line-through;
}
.gp-plan__desc {
  font: var(--text-sm)/1.5 var(--font-sans);
  color: var(--text-muted);
  margin: 0 0 16px;
}
.gp-plan__feats {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 22px;
}
.gp-plan__feat {
  display: flex;
  gap: 9px;
  align-items: flex-start;
  font: var(--text-sm) var(--font-sans);
  color: var(--text-body);
}
.gp-check {
  color: var(--success);
  display: inline-flex;
  flex: none;
  margin-top: 1px;
}
.gp-empty {
  padding: 32px;
  text-align: center;
  color: var(--text-faint);
}
.gp-rule {
  margin-top: 40px;
}
.gp-h2 {
  font: var(--weight-bold) var(--text-xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.gp-lead {
  font: var(--type-body);
  color: var(--text-muted);
  margin: 6px 0 18px;
}
.gp-rule__card {
  padding: 4px 0;
}
.gp-rule__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 20px;
}
.gp-rule__row + .gp-rule__row {
  border-top: 1px solid var(--border-subtle);
}
.gp-rule__k {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
  flex: none;
}
.gp-rule__v {
  font: var(--text-sm) var(--font-mono);
  color: var(--text-muted);
  text-align: right;
}
</style>
