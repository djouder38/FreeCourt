# FreeCourt — contexte projet

Carte communautaire mondiale des terrains de basket. La spec de référence
est `freecourt-claude-code-prompt.md` (fournie par Théo) ; ROADMAP.md suit
l'avancement.

## Spécifique à ce projet
- Structure `pages/` + `services/` + `components/{map,court,community,ui}`
  imposée par la spec (déroge à la convention globale views/ + lib/).
- Carte : MapLibre GL + OpenFreeMap (PAS Mapbox — choix assumé : dark-v11
  exige un token payant ; le swap est documenté dans `src/services/mapbox.js`).
- Supabase projet `freecourt` (id: udshhduyinwcfmxxpttg, eu-west-3).
  Migrations dans `supabase/migrations/`, déjà appliquées. Seed appliqué.
- Phase actuelle SANS auth (spec) : RLS permissive pour les écritures
  anonymes (created_by/author_id/user_id NULL). À resserrer quand l'auth
  arrive — les policies sont commentées dans 002.
- Règle métier en base : trigger `on_validation_insert` (5 validations →
  validated + locked ; flag_issue → flagged) + trigger 3 photos max.
- Le vote "utile" passe par la RPC `vote_helpful` (pas d'UPDATE anonyme).
- Markers carte : composant `CourtMarker.vue` monté dans les éléments
  DOM MapLibre via `render(h(...))` — ne pas attendre l'event `load` de la
  carte pour les dessiner (il ne se rejoue pas au remount SPA).
- GitHub : djouder38/freecourt · Vercel : projet `free-court`.
- archive/v1-osm-leaflet/ = première version (Leaflet + Overpass), gardée
  pour référence.
