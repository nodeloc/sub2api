<template>
  <div class="kit-shell">
    <!-- Sidebar -->
    <aside class="kit-side">
      <div class="kit-brand">
        <img :src="siteLogo || '/logo.png'" alt="" class="kit-brand__img" />
        <span class="kit-brand__name">{{ siteName }}</span>
      </div>
      <nav class="kit-nav">
        <button
          v-for="n in navItems"
          :key="n.id"
          class="kit-navbtn"
          :class="{ 'kit-navbtn--on': active === n.id }"
          @click="$emit('nav', n.id)"
        >
          <component :is="n.icon" :size="18" />
          {{ n.label }}
        </button>
      </nav>
      <div class="kit-balance">
        <div class="kit-balance__label">Balance</div>
        <div class="kit-balance__value">{{ balance }}</div>
        <button class="ko-btn ko-btn--primary ko-btn--sm ko-btn--block" @click="$emit('nav', 'credits')">
          <component :is="icons.Plus" :size="15" /> Add credits
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="kit-main">
      <header class="kit-top">
        <div class="kit-search">
          <span class="ko-input-wrap__lead"><component :is="icons.Search" :size="17" /></span>
          <input class="ko-input ko-input--has-lead" placeholder="Search 240+ models…" style="height: 38px" />
        </div>
        <div class="kit-top__right">
          <span class="ko-badge ko-badge--success"><span class="ko-badge__dot"></span>All systems go</span>
          <button class="ko-iconbtn" aria-label="Notifications"><component :is="icons.Bell" :size="18" /></button>
          <span class="ko-avatar ko-avatar--sm">AL</span>
        </div>
      </header>
      <main class="kit-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores'
import { kitIcons as icons } from './icons'

defineProps<{ active: string; balance?: string }>()
defineEmits<{ (e: 'nav', id: string): void }>()

const appStore = useAppStore()
const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'kissopen')
const siteLogo = computed(() => appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '')

const navItems = [
  { id: 'home', label: 'Home', icon: icons.Home },
  { id: 'catalog', label: 'Models', icon: icons.Grid },
  { id: 'rankings', label: 'Rankings', icon: icons.Bolt },
  { id: 'providers', label: 'Providers', icon: icons.Filter },
  { id: 'playground', label: 'Playground', icon: icons.Chat },
  { id: 'presets', label: 'Presets', icon: icons.Sparkle },
  { id: 'usage', label: 'Activity', icon: icons.Chart },
  { id: 'credits', label: 'Credits', icon: icons.Wallet },
  { id: 'keys', label: 'API keys', icon: icons.Key },
  { id: 'settings', label: 'Settings', icon: icons.Settings },
]
</script>

<style scoped>
.kit-shell {
  display: flex;
  height: 100vh;
  background: var(--surface-page);
  font-family: var(--font-sans);
  color: var(--text-body);
}
.kit-side {
  width: var(--sidebar-w);
  flex: none;
  background: var(--surface-card);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  padding: 20px 14px;
}
.kit-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px 18px;
}
.kit-brand__img {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  object-fit: contain;
}
.kit-brand__name {
  font: var(--weight-extra) var(--text-lg) var(--font-sans);
  letter-spacing: -0.03em;
  color: var(--text-strong);
}
.kit-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.kit-navbtn {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 11px;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--text-muted);
  font: var(--weight-medium) var(--text-sm) var(--font-sans);
  transition: color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
}
.kit-navbtn:hover {
  color: var(--text-strong);
  background: var(--surface-hover);
}
.kit-navbtn--on,
.kit-navbtn--on:hover {
  background: var(--coral-50);
  color: var(--coral-700);
  font-weight: var(--weight-semibold);
}
.kit-balance {
  margin-top: auto;
  background: var(--grad-brand-soft);
  border: 1px solid var(--coral-200);
  border-radius: var(--radius-lg);
  padding: 14px;
}
.kit-balance__label {
  font: var(--weight-semibold) var(--text-2xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--coral-700);
}
.kit-balance__value {
  font: var(--weight-extra) var(--text-xl) var(--font-sans);
  color: var(--text-strong);
  margin: 3px 0 9px;
}
.kit-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.kit-top {
  height: 60px;
  flex: none;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 24px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--surface-card);
}
.kit-search {
  position: relative;
  flex: 1;
  max-width: 420px;
}
.kit-top__right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
}
.kit-content {
  flex: 1;
  overflow: auto;
  padding: 28px;
}
@media (max-width: 720px) {
  .kit-side {
    display: none;
  }
}
</style>
