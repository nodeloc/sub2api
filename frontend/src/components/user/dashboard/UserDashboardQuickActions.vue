<template>
  <div class="card">
    <div class="border-b border-gray-100 px-6 py-4 dark:border-dark-700">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('dashboard.quickActions') }}</h2>
    </div>
    <div class="space-y-3 p-4">
      <button @click="router.push('/keys')" class="qa-action group">
        <div class="qa-chip flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
          <Icon name="key" size="lg" class="text-primary-600 dark:text-primary-400" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('dashboard.createApiKey') }}</p>
          <p class="text-xs text-gray-500 dark:text-dark-400">{{ t('dashboard.generateNewKey') }}</p>
        </div>
        <Icon
          name="chevronRight"
          size="md"
          class="qa-chev text-gray-400 group-hover:text-primary-500 dark:text-dark-500"
        />
      </button>

      <button @click="router.push('/logs')" class="qa-action group">
        <div class="qa-chip flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
          <Icon name="chart" size="lg" class="text-primary-600 dark:text-primary-400" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('dashboard.viewUsage') }}</p>
          <p class="text-xs text-gray-500 dark:text-dark-400">{{ t('dashboard.checkDetailedLogs') }}</p>
        </div>
        <Icon
          name="chevronRight"
          size="md"
          class="qa-chev text-gray-400 group-hover:text-primary-500 dark:text-dark-500"
        />
      </button>

      <button @click="router.push('/redeem')" class="qa-action group">
        <div class="qa-chip flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-secondary-100 dark:bg-secondary-900/30">
          <Icon name="gift" size="lg" class="text-secondary-600 dark:text-secondary-400" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 dark:text-white">{{ t('dashboard.redeemCode') }}</p>
          <p class="text-xs text-gray-500 dark:text-dark-400">{{ t('dashboard.addBalanceWithCode') }}</p>
        </div>
        <Icon
          name="chevronRight"
          size="md"
          class="qa-chev text-gray-400 group-hover:text-secondary-500 dark:text-dark-500"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
const router = useRouter()
const { t } = useI18n()
</script>

<style scoped>
/* kissopen interaction model — quick, gentle ease-out; warm hover wash,
   tiny shrink on press, gentle chevron nudge. No bouncy overshoot. */
.qa-action {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 16px;
  padding: 16px;
  text-align: left;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: var(--surface-sunken);
  transition: background var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-base) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
}
.qa-action:hover {
  background: var(--surface-hover);
  border-color: var(--border-subtle);
  box-shadow: var(--shadow-sm);
}
.qa-action:active {
  transform: scale(0.985);
}
.qa-action:focus-visible {
  outline: none;
  box-shadow: var(--ring-focus);
}
.qa-chip {
  transition: transform var(--dur-base) var(--ease-out);
}
.qa-action:hover .qa-chip {
  transform: scale(1.05);
}
.qa-chev {
  transition: transform var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.qa-action:hover .qa-chev {
  transform: translateX(3px);
}
</style>
