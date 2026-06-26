<template>
  <AppLayout>
    <!-- Header -->
    <div class="klog-head">
      <div>
        <h1 class="klog-title">{{ t('logs.title') }}</h1>
        <p class="klog-sub">{{ t('logs.description') }}</p>
      </div>
      <div class="klog-head__actions">
        <button class="ko-iconbtn ko-iconbtn--outline" :aria-label="t('common.refresh')" type="button" :disabled="loading" @click="reload">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'klog-spin': loading }"><path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" /></svg>
        </button>
        <div class="klog-range">
          <div class="ko-select-wrap">
            <select v-model="rangeDays" class="ko-input ko-select" @change="applyRange">
              <option value="7">{{ t('usage.past1Week') }}</option>
              <option value="30">{{ t('usage.past30Days') }}</option>
              <option value="90">{{ t('usage.past90Days') }}</option>
            </select>
            <span class="ko-select-wrap__chev"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mini request-volume chart -->
    <div class="klog-chart card">
      <div class="klog-chart__bars">
        <div
          v-for="(d, i) in trendBars"
          :key="i"
          class="klog-chart__bar"
          :class="{ 'klog-chart__bar--last': i === trendBars.length - 1 }"
          :style="{ height: barH(d.v) }"
          :title="`${d.date} · ${d.v} ${t('logs.requests')}`"
        />
        <div v-if="trendBars.length === 0" class="klog-chart__empty">{{ t('logs.noData') }}</div>
      </div>
    </div>

    <!-- Logs table -->
    <div class="klog-table card">
      <div class="klog-table__scroll">
        <table class="klog-tbl">
          <thead>
            <tr>
              <th>{{ t('logs.col.date') }}</th>
              <th>{{ t('logs.col.model') }}</th>
              <th>{{ t('logs.col.provider') }}</th>
              <th class="klog-num">{{ t('logs.col.input') }}</th>
              <th class="klog-num">{{ t('logs.col.output') }}</th>
              <th class="klog-num">{{ t('logs.col.cost') }}</th>
              <th class="klog-num">{{ t('logs.col.speed') }}</th>
              <th>{{ t('logs.col.key') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in logs"
              :key="row.id"
              class="klog-row"
              :class="{ 'klog-row--active': selected && selected.id === row.id }"
              @click="open(row)"
            >
              <td class="klog-date">{{ shortDate(row.created_at) }}</td>
              <td class="klog-model">{{ row.model }}</td>
              <td>
                <span class="klog-prov">
                  <span class="klog-prov__dot" :style="{ background: providerColor(row.model) }" />
                  {{ providerName(row.model) }}
                </span>
              </td>
              <td class="klog-num">{{ (row.input_tokens ?? 0).toLocaleString() }} <span class="klog-unit">tok</span></td>
              <td class="klog-num">{{ (row.output_tokens ?? 0).toLocaleString() }} <span class="klog-unit">tok</span></td>
              <td class="klog-num klog-cost">{{ fmtCost(row.actual_cost) }}</td>
              <td class="klog-num klog-speed">{{ speed(row) }}</td>
              <td class="klog-key">{{ row.api_key?.name || '—' }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="!loading && logs.length === 0" class="klog-empty">{{ t('logs.noRecords') }}</div>
        <div v-if="loading" class="klog-loading">{{ t('common.loading') }}</div>
      </div>
      <div v-if="pagination.total > pagination.page_size" class="klog-pager">
        <button class="ko-btn ko-btn--secondary ko-btn--sm" :disabled="pagination.page <= 1 || loading" @click="goPage(pagination.page - 1)">{{ t('logs.prev') }}</button>
        <span class="klog-pager__info">{{ pagination.page }} / {{ totalPages }}</span>
        <button class="ko-btn ko-btn--secondary ko-btn--sm" :disabled="pagination.page >= totalPages || loading" @click="goPage(pagination.page + 1)">{{ t('logs.next') }}</button>
      </div>
    </div>

    <!-- Detail drawer -->
    <Teleport to="body">
      <transition name="klog-fade">
        <div v-if="selected" class="klog-backdrop" @click="close" />
      </transition>
      <transition name="klog-slide">
        <aside v-if="selected" class="klog-drawer" @click.stop>
          <div class="klog-drawer__head">
            <div class="klog-drawer__title">
              <span class="klog-drawer__model">{{ selected.model }}</span>
              <span class="klog-chip"><span class="klog-prov__dot" :style="{ background: providerColor(selected.model) }" />{{ providerName(selected.model) }}</span>
            </div>
            <button class="ko-iconbtn ko-iconbtn--outline" :aria-label="t('common.close')" @click="close">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="klog-drawer__body">
            <!-- Stat cards -->
            <div class="klog-cards">
              <div class="klog-card"><div class="klog-card__lbl">{{ t('logs.firstToken') }}</div><div class="klog-card__val">{{ fmtDur(selected.first_token_ms) }}</div></div>
              <div class="klog-card"><div class="klog-card__lbl">{{ t('logs.col.speed') }}</div><div class="klog-card__val">{{ speed(selected) }}</div></div>
              <div class="klog-card"><div class="klog-card__lbl">{{ t('logs.col.cost') }}</div><div class="klog-card__val">{{ fmtCost(selected.actual_cost) }}</div></div>
              <div class="klog-card"><div class="klog-card__lbl">{{ t('logs.tokens') }}</div><div class="klog-card__val">{{ (selected.input_tokens ?? 0).toLocaleString() }} → {{ (selected.output_tokens ?? 0).toLocaleString() }}</div></div>
              <div class="klog-card"><div class="klog-card__lbl">{{ t('logs.duration') }}</div><div class="klog-card__val">{{ fmtDur(selected.duration_ms) }}</div></div>
              <div class="klog-card"><div class="klog-card__lbl">{{ t('logs.col.type') }}</div><div class="klog-card__val">{{ selected.stream ? t('usage.stream') : t('usage.sync') }}</div></div>
            </div>

            <!-- Overview -->
            <div class="klog-sec">{{ t('logs.overview') }}</div>
            <dl class="klog-kv">
              <div><dt>{{ t('logs.col.model') }}</dt><dd class="klog-mono">{{ selected.model }}</dd></div>
              <div><dt>{{ t('logs.col.provider') }}</dt><dd>{{ providerName(selected.model) }}</dd></div>
              <div v-if="selected.inbound_endpoint"><dt>{{ t('logs.endpoint') }}</dt><dd class="klog-mono">{{ selected.inbound_endpoint }}</dd></div>
              <div v-if="selected.service_tier"><dt>{{ t('logs.serviceTier') }}</dt><dd>{{ selected.service_tier }}</dd></div>
            </dl>

            <!-- Request -->
            <div class="klog-sec">{{ t('logs.request') }}</div>
            <dl class="klog-kv">
              <div><dt>{{ t('logs.col.key') }}</dt><dd>{{ selected.api_key?.name || '—' }}</dd></div>
              <div><dt>{{ t('logs.requestId') }}</dt><dd class="klog-mono klog-copy" @click="copy(selected.request_id)" :title="t('common.copy')">{{ selected.request_id || '—' }}</dd></div>
              <div><dt>{{ t('logs.time') }}</dt><dd>{{ fullDate(selected.created_at) }}</dd></div>
              <div><dt>{{ t('logs.streaming') }}</dt><dd>{{ selected.stream ? t('common.yes') : t('common.no') }}</dd></div>
              <div><dt>{{ t('logs.rate') }}</dt><dd>{{ (selected.rate_multiplier ?? 1).toFixed(2) }}x</dd></div>
            </dl>

            <!-- Cost & token breakdown -->
            <div class="klog-sec">{{ t('logs.breakdown') }}</div>
            <dl class="klog-kv">
              <div v-if="selected.input_cost > 0"><dt>{{ t('admin.usage.inputCost') }}</dt><dd>{{ fmtCost(selected.input_cost) }}</dd></div>
              <div v-if="selected.output_cost > 0"><dt>{{ t('admin.usage.outputCost') }}</dt><dd>{{ fmtCost(selected.output_cost) }}</dd></div>
              <div v-if="selected.cache_read_tokens > 0"><dt>{{ t('admin.usage.cacheReadTokens') }}</dt><dd>{{ selected.cache_read_tokens.toLocaleString() }}</dd></div>
              <div v-if="selected.cache_creation_tokens > 0"><dt>{{ t('admin.usage.cacheCreationTokens') }}</dt><dd>{{ selected.cache_creation_tokens.toLocaleString() }}</dd></div>
              <div><dt>{{ t('logs.original') }}</dt><dd>{{ fmtCost(selected.total_cost) }}</dd></div>
              <div class="klog-kv__total"><dt>{{ t('logs.billed') }}</dt><dd>{{ fmtCost(selected.actual_cost) }}</dd></div>
            </dl>
          </div>
        </aside>
      </transition>
    </Teleport>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { usageAPI } from '@/api'
import AppLayout from '@/components/layout/AppLayout.vue'
import type { UsageLog, TrendDataPoint } from '@/types'

const { t } = useI18n()
const appStore = useAppStore()

const logs = ref<UsageLog[]>([])
const loading = ref(false)
const selected = ref<UsageLog | null>(null)
const rangeDays = ref('7')
const trend = ref<TrendDataPoint[]>([])

const pagination = reactive({ page: 1, page_size: 50, total: 0 })
const totalPages = computed(() => Math.max(1, Math.ceil(pagination.total / pagination.page_size)))

const fmtLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const now = new Date()
const startDate = ref(fmtLocal(new Date(now.getTime() - 6 * 864e5)))
const endDate = ref(fmtLocal(now))

// ── provider derivation (same heuristic as the gateway) ──
function providerName(model: string): string {
  const m = (model || '').toLowerCase()
  if (m.includes('claude')) return 'Anthropic'
  if (m.includes('gemini')) return 'Google'
  if (m.includes('gpt') || m.includes('chatgpt') || m.includes('codex') || /^o[1-9]/.test(m)) return 'OpenAI'
  if (m.includes('deepseek')) return 'DeepSeek'
  if (m.includes('qwen')) return 'Qwen'
  if (m.includes('grok')) return 'xAI'
  return t('logs.unknownProvider')
}
function providerColor(model: string): string {
  const m = (model || '').toLowerCase()
  if (m.includes('claude')) return 'var(--coral-500)'
  if (m.includes('gemini')) return '#4285f4'
  if (m.includes('gpt') || m.includes('chatgpt') || m.includes('codex') || /^o[1-9]/.test(m)) return '#10a37f'
  if (m.includes('deepseek')) return '#4d6bfe'
  return 'var(--text-faint)'
}

function speed(row: UsageLog): string {
  const ms = row.duration_ms
  const out = row.output_tokens ?? 0
  if (!ms || ms <= 0 || out <= 0) return '—'
  return `${(out / (ms / 1000)).toFixed(1)} tok/s`
}
function fmtCost(v: number | null | undefined): string {
  const n = v ?? 0
  if (n === 0) return '$0'
  if (n < 0.01) return `$${n.toFixed(6)}`
  if (n < 1) return `$${n.toFixed(4)}`
  return `$${n.toFixed(3)}`
}
function fmtDur(ms: number | null | undefined): string {
  if (ms == null) return '—'
  if (ms < 1000) return `${ms.toFixed(0)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}
function shortDate(s: string): string {
  const d = new Date(s)
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}
function fullDate(s: string): string {
  return new Date(s).toLocaleString()
}
async function copy(text: string | null) {
  if (!text) return
  try { await navigator.clipboard.writeText(text); appStore.showSuccess(t('common.copied')) } catch { /* ignore */ }
}

// ── mini chart ──
const trendBars = computed(() => trend.value.map((d) => ({ date: d.date.slice(5), v: d.requests || 0 })))
const trendMax = computed(() => Math.max(1, ...trendBars.value.map((d) => d.v)))
function barH(v: number): string {
  return `${Math.max(3, Math.round((v / trendMax.value) * 100))}%`
}

function open(row: UsageLog) { selected.value = row }
function close() { selected.value = null }

async function loadLogs() {
  loading.value = true
  try {
    const resp = await usageAPI.query({
      page: pagination.page,
      page_size: pagination.page_size,
      start_date: startDate.value,
      end_date: endDate.value,
      sort_by: 'created_at',
      sort_order: 'desc',
    })
    logs.value = resp.items
    pagination.total = resp.total
  } catch {
    appStore.showError(t('logs.failedToLoad'))
  } finally {
    loading.value = false
  }
}
async function loadTrend() {
  try {
    const r = await usageAPI.getDashboardTrend({ start_date: startDate.value, end_date: endDate.value, granularity: 'day' })
    trend.value = r.trend || []
  } catch { /* non-critical */ }
}

function reload() { pagination.page = 1; loadLogs(); loadTrend() }
function goPage(p: number) { pagination.page = p; loadLogs() }
function applyRange() {
  const days = Number(rangeDays.value)
  startDate.value = fmtLocal(new Date(Date.now() - (days - 1) * 864e5))
  endDate.value = fmtLocal(new Date())
  reload()
}

onMounted(() => { loadLogs(); loadTrend() })
</script>

<style scoped>
.klog-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.klog-title {
  font: var(--weight-bold) var(--text-2xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.klog-sub {
  font: var(--type-body);
  color: var(--text-muted);
  margin-top: 4px;
}
.klog-head__actions { display: flex; align-items: center; gap: 10px; flex: none; }
.klog-range { width: 160px; }
.klog-spin { animation: klog-spin 0.8s linear infinite; }
@keyframes klog-spin { to { transform: rotate(360deg); } }

/* mini chart */
.klog-chart { padding: 14px 16px; margin-bottom: 14px; }
.klog-chart__bars { display: flex; align-items: flex-end; gap: 3px; height: 72px; }
.klog-chart__bar { flex: 1; min-width: 2px; border-radius: 3px 3px 1px 1px; background: var(--coral-200); transition: background var(--dur-fast) var(--ease-out); }
.klog-chart__bar--last { background: var(--grad-brand); }
.klog-chart__bar:hover { background: var(--coral-400); }
.klog-chart__empty { width: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-faint); font: var(--text-sm) var(--font-sans); }

/* table */
.klog-table { padding: 0; overflow: hidden; }
.klog-table__scroll { overflow-x: auto; }
.klog-tbl { width: 100%; border-collapse: collapse; font: var(--text-sm) var(--font-sans); }
.klog-tbl thead th {
  text-align: left;
  font: var(--weight-semibold) var(--text-2xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-faint);
  padding: 11px 14px;
  border-bottom: 1px solid var(--border-subtle);
  white-space: nowrap;
  position: sticky;
  top: 0;
  background: var(--surface-card);
}
.klog-num { text-align: right; }
.klog-row { cursor: pointer; transition: background var(--dur-fast) var(--ease-out); }
.klog-row td { padding: 11px 14px; border-bottom: 1px solid var(--border-subtle); white-space: nowrap; color: var(--text-body); }
.klog-row:hover { background: var(--surface-hover); }
.klog-row--active { background: var(--coral-50); }
.klog-date { color: var(--text-muted); }
.klog-model { font-weight: var(--weight-semibold); color: var(--text-strong); }
.klog-prov { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted); }
.klog-prov__dot { width: 8px; height: 8px; border-radius: 50%; flex: none; }
.klog-unit { color: var(--text-faint); font-size: var(--text-2xs); }
.klog-cost { color: var(--coral-600); font-weight: var(--weight-semibold); font-family: var(--font-mono); }
.klog-speed { color: var(--text-muted); font-family: var(--font-mono); }
.klog-key { color: var(--text-muted); }
.klog-empty, .klog-loading { padding: 40px; text-align: center; color: var(--text-faint); font: var(--text-sm) var(--font-sans); }
.klog-pager { display: flex; align-items: center; justify-content: flex-end; gap: 12px; padding: 12px 14px; border-top: 1px solid var(--border-subtle); }
.klog-pager__info { font: var(--text-sm) var(--font-mono); color: var(--text-muted); }

/* drawer */
.klog-backdrop { position: fixed; inset: 0; background: rgba(20, 12, 10, 0.32); z-index: 60; }
.klog-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(480px, 92vw);
  background: var(--surface-card);
  border-left: 1px solid var(--border-subtle);
  box-shadow: -12px 0 40px rgba(20, 12, 10, 0.12);
  z-index: 61;
  display: flex;
  flex-direction: column;
}
.klog-drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border-subtle);
}
.klog-drawer__title { display: flex; align-items: center; gap: 10px; min-width: 0; }
.klog-drawer__model { font: var(--weight-bold) var(--text-base) var(--font-sans); color: var(--text-strong); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.klog-chip { display: inline-flex; align-items: center; gap: 6px; font: var(--weight-medium) var(--text-xs) var(--font-sans); color: var(--text-muted); background: var(--surface-sunken); border: 1px solid var(--border-subtle); border-radius: var(--radius-pill); padding: 3px 9px; flex: none; }
.klog-drawer__body { padding: 18px; overflow-y: auto; }
.klog-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 20px; }
.klog-card { padding: 11px; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); background: var(--surface-sunken); }
.klog-card__lbl { font: var(--weight-semibold) var(--text-2xs) var(--font-sans); text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-faint); }
.klog-card__val { font: var(--weight-bold) var(--text-sm) var(--font-sans); color: var(--text-strong); margin-top: 4px; }
.klog-sec { font: var(--weight-bold) var(--text-2xs) var(--font-sans); text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-faint); margin: 18px 0 8px; }
.klog-kv { display: flex; flex-direction: column; gap: 1px; }
.klog-kv > div { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding: 7px 0; border-bottom: 1px solid var(--border-subtle); }
.klog-kv dt { font: var(--text-xs) var(--font-sans); color: var(--text-muted); flex: none; }
.klog-kv dd { font: var(--weight-medium) var(--text-sm) var(--font-sans); color: var(--text-body); text-align: right; min-width: 0; overflow-wrap: anywhere; }
.klog-kv__total dd { color: var(--coral-600); font-weight: var(--weight-bold); }
.klog-mono { font-family: var(--font-mono); font-size: var(--text-xs); }
.klog-copy { cursor: pointer; }
.klog-copy:hover { color: var(--coral-600); }

.klog-fade-enter-active, .klog-fade-leave-active { transition: opacity var(--dur-fast) var(--ease-out); }
.klog-fade-enter-from, .klog-fade-leave-to { opacity: 0; }
.klog-slide-enter-active, .klog-slide-leave-active { transition: transform var(--dur-base, 0.22s) var(--ease-out); }
.klog-slide-enter-from, .klog-slide-leave-to { transform: translateX(100%); }

@media (max-width: 640px) {
  .klog-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
