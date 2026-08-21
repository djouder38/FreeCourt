# Contexte actif — FreeCourt

## Où on en est (fin de session 2026-08-21)

Prod en ligne : **https://free-court-ebon.vercel.app**
Repo `github.com/djouder38/FreeCourt`, déploiement auto au push.
24 commits dans la journée. Version 0.5.0.

La journée a été une passe design complète, menée avec le skill **Impeccable**
installé en début de session. L'app est passée d'un score de critique de
**17/40 à 30/40**, puis a reçu une refonte d'identité visuelle en fin de
journée.

## ⏭️ À REPRENDRE ICI

**1. Théo doit juger le nouveau monde visuel sur son téléphone.** C'est un
changement d'identité, pas une retouche — son œil tranche, pas mes mesures.
Ce qui a changé : béton gris à la place du blanc cassé, accent bleu de
peinture à la place de l'orange, orange réservé aux marqueurs et à la
mascotte, grain sur toutes les surfaces, typo Archivo + Big Shoulders.

**2. Deux chantiers du monde visuel restent ouverts**, volontairement :
- **Les formes** : tout est encore arrondi (46 `rounded-full` à l'origine).
  La tension prévue entre dalle carrée (surfaces) et marquage arrondi
  (actions) n'est pas appliquée.
- **La hiérarchie typographique** : tout vit entre 11 et 16px. Big Shoulders
  Display demande à respirer en grand, sinon la typo ne sert à rien.

## Livré aujourd'hui

**Outillage** — Impeccable installé en scope projet, hooks actifs
(`.claude/skills/`, gitignoré). Deux critiques archivées dans
`.impeccable/critique/`.

**Produit** — `PRODUCT.md` écrit avec Théo. Positionnement clé qu'il a
ajouté : « une carte qui ne montre que les terrains et rien d'autre ».

**Corrections structurelles**
- P0 : le bouton d'ajout tombait sous la tab bar, tap = formulaire perdu.
  La tab bar disparaît des écrans de tâche (`/add`, `/court/:id`).
- Contrastes : le blanc sur l'orange plafonnait à 2.84:1. Zéro échec
  aujourd'hui, en jour comme en nuit.
- Cibles tactiles : plus rien sous 44px, vérifié au pointeur (le marqueur
  garde 38px de dessin, sa zone de contact fait 44).
- Accessibilité : marqueurs focusables au clavier avec intitulés parlants ;
  toast annoncé aux lecteurs d'écran (région live permanente).
- `prefers-reduced-motion` respecté, y compris sur les vols de caméra.

**Fonctionnel**
- Double thème jour/nuit, jour par défaut (l'app s'utilise dehors).
- Premier écran refondu : les 2 CTA sont remplacés par la bande des terrains
  proches, triés par distance. Géoloc silencieuse si déjà autorisée.
- Carte abstraite : 12 couches masquées sur 47 (bâti, POI, noms de rue,
  frontières). Détourage des routes corrigé (les casings prenaient la
  couleur du remplissage).
- Recherche : interroge enfin les terrains de l'app, pas seulement les lieux.
  Panneau en haut à droite, en miroir des filtres.
- Fraîcheur de l'information : « Décrit hier · confirmé par 6 joueurs »,
  passage en avertissement au-delà de 6 mois.
- Légende de carte (`MapLegend.vue`) qui rend de vrais marqueurs.
- Feedback unifié : la mascotte pour toutes les réussites.
- i18n FR/EN complet avec bascule instantanée, système maison (60 lignes).
- Favicon + icônes d'écran d'accueil (Bally) + manifeste PWA.
- Accès de développement (bouton en haut à droite du profil).

## Décisions actées

- **Impeccable fait autorité sur le design**, pas la spec d'origine
  (`freecourt-claude-code-prompt.md`), qui reste la référence produit.
- **Jamais d'emoji** : tout passe par `components/ui/Icon.vue`.
- **Jamais d'aplat translucide** pour fabriquer un état : la couleur couvre.
- **L'interface est le terrain (bleu), les terrains sont le ballon (orange).**
- Vocabulaire des états : deux mots, « À vérifier » et « Validé ».
- Statuts contributeurs (Rookie → Legend) non traduits : vocabulaire basket.

## Reste ouvert (par ordre d'impact)

1. Les deux chantiers du monde visuel ci-dessus.
2. **Bottom sheet sans sortie explicite** : ni bouton, ni Échap, seulement
   un glissement que rien n'annonce. Inatteignable au clavier.
3. **Actions irréversibles** : validations, avis et votes n'ont ni
   confirmation ni retour arrière. Dépend de l'auth — c'est le vrai
   argument pour la brancher.
4. **Aucun onboarding** au premier lancement.
5. **Chunk Home à 829 Ko** (maplibre-gl non code-splitté), sur une app
   qu'on ouvre dehors en 4G.
6. **Pluriels anglais figés** (« 1 reviews ») : ~30 lignes.
7. v1 auth + statuts contributeurs réels (structure prête dans
   `stores/user.js`).

## Pièges connus (ne pas rediagnostiquer)

- Quand le panneau navigateur n'est pas affiché, **rien n'est composité** :
  transitions CSS, `easeTo`/`flyTo` et l'event `load` de MapLibre ne se
  déclenchent pas, et les captures d'écran échouent. Neutraliser la
  transition ou espionner l'appel plutôt que conclure à un bug.
- Après beaucoup d'éditions, le serveur de dev peut servir un module périmé
  (« does not provide an export named … ») : vider `node_modules/.vite` et
  redémarrer. Le build de prod n'est pas affecté.
- MapLibre écrase l'`aria-label` des marqueurs : le reposer APRÈS `addTo`.
- `VITE_SUPABASE_URL` contient `/rest/v1` côté Vercel ; le code le tolère.
- Ne jamais lancer de regex globale sur les espaces dans un `.vue` : ça
  aplatit l'indentation de tout le fichier (appris à mes dépens aujourd'hui).

## En attente de Théo

- Son verdict sur le nouveau monde visuel (le point bloquant de demain).
- Un terrain nommé « test » traîne en base, créé par lui pendant ses essais.
  Je ne l'ai pas supprimé.
- Sa limite de dépense mensuelle a sauté une fois aujourd'hui, ce qui a tué
  un sous-agent en cours de critique. Les critiques suivantes tournent en
  contexte unique (mode dégradé assumé et signalé).
