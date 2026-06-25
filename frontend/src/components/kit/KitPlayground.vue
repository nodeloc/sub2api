<template>
  <div class="kit-pg">
    <div class="kit-pg__head">
      <h1 class="kit-pg__title">Playground</h1>
      <div class="kit-pg__select">
        <div class="ko-select-wrap">
          <select v-model="model" class="ko-input ko-select">
            <option value="anthropic/claude-opus">anthropic/claude-opus</option>
            <option value="openai/gpt-5">openai/gpt-5</option>
            <option value="meta/llama-4-70b">meta/llama-4-70b</option>
          </select>
          <span class="ko-select-wrap__chev">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
          </span>
        </div>
      </div>
      <div class="ko-switch" :data-on="stream" role="switch" :aria-checked="stream" tabindex="0"
        @click="stream = !stream" @keydown.enter.prevent="stream = !stream" @keydown.space.prevent="stream = !stream">
        <span class="ko-switch__track"><span class="ko-switch__thumb"></span></span>
        <span class="ko-switch__label">Stream</span>
      </div>
    </div>

    <div class="ko-card kit-pg__thread">
      <div v-for="(m, i) in msgs" :key="i" class="kit-msg" :class="m.role === 'user' ? 'kit-msg--user' : 'kit-msg--ai'">
        <span class="kit-msg__avatar" :class="m.role === 'user' ? 'kit-msg__avatar--user' : 'kit-msg__avatar--ai'">
          <span v-if="m.role === 'user'">AL</span>
          <component :is="icons.Sparkle" v-else :size="16" />
        </span>
        <div class="kit-msg__bubble" :class="m.role === 'user' ? 'kit-msg__bubble--user' : 'kit-msg__bubble--ai'">{{ m.text }}</div>
      </div>
    </div>

    <div class="kit-pg__compose">
      <textarea
        v-model="draft"
        class="ko-input kit-pg__textarea"
        rows="1"
        placeholder="Ask anything…  (Enter to send)"
        @keydown.enter.exact.prevent="send"
      ></textarea>
      <button class="ko-btn ko-btn--primary kit-pg__send" aria-label="Send" @click="send">
        <component :is="icons.Send" :size="18" />
      </button>
    </div>
    <div class="kit-pg__cost">
      <span class="ko-badge ko-badge--mono">~$0.0021 / message · claude-opus</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { kitIcons as icons } from './icons'

interface Msg {
  role: 'user' | 'assistant'
  text: string
}

const model = ref('anthropic/claude-opus')
const stream = ref(true)
const draft = ref('')
const msgs = ref<Msg[]>([
  { role: 'user', text: 'Summarize what this gateway does in one sentence.' },
  {
    role: 'assistant',
    text: 'It is one API and one balance for every AI model — you send a request, it routes to the model you pick (or the cheapest that passes), and bills it in one place.',
  },
])

function send() {
  const q = draft.value.trim()
  if (!q) return
  msgs.value.push(
    { role: 'user', text: q },
    {
      role: 'assistant',
      text: "Routing to anthropic/claude-opus… here's a concise answer based on your prompt — swap the model in the top bar to compare responses side by side.",
    }
  )
  draft.value = ''
}
</script>

<style scoped>
.kit-pg {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.kit-pg__head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.kit-pg__title {
  font: var(--weight-bold) var(--text-2xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
  margin-right: auto;
}
.kit-pg__select {
  width: 230px;
}
.kit-pg__thread {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: auto;
  min-height: 280px;
}
.kit-msg {
  display: flex;
  gap: 11px;
}
.kit-msg--user {
  flex-direction: row-reverse;
}
.kit-msg__avatar {
  width: 30px;
  height: 30px;
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font: var(--weight-bold) var(--text-xs) var(--font-sans);
}
.kit-msg__avatar--user {
  border-radius: 50%;
  background: var(--grad-brand);
  color: #fff;
}
.kit-msg__avatar--ai {
  border-radius: var(--radius-sm);
  background: var(--warm-100);
  color: var(--coral-600);
}
.kit-msg__bubble {
  max-width: 78%;
  padding: 11px 14px;
  border-radius: var(--radius-lg);
  font: var(--text-sm)/1.55 var(--font-sans);
  color: var(--text-body);
}
.kit-msg__bubble--user {
  background: var(--coral-50);
  border: 1px solid var(--coral-100);
}
.kit-msg__bubble--ai {
  background: var(--surface-sunken);
  border: 1px solid var(--border-subtle);
}
.kit-pg__compose {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  margin-top: 14px;
}
.kit-pg__textarea {
  flex: 1;
  height: auto;
  min-height: 46px;
  padding: 12px 14px;
  resize: none;
  font: var(--type-body);
}
.kit-pg__send {
  height: 46px;
  width: 46px;
  padding: 0;
}
.kit-pg__cost {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
</style>
