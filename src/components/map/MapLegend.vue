<script setup>
import { SURFACE_LABELS, CONDITION_LABELS, TRAFFIC_LABELS } from '../../services/labels.js'
import Icon from '../ui/Icon.vue'
import CourtMarker from './CourtMarker.vue'
import { t } from '../../i18n/index.js'

// Un marqueur FreeCourt encode quatre informations à la fois : l'anneau dit
// l'état, la texture le revêtement, la pastille la fréquentation, et la
// transparence le statut. Personne ne peut le deviner — d'où cette légende.
defineEmits(['close'])

const DEMOS = {
  good: { condition: 'good', surface: 'concrete', traffic: 'quiet', status: 'validated' },
  average: { condition: 'average', surface: 'wood', traffic: 'busy', status: 'validated' },
  degraded: { condition: 'degraded', surface: 'sand', traffic: 'iconic', status: 'validated' },
  draft: { condition: 'good', surface: 'synthetic', traffic: 'quiet', status: 'draft' },
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-end justify-center bg-txt/50 p-0 sm:items-center sm:p-4"
    role="dialog"
    aria-modal="true"
    :aria-label="t('map.legend')"
    @click.self="$emit('close')"
  >
    <div
      class="max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl border border-edge bg-surface p-5 shadow-2xl sm:max-w-md sm:rounded-3xl"
    >
      <div class="mb-4 flex items-start justify-between gap-3">
        <h2 class="font-display text-2xl leading-none tracking-wide">{{ t('legend.title') }}</h2>
        <button
          class="-mr-1 -mt-1 grid h-11 w-11 place-items-center rounded-full text-txt-soft hover:bg-card"
          :aria-label="t('legend.close')"
          @click="$emit('close')"
        >
          <Icon name="close" :size="18" />
        </button>
      </div>

      <!-- L'anneau : l'information la plus importante, celle qui décide -->
      <section class="mb-5">
        <h3 class="mb-2 text-xs font-bold uppercase tracking-wide text-txt-soft">
          {{ t('legend.ring') }}
        </h3>
        <ul class="space-y-2">
          <li
            v-for="(cfg, key) in CONDITION_LABELS"
            :key="key"
            class="flex items-center gap-3 rounded-xl border border-edge bg-card p-2"
          >
            <CourtMarker :court="DEMOS[key]" />
            <span class="text-sm font-semibold" :class="cfg.color">{{ t(cfg.key) }}</span>
          </li>
        </ul>
      </section>

      <section class="mb-5">
        <h3 class="mb-2 text-xs font-bold uppercase tracking-wide text-txt-soft">
          {{ t('legend.texture') }}
        </h3>
        <div class="grid grid-cols-2 gap-2">
          <span
            v-for="(cfg, key) in SURFACE_LABELS"
            :key="key"
            class="flex items-center gap-2 rounded-xl border border-edge bg-card px-3 py-2 text-sm"
          >
            <Icon :name="cfg.icon" :size="18" />{{ t(cfg.key) }}
          </span>
        </div>
      </section>

      <section class="mb-5">
        <h3 class="mb-2 text-xs font-bold uppercase tracking-wide text-txt-soft">
          {{ t('legend.badge') }}
        </h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(cfg, key) in TRAFFIC_LABELS"
            :key="key"
            class="flex items-center gap-2 rounded-xl border border-edge bg-card px-3 py-2 text-sm"
          >
            <Icon :name="cfg.icon" :size="16" />{{ t(cfg.key) }}
          </span>
        </div>
        <p class="mt-2 text-xs text-txt-soft">
          {{ t('legend.quietNote') }}
        </p>
      </section>

      <section>
        <h3 class="mb-2 text-xs font-bold uppercase tracking-wide text-txt-soft">
          {{ t('legend.rest') }}
        </h3>
        <ul class="space-y-2 text-sm">
          <li class="flex items-center gap-3">
            <CourtMarker :court="DEMOS.draft" />
            <span class="text-txt-soft">
              {{ t('legend.draft', { status: t('legend.draftStatus') }) }}
            </span>
          </li>
          <li class="flex items-center gap-3">
            <span class="grid h-9 w-9 shrink-0 place-items-center">
              <span class="fc-user-dot"></span>
            </span>
            <span class="text-txt-soft">{{ t('legend.yourPosition') }}</span>
          </li>
          <li class="flex items-center gap-3">
            <span class="fc-cluster grid h-9 w-9 shrink-0 place-items-center text-xs font-bold text-on-accent">
              12
            </span>
            <span class="text-txt-soft">
              {{ t('legend.cluster') }}
            </span>
          </li>
        </ul>
        <p class="mt-4 text-xs text-txt-soft">
          {{ t('legend.focus') }}
        </p>
      </section>
    </div>
  </div>
</template>
