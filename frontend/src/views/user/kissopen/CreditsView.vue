<template>
  <AppLayout>
    <div class="kc">
      <h1 class="kc-h1">{{ t('credits.title') }}</h1>

      <div class="kc-top">
        <!-- Balance + add -->
        <div class="card kc-buy">
          <div class="kc-buy__label">{{ t('credits.currentBalance') }}</div>
          <div class="kc-buy__balance">${{ balance }}</div>
          <div class="kc-buy__add">{{ t('credits.addCredits') }}</div>
          <div class="kc-buy__presets">
            <button
              v-for="pr in presets"
              :key="pr"
              class="ko-btn kc-preset"
              :class="{ 'kc-preset--on': amount === pr }"
              @click="amount = pr"
            >
              ${{ pr }}
            </button>
          </div>
          <router-link :to="`/purchase?amount=${amount}`" class="ko-btn ko-btn--primary ko-btn--block">
            <component :is="icons.Wallet" :size="16" /> {{ t('credits.add', { n: amount }) }}
          </router-link>
          <router-link to="/redeem" class="kc-buy__redeem">{{ t('credits.redeemCode') }} →</router-link>
        </div>

        <!-- Spend stats (real) -->
        <div class="kc-stats">
          <div class="card kc-stat">
            <div class="kc-stat__label">{{ t('credits.spentTotal') }}</div>
            <div class="kc-stat__value">${{ fmt(stats?.total_actual_cost) }}</div>
            <div class="kc-stat__sub">{{ stats?.total_requests ?? 0 }} {{ t('usage.totalRequests') }}</div>
          </div>
          <div class="card kc-stat">
            <div class="kc-stat__label">{{ t('credits.today') }}</div>
            <div class="kc-stat__value">${{ fmt(stats?.today_actual_cost) }}</div>
            <div class="kc-stat__sub">{{ stats?.today_requests ?? 0 }} {{ t('usage.totalRequests') }}</div>
          </div>
        </div>
      </div>

      <div class="ko-alert ko-alert--info kc-info">
        <span class="ko-alert__icon"><component :is="icons.Sparkle" :size="20" /></span>
        <div>
          <div class="ko-alert__title">{{ t('credits.howBilling') }}</div>
          <div class="ko-alert__body">{{ t('credits.howBillingBody') }}</div>
        </div>
      </div>

      <h3 class="kc-h3">{{ t('credits.transactions') }}</h3>
      <div class="card kc-txns">
        <div v-if="loading" class="kc-empty"><LoadingSpinner /></div>
        <template v-else>
          <div v-for="(tx, i) in txns" :key="tx.key" class="kc-txn" :class="{ 'kc-txn--bd': i > 0 }">
            <span class="kc-txn__icon kc-txn__icon--pos">
              <component :is="icons.Plus" :size="16" />
            </span>
            <div class="kc-txn__body">
              <div class="kc-txn__t">{{ tx.title }}</div>
              <div class="kc-txn__d">{{ tx.date }}<span v-if="tx.status"> · {{ tx.status }}</span></div>
            </div>
            <span class="kc-txn__amt kc-txn__amt--pos">{{ tx.amt }}</span>
          </div>
          <div v-if="!txns.length" class="kc-empty">{{ t('credits.none') }}</div>
        </template>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { kitIcons as icons } from '@/components/kit/icons'
import { paymentAPI } from '@/api/payment'
import { getDashboardStats } from '@/api/usage'
import type { UserDashboardStats } from '@/api/usage'
import redeemAPI from '@/api/redeem'

const { t, te } = useI18n()
const authStore = useAuthStore()
function statusLabel(s: string) {
  const k = 'credits.status.' + s
  return te(k) ? t(k) : s
}
const presets = [10, 25, 50, 100]
const amount = ref(25)
const loading = ref(true)
const stats = ref<UserDashboardStats | null>(null)

interface Txn { key: string; title: string; date: string; amt: string; status?: string; ts: number }
const txnsRaw = ref<Txn[]>([])
const txns = computed(() => [...txnsRaw.value].sort((a, b) => b.ts - a.ts).slice(0, 30))

