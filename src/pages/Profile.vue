<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, STATUS_LEVELS } from '../stores/user.js'
import ContributorBadge from '../components/community/ContributorBadge.vue'
import Mascot from '../components/ui/Mascot.vue'
import Icon from '../components/ui/Icon.vue'
import { useTheme } from '../composables/useTheme.js'
import { useToast } from '../composables/useToast.js'
import { useI18n } from '../i18n/index.js'

const router = useRouter()
const userStore = useUserStore()
const theme = useTheme()
const toast = useToast()
const { t, locale, setLocale } = useI18n()

const THEME_CHOICES = [
  { key: 'auto', labelKey: 'profile.themeAuto', hintKey: 'profile.themeAutoHint' },
  { key: 'light', labelKey: 'profile.themeLight', hintKey: 'profile.themeLightHint' },
  { key: 'dark', labelKey: 'profile.themeDark', hintKey: 'profile.themeDarkHint' },
]

// Les langues se nomment dans leur propre langue : quelqu'un qui cherche
// l'anglais cherche « English », pas « Anglais ».
const LANGUAGES = [
  { key: 'fr', label: 'Français' },
  { key: 'en', label: 'English' },
]

// Un drapeau ne dit pas une langue à un lecteur d'écran, et Windows n'affiche
// pas les emoji drapeaux : on les dessine, et le nom de la langue reste porté
// par aria-label.
const FLAGS = {
  fr: '<rect width="8" height="16" x="0" fill="#1f3c88"/><rect width="8" height="16" x="8" fill="#e8e6e1"/><rect width="8" height="16" x="16" fill="#c8102e"/>',
  en: '<rect width="24" height="16" fill="#1f3c88"/><path d="M0 0l24 16M24 0L0 16" stroke="#e8e6e1" stroke-width="3.2"/><path d="M0 0l24 16M24 0L0 16" stroke="#c8102e" stroke-width="1.6"/><path d="M12 0v16M0 8h24" stroke="#e8e6e1" stroke-width="5"/><path d="M12 0v16M0 8h24" stroke="#c8102e" stroke-width="2.6"/>',
}

const loginOpen = ref(false)
const identifier = ref('')
const code = ref('')

function submitLogin() {
  if (userStore.login(identifier.value, code.value)) {
    loginOpen.value = false
    identifier.value = ''
    code.value = ''
    toast.show(t('toast.signedIn'))
  }
}

function logout() {
  userStore.logout()
  toast.show(t('toast.signedOut'))
}
</script>

