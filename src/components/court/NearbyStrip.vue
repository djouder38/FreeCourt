<script setup>
import { computed } from 'vue'
import { formatDistance } from '../../services/geo.js'
import { SURFACE_LABELS, CONDITION_LABELS } from '../../services/labels.js'
import Icon from '../ui/Icon.vue'
import { t } from '../../i18n/index.js'

// Ce que le joueur veut en arrivant : les terrains proches, pas une question.
// Tant qu'on ne connaît pas sa position, la bande ne s'affiche pas du tout —
// c'est le bouton de localisation, posé avec les autres contrôles de carte,
// qui la déclenche.
const props = defineProps({
  courts: { type: Array, default: () => [] },
})

defineEmits(['select'])

const visible = computed(() => props.courts.slice(0, 10))
</script>

<template>
  <div class="pointer-events-none absolute inset-x-0 bottom-20 z-10 lg:hidden">
    <div class="pointer-events-auto flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 pb-1">
      <button
        v-for="court in visible"
        :key="court.id"
        class="w-60 shrink-0 snap-start rounded-2xl border border-edge bg-surface p-3 text-left shadow-[var(--shadow-raised)] backdrop-blur"
        @click="$emit('select', court.id)"
      >
        <div class="mb-1 flex items-baseline justify-between gap-2">
          <span class="truncate font-semibold">{{ court.name }}</span>
          <span class="shrink-0 text-sm font-bold text-accent-text">
            {{ formatDistance(court.distance) }}
          </span>
        </div>
        <div class="flex items-center gap-2 text-xs text-txt-soft">
          <span v-if="court.surface" class="inline-flex items-center gap-1">
            <Icon :name="SURFACE_LABELS[court.surface].icon" :size="13" />
            {{ t(SURFACE_LABELS[court.surface].key) }}
          </span>
          <span
            v-if="court.condition"
            class="inline-flex items-center gap-1"
            :class="CONDITION_LABELS[court.condition].color"
          >
            <Icon :name="CONDITION_LABELS[court.condition].icon" :size="13" />
            {{ t(CONDITION_LABELS[court.condition].key) }}
          </span>
        </div>
      </button>

      <div
        v-if="visible.length === 0"
        class="w-full rounded-2xl border border-edge bg-surface p-4 text-center text-sm text-txt-soft shadow-[var(--shadow-raised)] backdrop-blur"
      >
        {{ t('map.noneNearby') }}
      </div>
    </div>
  </div>
</template>
