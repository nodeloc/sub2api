<template>
  <div class="kit-pre">
    <div class="kit-pre__head">
      <div>
        <h1 class="kit-h1">Presets</h1>
        <p class="kit-lead">Save model, routing and system prompt as a named config — then call it by slug.</p>
      </div>
      <button class="ko-btn ko-btn--primary"><component :is="icons.Plus" :size="16" /> New preset</button>
    </div>

    <div class="kit-pre__layout">
      <!-- List -->
      <div class="kit-pre__list">
        <div
          v-for="p in presets"
          :key="p.id"
          class="ko-card kit-pre__item"
          :class="{ 'kit-pre__item--on': sel.id === p.id }"
          @click="select(p)"
        >
          <div class="kit-pre__item-top">
            <component :is="icons.Bolt" :size="16" />
            <span class="kit-pre__item-name">{{ p.name }}</span>
          </div>
          <div class="kit-pre__item-model">{{ p.model }}</div>
          <div class="kit-pre__item-used">Used {{ p.used }}</div>
        </div>
      </div>

      <!-- Editor -->
      <div class="ko-card kit-pre__editor">
        <div class="kit-pre__name-row">
          <div class="ko-input-wrap">
            <input v-model="draft.name" class="ko-input ko-input--mono" />
          </div>
          <span class="ko-badge ko-badge--brand">{{ draft.routing }} routing</span>
        </div>

        <div class="kit-pre__selects">
          <div class="ko-field">
            <label class="ko-field__label">Model</label>
            <div class="ko-select-wrap">
              <select v-model="draft.model" class="ko-input ko-select">
                <option :value="draft.model">{{ draft.model }}</option>
                <option value="openrouter/auto">openrouter/auto</option>
              </select>
              <span class="ko-select-wrap__chev"><component :is="chevron" :size="16" /></span>
            </div>
          </div>
          <div class="ko-field">
            <label class="ko-field__label">Provider routing</label>
            <div class="ko-select-wrap">
              <select v-model="draft.routing" class="ko-input ko-select">
                <option>Cheapest</option>
                <option>Quality</option>
                <option>Fastest (:nitro)</option>
              </select>
              <span class="ko-select-wrap__chev"><component :is="chevron" :size="16" /></span>
            </div>
          </div>
        </div>

        <div class="ko-field">
          <label class="ko-field__label">System prompt</label>
          <textarea v-model="draft.sys" class="ko-input kit-pre__textarea" rows="3"></textarea>
        </div>

        <div class="kit-pre__row">
          <div class="kit-pre__temp">
            <div class="ko-field">
              <label class="ko-field__label">Temperature</label>
              <div class="ko-input-wrap">
                <input v-model="draft.temp" class="ko-input ko-input--mono" />
              </div>
            </div>
          </div>
          <div
            class="ko-switch kit-pre__pin"
            :data-on="draft.pin"
            role="switch"
            :aria-checked="draft.pin"
            tabindex="0"
            @click="draft.pin = !draft.pin"
            @keydown.enter.prevent="draft.pin = !draft.pin"
            @keydown.space.prevent="draft.pin = !draft.pin"
          >
            <span class="ko-switch__track"><span class="ko-switch__thumb"></span></span>
            <span class="ko-switch__label">Pin provider per conversation</span>
          </div>
        </div>

        <KitCodeBlock lang="bash" :code="curlSample" />

        <div class="kit-pre__actions">
          <button class="ko-btn ko-btn--primary">Save preset</button>
          <button class="ko-btn ko-btn--ghost">Duplicate</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, h } from 'vue'
import KitCodeBlock from './KitCodeBlock.vue'
import { kitIcons as icons } from './icons'

const chevron = () =>
  h(
    'svg',
    { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
    [h('path', { d: 'M6 9l6 6 6-6' })]
  )

interface Preset {
  id: string
  name: string
  model: string
  temp: string
  routing: string
  sys: string
  pin: boolean
  used: string
}

const presets: Preset[] = [
  { id: 'email', name: 'email-copywriter', model: 'anthropic/claude-opus', temp: '0.8', routing: 'Quality', sys: 'You are a concise marketing copywriter. Write warm, plain-spoken email copy.', pin: true, used: '2h ago' },
  { id: 'classify', name: 'inbound-classifier', model: 'meta/llama-4-70b', temp: '0.0', routing: 'Cheapest', sys: 'Classify the customer message into one of: billing, bug, feature, other. Reply with one word.', pin: true, used: 'Yesterday' },
  { id: 'review', name: 'code-reviewer', model: 'openai/gpt-5', temp: '0.2', routing: 'Quality', sys: 'Review the diff for bugs and security issues. Be specific and terse.', pin: false, used: '3 days ago' },
]

const sel = ref<Preset>(presets[0])
const draft = reactive<Preset>({ ...presets[0] })

function select(p: Preset) {
  sel.value = p
}
watch(sel, (p) => Object.assign(draft, p))

const curlSample = computed(
  () => `curl https://api.kissopen.com/v1/chat/completions \\
  -H "Authorization: Bearer $KO_KEY" \\
  -d '{ "preset": "@${draft.name}",
        "messages": [{"role":"user","content":"..."}] }'`
)
</script>

<style scoped>
.kit-pre {
  max-width: 1040px;
  margin: 0 auto;
}
.kit-pre__head {
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
.kit-pre__layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}
@media (max-width: 760px) {
  .kit-pre__layout {
    grid-template-columns: 1fr;
  }
}
.kit-pre__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.kit-pre__item {
  cursor: pointer;
  padding: 14px;
  transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out),
    background var(--dur-fast) var(--ease-out);
}
.kit-pre__item--on {
  border-color: var(--coral-300);
  box-shadow: var(--shadow-md);
  background: var(--coral-50);
}
.kit-pre__item-top {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--coral-600);
}
.kit-pre__item-name {
  font: var(--weight-semibold) var(--text-sm) var(--font-mono);
  color: var(--text-strong);
}
.kit-pre__item-model {
  font: var(--text-xs) var(--font-mono);
  color: var(--text-faint);
  margin-top: 6px;
}
.kit-pre__item-used {
  font: var(--text-2xs) var(--font-sans);
  color: var(--text-faint);
  margin-top: 4px;
}
.kit-pre__editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}
.kit-pre__name-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.kit-pre__name-row .ko-input-wrap {
  flex: 1;
}
.kit-pre__selects {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
}
.kit-pre__textarea {
  height: auto;
  min-height: 78px;
  padding: 12px 13px;
  resize: none;
  font: var(--type-body);
}
.kit-pre__row {
  display: flex;
  gap: 24px;
  align-items: center;
  padding-top: 4px;
}
.kit-pre__temp {
  width: 160px;
}
.kit-pre__pin {
  padding-top: 18px;
}
.kit-pre__actions {
  display: flex;
  gap: 10px;
}
</style>
