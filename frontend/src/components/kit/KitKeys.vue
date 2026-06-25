<template>
  <div class="kit-keys">
    <div class="kit-keys__head">
      <div>
        <h1 class="kit-h1">API keys</h1>
        <p class="kit-lead">Use one key with any model below.</p>
      </div>
      <button class="ko-btn ko-btn--primary"><component :is="icons.Plus" :size="16" /> Create key</button>
    </div>

    <div class="ko-card kit-keys__list">
      <div v-for="(k, i) in keys" :key="k.id" class="kit-keyrow" :class="{ 'kit-keyrow--bd': i > 0 }">
        <div class="kit-keyrow__name">{{ k.name }}</div>
        <div class="kit-keyrow__key">
          <code>{{ k.prefix }}••••{{ k.tail }}</code>
          <button class="ko-iconbtn ko-iconbtn--sm" aria-label="Copy key"><component :is="icons.Copy" :size="15" /></button>
        </div>
        <div class="kit-keyrow__used">Used {{ k.last }}</div>
        <div class="kit-keyrow__spend">{{ k.spend }}</div>
        <button class="kit-keyrow__revoke" @click="revoke(k.id)">Revoke</button>
      </div>
      <div v-if="keys.length === 0" class="kit-keys__empty">No keys yet — create one to start.</div>
    </div>

    <div class="ko-alert ko-alert--info">
      <span class="ko-alert__icon"><component :is="icons.Key" :size="20" /></span>
      <div>
        <div class="ko-alert__title">Keep keys secret</div>
        <div class="ko-alert__body">Treat keys like passwords. Rotate them if exposed; revoking is instant.</div>
      </div>
    </div>

    <h3 class="kit-h3">Make your first request</h3>
    <KitCodeBlock lang="bash" :code="curlSample" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import KitCodeBlock from './KitCodeBlock.vue'
import { kitIcons as icons } from './icons'

interface ApiKey {
  id: number
  name: string
  prefix: string
  tail: string
  created: string
  last: string
  spend: string
}

const keys = ref<ApiKey[]>([
  { id: 1, name: 'Production', prefix: 'sk-ko-0b3f', tail: '7Qd2', created: 'Mar 12', last: '2 min ago', spend: '$182.40' },
  { id: 2, name: 'Staging', prefix: 'sk-ko-9f1a', tail: 'Lp8x', created: 'Feb 28', last: 'Yesterday', spend: '$12.10' },
  { id: 3, name: 'Local dev', prefix: 'sk-ko-44c2', tail: 'Rk0m', created: 'Feb 02', last: '3 days ago', spend: '$0.84' },
])
function revoke(id: number) {
  keys.value = keys.value.filter((k) => k.id !== id)
}

const curlSample = `curl https://api.kissopen.com/v1/chat/completions \\
  -H "Authorization: Bearer sk-ko-0b3f••••7Qd2" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "anthropic/claude-opus",
    "messages": [{ "role": "user", "content": "Say hi" }]
  }'`
</script>

<style scoped>
.kit-keys {
  max-width: 880px;
  margin: 0 auto;
}
.kit-keys__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
}
.kit-keys__list {
  padding: 0;
  overflow: hidden;
  margin-bottom: 20px;
}
.kit-keyrow {
  display: grid;
  grid-template-columns: 1.4fr 1.6fr 1fr 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 14px 18px;
}
.kit-keyrow--bd {
  border-top: 1px solid var(--border-subtle);
}
.kit-keyrow__name {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
}
.kit-keyrow__key {
  display: flex;
  align-items: center;
  gap: 8px;
}
.kit-keyrow__key code {
  font: var(--text-sm) var(--font-mono);
  color: var(--text-muted);
}
.kit-keyrow__used {
  font: var(--text-xs) var(--font-sans);
  color: var(--text-faint);
}
.kit-keyrow__spend {
  font: var(--weight-semibold) var(--text-sm) var(--font-mono);
  color: var(--text-strong);
}
.kit-keyrow__revoke {
  font: var(--weight-semibold) var(--text-xs) var(--font-sans);
  color: var(--danger);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
}
.kit-keyrow__revoke:hover {
  background: var(--danger-bg);
}
.kit-keys__empty {
  padding: 28px;
  text-align: center;
  font: var(--type-body);
  color: var(--text-faint);
}
.kit-h3 {
  font: var(--weight-semibold) var(--text-xl) var(--font-sans);
  color: var(--text-strong);
  margin: 26px 0 12px;
}
</style>
