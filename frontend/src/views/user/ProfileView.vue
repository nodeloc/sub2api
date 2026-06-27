<template>
  <AppLayout>
    <div data-testid="profile-shell" class="acct">
      <!-- Header -->
      <div class="acct-head">
        <h1 class="acct-title">{{ t('account.title') }}</h1>
        <p class="acct-sub">{{ t('account.sub') }}</p>
      </div>

      <div class="acct-grid">
        <!-- Sub-nav -->
        <nav class="acct-nav">
          <button
            v-for="s in sections"
            :key="s.id"
            type="button"
            class="acct-nav__item"
            :class="{ 'acct-nav__item--on': section === s.id }"
            @click="section = s.id"
          >
            <component :is="s.icon" :size="17" /> {{ t(s.labelKey) }}
          </button>
        </nav>

        <!-- Content -->
        <div class="acct-body">
          <!-- PROFILE -->
          <template v-if="section === 'profile'">
            <section class="acct-card">
              <div class="acct-card__head">
                <h3 class="acct-card__title">{{ t('account.photoTitle') }}</h3>
                <p class="acct-card__desc">{{ t('account.photoDesc') }}</p>
              </div>
              <div class="acct-card__body">
                <ProfileAvatarCard :user="user" embedded />
              </div>
            </section>

            <section class="acct-card">
              <div class="acct-card__head">
                <h3 class="acct-card__title">{{ t('account.detailsTitle') }}</h3>
                <p class="acct-card__desc">{{ t('account.detailsDesc') }}</p>
              </div>
              <div class="acct-card__body">
                <ProfileEditForm :initial-username="user?.username || ''" embedded />
              </div>
            </section>

            <ProfileBalanceNotifyCard
              v-if="user && balanceLowNotifyEnabled"
              :enabled="user.balance_notify_enabled ?? true"
              :threshold="user.balance_notify_threshold"
              :extra-emails="user.balance_notify_extra_emails ?? []"
              :system-default-threshold="systemDefaultThreshold"
              :user-email="user.email"
            />

            <div v-if="contactInfo" class="acct-contact">
              <span class="acct-contact__icon"><Icon name="chat" size="md" /></span>
              <div>
                <div class="acct-contact__title">{{ t('common.contactSupport') }}</div>
                <div class="acct-contact__val">{{ contactInfo }}</div>
              </div>
            </div>
          </template>

          <!-- LOGIN & CONNECTIONS -->
          <template v-else-if="section === 'logins'">
            <section class="acct-card">
              <div class="acct-card__head">
                <h3 class="acct-card__title">{{ t('account.connTitle') }}</h3>
                <p class="acct-card__desc">{{ t('account.connDesc') }}</p>
              </div>
              <div class="acct-card__body">
                <ProfileIdentityBindingsSection
                  :user="user"
                  :linuxdo-enabled="linuxdoOAuthEnabled"
                  :dingtalk-enabled="dingtalkOAuthEnabled"
                  :oidc-enabled="oidcOAuthEnabled"
                  :oidc-provider-name="oidcOAuthProviderName"
                  :wechat-enabled="wechatOAuthEnabled"
                  :wechat-open-enabled="wechatOAuthOpenEnabled"
                  :wechat-mp-enabled="wechatOAuthMPEnabled"
                  embedded
                />
              </div>
            </section>
          </template>

          <!-- PASSWORD & 2FA -->
          <template v-else>
            <section class="acct-card">
              <div class="acct-card__head">
                <h3 class="acct-card__title">{{ t('account.passwordTitle') }}</h3>
                <p class="acct-card__desc">{{ t('account.passwordDesc') }}</p>
              </div>
              <div class="acct-card__body">
                <ProfilePasswordForm embedded />
              </div>
            </section>

            <ProfileTotpCard />
          </template>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@/components/icons'
import { kitIcons } from '@/components/kit/icons'
import AppLayout from '@/components/layout/AppLayout.vue'
import ProfileAvatarCard from '@/components/user/profile/ProfileAvatarCard.vue'
import ProfileEditForm from '@/components/user/profile/ProfileEditForm.vue'
import ProfileIdentityBindingsSection from '@/components/user/profile/ProfileIdentityBindingsSection.vue'
import ProfileBalanceNotifyCard from '@/components/user/profile/ProfileBalanceNotifyCard.vue'
import ProfilePasswordForm from '@/components/user/profile/ProfilePasswordForm.vue'
import ProfileTotpCard from '@/components/user/profile/ProfileTotpCard.vue'
import { isWeChatWebOAuthEnabled } from '@/api/auth'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

