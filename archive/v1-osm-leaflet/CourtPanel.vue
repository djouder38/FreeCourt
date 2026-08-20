<script setup>
const props = defineProps({
  court: { type: Object, required: true },
})
defineEmits(['close'])

const SURFACE_LABELS = {
  asphalt: 'Bitume',
  concrete: 'Béton',
  'concrete:plates': 'Dalles béton',
  paved: 'Pavé',
  acrylic: 'Acrylique',
  wood: 'Parquet',
  tartan: 'Tartan',
  rubber: 'Caoutchouc',
  grass: 'Herbe',
  dirt: 'Terre',
}

function surfaceLabel(surface) {
  return SURFACE_LABELS[surface] || surface
}

function accessLabel(access) {
  if (access === 'yes' || access === 'public') return 'Accès libre'
  if (access === 'private') return 'Privé'
  if (access === 'customers') return 'Réservé aux clients'
  if (access === 'permissive') return 'Toléré'
  return access
}

function directionsUrl(court) {
  return `https://www.google.com/maps/dir/?api=1&destination=${court.lat},${court.lon}`
}
</script>

<template>
  <aside class="panel">
    <button class="panel__close" aria-label="Fermer" @click="$emit('close')">×</button>
    <h2 class="panel__title">{{ court.name || 'Terrain de basket' }}</h2>
    <p class="panel__type">{{ court.indoor ? 'Indoor / couvert' : 'Extérieur' }}</p>

    <ul class="panel__facts">
      <li v-if="court.hoops"><span>Paniers</span><strong>{{ court.hoops }}</strong></li>
      <li v-if="court.surface"><span>Revêtement</span><strong>{{ surfaceLabel(court.surface) }}</strong></li>
      <li v-if="court.lit"><span>Éclairage</span><strong>{{ court.lit === 'yes' ? 'Oui' : 'Non' }}</strong></li>
      <li v-if="court.access"><span>Accès</span><strong>{{ accessLabel(court.access) }}</strong></li>
    </ul>
    <p v-if="!court.hoops && !court.surface && !court.lit && !court.access" class="panel__empty">
      Pas encore de détails sur ce terrain dans OpenStreetMap.
    </p>

    <div class="panel__actions">
      <a class="panel__btn panel__btn--primary" :href="directionsUrl(court)" target="_blank" rel="noopener">
        S'y rendre
      </a>
      <a class="panel__btn" :href="court.osmUrl" target="_blank" rel="noopener">
        Voir sur OSM
      </a>
    </div>
  </aside>
</template>

<style scoped>
.panel {
  position: absolute;
  z-index: 1000;
  top: 76px;
  right: 12px;
  width: min(320px, calc(100vw - 24px));
  background: var(--paper);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 18px;
}

.panel__close {
  position: absolute;
  top: 8px;
  right: 10px;
  border: none;
  background: none;
  font-size: 22px;
  color: var(--muted);
}

.panel__title {
  margin: 0 24px 2px 0;
  font-size: 18px;
}

.panel__type {
  margin: 0 0 12px;
  color: var(--orange-dark);
  font-size: 13px;
  font-weight: 600;
}

.panel__facts {
  list-style: none;
  margin: 0;
  padding: 0;
}

.panel__facts li {
  display: flex;
  justify-content: space-between;
  padding: 7px 0;
  border-top: 1px solid var(--line);
  font-size: 14px;
}

.panel__facts span {
  color: var(--muted);
}

.panel__empty {
  color: var(--muted);
  font-size: 13px;
  margin: 4px 0 0;
}

.panel__actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.panel__btn {
  flex: 1;
  text-align: center;
  padding: 9px 0;
  border-radius: 8px;
  border: 1px solid var(--line);
  color: var(--ink);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
}

.panel__btn--primary {
  background: var(--orange);
  border-color: var(--orange);
  color: #fff;
}
</style>
