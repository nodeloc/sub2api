<template>
  <!-- Custom Home Content: Full Page Mode -->
  <div v-if="homeContent" class="min-h-screen">
    <!-- iframe mode -->
    <iframe
      v-if="isHomeContentUrl"
      :src="homeContent.trim()"
      class="h-screen w-full border-0"
      allowfullscreen
    ></iframe>
    <!-- HTML mode - SECURITY: homeContent is admin-only setting, XSS risk is acceptable -->
    <div v-else v-html="homeContent"></div>
  </div>

  <!-- Default Home Page — kissopen marketing landing -->
  <div v-else class="lp-root">
    <!-- ============ Nav ============ -->
    <div class="lp-nav">
      <div class="lp-wrap lp-navrow">
        <a href="#top" class="lp-logo">
          <img
            v-if="siteLogo"
            :src="siteLogo"
            alt="logo"
            class="lp-logo-img"
          />
          <span class="lp-logo-mark">{{ siteName }}</span>
        </a>
        <nav class="lp-navnav">
          <a class="lp-navlink" href="#models">{{ t('home.landing.nav.models') }}</a>
          <a class="lp-navlink" href="#how">{{ t('home.landing.nav.how') }}</a>
          <router-link class="lp-navlink" to="/pricing">{{ t('home.landing.nav.pricing') }}</router-link>
          <router-link class="lp-navlink" to="/docs">{{ t('home.landing.nav.docs') }}</router-link>
        </nav>
        <div class="lp-navactions">
          <LocaleSwitcher />
          <button
            class="lp-icontoggle"
            :title="isDark ? t('home.switchToLight') : t('home.switchToDark')"
            @click="toggleTheme"
          >
            <Icon v-if="isDark" name="sun" size="md" />
            <Icon v-else name="moon" size="md" />
          </button>
          <template v-if="isAuthenticated">
            <router-link :to="dashboardPath" class="lp-btn lp-btn-primary lp-btn-sm">
              {{ t('home.dashboard') }}
            </router-link>
          </template>
          <template v-else>
            <router-link to="/login" class="lp-navlink lp-signin">{{ t('home.landing.nav.signIn') }}</router-link>
            <router-link to="/login" class="lp-btn lp-btn-primary lp-btn-sm">{{ t('home.landing.nav.startFree') }}</router-link>
          </template>
        </div>
      </div>
    </div>

    <!-- ============ Hero ============ -->
    <section id="top" class="lp-hero">
      <div class="lp-bloom lp-bloom-pink"></div>
      <div class="lp-bloom lp-bloom-coral"></div>
      <div class="lp-wrap lp-hero-inner">
        <span class="lp-badge lp-badge-brand lp-badge-dot">{{ t('home.landing.hero.badge') }}</span>
        <h1 class="lp-hero-title">
          {{ t('home.landing.hero.titleLine1') }}<br />
          <span class="lp-grad-text">{{ t('home.landing.hero.titleLine2') }}</span>
        </h1>
        <p class="lp-hero-sub">
          {{ t('home.landing.hero.subtitle', { name: siteName }) }}
        </p>
        <div class="lp-hero-cta">
          <router-link :to="ctaPath" class="lp-btn lp-btn-gradient lp-btn-lg">
            {{ t('home.landing.hero.start') }}
            <SvgArrow />
          </router-link>
          <a :href="playgroundLink" class="lp-btn lp-btn-secondary lp-btn-lg">
            <SvgChat />
            {{ t('home.landing.hero.playground') }}
          </a>
        </div>
        <div class="lp-stats">
          <div v-for="s in heroStats" :key="s.label" class="lp-stat">
            <div class="lp-stat-num">{{ s.value }}</div>
            <div class="lp-stat-label">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ Provider logos strip ============ -->
    <div class="lp-wrap lp-logos">
      <div class="lp-logos-eyebrow">{{ t('home.landing.logos.eyebrow') }}</div>
      <div class="lp-logos-row">
        <span v-for="p in providers" :key="p.name" class="lp-logos-name">
          <ModelIcon :model="p.icon" mono size="22px" class="lp-logos-icon" />
          {{ p.name }}
        </span>
      </div>
    </div>

    <!-- ============ How it works ============ -->
    <section id="how" class="lp-band">
      <div class="lp-wrap lp-band-inner">
        <h2 class="lp-h2 lp-center">{{ t('home.landing.how.title') }}</h2>
        <p class="lp-lead lp-center">{{ t('home.landing.how.subtitle') }}</p>
        <div class="lp-grid-3">
          <div v-for="step in steps" :key="step.title" class="lp-card lp-card-hover lp-step">
            <span class="lp-step-icon">
              <component :is="step.icon" />
            </span>
            <h3 class="lp-h3">{{ step.title }}</h3>
            <p class="lp-muted-sm">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ Models ============ -->
    <section id="models">
      <div class="lp-wrap lp-band-inner">
        <div class="lp-models-head">
          <div>
            <h2 class="lp-h2">{{ t('home.landing.models.title') }}</h2>
            <p class="lp-lead">{{ t('home.landing.models.subtitle') }}</p>
          </div>
          <router-link :to="ctaPath" class="lp-btn lp-btn-ghost">
            {{ t('home.landing.models.browseAll') }}
            <SvgArrow />
          </router-link>
        </div>
        <div class="lp-grid-3">
          <div v-for="m in models" :key="m.provider" class="lp-card lp-card-hover lp-model">
            <div class="lp-model-top">
              <span class="lp-model-avatar"><ModelIcon :model="m.name" size="24px" /></span>
              <div class="lp-model-id">
                <div class="lp-model-name">{{ m.name }}</div>
                <div class="lp-model-provider">{{ m.provider }}</div>
              </div>
              <span class="lp-badge lp-badge-dot" :class="statusClass(m.status)">{{ statusLabel(m.status) }}</span>
            </div>
            <p class="lp-muted-sm lp-model-desc">{{ m.description }}</p>
            <div class="lp-model-tags">
              <span class="lp-badge lp-badge-mono">{{ m.context }} {{ t('home.landing.models.ctx') }}</span>
              <span v-for="tag in m.tags" :key="tag" class="lp-badge lp-badge-pink">{{ tag }}</span>
            </div>
            <div class="lp-model-prices">
              <div>
                <div class="lp-price-label">{{ t('home.landing.models.input') }}</div>
                <div class="lp-price-val">{{ m.priceIn }}</div>
              </div>
              <div>
                <div class="lp-price-label">{{ t('home.landing.models.output') }}</div>
                <div class="lp-price-val">{{ m.priceOut }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ Drop-in code ============ -->
    <section class="lp-band">
      <div class="lp-wrap lp-code-row">
        <div>
          <span class="lp-badge lp-badge-pink">{{ t('home.landing.code.badge') }}</span>
          <h2 class="lp-h2 lp-code-h2">{{ t('home.landing.code.title') }}</h2>
          <p class="lp-lead lp-code-lead">
            {{ t('home.landing.code.desc', { name: siteName }) }}
          </p>
          <router-link :to="ctaPath" class="lp-btn lp-btn-primary">
            <SvgCopy />
            {{ t('home.landing.code.copyKey') }}
          </router-link>
        </div>
        <div class="lp-code">
          <div class="lp-code-bar">
            <span class="lp-code-lang">python</span>
          </div>
          <pre class="lp-code-pre"><span class="lp-c-kw">from</span> openai <span class="lp-c-kw">import</span> OpenAI

client = OpenAI(
    base_url=<span class="lp-c-str">"{{ apiBaseUrl }}"</span>,
    api_key=<span class="lp-c-str">"sk-••••••••"</span>,
)

r = client.chat.completions.create(
    model=<span class="lp-c-str">"anthropic/claude-opus"</span>,
    messages=[{<span class="lp-c-str">"role"</span>: <span class="lp-c-str">"user"</span>, <span class="lp-c-str">"content"</span>: <span class="lp-c-str">"hi"</span>}],
)</pre>
        </div>
      </div>
    </section>

    <!-- ============ Pricing ============ -->
    <section id="pricing">
      <div class="lp-wrap lp-band-inner">
        <h2 class="lp-h2 lp-center">{{ t('home.landing.pricing.title') }}</h2>
        <p class="lp-lead lp-center">{{ t('home.landing.pricing.subtitle') }}</p>
        <div class="lp-grid-3 lp-pricing">
          <div
            v-for="p in plans"
            :key="p.name"
            class="lp-card lp-plan"
            :class="{ 'lp-plan-featured': p.featured }"
          >
            <span v-if="p.featured" class="lp-badge lp-badge-solid lp-plan-tag">{{ t('home.landing.pricing.mostPopular') }}</span>
            <h3 class="lp-h3">{{ p.name }}</h3>
            <div class="lp-plan-price">
              <span class="lp-plan-amount">{{ p.price }}</span>
              <span class="lp-plan-note">{{ p.note }}</span>
            </div>
            <div class="lp-plan-feats">
              <div v-for="f in p.feats" :key="f" class="lp-plan-feat">
                <span class="lp-check"><SvgCheck /></span>{{ f }}
              </div>
            </div>
            <router-link
              :to="ctaPath"
              class="lp-btn lp-btn-block"
              :class="p.featured ? 'lp-btn-gradient' : 'lp-btn-secondary'"
            >
              {{ p.cta }}
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ CTA ============ -->
    <section>
      <div class="lp-wrap lp-cta-wrap">
        <div class="lp-cta">
          <h2 class="lp-cta-title">{{ t('home.landing.cta.title') }}</h2>
          <p class="lp-cta-sub">{{ t('home.landing.cta.subtitle') }}</p>
          <div class="lp-cta-btns">
            <router-link :to="ctaPath" class="lp-btn lp-btn-lg lp-cta-btn-light">{{ t('home.landing.cta.createAccount') }}</router-link>
            <a v-if="docUrl" :href="docUrl" target="_blank" rel="noopener noreferrer" class="lp-btn lp-btn-lg lp-cta-btn-glass">{{ t('home.landing.cta.readDocs') }}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ Footer ============ -->
    <footer class="lp-footer">
      <div class="lp-wrap lp-footer-grid">
        <div>
          <a href="#top" class="lp-logo">
            <img v-if="siteLogo" :src="siteLogo" alt="logo" class="lp-logo-img" />
            <span class="lp-logo-mark">{{ siteName }}</span>
          </a>
          <p class="lp-footer-tag">{{ t('home.landing.footer.tagline') }}</p>
          <a href="/status" class="lp-footer-status"><i class="lp-footer-status-dot"></i>{{ t('marketing.footer.statusOperational') }}</a>
        </div>
        <div v-for="col in footerCols" :key="col.head" class="lp-footer-col">
          <div class="lp-footer-head">{{ col.head }}</div>
          <div class="lp-footer-links">
            <a
              v-for="link in col.items"
              :key="link.label"
              :href="link.href"
              :target="link.external ? '_blank' : undefined"
              :rel="link.external ? 'noopener noreferrer' : undefined"
              class="lp-navlink"
            >{{ link.label }}</a>
          </div>
        </div>
      </div>
      <div class="lp-wrap lp-footer-copy">
        © {{ currentYear }} {{ siteName }} · {{ t('home.footer.allRightsReserved') }}
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore, useAppStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import { legalDocTitleKey } from '@/utils/legalDocs'
import Icon from '@/components/icons/Icon.vue'
import ModelIcon from '@/components/common/ModelIcon.vue'

const { t, te, tm, rt } = useI18n()

// Read a localized string array (e.g. pricing feature lists)
function tArr(key: string): string[] {
  const arr = tm(key) as unknown[]
  return Array.isArray(arr) ? arr.map((v) => rt(v as string)) : []
}

const authStore = useAuthStore()
const appStore = useAppStore()

// Site settings - directly from appStore (already initialized from injected config)
const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'Sub2API')
const siteLogo = computed(() => appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '')
const docUrl = computed(() => appStore.cachedPublicSettings?.doc_url || appStore.docUrl || '')
const homeContent = computed(() => appStore.cachedPublicSettings?.home_content || '')

