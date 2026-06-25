<template>
  <AppLayout>
    <div class="kr">
      <div class="kr-head">
        <div>
          <h1 class="kr-title">{{ t('nav.rankings') }}</h1>
          <p class="kr-sub">{{ t('usage.rankingsSub') }}</p>
        </div>
        <div class="kr-range">
          <div class="ko-select-wrap">
            <select v-model="rangeDays" class="ko-input ko-select" @change="load">
              <option value="7">{{ t('usage.past1Week') }}</option>
              <option value="30">{{ t('usage.past30Days') }}</option>
              <option value="90">{{ t('usage.past90Days') }}</option>
            </select>
            <span class="ko-select-wrap__chev"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg></span>
          </div>
        </div>
      </div>

      <div v-if="loading" class="kr-loading"><LoadingSpinner /></div>
      <div v-else-if="!ranked.length" class="kr-empty">{{ t('usage.noUsageRecords') }}</div>
      <div v-else class="kr-list">
        <router-link
          v-for="(m, i) in ranked"
          :key="m.model"
          :to="`/usage`"
          class="card kr-row"
        >
          <span class="kr-row__num" :class="{ 'kr-row__num--top': i < 3 }">{{ i + 1 }}</span>
          <span class="kr-row__avatar"><ModelIcon :model="m.model" size="22px" /></span>
          <div class="kr-row__mid">
            <div class="kr-row__name">{{ m.model }}</div>
            <div class="kr-row__bar"><span class="kr-row__fill" :style="{ width: pct(m) + '%' }"></span></div>
          </div>
          <div class="kr-row__right">
            <div class="kr-row__tok">{{ fmtTok(m.total_tokens) }}</div>
            <div class="kr-row__cost">${{ m.actual_cost.toFixed(2) }}</div>
          </div>
        </router-link>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usageAPI } from '@/api'
import type { ModelStat } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ModelIcon from '@/components/common/ModelIcon.vue'

const { t } = useI18n()
const rangeDays = ref('30')
const loading = ref(false)
const models = ref<ModelStat[]>([])

const ranked = computed(() => [...models.value].sort((a, b) => b.total_tokens - a.total_tokens))
const maxTok = computed(() => Math.max(...ranked.value.map((m) => m.total_tokens), 1))
function pct(m: ModelStat) {
  return (m.total_tokens / maxTok.value) * 100
}
function fmtTok(n: number) {
  return n >= 1e9 ? (n / 1e9).toFixed(1) + 'B' : n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : `${n}`
}
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

async function load() {
  loading.value = true
  try {
    const days = Number(rangeDays.value)
    const end = new Date()
    const start = new Date(Date.now() - (days - 1) * 86400000)
    const res = await usageAPI.getDashboardModels({ start_date: ymd(start), end_date: ymd(end) })
    models.value = res.models || []
  } catch (e) {
    console.error('Failed to load rankings:', e)
    models.value = []
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>

<style scoped>
.kr {
  max-width: 880px;
  margin: 0 auto;
}
.kr-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 20px;
}
.kr-title {
  font: var(--weight-extra) var(--text-3xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.kr-sub {
  font: var(--type-body);
  color: var(--text-muted);
  margin-top: 4px;
}
.kr-range {
  width: 160px;
  flex: none;
}
.kr-loading,
.kr-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
  color: var(--text-faint);
}
.kr-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.kr-row {
  display: grid;
  grid-template-columns: 34px auto 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  text-decoration: none;
  transition: box-shadow var(--dur-base) var(--ease-out), transform var(--dur-fast) var(--ease-out);
}
.kr-row:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
.kr-row__num {
  font: var(--weight-extra) var(--text-xl) var(--font-sans);
  color: var(--text-faint);
  letter-spacing: -0.02em;
  text-align: center;
}
.kr-row__num--top {
  color: var(--brand);
}
.kr-row__avatar {
  width: 38px;
  height: 38px;
  flex: none;
  border-radius: var(--radius-md);
  background: var(--warm-100);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.kr-row__mid {
  min-width: 0;
}
.kr-row__name {
  font: var(--weight-bold) var(--text-sm) var(--font-mono);
  color: var(--text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.kr-row__bar {
  height: 6px;
  border-radius: 3px;
  background: var(--warm-100);
  margin-top: 8px;
  overflow: hidden;
  max-width: 360px;
}
.kr-row__fill {
  display: block;
  height: 100%;
  background: var(--grad-brand);
  border-radius: 3px;
}
.kr-row__right {
  text-align: right;
}
.kr-row__tok {
  font: var(--weight-bold) var(--text-md) var(--font-mono);
  color: var(--text-strong);
}
.kr-row__cost {
  font: var(--weight-semibold) var(--text-xs) var(--font-mono);
  color: var(--text-muted);
  margin-top: 2px;
}
</style>
