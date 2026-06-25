<template>
  <AppLayout>
    <div class="pr">
      <div class="pr-head">
        <div>
          <h1 class="pr-title">{{ t('nav.presets') }}</h1>
          <p class="pr-sub">{{ t('presets.sub') }}</p>
        </div>
        <button class="ko-btn ko-btn--primary" @click="newPreset">
          <component :is="icons.Plus" :size="16" /> {{ t('presets.new') }}
        </button>
      </div>

      <div class="pr-layout">
        <!-- List -->
        <div class="pr-list">
          <div v-if="!presets.length" class="pr-empty">{{ t('presets.none') }}</div>
          <button
            v-for="p in presets"
            :key="p.id"
            class="card pr-item"
            :class="{ 'pr-item--on': draft.id === p.id }"
            @click="select(p)"
          >
            <div class="pr-item__top">
              <component :is="icons.Bolt" :size="15" />
              <span class="pr-item__name">{{ p.name }}</span>
            </div>
            <div class="pr-item__model">{{ p.model || t('presets.noModel') }}</div>
            <div class="pr-item__used">{{ relative(p.updatedAt) }}</div>
          </button>
        </div>

        <!-- Editor -->
        <div class="card pr-editor">
          <div class="pr-field">
            <label class="ko-field__label">{{ t('presets.name') }}</label>
            <input v-model="draft.name" class="ko-input ko-input--mono" :placeholder="t('presets.namePlaceholder')" maxlength="48" />
          </div>

          <div class="pr-field">
            <label class="ko-field__label">{{ t('presets.model') }}</label>
            <div class="ko-select-wrap">
              <select v-model="draft.model" class="ko-input ko-select">
                <option value="" disabled>{{ t('presets.selectModel') }}</option>
                <option v-for="m in modelOptions" :key="m" :value="m">{{ m }}</option>
                <option v-if="draft.model && !modelOptions.includes(draft.model)" :value="draft.model">{{ draft.model }}</option>
              </select>
              <span class="ko-select-wrap__chev"><component :is="chev" /></span>
            </div>
          </div>

          <div class="pr-field">
            <label class="ko-field__label">{{ t('presets.system') }}</label>
            <textarea v-model="draft.system" class="ko-input pr-textarea" rows="4" :placeholder="t('presets.systemPlaceholder')"></textarea>
          </div>

          <div class="pr-field pr-temp">
            <label class="ko-field__label">{{ t('presets.temperature') }}</label>
            <div class="pr-temp__row">
              <input v-model.number="tempModel" type="range" min="0" max="2" step="0.1" class="pr-range" />
              <input v-model.number="tempModel" type="number" min="0" max="2" step="0.1" class="ko-input ko-input--mono pr-temp__num" />
            </div>
          </div>

          <div class="pr-actions">
            <button v-if="draft.id" class="ko-btn ko-btn--danger pr-del" @click="del">{{ t('presets.delete') }}</button>
            <div class="pr-actions__right">
              <router-link
                v-if="draft.id && draft.model"
                :to="`/playground?preset=${draft.id}`"
                class="ko-btn ko-btn--secondary"
              >
                <component :is="icons.Sparkle" :size="15" /> {{ t('presets.useInPlayground') }}
              </router-link>
              <button class="ko-btn ko-btn--primary" :disabled="!draft.name.trim()" @click="save">{{ t('presets.save') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/layout/AppLayout.vue'
import { kitIcons as icons } from '@/components/kit/icons'
import { usePresets, type Preset } from '@/composables/usePresets'
import { keysAPI } from '@/api/keys'
import { useAppStore } from '@/stores'

const { t } = useI18n()
const appStore = useAppStore()
const { presets, create, update, remove } = usePresets()

interface Draft {
  id: string | null
  name: string
  model: string
  system: string
  temperature: number | null
}
const blank = (): Draft => ({ id: null, name: '', model: '', system: '', temperature: null })
const draft = ref<Draft>(blank())
const modelOptions = ref<string[]>([])

// Temperature with a numeric proxy so the range/number inputs stay in sync.
const tempModel = computed<number>({
  get: () => (draft.value.temperature == null ? 1 : draft.value.temperature),
  set: (v) => { draft.value.temperature = Number.isFinite(v) ? v : null },
})

function newPreset() {
  draft.value = blank()
}
function select(p: Preset) {
  draft.value = { id: p.id, name: p.name, model: p.model, system: p.system, temperature: p.temperature }
}
function save() {
  const name = draft.value.name.trim()
  if (!name) return
  const data = { name, model: draft.value.model, system: draft.value.system, temperature: draft.value.temperature }
  if (draft.value.id) {
    update(draft.value.id, data)
    appStore.showSuccess(t('presets.saved'))
  } else {
    const p = create(data)
    draft.value.id = p.id
    appStore.showSuccess(t('presets.created'))
  }
}
function del() {
  if (!draft.value.id) return
  remove(draft.value.id)
  appStore.showSuccess(t('presets.deleted'))
  draft.value = blank()
}

function relative(ts: number) {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1) return t('presets.justNow')
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

async function loadModels() {
  try {
    const res = await keysAPI.list(1, 100)
    const key = (res.items || []).find((k) => k.status === 'active') || (res.items || [])[0]
    if (!key) return
    const r = await fetch(`${window.location.origin}/v1/models`, { headers: { Authorization: `Bearer ${key.key}` } })
    if (!r.ok) return
    const data = await r.json()
    modelOptions.value = (data?.data || []).map((m: any) => m.id).filter(Boolean)
  } catch (e) {
    console.error('Failed to load models for presets:', e)
  }
}

const chev = () =>
  h('svg', { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M6 9l6 6 6-6' })])

onMounted(() => {
  loadModels()
  if (presets.value.length) select(presets.value[0])
})
</script>

<style scoped>
.pr {
  max-width: 980px;
  margin: 0 auto;
}
.pr-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}
.pr-title {
  font: var(--weight-extra) var(--text-3xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.pr-sub {
  font: var(--type-body);
  color: var(--text-muted);
  margin-top: 4px;
}
.pr-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
  align-items: start;
}
.pr-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pr-empty {
  padding: 24px;
  text-align: center;
  font: var(--text-sm) var(--font-sans);
  color: var(--text-faint);
}
.pr-item {
  text-align: left;
  border: none;
  cursor: pointer;
  padding: 13px 15px;
  font: inherit;
  transition: box-shadow var(--dur-fast) var(--ease-out);
}
.pr-item--on {
  outline: 2px solid var(--coral-300);
  outline-offset: -2px;
}
.pr-item:hover {
  box-shadow: var(--shadow-md);
}
.pr-item__top {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--coral-600, var(--brand));
}
.pr-item__name {
  font: var(--weight-bold) var(--text-sm) var(--font-mono);
  color: var(--text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pr-item__model {
  font: var(--text-xs) var(--font-mono);
  color: var(--text-muted);
  margin: 6px 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pr-item__used {
  font: var(--text-2xs, 11px) var(--font-sans);
  color: var(--text-faint);
}
.pr-editor {
  padding: 20px;
}
.pr-field {
  margin-bottom: 16px;
}
.pr-field .ko-field__label {
  display: block;
  margin-bottom: 6px;
}
.pr-textarea {
  resize: vertical;
  min-height: 90px;
  line-height: 1.5;
}
.pr-temp__row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.pr-range {
  flex: 1;
  accent-color: var(--brand);
}
.pr-temp__num {
  width: 80px;
  flex: none;
}
.pr-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 4px;
}
.pr-actions__right {
  display: flex;
  gap: 10px;
  margin-left: auto;
}
@media (max-width: 760px) {
  .pr-layout {
    grid-template-columns: 1fr;
  }
}
</style>
