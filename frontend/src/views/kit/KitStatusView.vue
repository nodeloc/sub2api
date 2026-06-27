<template>
  <KitMarketingShell active="status">
    <main class="ks-wrap">
      <!-- Banner -->
      <div class="ko-card ks-banner">
        <span class="ks-banner__icon"><component :is="icons.Check" :size="24" /></span>
        <div>
          <h1 class="ks-banner__t">{{ t('marketing.status.operational') }}</h1>
          <p class="ks-banner__s">{{ t('marketing.status.operationalSub') }}</p>
        </div>
      </div>

      <!-- Components -->
      <h2 class="ks-h2">{{ t('marketing.status.componentsHead') }}</h2>
      <div v-for="c in components" :key="c.key" class="ko-card ks-comp">
        <div class="ks-comp__top">
          <span class="ks-comp__name">{{ c.label }}</span>
          <span class="ks-comp__state">
            <i class="ks-comp__dot"></i> {{ t('marketing.status.statusOperational') }}
          </span>
        </div>
        <div class="ks-bars">
          <i v-for="n in 90" :key="n"></i>
        </div>
      </div>

      <!-- Incidents -->
      <h2 class="ks-h2 ks-h2--mt">{{ t('marketing.status.incidentsHead') }}</h2>
      <div class="ko-card ks-empty">
        <h3 class="ks-empty__t">{{ t('marketing.status.noIncidentsTitle') }}</h3>
        <p class="ks-empty__d">{{ t('marketing.status.noIncidentsBody') }}</p>
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

const { t } = useI18n()
const components = computed(() => [
  { key: 'gateway', label: t('marketing.status.cGateway') },
  { key: 'routing', label: t('marketing.status.cRouting') },
  { key: 'playground', label: t('marketing.status.cPlayground') },
  { key: 'dashboard', label: t('marketing.status.cDashboard') },
  { key: 'billing', label: t('marketing.status.cBilling') },
])
</script>

<style scoped>
.ks-wrap {
  max-width: 960px;
  margin: 0 auto;
  padding: 48px 28px 64px;
}
.ks-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  background: var(--green-50, rgba(47, 158, 110, 0.08));
  border-color: var(--green-200, rgba(47, 158, 110, 0.3));
}
.ks-banner__icon {
  width: 46px;
  height: 46px;
  flex: none;
  border-radius: 50%;
  background: var(--green-500, #2f9e6e);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.ks-banner__t {
  font: var(--type-h2);
  letter-spacing: -0.02em;
  color: var(--green-700, #1f7a52);
}
.ks-banner__s {
  font: var(--text-sm) var(--font-sans);
  color: var(--green-600, #2f9e6e);
  margin-top: 2px;
}
.ks-h2 {
  font: var(--type-h3);
  color: var(--text-strong);
  margin-bottom: 16px;
}
.ks-h2--mt {
  margin-top: 40px;
}
.ks-comp {
  margin-bottom: 14px;
}
.ks-comp__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.ks-comp__name {
  font: var(--weight-semibold) var(--text-md) var(--font-sans);
  color: var(--text-strong);
}
.ks-comp__state {
  display: flex;
  align-items: center;
  gap: 7px;
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--green-600, #2f9e6e);
}
.ks-comp__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--green-500, #2f9e6e);
}
.ks-bars {
  display: flex;
  gap: 2px;
}
.ks-bars i {
  flex: 1;
  height: 28px;
  border-radius: 2px;
  background: var(--green-400, #4ab07f);
}
.ks-empty {
  text-align: center;
  padding: 36px 28px;
}
.ks-empty__t {
  font: var(--weight-semibold) var(--text-md) var(--font-sans);
  color: var(--text-strong);
}
.ks-empty__d {
  font: var(--text-sm) var(--font-sans);
  color: var(--text-muted);
  margin-top: 6px;
}
</style>
