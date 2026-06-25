<template>
  <div class="kit-credits">
    <h1 class="kit-h1">Credits</h1>

    <div class="kit-credits__top">
      <!-- Balance + buy -->
      <div class="ko-card kit-buy">
        <div class="kit-buy__label">Current balance</div>
        <div class="kit-buy__balance">{{ balance }}</div>
        <div class="kit-buy__add">Add credits</div>
        <div class="kit-buy__presets">
          <button
            v-for="pr in presets"
            :key="pr"
            class="ko-btn kit-preset"
            :class="{ 'kit-preset--on': amount === pr }"
            @click="amount = pr"
          >
            ${{ pr }}
          </button>
        </div>
        <button class="ko-btn ko-btn--primary ko-btn--block">
          <component :is="icons.Wallet" :size="16" /> Add ${{ amount }}.00
        </button>
      </div>

      <!-- Spend stats -->
      <div class="kit-credits__stats">
        <KitStatTile label="Spent · 30d" value="$182.40" :trend="{ dir: 'up', value: '12%' }" sub="vs $162.80 prior" />
        <KitStatTile label="Auto-reload" value="Off" sub="Reload $25 when below $5" />
      </div>
    </div>

    <div class="ko-alert ko-alert--info">
      <span class="ko-alert__icon"><component :is="icons.Sparkle" :size="20" /></span>
      <div>
        <div class="ko-alert__title">How billing works</div>
        <div class="ko-alert__body">
          Credits are prepaid and used across every model and provider. You're billed on native token
          counts — no markup on provider prices.
        </div>
      </div>
    </div>

    <h3 class="kit-h3">Transactions</h3>
    <div class="ko-card kit-txns">
      <div v-for="(tx, i) in txns" :key="i" class="kit-txn" :class="{ 'kit-txn--bd': i > 0 }">
        <span class="kit-txn__icon" :class="tx.pos ? 'kit-txn__icon--pos' : 'kit-txn__icon--neg'">
          <component :is="tx.pos ? icons.Plus : icons.Bolt" :size="16" />
        </span>
        <div class="kit-txn__body">
          <div class="kit-txn__t">{{ tx.t }}</div>
          <div class="kit-txn__d">{{ tx.d }}</div>
        </div>
        <span class="kit-txn__amt" :class="{ 'kit-txn__amt--pos': tx.pos }">{{ tx.amt }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import KitStatTile from './KitStatTile.vue'
import { kitIcons as icons } from './icons'

withDefaults(defineProps<{ balance?: string }>(), { balance: '$48.20' })

const amount = ref(25)
const presets = [10, 25, 50, 100]
const txns = [
  { t: 'Credit purchase', d: 'Mar 30 · Visa •••• 4242', amt: '+$50.00', pos: true },
  { t: 'Usage · claude-opus', d: 'Mar 29 · 12.4M tokens', amt: '−$37.60', pos: false },
  { t: 'Usage · gpt-5', d: 'Mar 28 · 8.1M tokens', amt: '−$20.10', pos: false },
  { t: 'Credit purchase', d: 'Mar 22 · Visa •••• 4242', amt: '+$100.00', pos: true },
  { t: 'Usage · llama-4-70b', d: 'Mar 21 · 60.2M tokens', amt: '−$21.40', pos: false },
]
</script>

<style scoped>
.kit-credits {
  max-width: 880px;
  margin: 0 auto;
}
.kit-h1 {
  font: var(--weight-bold) var(--text-3xl) var(--font-sans);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
  color: var(--text-strong);
  margin-bottom: 18px;
}
.kit-credits__top {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 18px;
  margin-bottom: 22px;
}
.kit-buy {
  background: var(--grad-brand-soft);
  border-color: var(--coral-200);
}
.kit-buy__label {
  font: var(--weight-semibold) var(--text-2xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--coral-700);
}
.kit-buy__balance {
  font: var(--weight-extra) var(--text-4xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
  margin: 4px 0 16px;
}
.kit-buy__add {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
  margin-bottom: 9px;
}
.kit-buy__presets {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.kit-preset {
  flex: 1;
  height: 42px;
  background: var(--surface-card);
  color: var(--text-strong);
  border: 1px solid var(--border-default);
}
.kit-preset--on {
  background: var(--brand);
  color: #fff;
  border-color: transparent;
}
.kit-credits__stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.kit-h3 {
  font: var(--weight-semibold) var(--text-xl) var(--font-sans);
  color: var(--text-strong);
  margin: 26px 0 12px;
}
.kit-txns {
  padding: 0;
  overflow: hidden;
}
.kit-txn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
}
.kit-txn--bd {
  border-top: 1px solid var(--border-subtle);
}
.kit-txn__icon {
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
.kit-txn__icon--pos {
  background: var(--success-bg);
  color: var(--green-600);
}
.kit-txn__body {
  flex: 1;
}
.kit-txn__t {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
}
.kit-txn__d {
  font: var(--text-xs) var(--font-sans);
  color: var(--text-faint);
}
.kit-txn__amt {
  font: var(--weight-semibold) var(--text-sm) var(--font-mono);
  color: var(--text-strong);
}
.kit-txn__amt--pos {
  color: var(--green-600);
}
</style>
