<template>
  <KitMarketingShell active="pricing">
    <div class="kp-wrap">
      <div class="kp-hero">
        <span class="ko-badge ko-badge--brand"><span class="ko-badge__dot"></span>No markup · cancel anytime</span>
        <h1 class="kp-title">Simple, usage-based pricing</h1>
        <p class="kp-sub">Start free and pay only for the tokens you use. Add the Team plan when you need more.</p>
      </div>

      <!-- Plans (real subscription packages when signed in) -->
      <div class="kp-plans">
        <div
          v-for="p in plans"
          :key="p.name"
          class="ko-card kp-plan"
          :class="{ 'kp-plan--featured': p.featured }"
        >
          <span v-if="p.featured" class="ko-badge ko-badge--solid kp-plan__tag">Most popular</span>
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
        <h2 class="kp-h2">Team billing rule</h2>
        <p class="kp-lead">Usage on the Team plan is metered per token, modeled on Claude's pricing.</p>
        <div class="ko-card kp-rule__card">
          <div v-for="r in rule" :key="r.k" class="kp-rule__row">
            <span class="kp-rule__k">{{ r.k }}</span>
            <span class="kp-rule__v">{{ r.v }}</span>
          </div>
        </div>
      </div>

      <!-- Per-token table (Team Claude-style rates) -->
      <div class="kp-tokens">
        <h2 class="kp-h2">Per-token rates</h2>
        <p class="kp-lead">What the Team plan charges per model. Prices per million tokens.</p>
        <div class="ko-card kp-table">
          <div class="kp-table__head">
            <span>Model</span><span>Context</span><span>Input / M</span><span>Output / M</span>
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
        <h2 class="kp-h2 kp-h2--center">Questions</h2>
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
import '@/styles/kit-components.css'
import KitMarketingShell from '@/components/kit/KitMarketingShell.vue'
import { kitIcons as icons } from '@/components/kit/icons'
import { paymentAPI } from '@/api/payment'

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
const authed = ref(false)

onMounted(async () => {
  try {
    const data = await paymentAPI.getPlans()
    realPlans.value = Array.isArray(data) ? data : ((data as any)?.data ?? [])
    authed.value = true
  } catch {
    authed.value = false
  }
})

const plans = computed<PlanCard[]>(() => {
  const buyTo = authed.value ? '/purchase' : '/login'
  const payg: PlanCard = {
    name: 'Pay as you go', price: '$0', note: '/ month', featured: false,
    cta: 'Start free', to: authed.value ? '/dashboard' : '/login',
    feats: ['Only pay for tokens used', 'All available models', '1 workspace', 'Community support'],
  }
  const enterprise: PlanCard = {
    name: 'Enterprise', price: 'Custom', note: '', featured: false, cta: 'Talk to us', to: '/docs',
    feats: ['SSO & SCIM', 'Dedicated capacity', 'SLA & support', 'Custom data policies'],
  }
  const mid: PlanCard[] = realPlans.value.length
    ? realPlans.value.map((p) => ({
        name: p.name,
        price: `$${Number(p.price).toFixed(p.price % 1 ? 2 : 0)}`,
        note: `/ ${p.validity_days} ${p.validity_unit}${p.validity_days > 1 ? 's' : ''}`,
        original: p.original_price ? `$${Number(p.original_price).toFixed(0)}` : undefined,
        desc: p.description || undefined,
        featured: true,
        cta: `Start ${p.name}`,
        feats: String(p.features || '').split('\n').map((s) => s.trim()).filter(Boolean),
        to: buyTo,
      }))
    : [{
        name: 'Team', price: '$20', note: '/ 30 days', original: '$40', featured: true, cta: 'Start Team', to: buyTo,
        desc: 'For growing teams. One key for every Claude model, billed Claude-style per token.',
        feats: ['Everything in Pay as you go', 'Claude-style per-token billing', 'Cache read 0.1× · write 1.25×/2×', 'Long-context tiered pricing', 'Priority routing'],
      }]
  return [payg, ...mid, enterprise]
})

// The Claude-style billing rule attached to the Team package.
const rule = [
  { k: 'Input / output tokens', v: "Per token at each model's rate (e.g. Opus $5 / $25 per 1M)" },
  { k: 'Cache write', v: '1.25× input (5-min TTL) · 2× input (1-hour TTL)' },
  { k: 'Cache read', v: '0.1× input' },
  { k: 'Batch requests', v: '0.5× (50% off)' },
  { k: 'Long context (>200K)', v: 'Premium tier (≈2× input/output)' },
]

// Seeded Team per-token rates (Claude-modeled).
const teamRates = [
  { name: 'Claude Opus 4.8', provider: 'anthropic', context: '≤200K · >200K 2×', priceIn: '$5.00', priceOut: '$25.00' },
  { name: 'Claude Sonnet 4.6', provider: 'anthropic', context: '1M', priceIn: '$3.00', priceOut: '$15.00' },
  { name: 'Claude Haiku 4.5', provider: 'anthropic', context: '200K', priceIn: '$1.00', priceOut: '$5.00' },
]

const faqs = [
  { q: 'How does Team billing work?', a: 'A fixed $20 / 30-day subscription unlocks the Team group; usage is then metered per token using the Claude-style rule above, drawn from your balance.' },
  { q: 'Is there a markup on tokens?', a: 'The per-token rates mirror Claude\'s own pricing — input/output plus cache and long-context tiers. No hidden per-token margin.' },
  { q: 'What happens if a provider goes down?', a: 'With fallback routing on, requests re-route to the next healthy upstream for that model automatically.' },
  { q: 'Can I set spend limits?', a: 'Yes — per-group daily/weekly/monthly USD caps, low-balance alerts, and an optional hard stop.' },
]
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
