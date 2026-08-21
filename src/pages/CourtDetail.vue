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
import Icon from '../components/ui/Icon.vue'
import { formatAge, isStale } from '../services/geo.js'
import { t } from '../i18n/index.js'

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
    error.value = t('court.notFound')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 pb-28 pt-4 lg:pb-8">
    <button class="-mx-2 mb-2 inline-flex min-h-11 items-center gap-1.5 px-2 text-sm font-semibold text-txt-soft hover:text-txt" @click="router.back()">
      <Icon name="back" :size="16" /> {{ t('nav.back') }}
    </button>

    <div v-if="loading" class="py-16 text-center text-txt-soft">{{ t('map.loading') }}</div>

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
        <span class="inline-flex items-center gap-1 text-gold"><Icon name="star" :size="14" filled />{{ court.rating_avg }}/5</span> · {{ t('court.reviewCount', { count: court.rating_count }) }}
        <span v-if="court.locked" class="ml-2 inline-flex items-center gap-1"><Icon name="lock" :size="13" />{{ t('court.validatedByCommunity') }}</span>
      </p>

      <CourtBadges :court="court" class="mb-3" />

      <!-- Fraicheur : le produit promet que l etat d un terrain se degrade.
           Afficher un etat sans dire quand il a ete constate, c est presenter
           une info peut-etre fausse comme un fait. -->
      <p
        class="mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
        :class="isStale(court.updated_at || court.created_at)
          ? 'border-warn/40 bg-warn/10 text-warn'
          : 'border-edge bg-card text-txt-soft'"
      >
        <Icon :name="isStale(court.updated_at || court.created_at) ? 'alert' : 'checkCircle'" :size="13" />
        <template v-if="isStale(court.updated_at || court.created_at)">
          {{ t('court.staleWarning', { age: formatAge(court.updated_at || court.created_at) }) }}
        </template>
        <template v-else>
          {{ t('court.describedAgo', { age: formatAge(court.updated_at || court.created_at) }) }}
          <template v-if="court.validation_count"> · {{ t('court.confirmedBy', { count: court.validation_count, s: court.validation_count > 1 ? 's' : '' }) }}</template>
        </template>
      </p>

      <p v-if="court.description" class="mb-6 leading-relaxed text-txt-soft">{{ court.description }}</p>

      <a
        :href="`https://www.google.com/maps/dir/?api=1&destination=${court.lat},${court.lng}`"
        target="_blank"
        rel="noopener"
        class="mb-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-accent shadow-lg shadow-accent/25"
      >
        <Icon name="route" :size="16" /> {{ t('court.directions') }}
      </a>

      <div class="space-y-6">
        <CourtPhotos :court="court" @uploaded="load" />
        <ValidationPanel :court="court" @validated="load" />
        <CourtRating :court="court" @posted="load" />
      </div>
    </template>
  </div>
</template>
