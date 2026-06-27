<template>
  <KitMarketingShell active="contact">
    <main class="kt-wrap">
      <div class="kt-head">
        <h1 class="kt-h1">{{ t('marketing.contact.title') }}</h1>
        <p class="kt-sub">{{ t('marketing.contact.sub') }}</p>
      </div>

      <div class="kt-grid">
        <!-- Channels -->
        <div class="kt-channels">
          <div v-for="c in channels" :key="c.t" class="ko-card kt-channel">
            <span class="kt-channel__icon"><component :is="c.icon" :size="19" /></span>
            <div>
              <h3 class="kt-channel__t">{{ c.t }}</h3>
              <p class="kt-channel__d">{{ c.d }}</p>
            </div>
          </div>
          <p class="kt-channels__foot">
            <a :href="`mailto:${contactEmail}`" class="kt-mail">{{ contactEmail }}</a>
          </p>
        </div>

        <!-- Form -->
        <form v-if="!sent" class="ko-card kt-form" @submit.prevent="submit">
          <div class="kt-row">
            <label class="ko-field">
              <span class="ko-field__label">{{ t('marketing.contact.formName') }}</span>
              <input v-model="form.name" class="ko-input" type="text" required />
            </label>
            <label class="ko-field">
              <span class="ko-field__label">{{ t('marketing.contact.formEmail') }}</span>
              <input v-model="form.email" class="ko-input" type="email" required />
            </label>
          </div>
          <div class="kt-row">
            <label class="ko-field">
              <span class="ko-field__label">{{ t('marketing.contact.formCompany') }}</span>
              <input v-model="form.company" class="ko-input" type="text" />
            </label>
            <label class="ko-field">
              <span class="ko-field__label">{{ t('marketing.contact.formTopic') }}</span>
              <select v-model="form.topic" class="ko-input ko-select">
                <option value="sales">{{ t('marketing.contact.topicSales') }}</option>
                <option value="support">{{ t('marketing.contact.topicSupport') }}</option>
                <option value="partner">{{ t('marketing.contact.topicPartner') }}</option>
                <option value="press">{{ t('marketing.contact.topicPress') }}</option>
              </select>
            </label>
          </div>
          <label class="ko-field">
            <span class="ko-field__label">{{ t('marketing.contact.formMessage') }}</span>
            <textarea v-model="form.message" class="ko-input kt-textarea" rows="5" :placeholder="t('marketing.contact.formMessagePlaceholder')" required></textarea>
          </label>
          <div>
            <button type="submit" class="ko-btn ko-btn--primary">
              <component :is="icons.Send" :size="16" /> {{ t('marketing.contact.send') }}
            </button>
          </div>
        </form>

        <!-- Sent -->
        <div v-else class="ko-card kt-sent">
          <span class="kt-sent__icon"><component :is="icons.Check" :size="26" /></span>
          <h3 class="kt-sent__t">{{ t('marketing.contact.sentTitle') }}</h3>
          <p class="kt-sent__d">{{ t('marketing.contact.sentBody') }}</p>
          <button class="ko-btn ko-btn--secondary ko-btn--sm" @click="sent = false">{{ t('marketing.contact.sendAnother') }}</button>
        </div>
      </div>
    </main>
  </KitMarketingShell>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import '@/styles/kit-components.css'
import KitMarketingShell from '@/components/kit/KitMarketingShell.vue'
import { kitIcons as icons } from '@/components/kit/icons'

const { t } = useI18n()

// Contact mailbox for this deployment. Update to your real address.
const contactEmail = 'hello@kissopen.com'

const channels = computed(() => [
  { icon: icons.Wallet, t: t('marketing.contact.c1t'), d: t('marketing.contact.c1d') },
  { icon: icons.Chat, t: t('marketing.contact.c2t'), d: t('marketing.contact.c2d') },
  { icon: icons.Sparkle, t: t('marketing.contact.c3t'), d: t('marketing.contact.c3d') },
])

const sent = ref(false)
const form = reactive({ name: '', email: '', company: '', topic: 'sales', message: '' })

function submit() {
  const subject = `[kissopen contact] ${form.topic} — ${form.name}`
  const body = [
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    form.company ? `Company: ${form.company}` : '',
    `Topic: ${form.topic}`,
    '',
    form.message,
  ].filter(Boolean).join('\n')
  window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  sent.value = true
}
</script>

<style scoped>
.kt-wrap {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 56px 28px 64px;
}
.kt-head {
  max-width: 620px;
  margin-bottom: 40px;
}
.kt-h1 {
  font: var(--type-h1);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.kt-sub {
  font: var(--type-body);
  color: var(--text-muted);
  margin-top: 6px;
}
.kt-grid {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 40px;
  align-items: start;
}
@media (max-width: 820px) {
  .kt-grid {
    grid-template-columns: 1fr;
  }
}
.kt-channels {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.kt-channel {
  display: flex;
  gap: 13px;
  align-items: flex-start;
}
.kt-channel__icon {
  width: 40px;
  height: 40px;
  flex: none;
  border-radius: var(--radius-md);
  background: var(--grad-brand-soft);
  border: 1px solid var(--coral-200);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--coral-600);
}
.kt-channel__t {
  font: var(--weight-bold) var(--text-md) var(--font-sans);
  color: var(--text-strong);
}
.kt-channel__d {
  font: var(--text-sm) / 1.5 var(--font-sans);
  color: var(--text-muted);
  margin-top: 3px;
}
.kt-channels__foot {
  padding: 4px 4px 0;
}
.kt-mail {
  font: var(--weight-semibold) var(--text-sm) var(--font-mono);
  color: var(--text-link, var(--brand));
  text-decoration: none;
}
.kt-mail:hover {
  text-decoration: underline;
}
.kt-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.kt-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 520px) {
  .kt-row {
    grid-template-columns: 1fr;
  }
}
.kt-textarea {
  height: auto;
  padding: 12px 14px;
  resize: vertical;
  font: var(--type-body);
}
.kt-sent {
  text-align: center;
  padding: 48px 28px;
}
.kt-sent__icon {
  display: inline-flex;
  width: 52px;
  height: 52px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--green-500, #2f9e6e);
  color: #fff;
  margin-bottom: 14px;
}
.kt-sent__t {
  font: var(--type-h3);
  color: var(--text-strong);
  margin-bottom: 6px;
}
.kt-sent__d {
  font: var(--text-sm) var(--font-sans);
  color: var(--text-muted);
  margin-bottom: 18px;
}
</style>
