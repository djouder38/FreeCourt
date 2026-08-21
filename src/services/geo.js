// Distance à vol d'oiseau entre deux points (formule de haversine).
// Le joueur veut savoir « c'est loin ? » ; l'itinéraire réel est délégué à
// Google Maps, donc une distance à vol d'oiseau suffit et ne coûte aucun appel.
const EARTH_RADIUS_M = 6371000

export function distanceMeters(a, b) {
  if (!a || !b) return null
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

// « 450 m », « 2,3 km », « 87 km » — jamais plus de précision que nécessaire.
export function formatDistance(meters) {
  if (meters == null) return null
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`
  if (meters < 10000) return `${(meters / 1000).toFixed(1).replace('.', ',')} km`
  return `${Math.round(meters / 1000)} km`
}

// Fraîcheur de l'information : le produit promet « une info fausse est pire
// qu'une info absente », donc l'âge doit être visible, pas déduit.
export function formatAge(iso) {
  if (!iso) return null
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return null
  const days = Math.floor((Date.now() - then) / 86400000)
  if (days <= 0) return "aujourd'hui"
  if (days === 1) return 'hier'
  if (days < 30) return `il y a ${days} jours`
  const months = Math.floor(days / 30)
  if (months < 12) return `il y a ${months} mois`
  const years = Math.floor(months / 12)
  return years === 1 ? 'il y a un an' : `il y a ${years} ans`
}

// Au-delà de 6 mois sans confirmation, l'information est declarée douteuse.
export const STALE_AFTER_DAYS = 180

export function isStale(iso) {
  if (!iso) return true
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  return days > STALE_AFTER_DAYS
}
