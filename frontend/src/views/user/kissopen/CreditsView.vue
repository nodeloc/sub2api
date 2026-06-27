<template>
  <AppLayout>
    <div class="kc">
      <h1 class="kc-h1">{{ t('credits.title') }}</h1>

      <div class="kc-top">
        <!-- Balance + add -->
        <div class="card kc-buy">
          <div class="kc-buy__label">{{ t('credits.currentBalance') }}</div>
          <div class="kc-buy__balance">${{ balance }}</div>

          <p v-if="balanceDisabled" class="kc-buy__disabled">{{ t('credits.rechargeDisabled') }}</p>
          <template v-else>
            <div class="kc-buy__add">{{ t('credits.addCredits') }}</div>
            <div class="kc-buy__presets">
              <button
                v-for="pr in presets"
                :key="pr"
                class="ko-btn kc-preset"
                :class="{ 'kc-preset--on': payAmount === pr }"
                @click="payAmount = pr"
              >
                ${{ pr }}
              </button>
            </div>

            <!-- Custom amount -->
            <div class="kc-buy__custom">
              <span class="kc-buy__cur">$</span>
              <input
                v-model.number="payAmount"
                type="number"
                min="0"
                inputmode="decimal"
                class="kc-buy__custom-input"
                :placeholder="t('credits.customPlaceholder')"
                :aria-label="t('credits.customAmount')"
              />
            </div>
            <p v-if="amountError" class="kc-buy__err">{{ amountError }}</p>

            <!-- Payment method -->
            <div v-if="payMethods.length" class="kc-buy__methods">
              <div class="kc-buy__methods-label">{{ t('payment.paymentMethod') }}</div>
              <div class="kc-methods">
                <button
                  v-for="m in payMethods"
                  :key="m.type"
                  type="button"
                  class="kc-method"
                  :class="{ 'kc-method--on': selectedMethod === m.type, 'kc-method--off': !m.available }"
                  :disabled="!m.available"
                  @click="m.available && (selectedMethod = m.type)"
                >
                  <img :src="methodIcon(m.type)" :alt="t(`payment.methods.${m.type}`)" class="kc-method__icon" />
                  <span class="kc-method__text">
                    <span class="kc-method__name">{{ t(`payment.methods.${m.type}`) }}</span>
                    <span v-if="m.fee_rate > 0" class="kc-method__fee">{{ t('payment.fee') }} {{ m.fee_rate }}%</span>
                  </span>
                </button>
              </div>
            </div>

            <!-- Fee / credited summary -->
            <div v-if="validAmount > 0 && (feeRate > 0 || balanceRechargeMultiplier !== 1)" class="kc-buy__summary">
              <div v-if="feeRate > 0" class="kc-buy__sum-row">
                <span>{{ t('payment.fee') }} ({{ feeRate }}%)</span>
                <span>{{ formatAmount(feeAmount) }}</span>
              </div>
              <div v-if="feeRate > 0" class="kc-buy__sum-row kc-buy__sum-row--total">
                <span>{{ t('payment.actualPay') }}</span>
                <span>{{ formatAmount(totalAmount) }}</span>
              </div>
              <div v-if="balanceRechargeMultiplier !== 1" class="kc-buy__sum-row">
                <span>{{ t('credits.creditedAfter') }}</span>
                <span>${{ creditedAmount.toFixed(2) }}</span>
              </div>
            </div>

            <button
              class="ko-btn ko-btn--primary ko-btn--block kc-buy__pay"
              :disabled="!canSubmit || paying"
              @click="submitRecharge"
            >
              <component :is="icons.Wallet" :size="16" />
              {{ paying ? t('common.processing') : t('credits.add', { n: payAmount || 0 }) }}
            </button>
          </template>

          <button type="button" class="kc-buy__redeem" @click="openRedeem">{{ t('credits.redeemCode') }} →</button>
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

      <!-- Subscription (Go Pro / plan) -->
      <div class="card kc-sub">
        <div class="kc-sub__head">
          <div>
            <div class="kc-sub__label">{{ t('credits.subscription') }}</div>
            <div v-if="activeSub" class="kc-sub__plan">{{ activeSub.group?.name || t('pro.yourPlan') }}</div>
            <div v-else class="kc-sub__plan kc-sub__plan--none">{{ t('credits.noSubscription') }}</div>
          </div>
          <router-link to="/pro" class="ko-btn ko-btn--primary ko-btn--sm">
            {{ activeSub ? t('pro.manage') : t('pro.title') }}
          </router-link>
        </div>
        <div v-if="activeSub && limitWindows.length" class="kc-sub__limits">
          <div v-for="lw in limitWindows" :key="lw.key" class="kc-sub__limit">
            <div class="kc-sub__limit-top">
              <span class="kc-sub__limit-label">{{ lw.label }}</span>
              <span class="kc-sub__limit-val">
                ${{ (lw.w.used_usd || 0).toFixed(2) }}<span class="kc-sub__limit-cap"> / {{ lw.w.limit_usd != null ? '$' + lw.w.limit_usd : t('pro.unlimited') }}</span>
              </span>
            </div>
            <div class="kc-sub__bar"><span class="kc-sub__fill" :style="{ width: Math.min(100, lw.w.percentage || 0) + '%' }"></span></div>
          </div>
        </div>
        <p v-else-if="!activeSub" class="kc-sub__cta">{{ t('pro.sub') }}</p>
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

    <!-- Redeem code modal -->
    <Teleport to="body">
      <transition name="kc-fade">
        <div v-if="showRedeem" class="kc-modal-bk" @click="closeRedeem">
          <div class="kc-modal" role="dialog" aria-modal="true" @click.stop>
            <div class="kc-modal__head">
              <h3 class="kc-modal__title">{{ t('credits.redeemCode') }}</h3>
              <button class="ko-iconbtn ko-iconbtn--outline" :aria-label="t('common.close')" @click="closeRedeem">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <p class="kc-modal__sub">{{ t('credits.redeemSub') }}</p>
            <input
              ref="redeemInput"
              v-model="redeemCode"
              class="ko-input ko-input--mono kc-modal__input"
              :placeholder="t('credits.redeemPlaceholder')"
              :disabled="redeeming"
              @keyup.enter="doRedeem"
            />
            <div v-if="redeemError" class="kc-modal__msg kc-modal__msg--err">{{ redeemError }}</div>
            <div v-if="redeemSuccess" class="kc-modal__msg kc-modal__msg--ok">{{ redeemSuccess }}</div>
            <div class="kc-modal__actions">
              <button class="ko-btn ko-btn--secondary" @click="closeRedeem">{{ t('common.cancel') }}</button>
              <button class="ko-btn ko-btn--primary" :disabled="redeeming || !redeemCode.trim()" @click="doRedeem">
                {{ redeeming ? t('credits.redeeming') : t('credits.redeemSubmit') }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Payment (QR / status) modal -->
    <Teleport to="body">
      <transition name="kc-fade">
        <div v-if="paymentPhase === 'paying'" class="kc-modal-bk" @click.self="resetPayment">
          <div class="kc-pay-modal" role="dialog" aria-modal="true">
            <div class="kc-modal__head">
              <h3 class="kc-modal__title">{{ t('credits.payTitle') }}</h3>
              <button class="ko-iconbtn ko-iconbtn--outline" :aria-label="t('common.close')" @click="resetPayment">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <PaymentStatusPanel
              :order-id="paymentState.orderId"
              :qr-code="paymentState.qrCode"
              :expires-at="paymentState.expiresAt"
              :payment-type="paymentState.paymentType"
              :pay-url="paymentState.payUrl"
              :order-type="paymentState.orderType"
              :currency="paymentState.currency || selectedCurrency"
              @done="handlePaymentDone"
              @success="handlePaymentSuccess"
              @settled="onPaymentSettled"
            />
          </div>
        </div>
      </transition>
    </Teleport>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { kitIcons as icons } from '@/components/kit/icons'
import PaymentStatusPanel from '@/components/payment/PaymentStatusPanel.vue'
import { METHOD_ORDER } from '@/components/payment/providerConfig'
import alipayIcon from '@/assets/icons/alipay.svg'
import wxpayIcon from '@/assets/icons/wxpay.svg'
import stripeIcon from '@/assets/icons/stripe.svg'
import airwallexIcon from '@/assets/icons/airwallex.svg'
import { paymentAPI } from '@/api/payment'
import { getDashboardStats } from '@/api/usage'
import type { UserDashboardStats } from '@/api/usage'
import redeemAPI from '@/api/redeem'
import { getActiveSubscriptions, getSubscriptionsProgress } from '@/api/subscriptions'
import type { UserSubscription } from '@/types'
import { useRechargeFlow } from '@/composables/useRechargeFlow'

const { t, te } = useI18n()
const authStore = useAuthStore()
function statusLabel(s: string) {
  const k = 'credits.status.' + s
  return te(k) ? t(k) : s
}
const presets = [10, 25, 50, 100]
const loading = ref(true)
const stats = ref<UserDashboardStats | null>(null)

// Inline recharge flow (presets + custom amount + payment method + pay)
const {
  amount: payAmount,
  selectedMethod,
  paymentPhase,
  paymentState,
  balanceDisabled,
  methodOptions,
  feeRate,
  feeAmount,
  totalAmount,
  validAmount,
  balanceRechargeMultiplier,
  creditedAmount,
  amountError,
  canSubmit,
  submitting: paying,
  selectedCurrency,
  formatAmount,
  init: initRecharge,
  submitRecharge,
  resetPayment,
  onPaymentDone,
  onPaymentSuccess,
  onPaymentSettled,
} = useRechargeFlow()

function handlePaymentSuccess() {
  onPaymentSuccess(() => {
    authStore.refreshUser().catch(() => {})
    void loadData()
  })
}
function handlePaymentDone() {
  onPaymentDone()
  authStore.refreshUser().catch(() => {})
  void loadData()
}

// Payment methods, kissopen-styled (sorted by canonical order)
const METHOD_ICONS: Record<string, string> = {
  alipay: alipayIcon,
  wxpay: wxpayIcon,
  stripe: stripeIcon,
  airwallex: airwallexIcon,
}
function methodIcon(type: string): string {
  if (type.includes('alipay')) return METHOD_ICONS.alipay
  if (type.includes('wxpay')) return METHOD_ICONS.wxpay
  if (type === 'airwallex') return METHOD_ICONS.airwallex
  return METHOD_ICONS[type] || alipayIcon
}
const payMethods = computed(() => {
  const order: readonly string[] = METHOD_ORDER
  return [...methodOptions.value].sort((a, b) => {
    const ai = order.indexOf(a.type)
    const bi = order.indexOf(b.type)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })
})

// Subscription (Go Pro)
interface LimitWin { used_usd: number; limit_usd: number | null; percentage: number; resets_in_seconds: number | null }
const activeSub = ref<UserSubscription | null>(null)
const subProgress = ref<{ daily?: LimitWin | null; weekly?: LimitWin | null; monthly?: LimitWin | null } | null>(null)
type LimitRow = { key: string; label: string; w: LimitWin }
const limitWindows = computed<LimitRow[]>(() => {
  const p = subProgress.value
  if (!p) return []
  return [
    { key: 'daily', label: t('pro.daily'), w: p.daily ?? null },
    { key: 'weekly', label: t('pro.weekly'), w: p.weekly ?? null },
    { key: 'monthly', label: t('pro.monthly'), w: p.monthly ?? null },
  ].filter((x): x is LimitRow => x.w != null)
})
async function loadSubscription() {
  try {
    const subs = await getActiveSubscriptions()
    activeSub.value = (subs || []).find((s) => s.status === 'active') || null
    if (activeSub.value) {
      const list = (await getSubscriptionsProgress()) as unknown as Array<{ progress?: { id?: number; daily?: LimitWin | null; weekly?: LimitWin | null; monthly?: LimitWin | null } }>
      const item = (list || []).find((x) => x?.progress?.id === activeSub.value!.id) || (list || [])[0]
      subProgress.value = item?.progress || null
    }
  } catch (e) {
    console.error('Failed to load subscription:', e)
  }
}

// Redeem-code modal
const showRedeem = ref(false)
const redeemCode = ref('')
const redeeming = ref(false)
const redeemError = ref('')
const redeemSuccess = ref('')
const redeemInput = ref<HTMLInputElement | null>(null)

function openRedeem() {
  redeemError.value = ''
  redeemSuccess.value = ''
  redeemCode.value = ''
  showRedeem.value = true
  nextTick(() => redeemInput.value?.focus())
}
function closeRedeem() {
  showRedeem.value = false
}
async function doRedeem() {
  const code = redeemCode.value.trim()
  if (!code || redeeming.value) return
  redeeming.value = true
  redeemError.value = ''
  redeemSuccess.value = ''
  try {
    const r = await redeemAPI.redeem(code)
    redeemSuccess.value = t('credits.redeemSuccess', { v: Number(r.value).toFixed(2) })
    redeemCode.value = ''
    await authStore.refreshUser().catch(() => {})
    await loadData()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } }; message?: string }
    redeemError.value = err?.response?.data?.message || err?.message || t('credits.redeemFailed')
  } finally {
    redeeming.value = false
  }
}

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

