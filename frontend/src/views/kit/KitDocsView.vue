<template>
  <KitMarketingShell active="docs">
    <div class="kd-wrap">
      <!-- Side nav -->
      <aside class="kd-side">
        <div class="kd-side__head">{{ t('marketing.docs.sideHead') }}</div>
        <a
          v-for="s in sections"
          :key="s.id"
          class="kd-doclink"
          :class="{ 'kd-doclink--on': active === s.id }"
          @click="go(s.id)"
        >{{ s.label }}</a>
      </aside>

      <!-- Prose -->
      <div class="kd-prose">
        <span class="ko-badge ko-badge--brand">{{ t('marketing.docs.badge') }}</span>
        <h1 class="kd-h1">{{ t('marketing.docs.h1') }}</h1>
        <p>{{ t('marketing.docs.intro') }}</p>

        <div id="doc-quickstart" class="kd-anchor"></div>
        <div class="ko-alert ko-alert--info">
          <span class="ko-alert__icon"><component :is="icons.Sparkle" :size="20" /></span>
          <div>
            <div class="ko-alert__title">{{ t('marketing.docs.alertTitle') }}</div>
            <div class="ko-alert__body">
              <i18n-t keypath="marketing.docs.alertBody" tag="span">
                <template #base><code class="kd-inline">base_url</code></template>
                <template #key><code class="kd-inline">api_key</code></template>
              </i18n-t>
            </div>
          </div>
        </div>

        <h2 id="doc-auth" class="kd-sec">{{ t('marketing.docs.authH2') }}</h2>
        <p>{{ t('marketing.docs.authP') }}</p>
        <KitCodeBlock lang="bash" :code="codeAuth" />

        <h2 id="doc-first" class="kd-sec">{{ t('marketing.docs.firstH2') }}</h2>
        <p>
          <i18n-t keypath="marketing.docs.firstP" tag="span">
            <template #model><code class="kd-inline">model</code></template>
          </i18n-t>
        </p>
        <KitCodeBlock lang="bash" :code="codeFirst" />

        <h2 id="doc-streaming" class="kd-sec">{{ t('marketing.docs.streamingH2') }}</h2>
        <p>
          <i18n-t keypath="marketing.docs.streamingP" tag="span">
            <template #stream><code class="kd-inline">stream: true</code></template>
          </i18n-t>
        </p>
        <KitCodeBlock lang="python" :code="codeStream" />

        <h2 id="doc-routing" class="kd-sec">{{ t('marketing.docs.routingH2') }}</h2>
        <p>
          <i18n-t keypath="marketing.docs.routingP" tag="span">
            <template #model><code class="kd-inline">model</code></template>
          </i18n-t>
        </p>
        <KitCodeBlock lang="json" :code="codeRouting" />

        <h2 id="doc-sdks" class="kd-sec">{{ t('marketing.docs.sdksH2') }}</h2>
        <p>{{ t('marketing.docs.sdksP') }}</p>
        <div class="kd-sdks">
          <span v-for="s in sdks" :key="s" class="ko-badge ko-badge--mono">{{ s }}</span>
        </div>
        <KitCodeBlock lang="typescript" :code="codeSdk" />
        <div class="kd-actions">
          <router-link to="/keys" class="ko-btn ko-btn--primary">{{ t('marketing.docs.getKey') }} <component :is="icons.Arrow" :size="16" /></router-link>
          <router-link to="/models" class="ko-btn ko-btn--secondary">{{ t('marketing.docs.browseModels') }}</router-link>
        </div>
      </div>
    </div>
  </KitMarketingShell>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import '@/styles/kit-components.css'
import KitMarketingShell from '@/components/kit/KitMarketingShell.vue'
import KitCodeBlock from '@/components/kit/KitCodeBlock.vue'
import { kitIcons as icons } from '@/components/kit/icons'

const { t } = useI18n()

// Real API base for this deployment, so copied snippets work as-is.
const apiBase = computed(() => `${window.location.origin}/v1`)

const sections = computed(() => [
  { id: 'quickstart', label: t('marketing.docs.navQuickstart') },
  { id: 'auth', label: t('marketing.docs.navAuth') },
  { id: 'first', label: t('marketing.docs.navFirst') },
  { id: 'streaming', label: t('marketing.docs.navStreaming') },
  { id: 'routing', label: t('marketing.docs.navRouting') },
  { id: 'sdks', label: t('marketing.docs.navSdks') },
])
const active = ref('quickstart')
function go(id: string) {
  active.value = id
  const el = document.getElementById('doc-' + id)
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 76, behavior: 'smooth' })
}

const sdks = ['Python', 'TypeScript', 'Go', 'Rust', 'cURL']

const codeAuth = `export KO_KEY="sk-...your-key..."`
const codeFirst = computed(() => `curl ${apiBase.value}/chat/completions \\
  -H "Authorization: Bearer $KO_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "claude-3-5-sonnet",
    "messages": [{ "role": "user", "content": "Hello" }]
  }'`)
const codeStream = `stream = client.chat.completions.create(
  model="gpt-4o",
  messages=[{"role":"user","content":"Count to 5"}],
  stream=True,
)
for chunk in stream:
  print(chunk.choices[0].delta.content or "", end="")`
const codeRouting = `{
  "model": "deepseek-r1",
  "messages": [{ "role": "user", "content": "Hi" }]
}`
const codeSdk = computed(() => `import OpenAI from "openai";
const client = new OpenAI({
  baseURL: "${apiBase.value}",
  apiKey: process.env.KO_KEY,
});`)
</script>

<style scoped>
.kd-wrap {
  max-width: var(--container-max);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 40px;
  padding: 40px 28px 90px;
  align-items: start;
}
@media (max-width: 760px) {
  .kd-wrap {
    grid-template-columns: 1fr;
  }
  .kd-side {
    display: none;
  }
}
.kd-side {
  position: sticky;
  top: 88px;
  align-self: start;
}
.kd-side__head {
  font: var(--weight-bold) var(--text-2xs) var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-faint);
  margin: 0 11px 8px;
}
.kd-doclink {
  font: var(--weight-medium) var(--text-sm) var(--font-sans);
  color: var(--text-muted);
  padding: 7px 11px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: block;
  transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
}
.kd-doclink:hover {
  background: var(--surface-hover);
  color: var(--text-strong);
}
.kd-doclink--on {
  background: var(--coral-50);
  color: var(--coral-700);
  font-weight: var(--weight-semibold);
}
.kd-prose {
  min-width: 0;
}
.kd-prose p {
  font: var(--type-body);
  color: var(--text-muted);
  margin: 12px 0;
  max-width: 660px;
}
.kd-h1 {
  font: var(--weight-extra) var(--text-3xl) var(--font-sans);
  letter-spacing: -0.03em;
  margin: 14px 0 6px;
  color: var(--text-strong);
}
.kd-sec {
  font: var(--weight-bold) var(--text-2xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
  scroll-margin-top: 80px;
  margin-top: 40px;
  margin-bottom: 4px;
}
.kd-anchor {
  height: 1px;
}
.kd-inline {
  font: var(--text-sm) var(--font-mono);
  background: var(--surface-sunken);
  border: 1px solid var(--border-subtle);
  border-radius: 5px;
  padding: 1px 6px;
  color: var(--coral-700);
}
.kd-prose :deep(.ko-code) {
  margin: 14px 0;
}
.kd-sdks {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: 14px 0 22px;
}
.kd-actions {
  display: flex;
  gap: 10px;
  margin-top: 26px;
  flex-wrap: wrap;
}
</style>
