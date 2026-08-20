<script setup>
import { ref } from 'vue'
import MapView from './views/MapView.vue'
import SearchBar from './components/SearchBar.vue'
import CourtPanel from './components/CourtPanel.vue'

const mapView = ref(null)
const selectedCourt = ref(null)

function closePanel() {
  selectedCourt.value = null
  mapView.value?.clearSelection()
}
</script>

<template>
  <div class="app">
    <header class="topbar">
      <h1 class="topbar__brand">🏀 Playgrounds</h1>
      <SearchBar @goto="(place) => mapView.goTo(place)" />
      <button class="topbar__locate" title="Autour de moi" @click="mapView.locateMe()">
        📍
      </button>
    </header>

    <MapView ref="mapView" @select="(court) => (selectedCourt = court)" />

    <CourtPanel v-if="selectedCourt" :court="selectedCourt" @close="closePanel" />
  </div>
</template>

<style scoped>
.app {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.topbar {
  position: absolute;
  z-index: 1000;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--paper);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 10px 14px;
}

.topbar__brand {
  margin: 0;
  font-size: 17px;
  white-space: nowrap;
}

.topbar__locate {
  margin-left: auto;
  border: 1px solid var(--line);
  background: var(--paper);
  border-radius: 8px;
  padding: 7px 10px;
  font-size: 16px;
}

@media (max-width: 560px) {
  .topbar__brand {
    display: none;
  }
}
</style>
