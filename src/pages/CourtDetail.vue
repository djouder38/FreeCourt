<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourtsStore } from '../stores/courts.js'
import CourtBadges from '../components/court/CourtBadges.vue'
import CourtPhotos from '../components/court/CourtPhotos.vue'
import CourtRating from '../components/court/CourtRating.vue'
import ValidationPanel from '../components/community/ValidationPanel.vue'
import StatusChip from '../components/ui/StatusChip.vue'
import Mascot from '../components/ui/Mascot.vue'

const route = useRoute()
const router = useRouter()
const courtsStore = useCourtsStore()

const court = ref(null)
const loading = ref(true)
const error = ref(null)

async function load() {
  // Spinner uniquement au premier chargement : les refreshs (validation,
  // avis, photo) ne doivent pas démonter les sections en cours.
  if (!court.value) loading.value = true
  error.value = null
  try {
    court.value = await courtsStore.loadDetail(route.params.id)
  } catch (err) {
    console.error(err)
    error.value = 'Terrain introuvable.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 pb-28 pt-4 lg:pb-8">
    <button class="mb-4 text-sm font-semibold text-txt-soft hover:text-white" @click="router.back()">
      ← Retour
    </button>

    <div v-if="loading" class="py-16 text-center text-txt-soft">Chargement…</div>

    <div v-else-if="error" class="flex flex-col items-center gap-4 py-16">
      <Mascot mood="sad" />
      <p class="text-txt-soft">{{ error }}</p>
    </div>

    <template v-else-if="court">
      <div class="mb-2 flex items-start justify-between gap-3">
        <h1 class="font-display text-4xl leading-none tracking-wide">{{ court.name }}</h1>
        <StatusChip :status="court.status" />
      </div>
      <p v-if="court.rating_avg" class="mb-3 text-sm text-txt-soft">
        <span class="text-gold">⭐ {{ court.rating_avg }}/5</span> · {{ court.rating_count }} avis
        <span v-if="court.locked" class="ml-2">🔒 verrouillé par la communauté</span>
      </p>

      <CourtBadges :court="court" class="mb-4" />

      <p v-if="court.description" class="mb-6 leading-relaxed text-txt-soft">{{ court.description }}</p>

      <a
        :href="`https://www.google.com/maps/dir/?api=1&destination=${court.lat},${court.lng}`"
        target="_blank"
        rel="noopener"
        class="mb-6 inline-block rounded-full border border-edge bg-card px-5 py-2.5 text-sm font-bold uppercase tracking-wide"
      >
        🧭 S'y rendre
      </a>

      <div class="space-y-6">
        <CourtPhotos :court="court" @uploaded="load" />
        <ValidationPanel :court="court" @validated="load" />
        <CourtRating :court="court" @posted="load" />
      </div>
    </template>
  </div>
</template>
