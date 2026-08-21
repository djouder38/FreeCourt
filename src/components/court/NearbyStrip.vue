<script setup>
import { computed } from 'vue'
import { formatDistance } from '../../services/geo.js'
import { SURFACE_LABELS, CONDITION_LABELS } from '../../services/labels.js'
import Icon from '../ui/Icon.vue'

// Ce que le joueur veut en arrivant : les terrains proches, pas une question.
// La bande remplace les deux gros CTA qui occupaient le bas de l'écran.
const props = defineProps({
  courts: { type: Array, default: () => [] },
  locating: { type: String, default: null },
  hasPosition: { type: Boolean, default: false },
})

defineEmits(['select', 'locate', 'add'])

const visible = computed(() => props.courts.slice(0, 10))
</script>

<template>
  <div class="pointer-events-none absolute inset-x-0 bottom-20 z-10 lg:hidden">
    <!-- Pas encore de position : une invitation, pas un mur -->
    <div v-if="!hasPosition" class="pointer-events-auto px-3">
      <button
        class="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3.5 text-sm font-bold uppercase tracking-wide text-on-accent shadow-xl shadow-accent/30"
        @click="$emit('locate')"
      >
        <Icon name="pin" :size="18" />
        {{ locating === 'searching' ? 'Recherche de ta position…' : 'Voir les terrains près de moi' }}
      </button>
    </div>

    <!-- Position connue : les terrains, triés par distance -->
    <div v-else>
      <div class="pointer-events-auto flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 pb-1">
        <button
          v-for="court in visible"
          :key="court.id"
          class="w-60 shrink-0 snap-start rounded-2xl border border-edge bg-surface/95 p-3 text-left shadow-xl backdrop-blur"
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
              {{ SURFACE_LABELS[court.surface].label }}
            </span>
            <span
              v-if="court.condition"
              class="inline-flex items-center gap-1"
              :class="CONDITION_LABELS[court.condition].color"
            >
              <Icon :name="CONDITION_LABELS[court.condition].icon" :size="13" />
              {{ CONDITION_LABELS[court.condition].label }}
            </span>
          </div>
        </button>

        <div
          v-if="visible.length === 0"
          class="w-full rounded-2xl border border-edge bg-surface/95 p-4 text-center text-sm text-txt-soft shadow-xl backdrop-blur"
        >
          Aucun terrain ne correspond ici.
        </div>
      </div>
    </div>
  </div>
</template>
