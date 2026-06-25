<template>
  <div class="kit-detail">
    <button class="kit-detail__back" @click="$emit('back')">
      <span class="kit-detail__back-ic"><component :is="icons.Arrow" :size="15" /></span> Models
    </button>

    <!-- Header -->
    <div class="kit-detail__head">
      <KitModelAvatar :model="model.name" :size="56" radius="var(--radius-lg)" />
      <div class="kit-detail__head-main">
        <div class="kit-detail__title-row">
          <h1 class="kit-detail__title">{{ model.name }}</h1>
          <span class="ko-badge" :class="model.status === 'degraded' ? 'ko-badge--warning' : 'ko-badge--success'">
            <span class="ko-badge__dot"></span>{{ model.status }}
          </span>
        </div>
        <div class="kit-detail__provider">{{ model.provider }} · by {{ model.org }}</div>
        <p class="kit-detail__desc">{{ model.description }}</p>
      </div>
      <div class="kit-detail__actions">
        <button class="ko-btn ko-btn--secondary"><component :is="icons.Copy" :size="15" /> Compare</button>
        <button class="ko-btn ko-btn--primary" @click="$emit('chat')"><component :is="icons.Chat" :size="16" /> Chat</button>
      </div>
    </div>

    <!-- Quick stats -->
    <div class="ko-card kit-detail__stats">
      <div v-for="s in quickStats" :key="s.label" class="kit-detail__stat">
        <div class="kit-detail__stat-label">{{ s.label }}</div>
        <div class="kit-detail__stat-value">{{ s.value }}</div>
      </div>
    </div>

    <div class="kit-detail__tabs">
      <KitTabs v-model="tab" :items="tabs" />
    </div>

    <!-- Overview -->
    <div v-if="tab === 'overview'" class="kit-detail__overview">
      <div class="ko-card">
        <h3 class="kit-h3 kit-h3--mb">Capabilities</h3>
        <div class="kit-detail__caps">
          <span v-for="t in model.modalities" :key="t" class="ko-badge">{{ t }} in</span>
          <span v-for="t in model.tags" :key="t" class="ko-badge ko-badge--pink">{{ t }}</span>
        </div>
        <div class="kit-detail__facts">
          <div v-for="f in facts" :key="f[0]" class="kit-detail__fact">
            <span class="kit-detail__fact-k">{{ f[0] }}</span><span class="kit-detail__fact-v">{{ f[1] }}</span>
          </div>
        </div>
      </div>
      <div>
        <KitCodeBlock lang="python" :code="overviewCode" />
      </div>
    </div>

    <!-- Providers -->
    <div v-else-if="tab === 'providers'" class="ko-card kit-detail__table">
      <div class="kit-prov__head">
        <span>Provider</span><span>Context</span><span>Max out</span><span>Input/M</span><span>Output/M</span><span>Latency</span><span>Uptime</span>
      </div>
      <div v-for="(p, i) in model.providers" :key="p.name" class="kit-prov__row" :class="{ 'kit-prov__row--bd': i > 0 }">
        <span class="kit-prov__name">{{ p.name }}</span>
        <span class="kit-prov__mono kit-prov__muted">{{ p.ctx }}</span>
        <span class="kit-prov__mono kit-prov__muted">{{ p.maxOut }}</span>
        <span class="kit-prov__mono kit-prov__strong">{{ p.din }}</span>
        <span class="kit-prov__mono kit-prov__strong">{{ p.dout }}</span>
        <span class="kit-prov__mono kit-prov__muted">{{ p.lat }}</span>
        <span class="kit-prov__up">
          <span class="kit-prov__dot" :style="{ background: p.up > 99.9 ? 'var(--success)' : 'var(--warning)' }"></span>
          <span class="kit-prov__mono kit-prov__muted">{{ p.up }}%</span>
        </span>
      </div>
      <div class="kit-prov__foot">
        Auto-routes to the cheapest provider with no recent outages — or pin one with <code>provider.order</code>.
      </div>
    </div>

    <!-- Apps -->
    <div v-else-if="tab === 'apps'" class="kit-detail__apps">
      <div v-for="(a, i) in apps" :key="a.name" class="ko-card kit-app">
        <span class="kit-app__rank">{{ i + 1 }}</span>
        <span class="kit-app__icon"><component :is="icons.Bolt" :size="19" /></span>
        <div class="kit-app__body">
          <div class="kit-app__name">{{ a.name }}</div>
          <div class="kit-app__desc">{{ a.desc }}</div>
        </div>
        <span class="ko-badge ko-badge--mono">{{ a.tok }} tok/wk</span>
      </div>
    </div>

    <!-- Activity -->
    <div v-else-if="tab === 'activity'" class="ko-card">
      <div class="kit-act__head">
        <span class="kit-act__title">Tokens processed · 12 weeks</span>
        <span class="ko-badge ko-badge--brand">{{ model.tokensWeek }} this week · {{ model.trend }}</span>
      </div>
      <div class="kit-act__bars">
        <div v-for="(h, i) in actBars" :key="i" class="kit-act__bar" :class="{ 'kit-act__bar--last': i === actBars.length - 1 }" :style="{ height: h + '%' }"></div>
      </div>
    </div>

    <!-- Uptime -->
    <div v-else-if="tab === 'uptime'" class="kit-detail__uptime">
      <div v-for="p in model.providers" :key="p.name" class="ko-card">
        <div class="kit-up__head">
          <span class="kit-up__name">{{ p.name }}</span>
          <span class="kit-up__pct" :style="{ color: p.up > 99.9 ? 'var(--success)' : 'var(--warning)' }">{{ p.up }}% uptime</span>
        </div>
        <div class="kit-up__track">
          <div v-for="i in 60" :key="i" class="kit-up__seg" :class="{ 'kit-up__seg--bad': isBad(p.up, i - 1) }"></div>
        </div>
        <div class="kit-up__axis"><span>60 days ago</span><span>Today</span></div>
      </div>
    </div>

    <!-- API -->
    <div v-else class="kit-detail__api">
      <KitCodeBlock lang="bash" :code="curlCode" />
      <KitCodeBlock lang="typescript" :code="tsCode" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import KitTabs from './KitTabs.vue'
