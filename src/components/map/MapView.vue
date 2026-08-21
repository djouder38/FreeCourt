<script setup>
import { h, onBeforeUnmount, onMounted, ref, render, watch } from 'vue'
import Supercluster from 'supercluster'
import { createMap, maplibregl, setMapTheme } from '../../services/mapbox.js'
import { useCourtsStore } from '../../stores/courts.js'
import { useMapStore } from '../../stores/map.js'
import CourtMarker from './CourtMarker.vue'
import ClusterMarker from './ClusterMarker.vue'
import { useTheme } from '../../composables/useTheme.js'

const emit = defineEmits(['select', 'locating'])

const courtsStore = useCourtsStore()
const mapStore = useMapStore()
const mapEl = ref(null)
const theme = useTheme()

let map = null
let pinMarker = null
let index = null
// clé ("court:<id>" ou "cluster:<id>") → { marker, el }
const markers = new Map()

// Le clustering est calculé côté JS (supercluster) plutôt que par la source
// MapLibre : c'est déterministe, indépendant du rendu des tuiles, et ça
// laisse les markers en DOM pour garder les SVG dynamiques de FreeCourt.
function buildIndex() {
  index = new Supercluster({ radius: 60, maxZoom: 16 })
  index.load(
    courtsStore.filtered.map((court) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [court.lng, court.lat] },
      properties: { court },
    })),
  )
}

function currentBBox() {
  const b = map.getBounds()
  return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]
}

function syncMarkers() {
  if (!map || !index) return

  const zoom = Math.round(map.getZoom())
  const clusters = index.getClusters(currentBBox(), zoom)
  const seen = new Set()

  for (const feature of clusters) {
    const [lng, lat] = feature.geometry.coordinates
    const isCluster = feature.properties.cluster === true
    const key = isCluster
      ? `cluster:${feature.properties.cluster_id}`
      : `court:${feature.properties.court.id}`
    seen.add(key)

    const existing = markers.get(key)
    if (existing) {
      existing.marker.setLngLat([lng, lat])
      continue
    }

    const el = document.createElement('div')
    if (isCluster) {
      const count = feature.properties.point_count
      render(h(ClusterMarker, { count }), el)
      el.addEventListener('click', (event) => {
        event.stopPropagation()
        if (mapStore.mode === 'pin') return
        zoomIntoCluster(feature.properties.cluster_id, [lng, lat])
      })
    } else {
      const court = feature.properties.court
      render(h(CourtMarker, { court }), el)
      el.addEventListener('click', (event) => {
        event.stopPropagation()
        if (mapStore.mode === 'pin') return
        emit('select', court.id)
      })
    }

    const marker = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map)
    markers.set(key, { marker, el })
  }

  for (const [key, entry] of markers) {
    if (seen.has(key)) continue
    render(null, entry.el)
    entry.marker.remove()
    markers.delete(key)
  }
}

function zoomIntoCluster(clusterId, center) {
  const target = Math.min(index.getClusterExpansionZoom(clusterId), 17)
  map.easeTo({ center, zoom: target + 0.2, duration: 500 })
}

function clearMarkers() {
  for (const entry of markers.values()) {
    render(null, entry.el)
    entry.marker.remove()
  }
  markers.clear()
}

function refresh() {
  buildIndex()
  clearMarkers()
  syncMarkers()
}

function showPin(lngLat) {
  if (!pinMarker) {
    const el = document.createElement('div')
    el.className = 'text-surface'
    el.innerHTML =
      '<svg width="34" height="46" viewBox="0 0 34 46"><path d="M17 45C17 45 32 26 32 16a15 15 0 1 0-30 0c0 10 15 29 15 29Z" fill="#FF6B2B" stroke="currentColor" stroke-width="2"/><circle cx="17" cy="16" r="6" fill="currentColor"/></svg>'
    pinMarker = new maplibregl.Marker({ element: el, draggable: true, anchor: 'bottom' })
    pinMarker.on('dragend', () => {
      const p = pinMarker.getLngLat()
      mapStore.dropPin({ lng: p.lng, lat: p.lat })
    })
  }
  pinMarker.setLngLat(lngLat)
  if (!pinMarker._map) pinMarker.addTo(map)
}

function flyTo(lngLat, zoom = 14) {
  map?.flyTo({ center: [lngLat.lng, lngLat.lat], zoom })
}

function locateMe() {
  if (!navigator.geolocation) {
    emit('locating', { status: 'unsupported' })
    return
  }
  emit('locating', { status: 'searching' })
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      flyTo({ lng: pos.coords.longitude, lat: pos.coords.latitude }, 14)
      emit('locating', { status: 'done' })
    },
    () => emit('locating', { status: 'denied' }),
    { enableHighAccuracy: true, timeout: 8000 },
  )
}

defineExpose({ flyTo, locateMe })

onMounted(() => {
  map = createMap(mapEl.value, { center: mapStore.center, zoom: mapStore.zoom, theme: theme.resolved.value })

  map.on('moveend', () => {
    const c = map.getCenter()
    mapStore.center = [c.lng, c.lat]
    mapStore.zoom = map.getZoom()
    syncMarkers()
  })
  map.on('zoom', syncMarkers)

  map.on('click', (e) => {
    if (mapStore.mode === 'pin') mapStore.dropPin({ lng: e.lngLat.lng, lat: e.lngLat.lat })
    else emit('select', null)
  })

  refresh()

  if (import.meta.env.DEV) window.__fcMap = map
})

watch(() => courtsStore.filtered, refresh)

// La carte suit le theme de l app : recoloration sans rechargement de tuiles.
watch(() => theme.resolved.value, (t) => setMapTheme(map, t))

watch(
  () => mapStore.mode,
  (mode) => {
    // MapLibre pose .maplibregl-map sur le conteneur lui-même
    mapEl.value?.classList.toggle('fc-pin-mode', mode === 'pin')
    if (mode !== 'pin') pinMarker?.remove()
  },
)

watch(
  () => mapStore.pinLngLat,
  (p) => {
    if (p && mapStore.mode === 'pin') showPin(p)
  },
)

onBeforeUnmount(() => {
  clearMarkers()
  map?.remove()
})
</script>

<template>
  <div ref="mapEl" class="h-full w-full"></div>
</template>