// Check if homeContent is a URL (for iframe display)
const isHomeContentUrl = computed(() => {
  const content = homeContent.value.trim()
  return content.startsWith('http://') || content.startsWith('https://')
})

// Theme
const isDark = ref(document.documentElement.classList.contains('dark'))

// Auth state
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const dashboardPath = computed(() => (isAdmin.value ? '/admin/dashboard' : '/dashboard'))

// Primary CTA destination: dashboard when signed in, otherwise login
const ctaPath = computed(() => (isAuthenticated.value ? dashboardPath.value : '/login'))
const playgroundLink = computed(() => docUrl.value || '/login')
const apiBaseUrl = computed(() => `${window.location.origin}/v1`)

// Current year for footer
const currentYear = computed(() => new Date().getFullYear())

// ---- Landing-page content ----
// Numeric values stay literal; only labels are localized.
const heroStats = computed(() => [
  { value: '240+', label: t('home.landing.stats.models') },
  { value: '1', label: t('home.landing.stats.apiBalance') },
  { value: '99.98%', label: t('home.landing.stats.uptime') },
  { value: '0', label: t('home.landing.stats.lockin') },
])

// `icon` is a model keyword ModelIcon recognizes (the brand names alone don't match).
const providers = [
  { name: 'Anthropic', icon: 'claude' },
  { name: 'OpenAI', icon: 'gpt' },
  { name: 'Google', icon: 'gemini' },
  { name: 'Meta', icon: 'llama' },
  { name: 'Mistral', icon: 'mistral' },
  { name: 'DeepSeek', icon: 'deepseek' },
]

