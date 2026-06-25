<template>
  <AppLayout>
    <div class="kk">
      <div class="kk-head">
        <div>
          <h1 class="kk-title">{{ t('keys.title') }}</h1>
          <p class="kk-lead">{{ t('keys.lead') }}</p>
        </div>
        <button class="ko-btn ko-btn--primary" @click="openCreate">
          <component :is="icons.Plus" :size="16" /> {{ t('keys.createKey') }}
        </button>
      </div>

      <!-- freshly created key reveal -->
      <div v-if="newKey" class="ko-alert ko-alert--success kk-reveal">
        <span class="ko-alert__icon"><component :is="icons.Key" :size="20" /></span>
        <div class="kk-reveal__body">
          <div class="ko-alert__title">{{ t('keys.keyCreatedSuccess') }}</div>
          <div class="kk-reveal__keyrow">
            <code class="kk-reveal__key">{{ newKey }}</code>
            <button class="ko-iconbtn ko-iconbtn--sm" :aria-label="t('keys.copyToClipboard')" @click="copy(newKey)">
              <component :is="icons.Copy" :size="15" />
            </button>
          </div>
          <div class="kk-reveal__warn">{{ t('keys.secretBody') }}</div>
        </div>
        <button class="kk-reveal__dismiss" @click="newKey = ''" :aria-label="t('common.cancel')">
          <component :is="closeIcon" />
        </button>
      </div>

      <div class="ko-card kk-list">
        <div v-if="loading" class="kk-empty">
          <LoadingSpinner />
        </div>
        <template v-else>
          <div v-for="(k, i) in keys" :key="k.id" class="kk-row" :class="{ 'kk-row--bd': i > 0 }">
            <div class="kk-row__main">
              <div class="kk-row__name">
                {{ k.name }}
                <span class="kk-status" :class="`kk-status--${k.status}`">{{ statusLabel(k.status) }}</span>
              </div>
              <div class="kk-row__meta">
                <span v-if="k.group" class="kk-group">{{ k.group.name }}</span>
                <span v-else class="kk-group kk-group--none">{{ t('keys.noGroup') }}</span>
                <span class="kk-row__used">{{ usedLabel(k) }}</span>
              </div>
            </div>

            <div class="kk-row__key">
              <code>{{ maskApiKey(k.key) }}</code>
              <button class="ko-iconbtn ko-iconbtn--sm" :aria-label="t('keys.copyToClipboard')" @click="copy(k.key)">
                <component :is="icons.Copy" :size="15" />
              </button>
            </div>

            <div class="kk-row__spend">
              <span class="kk-row__spend-v">${{ (k.quota_used || 0).toFixed(2) }}</span>
              <span class="kk-row__spend-l">{{ k.quota > 0 ? `/ $${k.quota.toFixed(0)}` : t('keys.unlimited') }}</span>
            </div>

            <div class="kk-row__actions">
              <button
                class="kk-act"
                :title="k.status === 'active' ? t('common.inactive') : t('common.active')"
                @click="toggle(k)"
              >
                {{ k.status === 'active' ? t('keys.disable') : t('keys.enable') }}
              </button>
              <button class="kk-act kk-act--danger" @click="askDelete(k)">{{ t('keys.revoke') }}</button>
            </div>
          </div>
          <div v-if="!keys.length" class="kk-empty">{{ t('keys.noKeysYet') }}</div>
        </template>
      </div>

      <div class="ko-alert ko-alert--info kk-secret">
        <span class="ko-alert__icon"><component :is="icons.Key" :size="20" /></span>
        <div>
          <div class="ko-alert__title">{{ t('keys.secretTitle') }}</div>
          <div class="ko-alert__body">{{ t('keys.secretBody') }}</div>
        </div>
      </div>

      <h3 class="kk-h3">{{ t('keys.firstRequest') }}</h3>
      <KitCodeBlock lang="bash" :code="curlSample" />
    </div>

    <!-- Create modal -->
    <div v-if="showCreate" class="kk-modal" @click.self="showCreate = false">
      <div class="kk-modal__card ko-card">
        <div class="kk-modal__head">
          <h3 class="kk-modal__title">{{ t('keys.createKey') }}</h3>
          <button class="ko-iconbtn ko-iconbtn--sm" @click="showCreate = false" :aria-label="t('common.cancel')">
            <component :is="closeIcon" />
          </button>
        </div>

        <label class="kk-field">
          <span class="kk-field__label">{{ t('keys.nameLabel') }}</span>
          <input v-model="form.name" class="ko-input" :placeholder="t('keys.namePlaceholder')" maxlength="64" />
        </label>

        <label class="kk-field">
          <span class="kk-field__label">{{ t('keys.groupLabel') }}</span>
          <div class="ko-select-wrap">
            <select v-model="form.groupId" class="ko-input ko-select">
              <option :value="null" disabled>{{ t('keys.selectGroup') }}</option>
              <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
            <span class="ko-select-wrap__chev"><component :is="chev" /></span>
          </div>
        </label>

        <div class="kk-field-row">
          <label class="kk-field">
            <span class="kk-field__label">{{ t('keys.quotaAmount') }}</span>
            <input v-model.number="form.quota" type="number" min="0" step="1" class="ko-input" placeholder="0" />
          </label>
          <label class="kk-field">
            <span class="kk-field__label">{{ t('keys.expiresInDays') }}</span>
            <input v-model.number="form.expiresInDays" type="number" min="0" step="1" class="ko-input" placeholder="0" />
          </label>
        </div>

        <div class="kk-modal__foot">
          <button class="ko-btn ko-btn--ghost" @click="showCreate = false">{{ t('common.cancel') }}</button>
          <button class="ko-btn ko-btn--primary" :disabled="submitting || !form.name || form.groupId === null" @click="submitCreate">
            {{ submitting ? t('keys.saving') : t('keys.createKey') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete confirm -->
    <div v-if="pendingDelete" class="kk-modal" @click.self="pendingDelete = null">
      <div class="kk-modal__card kk-modal__card--sm ko-card">
        <h3 class="kk-modal__title">{{ t('keys.deleteKey') }}</h3>
        <p class="kk-modal__msg">{{ t('keys.deleteConfirmMessage', { name: pendingDelete.name }) }}</p>
        <div class="kk-modal__foot">
          <button class="ko-btn ko-btn--ghost" @click="pendingDelete = null">{{ t('common.cancel') }}</button>
          <button class="ko-btn ko-btn--danger" :disabled="submitting" @click="confirmDelete">{{ t('keys.revoke') }}</button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import KitCodeBlock from '@/components/kit/KitCodeBlock.vue'
import { kitIcons as icons } from '@/components/kit/icons'
import { keysAPI } from '@/api/keys'
import { userGroupsAPI } from '@/api/groups'
import { useAppStore } from '@/stores/app'
import { useClipboard } from '@/composables/useClipboard'
import { maskApiKey } from '@/utils/maskApiKey'
import type { ApiKey, Group } from '@/types'

const { t } = useI18n()
const appStore = useAppStore()
const { copyToClipboard } = useClipboard()

const keys = ref<ApiKey[]>([])
const groups = ref<Group[]>([])
const loading = ref(false)
const submitting = ref(false)
const showCreate = ref(false)
const pendingDelete = ref<ApiKey | null>(null)
const newKey = ref('')

const form = ref<{ name: string; groupId: number | null; quota: number; expiresInDays: number }>({
  name: '',
  groupId: null,
  quota: 0,
  expiresInDays: 0,
})

const apiBase = computed(() => `${window.location.origin}/v1`)
const curlSample = computed(
  () => `curl ${apiBase.value}/chat/completions \\
  -H "Authorization: Bearer ${keys.value[0] ? maskApiKey(keys.value[0].key) : 'sk-...'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-3-5-sonnet",
    "messages": [{ "role": "user", "content": "Say hi" }]
  }'`
)

function statusLabel(s: ApiKey['status']) {
  if (s === 'active') return t('common.active')
  if (s === 'inactive') return t('common.inactive')
  if (s === 'expired') return t('keys.expiresAt')
  return t('keys.quota')
}
function usedLabel(k: ApiKey) {
  if (!k.last_used_at) return t('keys.never')
  const d = new Date(k.last_used_at)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return `${t('keys.lastUsedAt')}: <1m`
  if (mins < 60) return `${t('keys.lastUsedAt')}: ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${t('keys.lastUsedAt')}: ${hrs}h`
  return `${t('keys.lastUsedAt')}: ${Math.floor(hrs / 24)}d`
}

async function copy(text: string) {
  await copyToClipboard(text)
}

async function load() {
  loading.value = true
  try {
    const res = await keysAPI.list(1, 100)
    keys.value = res.items || []
  } catch (e) {
    console.error('Failed to load keys:', e)
    appStore.showError(t('keys.failedToLoad'))
  } finally {
    loading.value = false
  }
}
async function loadGroups() {
  try {
    groups.value = await userGroupsAPI.getAvailable()
  } catch (e) {
    console.error('Failed to load groups:', e)
  }
}

function openCreate() {
  form.value = { name: '', groupId: groups.value[0]?.id ?? null, quota: 0, expiresInDays: 0 }
  showCreate.value = true
}

async function submitCreate() {
  if (!form.value.name || form.value.groupId === null) return
  submitting.value = true
  try {
    const created = await keysAPI.create(
      form.value.name,
      form.value.groupId,
      undefined,
      undefined,
      undefined,
      form.value.quota > 0 ? form.value.quota : undefined,
      form.value.expiresInDays > 0 ? form.value.expiresInDays : undefined
    )
    appStore.showSuccess(t('keys.keyCreatedSuccess'))
    newKey.value = created.key
    showCreate.value = false
    await load()
  } catch (e) {
    console.error('Failed to create key:', e)
    appStore.showError(t('keys.failedToSave'))
  } finally {
    submitting.value = false
  }
}

async function toggle(k: ApiKey) {
  const next = k.status === 'active' ? 'inactive' : 'active'
  try {
    await keysAPI.toggleStatus(k.id, next)
    appStore.showSuccess(next === 'active' ? t('keys.keyEnabledSuccess') : t('keys.keyDisabledSuccess'))
    await load()
  } catch (e) {
    console.error('Failed to toggle key:', e)
    appStore.showError(t('keys.failedToUpdateStatus'))
  }
}

function askDelete(k: ApiKey) {
  pendingDelete.value = k
}
async function confirmDelete() {
  if (!pendingDelete.value) return
  submitting.value = true
  try {
    await keysAPI.delete(pendingDelete.value.id)
    appStore.showSuccess(t('keys.keyDeletedSuccess'))
    pendingDelete.value = null
    await load()
  } catch (e) {
    console.error('Failed to delete key:', e)
    appStore.showError(t('keys.failedToDelete'))
  } finally {
    submitting.value = false
  }
}

const chev = () =>
  h('svg', { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M6 9l6 6 6-6' })])
const closeIcon = () =>
  h('svg', { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M18 6L6 18M6 6l12 12' })])

onMounted(() => {
  load()
  loadGroups()
})
</script>

<style scoped>
.kk {
  max-width: 880px;
  margin: 0 auto;
}
.kk-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}
.kk-title {
  font: var(--weight-extra) var(--text-3xl) var(--font-sans);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.kk-lead {
  font: var(--type-body);
  color: var(--text-muted);
  margin-top: 4px;
}

.kk-reveal {
  margin-bottom: 18px;
  align-items: flex-start;
}
.kk-reveal__body {
  flex: 1;
  min-width: 0;
}
.kk-reveal__keyrow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 6px;
}
.kk-reveal__key {
  font: var(--text-sm) var(--font-mono);
  color: var(--text-strong);
  background: var(--warm-100);
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  word-break: break-all;
}
.kk-reveal__warn {
  font: var(--text-xs) var(--font-sans);
  color: var(--text-muted);
}
.kk-reveal__dismiss {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-faint);
  flex: none;
}

.kk-list {
  padding: 0;
  overflow: hidden;
  margin-bottom: 20px;
}
.kk-row {
  display: grid;
  grid-template-columns: 1.7fr 1.5fr 0.9fr auto;
  gap: 14px;
  align-items: center;
  padding: 14px 18px;
}
.kk-row--bd {
  border-top: 1px solid var(--border-subtle);
}
.kk-row__name {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
  display: flex;
  align-items: center;
  gap: 8px;
}
.kk-row__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
}
.kk-group {
  font: var(--weight-semibold) var(--text-2xs, 11px) var(--font-sans);
  color: var(--brand);
  background: var(--grad-brand-soft, var(--warm-100));
  padding: 2px 8px;
  border-radius: 999px;
}
.kk-group--none {
  color: var(--text-faint);
  background: var(--warm-100);
}
.kk-row__used {
  font: var(--text-xs) var(--font-sans);
  color: var(--text-faint);
}
.kk-status {
  font: var(--weight-bold) var(--text-2xs, 10px) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 7px;
  border-radius: 999px;
}
.kk-status--active {
  color: var(--success, #2f9e6e);
  background: var(--success-bg, rgba(47, 158, 110, 0.12));
}
.kk-status--inactive {
  color: var(--text-faint);
  background: var(--warm-100);
}
.kk-status--expired,
.kk-status--quota_exhausted {
  color: var(--danger, #d9534f);
  background: var(--danger-bg, rgba(217, 83, 79, 0.12));
}
.kk-row__key {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.kk-row__key code {
  font: var(--text-sm) var(--font-mono);
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
}
.kk-row__spend {
  text-align: right;
  white-space: nowrap;
}
.kk-row__spend-v {
  font: var(--weight-bold) var(--text-sm) var(--font-mono);
  color: var(--text-strong);
}
.kk-row__spend-l {
  font: var(--text-2xs, 11px) var(--font-mono);
  color: var(--text-faint);
  margin-left: 4px;
}
.kk-row__actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
}
.kk-act {
  font: var(--weight-semibold) var(--text-xs) var(--font-sans);
  color: var(--text-muted);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
}
.kk-act:hover {
  background: var(--warm-100);
}
.kk-act--danger {
  color: var(--danger, #d9534f);
}
.kk-act--danger:hover {
  background: var(--danger-bg, rgba(217, 83, 79, 0.1));
}
.kk-empty {
  padding: 36px;
  text-align: center;
  font: var(--type-body);
  color: var(--text-faint);
  display: flex;
  justify-content: center;
}
.kk-secret {
  margin-bottom: 6px;
}
.kk-h3 {
  font: var(--weight-semibold) var(--text-xl) var(--font-sans);
  color: var(--text-strong);
  margin: 26px 0 12px;
}

/* modal */
.kk-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(40, 26, 24, 0.42);
  backdrop-filter: blur(2px);
}
.kk-modal__card {
  width: 100%;
  max-width: 440px;
  padding: 22px;
}
.kk-modal__card--sm {
  max-width: 380px;
}
.kk-modal__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.kk-modal__title {
  font: var(--weight-bold) var(--text-xl) var(--font-sans);
  color: var(--text-strong);
}
.kk-modal__msg {
  font: var(--type-body);
  color: var(--text-muted);
  margin: 4px 0 18px;
}
.kk-field {
  display: block;
  margin-bottom: 14px;
}
.kk-field__label {
  display: block;
  font: var(--weight-semibold) var(--text-xs) var(--font-sans);
  color: var(--text-muted);
  margin-bottom: 6px;
}
.kk-field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.kk-modal__foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}
</style>
