<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, STATUS_LEVELS } from '../stores/user.js'
import ContributorBadge from '../components/community/ContributorBadge.vue'
import Mascot from '../components/ui/Mascot.vue'
import Icon from '../components/ui/Icon.vue'
import { useTheme } from '../composables/useTheme.js'
import { useToast } from '../composables/useToast.js'

const router = useRouter()
const userStore = useUserStore()
const theme = useTheme()
const toast = useToast()

const THEME_CHOICES = [
  { key: 'auto', label: 'Automatique', hint: 'Suit le réglage de ton téléphone' },
  { key: 'light', label: 'Jour', hint: 'Lisible en plein soleil' },
  { key: 'dark', label: 'Nuit', hint: 'Pour jouer sous les projecteurs' },
]

const loginOpen = ref(false)
const identifier = ref('')
const code = ref('')

function submitLogin() {
  if (userStore.login(identifier.value, code.value)) {
    loginOpen.value = false
    identifier.value = ''
    code.value = ''
    toast.show('Te voilà connecté.')
  }
}

function logout() {
  userStore.logout()
  toast.show('Déconnecté.')
}
</script>

<template>
  <div class="mx-auto max-w-lg px-4 pb-28 pt-6 lg:pb-8">
    <div class="mb-2 flex items-start justify-between gap-3">
      <button
        class="-mx-2 inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-txt-soft hover:text-txt"
        @click="router.push('/')"
      >
        <Icon name="back" :size="16" /> Retour à la carte
      </button>

      <!-- Accès de développement : ouvre la connexion locale -->
      <button
        class="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-edge bg-card text-txt-soft hover:text-txt"
        :aria-label="userStore.isLoggedIn ? 'Se déconnecter' : 'Se connecter'"
        :title="userStore.isLoggedIn ? 'Se déconnecter' : 'Se connecter'"
        @click="userStore.isLoggedIn ? logout() : (loginOpen = !loginOpen)"
      >
        <Icon :name="userStore.isLoggedIn ? 'lock' : 'user'" :size="18" />
      </button>
    </div>

    <h1 class="mb-6 font-display text-4xl tracking-wide">Profil</h1>

    <!-- Connecté : le compte réel -->
    <div v-if="userStore.isLoggedIn" class="rounded-2xl border border-edge bg-card p-5">
      <div class="mb-3 flex items-center gap-3">
        <Mascot :size="52" />
        <div class="min-w-0">
          <p class="truncate font-display text-2xl leading-none tracking-wide">
            {{ userStore.profile.pseudo }}
          </p>
          <div class="mt-1.5 flex flex-wrap items-center gap-2">
            <ContributorBadge :status="userStore.profile.status" />
            <span
              v-if="userStore.isAdmin"
              class="rounded-full border border-accent/60 bg-accent/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent-text"
            >
              Admin
            </span>
          </div>
        </div>
      </div>
      <dl class="grid grid-cols-3 gap-2 text-center">
        <div class="rounded-xl border border-edge bg-surface p-2">
          <dt class="text-[11px] uppercase tracking-wide text-txt-soft">Score</dt>
          <dd class="font-display text-2xl">{{ userStore.profile.contribution_score }}</dd>
        </div>
        <div class="rounded-xl border border-edge bg-surface p-2">
          <dt class="text-[11px] uppercase tracking-wide text-txt-soft">Terrains</dt>
          <dd class="font-display text-2xl">{{ userStore.profile.courts_added }}</dd>
        </div>
        <div class="rounded-xl border border-edge bg-surface p-2">
          <dt class="text-[11px] uppercase tracking-wide text-txt-soft">Validations</dt>
          <dd class="font-display text-2xl">{{ userStore.profile.validations_done }}</dd>
        </div>
      </dl>
      <p class="mt-3 text-xs text-txt-soft">
        Session locale de développement. Les contributions restent anonymes tant que
        Supabase Auth n'est pas branché.
      </p>
    </div>

    <!-- Formulaire de connexion -->
    <form
      v-else-if="loginOpen"
      class="space-y-3 rounded-2xl border border-edge bg-card p-5"
      @submit.prevent="submitLogin"
    >
      <div>
        <label class="mb-1.5 block text-sm font-semibold" for="login-id">Identifiant</label>
        <input
          id="login-id"
          v-model="identifier"
          type="text"
          autocomplete="username"
          class="w-full rounded-xl border border-edge bg-surface px-4 py-3 outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-semibold" for="login-code">Code</label>
        <input
          id="login-code"
          v-model="code"
          type="password"
          autocomplete="current-password"
          class="w-full rounded-xl border border-edge bg-surface px-4 py-3 outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <p v-if="userStore.error" class="text-xs text-bad-soft">{{ userStore.error }}</p>
      <button
        type="submit"
        class="min-h-11 w-full rounded-full bg-accent px-6 font-bold uppercase tracking-wide text-on-accent"
      >
        Se connecter
      </button>
    </form>

    <!-- Déconnecté : l'invitation -->
    <div v-else class="flex flex-col items-center gap-4 rounded-2xl border border-edge bg-card p-8 text-center">
      <Mascot />
      <p class="font-semibold">Bientôt : ton compte contributeur</p>
      <p class="text-sm text-txt-soft">
        Ajoute des terrains, valide ceux des autres et grimpe de Rookie à Legend.
      </p>
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