// Inline lucide-style icons (2px stroke, currentColor)
const svg = (children: ReturnType<typeof h>[]) =>
  h(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 2,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    children
  )
const SvgArrow = () => svg([h('path', { d: 'M7 17 17 7' }), h('path', { d: 'M7 7h10v10' })])
const SvgChat = () => svg([h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })])
const SvgCopy = () =>
  svg([
    h('rect', { x: 9, y: 9, width: 12, height: 12, rx: 2 }),
    h('path', { d: 'M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2' }),
  ])
const SvgCheck = () => svg([h('path', { d: 'M20 6 9 17l-5-5' })])
const SvgKey = () =>
  svg([
    h('circle', { cx: 7.5, cy: 15.5, r: 4.5 }),
    h('path', { d: 'm10.7 12.3 9.3-9.3' }),
    h('path', { d: 'M18 5l2 2' }),
    h('path', { d: 'M15 8l2 2' }),
  ])
const SvgBolt = () => svg([h('path', { d: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z' })])
const SvgWallet = () =>
  svg([
    h('path', { d: 'M21 12V7H5a2 2 0 0 1 0-4h14v4' }),
    h('path', { d: 'M3 5v14a2 2 0 0 0 2 2h16v-5' }),
    h('path', { d: 'M18 12a2 2 0 0 0 0 4h4v-4Z' }),
  ])

const steps = computed(() => [
  { icon: SvgKey, title: t('home.landing.how.step1Title'), desc: t('home.landing.how.step1Desc') },
  { icon: SvgBolt, title: t('home.landing.how.step2Title'), desc: t('home.landing.how.step2Desc') },
  { icon: SvgWallet, title: t('home.landing.how.step3Title'), desc: t('home.landing.how.step3Desc') },
])

// Model facts stay literal (names, ids, prices); description + tags are localized.
const modelDefs = [
  { key: 'claudeOpus', name: 'Claude Opus', provider: 'anthropic/claude-opus',
    context: '200K', priceIn: '$3.00 / M', priceOut: '$15.00 / M', tagKeys: ['vision', 'tools'], status: 'operational' },
  { key: 'gpt5', name: 'GPT-5', provider: 'openai/gpt-5',
    context: '256K', priceIn: '$2.50 / M', priceOut: '$10.00 / M', tagKeys: ['vision', 'tools'], status: 'new' },
  { key: 'llama4', name: 'Llama 4 70B', provider: 'meta/llama-4-70b',
    context: '128K', priceIn: '$0.30 / M', priceOut: '$0.40 / M', tagKeys: ['open'], status: 'operational' },
  { key: 'gemini25', name: 'Gemini 2.5 Pro', provider: 'google/gemini-2.5-pro',
    context: '1M', priceIn: '$1.25 / M', priceOut: '$5.00 / M', tagKeys: ['vision', 'audio'], status: 'operational' },
  { key: 'mistralLarge', name: 'Mistral Large', provider: 'mistral/large',
    context: '128K', priceIn: '$0.40 / M', priceOut: '$1.20 / M', tagKeys: ['tools'], status: 'operational' },
  { key: 'deepseekR1', name: 'DeepSeek R1', provider: 'deepseek/r1',
    context: '64K', priceIn: '$0.14 / M', priceOut: '$0.28 / M', tagKeys: ['reasoning', 'open'], status: 'degraded' },
]
const models = computed(() =>
  modelDefs.map((m) => ({
    ...m,
    description: t(`home.landing.models.items.${m.key}.desc`),
    tags: m.tagKeys.map((tk) => t(`home.landing.models.tags.${tk}`)),
  }))
)

function statusLabel(status: string) {
  if (status === 'new') return t('home.landing.models.status.new')
  if (status === 'degraded') return t('home.landing.models.status.degraded')
  return t('home.landing.models.status.operational')
}
function statusClass(status: string) {
  if (status === 'new') return 'lp-badge-brand'
  if (status === 'degraded') return 'lp-badge-warning'
  return 'lp-badge-success'
}

const plans = computed(() =>
  [
    { key: 'payg', featured: false },
    { key: 'team', featured: true },
    { key: 'enterprise', featured: false },
  ].map((p) => ({
    name: t(`home.landing.pricing.${p.key}.name`),
    price: t(`home.landing.pricing.${p.key}.price`),
    note: t(`home.landing.pricing.${p.key}.note`),
    cta: t(`home.landing.pricing.${p.key}.cta`),
    feats: tArr(`home.landing.pricing.${p.key}.feats`),
    featured: p.featured,
  }))
)

// Legal / terms documents configured in admin settings, surfaced in the footer.
const legalDocs = computed(() => appStore.cachedPublicSettings?.login_agreement_documents ?? [])

const footerCols = computed(() => {
  const cols: { head: string; items: { label: string; href: string; external?: boolean }[] }[] = [
    {
      head: t('home.landing.footer.product'),
      items: [
        { label: t('home.landing.nav.models'), href: '#models' },
        { label: t('marketing.footer.playground'), href: '/playground' },
        { label: t('home.landing.nav.pricing'), href: '/pricing' },
        { label: t('marketing.footer.status'), href: '/status' },
      ],
    },
    {
      head: t('home.landing.footer.developers'),
      items: [
        { label: t('home.landing.nav.docs'), href: docUrl.value || '/docs', external: !!docUrl.value },
        { label: t('marketing.footer.apiKeys'), href: '/keys' },
        { label: t('marketing.footer.changelog'), href: '/changelog' },
      ],
    },
    {
      head: t('home.landing.footer.company'),
      items: [
        { label: t('marketing.footer.about'), href: '/about' },
        { label: t('marketing.footer.blog'), href: '/blog' },
        { label: t('marketing.footer.careers'), href: '/careers' },
        { label: t('marketing.footer.contact'), href: '/contact' },
      ],
    },
  ]
  if (legalDocs.value.length) {
    cols.push({
      head: t('home.landing.footer.legal'),
      items: legalDocs.value.map((d) => {
        const key = legalDocTitleKey(d.id)
        return { label: key && te(key) ? t(key) : d.title, href: `/legal/${d.id}` }
      }),
    })
  }
  return cols
})

// Toggle theme
function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// Initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem('theme')
  if (
    savedTheme === 'dark' ||
    (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
}

onMounted(() => {
  initTheme()

  // Check auth state
  authStore.checkAuth()

  // Ensure public settings are loaded (will use cache if already loaded from injected config)
  if (!appStore.publicSettingsLoaded) {
    appStore.fetchPublicSettings()
  }
})
</script>

<style scoped>
/* kissopen marketing landing — driven by the global design tokens
   (src/styles/kissopen-tokens.css). Semantic vars make the derived
   dark variant work automatically. */
.lp-root {
  min-height: 100vh;
  background: var(--surface-page);
  color: var(--text-body);
  font-family: var(--font-sans);
}
.lp-wrap {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 28px;
}
section {
  scroll-margin-top: 80px;
}

/* ---- Nav ---- */
.lp-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  background: color-mix(in srgb, var(--surface-page) 82%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-subtle);
}
.lp-navrow {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 64px;
}
.lp-logo {
  display: flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
}
.lp-logo-img {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  object-fit: contain;
}
.lp-logo-mark {
  font-weight: var(--weight-extra);
  font-size: var(--text-lg);
  letter-spacing: -0.03em;
  color: var(--text-strong);
}
.lp-navnav {
  display: flex;
  gap: 22px;
  margin-left: 8px;
}
.lp-navlink {
  font-weight: var(--weight-medium);
  font-size: var(--text-sm);
  color: var(--text-muted);
  text-decoration: none;
  transition: color var(--dur-fast) var(--ease-out);
}
.lp-navlink:hover {
  color: var(--text-strong);
}
.lp-navactions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}
.lp-signin {
  font-weight: var(--weight-semibold);
}
.lp-icontoggle {
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
  transition: all var(--dur-fast) var(--ease-out);
}
.lp-icontoggle:hover {
  background: var(--surface-hover);
  color: var(--text-strong);
}
@media (max-width: 760px) {
  .lp-navnav {
    display: none;
  }
}

/* ---- Buttons ---- */
.lp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  letter-spacing: -0.005em;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  padding: 0 18px;
  height: 40px;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
  transition: background var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out),
    transform var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.lp-btn:active {
  transform: translateY(0.5px) scale(0.985);
}
.lp-btn :deep(svg) {
  width: 1.05em;
  height: 1.05em;
}
.lp-btn-sm {
  height: 32px;
  padding: 0 14px;
  font-size: var(--text-xs);
}
.lp-btn-lg {
  height: 48px;
  padding: 0 24px;
  font-size: var(--text-base);
}
.lp-btn-block {
  display: flex;
  width: 100%;
}
.lp-btn-primary {
  background: var(--brand);
  color: var(--text-on-brand);
  box-shadow: var(--shadow-xs);
}
.lp-btn-primary:hover {
  background: var(--brand-hover);
  box-shadow: var(--shadow-brand);
}
.lp-btn-secondary {
  background: var(--surface-card);
  color: var(--text-strong);
  border-color: var(--border-default);
  box-shadow: var(--shadow-xs);
}
.lp-btn-secondary:hover {
  background: var(--surface-hover);
  border-color: var(--border-strong);
}
.lp-btn-ghost {
  background: transparent;
  color: var(--text-body);
}
.lp-btn-ghost:hover {
  background: var(--surface-hover);
}
.lp-btn-gradient {
  background: var(--grad-brand);
  color: #fff;
  box-shadow: var(--shadow-xs);
}
.lp-btn-gradient:hover {
  box-shadow: var(--shadow-brand);
}

/* ---- Badges ---- */
.lp-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-weight: var(--weight-semibold);
  font-size: var(--text-2xs);
  letter-spacing: 0.01em;
  padding: 3px 9px;
  border-radius: var(--radius-pill);
  background: var(--surface-sunken);
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
  white-space: nowrap;
}
.lp-badge-dot::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.lp-badge-brand {
  background: var(--coral-50);
  color: var(--coral-700);
  border-color: var(--coral-200);
}
.lp-badge-pink {
  background: var(--pink-50);
  color: var(--pink-700);
  border-color: var(--pink-200);
}
.lp-badge-success {
  background: var(--success-bg);
  color: var(--green-600);
  border-color: transparent;
}
.lp-badge-warning {
  background: var(--warning-bg);
  color: var(--amber-600);
  border-color: transparent;
}
.lp-badge-solid {
  background: var(--brand);
  color: #fff;
  border-color: transparent;
}
.lp-badge-mono {
  font-family: var(--font-mono);
  font-weight: 500;
  letter-spacing: var(--tracking-mono);
}

/* ---- Cards ---- */
.lp-card {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-5);
}
.lp-card-hover {
  transition: box-shadow var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out);
}
.lp-card-hover:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: var(--border-default);
}

