<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TabBar from './components/ui/TabBar.vue'
import Mascot from './components/ui/Mascot.vue'
import { useToast } from './composables/useToast.js'
import { useMapStore } from './stores/map.js'
import { useTheme } from './composables/useTheme.js'

const toast = useToast()
const route = useRoute()
const router = useRouter()
const mapStore = useMapStore()

useTheme().mount()

// Ecrans de tache : la tab bar les recouvrirait (le bouton de soumission de
// /add tombait littéralement dessous). Ils ont leur propre bouton retour.
const TASK_ROUTES = ['add', 'court']
const showTabBar = computed(() => !TASK_ROUTES.includes(route.name))

async function onSearch() {
  // La recherche s'affiche sur la carte : si on n'y est pas, on y retourne.
  if (route.name !== 'home') {
    await router.push('/')
    mapStore.searchOpen = true
    return
  }
  mapStore.toggleSearch()
}
</script>

<template>
  <div class="h-full">
    <main class="h-full pb-0">
      <router-view />
    </main>

    <TabBar v-if="showTabBar" @search="onSearch" />

    <!-- Toast global avec mascotte -->
    <Transition
      enter-active-class="transition duration-300"
      enter-from-class="translate-y-4 opacity-0"
      leave-active-class="transition duration-300"
      leave-to-class="translate-y-4 opacity-0"
    >
      <div
        v-if="toast.state.visible"
        class="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-edge bg-surface px-4 py-3 shadow-2xl lg:bottom-8"
      >
        <Mascot :size="40" />
        <p class="text-sm font-semibold">{{ toast.state.message }}</p>
      </div>
    </Transition>
  </div>
</template>
