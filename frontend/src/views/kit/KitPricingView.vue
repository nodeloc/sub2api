<template>
  <KitMarketingShell active="pricing">
    <div class="kp-wrap">
      <div class="kp-hero">
        <span class="ko-badge ko-badge--brand"><span class="ko-badge__dot"></span>{{ t('marketing.pricing.heroBadge') }}</span>
        <h1 class="kp-title">{{ t('marketing.pricing.heroTitle') }}</h1>
        <p class="kp-sub">{{ t('marketing.pricing.heroSub') }}</p>
      </div>

      <!-- Plans (real subscription packages when signed in) -->
      <div class="kp-plans">
        <div
          v-for="p in plans"
          :key="p.name"
          class="ko-card kp-plan"
          :class="{ 'kp-plan--featured': p.featured }"
        >
          <span v-if="p.featured" class="ko-badge ko-badge--solid kp-plan__tag">{{ t('marketing.pricing.mostPopular') }}</span>
          <h3 class="kp-plan__name">{{ p.name }}</h3>
          <div class="kp-plan__price">
            <span class="kp-plan__amount">{{ p.price }}</span>
            <span class="kp-plan__note">{{ p.note }}</span>
            <span v-if="p.original" class="kp-plan__strike">{{ p.original }}</span>
          </div>
          <p v-if="p.desc" class="kp-plan__desc">{{ p.desc }}</p>
          <div class="kp-plan__feats">
            <div v-for="f in p.feats" :key="f" class="kp-plan__feat">
              <span class="kp-check"><component :is="icons.Check" :size="16" /></span>{{ f }}
            </div>
          </div>
          <router-link :to="p.to" class="ko-btn ko-btn--block" :class="p.featured ? 'ko-btn--gradient' : 'ko-btn--secondary'">{{ p.cta }}</router-link>
        </div>
      </div>

      <!-- Billing rule (Claude-style) -->
      <div class="kp-rule">
        <h2 class="kp-h2">{{ t('marketing.pricing.ruleHead') }}</h2>
        <p class="kp-lead">{{ t('marketing.pricing.ruleLead') }}</p>
        <div class="ko-card kp-rule__card">
          <div v-for="r in rule" :key="r.k" class="kp-rule__row">
            <span class="kp-rule__k">{{ r.k }}</span>
            <span class="kp-rule__v">{{ r.v }}</span>
          </div>
        </div>
      </div>

      <!-- Per-token table (Team Claude-style rates) -->
      <div class="kp-tokens">
        <h2 class="kp-h2">{{ t('marketing.pricing.tokensHead') }}</h2>
        <p class="kp-lead">{{ t('marketing.pricing.tokensLead') }}</p>
        <div class="ko-card kp-table">
          <div class="kp-table__head">
            <span>{{ t('marketing.pricing.thModel') }}</span><span>{{ t('marketing.pricing.thContext') }}</span><span>{{ t('marketing.pricing.thInput') }}</span><span>{{ t('marketing.pricing.thOutput') }}</span>
          </div>
          <div v-for="m in teamRates" :key="m.name" class="kp-table__row">
            <div>
              <div class="kp-table__model">{{ m.name }}</div>
              <div class="kp-table__provider">{{ m.provider }}</div>
            </div>
            <span class="kp-table__ctx">{{ m.context }}</span>
            <span class="kp-table__price">{{ m.priceIn }}</span>
            <span class="kp-table__price">{{ m.priceOut }}</span>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div class="kp-faq">
        <h2 class="kp-h2 kp-h2--center">{{ t('marketing.pricing.faqHead') }}</h2>
        <div class="kp-faq__list">
          <div v-for="q in faqs" :key="q.q" class="ko-card">
            <div class="kp-faq__q">{{ q.q }}</div>
            <p class="kp-faq__a">{{ q.a }}</p>
          </div>
        </div>
      </div>
    </div>
  </KitMarketingShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import '@/styles/kit-components.css'
import KitMarketingShell from '@/components/kit/KitMarketingShell.vue'
import { kitIcons as icons } from '@/components/kit/icons'
import { paymentAPI } from '@/api/payment'
import { useAuthStore } from '@/stores'

