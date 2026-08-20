<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCourtsStore } from '../stores/courts.js'
import { useMapStore } from '../stores/map.js'
import { SURFACE_LABELS, CONDITION_LABELS, TRAFFIC_LABELS } from '../services/labels.js'
import MapView from '../components/map/MapView.vue'
import AddCourtPin from '../components/map/AddCourtPin.vue'
import CourtCard from '../components/court/CourtCard.vue'
import CourtBadges from '../components/court/CourtBadges.vue'
import BottomSheet from '../components/ui/BottomSheet.vue'
import StatusChip from '../components/ui/StatusChip.vue'
import Mascot from '../components/ui/Mascot.vue'

const router = useRouter()
const courtsStore = useCourtsStore()
const mapStore = useMapStore()

const mapView = ref(null)
const filtersOpen = ref(false)
const searchOpen = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)

const selectedCourt = computed(() => courtsStore.selected)

onMounted(() => {
  if (courtsStore.courts.length === 0) courtsStore.load()
})

function onSelect(id) {
  courtsStore.select(id)
}

function openDetail(id) {
  router.push(`/court/${id}`)
}

function startAdd() {
  courtsStore.select(null)
  mapStore.enterPinMode()
}

function confirmPin() {
  const p = mapStore.pinLngLat
  mapStore.exitPinMode()
  router.push({ path: '/add', query: { lat: p.lat.toFixed(6), lng: p.lng.toFixed(6) } })
}

