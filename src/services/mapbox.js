// Carte FreeCourt — MapLibre GL (fork open source, API compatible Mapbox GL).
// Choix assumé : le style Mapbox dark-v11 exige un token payant ; on part sur
// les tuiles vectorielles gratuites d'OpenFreeMap. Pour revenir à Mapbox :
// remplacer STYLE_URL par 'mapbox://styles/mapbox/dark-v11', installer
// mapbox-gl et poser VITE_MAPBOX_TOKEN.
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const STYLE_URL = 'https://tiles.openfreemap.org/styles/dark'

// Palette "béton nocturne" : sombre, mais chaque strate se distingue de la
// suivante. Le fond n'est jamais noir pur — c'est ce qui écrasait le relief.
const PALETTE = {
  land: '#1a1d23', // anthracite légèrement bleuté (fond de carte)
  landAlt: '#1f232a', // zones urbaines / résidentielles
  water: '#15323f', // bleu-vert franc, nettement lisible sur la terre
  green: '#1d2b21', // parcs, bois
  building: '#262a32',
  buildingEdge: '#31353f',
  roadMinor: '#3c424e', // rues de quartier
  roadMajor: '#4b515e', // axes secondaires
  roadHighway: '#646b7a', // autoroutes : la strate la plus claire
  rail: '#3a3f49',
  boundary: '#454b57',
  label: '#eceae7', // labels principaux (villes, quartiers)
  labelSoft: '#98a1ac', // labels secondaires (POI, rues)
  halo: '#12141a', // halo sombre = texte lisible partout
}

const GREEN_RE = /park|wood|forest|grass|golf|garden|pitch|scrub|cemetery|farmland|allotment/i
const WATER_RE = /water|ocean|sea|lake|river|swimming/i
const HIGHWAY_RE = /motorway|trunk/i
const MAJOR_RE = /primary|secondary|tertiary|main/i
const RAIL_RE = /rail|transit|subway|tram/i
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
function applyPalette(map) {
  const layers = map.getStyle()?.layers
  if (!layers) return

  for (const layer of layers) {
    const { id, type } = layer
    const src = layer['source-layer'] ?? ''

    if (type === 'background') {
      paint(map, id, 'background-color', PALETTE.land)
      continue
    }

    if (src === 'water' || src === 'waterway' || WATER_RE.test(id)) {
      paint(map, id, `${type}-color`, PALETTE.water)
      continue
    }

    if (src === 'building') {
      paint(map, id, 'fill-color', PALETTE.building)
      paint(map, id, 'fill-outline-color', PALETTE.buildingEdge)
      paint(map, id, 'fill-extrusion-color', PALETTE.building)
      continue
    }

    if (src === 'boundary') {
      paint(map, id, 'line-color', PALETTE.boundary)
      continue
    }

    if (type === 'symbol') {
      const isPlace = src === 'place' || PLACE_RE.test(id)
      paint(map, id, 'text-color', isPlace ? PALETTE.label : PALETTE.labelSoft)
      paint(map, id, 'text-halo-color', PALETTE.halo)
      paint(map, id, 'text-halo-width', 1.4)
      continue
    }

    if (src === 'transportation') {
      if (RAIL_RE.test(id)) paint(map, id, 'line-color', PALETTE.rail)
      else if (HIGHWAY_RE.test(id)) paint(map, id, 'line-color', PALETTE.roadHighway)
      else if (MAJOR_RE.test(id)) paint(map, id, 'line-color', PALETTE.roadMajor)
      else paint(map, id, 'line-color', PALETTE.roadMinor)
      continue
    }

    if (GREEN_RE.test(id)) {
      paint(map, id, `${type}-color`, PALETTE.green)
      continue
    }

    if (src === 'landuse' || src === 'landcover') {
      paint(map, id, `${type}-color`, PALETTE.landAlt)
    }
  }
}

export function createMap(container, { center = [2.35, 48.86], zoom = 4 } = {}) {
  const map = new maplibregl.Map({
    container,
    style: STYLE_URL,
    center,
    zoom,
    attributionControl: { compact: true },
  })

  // style.load ne se rejoue pas si le style est déjà en cache au remount.
  const recolor = () => applyPalette(map)
  map.on('style.load', recolor)
  if (map.isStyleLoaded()) recolor()

  return map
}

export { maplibregl, PALETTE }
