<template>
  <div class="kit-settings">
    <h1 class="kit-h1">Settings</h1>
    <div class="ko-card kit-settings__card">
      <div class="ko-field">
        <label class="ko-field__label">Workspace name</label>
        <div class="ko-input-wrap">
          <input v-model="workspace" class="ko-input" />
        </div>
      </div>

      <div class="ko-field">
        <label class="ko-field__label">Default routing</label>
        <div class="ko-select-wrap">
          <select v-model="routing" class="ko-input ko-select">
            <option value="auto">Auto — cheapest passing model</option>
            <option value="opus">Always claude-opus</option>
          </select>
          <span class="ko-select-wrap__chev">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
          </span>
        </div>
        <div class="ko-field__hint">Used when a request doesn't name a model</div>
      </div>

      <div class="kit-settings__switches">
        <div
          v-for="(opt, i) in toggles"
          :key="i"
          class="ko-switch"
          :data-on="opt.on"
          role="switch"
          :aria-checked="opt.on"
          tabindex="0"
          @click="opt.on = !opt.on"
          @keydown.enter.prevent="opt.on = !opt.on"
          @keydown.space.prevent="opt.on = !opt.on"
        >
          <span class="ko-switch__track"><span class="ko-switch__thumb"></span></span>
          <span class="ko-switch__label">{{ opt.label }}</span>
        </div>
      </div>

      <div>
        <button class="ko-btn ko-btn--primary">Save changes</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const workspace = ref('acme-prod')
const routing = ref('auto')
const toggles = ref([
  { label: 'Fallback routing when a provider is down', on: true },
  { label: 'Email me weekly spend summaries', on: true },
  { label: 'Hard stop at monthly budget', on: false },
])
</script>

<style scoped>
.kit-settings {
  max-width: 640px;
  margin: 0 auto;
}
.kit-h1 {
  font: var(--weight-bold) var(--text-3xl) var(--font-sans);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
  color: var(--text-strong);
  margin-bottom: 18px;
}
.kit-settings__card {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.kit-settings__switches {
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-top: 1px solid var(--border-subtle);
  padding-top: 16px;
}
</style>
