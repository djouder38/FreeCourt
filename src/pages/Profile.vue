<script setup>
import { useRouter } from 'vue-router'
import { useUserStore, STATUS_LEVELS } from '../stores/user.js'
import ContributorBadge from '../components/community/ContributorBadge.vue'
import Mascot from '../components/ui/Mascot.vue'
import Icon from '../components/ui/Icon.vue'
import { useTheme } from '../composables/useTheme.js'

const router = useRouter()
const userStore = useUserStore()
const theme = useTheme()

const THEME_CHOICES = [
  { key: 'auto', label: 'Automatique', hint: 'Suit le réglage de ton téléphone' },
  { key: 'light', label: 'Jour', hint: 'Lisible en plein soleil' },
  { key: 'dark', label: 'Nuit', hint: 'Pour jouer sous les projecteurs' },
]
</script>

<template>
  <div class="mx-auto max-w-lg px-4 pb-28 pt-6 lg:pb-8">
    <button class="-mx-2 mb-2 inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-txt-soft hover:text-txt" @click="router.push('/')">
      <Icon name="back" :size="16" /> Retour à la carte
    </button>
    <h1 class="mb-6 font-display text-4xl tracking-wide">Profil</h1>

    <!-- Auth pas encore branchée : état vide avec mascotte -->
    <div v-if="!userStore.isLoggedIn" class="flex flex-col items-center gap-4 rounded-2xl border border-edge bg-card p-8 text-center">
      <Mascot />
      <p class="font-semibold">Bientôt : ton compte contributeur</p>
      <p class="text-sm text-txt-soft">
        Ajoute des terrains, valide ceux des autres et grimpe de Rookie à Legend.
        La connexion arrive très vite.
      </p>
      <button
        class="rounded-full bg-accent text-on-accent px-6 py-3 text-sm font-bold uppercase tracking-wide opacity-60"
        title="Bientôt disponible"
        @click="userStore.login()"
      >
        Se connecter (bientôt)
      </button>
    </div>

    <!-- Apparence : le mode jour est le defaut, l'app s'utilise dehors -->
    <section class="mt-8">
      <h2 class="mb-3 font-display text-2xl tracking-wide">Apparence</h2>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="choice in THEME_CHOICES"
          :key="choice.key"
          type="button"
          class="rounded-2xl border px-3 py-3 text-center transition"
          :class="theme.mode.value === choice.key ? 'border-accent bg-accent/15' : 'border-edge bg-card'"
          @click="theme.set(choice.key)"
        >
          <span class="block text-sm font-bold">{{ choice.label }}</span>
          <span class="mt-0.5 block text-[11px] leading-tight text-txt-soft">{{ choice.hint }}</span>
        </button>
      </div>
    </section>

    <section class="mt-8">
      <h2 class="mb-3 font-display text-2xl tracking-wide">Les statuts</h2>
      <ul class="space-y-2">
        <li
          v-for="level in STATUS_LEVELS"
          :key="level.key"
          class="flex items-center justify-between rounded-2xl border border-edge bg-card px-4 py-3"
        >
          <ContributorBadge :status="level.key" />
          <span class="text-xs text-txt-soft">{{ level.minScore }} pts · {{ level.quota }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>
