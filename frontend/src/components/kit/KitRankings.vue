<template>
  <div class="kit-rank">
    <div class="kit-rank__head">
      <h1 class="kit-rank__title">LLM Rankings</h1>
      <p class="kit-lead">Models ranked by tokens processed across the platform this week.</p>
    </div>
    <div class="kit-rank__tabs">
      <KitTabs v-model="cat" :items="catTabs" />
    </div>

    <div class="kit-rank__list">
      <div
        v-for="(m, i) in ranked"
        :key="m.provider"
        class="ko-card ko-card--hover kit-rrow"
        @click="$emit('open', m)"
      >
        <span class="kit-rrow__num" :class="{ 'kit-rrow__num--top': i < 3 }">{{ i + 1 }}</span>
        <KitModelAvatar :model="m.name" :size="38" />
        <div class="kit-rrow__mid">
          <div class="kit-rrow__name">
            <span class="kit-rrow__model">{{ m.name }}</span>
            <span class="kit-rrow__org">{{ m.org }}</span>
          </div>
          <div class="kit-rrow__bar">
            <div class="kit-rrow__fill" :style="{ width: barWidth(m) }"></div>
          </div>
        </div>
        <div class="kit-rrow__right">
          <div class="kit-rrow__tok">{{ m.tokensWeek }}</div>
          <div class="kit-rrow__trend" :class="m.trendDir === 'down' ? 'kit-down' : 'kit-up'">{{ m.trend }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import KitTabs from './KitTabs.vue'
import KitModelAvatar from './KitModelAvatar.vue'
import { KIT_MODELS, type KitModel } from './models'

defineEmits<{ (e: 'open', model: KitModel): void }>()

const cat = ref('all')
const cats = ['all', 'Programming', 'Reasoning', 'Marketing', 'Roleplay']
const catTabs = cats.map((c) => ({ value: c, label: c === 'all' ? 'All' : c }))

const ranked = computed(() => {
  const filtered = KIT_MODELS.filter((m) => cat.value === 'all' || m.categories.includes(cat.value))
  return [...filtered].sort((a, b) => parseFloat(b.tokensWeek) - parseFloat(a.tokensWeek))
})
const max = computed(() => Math.max(...ranked.value.map((m) => parseFloat(m.tokensWeek)), 1))
function barWidth(m: KitModel) {
  return `${(parseFloat(m.tokensWeek) / max.value) * 100}%`
}
</script>

<style scoped>
.kit-rank {
  max-width: 880px;
  margin: 0 auto;
}
.kit-rank__head {
  text-align: center;
  margin-bottom: 24px;
}
.kit-rank__title {
  font: var(--weight-extra) var(--text-3xl) var(--font-sans);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.kit-lead {
  font: var(--type-body);
  color: var(--text-muted);
  margin-top: 6px;
}
.kit-rank__tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 22px;
}
.kit-rank__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.kit-rrow {
  cursor: pointer;
  display: grid;
  grid-template-columns: 34px auto 1fr auto;
  gap: 14px;
  align-items: center;
}
.kit-rrow__num {
  font: var(--weight-extra) var(--text-xl) var(--font-sans);
  color: var(--text-faint);
  letter-spacing: -0.02em;
  text-align: center;
}
.kit-rrow__num--top {
  color: var(--brand);
}
.kit-rrow__mid {
  min-width: 0;
}
.kit-rrow__name {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}
.kit-rrow__model {
  font: var(--weight-bold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
  white-space: nowrap;
}
.kit-rrow__org {
  font: var(--text-xs) var(--font-mono);
  color: var(--text-faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.kit-rrow__bar {
  height: 6px;
  border-radius: 3px;
  background: var(--warm-100);
  margin-top: 8px;
  overflow: hidden;
  max-width: 360px;
}
.kit-rrow__fill {
  height: 100%;
  background: var(--grad-brand);
  border-radius: 3px;
}
.kit-rrow__right {
  text-align: right;
}
.kit-rrow__tok {
  font: var(--weight-bold) var(--text-md) var(--font-mono);
  color: var(--text-strong);
}
.kit-rrow__trend {
  font: var(--weight-semibold) var(--text-xs) var(--font-sans);
  margin-top: 2px;
}
.kit-up {
  color: var(--success);
}
.kit-down {
  color: var(--danger);
}
</style>
