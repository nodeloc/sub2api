<template>
  <AppLayout>
    <div class="pg">
      <div class="pg-head">
        <h1 class="pg-title">{{ t('nav.playground') }}</h1>
        <span v-if="presetName" class="ko-badge ko-badge--brand pg-preset"><component :is="icons.Bolt" :size="13" /> {{ presetName }}</span>
        <div class="pg-controls">
          <!-- API key -->
          <div class="ko-select-wrap pg-sel">
            <select v-model="keyId" class="ko-input ko-select" @change="onKeyChange">
              <option v-for="k in keys" :key="k.id" :value="k.id">{{ k.name }}</option>
              <option v-if="!keys.length" :value="0" disabled>{{ t('playground.noKeys') }}</option>
            </select>
            <span class="ko-select-wrap__chev"><component :is="chev" /></span>
          </div>
          <!-- Model -->
          <div class="ko-select-wrap pg-sel">
            <select v-model="model" class="ko-input ko-select" :disabled="!modelOptions.length">
              <option v-for="m in modelOptions" :key="m" :value="m">{{ m }}</option>
              <option v-if="!modelOptions.length" value="" disabled>{{ t('playground.noModels') }}</option>
            </select>
            <span class="ko-select-wrap__chev"><component :is="chev" /></span>
          </div>
          <!-- Stream toggle -->
          <div class="ko-switch" :data-on="stream" role="switch" :aria-checked="stream" tabindex="0"
            @click="stream = !stream" @keydown.enter.prevent="stream = !stream" @keydown.space.prevent="stream = !stream">
            <span class="ko-switch__track"><span class="ko-switch__thumb"></span></span>
            <span class="ko-switch__label">{{ t('playground.stream') }}</span>
          </div>
        </div>
      </div>

      <div ref="threadEl" class="ko-card pg-thread">
        <div v-if="!msgs.length" class="pg-blank">
          <component :is="icons.Sparkle" :size="26" />
          <p>{{ t('playground.blank') }}</p>
        </div>
        <div v-for="(m, i) in msgs" :key="i" class="pg-msg" :class="`pg-msg--${m.role}`">
          <span class="pg-avatar" :class="`pg-avatar--${m.role}`">
            <span v-if="m.role === 'user'">{{ initial }}</span>
            <component :is="icons.Sparkle" v-else :size="15" />
          </span>
          <div class="pg-bubble" :class="`pg-bubble--${m.role}`">
            <span v-if="m.text">{{ m.text }}</span>
            <span v-else class="pg-typing">●●●</span>
          </div>
        </div>
      </div>

      <div v-if="error" class="ko-alert ko-alert--danger pg-error">
        <div class="ko-alert__body">{{ error }}</div>
      </div>

      <div class="pg-compose">
        <textarea
          v-model="draft"
          class="ko-input pg-textarea"
          rows="1"
          :placeholder="t('playground.placeholder')"
          :disabled="sending || !canSend"
          @keydown.enter.exact.prevent="send"
        ></textarea>
        <button class="ko-btn ko-btn--primary pg-send" :disabled="sending || !canSend || !draft.trim()" :aria-label="t('playground.send')" @click="send">
          <component :is="icons.Send" :size="18" />
        </button>
      </div>
      <div class="pg-foot">
        <span v-if="lastUsage" class="ko-badge ko-badge--mono">
          {{ lastUsage.total_tokens }} {{ t('usage.tokens') }} · {{ model }}
        </span>
        <span v-else class="pg-hint">{{ t('playground.hint') }}</span>
        <button v-if="msgs.length" class="pg-clear" @click="clear">{{ t('playground.clear') }}</button>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import { kitIcons as icons } from '@/components/kit/icons'
import { keysAPI } from '@/api/keys'
import { useAuthStore } from '@/stores'
import { getPreset } from '@/composables/usePresets'
import type { ApiKey } from '@/types'

interface Msg {
  role: 'user' | 'assistant'
  text: string
}

const { t } = useI18n()
const route = useRoute()
const authStore = useAuthStore()

const keys = ref<ApiKey[]>([])
const keyId = ref<number>(0)
const model = ref('')
const modelOptions = ref<string[]>([])
const stream = ref(true)
const draft = ref('')
const msgs = ref<Msg[]>([])
const sending = ref(false)
const error = ref('')
const lastUsage = ref<{ total_tokens: number } | null>(null)
const threadEl = ref<HTMLElement | null>(null)
const systemPrompt = ref('')
const temperature = ref<number | null>(null)
const presetName = ref('')

const initial = computed(() => (authStore.user?.email ? authStore.user.email.charAt(0).toUpperCase() : 'U'))
const activeKey = computed(() => keys.value.find((k) => k.id === keyId.value) || null)
const canSend = computed(() => !!activeKey.value && !!model.value)

const apiBase = `${window.location.origin}/v1`

async function loadKeys() {
  try {
    const res = await keysAPI.list(1, 100)
    const all = res.items || []
    keys.value = all.filter((k) => k.status === 'active')
    if (!keys.value.length) keys.value = all
    if (keys.value.length) {
      keyId.value = keys.value[0].id
      await loadModels()
    } else {
      error.value = t('playground.noKeys')
    }
  } catch (e) {
    console.error('Failed to load keys:', e)
    error.value = t('playground.errKeys')
  }
}

