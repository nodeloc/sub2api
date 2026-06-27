<template>
  <KitMarketingShell active="careers">
    <!-- Hero -->
    <section class="kc-hero">
      <div class="kc-bloom"></div>
      <div class="kc-wrap kc-hero__inner">
        <span class="ko-badge ko-badge--brand"><span class="ko-badge__dot"></span>{{ t('marketing.careers.badge') }}</span>
        <h1 class="kc-title">{{ t('marketing.careers.title') }}</h1>
        <p class="kc-lead">{{ t('marketing.careers.intro') }}</p>
      </div>
    </section>

    <!-- Perks -->
    <section class="kc-band">
      <div class="kc-wrap kc-band__inner">
        <div class="kc-perks">
          <div v-for="p in perks" :key="p.t" class="kc-perk">
            <span class="kc-perk__icon"><component :is="p.icon" :size="20" /></span>
            <h3 class="kc-perk__t">{{ p.t }}</h3>
            <p class="kc-perk__d">{{ p.d }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Roles (honest empty state) -->
    <section>
      <div class="kc-wrap kc-roles">
        <h2 class="kc-h2">{{ t('marketing.careers.rolesHead') }}</h2>
        <div class="ko-card kc-empty">
          <h3 class="kc-empty__t">{{ t('marketing.careers.noRolesTitle') }}</h3>
          <p class="kc-empty__d">{{ t('marketing.careers.noRolesBody') }}</p>
          <router-link to="/contact" class="kc-empty__link">{{ t('marketing.careers.sayHello') }}</router-link>
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
const perks = computed(() => [
  { icon: icons.Grid, t: t('marketing.careers.p1t'), d: t('marketing.careers.p1d') },
  { icon: icons.Wallet, t: t('marketing.careers.p2t'), d: t('marketing.careers.p2d') },
  { icon: icons.Sparkle, t: t('marketing.careers.p3t'), d: t('marketing.careers.p3d') },
  { icon: icons.Bolt, t: t('marketing.careers.p4t'), d: t('marketing.careers.p4d') },
])
</script>

<style scoped>
.kc-wrap {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 28px;
}
.kc-hero {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid var(--border-subtle);
}
.kc-bloom {
  position: absolute;
  top: -150px;
  right: -90px;
  width: 440px;
  height: 440px;
  background: radial-gradient(circle, rgba(242, 104, 92, 0.22), transparent 62%);
  pointer-events: none;
}
.kc-hero__inner {
  padding: 72px 28px 56px;
  position: relative;
}
.kc-title {
  font: var(--weight-extra) var(--text-4xl) var(--font-sans);
  letter-spacing: -0.03em;
  line-height: 1.08;
  margin: 18px 0 0;
  max-width: 680px;
  color: var(--text-strong);
}
.kc-lead {
  font: var(--text-md) / 1.6 var(--font-sans);
  color: var(--text-muted);
  max-width: 540px;
  margin-top: 18px;
}
.kc-band {
  background: var(--surface-card);
  border-bottom: 1px solid var(--border-subtle);
}
.kc-band__inner {
  padding: 56px 28px;
}
.kc-perks {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
@media (max-width: 880px) {
  .kc-perks {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 520px) {
  .kc-perks {
    grid-template-columns: 1fr;
  }
}
.kc-perk {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.kc-perk__icon {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  background: var(--grad-brand-soft);
  border: 1px solid var(--coral-200);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--coral-600);
}
.kc-perk__t {
  font: var(--weight-bold) var(--text-md) var(--font-sans);
  color: var(--text-strong);
}
.kc-perk__d {
  font: var(--text-sm) / 1.5 var(--font-sans);
  color: var(--text-muted);
}
.kc-roles {
  padding: 56px 28px 64px;
  max-width: 920px;
}
.kc-h2 {
  font: var(--type-h2);
  letter-spacing: -0.02em;
  color: var(--text-strong);
  margin-bottom: 20px;
}
.kc-empty {
  text-align: center;
  padding: 44px 28px;
}
.kc-empty__t {
  font: var(--type-h3);
  color: var(--text-strong);
}
.kc-empty__d {
  font: var(--text-sm) var(--font-sans);
  color: var(--text-muted);
  margin: 8px 0 14px;
}
.kc-empty__link {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--brand);
  text-decoration: none;
}
.kc-empty__link:hover {
  text-decoration: underline;
}
</style>