async function loadData() {
  void loadSubscription()
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
}

onMounted(() => {
  payAmount.value = 25
  void initRecharge()
  void loadData()
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
  width: 100%;
  text-align: center;
  margin-top: 12px;
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--coral-700);
  text-decoration: none;
}
.kc-buy__redeem:hover {
  color: var(--coral-800, var(--coral-700));
  text-decoration: underline;
}
.kc-buy__disabled {
  font: var(--weight-medium) var(--text-sm) var(--font-sans);
  color: var(--text-muted);
  margin: 14px 0 4px;
}
.kc-buy__custom {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 42px;
  padding: 0 13px;
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  margin-bottom: 12px;
  transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
}
.kc-buy__custom:focus-within {
  border-color: var(--border-focus);
  box-shadow: var(--ring-focus);
}
.kc-buy__cur {
  font: var(--weight-semibold) var(--text-base) var(--font-sans);
  color: var(--text-faint);
}
.kc-buy__custom-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: none;
  outline: none;
  font: var(--weight-semibold) var(--text-base) var(--font-sans);
  color: var(--text-strong);
}
.kc-buy__custom-input::placeholder {
  font-weight: var(--weight-medium);
  color: var(--text-faint);
}
.kc-buy__err {
  font: var(--weight-medium) var(--text-xs) var(--font-sans);
  color: var(--danger, #d64545);
  margin: -4px 0 12px;
}
.kc-buy__methods {
  margin-bottom: 12px;
}
.kc-buy__methods-label {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
  margin-bottom: 8px;
}
.kc-methods {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.kc-method {
  display: flex;
  align-items: center;
  gap: 9px;
  height: 52px;
  padding: 0 12px;
  background: var(--surface-card);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  transition: border-color var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) var(--ease-out),
    background var(--dur-fast) var(--ease-out);
}
.kc-method:hover {
  border-color: var(--border-strong);
}
.kc-method--on {
  border-color: var(--brand);
  background: var(--coral-50);
  box-shadow: var(--shadow-xs);
}
.kc-method--off {
  opacity: 0.45;
  cursor: not-allowed;
}
.kc-method__icon {
  width: 24px;
  height: 24px;
  flex: none;
  object-fit: contain;
}
.kc-method__text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.kc-method__name {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
}
.kc-method__fee {
  font: var(--weight-medium) var(--text-2xs) var(--font-sans);
  color: var(--text-faint);
}
.kc-buy__summary {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  margin-bottom: 12px;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}
.kc-buy__sum-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font: var(--text-sm) var(--font-sans);
  color: var(--text-muted);
}
.kc-buy__sum-row--total {
  padding-top: 6px;
  border-top: 1px solid var(--border-subtle);
  font-weight: var(--weight-semibold);
  color: var(--text-strong);
}
.kc-buy__pay {
  margin-top: 2px;
}
.kc-pay-modal {
  width: min(460px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg, 14px);
  box-shadow: 0 20px 50px rgba(20, 12, 10, 0.2);
  padding: 22px;
}

