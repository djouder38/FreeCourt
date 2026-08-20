<script setup>
import { SURFACE_LABELS, CONDITION_LABELS, TRAFFIC_LABELS } from '../../services/labels.js'

defineProps({
  court: { type: Object, required: true },
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <span
      v-if="court.surface"
      class="inline-flex items-center gap-1.5 rounded-full border border-edge bg-card px-3 py-1 text-xs font-semibold"
    >
      {{ SURFACE_LABELS[court.surface]?.icon }}
      <template v-if="!compact">{{ SURFACE_LABELS[court.surface]?.label }}</template>
    </span>
    <span
      v-if="court.condition"
      class="inline-flex items-center gap-1.5 rounded-full border border-edge bg-card px-3 py-1 text-xs font-semibold"
      :class="CONDITION_LABELS[court.condition]?.color"
    >
      {{ CONDITION_LABELS[court.condition]?.icon }}
      <template v-if="!compact">{{ CONDITION_LABELS[court.condition]?.label }}</template>
    </span>
    <span
      v-if="court.traffic"
      class="inline-flex items-center gap-1.5 rounded-full border border-edge bg-card px-3 py-1 text-xs font-semibold"
    >
      {{ TRAFFIC_LABELS[court.traffic]?.icon }}
      <template v-if="!compact">{{ TRAFFIC_LABELS[court.traffic]?.label }}</template>
    </span>
  </div>
</template>
