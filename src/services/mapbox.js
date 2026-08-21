// Carte FreeCourt — MapLibre GL (fork open source, API compatible Mapbox GL).
// Choix assumé : le style Mapbox dark-v11 exige un token payant ; on part sur
// les tuiles vectorielles gratuites d'OpenFreeMap. Pour revenir à Mapbox :
// remplacer STYLE_URL par 'mapbox://styles/mapbox/dark-v11', installer
// mapbox-gl et poser VITE_MAPBOX_TOKEN.
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// Un seul style de base, recoloré par code selon le thème : les tuiles sont
// déjà en cache quand on bascule, le changement est donc instantané.
const STYLE_URL = 'https://tiles.openfreemap.org/styles/dark'

// Mode jour — "béton pâle". C'est le mode par défaut : un playground se
// repère à sa rue et à son parc, et sous le soleil il faut du contraste.
// Les rues sont claires sur un fond sourd, l'inverse du mode nuit.
const LIGHT = {
  land: '#e5e0d6',
  landAlt: '#ded8cc',
  water: '#8ebdd8',
  green: '#c2d8ac',
  building: '#d5cec1',
  buildingEdge: '#bab1a1',
  roadMinor: '#ffffff',
  roadMajor: '#ffffff',
  roadHighway: '#ffcc86',
  roadCasing: '#b9af9d',
  rail: '#a9a091',
  boundary: '#9c9284',
  label: '#1f1c19',
  labelSoft: '#55504a',
  halo: '#f7f4ef',
}

// Mode nuit — "béton nocturne". Sombre, mais chaque strate se distingue de
// la suivante ; le fond n'est jamais noir pur, c'est ce qui écrasait le relief.
const DARK = {
  land: '#1a1d23',
  landAlt: '#1f232a',
  water: '#15323f',
  green: '#1d2b21',
  building: '#262a32',
  buildingEdge: '#31353f',
  roadMinor: '#3c424e',
  roadMajor: '#4b515e',
  roadHighway: '#646b7a',
  roadCasing: '#0e1014',
  rail: '#3a3f49',
  boundary: '#454b57',
  label: '#eceae7',
  labelSoft: '#98a1ac',
  halo: '#12141a',
}

export const PALETTES = { light: LIGHT, dark: DARK }

const GREEN_RE = /park|wood|forest|grass|golf|garden|pitch|scrub|cemetery|farmland|allotment/i
const WATER_RE = /water|ocean|sea|lake|river|swimming/i
const HIGHWAY_RE = /motorway|trunk/i
const MAJOR_RE = /primary|secondary|tertiary|main/i
const RAIL_RE = /rail|transit|subway|tram/i
const CASING_RE = /casing|outline/i
const PLACE_RE = /place|city|town|country|state|continent/i

function paint(map, id, prop, value) {
  try {
    map.setPaintProperty(id, prop, value)
  } catch {
    // La couche n'expose pas cette propriété : on passe, c'est attendu.
  }
}

// Recolore le style chargé strate par strate. On se base sur le source-layer
// (schéma OpenMapTiles, stable) plutôt que sur les ids, qui changent d'un
// style à l'autre.
export function applyPalette(map, theme = 'dark') {
  const P = PALETTES[theme] ?? DARK
  const layers = map.getStyle()?.layers
  if (!layers) return

  for (const layer of layers) {
    const { id, type } = layer
    const src = layer['source-layer'] ?? ''

    if (type === 'background') {
      paint(map, id, 'background-color', P.land)
      continue
    }

    if (src === 'water' || src === 'waterway' || WATER_RE.test(id)) {
      paint(map, id, `${type}-color`, P.water)
      continue
    }

    if (src === 'building') {
      paint(map, id, 'fill-color', P.building)
      paint(map, id, 'fill-outline-color', P.buildingEdge)
      paint(map, id, 'fill-extrusion-color', P.building)
      continue
    }

    if (src === 'boundary') {
      paint(map, id, 'line-color', P.boundary)
      continue
    }

    if (type === 'symbol') {
      const isPlace = src === 'place' || PLACE_RE.test(id)
      paint(map, id, 'text-color', isPlace ? P.label : P.labelSoft)
      paint(map, id, 'text-halo-color', P.halo)
      paint(map, id, 'text-halo-width', 1.4)
      continue
    }

    if (src === 'transportation') {
      // Le casing detache la route du fond : sans lui, les rues se fondent
      // dans le terrain quel que soit le thème.
      if (CASING_RE.test(id)) paint(map, id, 'line-color', P.roadCasing)
      else if (RAIL_RE.test(id)) paint(map, id, 'line-color', P.rail)
      else if (HIGHWAY_RE.test(id)) paint(map, id, 'line-color', P.roadHighway)
      else if (MAJOR_RE.test(id)) paint(map, id, 'line-color', P.roadMajor)
      else paint(map, id, 'line-color', P.roadMinor)
      continue
    }

    if (GREEN_RE.test(id)) {
      paint(map, id, `${type}-color`, P.green)
      continue
    }

    if (src === 'landuse' || src === 'landcover') {
      paint(map, id, `${type}-color`, P.landAlt)
    }
  }
}

export function createMap(container, { center = [2.35, 48.86], zoom = 4, theme = 'dark' } = {}) {
  const map = new maplibregl.Map({
    container,
    style: STYLE_URL,
    center,
    zoom,
    attributionControl: { compact: true },
  })

  // style.load ne se rejoue pas si le style est déjà en cache au remount.
  const recolor = () => applyPalette(map, map.__fcTheme ?? theme)
  map.__fcTheme = theme
  map.on('style.load', recolor)
  if (map.isStyleLoaded()) recolor()

  return map
}

// Bascule jour/nuit sans recharger les tuiles.
// Pas de garde `isStyleLoaded()` ici : il renvoie false tant que l'onglet
// n'est pas composité, ce qui bloquerait la recoloration en arrière-plan.
// applyPalette sort déjà tout seul si le style n'expose pas encore ses couches.
export function setMapTheme(map, theme) {
  if (!map) return
  map.__fcTheme = theme
  applyPalette(map, theme)
}

export { maplibregl }
