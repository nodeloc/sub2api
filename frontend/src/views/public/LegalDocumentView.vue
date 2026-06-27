<template>
  <KitMarketingShell active="legal">
    <main class="lg-wrap">
      <div v-if="loading" class="lg-loading">
        <span class="lg-spinner"></span>
      </div>

      <div v-else-if="loadError" class="ko-card lg-msg">
        <h1 class="lg-msg__t">{{ t('legal.loadFailed') }}</h1>
        <p class="lg-msg__d">{{ t('legal.retryLater') }}</p>
      </div>

      <div v-else-if="!currentDocument" class="ko-card lg-msg">
        <h1 class="lg-msg__t">{{ t('legal.notFound') }}</h1>
        <p class="lg-msg__d">{{ t('legal.notFoundDescription') }}</p>
      </div>

      <article v-else class="lg-article">
        <span class="ko-badge ko-badge--brand">{{ documentTypeLabel }}</span>
        <h1 class="lg-title">{{ displayTitle }}</h1>
        <p v-if="updatedAt" class="lg-updated">{{ t('legal.updatedAt', { date: updatedAt }) }}</p>
        <div v-if="hasContent" class="legal-prose" v-html="renderedHtml"></div>
        <div v-else class="ko-card lg-empty">{{ t('legal.empty') }}</div>
      </article>
    </main>
  </KitMarketingShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useI18n } from 'vue-i18n'
import '@/styles/kit-components.css'
import KitMarketingShell from '@/components/kit/KitMarketingShell.vue'
import { getPublicSettings } from '@/api/auth'
import { getLocale } from '@/i18n'
import { legalDocTitleKey } from '@/utils/legalDocs'
import type { LoginAgreementDocument, PublicSettings } from '@/types'
import zhAdminCompliance from '../../../../docs/legal/admin-compliance.zh.md?raw'
import enAdminCompliance from '../../../../docs/legal/admin-compliance.en.md?raw'

const route = useRoute()
const { t, te } = useI18n()
const settings = ref<PublicSettings | null>(null)
const loading = ref(true)
const loadError = ref(false)

marked.setOptions({
  breaks: true,
  gfm: true,
})

const documentId = computed(() => String(route.params.documentId || ''))
const isAdminComplianceDocument = computed(() => documentId.value === 'admin-compliance')
const documents = computed(() => settings.value?.login_agreement_documents ?? [])
const updatedAt = computed(() =>
  isAdminComplianceDocument.value ? '' : settings.value?.login_agreement_updated_at || ''
)
const documentTypeLabel = computed(() =>
  isAdminComplianceDocument.value ? t('legal.adminCompliance') : t('legal.loginAgreement')
)

const currentDocument = computed<LoginAgreementDocument | null>(() => {
  if (isAdminComplianceDocument.value) {
    return {
      id: 'admin-compliance',
      title: t('adminCompliance.title'),
      content_md: getLocale() === 'zh' ? zhAdminCompliance : enAdminCompliance
    }
  }
  const id = documentId.value
  if (!id) {
    return null
  }
  return documents.value.find((doc) => doc.id === id) ?? null
})

// Standard docs get a localized title; admin-authored titles fall back to as-stored.
const displayTitle = computed(() => {
  const doc = currentDocument.value
  if (!doc) return ''
  const key = legalDocTitleKey(doc.id)
  return key && te(key) ? t(key) : doc.title
})

const hasContent = computed(() => Boolean(currentDocument.value?.content_md?.trim()))

const renderedHtml = computed(() => {
  const content = currentDocument.value?.content_md?.trim() || ''
  if (!content) {
    return ''
  }
  const html = marked.parse(content) as string
  return DOMPurify.sanitize(html)
})