/* redeem modal */
.kc-modal-bk {
  position: fixed;
  inset: 0;
  background: rgba(20, 12, 10, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 70;
}
.kc-modal {
  width: min(420px, 100%);
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg, 14px);
  box-shadow: 0 20px 50px rgba(20, 12, 10, 0.2);
  padding: 22px;
}
.kc-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}
.kc-modal__title {
  font: var(--weight-bold) var(--text-lg) var(--font-sans);
  color: var(--text-strong);
}
.kc-modal__sub {
  font: var(--text-sm) var(--font-sans);
  color: var(--text-muted);
  margin-bottom: 14px;
}
.kc-modal__input {
  width: 100%;
  margin-bottom: 12px;
}
.kc-modal__msg {
  font: var(--weight-medium) var(--text-sm) var(--font-sans);
  padding: 8px 11px;
  border-radius: var(--radius-md);
  margin-bottom: 12px;
}
.kc-modal__msg--err {
  color: var(--danger, #d64545);
  background: rgba(214, 69, 69, 0.1);
}
.kc-modal__msg--ok {
  color: var(--success, #2f9e6e);
  background: rgba(47, 158, 110, 0.12);
}
.kc-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.kc-fade-enter-active,
.kc-fade-leave-active {
  transition: opacity var(--dur-fast) var(--ease-out);
}
.kc-fade-enter-from,
.kc-fade-leave-to {
  opacity: 0;
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
.kc-sub {
  padding: 18px 20px;
  margin-bottom: 14px;
}
.kc-sub__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}
.kc-sub__label {
  font: var(--weight-semibold) var(--text-2xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-faint);
}
.kc-sub__plan {
  font: var(--weight-extra) var(--text-xl) var(--font-sans);
  color: var(--text-strong);
  margin-top: 3px;
}
.kc-sub__plan--none {
  font: var(--weight-semibold) var(--text-base) var(--font-sans);
  color: var(--text-muted);
}
.kc-sub__cta {
  font: var(--text-sm) var(--font-sans);
  color: var(--text-muted);
  margin-top: 10px;
  max-width: 540px;
}
.kc-sub__limits {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
}
.kc-sub__limit-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.kc-sub__limit-label {
  font: var(--weight-semibold) var(--text-2xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--text-faint);
}
.kc-sub__limit-val {
  font: var(--weight-semibold) var(--text-xs) var(--font-mono);
  color: var(--text-strong);
}
.kc-sub__limit-cap {
  color: var(--text-faint);
  font-weight: var(--weight-medium);
}
.kc-sub__bar {
  height: 7px;
  border-radius: var(--radius-pill);
  background: var(--warm-200);
  overflow: hidden;
}
.kc-sub__fill {
  display: block;
  height: 100%;
  background: var(--grad-brand);
}
@media (max-width: 640px) {
  .kc-sub__limits {
    grid-template-columns: 1fr;
  }
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
