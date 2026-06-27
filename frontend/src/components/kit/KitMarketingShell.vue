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
          <a class="km-link" href="/#models">{{ t('home.landing.nav.models') }}</a>
          <a class="km-link" href="/#how">{{ t('home.landing.nav.how') }}</a>
          <router-link class="km-link" :class="{ 'km-link--active': active === 'pricing' }" to="/pricing">{{ t('home.landing.nav.pricing') }}</router-link>
          <router-link class="km-link" :class="{ 'km-link--active': active === 'docs' }" to="/docs">{{ t('home.landing.nav.docs') }}</router-link>
        </nav>
        <div class="km-actions">
          <LocaleSwitcher />
          <button
            class="km-icontoggle"
            :title="isDark ? t('home.switchToLight') : t('home.switchToDark')"
            @click="toggleTheme"
          >
            <Icon v-if="isDark" name="sun" size="md" />
            <Icon v-else name="moon" size="md" />
          </button>
          <template v-if="isAuthenticated">
            <router-link :to="dashboardPath" class="ko-btn ko-btn--primary ko-btn--sm">{{ t('home.dashboard') }}</router-link>
          </template>
          <template v-else>
            <router-link class="km-link km-signin" to="/login">{{ t('home.landing.nav.signIn') }}</router-link>
            <router-link to="/login" class="ko-btn ko-btn--primary ko-btn--sm">{{ t('home.landing.nav.startFree') }}</router-link>
          </template>
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
          <p class="km-footer__tag">{{ t('marketing.footer.tag') }}</p>
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
      <div class="km-wrap km-footer__copy">© {{ year }} {{ siteName }} · {{ t('marketing.footer.copy') }}</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore, useAuthStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'

defineProps<{ active?: string }>()

const { t } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()
const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'kissopen')
const siteLogo = computed(() => appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '')
const year = new Date().getFullYear()

// Auth state — the marketing pages must reflect the real session.
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const dashboardPath = computed(() => (isAdmin.value ? '/admin/dashboard' : '/dashboard'))

// Theme toggle (mirrors the landing page header)
const isDark = ref(document.documentElement.classList.contains('dark'))
function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// Legal / terms documents configured in admin settings, surfaced in the footer.
const legalDocs = computed(() => appStore.cachedPublicSettings?.login_agreement_documents ?? [])

const cols = computed<{ head: string; items: { label: string; to?: string }[] }[]>(() => {
  const result = [
    { head: t('marketing.footer.productHead'), items: [
      { label: t('home.landing.nav.models'), to: '/models' },
      { label: t('marketing.footer.playground'), to: '/playground' },
      { label: t('home.landing.nav.pricing'), to: '/pricing' },
      { label: t('marketing.footer.credits'), to: '/credits' },
    ] },
    { head: t('marketing.footer.devHead'), items: [
      { label: t('home.landing.nav.docs'), to: '/docs' },
      { label: t('marketing.footer.quickstart'), to: '/docs' },
      { label: t('marketing.footer.apiKeys'), to: '/keys' },
    ] },
  ]
  if (legalDocs.value.length) {
    result.push({
      head: t('home.landing.footer.legal'),
      items: legalDocs.value.map((d) => ({ label: d.title, to: `/legal/${d.id}` })),
    })
  }
  return result
})
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
.km-signin {
  white-space: nowrap;
}
.km-icontoggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--surface-card);
  color: var(--text-muted);
  cursor: pointer;
  transition: color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
}
.km-icontoggle:hover {
  color: var(--text-strong);
  border-color: var(--border-strong);
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
