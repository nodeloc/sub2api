<template>
  <KitShell :active="activeTab" @nav="nav">
    <KitModelDetail v-if="selected" :model="selected" @back="selected = null" @chat="nav('playground')" />
    <KitHome v-else-if="tab === 'home'" @open="open" @nav="nav" />
    <KitCatalog v-else-if="tab === 'catalog'" @open="open" />
    <KitRankings v-else-if="tab === 'rankings'" @open="open" />
    <KitProviders v-else-if="tab === 'providers'" />
    <KitPlayground v-else-if="tab === 'playground'" />
    <KitPresets v-else-if="tab === 'presets'" />
    <KitUsage v-else-if="tab === 'usage'" />
    <KitCredits v-else-if="tab === 'credits'" />
    <KitKeys v-else-if="tab === 'keys'" />
    <KitSettings v-else />
  </KitShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import '@/styles/kit-components.css'
import KitShell from '@/components/kit/KitShell.vue'
import KitHome from '@/components/kit/KitHome.vue'
import KitCatalog from '@/components/kit/KitCatalog.vue'
import KitModelDetail from '@/components/kit/KitModelDetail.vue'
import KitRankings from '@/components/kit/KitRankings.vue'
import KitProviders from '@/components/kit/KitProviders.vue'
import KitPresets from '@/components/kit/KitPresets.vue'
import KitCredits from '@/components/kit/KitCredits.vue'
import KitKeys from '@/components/kit/KitKeys.vue'
import KitUsage from '@/components/kit/KitUsage.vue'
import KitPlayground from '@/components/kit/KitPlayground.vue'
import KitSettings from '@/components/kit/KitSettings.vue'
import type { KitModel } from '@/components/kit/models'

const tab = ref('home')
const selected = ref<KitModel | null>(null)

const activeTab = computed(() => (selected.value ? 'catalog' : tab.value))

function open(m: KitModel) {
  selected.value = m
}
function nav(t: string) {
  selected.value = null
  tab.value = t
}

// Honor the saved light/dark preference like the rest of the app.
onMounted(() => {
  const saved = localStorage.getItem('theme')
  const dark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
})
</script>
