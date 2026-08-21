# Roadmap — FreeCourt

## Vision
La référence communautaire des terrains de basket dans le monde : trouver un
spot, l'ajouter, le noter, le faire vivre. Mobile-first, ambiance street ball.
Vérité produit : `PRODUCT.md`. Design : le skill Impeccable fait autorité
(la spec d'origine `freecourt-claude-code-prompt.md` reste la référence
fonctionnelle, mais est caduque sur le design).

## En ligne
https://free-court-ebon.vercel.app — déploiement auto au push sur `main`.

## Livré (v0.5.0 — 2026-08-21)
- Carte MapLibre abstraite : ne montre que ce qui aide à trouver un terrain.
- Clustering, filtres, recherche (terrains + lieux), légende, géolocalisation.
- Ajout de terrain, photos, avis, validation communautaire, signalement.
- Distance à vol d'oiseau et fraîcheur de l'information.
- Double thème jour/nuit, bilingue FR/EN.
- Identité visuelle « béton et marquage au sol ».
- Accessibilité : cibles 44px, clavier, lecteurs d'écran, reduced-motion.
- PWA installable (icônes + manifeste).

## Prochaine étape — finir l'identité visuelle
Deux chantiers ouverts par la refonte du 21/08, en attente du verdict de Théo
sur le rendu :
- **Les formes.** Tout est encore arrondi. La tension prévue entre dalle
  carrée (surfaces) et marquage arrondi (actions) reste à appliquer.
- **La hiérarchie typographique.** Tout vit entre 11 et 16px ; Big Shoulders
  Display demande à respirer en grand pour servir à quelque chose.

## Ensuite — solidité
- Bottom sheet sans sortie explicite (ni bouton, ni Échap, ni clavier).
- Onboarding au premier lancement : rien n'accueille un nouveau visiteur.
- Chunk Home à 829 Ko (maplibre-gl non code-splitté), sur une app qu'on
  ouvre dehors en 4G.
- Pluriels anglais figés (« 1 reviews »).

## v1 — Auth et contributeurs
La structure est prête et dormante dans `stores/user.js`.
- Supabase Auth (magic link ou OAuth) en remplacement de l'accès de
  développement local, qui n'est pas une sécurité.
- Profils réels, scoring automatique, statuts Rookie → Legend et quotas.
- Resserrer les RLS : aujourd'hui permissives pour permettre l'anonymat.
- **Actions réversibles** : validations, avis et votes sont aujourd'hui
  définitifs et anonymes. C'est le vrai argument produit pour brancher
  l'auth, pas seulement le confort d'avoir un compte.
- Modération : un compte admin existe côté interface mais n'a aucun pouvoir
  côté base.

## v2 — Idées (non engagé)
- Favoris, « j'y joue souvent ».
- Photos : compression client, modération.
- Reversement des contributions vers OpenStreetMap.
- Mode hors-ligne.

## Décisions actées
- 2026-08-20 : pivot vers la spec FreeCourt (v1 OSM/Overpass archivée dans
  `archive/v1-osm-leaflet/`).
- 2026-08-20 : MapLibre + OpenFreeMap plutôt que Mapbox (token payant).
  Swap documenté dans `services/mapbox.js`.
- 2026-08-21 : Impeccable fait autorité sur le design.
- 2026-08-21 : bilingue FR/EN dès maintenant ; les statuts contributeurs
  ne se traduisent pas (vocabulaire basket).
- 2026-08-21 : monde visuel « béton et marquage ». L'interface est le
  terrain (bleu de peinture), les terrains sont le ballon (orange).