/* ---- Typography helpers ---- */
.lp-h2 {
  font-weight: var(--weight-bold);
  font-size: var(--text-2xl);
  line-height: var(--leading-snug);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.lp-h3 {
  font-weight: var(--weight-semibold);
  font-size: var(--text-xl);
  line-height: var(--leading-snug);
  color: var(--text-strong);
}
.lp-lead {
  font-size: var(--text-base);
  color: var(--text-muted);
  margin-top: 6px;
}
.lp-muted-sm {
  font-size: var(--text-sm);
  line-height: 1.55;
  color: var(--text-muted);
}
.lp-center {
  text-align: center;
}
.lp-grad-text {
  background: var(--grad-brand);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* ---- Hero ---- */
.lp-hero {
  position: relative;
  overflow: hidden;
}
.lp-bloom {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
}
.lp-bloom-pink {
  top: -180px;
  right: -120px;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(244, 154, 182, 0.3), transparent 62%);
}
.lp-bloom-coral {
  top: -140px;
  right: 60px;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(242, 104, 92, 0.22), transparent 62%);
}
.lp-hero-inner {
  position: relative;
  padding: 90px 28px 70px;
}
.lp-hero-title {
  font-weight: var(--weight-extra);
  font-size: var(--text-5xl);
  letter-spacing: -0.03em;
  line-height: 1.04;
  margin: 20px 0 0;
  max-width: 760px;
  color: var(--text-strong);
}
.lp-hero-sub {
  font-size: var(--text-md);
  line-height: 1.6;
  color: var(--text-muted);
  max-width: 560px;
  margin: 22px 0 30px;
}
.lp-hero-cta {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.lp-stats {
  display: flex;
  gap: 22px;
  margin-top: 34px;
  flex-wrap: wrap;
}
.lp-stat-num {
  font-weight: var(--weight-extra);
  font-size: var(--text-xl);
  color: var(--text-strong);
}
.lp-stat-label {
  font-size: var(--text-xs);
  color: var(--text-faint);
}
@media (max-width: 640px) {
  .lp-hero-title {
    font-size: var(--text-4xl);
  }
}

/* ---- Logos strip ---- */
.lp-logos {
  padding: 8px 28px 56px;
}
.lp-logos-eyebrow {
  font-weight: var(--weight-semibold);
  font-size: var(--text-2xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-faint);
  margin-bottom: 16px;
}
.lp-logos-row {
  display: flex;
  gap: 34px;
  flex-wrap: wrap;
  align-items: center;
}
.lp-logos-name {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-weight: var(--weight-bold);
  font-size: var(--text-lg);
  letter-spacing: -0.01em;
  color: var(--warm-400);
  transition: color var(--dur-fast) var(--ease-out);
}
.lp-logos-name:hover {
  color: var(--text-strong);
}
.lp-logos-icon {
  flex: none;
}

/* ---- Bands / sections ---- */
.lp-band {
  background: var(--surface-card);
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
}
.lp-band-inner {
  padding: 72px 28px;
}
.lp-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
@media (max-width: 880px) {
  .lp-grid-3 {
    grid-template-columns: 1fr;
  }
}

/* ---- How-it-works steps ---- */
.lp-step {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.lp-step-icon {
  width: 46px;
  height: 46px;
  border-radius: var(--radius-md);
  background: var(--grad-brand-soft);
  border: 1px solid var(--coral-200);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--coral-600);
}
.lp-step-icon :deep(svg) {
  width: 22px;
  height: 22px;
}
.lp-step .lp-h3 {
  margin-top: 4px;
}

/* ---- Models ---- */
.lp-models-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 26px;
}
.lp-model {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.lp-model-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.lp-model-avatar {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--warm-100);
  color: var(--text-strong);
  font-weight: var(--weight-bold);
  font-size: var(--text-md);
}
.lp-model-id {
  flex: 1;
  min-width: 0;
}
.lp-model-name {
  font-weight: var(--weight-bold);
  font-size: var(--text-md);
  letter-spacing: -0.01em;
  color: var(--text-strong);
}
.lp-model-provider {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-faint);
}
.lp-model-desc {
  margin: 0;
}
.lp-model-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.lp-model-prices {
  display: flex;
  gap: 18px;
  padding-top: 10px;
  border-top: 1px solid var(--border-subtle);
}
.lp-price-label {
  font-size: var(--text-2xs);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
  color: var(--text-faint);
}
.lp-price-val {
  font-family: var(--font-mono);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  color: var(--text-strong);
}

