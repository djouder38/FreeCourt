// Recherche de ville via Nominatim (OSM). Usage léger : une requête par
// validation du champ de recherche, jamais en continu.

export async function searchPlace(query) {
  const url =
    'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=' +
    encodeURIComponent(query)
  const response = await fetch(url, {
    headers: { 'Accept-Language': navigator.language || 'fr' },
  })
  if (!response.ok) throw new Error(`Nominatim ${response.status}`)
  const results = await response.json()
  return results.map((r) => ({
    label: r.display_name,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
  }))
}
