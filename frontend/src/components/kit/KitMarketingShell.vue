<template>
  <div class="km-root">
    <!-- Nav -->
    <div class="km-nav">
      <div class="km-wrap km-navrow">
        <router-link to="/" class="km-logo">
          <img v-if="siteLogo" :src="siteLogo" alt="" class="km-logo__img" />
          <span class="km-logo__name">{{ siteName }}</span>
        </router-link>
        <nav class="km-links">
          <a class="km-link" href="/#models">Models</a>
          <a class="km-link" href="/#how">How it works</a>
          <router-link class="km-link" :class="{ 'km-link--active': active === 'pricing' }" to="/pricing">Pricing</router-link>
          <router-link class="km-link" :class="{ 'km-link--active': active === 'docs' }" to="/docs">Docs</router-link>
        </nav>
        <div class="km-actions">
          <router-link class="km-link" to="/login">Sign in</router-link>
          <router-link to="/login" class="ko-btn ko-btn--primary ko-btn--sm">Start free</router-link>
        </div>
      </div>
    </div>

    <slot />

    <!-- Footer -->
    <footer class="km-footer">
      <div class="km-wrap km-footer__grid">
        <div>
          <router-link to="/" class="km-logo">
            <img v-if="siteLogo" :src="siteLogo" alt="" class="km-logo__img" />
            <span class="km-logo__name">{{ siteName }}</span>
          </router-link>
          <p class="km-footer__tag">One API for every AI model. Keep it simple.</p>
        </div>
        <div v-for="col in cols" :key="col.head" class="km-footer__col">
          <div class="km-footer__head">{{ col.head }}</div>
          <div class="km-footer__links">
            <template v-for="i in col.items" :key="i.label">
              <router-link v-if="i.to" :to="i.to" class="km-link">{{ i.label }}</router-link>
              <span v-else class="km-link km-link--muted">{{ i.label }}</span>
            </template>
          </div>
        </div>
      </div>
      <div class="km-wrap km-footer__copy">© {{ year }} {{ siteName }} · Keep It Simple, Stupid.</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores'

defineProps<{ active?: string }>()

const appStore = useAppStore()
const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'kissopen')
const siteLogo = computed(() => appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '')
const year = new Date().getFullYear()

const cols: { head: string; items: { label: string; to?: string }[] }[] = [
  { head: 'Product', items: [
    { label: 'Models', to: '/models' },
    { label: 'Playground', to: '/playground' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Credits', to: '/credits' },
  ] },
  { head: 'Developers', items: [
    { label: 'Docs', to: '/docs' },
    { label: 'Quickstart', to: '/docs' },
    { label: 'API keys', to: '/keys' },
    { label: 'Changelog' },
  ] },
  { head: 'Company', items: [
    { label: 'About' },
    { label: 'Blog' },
    { label: 'Careers' },
    { label: 'Contact' },
  ] },
]
</script>

<style scoped>
.km-root {
  min-height: 100vh;
  background: var(--surface-page);
  color: var(--text-body);
  font-family: var(--font-sans);
}
.km-wrap {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 28px;
}
.km-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  background: color-mix(in srgb, var(--surface-page) 82%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-subtle);
}
.km-navrow {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 64px;
}
.km-logo {
  display: flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
}
.km-logo__img {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  object-fit: contain;
}
.km-logo__name {
  font: var(--weight-extra) var(--text-lg) var(--font-sans);
  letter-spacing: -0.03em;
  color: var(--text-strong);
}
.km-links {
  display: flex;
  gap: 22px;
  margin-left: 8px;
}
.km-link {
  font: var(--weight-medium) var(--text-sm) var(--font-sans);
  color: var(--text-muted);
  text-decoration: none;
  transition: color var(--dur-fast) var(--ease-out);
}
.km-link:hover {
  color: var(--text-strong);
}
.km-link--muted {
  color: var(--text-faint);
  cursor: default;
}
.km-link--muted:hover {
  color: var(--text-faint);
}
.km-link--active {
  color: var(--text-strong);
  font-weight: var(--weight-semibold);
}
.km-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}
@media (max-width: 720px) {
  .km-links {
    display: none;
  }
}
.km-footer {
  border-top: 1px solid var(--border-subtle);
  background: var(--surface-card);
}
.km-footer__grid {
  padding: 48px 28px;
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
  gap: 24px;
}
@media (max-width: 760px) {
  .km-footer__grid {
    grid-template-columns: 1fr 1fr;
  }
}
.km-footer__tag {
  font: var(--text-sm) var(--font-sans);
  color: var(--text-faint);
  margin-top: 12px;
  max-width: 230px;
}
.km-footer__head {
  font: var(--weight-semibold) var(--text-2xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-faint);
  margin-bottom: 12px;
}
.km-footer__links {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.km-footer__copy {
  padding: 0 28px 32px;
  font: var(--text-xs) var(--font-sans);
  color: var(--text-faint);
}
</style>