/* ---- Code section ---- */
.lp-code-row {
  padding: 72px 28px;
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 48px;
  align-items: center;
}
@media (max-width: 880px) {
  .lp-code-row {
    grid-template-columns: 1fr;
    gap: 28px;
  }
}
.lp-code-h2 {
  margin: 14px 0 12px;
}
.lp-code-lead {
  margin-bottom: 18px;
}
.lp-code {
  background: var(--warm-900);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  overflow-x: auto;
}
.lp-code-bar {
  margin-bottom: 8px;
}
.lp-code-lang {
  font-family: var(--font-mono);
  font-weight: 500;
  font-size: var(--text-2xs);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--warm-400);
}
.lp-code-pre {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.6;
  color: #f4edea;
  white-space: pre;
}
.lp-c-kw {
  color: var(--pink-300);
}
.lp-c-str {
  color: #a7e0bd;
}

/* ---- Pricing ---- */
.lp-pricing {
  align-items: start;
  margin-top: 40px;
}
.lp-plan {
  position: relative;
}
.lp-plan-featured {
  border-color: var(--coral-300);
  box-shadow: var(--shadow-lg);
}
.lp-plan-tag {
  position: absolute;
  top: -11px;
  left: 20px;
}
.lp-plan-price {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin: 10px 0 16px;
}
.lp-plan-amount {
  font-weight: var(--weight-extra);
  font-size: var(--text-3xl);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.lp-plan-note {
  font-size: var(--text-sm);
  color: var(--text-faint);
}
.lp-plan-feats {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-bottom: 20px;
}
.lp-plan-feat {
  display: flex;
  gap: 9px;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--text-body);
}
.lp-check {
  color: var(--success);
  display: inline-flex;
}
.lp-check :deep(svg) {
  width: 16px;
  height: 16px;
}

