# Contexte actif — FreeCourt

## Où on en est (2026-08-21)
Prod en ligne et vérifiée : **https://free-court-ebon.vercel.app**
Repo `github.com/djouder38/FreeCourt`, deploy auto au push.
Dernière livraison : passe lisibilité / navigation (v0.3.0) sur retours
de Théo — carte recontrastée, clustering, recherche compacte, CTA géoloc.

## Livré dans la passe 0.3.0 (vérifié en 375px et 1280px)
- **Carte** : palette "béton nocturne" appliquée strate par strate
  (`applyPalette()` dans `services/mapbox.js`). Fond #1a1d23 au lieu de
  noir pur, eau #15323f, bâtiments #262a32, rues #3c424e, autoroutes
  #646b7a, labels #eceae7 + halo. Vérifié couche par couche.
- **Clustering** : supercluster, radius 60. Testé : NY zoom 6 = 1 pastille
  « 2 » → zoom 10 = 2 pins ; Paris zoom 9 = pastille « 3 ». Clic sur une
  pastille → easeTo au zoom de séparation (9.2 pour NY, vérifié).
- **Recherche** : barre compacte 42px en haut de carte (avant : bottom
  sheet de ~325px). Testée avec « Berlin » → 2 résultats → recentrage.
- **CTA géoloc** : « 📍 Trouver un terrain près de moi » en CTA principal,
  « 🏀 Ajouter un terrain » juste dessous, les deux à parité. Idem dans la
  sidebar desktop. Retour d'état si la position est refusée.

## Décisions / écarts à valider par Théo
1. **MapLibre + OpenFreeMap plutôt que Mapbox** (toujours en attente de
   son OK). Mapbox = 50k chargements/mois gratuits puis ~5 $/1000, et il
   faut un token ; MapLibre+OpenFreeMap = 0 €, sans clé ni quota, mais
   sans SLA (projet communautaire) et données un peu moins riches.
   Le swap est documenté dans `services/mapbox.js`.
2. RLS permissive tant que l'auth n'est pas branchée (policies commentées
   dans `002_rules_and_rls.sql`).

## Pièges connus (à ne pas rediagnostiquer)
- Quand le panneau navigateur n'est pas affiché, **rien n'est composité** :
  les transitions CSS, `easeTo`/`flyTo` et l'event `load` de MapLibre ne
  se déclenchent pas. Ce n'est pas un bug de l'app — neutraliser la
  transition ou espionner l'appel pour vérifier.
- `VITE_SUPABASE_URL` sur Vercel contient `/rest/v1` : le code le tolère
  désormais (normalisation dans `services/supabase.js`).

## Dette connue (non bloquant)
- Chunk `Home` à 835 KB (maplibre-gl non code-splitté).
- Un PNG de test orphelin dans le bucket `court-photos`.
- Ciutadella Court à 3/5 validations (2 du seed + 1 test).
- `~/.claude/lessons-learned.md` a un souci d'encodage (accents cassés).
  Pas touché — Théo doit dire s'il veut que je le réécrive.

## Outillage design : Impeccable (installe le 2026-08-21)
Skill tiers (github.com/pbakaus/impeccable, Apache 2.0, 61k stars) installe
en **scope projet** avec les **hooks actifs** (choix de Theo).
- Emplacement : `.claude/skills/impeccable/` (148 fichiers) + hooks dans
  `.claude/settings.local.json`. Les deux sont **gitignores** : c'est un
  outil reinstallable, pas une dependance du projet.
- Reinstaller / mettre a jour :
  `npx impeccable install --providers=claude --scope=project`
- Scan manuel : `node .claude/skills/impeccable/scripts/detect.mjs src`
- Ce que ca apporte : 23 commandes design (`/impeccable critique|audit|
  polish|layout|colorize|bolder|quieter...`) + 59 regles deterministes
  (sans LLM) qui detectent les tics visuels d'IA.
- Premier passage sur FreeCourt : 1 finding reel (layout-transition sur
  BottomSheet) corrige. Le scan de `src` est propre (exit 0).
- Pas encore fait : `/impeccable init` (ecrit PRODUCT.md + DESIGN.md, le
  brief design durable que toutes les commandes relisent). A proposer a
  Theo -- c'est ce qui donnerait le plus de valeur aux commandes suivantes.

## Passe design du 2026-08-21 (apres install Impeccable)

**Regle actee par Theo : Impeccable fait autorite sur le design, la spec
d'origine (freecourt-claude-code-prompt.md) est caduque sur ce plan.**
Elle reste la reference produit et fonctionnelle.

Livre et verifie :
- `PRODUCT.md` ecrit via /impeccable init (interview de Theo). Positionnement
  cle ajoute par lui : "une carte qui ne montre que les terrains et rien
  d'autre", l'itineraire est delegue a Google Maps.
- Contrastes mesures et corriges : blanc sur orange plafonnait a 2.84:1
  (le CTA principal etait le texte le moins lisible de l'app) -> encre
  #0f0f0f, 6.75:1. Pastilles cluster 3.66 -> 5.24-8.23. Token
  --color-bad-soft pour le texte rouge (5.61:1).
- Surfaces navigateur thematisees : ::selection, focus-visible, caret,
  scrollbars.
- Emoji entierement remplaces : 22 distincts / 41 occurrences -> nouveau
  `src/components/ui/Icon.vue` (26 icones, grille 24x24, trait 2,
  currentColor). Verifie : 59 icones a l'ecran, un seul trait, zero emoji.
- BottomSheet : anime `transform` au lieu de `height` (trouve par le hook).

## Prochaine etape
- v1 auth + statuts contributeurs (structure prête dans `stores/user.js`) :
  Supabase Auth, scoring, quotas, RLS resserrées. En attente du feu vert.
