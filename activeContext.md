# Contexte actif — FreeCourt

## Où on en est (2026-08-20, fin de session build)
La spec FreeCourt de Théo (`freecourt-claude-code-prompt.md`) est implémentée
et **vérifiée en navigateur** (mobile 375px + desktop 1280px). Push initial
vers `github.com/djouder38/freecourt` → déploiement Vercel en cours/fait.

## Livré et testé (tous les flows validés en préview réelle)
- Carte dark + 15 terrains seed + markers dynamiques + filtres (16→5→16 ok).
- Ajout terrain : pin mode → adresse Grenoble → formulaire → insert → toast.
- Validation : boutons → insert + trigger SQL (compteur 2/5 live) + "Merci".
- Avis 4★ + vote utile (0→1), photo uploadée dans Storage et affichée.
- Desktop : sidebar 320px, liste → détail, tab bar cachée.

## Infra
- Supabase `freecourt` (udshhduyinwcfmxxpttg, eu-west-3, 0€/mois).
  ⚠️ PicsIbou mis en PAUSE (choix Théo) pour libérer le slot free tier.
- Migrations versionnées dans supabase/migrations/ ET appliquées.
- Vercel : projet `free-court` (team Djoud's projects), lié au repo GitHub.
- .env local rempli (URL + clé publishable). .env.example à jour.

## Bugs corrigés pendant la vérif
- Markers absents au remount SPA → renderMarkers() direct au mount
  (ne pas dépendre de l'event 'load' MapLibre).
- "Merci" de validation invisible → CourtDetail ne remet loading=true
  qu'au premier chargement.

## Écarts spec assumés (à revalider par Théo)
1. **MapLibre + OpenFreeMap au lieu de Mapbox GL** : dark-v11 exige un token
   payant que je ne peux pas créer. Rendu dark équivalent, swap documenté
   dans src/services/mapbox.js si Théo fournit un VITE_MAPBOX_TOKEN.
2. Un PNG de test orphelin reste dans le bucket court-photos (suppression
   SQL interdite par Supabase, à purger via le dashboard si ça dérange).
3. Ciutadella Court est à 3/5 validations (2 seed + 1 test involontaire).

## Reste à faire
- Vercel : poser les env vars VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
  (valeurs dans .env local) puis vérifier le déploiement production.
- v1 auth : voir ROADMAP.md.

## En attente de Théo
- OK sur le choix MapLibre/OpenFreeMap (ou fournir un token Mapbox).
- Confirmer que le déploiement Vercel est bien vert avec les env vars.
