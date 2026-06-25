<template>
  <AppLayout>
    <!-- Detail -->
    <div v-if="selected" class="kit-detail">
      <button class="kit-detail__back" @click="selected = null">
        <span class="kit-detail__back-ic"><component :is="icons.Arrow" :size="15" /></span> {{ t('nav.models') }}
      </button>

      <div class="kit-detail__head">
        <KitModelAvatar :model="selected.name" :size="56" radius="var(--radius-lg)" />
        <div class="kit-detail__head-main">
          <div class="kit-detail__title-row">
            <h1 class="kit-detail__title">{{ selected.name }}</h1>
            <span class="ko-badge ko-badge--success"><span class="ko-badge__dot"></span>{{ t('models.operational') }}</span>
          </div>
          <div class="kit-detail__provider">{{ selected.platforms.join(' · ') }}</div>
        </div>
        <div class="kit-detail__actions">
          <router-link :to="`/playground?model=${encodeURIComponent(selected.name)}`" class="ko-btn ko-btn--primary">
            <component :is="icons.Sparkle" :size="16" /> {{ t('models.openInPlayground') }}
          </router-link>
        </div>
      </div>

      <div class="ko-card kit-detail__stats">
        <div class="kit-detail__stat">
          <div class="kit-detail__stat-label">{{ t('models.inputPrice') }}</div>
          <div class="kit-detail__stat-value">{{ priceInput(selected) }}<span class="kit-detail__stat-unit"> / M</span></div>
        </div>
        <div class="kit-detail__stat">
          <div class="kit-detail__stat-label">{{ t('models.outputPrice') }}</div>
          <div class="kit-detail__stat-value">{{ priceOutput(selected) }}<span class="kit-detail__stat-unit"> / M</span></div>
        </div>
        <div class="kit-detail__stat">
          <div class="kit-detail__stat-label">{{ t('models.billing') }}</div>
          <div class="kit-detail__stat-value kit-detail__stat-value--sm">{{ billingLabel(selected) }}</div>
        </div>
        <div class="kit-detail__stat">
          <div class="kit-detail__stat-label">{{ t('models.providers') }}</div>
          <div class="kit-detail__stat-value">{{ selected.groups.length || selected.platforms.length }}</div>
        </div>
      </div>

      <div class="kit-detail__cols">
        <div class="ko-card">
          <h3 class="kit-detail__h3">{{ t('models.availableVia') }}</h3>
          <div class="kit-detail__groups">
            <div v-for="g in selected.groups" :key="g.id" class="kit-detail__grow">
              <span class="kit-detail__grow-name">{{ g.name }}</span>
              <span class="ko-badge ko-badge--mono">{{ g.platform }}</span>
              <span class="kit-detail__grow-mult">×{{ g.rate_multiplier }}</span>
            </div>
            <div v-if="!selected.groups.length" class="kit-detail__grow-empty">{{ t('models.none') }}</div>
          </div>
        </div>
        <div>
          <KitCodeBlock lang="bash" :code="detailCode" />
        </div>
      </div>
    </div>

    <!-- Catalog -->
    <div v-else class="kit-catalog">
      <div class="kit-catalog__head">
        <div>
          <h1 class="kit-h1">{{ t('nav.models') }}</h1>
          <p class="kit-lead">{{ t('models.lead', { n: models.length }) }}</p>
        </div>
        <span class="ko-badge ko-badge--mono">{{ models.length }} {{ t('models.available') }}</span>
      </div>

      <div class="kit-catalog__controls">
        <div class="ko-input-wrap kit-catalog__search">
          <span class="ko-input-wrap__lead"><component :is="icons.Search" :size="16" /></span>
          <input v-model="query" class="ko-input ko-input--has-lead" :placeholder="t('models.searchPlaceholder')" />
        </div>
        <KitTabs v-if="platformTabs.length > 2" v-model="platform" :items="platformTabs" />
      </div>

      <div v-if="loading" class="kit-catalog__empty"><LoadingSpinner /></div>
      <div v-else-if="!filtered.length" class="kit-catalog__empty">{{ t('models.none') }}</div>
      <div v-else class="kit-catalog__grid">
        <div
          v-for="m in filtered"
          :key="m.name"
          class="ko-card ko-card--hover kit-mcard"
          @click="selected = m"
        >
          <div class="kit-mcard__top">
            <KitModelAvatar :model="m.name" :size="38" />
            <div class="kit-mcard__id">
              <div class="kit-mcard__name">{{ m.name }}</div>
              <div class="kit-mcard__provider">{{ m.platforms.join(' · ') }}</div>
            </div>
            <span class="ko-badge ko-badge--success"><span class="ko-badge__dot"></span>{{ t('models.operational') }}</span>
          </div>
          <div class="kit-mcard__tags">
            <span v-for="p in m.platforms" :key="p" class="ko-badge ko-badge--pink">{{ p }}</span>
            <span class="ko-badge ko-badge--mono">{{ m.groups.length || m.platforms.length }} {{ t('models.providers') }}</span>
          </div>
          <div class="kit-mcard__prices">
            <div>
              <div class="kit-price__label">{{ t('models.inputPrice') }}</div>
              <div class="kit-price__val">{{ priceInput(m) }} / M</div>
            </div>
            <div>
              <div class="kit-price__label">{{ t('models.outputPrice') }}</div>
              <div class="kit-price__val">{{ priceOutput(m) }} / M</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import KitModelAvatar from '@/components/kit/KitModelAvatar.vue'