const { t } = useI18n()
const authStore = useAuthStore()

interface PlanCard {
  name: string
  price: string
  note: string
  original?: string
  desc?: string
  featured: boolean
  cta: string
  feats: string[]
  to: string
}

const realPlans = ref<any[]>([])
const authed = computed(() => authStore.isAuthenticated)

onMounted(async () => {
  try {
    const data = await paymentAPI.getPlans()
    realPlans.value = Array.isArray(data) ? data : ((data as any)?.data ?? [])
  } catch {
    // not signed in or plans unavailable — fall back to the static Team card
  }
})

const plans = computed<PlanCard[]>(() => {
  const buyTo = authed.value ? '/purchase' : '/login'
  const payg: PlanCard = {
    name: t('marketing.pricing.paygName'), price: '$0', note: t('marketing.pricing.paygNote'), featured: false,
    cta: t('marketing.pricing.startFree'), to: authed.value ? '/dashboard' : '/login',
    feats: t('marketing.pricing.paygFeats').split('\n'),
  }
  const enterprise: PlanCard = {
    name: t('marketing.pricing.enterpriseName'), price: t('marketing.pricing.enterprisePrice'), note: '', featured: false,
    cta: t('marketing.pricing.talkToUs'), to: '/docs',
    feats: t('marketing.pricing.enterpriseFeats').split('\n'),
  }
  const mid: PlanCard[] = realPlans.value.length
    ? realPlans.value.map((p) => ({
        name: p.name,
        price: `$${Number(p.price).toFixed(p.price % 1 ? 2 : 0)}`,
        note: `/ ${p.validity_days} ${p.validity_unit}${p.validity_days > 1 ? 's' : ''}`,
        original: p.original_price ? `$${Number(p.original_price).toFixed(0)}` : undefined,
        desc: p.description || undefined,
        featured: true,
        cta: t('marketing.pricing.startPlan', { name: p.name }),
        feats: String(p.features || '').split('\n').map((s) => s.trim()).filter(Boolean),
        to: buyTo,
      }))
    : [{
        name: t('marketing.pricing.teamName'), price: '$20', note: t('marketing.pricing.teamNote'), original: '$40',
        featured: true, cta: t('marketing.pricing.teamCta'), to: buyTo,
        desc: t('marketing.pricing.teamDesc'),
        feats: t('marketing.pricing.teamFeats').split('\n'),
      }]
  return [payg, ...mid, enterprise]
})

// The Claude-style billing rule attached to the Team package.
const rule = computed(() => [
  { k: t('marketing.pricing.ruleInOutK'), v: t('marketing.pricing.ruleInOutV') },
  { k: t('marketing.pricing.ruleCacheWriteK'), v: t('marketing.pricing.ruleCacheWriteV') },
  { k: t('marketing.pricing.ruleCacheReadK'), v: t('marketing.pricing.ruleCacheReadV') },
  { k: t('marketing.pricing.ruleBatchK'), v: t('marketing.pricing.ruleBatchV') },
  { k: t('marketing.pricing.ruleLongK'), v: t('marketing.pricing.ruleLongV') },
])

// Seeded Team per-token rates (Claude-modeled) — model data, not localized.
const teamRates = [
  { name: 'Claude Opus 4.8', provider: 'anthropic', context: '≤200K · >200K 2×', priceIn: '$5.00', priceOut: '$25.00' },
  { name: 'Claude Sonnet 4.6', provider: 'anthropic', context: '1M', priceIn: '$3.00', priceOut: '$15.00' },
  { name: 'Claude Haiku 4.5', provider: 'anthropic', context: '200K', priceIn: '$1.00', priceOut: '$5.00' },
]

const faqs = computed(() => [
  { q: t('marketing.pricing.faq1Q'), a: t('marketing.pricing.faq1A') },
  { q: t('marketing.pricing.faq2Q'), a: t('marketing.pricing.faq2A') },
  { q: t('marketing.pricing.faq3Q'), a: t('marketing.pricing.faq3A') },
  { q: t('marketing.pricing.faq4Q'), a: t('marketing.pricing.faq4A') },
])
</script>

