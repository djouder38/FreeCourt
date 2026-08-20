<script setup>
import { h, onBeforeUnmount, onMounted, ref, render, watch } from 'vue'
import { createMap, maplibregl } from '../../services/mapbox.js'
import { useCourtsStore } from '../../stores/courts.js'
import { useMapStore } from '../../stores/map.js'
import CourtMarker from './CourtMarker.vue'

const emit = defineEmits(['select'])

const courtsStore = useCourtsStore()
const mapStore = useMapStore()
const mapEl = ref(null)

let map = null
let pinMarker = null
const markers = new Map() // court.id → { marker, el }

function renderMarkers() {
  const wanted = new Map(courtsStore.filtered.map((c) => [c.id, c]))

  for (const [id, entry] of markers) {
    if (!wanted.has(id)) {
      render(null, entry.el)
      entry.marker.remove()
      markers.delete(id)
    }
  }

  for (const [id, court] of wanted) {
    if (markers.has(id)) {
      const entry = markers.get(id)
      render(h(CourtMarker, { court }), entry.el)
      entry.marker.setLngLat([court.lng, court.lat])
    } else {
      const el = document.createElement('div')
      render(h(CourtMarker, { court }), el)
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        if (mapStore.mode === 'pin') return
        emit('select', court.id)
      })
      const marker = new maplibregl.Marker({ element: el }).setLngLat([court.lng, court.lat]).addTo(map)
      markers.set(id, { marker, el })
    }
  }
}

function showPin(lngLat) {
  if (!pinMarker) {
    const el = document.createElement('div')
    el.innerHTML =
      '<svg width="34" height="46" viewBox="0 0 34 46"><path d="M17 45C17 45 32 26 32 16a15 15 0 1 0-30 0c0 10 15 29 15 29Z" fill="#FF6B2B" stroke="#fff" stroke-width="2"/><circle cx="17" cy="16" r="6" fill="#fff"/></svg>'
    pinMarker = new maplibregl.Marker({ element: el, draggable: true, anchor: 'bottom' })
    pinMarker.on('dragend', () => {
      const p = pinMarker.getLngLat()
      mapStore.dropPin({ lng: p.lng, lat: p.lat })
    })
  }
  pinMarker.setLngLat(lngLat)
  if (!pinMarker._map) pinMarker.addTo(map)
}

function removePin() {
  pinMarker?.remove()
}

function flyTo(lngLat, zoom = 14) {
  map?.flyTo({ center: [lngLat.lng, lngLat.lat], zoom })
}

function locateMe() {
  navigator.geolocation?.getCurrentPosition(
    (pos) => flyTo({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
    () => {},
    { enableHighAccuracy: true, timeout: 8000 },
  )
}

defineExpose({ flyTo, locateMe })

onMounted(() => {
  map = createMap(mapEl.value, { center: mapStore.center, zoom: mapStore.zoom })

  map.on('moveend', () => {
    const c = map.getCenter()
    mapStore.center = [c.lng, c.lat]
    mapStore.zoom = map.getZoom()
  })

  map.on('click', (e) => {
    if (mapStore.mode === 'pin') {
      mapStore.dropPin({ lng: e.lngLat.lng, lat: e.lngLat.lat })
    } else {
      emit('select', null)
    }
  })

  // Les markers sont des éléments DOM : pas besoin d'attendre le 'load' du
  // style (qui ne se rejoue pas toujours au remount SPA).
  renderMarkers()
})

watch(() => courtsStore.filtered, renderMarkers)

watch(
  () => mapStore.mode,
  (mode) => {
    mapEl.value?.querySelector('.maplibregl-canvas')?.closest('.maplibregl-map')?.classList.toggle('fc-pin-mode', mode === 'pin')
    if (mode !== 'pin') removePin()
  },
)

watch(
  () => mapStore.pinLngLat,
  (p) => {
    if (p && mapStore.mode === 'pin') showPin(p)
  },
)

onBeforeUnmount(() => {
  for (const entry of markers.values()) render(null, entry.el)
  map?.remove()
})
</script>

<template>
  <div ref="mapEl" class="h-full w-full"></div>
</template>
