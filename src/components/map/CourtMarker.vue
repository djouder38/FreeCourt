<script setup>
import { computed } from 'vue'
import { CONDITION_LABELS } from '../../services/labels.js'

// Marker SVG dynamique : contour = état, texture = revêtement,
// badge = fréquentation, semi-transparent si draft.
const props = defineProps({
  court: { type: Object, required: true },
})

const ringColor = computed(() => CONDITION_LABELS[props.court.condition]?.hex ?? '#9CA3AF')
const badge = computed(() => {
  if (props.court.traffic === 'busy') return '🔥'
  if (props.court.traffic === 'iconic') return '⭐'
  return null
})
</script>

<template>
  <div class="fc-marker relative" :class="{ 'fc-marker--draft': court.status === 'draft' }">
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
      <circle cx="19" cy="19" r="17" fill="#1a1a1a" :stroke="ringColor" stroke-width="3" />
      <!-- ballon -->
      <circle cx="19" cy="19" r="10" fill="#FF6B2B" />
      <path d="M9 19 H29 M19 9 V29" stroke="#1a1a1a" stroke-width="1.6" />
      <path d="M12 12 Q19 19 12 26 M26 12 Q19 19 26 26" stroke="#1a1a1a" stroke-width="1.6" fill="none" />
      <!-- texture revêtement -->
      <g v-if="court.surface === 'concrete'" stroke="#9CA3AF" stroke-width="1">
        <path d="M6 28 l3 2 M28 7 l3 2" />
      </g>
      <g v-else-if="court.surface === 'parquet'" stroke="#D4A45C" stroke-width="1.4">
        <path d="M5 26 h5 M27 8 h5" />
      </g>
      <g v-else-if="court.surface === 'synthetic'" stroke="#3B82F6" stroke-width="1.4">
        <path d="M5 25 l4 -2 M28 9 l4 -2" />
      </g>
      <g v-else-if="court.surface === 'sand'" fill="#FFD700">
        <circle cx="7" cy="27" r="1.2" />
        <circle cx="30" cy="8" r="1.2" />
      </g>
    </svg>
    <span
      v-if="badge"
      class="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-surface text-[11px] shadow"
    >
      {{ badge }}
    </span>
  </div>
</template>