type Section = 'profile' | 'logins' | 'security'
const section = ref<Section>('profile')
const sections = [
  { id: 'profile' as const, labelKey: 'account.navProfile', icon: kitIcons.Sparkle },
  { id: 'logins' as const, labelKey: 'account.navLogins', icon: kitIcons.Key },
  { id: 'security' as const, labelKey: 'account.navSecurity', icon: kitIcons.Settings },
]

const contactInfo = ref('')
const balanceLowNotifyEnabled = ref(false)
const systemDefaultThreshold = ref(0)
const linuxdoOAuthEnabled = ref(false)
const dingtalkOAuthEnabled = ref(false)
const wechatOAuthEnabled = ref(false)
const wechatOAuthOpenEnabled = ref<boolean | undefined>(undefined)
const wechatOAuthMPEnabled = ref<boolean | undefined>(undefined)
const oidcOAuthEnabled = ref(false)
const oidcOAuthProviderName = ref('OIDC')

onMounted(async () => {
  const profileRefresh = authStore.refreshUser().catch((error) => {
    console.error('Failed to refresh profile:', error)
  })

  const settingsLoad = appStore.fetchPublicSettings()
    .then((settings) => {
      if (!settings) return
      contactInfo.value = settings.contact_info || ''
      balanceLowNotifyEnabled.value = settings.balance_low_notify_enabled ?? false
      systemDefaultThreshold.value = settings.balance_low_notify_threshold ?? 0
      linuxdoOAuthEnabled.value = settings.linuxdo_oauth_enabled ?? false
      dingtalkOAuthEnabled.value = settings.dingtalk_oauth_enabled ?? false
      wechatOAuthEnabled.value = isWeChatWebOAuthEnabled(settings)
      wechatOAuthOpenEnabled.value = typeof settings.wechat_oauth_open_enabled === 'boolean'
        ? settings.wechat_oauth_open_enabled
        : undefined
      wechatOAuthMPEnabled.value = typeof settings.wechat_oauth_mp_enabled === 'boolean'
        ? settings.wechat_oauth_mp_enabled
        : undefined
      oidcOAuthEnabled.value = settings.oidc_oauth_enabled ?? false
      oidcOAuthProviderName.value = settings.oidc_oauth_provider_name || 'OIDC'
    })
    .catch((error) => {
      console.error('Failed to load settings:', error)
    })

  await Promise.all([profileRefresh, settingsLoad])
})
</script>

<style scoped>
.acct {
  max-width: 920px;
  margin: 0 auto;
}
.acct-head {
  margin-bottom: 22px;
}
.acct-title {
  font: var(--weight-extra) var(--text-3xl) var(--font-sans);
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.acct-sub {
  font: var(--type-body);
  color: var(--text-muted);
  margin-top: 4px;
}
.acct-grid {
  display: grid;
  grid-template-columns: 210px 1fr;
  gap: 28px;
  align-items: start;
}
.acct-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: sticky;
  top: 16px;
}
.acct-nav__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  text-align: left;
  background: transparent;
  color: var(--text-muted);
  font: var(--weight-medium) var(--text-sm) var(--font-sans);
  transition: color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
}
.acct-nav__item:hover {
  color: var(--text-strong);
  background: var(--surface-hover);
}
.acct-nav__item--on {
  background: var(--coral-50);
  color: var(--coral-700);
  font-weight: var(--weight-semibold);
}
.acct-nav__item--on:hover {
  background: var(--coral-50);
  color: var(--coral-700);
}
.acct-body {
  min-width: 0;
}

/* Section cards (kissopen) wrapping the embedded functional components */
.acct-card {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg, 14px);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(20, 12, 10, 0.04));
  overflow: hidden;
  margin-bottom: 18px;
}
.acct-card__head {
  padding: 18px 22px 12px;
}
.acct-card__title {
  font: var(--weight-bold) var(--text-lg) var(--font-sans);
  color: var(--text-strong);
}
.acct-card__desc {
  font: var(--text-sm) var(--font-sans);
  color: var(--text-muted);
  margin-top: 3px;
}
.acct-card__body {
  padding: 4px 22px 20px;
}

/* Contact support */
.acct-contact {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: var(--radius-lg, 14px);
  border: 1px solid var(--border-subtle);
  background: var(--surface-sunken);
  margin-bottom: 18px;
}
.acct-contact__icon {
  width: 40px;
  height: 40px;
  flex: none;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--coral-50);
  color: var(--coral-600);
}
.acct-contact__title {
  font: var(--weight-semibold) var(--text-sm) var(--font-sans);
  color: var(--text-strong);
}
.acct-contact__val {
  font: var(--text-sm) var(--font-sans);
  color: var(--text-muted);
  margin-top: 1px;
}

@media (max-width: 760px) {
  .acct-grid {
    grid-template-columns: 1fr;
  }
  .acct-nav {
    position: static;
    flex-direction: row;
    overflow-x: auto;
    margin-bottom: 8px;
  }
}
</style>
