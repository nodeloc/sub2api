<template>
  <div class="card">
    <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-dark-700">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ t('dashboard.recentUsage') }}</h2>
      <span class="badge badge-gray">{{ t('dashboard.last7Days') }}</span>
    </div>
    <div class="p-6">
      <div v-if="loading" class="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
      <div v-else-if="data.length === 0" class="py-8">
        <EmptyState :title="t('dashboard.noUsageRecords')" :description="t('dashboard.startUsingApi')" />
      </div>
      <div v-else class="space-y-3">
        <div v-for="log in data" :key="log.id" class="ru-row flex items-center justify-between rounded-xl p-4">
          <div class="flex items-center gap-4">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-900/30">
              <Icon name="beaker" size="md" class="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ log.model }}</p>
              <p class="text-xs text-gray-500 dark:text-dark-400">{{ formatDateTime(log.created_at) }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold">
              <span class="text-green-600 dark:text-green-400" :title="t('dashboard.actual')">${{ formatCost(log.actual_cost) }}</span>
              <span class="font-normal text-gray-400 dark:text-gray-500" :title="t('dashboard.standard')"> / ${{ formatCost(log.total_cost) }}</span>
            </p>
            <p class="text-xs text-gray-500 dark:text-dark-400">{{ (log.input_tokens + log.output_tokens).toLocaleString() }} tokens</p>
          </div>
        </div>

        <router-link to="/logs" class="ru-all group flex items-center justify-center gap-2 py-3 text-sm font-medium text-primary-600 dark:text-primary-400">
          {{ t('dashboard.viewAllUsage') }}
          <Icon name="arrowRight" size="sm" class="ru-all__arrow" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import Icon from '@/components/icons/Icon.vue'
import { formatDateTime } from '@/utils/format'
import type { UsageLog } from '@/types'

defineProps<{
  data: UsageLog[]
  loading: boolean
}>()
const { t } = useI18n()
const formatCost = (c: number) => c.toFixed(4)
</script>

<style scoped>
/* kissopen interaction model — gentle warm hover wash, ease-out timing,
   subtle arrow nudge on the "view all" link. */
.ru-row {
  background: var(--surface-sunken);
  border: 1px solid transparent;
  transition: background var(--dur-fast) var(--ease-out),
    border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-base) var(--ease-out);
}
.ru-row:hover {
  background: var(--surface-hover);
  border-color: var(--border-subtle);
  box-shadow: var(--shadow-xs);
}
.ru-all {
  transition: color var(--dur-fast) var(--ease-out);
}
.ru-all:hover {
  color: var(--brand-hover);
}
.ru-all__arrow {
  transition: transform var(--dur-fast) var(--ease-out);
}
.ru-all:hover .ru-all__arrow {
  transform: translateX(3px);
}
</style>