onMounted(async () => {
  loading.value = true
  loadError.value = false
  try {
    settings.value = await getPublicSettings()
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.lg-wrap {
  max-width: 820px;
  margin: 0 auto;
  padding: 56px 28px 72px;
}
.lg-loading {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}
.lg-spinner {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2.5px solid var(--coral-200);
  border-top-color: var(--brand);
  animation: lg-spin 0.7s linear infinite;
}
@keyframes lg-spin {
  to { transform: rotate(360deg); }
}
.lg-msg {
  text-align: center;
  padding: 40px 28px;
}
.lg-msg__t {
  font: var(--type-h3);
  color: var(--text-strong);
}
.lg-msg__d {
  font: var(--text-sm) var(--font-sans);
  color: var(--text-muted);
  margin-top: 8px;
}
.lg-title {
  font: var(--type-h1);
  letter-spacing: -0.02em;
  color: var(--text-strong);
  margin: 14px 0 0;
}
.lg-updated {
  font: var(--text-sm) var(--font-mono);
  color: var(--text-faint);
  margin-top: 10px;
}
.lg-empty {
  text-align: center;
  padding: 48px 28px;
  color: var(--text-faint);
  font: var(--text-sm) var(--font-sans);
  margin-top: 20px;
}

/* Markdown prose — kissopen tokens, matches the docs/blog look */
.legal-prose {
  margin-top: 28px;
  font: var(--text-md) / 1.7 var(--font-sans);
  color: var(--text-body);
  overflow-wrap: anywhere;
}
.legal-prose :deep(h1) {
  font: var(--weight-extra) var(--text-2xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
  margin: 34px 0 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-subtle);
}
.legal-prose :deep(h2) {
  font: var(--weight-bold) var(--text-xl) var(--font-sans);
  letter-spacing: -0.01em;
  color: var(--text-strong);
  margin: 30px 0 10px;
}
.legal-prose :deep(h3) {
  font: var(--weight-semibold) var(--text-lg) var(--font-sans);
  color: var(--text-strong);
  margin: 24px 0 8px;
}
.legal-prose :deep(h4) {
  font: var(--weight-semibold) var(--text-md) var(--font-sans);
  color: var(--text-strong);
  margin: 20px 0 6px;
}
.legal-prose :deep(p) {
  margin: 0 0 14px;
}
.legal-prose :deep(a) {
  color: var(--brand);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.legal-prose :deep(a:hover) {
  color: var(--brand-hover, var(--coral-700));
}
.legal-prose :deep(ul),
.legal-prose :deep(ol) {
  margin: 0 0 14px;
  padding-left: 24px;
}
.legal-prose :deep(li) {
  margin-bottom: 5px;
}
.legal-prose :deep(strong) {
  color: var(--text-strong);
  font-weight: var(--weight-bold);
}
.legal-prose :deep(blockquote) {
  margin: 18px 0;
  padding: 6px 16px;
  border-left: 3px solid var(--coral-300);
  color: var(--text-muted);
  background: var(--surface-sunken);
  border-radius: var(--radius-sm);
}
.legal-prose :deep(code) {
  font: var(--text-sm) var(--font-mono);
  background: var(--surface-sunken);
  border: 1px solid var(--border-subtle);
  border-radius: 5px;
  padding: 1px 6px;
  color: var(--coral-700);
}
.legal-prose :deep(pre) {
  margin: 18px 0;
  overflow-x: auto;
  background: var(--warm-900);
  color: #f4edea;
  border-radius: var(--radius-md);
  padding: 14px 16px;
}
.legal-prose :deep(pre code) {
  background: transparent;
  border: none;
  padding: 0;
  color: inherit;
}
.legal-prose :deep(table) {
  margin: 18px 0;
  display: block;
  width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
}
.legal-prose :deep(th),
.legal-prose :deep(td) {
  border: 1px solid var(--border-subtle);
  padding: 8px 12px;
  text-align: left;
}
.legal-prose :deep(th) {
  background: var(--surface-sunken);
  font-weight: var(--weight-semibold);
  color: var(--text-strong);
}
.legal-prose :deep(hr) {
  margin: 28px 0;
  border: none;
  border-top: 1px solid var(--border-subtle);
}
.legal-prose :deep(img) {
  margin: 18px 0;
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
}
</style>