import KitTabs from '@/components/kit/KitTabs.vue'
import KitCodeBlock from '@/components/kit/KitCodeBlock.vue'
import { kitIcons as icons } from '@/components/kit/icons'
import { userChannelsAPI } from '@/api/channels'
import type { UserSupportedModelPricing, UserAvailableGroup } from '@/api/channels'
import { keysAPI } from '@/api/keys'
import { formatScaled } from '@/utils/pricing'
import { BILLING_MODE_TOKEN, BILLING_MODE_PER_REQUEST, BILLING_MODE_IMAGE } from '@/constants/channel'

interface CatalogModel {
  name: string
  platforms: string[]
  groups: UserAvailableGroup[]
  pricing: UserSupportedModelPricing | null
}

const { t } = useI18n()
const route = useRoute()
const loading = ref(false)
const models = ref<CatalogModel[]>([])
const selected = ref<CatalogModel | null>(null)
const query = ref('')
const platform = ref('')

const platforms = computed(() => {
  const s = new Set<string>()
  models.value.forEach((m) => m.platforms.forEach((p) => s.add(p)))
  return [...s].sort()
})
const platformTabs = computed(() => [
  { value: '', label: t('models.all') },
  ...platforms.value.map((p) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) })),
])

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return models.value.filter((m) => {
    if (platform.value && !m.platforms.includes(platform.value)) return false
    if (q && !m.name.toLowerCase().includes(q)) return false
    return true
  })
})

function priceInput(m: CatalogModel) {
  if (!m.pricing) return '—'
  if (m.pricing.billing_mode === BILLING_MODE_PER_REQUEST) return formatScaled(m.pricing.per_request_price, 1)
  return formatScaled(m.pricing.input_price, 1_000_000)
}
function priceOutput(m: CatalogModel) {
  if (!m.pricing) return '—'
  if (m.pricing.billing_mode === BILLING_MODE_PER_REQUEST) return t('models.perReq')
  return formatScaled(m.pricing.output_price, 1_000_000)
}
function billingLabel(m: CatalogModel) {
  switch (m.pricing?.billing_mode) {
    case BILLING_MODE_TOKEN: return t('models.billingToken')
    case BILLING_MODE_PER_REQUEST: return t('models.billingPerReq')
    case BILLING_MODE_IMAGE: return t('models.billingImage')
    default: return '—'
  }
}

const detailCode = computed(() => {
  const name = selected.value?.name || 'claude-3-5-sonnet'
  return `curl ${window.location.origin}/v1/chat/completions \\
  -H "Authorization: Bearer $KO_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${name}",
    "messages": [{ "role": "user", "content": "Hello" }]
  }'`
})

async function load() {
  loading.value = true
  try {
    const channels = await userChannelsAPI.getAvailable()
    const byName = new Map<string, CatalogModel>()
    for (const ch of channels) {
      for (const section of ch.platforms || []) {
        for (const sm of section.supported_models || []) {
          let entry = byName.get(sm.name)
          if (!entry) {
            entry = { name: sm.name, platforms: [], groups: [], pricing: sm.pricing }
            byName.set(sm.name, entry)
          }
          if (!entry.pricing && sm.pricing) entry.pricing = sm.pricing
          if (sm.platform && !entry.platforms.includes(sm.platform)) entry.platforms.push(sm.platform)
          for (const g of section.groups || []) {
            if (!entry.groups.some((x) => x.id === g.id)) entry.groups.push(g)
          }
        }
      }
    }
    models.value = [...byName.values()].sort((a, b) => a.name.localeCompare(b.name))
    if (!models.value.length) await loadFromGateway()
    const pre = route.query.model as string | undefined
    if (pre) {
      const hit = models.value.find((m) => m.name === pre)
      if (hit) selected.value = hit
    }
  } catch (e) {
    console.error('Failed to load models:', e)
    models.value = []
  } finally {
    loading.value = false
  }
}

