<script setup>
import { useRoute, useRouter } from 'vue-router'
import Icon from './Icon.vue'

// Tab bar mobile : carte / recherche / profil. Icônes dans des ronds,
// fond sombre, actif = orange.
const emit = defineEmits(['search'])
const route = useRoute()
const router = useRouter()

const tabs = [
  { key: 'home', icon: 'ball', label: 'Carte', action: () => router.push('/') },
  { key: 'search', icon: 'search', label: 'Recherche', action: () => emit('search') },
  { key: 'profile', icon: 'user', label: 'Profil', action: () => router.push('/profile') },
]

function isActive(tab) {
  if (tab.key === 'search') return false
  return route.name === tab.key
}
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-edge bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
  >
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="flex flex-col items-center gap-0.5 px-6 py-2"
      :aria-label="tab.label"
      @click="tab.action()"
    >
      <span
        class="grid h-10 w-10 place-items-center rounded-full text-lg transition"
        :class="isActive(tab) ? 'bg-accent/20 ring-2 ring-accent' : 'bg-card'"
      >
        <Icon :name="tab.icon" :size="20" />
      </span>
      <span class="text-[10px] font-semibold uppercase tracking-wide text-txt-soft">
        {{ tab.label }}
      </span>
    </button>
  </nav>
</template>
