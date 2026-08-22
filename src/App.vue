<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TabBar from './components/ui/TabBar.vue'
import Mascot from './components/ui/Mascot.vue'
import { useToast } from './composables/useToast.js'
import { useTheme } from './composables/useTheme.js'

const toast = useToast()
const route = useRoute()
const router = useRouter()

useTheme().mount()

// Ecrans de tache : la tab bar les recouvrirait (le bouton de soumission de
// /add tombait littéralement dessous). Ils ont leur propre bouton retour.
const TASK_ROUTES = ['add', 'court', 'welcome']
const showTabBar = computed(() => !TASK_ROUTES.includes(route.name))

</script>

<template>
  <div class="h-full">
    <main class="h-full pb-0">
      <router-view />
    </main>

    <TabBar v-if="showTabBar" />

    <!-- Toast global avec mascotte.
         La région live est PERMANENTE : un lecteur d'écran n'annonce que ce
         qui est inséré dans une région déjà présente au moment du changement.
         Monter la région en même temps que son contenu (un v-if sur le
         conteneur) ne produirait aucune annonce — et depuis que tout le
         feedback passe par ce toast, ce serait le seul retour du produit qui
         resterait muet. -->
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="above-tabbar pointer-events-none fixed left-1/2 z-50 -translate-x-1/2"
    >
      <Transition
        enter-active-class="transition duration-300"
        enter-from-class="translate-y-4 opacity-0"
        leave-active-class="transition duration-300"
        leave-to-class="translate-y-4 opacity-0"
      >
        <div
          v-if="toast.state.visible"
          class="flex items-center gap-3 rounded-2xl border border-edge bg-surface px-4 py-3 shadow-[var(--shadow-raised)]"
        >
          <Mascot :size="40" />
          <p class="text-sm font-semibold">{{ toast.state.message }}</p>
        </div>
      </Transition>
    </div>
  </div>
</template>