async function loadFromGateway() {
  try {
    const res = await keysAPI.list(1, 100)
    const key = (res.items || []).find((k) => k.status === 'active') || (res.items || [])[0]
    if (!key) return
    const plat = key.group?.platform || ''
    const groups = key.group ? [{ id: key.group.id, name: key.group.name, platform: key.group.platform, subscription_type: '', rate_multiplier: key.group.rate_multiplier, is_exclusive: false }] : []
    const r = await fetch(`${window.location.origin}/v1/models`, { headers: { Authorization: `Bearer ${key.key}` } })
    if (!r.ok) return
    const data = await r.json()
    const names: string[] = (data?.data || []).map((m: any) => m.id).filter(Boolean)
    models.value = names
      .map((name) => ({ name, platforms: plat ? [plat] : [], groups, pricing: null }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (e) {
    console.error('Gateway model fallback failed:', e)
  }
}

onMounted(load)
</script>

<style scoped>
/* ── Catalog (mirrors design ui_kits/dashboard/Catalog) ── */
.kit-catalog {
  max-width: 1080px;
  margin: 0 auto;
}
.kit-catalog__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 6px;
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
.kit-catalog__controls {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 18px 0 20px;
  flex-wrap: wrap;
}
.kit-catalog__search {
  flex: 1;
  min-width: 220px;
}
.kit-catalog__empty {
  display: flex;
  justify-content: center;
  padding: 48px 0;
  color: var(--text-faint);
}
.kit-catalog__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}
.kit-mcard {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.kit-mcard__top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.kit-mcard__id {
  flex: 1;
  min-width: 0;
}
.kit-mcard__name {
  font: var(--weight-bold) var(--text-md) var(--font-mono);
  letter-spacing: -0.01em;
  color: var(--text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.kit-mcard__provider {
  font: var(--text-xs) var(--font-sans);
  color: var(--text-faint);
  text-transform: capitalize;
}
.kit-mcard__tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  text-transform: capitalize;
}
.kit-mcard__prices {
  display: flex;
  gap: 18px;
  padding-top: 10px;
  border-top: 1px solid var(--border-subtle);
  margin-top: auto;
}
.kit-price__label {
  font: var(--weight-semibold) var(--text-2xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-faint);
}
.kit-price__val {
  font: var(--weight-semibold) var(--text-sm) var(--font-mono);
  color: var(--text-strong);
}

/* ── Detail (mirrors design ui_kits/dashboard/ModelDetail) ── */
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
  min-width: 0;
}
.kit-detail__title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.kit-detail__title {
  font: var(--weight-bold) var(--text-3xl) var(--font-mono);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.kit-detail__provider {
  font: var(--text-sm) var(--font-sans);
  color: var(--text-faint);
  margin-top: 4px;
  text-transform: capitalize;
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
  font: var(--weight-extra) var(--text-2xl) var(--font-mono);
  color: var(--text-strong);
  margin-top: 4px;
}
.kit-detail__stat-value--sm {
  font-size: var(--text-lg);
}
.kit-detail__stat-unit {
  font: var(--text-xs) var(--font-mono);
  color: var(--text-faint);
}
.kit-detail__cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}
.kit-detail__h3 {
  font: var(--weight-semibold) var(--text-md) var(--font-sans);
  color: var(--text-strong);
  margin: 0 0 12px;
}
.kit-detail__groups {
  display: flex;
  flex-direction: column;
}
.kit-detail__grow {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}
.kit-detail__grow + .kit-detail__grow {
  border-top: 1px solid var(--border-subtle);
}
.kit-detail__grow-name {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
  flex: 1;
}
.kit-detail__grow-mult {
  font: var(--weight-bold) var(--text-xs) var(--font-mono);
  color: var(--text-muted);
}
.kit-detail__grow-empty {
  padding: 14px 0;
  font: var(--text-sm) var(--font-sans);
  color: var(--text-faint);
}
@media (max-width: 760px) {
  .kit-detail__cols {
    grid-template-columns: 1fr;
  }
}
</style>
