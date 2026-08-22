<script setup>
import { useRouter } from 'vue-router'
import { t } from '../i18n/index.js'
import Icon from '../components/ui/Icon.vue'
import Mascot from '../components/ui/Mascot.vue'
import CourtMarker from '../components/map/CourtMarker.vue'

const router = useRouter()

// Vue une fois, puis plus jamais : le joueur pressé ne doit pas retraverser
// une présentation à chaque ouverture. Accessible ensuite depuis le profil.
const SEEN_KEY = 'freecourt:welcomeSeen'

function enter() {
  try {
    localStorage.setItem(SEEN_KEY, '1')
  } catch {
    /* navigation privée : la présentation reviendra, tant pis */
  }
  router.push('/')
}

const WHAT = [
  { icon: 'pin', titleKey: 'welcome.what1Title', textKey: 'welcome.what1' },
  { icon: 'concrete', titleKey: 'welcome.what2Title', textKey: 'welcome.what2' },
  { icon: 'route', titleKey: 'welcome.what3Title', textKey: 'welcome.what3' },
]

// Chaque étape est illustrée par l'objet réel de l'app, pas par une icône
// décorative : le marqueur montré ici est celui que l'utilisateur verra.
const STEPS = [
  { n: 1, titleKey: 'welcome.step1Title', textKey: 'welcome.step1', demo: { condition: 'good', surface: 'concrete', traffic: 'quiet', status: 'draft' } },
  { n: 2, titleKey: 'welcome.step2Title', textKey: 'welcome.step2', demo: { condition: 'good', surface: 'concrete', traffic: 'busy', status: 'validated' } },
  { n: 3, titleKey: 'welcome.step3Title', textKey: 'welcome.step3', demo: { condition: 'average', surface: 'wood', traffic: 'quiet', status: 'validated' } },
  { n: 4, titleKey: 'welcome.step4Title', textKey: 'welcome.step4', demo: { condition: 'degraded', surface: 'sand', traffic: 'quiet', status: 'flagged' } },
]
</script>

<template>
  <div class="mx-auto max-w-2xl px-5 pb-32 pt-10">
    <!-- Ouverture -->
    <header class="mb-10">
      <p class="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-accent-text">
        {{ t('welcome.kicker') }}
      </p>
      <h1 class="mb-4 font-display text-5xl leading-[0.95] tracking-wide sm:text-6xl">
        {{ t('welcome.title') }}
      </h1>
      <p class="text-base leading-relaxed text-txt-soft">{{ t('welcome.intro') }}</p>
    </header>

    <!-- Ce que le produit apporte -->
    <section class="mb-12">
      <h2 class="mb-4 font-display text-2xl tracking-wide">{{ t('welcome.whatTitle') }}</h2>
      <ul class="space-y-3">
        <li
          v-for="item in WHAT"
          :key="item.titleKey"
          class="flex gap-3 border-l-2 border-accent bg-surface p-4"
        >
          <Icon :name="item.icon" :size="22" class="mt-0.5 text-accent-text" />
          <div>
            <h3 class="font-bold">{{ t(item.titleKey) }}</h3>
            <p class="mt-1 text-sm leading-relaxed text-txt-soft">{{ t(item.textKey) }}</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- Le principe de contribution : le cœur du sujet -->
    <section class="mb-12">
      <h2 class="mb-3 font-display text-2xl tracking-wide">{{ t('welcome.contribTitle') }}</h2>
      <p class="mb-5 text-sm leading-relaxed text-txt-soft">{{ t('welcome.contribIntro') }}</p>

      <ol class="space-y-4">
        <li v-for="step in STEPS" :key="step.n" class="flex gap-4">
          <div class="flex shrink-0 flex-col items-center gap-2">
            <span
              class="grid h-9 w-9 place-items-center bg-accent font-display text-xl leading-none text-on-accent"
            >
              {{ step.n }}
            </span>
            <CourtMarker :court="step.demo" />
          </div>
          <div class="pb-2">
            <h3 class="font-bold">{{ t(step.titleKey) }}</h3>
            <p class="mt-1 text-sm leading-relaxed text-txt-soft">{{ t(step.textKey) }}</p>
          </div>
        </li>
      </ol>

      <p class="mt-6 border-l-2 border-edge bg-card p-4 text-sm leading-relaxed text-txt-soft">
        {{ t('welcome.statusNote') }}
      </p>
    </section>

    <div class="flex items-center gap-4">
      <Mascot :size="56" />
      <button
        class="min-h-14 flex-1 bg-accent px-6 font-display text-2xl uppercase tracking-wide text-on-accent shadow-[var(--shadow-raised)]"
        @click="enter"
      >
        {{ t('welcome.cta') }}
      </button>
    </div>
  </div>
</template>
