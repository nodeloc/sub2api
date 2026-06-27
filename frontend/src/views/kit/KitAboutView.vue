<template>
  <KitMarketingShell active="about">
    <!-- Hero -->
    <section class="ka-hero">
      <div class="ka-bloom"></div>
      <div class="ka-wrap ka-hero__inner">
        <span class="ko-badge ko-badge--brand"><span class="ko-badge__dot"></span>{{ t('marketing.about.badge') }}</span>
        <h1 class="ka-title">{{ t('marketing.about.title1') }}<span class="ka-grad">{{ t('marketing.about.title2') }}</span></h1>
        <p class="ka-lead">{{ t('marketing.about.intro') }}</p>
      </div>
    </section>

    <!-- Story -->
    <section class="ka-band-plain">
      <div class="ka-wrap ka-prose">
        <h2 class="ka-h2">{{ t('marketing.about.storyHead') }}</h2>
        <p class="ka-p">{{ t('marketing.about.story1') }}</p>
        <p class="ka-p">{{ t('marketing.about.story2') }}</p>
        <p class="ka-p">
          {{ t('marketing.about.story3prefix') }}<strong>{{ t('marketing.about.story3kiss') }}</strong>{{ t('marketing.about.story3kissText') }}<strong>{{ t('marketing.about.story3open') }}</strong>{{ t('marketing.about.story3openText') }}
        </p>
      </div>
    </section>

    <!-- Values -->
    <section class="ka-band">
      <div class="ka-wrap">
        <h2 class="ka-h2 ka-h2--mb">{{ t('marketing.about.valuesHead') }}</h2>
        <div class="ka-values">
          <div v-for="v in values" :key="v.t" class="ko-card ka-value">
            <span class="ka-value__icon"><component :is="v.icon" :size="21" /></span>
            <h3 class="ka-value__t">{{ v.t }}</h3>
            <p class="ka-value__d">{{ v.d }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section>
      <div class="ka-wrap ka-cta-wrap">
        <div class="ka-cta">
          <div>
            <h2 class="ka-cta__t">{{ t('marketing.about.ctaTitle') }}</h2>
            <p class="ka-cta__s">{{ t('marketing.about.ctaSub') }}</p>
          </div>
          <div class="ka-cta__actions">
            <router-link to="/careers" class="ko-btn ko-btn--lg ka-cta__btn ka-cta__btn--solid">{{ t('marketing.about.ctaRoles') }}</router-link>
            <router-link to="/contact" class="ko-btn ko-btn--lg ka-cta__btn ka-cta__btn--ghost">{{ t('marketing.about.ctaContact') }}</router-link>
          </div>
        </div>
      </div>
    </section>
  </KitMarketingShell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import '@/styles/kit-components.css'
import KitMarketingShell from '@/components/kit/KitMarketingShell.vue'
import { kitIcons as icons } from '@/components/kit/icons'

const { t } = useI18n()
const values = computed(() => [
  { icon: icons.Bolt, t: t('marketing.about.v1t'), d: t('marketing.about.v1d') },
  { icon: icons.Grid, t: t('marketing.about.v2t'), d: t('marketing.about.v2d') },
  { icon: icons.Wallet, t: t('marketing.about.v3t'), d: t('marketing.about.v3d') },
  { icon: icons.Sparkle, t: t('marketing.about.v4t'), d: t('marketing.about.v4d') },
])
</script>

<style scoped>
.ka-wrap {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 28px;
}
.ka-hero {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid var(--border-subtle);
}
.ka-bloom {
  position: absolute;
  top: -160px;
  right: -100px;
  width: 460px;
  height: 460px;
  background: radial-gradient(circle, rgba(244, 154, 182, 0.28), transparent 62%);
  pointer-events: none;
}
.ka-hero__inner {
  padding: 76px 28px 64px;
  position: relative;
}
.ka-title {
  font: var(--weight-extra) var(--text-4xl) var(--font-sans);
  letter-spacing: -0.03em;
  line-height: 1.08;
  margin: 18px 0 0;
  max-width: 720px;
  color: var(--text-strong);
}
.ka-grad {
  background: var(--grad-brand);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.ka-lead {
  font: var(--text-md) / 1.6 var(--font-sans);
  color: var(--text-muted);
  max-width: 560px;
  margin-top: 20px;
}
.ka-band {
  background: var(--surface-card);
  border-top: 1px solid var(--border-subtle);
}
.ka-band-plain .ka-wrap {
  padding-top: 64px;
  padding-bottom: 64px;
}
.ka-band .ka-wrap {
  padding-top: 64px;
  padding-bottom: 64px;
}
.ka-prose {
  max-width: 680px;
}
.ka-h2 {
  font: var(--type-h2);
  letter-spacing: -0.02em;
  color: var(--text-strong);
  margin-bottom: 16px;
}
.ka-h2--mb {
  margin-bottom: 28px;
}
.ka-p {
  font: var(--text-md) / 1.7 var(--font-sans);
  color: var(--text-body);
  margin: 0 0 16px;
}
.ka-p:last-child {
  margin-bottom: 0;
}
.ka-p strong {
  color: var(--text-strong);
  font-weight: var(--weight-bold);
}
.ka-values {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
@media (max-width: 720px) {
  .ka-values {
    grid-template-columns: 1fr;
  }
}
.ka-value {
  display: flex;
  flex-direction: column;
  gap: 11px;
}
.ka-value__icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--grad-brand-soft);
  border: 1px solid var(--coral-200);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--coral-600);
}
.ka-value__t {
  font: var(--type-h3);
}
.ka-value__d {
  font: var(--text-sm) / 1.55 var(--font-sans);
  color: var(--text-muted);
}
.ka-cta-wrap {
  padding: 56px 28px 72px;
}
.ka-cta {
  background: var(--grad-brand);
  border-radius: var(--radius-2xl, 24px);
  padding: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  box-shadow: var(--shadow-brand);
}
.ka-cta__t {
  font: var(--weight-extra) var(--text-2xl) var(--font-sans);
  color: #fff;
  letter-spacing: -0.02em;
}
.ka-cta__s {
  font: var(--text-md) var(--font-sans);
  color: rgba(255, 255, 255, 0.9);
  margin-top: 6px;
}
.ka-cta__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.ka-cta__btn {
  text-decoration: none;
}
.ka-cta__btn--solid {
  background: #fff;
  color: var(--coral-600);
}
.ka-cta__btn--ghost {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}
</style>