import KitCodeBlock from './KitCodeBlock.vue'
import KitModelAvatar from './KitModelAvatar.vue'
import { kitIcons as icons } from './icons'
import type { KitModel } from './models'

const props = defineProps<{ model: KitModel }>()
defineEmits<{ (e: 'back'): void; (e: 'chat'): void }>()

const tab = ref('overview')
const tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'providers', label: 'Providers' },
  { value: 'apps', label: 'Apps' },
  { value: 'activity', label: 'Activity' },
  { value: 'uptime', label: 'Uptime' },
  { value: 'api', label: 'API' },
]

const quickStats = computed(() => [
  { label: 'Context', value: props.model.context },
  { label: 'Input / M', value: props.model.priceIn },
  { label: 'Output / M', value: props.model.priceOut },
  { label: 'Tokens / wk', value: props.model.tokensWeek },
  { label: 'Latency', value: props.model.latency },
  { label: 'Throughput', value: props.model.throughput },
])
const facts = computed<[string, string][]>(() => [
  ['Categories', props.model.categories.join(', ')],
  ['Series', props.model.series],
  ['Max context', props.model.context],
  ['Providers', props.model.providersCount + ' serving'],
])

const apps = [
  { name: 'Cline', desc: 'Autonomous coding agent in your IDE', tok: '8.2B' },
  { name: 'Roo Code', desc: 'Agentic dev workflows', tok: '5.1B' },
  { name: 'SillyTavern', desc: 'Local-first chat frontend', tok: '3.4B' },
  { name: 'Kilo Code', desc: 'Everything for agentic development', tok: '2.0B' },
]
const actBars = [40, 52, 48, 63, 59, 71, 68, 80, 76, 88, 84, 95]

function isBad(up: number, i: number) {
  return (up < 99.9 && (i === 22 || i === 23)) || (up < 99.5 && i % 17 === 0)
}

const overviewCode = computed(
  () => `from openai import OpenAI

client = OpenAI(
  base_url="https://api.kissopen.com/v1",
  api_key="sk-ko-...",
)

r = client.chat.completions.create(
  model="${props.model.provider}",
  messages=[{"role":"user",
    "content":"Hello"}],
)`
)
const curlCode = computed(
  () => `curl https://api.kissopen.com/v1/chat/completions \\
  -H "Authorization: Bearer $KO_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${props.model.provider}",
    "messages": [{"role":"user","content":"Hi"}]
  }'`
)
const tsCode = computed(
  () => `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.kissopen.com/v1",
  apiKey: process.env.KO_KEY,
});

const r = await client.chat.completions.create({
  model: "${props.model.provider}",
  messages: [{ role: "user", content: "Hi" }],
});`
)
</script>

