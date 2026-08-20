<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { fetchCourts } from '../lib/overpass.js'

const MIN_ZOOM_FOR_COURTS = 11
const DEBOUNCE_MS = 600

const emit = defineEmits(['select'])

const mapEl = ref(null)
const loading = ref(false)
const loadError = ref(false)
const zoomedOut = ref(true)
const courtCount = ref(0)

let map = null
let clusterGroup = null
let debounceTimer = null
let selectedMarker = null
const markersById = new Map()

function courtIcon(selected = false) {
  return L.divIcon({
    className: '',
    html: `<div class="court-marker${selected ? ' court-marker--selected' : ''}">🏀</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

function selectCourt(court, marker) {
  if (selectedMarker) selectedMarker.setIcon(courtIcon(false))
  selectedMarker = marker
  marker.setIcon(courtIcon(true))
  emit('select', court)
}

function clearSelection() {
  if (selectedMarker) selectedMarker.setIcon(courtIcon(false))
  selectedMarker = null
}

async function refreshCourts() {
  zoomedOut.value = map.getZoom() < MIN_ZOOM_FOR_COURTS
  if (zoomedOut.value) return

  const b = map.getBounds()
  loading.value = true
  loadError.value = false
  try {
    const courts = await fetchCourts({
      south: b.getSouth(),
      west: b.getWest(),
      north: b.getNorth(),
      east: b.getEast(),
    })
    for (const court of courts) {
      if (markersById.has(court.id)) continue
      const marker = L.marker([court.lat, court.lon], { icon: courtIcon() })
      marker.on('click', () => selectCourt(court, marker))
      markersById.set(court.id, marker)
      clusterGroup.addLayer(marker)
    }
    courtCount.value = markersById.size
  } catch (err) {
    if (err.name !== 'AbortError') loadError.value = true
  } finally {
    loading.value = false
  }
}

function scheduleRefresh() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(refreshCourts, DEBOUNCE_MS)
}

function goTo(place, zoom = 13) {
  map.setView([place.lat, place.lon], zoom)
}

function locateMe() {
  map.locate({ setView: true, maxZoom: 14 })
}

defineExpose({ goTo, locateMe, clearSelection })

onMounted(() => {
  map = L.map(mapEl.value, { zoomControl: false }).setView([46.8, 2.4], 6)
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map)

  clusterGroup = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 60,
  })
  map.addLayer(clusterGroup)

  map.on('moveend', scheduleRefresh)
  map.on('click', clearSelection)
  scheduleRefresh()
})

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
  map?.remove()
})
</script>

<template>
  <div class="map-wrap">
    <div ref="mapEl" class="map"></div>

    <div v-if="zoomedOut" class="map__notice">
      Zoome sur une ville pour voir les terrains 🏀
    </div>
    <div v-else-if="loading" class="map__notice">Chargement des terrains…</div>
    <div v-else-if="loadError" class="map__notice map__notice--error">
      Impossible de charger les terrains, réessaie dans un instant.
    </div>
  </div>
</template>

<style scoped>
.map-wrap,
.map {
  position: absolute;
  inset: 0;
}

.map__notice {
  position: absolute;
  z-index: 1000;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--ink);
  color: #fff;
  padding: 9px 16px;
  border-radius: 999px;
  font-size: 14px;
  box-shadow: var(--shadow);
  white-space: nowrap;
}

.map__notice--error {
  background: #b91c1c;
}
</style>