<template>
  <div class="mx-auto max-w-lg px-4 pb-28 pt-6 lg:pb-8">
    <div class="mb-2 flex items-start justify-between gap-3">
      <button
        class="-mx-2 inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-txt-soft hover:text-txt"
        @click="router.push('/')"
      >
        <Icon name="back" :size="16" /> {{ t('nav.backToMap') }}
      </button>

      <!-- Accès de développement : ouvre la connexion locale -->
      <button
        class="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-edge bg-surface text-txt-soft hover:text-txt"
        :aria-label="userStore.isLoggedIn ? t('profile.signOut') : t('profile.signIn')"
        :title="userStore.isLoggedIn ? t('profile.signOut') : t('profile.signIn')"
        @click="userStore.isLoggedIn ? logout() : (loginOpen = !loginOpen)"
      >
        <Icon :name="userStore.isLoggedIn ? 'lock' : 'user'" :size="18" />
      </button>
    </div>

    <h1 class="mb-6 font-display text-4xl tracking-wide">{{ t('profile.title') }}</h1>

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
              class="rounded-full border border-accent bg-accent text-on-accent px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent-text"
            >
              Admin
            </span>
          </div>
        </div>
      </div>
      <dl class="grid grid-cols-3 gap-2 text-center">
        <div class="rounded-xl border border-edge bg-surface p-2">
          <dt class="text-[11px] uppercase tracking-wide text-txt-soft">{{ t('profile.score') }}</dt>
          <dd class="font-display text-2xl">{{ userStore.profile.contribution_score }}</dd>
        </div>
        <div class="rounded-xl border border-edge bg-surface p-2">
          <dt class="text-[11px] uppercase tracking-wide text-txt-soft">{{ t('profile.courtsAdded') }}</dt>
          <dd class="font-display text-2xl">{{ userStore.profile.courts_added }}</dd>
        </div>
        <div class="rounded-xl border border-edge bg-surface p-2">
          <dt class="text-[11px] uppercase tracking-wide text-txt-soft">{{ t('profile.validationsDone') }}</dt>
          <dd class="font-display text-2xl">{{ userStore.profile.validations_done }}</dd>
        </div>
      </dl>
      <p class="mt-3 text-xs text-txt-soft">
        {{ t('profile.devSession') }}
      </p>
    </div>

    <!-- Formulaire de connexion -->
    <form
      v-else-if="loginOpen"
      class="space-y-3 rounded-2xl border border-edge bg-card p-5"
      @submit.prevent="submitLogin"
    >
      <div>
        <label class="mb-1.5 block text-sm font-semibold" for="login-id">{{ t('profile.identifier') }}</label>
        <input
          id="login-id"
          v-model="identifier"
          type="text"
          autocomplete="username"
          class="w-full rounded-xl border border-edge bg-surface px-4 py-3 outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-semibold" for="login-code">{{ t('profile.code') }}</label>
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
        {{ t('profile.signIn') }}
      </button>
    </form>

    <!-- Déconnecté : l'invitation -->
    <div v-else class="flex flex-col items-center gap-4 rounded-2xl border border-edge bg-card p-8 text-center">
      <Mascot />
      <p class="font-semibold">{{ t('profile.soon') }}</p>
      <p class="text-sm text-txt-soft">
        {{ t('profile.soonHint') }}
      </p>
    </div>

    <!-- Apparence : le mode jour est le defaut, l'app s'utilise dehors -->
    <section class="mt-8">
      <h2 class="mb-3 font-display text-2xl tracking-wide">{{ t('profile.appearance') }}</h2>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="choice in THEME_CHOICES"
          :key="choice.key"
          type="button"
          class="rounded-2xl border px-3 py-3 text-center transition"
          :class="theme.mode.value === choice.key ? 'border-accent bg-accent text-on-accent' : 'border-edge bg-card'"
          @click="theme.set(choice.key)"
        >
          <span class="block text-sm font-bold">{{ t(choice.labelKey) }}</span>
          <span
            class="mt-0.5 block text-[11px] leading-tight"
            :class="theme.mode.value === choice.key ? 'opacity-90' : 'text-txt-soft'"
          >{{ t(choice.hintKey) }}</span>
        </button>
      </div>
    </section>

    <section class="mt-8">
      <h2 class="mb-3 font-display text-2xl tracking-wide">{{ t('profile.language') }}</h2>
      <div class="flex gap-3">
        <button
          v-for="lang in LANGUAGES"
          :key="lang.key"
          type="button"
          class="grid h-11 w-14 place-items-center rounded-lg border-2 transition"
          :class="locale === lang.key ? 'border-accent' : 'border-edge opacity-55 hover:opacity-100'"
          :aria-label="lang.label"
          :title="lang.label"
          :aria-pressed="locale === lang.key"
          @click="setLocale(lang.key)"
        >
          <svg viewBox="0 0 24 16" width="30" height="20" aria-hidden="true" v-html="FLAGS[lang.key]" />
        </button>
      </div>
    </section>

    <section class="mt-8">
      <button
        class="inline-flex min-h-11 items-center gap-2 border-2 border-edge bg-card px-4 text-sm font-bold"
        @click="router.push('/decouvrir')"
      >
        <Icon name="ball" :size="16" />
        {{ t('welcome.seeAgain') }}
      </button>
    </section>

    <section class="mt-8">
      <h2 class="mb-3 font-display text-2xl tracking-wide">{{ t('profile.statuses') }}</h2>
      <ul class="space-y-2">
        <li
          v-for="level in STATUS_LEVELS"
          :key="level.key"
          class="flex items-center justify-between rounded-2xl border border-edge bg-card px-4 py-3"
        >
          <ContributorBadge :status="level.key" />
          <span class="text-xs text-txt-soft">{{ t('profile.quotaPoints', { points: level.minScore, quota: t(level.quotaKey) }) }}</span>
        </li>
      </ul>
    </section>
  </div>
</template>
