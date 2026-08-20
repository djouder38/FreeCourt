// Client Overpass (OpenStreetMap) : terrains de basket dans une bbox.
// Politique d'usage Overpass : requêtes espacées (debounce côté appelant),
// cache par bbox arrondie, une seule requête en vol à la fois.

const ENDPOINT = 'https://overpass-api.de/api/interpreter'

const cache = new Map()
let inflightController = null

// Arrondit la bbox pour que de petits déplacements retombent sur le cache.
function cacheKey(bounds) {
  const r = (n) => Math.round(n * 50) / 50 // pas de 0.02°
  return [r(bounds.south), r(bounds.west), r(bounds.north), r(bounds.east)].join(',')
}

function buildQuery(bounds) {
  const bbox = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`
  return `[out:json][timeout:25];
(
  node["leisure"="pitch"]["sport"~"basketball"](${bbox});
  way["leisure"="pitch"]["sport"~"basketball"](${bbox});
);
out center tags;`
}

function toCourt(element) {
  const tags = element.tags || {}
  const lat = element.lat ?? element.center?.lat
  const lon = element.lon ?? element.center?.lon
  if (lat == null || lon == null) return null
  return {
    id: `${element.type}/${element.id}`,
    lat,
    lon,
    name: tags.name || null,
    hoops: tags.hoops || null,
    surface: tags.surface || null,
    lit: tags.lit || null,
    indoor: tags.indoor === 'yes' || tags.covered === 'yes',
    access: tags.access || null,
    osmUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
  }
}

export async function fetchCourts(bounds) {
  const key = cacheKey(bounds)
  if (cache.has(key)) return cache.get(key)

  if (inflightController) inflightController.abort()
  inflightController = new AbortController()

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    body: 'data=' + encodeURIComponent(buildQuery(bounds)),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    signal: inflightController.signal,
  })
  if (!response.ok) throw new Error(`Overpass ${response.status}`)

  const data = await response.json()
  const courts = data.elements.map(toCourt).filter(Boolean)
  cache.set(key, courts)
  return courts
}
