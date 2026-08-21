# Contexte actif — FreeCourt

## Où on en est (2026-08-21)
La spec `freecourt-claude-code-prompt.md` est **entièrement implémentée** et
**LA PROD EST EN LIGNE ET VÉRIFIÉE** : https://free-court-ebon.vercel.app
(mobile 375px : carte + 15 markers + bottom sheet + fiche détail + deep link
direct OK). Repo `github.com/djouder38/FreeCourt`, deploy auto au push.

Épisode env vars (résolu le 21/08) : Théo avait collé l'URL de l'endpoint
REST (…/rest/v1) au lieu de l'URL de base → chemin doublé, PGRST125.
Corrigé en normalisant l'URL dans `src/services/supabase.js` (le code
tolère /rest/v1 et les slashs finaux). Un redeploy a aussi été nécessaire
après la pose des vars (Vite inline au build).

## ⏭️ Prochaine étape naturelle
- v1 auth + statuts contributeurs (feu vert Théo attendu) — voir ROADMAP.md.
- Optionnel : Théo peut nettoyer VITE_SUPABASE_URL sur Vercel (retirer
  /rest/v1) mais ce n'est plus nécessaire, le code normalise.

## Livré et vérifié en préview réelle
- Carte dark (MapLibre + OpenFreeMap), 15 terrains seed, markers SVG
  dynamiques (contour = état, texture = revêtement, badge 🔥/⭐, draft
  semi-transparent), filtres testés (16 → 5 mythiques → 16).
- Ajout terrain : pin mode (tap carte ou recherche d'adresse) → formulaire
  à sélecteurs visuels → insert draft → toast mascotte. Testé bout en bout.
- Validation communautaire : insert + trigger SQL (compteur live 2/5) +
  message de remerciement. Signalement de problème OK.
- Avis 1-5 ★ + vote utile (0→1 testé), photo uploadée dans Storage et
  affichée via URL publique.
- Mobile : tab bar, bottom sheets 40/90 %, bouton AJOUTER flottant.
- Desktop : sidebar 320px (liste ↔ détail) + profil + recherche inline.
- Mascotte Bally : toast, 404, profil vide, états vides.
- Statuts Rookie → Legend affichés (référentiel), auth volontairement
  non branchée (structure prête dans `src/stores/user.js`).

## Infra
- Supabase `freecourt` — id `udshhduyinwcfmxxpttg`, eu-west-3, 0 €/mois.
  Migrations versionnées dans `supabase/migrations/` **et appliquées**.
  Seed appliqué (15 terrains + 8 avis).
  ⚠️ **PicsIbou a été mis en PAUSE** (choix de Théo) pour libérer le slot
  free tier — à réactiver quand il en aura besoin.
- Vercel : projet `free-court`, team "Djoud's projects", lié au repo.
- GitHub : `djouder38/FreeCourt` (attention à la casse : le remote en
  minuscules redirige).

## Bugs trouvés et corrigés pendant la vérif
- **PGRST125 en prod** : `VITE_SUPABASE_URL` posée avec `/rest/v1` (URL de
  l'endpoint REST du dashboard) → supabase-js rajoute `/rest/v1` de son
  côté, chemin doublé. `src/services/supabase.js` normalise maintenant
  l'URL au lieu d'exiger une variable parfaite.
- Markers absents au remount SPA → `renderMarkers()` direct au mount, sans
  dépendre de l'event `load` de MapLibre (il ne se rejoue pas).
- Message de validation invisible → `CourtDetail` ne remet `loading=true`
  qu'au premier chargement, pas sur les refresh.
- **Navigation impossible en desktop** (signalé par Théo) : la tab bar est
  `lg:hidden` (spec mobile) et rien ne la remplaçait → pas d'accès au profil
  ni à la recherche, et `/profile` était une page sans issue. Corrigé :
  bouton profil + recherche inline dans la sidebar, bouton retour sur
  Profile. La spec ne prévoyait pas cette nav desktop.

## Écarts à la spec, assumés — à valider par Théo
1. **MapLibre GL + OpenFreeMap au lieu de Mapbox GL.** Le style
   `dark-v11` exige un token Mapbox payant que je ne peux pas créer.
   Rendu dark équivalent, zéro clé, zéro quota. Le swap est documenté dans
   `src/services/mapbox.js` si Théo fournit un `VITE_MAPBOX_TOKEN`.
2. RLS volontairement permissive (écritures anonymes) puisque l'auth n'est
   pas branchée — policies commentées dans `002_rules_and_rls.sql`, à
   resserrer en même temps que l'auth.

## Dette connue (non bloquant)
- Chunk `Home` à 819 KB (maplibre-gl non code-splitté).
- Un PNG de test orphelin dans le bucket `court-photos` (la suppression SQL
  est interdite par Supabase, à purger via le dashboard si ça gêne).
- Ciutadella Court est à 3/5 validations (2 du seed + 1 test).
- `~/.claude/lessons-learned.md` a un souci d'encodage (accents cassés,
  UTF-8 lu en ANSI). Je n'y ai pas touché — dis-moi si tu veux que je le
  réécrive proprement.

## En attente de Théo
- Poser les 2 env vars Vercel (voir "À reprendre ici").
- OK sur MapLibre/OpenFreeMap, ou fournir un token Mapbox.
- Feu vert pour enchaîner sur la v1 auth (voir ROADMAP.md).
