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
import MapLegend from '../components/map/MapLegend.vue'
import { formatDistance } from '../services/geo.js'

const router = useRouter()
const courtsStore = useCourtsStore()
const mapStore = useMapStore()

const mapView = ref(null)
const filtersOpen = ref(false)
const legendOpen = ref(false)
const searchOpen = computed(() => mapStore.searchOpen)
const searchQuery = ref('')
const searchResults = ref([])
const courtResults = ref([])
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

// Sans accents ni casse : « duperre » doit trouver « Playground Duperré ».
function normalize(str) {
  return (str ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

async function runSearch() {
  const q = searchQuery.value.trim()
  if (!q) return
  searching.value = true
  searchError.value = null

  // 1) Les terrains de FreeCourt d'abord : c'est ce que l'utilisateur cherche
  // en tapant un nom de playground, et ça ne coûte aucune requête.
  const needle = normalize(q)
  courtResults.value = courtsStore.withDistance
    .filter((c) => normalize(c.name).includes(needle) || normalize(c.description).includes(needle))
    .slice(0, 5)

  try {
    const res = await fetch(
      'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=' + encodeURIComponent(q),
    )
    searchResults.value = (await res.json()).map((r) => ({
      label: r.display_name,
      lng: parseFloat(r.lon),
      lat: parseFloat(r.lat),
    }))
    if (searchResults.value.length === 0 && courtResults.value.length === 0) {
      searchError.value = 'Rien trouvé, ni terrain ni lieu.'
    }
  } catch {
    searchResults.value = []
    if (courtResults.value.length === 0) searchError.value = 'Recherche indisponible.'
  } finally {
    searching.value = false
  }
}

// Un terrain trouvé : on le centre et on ouvre sa fiche, pas juste la carte.
function gotoCourt(court) {
  mapStore.closeSearch()
  searchQuery.value = ''
  searchResults.value = []
  courtResults.value = []
  searchError.value = null
  mapView.value?.flyTo({ lng: court.lng, lat: court.lat }, 15)
  courtsStore.select(court.id)
}

function gotoPlace(place) {
  mapStore.closeSearch()
  searchQuery.value = ''
  searchResults.value = []
  courtResults.value = []
  searchError.value = null
  mapView.value?.flyTo(place, 13)
}

function closeSearch() {
  mapStore.closeSearch()
  searchResults.value = []
  courtResults.value = []
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
        <div v-if="courtResults.length" class="mt-2 space-y-1">
          <p class="px-1 text-[11px] font-bold uppercase tracking-wide text-txt-soft">Terrains</p>
          <button
            v-for="court in courtResults"
            :key="court.id"
            class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-card"
            @click="gotoCourt(court)"
          >
            <Icon name="ball" :size="14" class="text-accent-text" />
            <span class="min-w-0 flex-1 truncate">{{ court.name }}</span>
          </button>
        </div>
        <div v-if="searchResults.length" class="mt-2 space-y-1">
          <p class="px-1 text-[11px] font-bold uppercase tracking-wide text-txt-soft">Lieux</p>
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
        <button class="-mx-2 mb-2 inline-flex min-h-11 items-center px-2 text-xs font-semibold text-txt-soft hover:text-txt" @click="courtsStore.select(null)">
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

      <!-- Recherche : la loupe reste en haut à droite et le panneau se
           déploie vers le bas, en miroir des filtres à gauche. -->
      <div class="absolute right-4 top-4 z-20 lg:hidden">
        <button
          class="grid h-12 w-12 place-items-center rounded-full border-2 border-accent shadow-lg"
          :class="searchOpen ? 'bg-accent text-on-accent' : 'bg-surface text-txt'"
          :aria-label="searchOpen ? 'Fermer la recherche' : 'Chercher un terrain ou un lieu'"
          :aria-expanded="searchOpen"
          @click="searchOpen ? closeSearch() : mapStore.toggleSearch()"
        >
          <Icon :name="searchOpen ? 'close' : 'search'" :size="20" />
        </button>

        <div
          v-if="searchOpen"
          class="mt-2 w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-edge bg-surface p-3 shadow-2xl"
        >
          <form class="flex gap-2" @submit.prevent="runSearch">
            <input
              v-model="searchQuery"
              type="search"
              autofocus
              placeholder="Terrain, ville, quartier…"
              class="min-w-0 flex-1 rounded-full border border-edge bg-card px-4 py-2.5 text-sm outline-none placeholder:text-txt-soft focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              :disabled="searching"
              class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-on-accent disabled:opacity-50"
              aria-label="Lancer la recherche"
            >
              <span v-if="searching" class="text-sm font-bold">…</span>
              <Icon v-else name="search" :size="18" />
            </button>
          </form>

          <p v-if="searchError" class="mt-2 px-1 text-xs text-txt-soft">{{ searchError }}</p>

          <!-- Les terrains de l'app avant les lieux : c'est le contenu propre -->
          <div v-if="courtResults.length" class="mt-3">
            <p class="mb-1 px-1 text-[11px] font-bold uppercase tracking-wide text-txt-soft">
              Terrains
            </p>
            <button
              v-for="court in courtResults"
              :key="court.id"
              class="flex min-h-11 w-full items-center gap-2 rounded-xl px-2 text-left text-sm hover:bg-card"
              @click="gotoCourt(court)"
            >
              <Icon name="ball" :size="15" class="text-accent-text" />
              <span class="min-w-0 flex-1 truncate">{{ court.name }}</span>
              <span v-if="court.distance" class="shrink-0 text-xs font-semibold text-txt-soft">
                {{ formatDistance(court.distance) }}
              </span>
            </button>
          </div>

          <div v-if="searchResults.length" class="mt-3">
            <p class="mb-1 px-1 text-[11px] font-bold uppercase tracking-wide text-txt-soft">
              Lieux
            </p>
            <button
              v-for="place in searchResults"
              :key="place.label"
              class="flex min-h-11 w-full items-center gap-2 rounded-xl px-2 text-left text-xs hover:bg-card"
              @click="gotoPlace(place)"
            >
              <Icon name="pin" :size="14" class="shrink-0 text-txt-soft" />
              <span class="min-w-0 flex-1 truncate">{{ place.label }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Légende : toujours à portée, sous les filtres. L'encodage du
           marqueur ne se devine pas, il doit pouvoir s'expliquer. -->
      <button
        class="absolute left-4 top-[4.75rem] z-10 grid h-12 w-12 place-items-center rounded-full border-2 border-edge bg-surface text-txt-soft shadow-lg"
        aria-label="Comment lire la carte"
        title="Comment lire la carte"
        @click="legendOpen = true"
      >
        <span class="font-display text-xl leading-none">?</span>
      </button>

      <MapLegend v-if="legendOpen" @close="legendOpen = false" />

      <!-- Filtres (le rond descend quand la recherche occupe le haut) -->
      <div class="absolute left-4 top-4 z-10">
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
                class="inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold"
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
        v-if="mapStore.mode === 'browse' && hasPosition"
        :courts="courtsStore.nearby"
        @select="onSelect"
      />

      <!-- Contrôles de carte : même vocabulaire de ronds que les filtres et
           la recherche. Position au-dessus, ajout en accent dessous. -->
      <div
        v-if="mapStore.mode === 'browse'"
        class="absolute right-4 z-10 flex flex-col gap-3 lg:hidden"
        :class="hasPosition ? 'bottom-56' : 'bottom-28'"
      >
        <button
          class="grid h-12 w-12 place-items-center rounded-full border-2 border-accent bg-surface text-txt shadow-lg"
          :class="{ 'animate-pulse': locating === 'searching' }"
          aria-label="Voir les terrains près de moi"
          title="Voir les terrains près de moi"
          @click="findNearMe"
        >
          <Icon name="pin" :size="20" />
        </button>
        <button
          class="grid h-12 w-12 place-items-center rounded-full bg-accent text-on-accent shadow-lg shadow-accent/30"
          aria-label="Ajouter un terrain"
          title="Ajouter un terrain"
          @click="startAdd"
        >
          <Icon name="ball" :size="22" />
        </button>
      </div>

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
