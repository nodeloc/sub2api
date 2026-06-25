<template>
  <div class="kit-prov">
    <div class="kit-prov__head">
      <div>
        <h1 class="kit-h1">Providers</h1>
        <p class="kit-lead">70+ providers serve the models on the platform. We route around the ones having a bad day.</p>
      </div>
      <KitTabs v-model="filter" :items="tabs" />
    </div>

    <div class="kit-prov__grid">
      <div v-for="p in list" :key="p.name" class="ko-card ko-card--hover kit-pcard">
        <div class="kit-pcard__top">
          <span class="kit-pcard__avatar">{{ p.initial }}</span>
          <div class="kit-pcard__id">
            <div class="kit-pcard__name">{{ p.name }}</div>
            <div class="kit-pcard__meta">Since {{ p.since }} · {{ p.regions }}</div>
          </div>
          <span class="ko-badge" :class="p.status === 'operational' ? 'ko-badge--success' : 'ko-badge--warning'">
            <span class="ko-badge__dot"></span>{{ p.status }}
          </span>
        </div>
        <p class="kit-pcard__desc">{{ p.desc }}</p>
        <div class="kit-pcard__stats">
          <div><span class="kit-pcard__num">{{ p.models }}</span> <span class="kit-pcard__unit">models</span></div>
          <div><span class="kit-pcard__num">{{ p.tokens }}</span> <span class="kit-pcard__unit">tok/wk</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import KitTabs from './KitTabs.vue'

const filter = ref('all')
const tabs = [
  { value: 'all', label: 'All' },
  { value: 'issues', label: 'Has issues' },
]

const providers = [
  { name: 'Anthropic', initial: 'A', models: 6, tokens: '42.1B', status: 'operational', regions: 'US, EU', since: '2023', desc: 'Claude family — frontier reasoning, vision and long context.' },
  { name: 'OpenAI', initial: 'O', models: 9, tokens: '60.4B', status: 'operational', regions: 'US, EU', since: '2023', desc: 'GPT family — broad intelligence, coding and tool use.' },
  { name: 'Google', initial: 'G', models: 7, tokens: '38.0B', status: 'operational', regions: 'US, EU, Asia', since: '2023', desc: 'Gemini — million-token multimodal models.' },
  { name: 'Meta', initial: 'M', models: 5, tokens: '55.2B', status: 'operational', regions: 'Global', since: '2023', desc: 'Llama open-weight models, served by many providers.' },
  { name: 'Mistral', initial: 'M', models: 4, tokens: '14.8B', status: 'operational', regions: 'EU', since: '2024', desc: 'Efficient European models with strong multilingual support.' },
  { name: 'DeepSeek', initial: 'D', models: 3, tokens: '31.0B', status: 'degraded', regions: 'Global', since: '2024', desc: 'Open reasoning models with visible chain-of-thought.' },
  { name: 'xAI', initial: 'X', models: 2, tokens: '9.4B', status: 'operational', regions: 'US', since: '2024', desc: 'Grok — huge context, strong tool calling.' },
  { name: 'Together', initial: 'T', models: 40, tokens: '28.4B', status: 'operational', regions: 'US', since: '2023', desc: 'Hosts open-weight models at scale and low cost.' },
]
const list = computed(() =>
  filter.value === 'all' ? providers : providers.filter((p) => p.status !== 'operational')
)
</script>

<style scoped>
.kit-prov {
  max-width: 1040px;
  margin: 0 auto;
}
.kit-prov__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.kit-h1 {
  font: var(--weight-bold) var(--text-3xl) var(--font-sans);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.kit-lead {
  font: var(--type-body);
  color: var(--text-muted);
  margin-top: 4px;
  max-width: 560px;
}
.kit-prov__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
@media (max-width: 720px) {
  .kit-prov__grid {
    grid-template-columns: 1fr;
  }
}
.kit-pcard {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.kit-pcard__top {
  display: flex;
  align-items: center;
  gap: 12px;
}
.kit-pcard__avatar {
  width: 44px;
  height: 44px;
  flex: none;
  border-radius: var(--radius-md);
  background: var(--warm-100);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font: var(--weight-bold) var(--text-lg) var(--font-sans);
  color: var(--text-strong);
}
.kit-pcard__id {
  flex: 1;
  min-width: 0;
}
.kit-pcard__name {
  font: var(--weight-bold) var(--text-md) var(--font-sans);
  color: var(--text-strong);
}
.kit-pcard__meta {
  font: var(--text-xs) var(--font-sans);
  color: var(--text-faint);
}
.kit-pcard__desc {
  font: var(--text-sm)/1.5 var(--font-sans);
  color: var(--text-muted);
  margin: 0;
}
.kit-pcard__stats {
  display: flex;
  gap: 18px;
  padding-top: 11px;
  border-top: 1px solid var(--border-subtle);
}
.kit-pcard__num {
  font: var(--weight-bold) var(--text-sm) var(--font-mono);
  color: var(--text-strong);
}
.kit-pcard__unit {
  font: var(--text-xs) var(--font-sans);
  color: var(--text-faint);
}
</style>
