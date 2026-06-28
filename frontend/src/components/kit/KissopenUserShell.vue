<template>
  <div class="us-shell">
    <!-- Mobile backdrop -->
    <div v-if="mobileOpen" class="us-backdrop" @click="mobileOpen = false"></div>

    <!-- Sidebar -->
    <aside class="us-side" :class="{ 'us-side--collapsed': collapsed, 'us-side--open': mobileOpen }">
      <div class="us-brand">
        <img v-if="siteLogo" :src="siteLogo" alt="" class="us-brand__img" />
        <span v-else class="us-brand__fallback">{{ initial }}</span>
        <span v-show="!collapsed" class="us-brand__name">{{ siteName }}</span>
      </div>

      <nav class="us-nav">
        <router-link
          v-for="item in userNavItems"
          :key="item.path"
          :to="item.path"
          class="us-navlink"
          :class="{ 'us-navlink--on': isActive(item.path) }"
          :title="collapsed ? item.label : undefined"
          :data-tour="item.path === '/keys' ? 'sidebar-my-keys' : undefined"
          @click="mobileOpen = false"
        >
          <span class="us-navlink__icon">
            <component :is="item.icon" v-if="item.icon" :size="18" />
            <span v-else-if="item.iconSvg" class="us-navlink__svg" v-html="item.iconSvg"></span>
            <span v-else class="us-navlink__dot"></span>
          </span>
          <span v-show="!collapsed" class="us-navlink__label">{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Balance card -->
      <div class="us-foot">
        <div class="us-balance" :class="{ 'us-balance--collapsed': collapsed }">
          <template v-if="!collapsed">
            <div class="us-balance__label">{{ t('dashboard.balance') }}</div>
            <div class="us-balance__value">${{ formatBalance(balance) }}</div>
          </template>
          <router-link :to="addCreditsPath" class="us-balance__btn" :title="t('dashboard.redeemCode')">
            <component :is="kitIcons.Plus" :size="15" />
            <span v-show="!collapsed">{{ t('dashboard.addBalanceWithCode') }}</span>
          </router-link>
        </div>
      </div>

      <!-- Collapse toggle: round button sitting on the sidebar's right edge -->
      <button class="us-collapse" :title="t('nav.collapse')" @click="toggleCollapse">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path :d="collapsed ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'" />
        </svg>
      </button>
    </aside>

    <!-- Main -->
    <div class="us-main">
      <header class="us-top">
        <button class="us-iconbtn us-hamburger" aria-label="Menu" @click="mobileOpen = true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div class="us-top__spacer"></div>
        <LocaleSwitcher />
        <button class="us-iconbtn" :title="isDark ? t('home.switchToLight') : t('home.switchToDark')" @click="toggleTheme">
          <Icon :name="isDark ? 'sun' : 'moon'" size="md" />
        </button>
        <div class="us-user" @click.stop="menuOpen = !menuOpen">
          <span class="us-avatar">
            <img v-if="avatarUrl" :src="avatarUrl" alt="" class="us-avatar__img" @error="avatarFailed = true" />
            <template v-else>{{ initial }}</template>
          </span>
          <transition name="us-fade">
            <div v-if="menuOpen" class="us-menu" @click.stop>
              <div class="us-menu__email">{{ email }}</div>
              <router-link to="/profile" class="us-menu__item" @click="menuOpen = false">
                <component :is="kitIcons.Settings" :size="16" /> {{ t('nav.profile') }}
              </router-link>
              <button class="us-menu__item us-menu__item--danger" @click="onLogout">
                <component :is="kitIcons.Arrow" :size="16" /> {{ t('nav.logout') }}
              </button>
            </div>
          </transition>
        </div>
      </header>

      <main class="us-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore, useAuthStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'
import { kitIcons } from '@/components/kit/icons'
import { useUserNav } from '@/composables/useUserNav'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()
const { userNavItems, addCreditsPath } = useUserNav()

const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'kissopen')
const siteLogo = computed(() => appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '')
const email = computed(() => authStore.user?.email || '')
const initial = computed(() => (email.value ? email.value.charAt(0).toUpperCase() : 'U'))
const avatarFailed = ref(false)
const avatarUrl = computed(() => (avatarFailed.value ? '' : authStore.user?.avatar_url?.trim() || ''))
const balance = computed(() => authStore.user?.balance ?? 0)

const collapsed = computed(() => appStore.sidebarCollapsed)
function toggleCollapse() {
  appStore.toggleSidebar()
}

const mobileOpen = ref(false)
const menuOpen = ref(false)

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

const formatBalance = (b: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(b)

// Theme toggle — mirrors the app's global theme handling.
const isDark = ref(document.documentElement.classList.contains('dark'))
function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

async function onLogout() {
  menuOpen.value = false
  try {
    await authStore.logout()
  } finally {
    router.push('/login')
  }
}

function closeMenu() {
  menuOpen.value = false
}
onMounted(() => document.addEventListener('click', closeMenu))
onBeforeUnmount(() => document.removeEventListener('click', closeMenu))
</script>

<style scoped>
.us-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--surface-page);
  color: var(--text-body);
  font-family: var(--font-sans);
}

