# Changelog

## [0.5.0] — 2026-08-21 (soir)
Identité visuelle : sortie du Tailwind par défaut.

- Monde « béton et marquage au sol ». Trois règles : le béton est gris et
  jamais crème ; la couleur est de la peinture et couvre (44 aplats
  translucides supprimés) ; l'interface est le terrain (bleu de peinture)
  et les terrains sont le ballon (orange).
- Grain SVG sur toutes les surfaces : plus aucun aplat numérique parfait.
- Typographie : Archivo + Big Shoulders Display, en remplacement d'Inter et
  Bebas Neue — les deux polices que le garde-fou d'Impeccable cite comme à
  éviter.
- Ombres dessinées (`--shadow-slab`, `--shadow-raised`) à la place des 24
  `shadow-lg/xl/2xl` de Tailwind.
- La pastille de regroupement perd son dégradé radial (faux volume).
- Zéro échec de contraste en jour comme en nuit.

## [0.4.0] — 2026-08-21 (après-midi)
Bilingue, accessibilité et confort.

- i18n FR/EN complet, bascule instantanée, système maison de 60 lignes
  (plutôt que ~40 Ko de vue-i18n). Détection de la langue du navigateur,
  choix persisté, `<html lang>` synchronisé. Les formats suivent :
  « 2,9 km » / « 2.9 km ».
- Feedback unifié : la mascotte pour toutes les réussites, au lieu de cinq
  mécanismes différents.
- Le toast est annoncé aux lecteurs d'écran (région live permanente) —
  correction d'une régression causée par l'unification elle-même.
- `prefers-reduced-motion` respecté, y compris sur les vols de caméra.
- Marqueurs accessibles au clavier, avec intitulés parlants.
- Légende de carte expliquant l'encodage des marqueurs, avec de vrais
  marqueurs rendus par le composant.
- Recherche : interroge les terrains de l'app, pas seulement les lieux.
- Favicon, icônes d'écran d'accueil et manifeste PWA (Bally).
- Accès de développement local (non sécurisé et documenté comme tel).
- Vocabulaire des états ramené à deux mots : « À vérifier » et « Validé ».

## [0.3.1] — 2026-08-21 (matin)
Passe design guidée par Impeccable.

- P0 corrigé : le bouton d'ajout tombait sous la tab bar, ce qui perdait le
  formulaire sans avertissement.
- Contrastes mesurés et corrigés : le blanc sur l'orange plafonnait à
  2.84:1 alors que le CTA principal en dépendait.
- Emoji entièrement remplacés par un jeu de 26 icônes dessinées.
- Cibles tactiles à 44px, zone de contact vérifiée au pointeur.
- Double thème jour/nuit, jour par défaut.
- Premier écran refondu : les terrains proches triés par distance
  remplacent les deux CTA.
- Carte abstraite : 12 couches masquées, détourage des routes corrigé.
- Distance à vol d'oiseau et fraîcheur de l'information.
- Clustering, recherche compacte, filtres et légende.

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
