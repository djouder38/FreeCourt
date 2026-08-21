# Changelog

## [0.3.0] — 2026-08-21
Passe lisibilité / navigation, sur retours de Théo.

- Carte : palette "béton nocturne" — fond anthracite (plus de noir pur),
  eau bleu-vert franche, bâtiments et 3 niveaux de routes différenciés,
  labels à fort contraste avec halo sombre.
- Pins : clustering par zone (supercluster) avec dégroupement au zoom et
  zoom sur le groupe au clic. Nouveau `ClusterMarker.vue`.
- Recherche : barre compacte en haut de carte (champ + valider + fermer)
  à la place du bottom sheet pleine hauteur.
- Géolocalisation : devient un CTA majeur « Trouver un terrain près de
  moi », à parité avec l'ajout de terrain, avec retour d'état.
- Fix : l'ouverture de la recherche passe par le store (le `ref` sur le
  composant de route ne se liait pas).

## [0.2.0] — 2026-08-20
Pivot complet : FreeCourt selon la spec de Théo (`freecourt-claude-code-prompt.md`).

- Refonte totale : Vue 3 + Tailwind 4 + Pinia + Vue Router, dark street ball.
- Carte MapLibre GL + OpenFreeMap style dark custom, markers SVG dynamiques.
- Backend Supabase `freecourt` : 5 tables + RLS, trigger de verrouillage
  (5 validations → validated + locked), limite 3 photos, RPC vote_helpful,
  bucket Storage public, seed 15 terrains mondiaux + avis.
- Flow ajout terrain : mode pin (tap carte ou recherche d'adresse),
  formulaire à sélecteurs visuels, terrain créé en draft.
- Fiche terrain : photos avec upload, avis 1-5 étoiles + vote utile,
  validation communautaire, signalement de problème.
- Mobile-first : tab bar, bottom sheet 40/90 %, bouton AJOUTER flottant.
- Desktop : sidebar 320px (liste + détail).
- Mascotte Bally (SVG inline) : toasts, 404, états vides.
- L'ancienne app OSM/Leaflet est archivée dans `archive/v1-osm-leaflet/`.

## [0.1.0] — 2026-08-20
Première version (Playgrounds) : carte Leaflet + terrains OSM via Overpass.
Archivée le jour même après réception de la spec FreeCourt.
