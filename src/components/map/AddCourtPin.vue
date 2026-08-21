<script setup>
import { ref } from 'vue'
import { useMapStore } from '../../stores/map.js'

// Overlay du mode "pin ton terrain" : instruction, recherche d'adresse
// optionnelle (Nominatim), confirmation / annulation.
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
      searchError.value = 'Adresse introuvable.'
      return
    }
    emit('goto', { lng: parseFloat(results[0].lon), lat: parseFloat(results[0].lat) })
  } catch {
    searchError.value = 'Recherche indisponible.'
  } finally {
    searching.value = false
  }
}
</script>

<template>
  <div class="pointer-events-none absolute inset-0 z-20 flex flex-col">
    <!-- Recherche d'adresse (optionnelle, secondaire) -->
    <div class="pointer-events-auto mx-auto mt-4 w-[min(400px,calc(100vw-32px))]">
      <form class="flex gap-2" @submit.prevent="searchAddress">
        <input
          v-model="address"
          type="search"
          placeholder="Ou cherche une adresse… (optionnel)"
          class="min-w-0 flex-1 rounded-full border border-edge bg-surface px-4 py-2.5 text-sm outline-none placeholder:text-txt-soft focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          :disabled="searching"
          class="rounded-full bg-card px-4 text-sm font-bold text-white"
        >
          {{ searching ? '…' : 'OK' }}
        </button>
      </form>
      <p v-if="searchError" class="mt-1 text-center text-xs text-bad-soft">{{ searchError }}</p>
    </div>

    <!-- Instruction -->
    <div class="mx-auto mt-3">
      <p class="rounded-full bg-black/80 px-5 py-2.5 text-sm font-semibold shadow-lg">
        {{ mapStore.pinLngLat ? 'Ajuste le pin, puis confirme 👇' : 'Tape sur la carte pour placer ton terrain 🏀' }}
      </p>
    </div>

    <!-- Actions -->
    <div class="pointer-events-auto mt-auto mb-24 flex justify-center gap-3 lg:mb-8">
      <button
        class="rounded-full border border-edge bg-surface px-6 py-3 text-sm font-bold uppercase tracking-wide"
        @click="emit('cancel')"
      >
        Annuler
      </button>
      <button
        v-if="mapStore.pinLngLat"
        class="rounded-full bg-accent text-court px-8 py-3 text-sm font-bold uppercase tracking-wide shadow-lg shadow-accent/30"
        @click="emit('confirm')"
      >
        C'est ici ✓
      </button>
    </div>
  </div>
</template>