<style scoped>
.kp-wrap {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 72px 28px 90px;
}
.kp-hero {
  text-align: center;
}
.kp-title {
  font: var(--weight-extra) var(--text-4xl) var(--font-sans);
  letter-spacing: -0.03em;
  margin: 18px 0 10px;
  color: var(--text-strong);
}
.kp-sub {
  font: var(--text-md) var(--font-sans);
  color: var(--text-muted);
  max-width: 520px;
  margin: 0 auto;
}
.kp-plans {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
  align-items: start;
  margin-top: 40px;
}
.kp-plan {
  position: relative;
}
.kp-plan--featured {
  border-color: var(--coral-300);
  box-shadow: var(--shadow-lg);
}
.kp-plan__tag {
  position: absolute;
  top: -11px;
  left: 20px;
}
.kp-plan__name {
  font: var(--weight-semibold) var(--text-xl) var(--font-sans);
  color: var(--text-strong);
}
.kp-plan__price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 10px 0 12px;
  flex-wrap: wrap;
}
.kp-plan__amount {
  font: var(--weight-extra) var(--text-3xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.kp-plan__note {
  font: var(--text-sm) var(--font-sans);
  color: var(--text-faint);
}
.kp-plan__strike {
  font: var(--text-sm) var(--font-mono);
  color: var(--text-faint);
  text-decoration: line-through;
}
.kp-plan__desc {
  font: var(--text-sm)/1.5 var(--font-sans);
  color: var(--text-muted);
  margin: 0 0 16px;
}
.kp-plan__feats {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 22px;
}
.kp-plan__feat {
  display: flex;
  gap: 9px;
  align-items: flex-start;
  font: var(--text-sm) var(--font-sans);
  color: var(--text-body);
}
.kp-check {
  color: var(--success);
  display: inline-flex;
  flex: none;
  margin-top: 1px;
}
.kp-rule {
  margin-top: 64px;
}
.kp-rule__card {
  max-width: 720px;
  margin: 0 auto;
  padding: 6px 0;
}
.kp-rule__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 22px;
}
.kp-rule__row + .kp-rule__row {
  border-top: 1px solid var(--border-subtle);
}
.kp-rule__k {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
  flex: none;
}
.kp-rule__v {
  font: var(--text-sm) var(--font-mono);
  color: var(--text-muted);
  text-align: right;
}
.kp-tokens {
  margin-top: 56px;
}
.kp-h2 {
  font: var(--weight-bold) var(--text-2xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
  text-align: center;
}
.kp-h2--center {
  text-align: center;
}
.kp-lead {
  font: var(--type-body);
  color: var(--text-muted);
  text-align: center;
  margin: 8px 0 28px;
}
.kp-table {
  padding: 0;
  overflow: hidden;
  max-width: 880px;
  margin: 0 auto;
}
.kp-table__head {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 10px;
  padding: 13px 20px;
  border-bottom: 1px solid var(--border-subtle);
  font: var(--weight-bold) var(--text-2xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-faint);
}
.kp-table__row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--border-subtle);
  align-items: center;
}
.kp-table__model {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
}
.kp-table__provider {
  font: var(--text-xs) var(--font-mono);
  color: var(--text-faint);
  text-transform: capitalize;
}
.kp-table__ctx {
  font: var(--text-sm) var(--font-mono);
  color: var(--text-muted);
}
.kp-table__price {
  font: var(--weight-semibold) var(--text-sm) var(--font-mono);
  color: var(--text-strong);
}
.kp-faq {
  max-width: 720px;
  margin: 64px auto 0;
}
.kp-faq__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 28px;
}
.kp-faq__q {
  font: var(--weight-bold) var(--text-md) var(--font-sans);
  color: var(--text-strong);
  margin-bottom: 6px;
}
.kp-faq__a {
  font: var(--text-sm)/1.6 var(--font-sans);
  color: var(--text-muted);
  margin: 0;
}
</style>
