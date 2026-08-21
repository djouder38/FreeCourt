<script setup>
import { h, onBeforeUnmount, onMounted, ref, render, watch } from 'vue'
import Supercluster from 'supercluster'
import { createMap, maplibregl, setMapTheme } from '../../services/mapbox.js'
import { useCourtsStore } from '../../stores/courts.js'
import { useMapStore } from '../../stores/map.js'
import CourtMarker from './CourtMarker.vue'
import { CONDITION_LABELS, SURFACE_LABELS } from '../../services/labels.js'
import { formatDistance } from '../../services/geo.js'
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

// Ce que doit entendre quelqu'un qui n'a pas d'ecran : le nom, l'etat, le
// revetement, la distance si on la connait, et le statut de verification.
function markerLabel(court) {
  const parts = [court.name]
  if (court.condition) parts.push(CONDITION_LABELS[court.condition]?.label)
  if (court.surface) parts.push(SURFACE_LABELS[court.surface]?.label)
  if (court.distance) parts.push('à ' + formatDistance(court.distance))
  if (court.status === 'draft') parts.push('à vérifier')
  return parts.filter(Boolean).join(', ')
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
    let label = ''
    if (isCluster) {
      const count = feature.properties.point_count
      render(h(ClusterMarker, { count }), el)
      el.setAttribute('role', 'button')
      el.setAttribute('tabindex', '0')
      label = count + ' terrains regroupés, ouvrir'
      el.setAttribute('aria-label', label)
      const expand = (event) => {
        event.stopPropagation()
        if (mapStore.mode === 'pin') return
        zoomIntoCluster(feature.properties.cluster_id, [lng, lat])
      }
      el.addEventListener('click', expand)
      el.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        expand(event)
      })
    } else {
      const court = feature.properties.court
      render(h(CourtMarker, { court }), el)
      el.setAttribute('role', 'button')
      el.setAttribute('tabindex', '0')
      label = markerLabel(court)
      el.setAttribute('aria-label', label)
      const open = (event) => {
        event.stopPropagation()
        if (mapStore.mode === 'pin') return
        emit('select', court.id)
      }
      el.addEventListener('click', open)
      el.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        open(event)
      })
    }

    const marker = new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map)
    // MapLibre pose son propre aria-label générique (« Map marker ») sur
    // l'élément : on repose le nôtre APRÈS l'ajout, sinon il est écrasé.
    el.setAttribute('aria-label', label)
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

let userMarker = null

// Sans point 'vous etes ici', se geolocaliser ne montre rien a l ecran.
function showUserPosition(lngLat) {
  if (!userMarker) {
    const el = document.createElement('div')
    el.className = 'fc-user-dot'
    userMarker = new maplibregl.Marker({ element: el })
  }
  userMarker.setLngLat([lngLat.lng, lngLat.lat])
  if (!userMarker._map) userMarker.addTo(map)
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
      const position = { lng: pos.coords.longitude, lat: pos.coords.latitude }
      flyTo(position, 14)
      showUserPosition(position)
      emit('locating', { status: 'done', position })
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
