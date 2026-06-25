<template>
  <div class="mob-stage">
    <div class="phone">
      <div class="notch"></div>
      <!-- Status bar -->
      <div class="status">
        <span>9:41</span>
        <span class="status__right">
          <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
            <rect x="0" y="6" width="3" height="6" rx="1" />
            <rect x="5" y="3.5" width="3" height="8.5" rx="1" />
            <rect x="10" y="1.5" width="3" height="10.5" rx="1" />
            <rect x="15" y="0" width="3" height="12" rx="1" />
          </svg>
          <svg width="22" height="12" viewBox="0 0 24 12" fill="none">
            <rect x="1" y="1" width="20" height="10" rx="3" stroke="currentColor" stroke-width="1.2" />
            <rect x="2.5" y="2.5" width="15" height="7" rx="1.5" fill="currentColor" />
            <rect x="22" y="4" width="2" height="4" rx="1" fill="currentColor" />
          </svg>
        </span>
      </div>

      <div class="screen">
        <!-- Home / Models -->
        <div v-if="tab === 'home'">
          <div class="mob-header">
            <h1 class="mob-title">Models</h1>
            <p class="mob-sub">240+ models · one balance</p>
          </div>
          <div class="mob-search">
            <span class="ko-input-wrap__lead"><component :is="icons.Search" :size="17" /></span>
            <input class="ko-input ko-input--has-lead" placeholder="Search models…" style="height: 42px" />
          </div>
          <div class="mob-list">
            <div v-for="x in models" :key="x.provider" class="ko-card mob-row" @click="tab = 'chat'">
              <KitModelAvatar :model="x.name" :size="40" />
              <div class="mob-row__id">
                <div class="mob-row__name">{{ x.name }}</div>
                <div class="mob-row__provider">{{ x.provider }}</div>
              </div>
              <div class="mob-row__right">
                <div class="mob-row__price">{{ x.priceIn }}</div>
                <span class="ko-badge" :class="statusClass(x.status)"><span class="ko-badge__dot"></span>{{ x.context }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat -->
        <div v-else-if="tab === 'chat'" class="mob-chat">
          <div class="mob-chat__bar">
            <span class="mob-chat__avatar"><component :is="icons.Sparkle" :size="16" /></span>
            <div class="mob-chat__meta">
              <div class="mob-chat__model">claude-opus</div>
              <div class="mob-chat__status">● operational</div>
            </div>
            <span class="ko-badge ko-badge--mono">$48.20</span>
          </div>
          <div class="mob-chat__thread">
            <div
              v-for="(m, i) in msgs"
              :key="i"
              class="mob-bubble"
              :class="m.role === 'user' ? 'mob-bubble--user' : 'mob-bubble--ai'"
            >{{ m.text }}</div>
          </div>
          <div class="mob-chat__compose">
            <input
              v-model="draft"
              class="ko-input mob-chat__input"
              placeholder="Message…"
              @keydown.enter="send"
            />
            <button class="ko-btn ko-btn--primary mob-chat__send" aria-label="Send" @click="send">
              <component :is="icons.Send" :size="18" />
            </button>
          </div>
        </div>

        <!-- Wallet / Balance -->
        <div v-else>
          <div class="mob-header"><h1 class="mob-title">Balance</h1></div>
          <div class="mob-wallet">
            <div class="mob-balance">
              <div class="mob-balance__label">Available</div>
              <div class="mob-balance__value">$48.20</div>
              <button class="ko-btn mob-balance__btn">Add credits</button>
            </div>
            <div class="mob-wallet__stats">
              <div class="ko-card mob-stat">
                <div class="mob-stat__label">Spent · 30d</div>
                <div class="mob-stat__value">$182.40</div>
              </div>
              <div class="ko-card mob-stat">
                <div class="mob-stat__label">Requests</div>
                <div class="mob-stat__value">48.2K</div>
              </div>
            </div>
            <div class="ko-card mob-alerts">
              <div class="mob-alerts__title">Alerts</div>
              <div
                v-for="(a, i) in alerts"
                :key="i"
                class="ko-switch"
                :data-on="a.on"
                role="switch"
                :aria-checked="a.on"
                tabindex="0"
                @click="a.on = !a.on"
                @keydown.enter.prevent="a.on = !a.on"
                @keydown.space.prevent="a.on = !a.on"
              >
                <span class="ko-switch__track"><span class="ko-switch__thumb"></span></span>
                <span class="ko-switch__label">{{ a.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab bar -->
      <div class="tabbar">
        <button
          v-for="tb in tabs"
          :key="tb.id"
          class="tabbar__btn"
          :class="{ 'tabbar__btn--on': tab === tb.id }"
          @click="tab = tb.id"
        >
          <component :is="tb.icon" :size="23" />
          <span class="tabbar__label">{{ tb.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import '@/styles/kit-components.css'
import { kitIcons as icons } from '@/components/kit/icons'
import { KIT_MODELS } from '@/components/kit/models'
import KitModelAvatar from '@/components/kit/KitModelAvatar.vue'

const tab = ref('home')
const models = KIT_MODELS

const tabs = [
  { id: 'home', icon: icons.Grid, label: 'Models' },
  { id: 'chat', icon: icons.Chat, label: 'Chat' },
  { id: 'wallet', icon: icons.Wallet, label: 'Balance' },
]

function statusClass(s: string) {
  if (s === 'new') return 'ko-badge--brand'
  if (s === 'degraded') return 'ko-badge--warning'
  return 'ko-badge--success'
}

interface Msg {
  role: 'user' | 'assistant'
  text: string
}
const msgs = ref<Msg[]>([
  { role: 'assistant', text: "Hey! Pick a model up top, then ask me anything. I'll route it for you." },
  { role: 'user', text: "What's the cheapest model with vision?" },
  {
    role: 'assistant',
    text: 'google/gemini-2.5-pro at $1.25/M input handles vision and has a 1M context. Want me to switch to it?',
  },
])
const draft = ref('')
function send() {
  const q = draft.value.trim()
  if (!q) return
  msgs.value.push(
    { role: 'user', text: q },
    { role: 'assistant', text: 'On it — routing to claude-opus and streaming the answer back.' }
  )
  draft.value = ''
}

const alerts = ref([
  { label: 'Notify at $10 remaining', on: true },
  { label: 'Weekly spend summary', on: true },
  { label: 'Auto-reload $25 at $5', on: false },
])

onMounted(() => {
  const saved = localStorage.getItem('theme')
  const dark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
})
</script>

<style scoped>
.mob-stage {
  min-height: 100vh;
  background: var(--surface-sunken);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 36px 0;
  box-sizing: border-box;
  font-family: var(--font-sans);
}
.phone {
  width: 390px;
  height: 844px;
  background: var(--surface-card);
  border-radius: 46px;
  box-shadow: var(--shadow-xl), 0 0 0 11px #2c2624, 0 0 0 13px #4a4240;
  position: relative;
  overflow: hidden;
}
.notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 130px;
  height: 30px;
  background: #2c2624;
  border-radius: 0 0 18px 18px;
  z-index: 30;
}
.status {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 26px;
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
  z-index: 25;
}
.status__right {
  display: flex;
  gap: 6px;
  align-items: center;
}
.screen {
  position: absolute;
  inset: 0;
  top: 50px;
  bottom: 86px;
  overflow: auto;
}
.tabbar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 86px;
  background: color-mix(in srgb, var(--surface-card) 92%, transparent);
  backdrop-filter: blur(14px);
  border-top: 1px solid var(--border-subtle);
  display: flex;
  padding: 8px 12px 26px;
  z-index: 25;
}
.tabbar__btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-faint);
  transition: color var(--dur-fast) var(--ease-out);
}
.tabbar__btn--on {
  color: var(--brand);
}
.tabbar__label {
  font: var(--weight-medium) var(--text-2xs) var(--font-sans);
}
.tabbar__btn--on .tabbar__label {
  font-weight: var(--weight-semibold);
}

/* ---- Shared screen bits ---- */
.mob-header {
  padding: 8px 20px 12px;
}
.mob-title {
  font: var(--weight-extra) var(--text-2xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.mob-sub {
  font: var(--text-sm) var(--font-sans);
  color: var(--text-muted);
  margin-top: 2px;
}
.mob-search {
  position: relative;
  padding: 0 20px 16px;
}
.mob-search .ko-input-wrap__lead {
  left: 33px;
}
.mob-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0 20px 16px;
}
.mob-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  cursor: pointer;
  transition: box-shadow var(--dur-base) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}
.mob-row:active {
  transform: scale(0.99);
}
.mob-row__id {
  flex: 1;
  min-width: 0;
}
.mob-row__name {
  font: var(--weight-bold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
}
.mob-row__provider {
  font: var(--text-2xs) var(--font-mono);
  color: var(--text-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mob-row__right {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.mob-row__price {
  font: var(--weight-semibold) var(--text-xs) var(--font-mono);
  color: var(--text-strong);
}

/* ---- Chat ---- */
.mob-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.mob-chat__bar {
  padding: 8px 20px 10px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  gap: 8px;
}
.mob-chat__avatar {
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  background: var(--warm-100);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--coral-600);
}
.mob-chat__meta {
  flex: 1;
}
.mob-chat__model {
  font: var(--weight-bold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
}
.mob-chat__status {
  font: var(--text-2xs) var(--font-sans);
  color: var(--success);
}
.mob-chat__thread {
  flex: 1;
  overflow: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mob-bubble {
  max-width: 82%;
  padding: 10px 13px;
  border-radius: var(--radius-lg);
  font: var(--text-sm)/1.5 var(--font-sans);
}
.mob-bubble--user {
  align-self: flex-end;
  background: var(--grad-brand);
  color: #fff;
}
.mob-bubble--ai {
  align-self: flex-start;
  background: var(--surface-sunken);
  color: var(--text-body);
  border: 1px solid var(--border-subtle);
}
.mob-chat__compose {
  padding: 14px;
  display: flex;
  gap: 9px;
  align-items: center;
  border-top: 1px solid var(--border-subtle);
}
.mob-chat__input {
  flex: 1;
  height: 44px;
  border-radius: var(--radius-pill);
}
.mob-chat__send {
  width: 44px;
  height: 44px;
  padding: 0;
}

/* ---- Wallet ---- */
.mob-wallet {
  padding: 0 20px;
}
.mob-balance {
  background: var(--grad-brand);
  border-radius: var(--radius-2xl);
  padding: 22px;
  color: #fff;
  box-shadow: var(--shadow-brand);
}
.mob-balance__label {
  font: var(--text-2xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  opacity: 0.9;
}
.mob-balance__value {
  font: var(--weight-extra) var(--text-4xl) var(--font-sans);
  letter-spacing: -0.02em;
  margin: 4px 0 16px;
}
.mob-balance__btn {
  background: #fff;
  color: var(--coral-600);
  width: 100%;
}
.mob-wallet__stats {
  display: flex;
  gap: 12px;
  margin: 16px 0;
}
.mob-stat {
  flex: 1;
}
.mob-stat__label {
  font: var(--weight-semibold) var(--text-2xs) var(--font-sans);
  color: var(--text-faint);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.mob-stat__value {
  font: var(--weight-extra) var(--text-xl) var(--font-sans);
  color: var(--text-strong);
  margin-top: 4px;
}
.mob-alerts {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.mob-alerts__title {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
}
</style>
