<script setup>
import { useRouter } from 'vue-router'
import Mascot from '../components/ui/Mascot.vue'
import { t } from '../i18n/index.js'

const router = useRouter()
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
    <Mascot mood="sad" :size="120" />
    <h1 class="font-display text-5xl tracking-wide">{{ t('notFound.title') }}</h1>
    <p class="text-txt-soft">{{ t('notFound.text') }}</p>
    <button class="rounded-full bg-accent text-on-accent px-6 py-3 font-bold uppercase tracking-wide" @click="router.push('/')">
      {{ t('nav.backToMap') }}
    </button>
  </div>
</template>
