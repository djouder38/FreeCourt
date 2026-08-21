<script setup>
import CourtBadges from './CourtBadges.vue'
import StatusChip from '../ui/StatusChip.vue'
import Icon from '../ui/Icon.vue'
import { t } from '../../i18n/index.js'

// Contenu de la fiche terrain affichée en bottom sheet (mobile) ou sidebar.
defineProps({
  court: { type: Object, required: true },
})
defineEmits(['open'])
</script>

<template>
  <article>
    <div class="mb-1 flex items-start justify-between gap-3">
      <h2 class="font-display text-3xl leading-none tracking-wide">{{ court.name }}</h2>
      <StatusChip :status="court.status" />
    </div>
    <p v-if="court.rating_avg" class="mb-3 text-sm text-txt-soft">
      <span class="inline-flex items-center gap-1 text-gold"><Icon name="star" :size="14" filled />{{ court.rating_avg }}/5</span> · {{ t('court.reviewCount', { count: court.rating_count }) }}
    </p>
    <p v-else class="mb-3 text-sm text-txt-soft">{{ t('court.noReview') }}</p>

    <CourtBadges :court="court" class="mb-4" />

    <div v-if="court.photos?.length" class="mb-4 flex gap-2 overflow-x-auto">
      <img
        v-for="photo in court.photos.slice(0, 3)"
        :key="photo.id"
        :src="photo.url"
        loading="lazy"
        alt=""
        class="h-24 w-32 shrink-0 rounded-xl border border-edge object-cover"
      />
    </div>

    <p v-if="court.description" class="mb-4 text-sm leading-relaxed text-txt-soft">
      {{ court.description }}
    </p>

    <button
      class="w-full rounded-full bg-accent py-3 font-bold uppercase tracking-wide text-on-accent shadow-lg shadow-accent/25 hover:bg-accent/90"
      @click="$emit('open')"
    >
      {{ t('court.open') }}
    </button>
  </article>
</template>
