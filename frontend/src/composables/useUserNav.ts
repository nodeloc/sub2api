// Fork-local: kissopen user-side navigation. Mirrors the design dashboard's
// sidebar (Home · Models · Rankings · Providers · Playground · Presets ·
// Activity · Credits · API keys · Settings) and maps each to a real route.
// Kept separate so upstream AppSidebar.vue stays untouched and fork-syncs clean.
import { computed, type FunctionalComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { kitIcons } from '@/components/kit/icons'

export interface UserNavItem {
  path: string
  label: string
  icon: FunctionalComponent<{ size?: number | string }> | null
  iconSvg?: string
}

export function useUserNav() {
  const { t } = useI18n()

  const userNavItems = computed<UserNavItem[]>(() => [
    { path: '/dashboard', label: t('nav.home'), icon: kitIcons.Home },
    { path: '/models', label: t('nav.models'), icon: kitIcons.Grid },
    { path: '/rankings', label: t('nav.rankings'), icon: kitIcons.Bolt },
    { path: '/providers', label: t('nav.providers'), icon: kitIcons.Filter },
    { path: '/playground', label: t('nav.playground'), icon: kitIcons.Chat },
    { path: '/presets', label: t('nav.presets'), icon: kitIcons.Sparkle },
    { path: '/usage', label: t('nav.activity'), icon: kitIcons.Chart },
    { path: '/logs', label: t('nav.logs'), icon: kitIcons.List },
    { path: '/credits', label: t('nav.credits'), icon: kitIcons.Wallet },
    { path: '/keys', label: t('nav.apiKeys'), icon: kitIcons.Key },
    { path: '/profile', label: t('nav.settings'), icon: kitIcons.Settings },
  ])

  const addCreditsPath = computed(() => '/credits')

  return { userNavItems, addCreditsPath }
}