/* ---- CTA ---- */
.lp-cta-wrap {
  padding: 20px 28px 80px;
}
.lp-cta {
  background: var(--grad-brand);
  border-radius: var(--radius-2xl);
  padding: 56px 48px;
  text-align: center;
  box-shadow: var(--shadow-brand);
}
.lp-cta-title {
  font-weight: var(--weight-extra);
  font-size: var(--text-3xl);
  letter-spacing: -0.02em;
  color: #fff;
  margin-bottom: 10px;
}
.lp-cta-sub {
  font-size: var(--text-md);
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 24px;
}
.lp-cta-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.lp-cta-btn-light {
  background: #fff;
  color: var(--coral-600);
}
.lp-cta-btn-glass {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

/* ---- Footer ---- */
.lp-footer {
  border-top: 1px solid var(--border-subtle);
  background: var(--surface-card);
}
.lp-footer-grid {
  padding: 48px 28px;
  display: grid;
  grid-template-columns: 1.6fr repeat(4, minmax(0, 1fr));
  gap: 24px;
}
.lp-footer-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 16px;
  font: var(--text-xs) var(--font-sans);
  color: var(--text-muted);
  text-decoration: none;
}
.lp-footer-status:hover {
  color: var(--text-strong);
}
.lp-footer-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green-500, #2f9e6e);
}
@media (max-width: 880px) {
  .lp-footer-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
@media (max-width: 560px) {
  .lp-footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}
.lp-footer-tag {
  font-size: var(--text-sm);
  color: var(--text-faint);
  margin-top: 12px;
  max-width: 230px;
}
.lp-footer-head {
  font-weight: var(--weight-semibold);
  font-size: var(--text-2xs);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-faint);
  margin-bottom: 12px;
}
.lp-footer-links {
  display: flex;
  flex-direction: column;
  gap: 9px;
}
.lp-footer-copy {
  padding: 0 28px 32px;
  font-size: var(--text-xs);
  color: var(--text-faint);
}
</style>
