<template>
  <div class="kh">
    <!-- Greeting -->
    <div class="kh-greet">
      <span class="kh-avatar">AL</span>
      <div class="kh-greet__text">
        <h1 class="kh-h1">Welcome back, Ada</h1>
        <p class="kh-lead">Here's what's happening across your workspace today.</p>
      </div>
      <button class="ko-btn ko-btn--primary" @click="$emit('nav', 'playground')">
        <component :is="icons.Chat" :size="16" /> Open playground
      </button>
    </div>

    <!-- Stats -->
    <div class="kh-stats">
      <KitStatTile label="Balance" value="$48.20" accent sub="≈ 16M tokens left" />
      <KitStatTile label="Spend · 30d" value="$182.40" :trend="{ dir: 'up', value: '12%' }" />
      <KitStatTile label="Requests · 30d" value="48.2K" :trend="{ dir: 'up', value: '8%' }" />
      <KitStatTile label="Avg latency" value="640ms" sub="p50 across models" />
    </div>

    <div class="kh-grid">
      <!-- Left column -->
      <div class="kh-col">
        <!-- Spend chart -->
        <div class="ko-card">
          <div class="kh-card-head">
            <span class="kh-card-title">Daily spend · 14 days</span>
            <span class="ko-badge ko-badge--brand">$182.40 this month</span>
          </div>
          <div class="kh-bars">
            <div
              v-for="(h, i) in bars"
              :key="i"
              class="kh-bar"
              :class="{ 'kh-bar--last': i === bars.length - 1 }"
              :style="{ height: h + '%' }"
            ></div>
          </div>
        </div>

        <!-- Recent requests -->
        <div>
          <div class="kh-section-head">
            <h3 class="kh-h3">Recent requests</h3>
            <button class="kh-link" @click="$emit('nav', 'usage')">View all</button>
          </div>
          <div class="ko-card kh-flush">
            <div v-for="(a, i) in activity" :key="i" class="kh-act" :class="{ 'kh-act--bd': i > 0 }">
              <span class="kh-dot" :style="{ background: a.ok ? 'var(--success)' : 'var(--danger)' }"></span>
              <div class="kh-act__id">
                <div class="kh-act__model">{{ a.model }}</div>
                <div class="kh-act__when">{{ a.when }} · {{ a.tok }} tokens</div>
              </div>
              <span class="kh-act__cost">{{ a.cost }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="kh-col">
        <!-- Your models -->
        <div>
          <div class="kh-section-head">
            <h3 class="kh-h3">Your models</h3>
            <button class="kh-link" @click="$emit('nav', 'catalog')">Browse</button>
          </div>
          <div class="ko-card kh-flush">
            <div
              v-for="(m, i) in models"
              :key="m.provider"
              class="kh-model"
              :class="{ 'kh-model--bd': i > 0 }"
              @click="$emit('open', m)"
            >
              <KitModelAvatar :model="m.name" :size="34" radius="var(--radius-sm)" />
              <div class="kh-model__id">
                <div class="kh-model__name">{{ m.name }}</div>
                <div class="kh-model__provider">{{ m.provider }}</div>
              </div>
              <span class="kh-model__arrow"><component :is="icons.Arrow" :size="15" /></span>
            </div>
          </div>
        </div>

        <!-- System status -->
        <div class="ko-card kh-status">
          <div class="kh-status__head">
            <span class="kh-card-title">System status</span>
            <span class="ko-badge ko-badge--success"><span class="ko-badge__dot"></span>All systems go</span>
          </div>
          <div v-for="row in status" :key="row.k" class="kh-status__row">
            <span class="kh-status__k">{{ row.k }}</span>
            <span class="kh-status__v" :style="{ color: row.v === 'Operational' ? 'var(--success)' : 'var(--warning)' }">{{ row.v }}</span>
          </div>
        </div>

        <!-- Quickstart -->
        <div class="ko-card kh-quick">
          <div class="kh-quick__title">Make a request</div>
          <KitCodeBlock lang="bash" :code="quickCode" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import KitStatTile from './KitStatTile.vue'
import KitCodeBlock from './KitCodeBlock.vue'
import KitModelAvatar from './KitModelAvatar.vue'
import { kitIcons as icons } from './icons'
import { KIT_MODELS, type KitModel } from './models'

defineEmits<{ (e: 'open', model: KitModel): void; (e: 'nav', tab: string): void }>()

const models = KIT_MODELS.slice(0, 4)
const bars = [42, 55, 48, 63, 59, 71, 66, 80, 74, 88, 82, 70, 94, 86]
const activity = [
  { model: 'anthropic/claude-opus', when: '2 min ago', tok: '1.2K', cost: '$0.018', ok: true },
  { model: 'openai/gpt-5', when: '14 min ago', tok: '3.4K', cost: '$0.034', ok: true },
  { model: 'meta/llama-4-70b', when: '1 hr ago', tok: '12.0K', cost: '$0.005', ok: true },
  { model: 'deepseek/r1', when: '3 hr ago', tok: '800', cost: '$0.002', ok: false },
]
const status = [
  { k: 'Routing', v: 'Operational' },
  { k: 'Anthropic', v: 'Operational' },
  { k: 'DeepSeek', v: 'Degraded' },
]
const quickCode = `curl https://api.kissopen.com/v1/chat \\
  -H "Authorization: Bearer $KO_KEY" \\
  -d '{"model":"anthropic/claude-opus"}'`
</script>

<style scoped>
.kh {
  max-width: 1080px;
  margin: 0 auto;
}
.kh-greet {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
}
.kh-avatar {
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
.kh-greet__text {
  flex: 1;
  min-width: 0;
}
.kh-h1 {
  font: var(--weight-bold) var(--text-3xl) var(--font-sans);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.kh-lead {
  font: var(--type-body);
  color: var(--text-muted);
  margin-top: 2px;
}
.kh-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}
.kh-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}
.kh-col {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
@media (max-width: 900px) {
  .kh-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .kh-grid {
    grid-template-columns: 1fr;
  }
}
.kh-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.kh-card-title {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
}
.kh-bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 120px;
}
.kh-bar {
  flex: 1;
  border-radius: 5px 5px 2px 2px;
  background: var(--coral-200);
}
.kh-bar--last {
  background: var(--grad-brand);
}
.kh-section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.kh-h3 {
  font: var(--weight-semibold) var(--text-xl) var(--font-sans);
  color: var(--text-strong);
}
.kh-link {
  background: none;
  border: none;
  cursor: pointer;
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-link);
}
.kh-flush {
  padding: 0;
  overflow: hidden;
}
.kh-act {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
}
.kh-act--bd {
  border-top: 1px solid var(--border-subtle);
}
.kh-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.kh-act__id {
  min-width: 0;
}
.kh-act__model {
  font: var(--text-sm) var(--font-mono);
  color: var(--text-body);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.kh-act__when {
  font: var(--text-2xs) var(--font-sans);
  color: var(--text-faint);
}
.kh-act__cost {
  font: var(--weight-semibold) var(--text-sm) var(--font-mono);
  color: var(--text-strong);
}
.kh-model {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out);
}
.kh-model:hover {
  background: var(--surface-hover);
}
.kh-model--bd {
  border-top: 1px solid var(--border-subtle);
}
.kh-model__id {
  flex: 1;
  min-width: 0;
}
.kh-model__name {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
}
.kh-model__provider {
  font: var(--text-2xs) var(--font-mono);
  color: var(--text-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.kh-model__arrow {
  color: var(--text-faint);
  display: inline-flex;
}
.kh-status {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.kh-status__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.kh-status__row {
  display: flex;
  justify-content: space-between;
  font: var(--text-sm) var(--font-sans);
}
.kh-status__k {
  color: var(--text-muted);
}
.kh-status__v {
  font-weight: 600;
}
.kh-quick {
  min-width: 0;
}
.kh-quick__title {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
  margin-bottom: 10px;
}
</style>
