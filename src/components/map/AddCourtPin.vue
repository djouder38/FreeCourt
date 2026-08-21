<script setup>
import { ref } from 'vue'
import { useMapStore } from '../../stores/map.js'
import Icon from '../ui/Icon.vue'
import { t } from '../../i18n/index.js'

// Overlay du mode "pin ton terrain". Tout est groupé en bas, près du pouce
// et près du bouton de confirmation : posé en haut, ce bloc recouvrait les
// contrôles de carte (filtres, légende, recherche).
const emit = defineEmits(['confirm', 'cancel', 'goto'])
const mapStore = useMapStore()

const address = ref('')
const searching = ref(false)
const searchError = ref(null)

async function searchAddress() {
  const q = address.value.trim()
  if (!q) return
  searching.value = true
  searchError.value = null
  try {
    const res = await fetch(
      'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=' + encodeURIComponent(q),
    )
    const results = await res.json()
    if (results.length === 0) {
      searchError.value = t('pin.addressNotFound')
      return
    }
    emit('goto', { lng: parseFloat(results[0].lon), lat: parseFloat(results[0].lat) })
  } catch {
    searchError.value = t('map.searchUnavailable')
  } finally {
    searching.value = false
  }
}
</script>

<template>
  <div class="pointer-events-none absolute inset-0 z-20 flex flex-col justify-end">
    <div class="pointer-events-auto mb-24 space-y-2 px-3 lg:mb-8">
      <!-- Instruction : dit où on en est dans le geste -->
      <p
        class="mx-auto w-fit rounded-full border border-edge bg-surface px-4 py-2 text-center text-sm font-semibold shadow-lg"
      >
        {{
          mapStore.pinLngLat
            ? t('pin.adjust')
            : t('pin.place')
        }}
      </p>

      <!-- Recherche d'adresse : secondaire, pour ceux qui préfèrent taper -->
      <form class="mx-auto flex w-full max-w-md gap-2" @submit.prevent="searchAddress">
        <input
          v-model="address"
          type="search"
          :placeholder="t('pin.addressPlaceholder')"
          class="min-w-0 flex-1 rounded-full border border-edge bg-surface px-4 py-2.5 text-sm shadow-lg outline-none placeholder:text-txt-soft focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          :disabled="searching"
          class="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-edge bg-surface text-txt shadow-lg disabled:opacity-50"
          :aria-label="t('pin.searchAddress')"
        >
          <span v-if="searching" class="text-sm font-bold">…</span>
          <Icon v-else name="search" :size="18" />
        </button>
      </form>
      <p v-if="searchError" class="text-center text-xs text-bad-soft">{{ searchError }}</p>

      <!-- Actions -->
      <div class="flex justify-center gap-3 pt-1">
        <button
          class="min-h-12 rounded-full border border-edge bg-surface px-6 py-3 text-sm font-bold uppercase tracking-wide shadow-lg"
          @click="emit('cancel')"
        >
          {{ t('pin.cancel') }}
        </button>
        <button
          v-if="mapStore.pinLngLat"
          class="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-8 py-3 text-sm font-bold uppercase tracking-wide text-on-accent shadow-lg shadow-accent/30"
          @click="emit('confirm')"
        >
          <Icon name="check" :size="16" />
          {{ t('pin.confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>
