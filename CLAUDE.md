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
  carte pour les dessiner (il ne se rejoue pas au remount SPA, et il ne
  tire jamais si l'onglet n'est pas composité). Utiliser `style.load`.
- Clustering : calculé côté JS avec `supercluster` (pas via la source
  MapLibre `cluster: true`), pour garder les markers DOM custom et ne pas
  dépendre du rendu des tuiles. `ClusterMarker.vue` = la pastille.
- Style de carte : la palette est appliquée par `applyPalette()` dans
  `services/mapbox.js`, en se basant sur le `source-layer` OpenMapTiles
  (stable) plutôt que sur les ids de couches (variables selon le style).
- Piège de vérif : quand le panneau navigateur n'est pas affiché, rien
  n'est composité — les transitions CSS, les animations `easeTo/flyTo` et
  l'event `load` de MapLibre ne se déclenchent pas. Neutraliser la
  transition ou espionner l'appel plutôt que conclure à un bug.
- Design : Impeccable fait autorite, PAS la spec d origine
  (freecourt-claude-code-prompt.md est caduque cote design, decision Theo
  du 2026-08-21). Elle reste la reference produit/fonctionnel.
- Icones : jamais d emoji. Tout passe par components/ui/Icon.vue (grille
  24x24, trait 2, bouts arrondis, currentColor). Ajouter une icone = une
  entree dans le registre de ce fichier, pas un glyphe inline.
- Contraste : minimum WCAG AA (4.5:1 texte courant). Le blanc sur l orange
  de marque plafonne a 2.84:1 -> sur fond accent, le texte est en
  text-court (encre). Le token --color-bad-soft sert au TEXTE rouge ;
  --color-bad aux fonds pleins.
- Skill Impeccable installe en local (.claude/skills/, gitignore) :
  detecteur d anti-patterns design + 23 commandes /impeccable. Hooks actifs
  (PostToolUse + Stop) via .claude/settings.local.json. Relancer le scan a
  la main : node .claude/skills/impeccable/scripts/detect.mjs src
  Reinstaller : npx impeccable install --providers=claude --scope=project
- GitHub : djouder38/freecourt · Vercel : projet `free-court`.
- archive/v1-osm-leaflet/ = première version (Leaflet + Overpass), gardée
  pour référence.
