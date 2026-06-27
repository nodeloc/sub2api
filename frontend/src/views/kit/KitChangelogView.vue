<template>
  <KitMarketingShell active="changelog">
    <main class="kl-wrap">
      <h1 class="kl-h1">{{ t('marketing.changelog.title') }}</h1>
      <p class="kl-sub">{{ t('marketing.changelog.sub') }}</p>

      <div v-if="version" class="kl-version">
        <span class="ko-badge ko-badge--brand">{{ t('marketing.changelog.runningOn') }}</span>
        <span class="kl-version__num">v{{ version }}</span>
      </div>

      <div class="ko-card kl-empty">
        <span class="kl-empty__icon"><component :is="icons.List" :size="24" /></span>
        <h2 class="kl-empty__t">{{ t('marketing.changelog.emptyTitle') }}</h2>
        <p class="kl-empty__d">{{ t('marketing.changelog.emptyBody') }}</p>
      </div>
    </main>
  </KitMarketingShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import '@/styles/kit-components.css'
import KitMarketingShell from '@/components/kit/KitMarketingShell.vue'
import { kitIcons as icons } from '@/components/kit/icons'
import { useAppStore } from '@/stores'

const { t } = useI18n()
const appStore = useAppStore()
const version = computed(() => appStore.cachedPublicSettings?.version || '')
</script>

<style scoped>
.kl-wrap {
  max-width: 820px;
  margin: 0 auto;
  padding: 56px 28px 64px;
}
.kl-h1 {
  font: var(--type-h1);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.kl-sub {
  font: var(--type-body);
  color: var(--text-muted);
  margin: 6px 0 28px;
}
.kl-version {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}
.kl-version__num {
  font: var(--weight-extra) var(--text-lg) var(--font-mono);
  color: var(--text-strong);
}
.kl-empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 28px;
}
.kl-empty__icon {
  display: inline-flex;
  width: 46px;
  height: 46px;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--surface-sunken);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  margin-bottom: 6px;
}
.kl-empty__t {
  font: var(--type-h3);
  color: var(--text-strong);
}
.kl-empty__d {
  font: var(--text-sm) / 1.6 var(--font-sans);
  color: var(--text-muted);
}
</style>