async function runSearch() {
  const q = searchQuery.value.trim()
  if (!q) return
  searching.value = true
  try {
    const res = await fetch(
      'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=' + encodeURIComponent(q),
    )
    searchResults.value = (await res.json()).map((r) => ({
      label: r.display_name,
      lng: parseFloat(r.lon),
      lat: parseFloat(r.lat),
    }))
  } catch {
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

function gotoPlace(place) {
  searchOpen.value = false
  searchQuery.value = ''
  searchResults.value = []
  mapView.value?.flyTo(place, 13)
}

defineExpose({ openSearch: () => (searchOpen.value = true) })

const FILTER_GROUPS = [
  { field: 'surface', label: 'Surface', options: SURFACE_LABELS },
  { field: 'condition', label: 'État', options: CONDITION_LABELS },
  { field: 'traffic', label: 'Fréquentation', options: TRAFFIC_LABELS },
]

function toggleFilter(field, key) {
  courtsStore.filters[field] = courtsStore.filters[field] === key ? null : key
}
</script>

<template>
  <div class="flex h-full">
    <!-- Sidebar desktop : liste / détail -->
    <aside class="hidden w-80 shrink-0 flex-col overflow-y-auto border-r border-edge bg-surface lg:flex">
      <div class="border-b border-edge p-4">
        <h1 class="font-display text-3xl tracking-wide text-accent">FreeCourt</h1>
        <p class="text-xs text-txt-soft">Les terrains de basket du monde entier</p>
      </div>

      <div v-if="selectedCourt" class="p-4">
        <button class="mb-3 text-xs font-semibold text-txt-soft hover:text-white" @click="courtsStore.select(null)">
          ← Retour à la liste
        </button>
        <CourtCard :court="selectedCourt" @open="openDetail(selectedCourt.id)" />
      </div>

      <div v-else class="flex-1 p-2">
        <p v-if="courtsStore.loading" class="p-4 text-sm text-txt-soft">Chargement…</p>
        <p v-else-if="courtsStore.error" class="p-4 text-sm text-bad">{{ courtsStore.error }}</p>
        <div v-else-if="courtsStore.filtered.length === 0" class="flex flex-col items-center gap-3 p-8 text-center">
          <Mascot mood="sad" :size="72" />
          <p class="text-sm text-txt-soft">Aucun terrain ici. Ajoute le premier !</p>
        </div>
        <button
          v-for="court in courtsStore.filtered"
          :key="court.id"
          class="w-full rounded-xl p-3 text-left transition hover:bg-card"
          @click="((courtsStore.select(court.id)), mapView?.flyTo({ lng: court.lng, lat: court.lat }, 14))"
        >
          <div class="mb-1 flex items-center justify-between gap-2">
            <span class="truncate font-semibold">{{ court.name }}</span>
            <StatusChip :status="court.status" />
          </div>
          <CourtBadges :court="court" compact />
        </button>
      </div>

      <div class="border-t border-edge p-4">
        <button
          class="w-full rounded-full bg-accent py-3 font-bold uppercase tracking-wide shadow-lg shadow-accent/25"
          @click="startAdd"
        >
          🏀 Ajouter un terrain
        </button>
      </div>
    </aside>

    <!-- Carte -->
    <div class="relative min-w-0 flex-1">
      <MapView ref="mapView" @select="onSelect" />

      <!-- Ronds flottants : filtres + position -->
      <div class="absolute left-4 top-4 z-10">
        <button
          class="grid h-12 w-12 place-items-center rounded-full border-2 border-accent bg-surface text-lg shadow-lg"
          :class="{ 'bg-accent': courtsStore.hasActiveFilters }"
          aria-label="Filtres"
          @click="filtersOpen = !filtersOpen"
        >
          ⚙️
        </button>
        <div v-if="filtersOpen" class="mt-2 w-64 rounded-2xl border border-edge bg-surface p-4 shadow-2xl">
          <div v-for="group in FILTER_GROUPS" :key="group.field" class="mb-3 last:mb-0">
            <p class="mb-1.5 text-xs font-bold uppercase tracking-wide text-txt-soft">{{ group.label }}</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="(cfg, key) in group.options"
                :key="key"
                class="rounded-full border px-2.5 py-1 text-xs font-semibold"
                :class="courtsStore.filters[group.field] === key ? 'border-accent bg-accent/20' : 'border-edge bg-card'"
                @click="toggleFilter(group.field, key)"
              >
                {{ cfg.icon }} {{ cfg.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <button
        class="absolute right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-full border-2 border-accent bg-surface text-lg shadow-lg"
        aria-label="Ma position"
        @click="mapView?.locateMe()"
      >
        📍
      </button>

      <!-- Bouton AJOUTER flottant (mobile) -->
      <button
        v-if="mapStore.mode === 'browse'"
        class="absolute bottom-24 left-1/2 z-10 -translate-x-1/2 rounded-full bg-accent px-8 py-3.5 font-bold uppercase tracking-wide shadow-xl shadow-accent/30 lg:hidden"
        @click="startAdd"
      >
        🏀 Ajouter
      </button>

      <!-- Mode pin -->
      <AddCourtPin
        v-if="mapStore.mode === 'pin'"
        @cancel="mapStore.exitPinMode()"
        @confirm="confirmPin"
        @goto="(p) => ((mapView?.flyTo(p, 16)), mapStore.dropPin(p))"
      />

      <!-- États chargement / erreur (mobile, la sidebar les couvre en desktop) -->
      <p
        v-if="courtsStore.loading"
        class="absolute bottom-40 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-xs lg:hidden"
      >
        Chargement des terrains…
      </p>
      <p
        v-else-if="courtsStore.error"
        class="absolute bottom-40 left-1/2 z-10 -translate-x-1/2 rounded-full bg-bad px-4 py-2 text-xs font-semibold lg:hidden"
      >
        {{ courtsStore.error }}
      </p>
    </div>

    <!-- Fiche terrain mobile : bottom sheet -->
    <BottomSheet v-if="selectedCourt" class="lg:hidden" @close="courtsStore.select(null)">
      <CourtCard :court="selectedCourt" @open="openDetail(selectedCourt.id)" />
    </BottomSheet>

    <!-- Recherche (ouverte via la tab bar) -->
    <BottomSheet v-if="searchOpen" @close="searchOpen = false">
      <h2 class="mb-3 font-display text-2xl tracking-wide">Chercher un spot</h2>
      <form class="mb-3 flex gap-2" @submit.prevent="runSearch">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Ville, quartier, adresse…"
          class="min-w-0 flex-1 rounded-xl border border-edge bg-card px-4 py-3 outline-none placeholder:text-txt-soft focus:ring-2 focus:ring-accent"
        />
        <button class="rounded-xl bg-accent px-5 font-bold" :disabled="searching">
          {{ searching ? '…' : 'OK' }}
        </button>
      </form>
      <button
        v-for="place in searchResults"
        :key="place.label"
        class="block w-full rounded-xl p-3 text-left text-sm hover:bg-card"
        @click="gotoPlace(place)"
      >
        📍 {{ place.label }}
      </button>
    </BottomSheet>
  </div>
</template>