<style scoped>
.kit-detail {
  max-width: 980px;
  margin: 0 auto;
}
.kit-detail__back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font: var(--weight-medium) var(--text-sm) var(--font-sans);
  color: var(--text-muted);
  padding: 0;
  margin-bottom: 16px;
}
.kit-detail__back:hover {
  color: var(--text-strong);
}
.kit-detail__back-ic {
  display: inline-flex;
  transform: rotate(180deg);
}
.kit-detail__head {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}
.kit-detail__head-main {
  flex: 1;
}
.kit-detail__title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.kit-detail__title {
  font: var(--weight-bold) var(--text-3xl) var(--font-sans);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.kit-detail__provider {
  font: var(--text-sm) var(--font-mono);
  color: var(--text-faint);
  margin-top: 2px;
}
.kit-detail__desc {
  font: var(--type-body);
  color: var(--text-muted);
  margin: 12px 0 0;
  max-width: 640px;
}
.kit-detail__actions {
  display: flex;
  gap: 9px;
  flex: none;
}
.kit-detail__stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.kit-detail__stat {
  flex: 1;
  min-width: 100px;
}
.kit-detail__stat-label {
  font: var(--weight-semibold) var(--text-2xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-faint);
}
.kit-detail__stat-value {
  font: var(--weight-bold) var(--text-md) var(--font-mono);
  color: var(--text-strong);
  margin-top: 3px;
}
.kit-detail__tabs {
  margin-bottom: 20px;
  overflow-x: auto;
}
.kit-h3 {
  font: var(--weight-semibold) var(--text-xl) var(--font-sans);
  color: var(--text-strong);
}
.kit-h3--mb {
  margin-bottom: 12px;
}
.kit-detail__overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.kit-detail__caps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
.kit-detail__facts {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.kit-detail__fact {
  display: flex;
  justify-content: space-between;
  font: var(--text-sm) var(--font-sans);
  padding-bottom: 9px;
  border-bottom: 1px solid var(--border-subtle);
}
.kit-detail__fact-k {
  color: var(--text-faint);
}
.kit-detail__fact-v {
  color: var(--text-body);
  font-weight: 500;
}
.kit-detail__table {
  padding: 0;
  overflow: hidden;
}
.kit-prov__head {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr 0.8fr 0.9fr 0.9fr 0.8fr 0.9fr;
  gap: 10px;
  padding: 12px 18px;
  border-bottom: 1px solid var(--border-subtle);
  font: var(--weight-bold) var(--text-2xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-faint);
}
.kit-prov__row {
  display: grid;
  grid-template-columns: 1.4fr 0.8fr 0.8fr 0.9fr 0.9fr 0.8fr 0.9fr;
  gap: 10px;
  padding: 13px 18px;
  align-items: center;
  font: var(--text-sm) var(--font-sans);
}
.kit-prov__row--bd {
  border-top: 1px solid var(--border-subtle);
}
.kit-prov__name {
  font-weight: 600;
  color: var(--text-strong);
}
.kit-prov__mono {
  font-family: var(--font-mono);
}
.kit-prov__muted {
  color: var(--text-muted);
}
.kit-prov__strong {
  color: var(--text-strong);
  font-weight: 600;
}
.kit-prov__up {
  display: flex;
  align-items: center;
  gap: 6px;
}
.kit-prov__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.kit-prov__foot {
  padding: 12px 18px;
  border-top: 1px solid var(--border-subtle);
  background: var(--surface-sunken);
  font: var(--text-xs) var(--font-sans);
  color: var(--text-faint);
}
.kit-prov__foot code {
  font-family: var(--font-mono);
}
.kit-detail__apps {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.kit-app {
  display: flex;
  align-items: center;
  gap: 14px;
}
.kit-app__rank {
  width: 30px;
  text-align: center;
  font: var(--weight-bold) var(--text-md) var(--font-sans);
  color: var(--text-faint);
}
.kit-app__icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--grad-brand-soft);
  border: 1px solid var(--coral-200);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--coral-600);
}
.kit-app__body {
  flex: 1;
}
.kit-app__name {
  font: var(--weight-bold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
}
.kit-app__desc {
  font: var(--text-xs) var(--font-sans);
  color: var(--text-muted);
}
.kit-act__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.kit-act__title {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
}
.kit-act__bars {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 170px;
}
.kit-act__bar {
  flex: 1;
  border-radius: 6px 6px 3px 3px;
  background: var(--coral-200);
}
.kit-act__bar--last {
  background: var(--grad-brand);
}
.kit-detail__uptime {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.kit-up__head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.kit-up__name {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
}
.kit-up__pct {
  font: var(--weight-semibold) var(--text-sm) var(--font-mono);
}
.kit-up__track {
  display: flex;
  gap: 2px;
  height: 34px;
}
.kit-up__seg {
  flex: 1;
  border-radius: 2px;
  background: var(--success);
  opacity: 0.85;
}
.kit-up__seg--bad {
  background: var(--warning);
  opacity: 1;
}
.kit-up__axis {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font: var(--text-2xs) var(--font-sans);
  color: var(--text-faint);
}
.kit-detail__api {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
@media (max-width: 760px) {
  .kit-detail__overview {
    grid-template-columns: 1fr;
  }
  .kit-prov__head,
  .kit-prov__row {
    grid-template-columns: 1.4fr 0.9fr 0.9fr 0.9fr;
  }
  .kit-prov__head span:nth-child(n + 5),
  .kit-prov__row > :nth-child(n + 5) {
    display: none;
  }
}
</style>
