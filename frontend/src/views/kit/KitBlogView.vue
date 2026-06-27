<template>
  <KitMarketingShell active="blog">
    <main class="kb-wrap">
      <h1 class="kb-h1">{{ t('marketing.blog.title') }}</h1>
      <p class="kb-sub">{{ t('marketing.blog.sub') }}</p>

      <div class="ko-card kb-empty">
        <span class="kb-empty__icon"><component :is="icons.Sparkle" :size="26" /></span>
        <h2 class="kb-empty__t">{{ t('marketing.blog.emptyTitle') }}</h2>
        <p class="kb-empty__d">{{ t('marketing.blog.emptyBody') }}</p>
      </div>
    </main>
  </KitMarketingShell>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import '@/styles/kit-components.css'
import KitMarketingShell from '@/components/kit/KitMarketingShell.vue'
import { kitIcons as icons } from '@/components/kit/icons'

const { t } = useI18n()
</script>

<style scoped>
.kb-wrap {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 52px 28px 72px;
}
.kb-h1 {
  font: var(--type-h1);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.kb-sub {
  font: var(--type-body);
  color: var(--text-muted);
  margin: 6px 0 36px;
}
.kb-empty {
  text-align: center;
  padding: 60px 28px;
  max-width: 560px;
  margin: 0 auto;
}
.kb-empty__icon {
  display: inline-flex;
  width: 56px;
  height: 56px;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg, 14px);
  background: var(--grad-brand-soft);
  border: 1px solid var(--coral-200);
  color: var(--coral-600);
  margin-bottom: 16px;
}
.kb-empty__t {
  font: var(--type-h3);
  color: var(--text-strong);
}
.kb-empty__d {
  font: var(--text-sm) / 1.6 var(--font-sans);
  color: var(--text-muted);
  margin-top: 8px;
}
</style>
