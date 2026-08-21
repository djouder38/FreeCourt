<script setup>
import { useRoute, useRouter } from 'vue-router'
import Icon from './Icon.vue'
import { t } from '../../i18n/index.js'

// Tab bar mobile : carte / profil. La recherche a quitté la tab bar pour la
// loupe posée sur la carte, en face des filtres — deux accès au même écran
// ne s'expliquaient pas.
const route = useRoute()
const router = useRouter()

const tabs = [
  { key: 'home', icon: 'ball', labelKey: 'nav.map', action: () => router.push('/') },
  { key: 'profile', icon: 'user', labelKey: 'nav.profile', action: () => router.push('/profile') },
]
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-edge bg-surface pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
  >
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="flex min-h-11 flex-1 flex-col items-center gap-0.5 py-2"
      :aria-label="t(tab.labelKey)"
      :aria-current="route.name === tab.key ? 'page' : undefined"
      @click="tab.action()"
    >
      <span
        class="grid h-10 w-10 place-items-center rounded-full text-lg transition"
        :class="route.name === tab.key ? 'bg-accent text-on-accent' : 'bg-card'"
      >
        <Icon :name="tab.icon" :size="20" />
      </span>
      <span class="text-[11px] font-semibold uppercase tracking-wide text-txt-soft">
        {{ t(tab.labelKey) }}
      </span>
    </button>
  </nav>
</template>
