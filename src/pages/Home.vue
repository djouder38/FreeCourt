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
import Icon from '../components/ui/Icon.vue'
import NearbyStrip from '../components/court/NearbyStrip.vue'

const router = useRouter()
const courtsStore = useCourtsStore()
const mapStore = useMapStore()

const mapView = ref(null)
const filtersOpen = ref(false)
const searchOpen = computed(() => mapStore.searchOpen)
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const searchError = ref(null)
const locating = ref(null)

const selectedCourt = computed(() => courtsStore.selected)

const LOCATING_MESSAGES = {
  searching: 'Recherche de ta position…',
  denied: 'Position refusée — autorise la géolocalisation dans ton navigateur.',
  unsupported: 'Ton navigateur ne gère pas la géolocalisation.',
}

function onLocating({ status, position }) {
  locating.value = status === 'done' ? null : status
  if (position) courtsStore.setUserPosition(position)
  if (status === 'denied' || status === 'unsupported') {
    setTimeout(() => (locating.value = null), 4000)
  }
}

const hasPosition = computed(() => Boolean(courtsStore.userPosition))

function findNearMe() {
  courtsStore.select(null)
  mapView.value?.locateMe()
}

onMounted(async () => {
  if (courtsStore.courts.length === 0) courtsStore.load()

  // On ne déclenche PAS la demande de permission à l'arrivée : un prompt
  // système avant même d'avoir vu l'app fait fuir. Mais si la permission est
  // déjà accordée, on localise sans rien demander — dès la 2e visite, la
  // carte s'ouvre donc directement sur les terrains proches.
  try {
    const status = await navigator.permissions?.query({ name: 'geolocation' })
    if (status?.state === 'granted') mapView.value?.locateMe()
  } catch {
    /* Permissions API absente : on attend que l'utilisateur demande */
  }
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
  searchError.value = null
  try {
    const res = await fetch(
      'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=' + encodeURIComponent(q),
    )
    searchResults.value = (await res.json()).map((r) => ({
      label: r.display_name,
      lng: parseFloat(r.lon),
      lat: parseFloat(r.lat),
    }))
    if (searchResults.value.length === 0) searchError.value = 'Aucun lieu trouvé.'
  } catch {
    searchResults.value = []
    searchError.value = 'Recherche indisponible.'
  } finally {
    searching.value = false
  }
}

function gotoPlace(place) {
  mapStore.closeSearch()
  searchQuery.value = ''
  searchResults.value = []
  searchError.value = null
  mapView.value?.flyTo(place, 13)
}

function closeSearch() {
  mapStore.closeSearch()
  searchResults.value = []
  searchError.value = null
}

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
        <div class="mb-3 flex items-start justify-between gap-2">
          <div>
            <h1 class="font-display text-3xl leading-none tracking-wide text-accent-text">FreeCourt</h1>
            <p class="text-xs text-txt-soft">Les terrains de basket du monde entier</p>
          </div>
          <button
            class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card text-lg hover:bg-edge"
            title="Profil"
            aria-label="Profil"
            @click="router.push('/profile')"
          >
            <Icon name="user" :size="20" />
          </button>
        </div>

        <!-- Recherche : inline en desktop, la tab bar mobile ouvre un sheet -->
        <form class="flex gap-2" @submit.prevent="runSearch">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Ville, quartier, adresse…"
            class="min-w-0 flex-1 rounded-xl border border-edge bg-card px-3 py-2 text-sm outline-none placeholder:text-txt-soft focus:ring-2 focus:ring-accent"
          />
          <button class="grid place-items-center rounded-xl bg-accent px-3 text-sm font-bold text-on-accent" :disabled="searching">
            <span v-if="searching">…</span>
            <Icon v-else name="search" :size="16" />
          </button>
        </form>
        <div v-if="searchResults.length" class="mt-2 space-y-1">
          <button
            v-for="place in searchResults"
            :key="place.label"
            class="block w-full truncate rounded-lg px-2 py-1.5 text-left text-xs hover:bg-card"
            @click="gotoPlace(place)"
          >
            <Icon name="pin" :size="13" class="mr-1 inline align-text-bottom" />{{ place.label }}
          </button>
        </div>
      </div>

      <div v-if="selectedCourt" class="p-4">
        <button class="mb-3 text-xs font-semibold text-txt-soft hover:text-txt" @click="courtsStore.select(null)">
          ← Retour à la liste
        </button>
        <CourtCard :court="selectedCourt" @open="openDetail(selectedCourt.id)" />
      </div>

      <div v-else class="flex-1 p-2">
        <p v-if="courtsStore.loading" class="p-4 text-sm text-txt-soft">Chargement…</p>
        <p v-else-if="courtsStore.error" class="p-4 text-sm text-bad-soft">{{ courtsStore.error }}</p>
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

      <!-- Les 2 actions principales, à parité -->
      <div class="space-y-2 border-t border-edge p-4">
        <button
          class="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3 font-bold uppercase tracking-wide text-on-accent shadow-lg shadow-accent/25"
          @click="findNearMe"
        >
          <Icon name="pin" :size="18" />
          Un terrain près de moi
        </button>
        <button
          class="flex w-full items-center justify-center gap-2 rounded-full border-2 border-accent bg-transparent py-3 font-bold uppercase tracking-wide text-accent-text hover:bg-accent/10"
          @click="startAdd"
        >
          <Icon name="ball" :size="18" />
          Ajouter un terrain
        </button>
      </div>
    </aside>

    <!-- Carte -->
    <div class="relative min-w-0 flex-1">
      <MapView ref="mapView" @select="onSelect" @locating="onLocating" />

      <!-- Recherche compacte : juste un champ + un bouton, en haut de la carte -->
      <div
        v-if="searchOpen"
        class="absolute inset-x-3 top-3 z-20 lg:hidden"
      >
        <form class="flex gap-2" @submit.prevent="runSearch">
          <input
            v-model="searchQuery"
            type="search"
            autofocus
            placeholder="Ville, quartier, adresse…"
            class="min-w-0 flex-1 rounded-full border border-edge bg-surface px-4 py-2.5 text-sm shadow-lg outline-none placeholder:text-txt-soft focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            :disabled="searching"
            class="grid shrink-0 place-items-center rounded-full bg-accent px-4 text-sm font-bold text-on-accent shadow-lg"
          >
            <span v-if="searching">…</span>
            <Icon v-else name="search" :size="18" />
          </button>
          <button
            type="button"
            aria-label="Fermer la recherche"
            class="grid shrink-0 place-items-center rounded-full border border-edge bg-surface px-3 text-txt-soft shadow-lg"
            @click="closeSearch"
          >
            <Icon name="close" :size="18" />
          </button>
        </form>
        <p v-if="searchError" class="mt-2 rounded-full bg-surface px-4 py-2 text-center text-xs text-txt-soft shadow-lg">
          {{ searchError }}
        </p>
        <div v-if="searchResults.length" class="mt-2 overflow-hidden rounded-2xl border border-edge bg-surface shadow-2xl">
          <button
            v-for="place in searchResults"
            :key="place.label"
            class="block w-full truncate px-4 py-2.5 text-left text-xs hover:bg-card"
            @click="gotoPlace(place)"
          >
            <Icon name="pin" :size="13" class="mr-1 inline align-text-bottom" />{{ place.label }}
          </button>
        </div>
      </div>

      <!-- Filtres (le rond descend quand la recherche occupe le haut) -->
      <div class="absolute left-4 z-10 transition-all" :class="searchOpen ? 'top-20 lg:top-4' : 'top-4'">
        <button
          class="grid h-12 w-12 place-items-center rounded-full border-2 border-accent text-lg shadow-lg"
          :class="courtsStore.hasActiveFilters ? 'bg-accent text-on-accent' : 'bg-surface text-txt'"
          aria-label="Filtres"
          @click="filtersOpen = !filtersOpen"
        >
          <Icon name="filters" :size="20" />
        </button>
        <div v-if="filtersOpen" class="mt-2 w-64 rounded-2xl border border-edge bg-surface p-4 shadow-2xl">
          <div v-for="group in FILTER_GROUPS" :key="group.field" class="mb-3 last:mb-0">
            <p class="mb-1.5 text-xs font-bold uppercase tracking-wide text-txt-soft">{{ group.label }}</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="(cfg, key) in group.options"
                :key="key"
                class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
                :class="courtsStore.filters[group.field] === key ? 'border-accent bg-accent/20' : 'border-edge bg-card'"
                @click="toggleFilter(group.field, key)"
              >
                <Icon :name="cfg.icon" :size="13" />{{ cfg.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Les terrains proches remplacent les deux CTA : on montre, on ne
           demande pas. « Ajouter » redevient une action secondaire flottante. -->
      <NearbyStrip
        v-if="mapStore.mode === 'browse'"
        :courts="courtsStore.nearby"
        :locating="locating"
        :has-position="hasPosition"
        @select="onSelect"
        @locate="findNearMe"
      />

      <button
        v-if="mapStore.mode === 'browse'"
        class="absolute right-4 z-10 grid h-14 w-14 place-items-center rounded-full bg-accent text-on-accent shadow-xl shadow-accent/30 lg:hidden"
        :class="hasPosition ? 'bottom-56' : 'bottom-40'"
        aria-label="Ajouter un terrain"
        title="Ajouter un terrain"
        @click="startAdd"
      >
        <Icon name="ball" :size="24" />
      </button>

      <!-- Mode pin -->
      <AddCourtPin
        v-if="mapStore.mode === 'pin'"
        @cancel="mapStore.exitPinMode()"
        @confirm="confirmPin"
        @goto="(p) => ((mapView?.flyTo(p, 16)), mapStore.dropPin(p))"
      />

      <!-- États chargement / erreur / géoloc (mobile) -->
      <p
        v-if="locating"
        class="absolute bottom-48 left-1/2 z-10 max-w-[90%] -translate-x-1/2 rounded-full bg-txt/85 px-4 py-2 text-center text-xs shadow-lg"
        :class="{ 'bg-bad-soft text-on-accent': locating === 'denied' || locating === 'unsupported' }"
      >
        {{ LOCATING_MESSAGES[locating] }}
      </p>
      <p
        v-else-if="courtsStore.loading"
        class="absolute bottom-48 left-1/2 z-10 -translate-x-1/2 rounded-full bg-txt/85 px-4 py-2 text-xs lg:hidden"
      >
        Chargement des terrains…
      </p>
      <p
        v-else-if="courtsStore.error"
        class="absolute bottom-48 left-1/2 z-10 -translate-x-1/2 rounded-full bg-bad text-on-accent px-4 py-2 text-xs font-semibold lg:hidden"
      >
        {{ courtsStore.error }}
      </p>
    </div>

    <!-- Fiche terrain mobile : bottom sheet -->
    <BottomSheet v-if="selectedCourt" class="lg:hidden" @close="courtsStore.select(null)">
      <CourtCard :court="selectedCourt" @open="openDetail(selectedCourt.id)" />
    </BottomSheet>

  </div>
</template>
