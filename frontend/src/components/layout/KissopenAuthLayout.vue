<template>
  <!-- Fork-local kissopen split-screen auth shell. Mirrors the design's
       brand panel + form layout while keeping each auth view's form
       markup (and all real auth logic) untouched inside the default slot. -->
  <div class="koauth">
    <!-- Brand panel -->
    <div class="koauth__brand">
      <div class="koauth__bloom koauth__bloom--tr"></div>
      <div class="koauth__bloom koauth__bloom--bl"></div>
      <div class="koauth__logo">
        <img v-if="siteLogo" :src="siteLogo" alt="" class="koauth__logo-img" />
        <span v-else class="koauth__logo-fallback">{{ initial }}</span>
        <span class="koauth__wm">{{ siteName }}</span>
      </div>
      <div class="koauth__body">
        <div class="koauth__quote">{{ t('auth.brandQuote') }}</div>
        <p class="koauth__sub">{{ t('auth.brandSub') }}</p>
        <div class="koauth__stats">
          <div class="koauth__stat"><b>240+</b><span>{{ t('auth.statModels') }}</span></div>
          <div class="koauth__stat"><b>1</b><span>{{ t('auth.statKey') }}</span></div>
          <div class="koauth__stat"><b>99.98%</b><span>{{ t('auth.statUptime') }}</span></div>
        </div>
      </div>
    </div>

    <!-- Form panel -->
    <div class="koauth__form">
      <div class="koauth__inner">
        <!-- compact brand shown only when the brand panel is hidden (mobile) -->
        <div class="koauth__mobilebrand">
          <img v-if="siteLogo" :src="siteLogo" alt="" class="koauth__logo-img" />
          <span v-else class="koauth__logo-fallback">{{ initial }}</span>
          <span class="koauth__wm">{{ siteName }}</span>
        </div>

        <slot />

        <div class="koauth__footer">
          <slot name="footer" />
        </div>

        <div class="koauth__copy">&copy; {{ currentYear }} {{ siteName }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores'
import { sanitizeUrl } from '@/utils/url'

const { t } = useI18n()
const appStore = useAppStore()

const siteName = computed(() => appStore.siteName || 'kissopen')
const siteLogo = computed(() => sanitizeUrl(appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const initial = computed(() => (siteName.value ? siteName.value.charAt(0).toUpperCase() : 'K'))
const currentYear = computed(() => new Date().getFullYear())

onMounted(() => {
  appStore.fetchPublicSettings()
})
</script>

<style scoped>
.koauth {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  min-height: 100vh;
  background: var(--surface-card);
  color: var(--text-body);
  font-family: var(--font-sans);
}

/* ---- Brand panel ---- */
.koauth__brand {
  position: relative;
  overflow: hidden;
  background: var(--grad-brand);
  display: flex;
  flex-direction: column;
  padding: 44px;
  color: #fff;
}
.koauth__bloom {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.koauth__bloom--tr {
  top: -120px;
  right: -80px;
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.28), transparent 65%);
}
.koauth__bloom--bl {
  bottom: -140px;
  left: -100px;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(244, 154, 182, 0.55), transparent 62%);
}
.koauth__logo {
  display: flex;
  align-items: center;
  gap: 11px;
  position: relative;
  z-index: 2;
}
.koauth__logo-img {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.16);
}
.koauth__logo-fallback {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font: var(--weight-extra) var(--text-md) var(--font-sans);
}
.koauth__wm {
  font: var(--weight-extra) var(--text-xl) var(--font-sans);
  letter-spacing: -0.03em;
  color: #fff;
}
.koauth__body {
  margin-top: auto;
  position: relative;
  z-index: 2;
}
.koauth__quote {
  font: var(--weight-extra) var(--text-4xl) var(--font-sans);
  letter-spacing: -0.025em;
  line-height: 1.08;
  max-width: 13ch;
}
.koauth__sub {
  font: var(--text-md) var(--font-sans);
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.88);
  margin-top: 16px;
  max-width: 38ch;
}
.koauth__stats {
  display: flex;
  gap: 30px;
  margin-top: 34px;
}
.koauth__stat b {
  display: block;
  font: var(--weight-extra) var(--text-2xl) var(--font-sans);
}
.koauth__stat span {
  font: var(--text-xs) var(--font-sans);
  color: rgba(255, 255, 255, 0.82);
}

/* ---- Form panel ---- */
.koauth__form {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: var(--surface-page);
}
.koauth__inner {
  width: 100%;
  max-width: 380px;
}
.koauth__mobilebrand {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 26px;
}
.koauth__mobilebrand .koauth__logo-img {
  background: var(--surface-sunken);
}
.koauth__mobilebrand .koauth__logo-fallback {
  background: var(--grad-brand);
}
.koauth__mobilebrand .koauth__wm {
  color: var(--text-strong);
}
.koauth__footer {
  margin-top: 18px;
  text-align: center;
  font: var(--text-sm) var(--font-sans);
  color: var(--text-muted);
}
.koauth__copy {
  margin-top: 26px;
  text-align: center;
  font: var(--text-xs) var(--font-sans);
  color: var(--text-faint);
}

@media (max-width: 880px) {
  .koauth {
    grid-template-columns: 1fr;
  }
  .koauth__brand {
    display: none;
  }
  .koauth__mobilebrand {
    display: flex;
  }
}
</style>