/* ---- Sidebar ---- */
.us-side {
  width: var(--sidebar-w);
  flex: none;
  background: var(--surface-card);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  padding: 18px 14px;
  height: 100vh;
  position: relative;
  z-index: 16;
  transition: width var(--dur-base) var(--ease-out);
}
.us-side--collapsed {
  width: 76px;
  padding: 18px 12px;
}
.us-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 6px 16px;
}
.us-brand__img {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  object-fit: contain;
  flex: none;
}
.us-brand__fallback {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--grad-brand);
  color: #fff;
  font: var(--weight-bold) var(--text-sm) var(--font-sans);
}
.us-brand__name {
  font: var(--weight-extra) var(--text-lg) var(--font-sans);
  letter-spacing: -0.03em;
  color: var(--text-strong);
  white-space: nowrap;
  overflow: hidden;
}
.us-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  flex: 1;
}
.us-navlink {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 11px;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  font: var(--weight-medium) var(--text-sm) var(--font-sans);
  text-decoration: none;
  white-space: nowrap;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.us-navlink:hover {
  background: var(--surface-hover);
  color: var(--text-strong);
}
.us-navlink--on,
.us-navlink--on:hover {
  background: var(--coral-50);
  color: var(--coral-700);
  font-weight: var(--weight-semibold);
}
.us-navlink__icon {
  flex: none;
  width: 18px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.us-navlink__svg :deep(svg) {
  width: 18px;
  height: 18px;
}
.us-navlink__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}
.us-navlink__label {
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---- Balance / collapse ---- */
.us-foot {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.us-balance {
  background: var(--grad-brand-soft);
  border: 1px solid var(--coral-200);
  border-radius: var(--radius-lg);
  padding: 13px;
}
.us-balance--collapsed {
  padding: 8px;
  background: transparent;
  border-color: transparent;
}
.us-balance__label {
  font: var(--weight-semibold) var(--text-2xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--coral-700);
}
.us-balance__value {
  font: var(--weight-extra) var(--text-xl) var(--font-sans);
  color: var(--text-strong);
  margin: 3px 0 9px;
}
.us-balance__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  height: 34px;
  border-radius: var(--radius-pill);
  background: var(--brand);
  color: var(--text-on-brand);
  font: var(--weight-semibold) var(--text-xs) var(--font-sans);
  text-decoration: none;
  transition: background var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
}
.us-balance__btn:hover {
  background: var(--brand-hover);
  box-shadow: var(--shadow-brand);
}
.us-collapse {
  display: none;
  position: absolute;
  top: 66px;
  right: -13px;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-subtle);
  background: var(--surface-card);
  color: var(--text-muted);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(20, 20, 20, 0.12));
  z-index: 2;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
}
.us-collapse:hover {
  background: var(--surface-hover);
  color: var(--text-strong);
  box-shadow: var(--shadow-md, 0 2px 8px rgba(20, 20, 20, 0.16));
}

/* ---- Main ---- */
.us-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.us-top {
  height: 60px;
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-subtle);
  background: color-mix(in srgb, var(--surface-card) 88%, transparent);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 15;
}
.us-top__spacer {
  flex: 1;
}
.us-iconbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.us-iconbtn:hover {
  background: var(--surface-hover);
  color: var(--text-strong);
}
.us-hamburger {
  display: none;
}
.us-user {
  position: relative;
  margin-left: 4px;
  cursor: pointer;
}
.us-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--grad-brand);
  color: #fff;
  font: var(--weight-bold) var(--text-sm) var(--font-sans);
  overflow: hidden;
}
.us-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.us-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  min-width: 200px;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 6px;
  z-index: 30;
}
.us-menu__email {
  font: var(--text-xs) var(--font-mono);
  color: var(--text-faint);
  padding: 6px 10px 8px;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.us-menu__item {
  display: flex;
  align-items: center;
  gap: 9px;
  width: 100%;
  padding: 9px 10px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  color: var(--text-body);
  font: var(--weight-medium) var(--text-sm) var(--font-sans);
  text-decoration: none;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-out);
}
.us-menu__item:hover {
  background: var(--surface-hover);
}
.us-menu__item--danger {
  color: var(--danger);
}
.us-content {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
}
.us-backdrop {
  display: none;
}
.us-fade-enter-active,
.us-fade-leave-active {
  transition: opacity var(--dur-fast) var(--ease-out);
}
.us-fade-enter-from,
.us-fade-leave-to {
  opacity: 0;
}

/* Desktop: show collapse toggle */
@media (min-width: 1024px) {
  .us-collapse {
    display: flex;
  }
}

/* Mobile: sidebar becomes an off-canvas drawer */
@media (max-width: 1023px) {
  .us-side {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 40;
    transform: translateX(-100%);
    box-shadow: var(--shadow-xl);
    width: var(--sidebar-w) !important;
    padding: 18px 14px !important;
  }
  .us-side--open {
    transform: translateX(0);
  }
  .us-side--collapsed {
    width: var(--sidebar-w) !important;
  }
  .us-hamburger {
    display: inline-flex;
  }
  .us-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(27, 22, 20, 0.42);
    z-index: 35;
  }
  .us-content {
    padding: 16px;
  }
}
</style>
