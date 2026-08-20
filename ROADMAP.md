# Roadmap — FreeCourt

## Vision
La référence communautaire des terrains de basket dans le monde : trouver un
spot, l'ajouter, le noter, le faire vivre. Mobile-first, ambiance street ball.
Spec de référence : `freecourt-claude-code-prompt.md`.

## Livré (v0.2 — 2026-08-20)
- App Vue 3 + Vite + Tailwind 4 + Pinia + Router, structure spec.
- Carte dark custom (MapLibre + OpenFreeMap), markers SVG dynamiques
  (état/revêtement/fréquentation, draft semi-transparent).
- Supabase : 5 tables + RLS + triggers (lock à 5 validations, 3 photos max)
  + RPC vote_helpful + bucket court-photos + seed 15 terrains.
- Flow ajout terrain complet (pin mode + recherche d'adresse + formulaire).
- Fiche terrain : badges, photos (upload), avis 1-5 + vote utile,
  validation communautaire, signalement.
- Mobile : tab bar, bottom sheets 40/90%, bouton AJOUTER flottant.
- Desktop : sidebar 320px liste/détail.
- Mascotte Bally (toast, 404, profil vide, états vides).
- Page profil placeholder + référentiel statuts Rookie → Legend.

## Prochaine étape (v0.3)
- Déploiement production Vercel (push fait ; env vars à poser).
- Retirer le suffixe "(test)" du process de QA, vérifier la prod mobile.

## v1 — Auth + contributeurs
- Supabase Auth Google/email (structure prête dans stores/user.js).
- Profils réels, scoring auto (+10 terrain validé, +2 validation, +5 avis,
  +1 vote utile reçu), statuts + quotas de la spec.
- Resserrer les RLS (created_by = auth.uid(), quotas d'ajout par statut).
- Édition de terrain selon droits (Regular: les siens, Baller: tous
  non-lockés, Legend: modération).

## v2 — Idées (non engagé)
- Favoris, recherche de terrains par nom.
- Photos : compression client, modération.
- Code-split de maplibre-gl (chunk Home à 819 KB aujourd'hui).
- PWA / offline.

## Décisions actées
- 2026-08-20 : pivot complet vers la spec FreeCourt de Théo (l'ancienne v1
  OSM/Overpass est archivée dans archive/v1-osm-leaflet/).
- 2026-08-20 : MapLibre + OpenFreeMap au lieu de Mapbox GL (token payant
  requis sinon) — même rendu dark, swap documenté, à revalider par Théo.
- 2026-08-20 : PicsIbou mis en pause sur Supabase (choix Théo) pour libérer
  le slot free tier du projet freecourt.