async function loadModels() {
  modelOptions.value = []
  const key = activeKey.value
  if (!key) return
  try {
    const res = await fetch(`${apiBase}/models`, { headers: { Authorization: `Bearer ${key.key}` } })
    if (!res.ok) throw new Error(`models ${res.status}`)
    const data = await res.json()
    const list: string[] = (data?.data || []).map((m: any) => m.id).filter(Boolean)
    modelOptions.value = list
    const pre = route.query.model as string | undefined
    if (pre && list.includes(pre)) model.value = pre
    else if (!model.value || !list.includes(model.value)) model.value = list[0] || ''
  } catch (e) {
    console.error('Failed to load models:', e)
    const pre = route.query.model as string | undefined
    if (pre) {
      modelOptions.value = [pre]
      model.value = pre
    }
  }
}

function onKeyChange() {
  loadModels()
}

async function scrollBottom() {
  await nextTick()
  if (threadEl.value) threadEl.value.scrollTop = threadEl.value.scrollHeight
}

function clear() {
  msgs.value = []
  lastUsage.value = null
  error.value = ''
}

async function send() {
  const q = draft.value.trim()
  const key = activeKey.value
  if (!q || sending.value || !key || !model.value) return
  error.value = ''
  draft.value = ''
  msgs.value.push({ role: 'user', text: q })
  const ai: Msg = { role: 'assistant', text: '' }
  msgs.value.push(ai)
  sending.value = true
  await scrollBottom()

  const history = msgs.value
    .slice(0, -1)
    .filter((m) => m.text)
    .map((m) => ({ role: m.role as string, content: m.text }))
  if (systemPrompt.value.trim()) history.unshift({ role: 'system', content: systemPrompt.value.trim() })
  const payload: Record<string, unknown> = { model: model.value, stream: stream.value, messages: history }
  if (temperature.value != null) payload.temperature = temperature.value

  try {
    const res = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key.key}` },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = await res.text()
      let msg = `HTTP ${res.status}`
      try { msg = JSON.parse(body)?.error?.message || msg } catch { /* keep */ }
      throw new Error(msg)
    }

    if (stream.value && res.body) {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() || ''
        for (const line of lines) {
          const s = line.trim()
          if (!s.startsWith('data:')) continue
          const data = s.slice(5).trim()
          if (data === '[DONE]') continue
          try {
            const json = JSON.parse(data)
            const delta = json?.choices?.[0]?.delta?.content
            if (delta) { ai.text += delta; await scrollBottom() }
            if (json?.usage) lastUsage.value = { total_tokens: json.usage.total_tokens }
          } catch { /* ignore keepalive/partials */ }
        }
      }
      if (!ai.text) ai.text = t('playground.empty')
    } else {
      const data = await res.json()
      ai.text = data?.choices?.[0]?.message?.content || t('playground.empty')
      if (data?.usage) lastUsage.value = { total_tokens: data.usage.total_tokens }
    }
  } catch (e: any) {
    console.error('Chat failed:', e)
    error.value = e?.message || t('playground.errSend')
    if (!ai.text) msgs.value.pop()
  } finally {
    sending.value = false
    await scrollBottom()
  }
}

function applyPreset() {
  const id = route.query.preset as string | undefined
  if (!id) return
  const p = getPreset(id)
  if (!p) return
  presetName.value = p.name
  systemPrompt.value = p.system || ''
  temperature.value = p.temperature
  if (p.model) {
    if (!modelOptions.value.includes(p.model)) modelOptions.value = [p.model, ...modelOptions.value]
    model.value = p.model
  }
}

const chev = () =>
  h('svg', { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M6 9l6 6 6-6' })])

onMounted(async () => {
  await loadKeys()
  applyPreset()
})
</script>

<style scoped>
.pg {
  max-width: 860px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px - 48px);
  min-height: 480px;
}
.pg-head {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.pg-title {
  font: var(--weight-extra) var(--text-2xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.pg-preset {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.pg-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-left: auto;
}
.pg-sel {
  width: 170px;
}
.pg-thread {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pg-blank {
  margin: auto;
  text-align: center;
  color: var(--text-faint);
}
.pg-blank p {
  margin-top: 8px;
  font: var(--type-body);
}
.pg-msg {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.pg-msg--user {
  flex-direction: row-reverse;
}
.pg-avatar {
  width: 30px;
  height: 30px;
  flex: none;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font: var(--weight-bold) var(--text-xs) var(--font-sans);
  color: #fff;
}
.pg-avatar--user {
  background: var(--warm-400, #b0a8a3);
}
.pg-avatar--assistant {
  background: var(--grad-brand);
}
.pg-bubble {
  max-width: 76%;
  padding: 11px 14px;
  border-radius: var(--radius-lg);
  font: var(--text-sm) var(--font-sans);
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
}
.pg-bubble--user {
  background: var(--coral-50);
  color: var(--text-strong);
  border-top-right-radius: 4px;
}
.pg-bubble--assistant {
  background: var(--surface-sunken);
  color: var(--text-body);
  border-top-left-radius: 4px;
}
.pg-typing {
  letter-spacing: 2px;
  color: var(--text-faint);
  animation: pgpulse 1.2s ease-in-out infinite;
}
@keyframes pgpulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.9; }
}
.pg-error {
  margin-top: 12px;
}
.pg-compose {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  margin-top: 14px;
}
.pg-textarea {
  flex: 1;
  resize: none;
  max-height: 160px;
  min-height: 46px;
  padding-top: 12px;
}
.pg-send {
  width: 46px;
  height: 46px;
  flex: none;
  padding: 0;
}
.pg-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}
.pg-hint {
  font: var(--text-xs) var(--font-sans);
  color: var(--text-faint);
}
.pg-clear {
  margin-left: auto;
  font: var(--weight-semibold) var(--text-xs) var(--font-sans);
  color: var(--text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
}
.pg-clear:hover {
  color: var(--text-strong);
}
</style>