const balance = computed(() =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(authStore.user?.balance ?? 0)
)
function fmt(n: number | undefined) {
  return (n ?? 0).toFixed(2)
}
function fmtDate(s?: string) {
  if (!s) return ''
  const d = new Date(s)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

onMounted(async () => {
  try {
    stats.value = await getDashboardStats()
  } catch (e) {
    console.error('Failed to load stats:', e)
  }
  const list: Txn[] = []
  try {
    const res: any = await paymentAPI.getMyOrders({ page_size: 50 })
    const orders: any[] = res?.data?.items || res?.data || []
    for (const o of orders) {
      const isSub = o.order_type === 'subscription'
      list.push({
        key: 'o' + o.id,
        title: isSub ? t('credits.subscription') : t('credits.creditPurchase'),
        date: fmtDate(o.paid_at || o.created_at),
        amt: `+$${Number(o.amount).toFixed(2)}`,
        status: statusLabel(o.status),
        ts: new Date(o.paid_at || o.created_at).getTime(),
      })
    }
  } catch (e) {
    console.error('Failed to load orders:', e)
  }
  try {
    const history: any[] = (await redeemAPI.getHistory()) || []
    for (const h of history) {
      list.push({
        key: 'r' + h.id,
        title: t('credits.redeem'),
        date: fmtDate(h.used_at || h.created_at),
        amt: `+$${Number(h.value).toFixed(2)}`,
        ts: new Date(h.used_at || h.created_at).getTime(),
      })
    }
  } catch (e) {
    console.error('Failed to load redeem history:', e)
  }
  txnsRaw.value = list
  loading.value = false
})
</script>

<style scoped>
.kc {
  max-width: 880px;
  margin: 0 auto;
}
.kc-h1 {
  font: var(--weight-extra) var(--text-3xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
  margin-bottom: 18px;
}
.kc-top {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 18px;
  margin-bottom: 22px;
}
@media (max-width: 760px) {
  .kc-top {
    grid-template-columns: 1fr;
  }
}
.kc-buy {
  background: var(--grad-brand-soft);
  border-color: var(--coral-200);
  padding: 20px;
}
.kc-buy__label {
  font: var(--weight-semibold) var(--text-2xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--coral-700);
}
.kc-buy__balance {
  font: var(--weight-extra) var(--text-4xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
  margin: 4px 0 16px;
}
.kc-buy__add {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
  margin-bottom: 9px;
}
.kc-buy__presets {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.kc-preset {
  flex: 1;
  height: 42px;
  background: var(--surface-card);
  color: var(--text-strong);
  border: 1px solid var(--border-default);
}
.kc-preset--on {
  background: var(--brand);
  color: #fff;
  border-color: transparent;
}
.kc-buy__redeem {
  display: block;
  text-align: center;
  margin-top: 12px;
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--coral-700);
  text-decoration: none;
}
.kc-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.kc-stat {
  padding: 18px;
}
.kc-stat__label {
  font: var(--weight-semibold) var(--text-2xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-faint);
}
.kc-stat__value {
  font: var(--weight-extra) var(--text-2xl) var(--font-mono);
  color: var(--text-strong);
  margin: 6px 0 2px;
}
.kc-stat__sub {
  font: var(--text-xs) var(--font-sans);
  color: var(--text-muted);
}
.kc-info {
  margin-bottom: 6px;
}
.kc-h3 {
  font: var(--weight-semibold) var(--text-xl) var(--font-sans);
  color: var(--text-strong);
  margin: 26px 0 12px;
}
.kc-txns {
  padding: 0;
  overflow: hidden;
}
.kc-empty {
  padding: 28px;
  text-align: center;
  color: var(--text-faint);
  display: flex;
  justify-content: center;
}
.kc-txn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
}
.kc-txn--bd {
  border-top: 1px solid var(--border-subtle);
}
.kc-txn__icon {
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--warm-100);
  color: var(--text-muted);
}
.kc-txn__icon--pos {
  background: var(--success-bg, rgba(47, 158, 110, 0.12));
  color: var(--success, #2f9e6e);
}
.kc-txn__body {
  flex: 1;
  min-width: 0;
}
.kc-txn__t {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
}
.kc-txn__d {
  font: var(--text-xs) var(--font-sans);
  color: var(--text-faint);
}
.kc-txn__amt {
  font: var(--weight-semibold) var(--text-sm) var(--font-mono);
  color: var(--text-strong);
}
.kc-txn__amt--pos {
  color: var(--success, #2f9e6e);
}
</style>
