<script setup>
import { useRouter } from 'vue-router'
import Mascot from '../components/ui/Mascot.vue'

const router = useRouter()
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
    <Mascot mood="sad" :size="120" />
    <h1 class="font-display text-5xl tracking-wide">Airball !</h1>
    <p class="text-txt-soft">Cette page n'existe pas.</p>
    <button class="rounded-full bg-accent text-on-accent px-6 py-3 font-bold uppercase tracking-wide" @click="router.push('/')">
      Retour à la carte
    </button>
  </div>
</template>
