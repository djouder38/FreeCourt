<script setup>
import CourtBadges from '../court/CourtBadges.vue'
import StatusChip from '../ui/StatusChip.vue'
import Icon from '../ui/Icon.vue'
import { t } from '../../i18n/index.js'

// Aperçu rapide au clic marker (desktop) — le mobile passe par le bottom sheet.
defineProps({
  court: { type: Object, required: true },
})
defineEmits(['open', 'close'])
</script>

<template>
  <div class="w-72 rounded-2xl border border-edge bg-card p-4 shadow-[var(--shadow-raised)]">
    <div class="mb-2 flex items-start justify-between gap-2">
      <h3 class="font-display text-xl leading-none tracking-wide">{{ court.name }}</h3>
      <button class="text-txt-soft hover:text-txt" :aria-label="t('legend.close')" @click="$emit('close')">
        <Icon name="close" :size="16" />
      </button>
    </div>
    <StatusChip :status="court.status" class="mb-2" />
    <CourtBadges :court="court" compact class="mb-3" />
    <p v-if="court.rating_avg" class="mb-3 text-sm text-txt-soft">
      <span class="inline-flex items-center gap-1 text-gold"><Icon name="star" :size="13" filled />{{ court.rating_avg }}/5</span> · {{ t('court.reviewCount', { count: court.rating_count }) }}
    </p>
    <button
      class="w-full rounded-full bg-accent py-2 text-sm font-bold uppercase tracking-wide text-on-accent hover:bg-accent"
      @click="$emit('open')"
    >
      {{ t('court.open') }}
    </button>
  </div>
</template>
