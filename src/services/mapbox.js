// Carte FreeCourt — MapLibre GL (fork open source, API compatible Mapbox GL).
// Choix assumé : le style Mapbox dark-v11 exige un token payant ; on part sur
// les tuiles vectorielles gratuites d'OpenFreeMap avec les mêmes couleurs
// custom que la spec. Pour revenir à Mapbox : remplacer STYLE_URL par
// 'mapbox://styles/mapbox/dark-v11' + mapbox-gl + VITE_MAPBOX_TOKEN.
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const STYLE_URL = 'https://tiles.openfreemap.org/styles/dark'

// Palette spec appliquée par-dessus le style de base une fois chargé.
const PAINT_OVERRIDES = [
  { match: /background/, prop: 'background-color', value: '#0f0f0f' },
  { match: /water/, prop: 'fill-color', value: '#0d1117' },
  { match: /building/, prop: 'fill-color', value: '#1a1a2e' },
]

export function createMap(container, { center = [2.35, 48.86], zoom = 4 } = {}) {
  const map = new maplibregl.Map({
    container,
    style: STYLE_URL,
    center,
    zoom,
    attributionControl: { compact: true },
  })

  map.on('style.load', () => {
    for (const layer of map.getStyle().layers) {
      for (const o of PAINT_OVERRIDES) {
        if (o.match.test(layer.id) && layer.type === o.prop.split('-')[0]) {
          try {
            map.setPaintProperty(layer.id, o.prop, o.value)
          } catch {
            /* certaines couches n'acceptent pas la propriété : on ignore */
          }
        }
      }
    }
  })

  return map
}

export { maplibregl }
