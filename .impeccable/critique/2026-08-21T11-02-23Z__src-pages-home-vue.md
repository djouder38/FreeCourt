---
target: tout le parcours utilisateur, apres la passe design
total_score: 30
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
timestamp: 2026-08-21T11-02-23Z
slug: src-pages-home-vue
---
⚠️ DEGRADED: single-context (sous-agents refusés — limite de dépense mensuelle atteinte). Biais supplémentaire à connaître : l'auteur du code est aussi son évaluateur, là où la critique du 21/08 au matin avait été menée par un agent qui découvrait le projet.

## Design Health Score

| # | Heuristique | Note | Écart avec le 17/40 initial |
|---|---|---|---|
| 1 | Visibilité de l'état du système | 3/4 | +1 — filtre actif visible, point « vous êtes ici », fraîcheur affichée, toasts. Reste : le toast est muet pour un lecteur d'écran. |
| 2 | Correspondance monde réel | 3/4 | = — vocabulaire ramené à deux mots, mais Rookie/Baller/Legend restent en anglais dans une app française. |
| 3 | Contrôle et liberté | 2/4 | +1 — mode pin annulable et non persistant, panneaux fermables au clic dehors. Reste : validations et avis irréversibles, bottom sheet sans sortie explicite. |
| 4 | Cohérence et standards | 3/4 | +1 — jeu d'icônes unique, tokens, panneaux symétriques, feedback unifié. |
| 5 | Prévention des erreurs | 3/4 | +2 — le P0 est corrigé, le mauvais code est rejeté, la taille des photos est bornée. Reste : aucune confirmation avant une action irréversible. |
| 6 | Reconnaissance plutôt que rappel | 4/4 | +3 — la légende explique l'encodage avec de vrais marqueurs rendus par le composant. |
| 7 | Flexibilité et efficacité | 3/4 | +2 — recherche dans les terrains, distance, tri par proximité, thème. Reste : pas de favoris. |
| 8 | Esthétique et minimalisme | 4/4 | +1 — carte abstraite (12 couches masquées), chrome réduit, contrôles unifiés à 48px. |
| 9 | Récupération d'erreur | 3/4 | +1 — messages nommant cause et action, état vide avec sortie. Reste : pas de bouton réessayer sur échec réseau. |
| 10 | Aide et documentation | 2/4 | +1 — légende et nom du produit présents. Reste : aucun onboarding au premier lancement. |
| **Total** | | **30/40** | **+13** |

## Preuves déterministes

- `detect.mjs --json src` : `[]`, exit 0. Aucun anti-pattern sur 37 fichiers.
- Contrastes : **zéro échec** en mode jour comme en mode nuit, sur l'ensemble des textes visibles de l'accueil (parcours automatisé sur tous les nœuds de texte).
- Cibles tactiles : zéro élément réellement sous 44px. Les marqueurs mesurent 38px de dessin mais leur zone de contact est vérifiée au pointeur à 21px du centre (et rejetée à 30px) : les 44px sont effectifs, pas déclaratifs.
- Pas de défilement horizontal en 375px. `lang="fr"` correct. Tous les éléments focusables ont un nom accessible.

## Problèmes prioritaires

### [P1] Le toast n'est pas annoncé aux lecteurs d'écran — régression introduite par l'unification
Le conteneur du toast n'a ni `role="status"` ni `aria-live`. Avant l'unification, la confirmation de validation était du texte inline dans le flux, donc lue. Maintenant que **tout** le feedback passe par le toast, une personne utilisant un lecteur d'écran valide un terrain, poste un avis ou envoie une photo sans jamais savoir si ça a marché. L'unification a amélioré la cohérence visuelle et supprimé le seul retour accessible qui existait.
Fix : `role="status"` et `aria-live="polite"` sur le conteneur, présent dans le DOM même vide.
Commande : /impeccable harden

### [P2] Le bottom sheet n'a aucune sortie explicite
Ses seuls boutons sont « Voir le terrain ». On le ferme par glissement vers le bas ou par un clic sur la carte — deux gestes que rien n'annonce, et aucun des deux n'est atteignable au clavier. La poignée suggère le glissement à qui connaît le motif ; les autres restent coincés.
Fix : un bouton de fermeture, et `Échap` pour fermer.
Commande : /impeccable harden

### [P2] Validations, avis et votes restent irréversibles et anonymes
Un tap accidentel sur « Il existe » ou sur une étoile est définitif : aucune confirmation, aucun retour arrière, et rien ne rattache l'action à son auteur. Sur un produit dont le principe est « une info fausse est pire qu'une info absente », c'est la seule voie par laquelle une info fausse entre sans filet.
Fix : dépend de l'auth — c'est le vrai argument pour la brancher.
Commande : /impeccable shape

### [P3] Le bilingue est acté mais rien n'est préparé
`PRODUCT.md` fixe FR/EN dès maintenant ; l'interface est intégralement en français en dur. Chaque écran ajouté depuis creuse la dette, et les statuts contributeurs sont déjà en anglais au milieu du français.
Commande : /impeccable clarify

### [P3] Le chunk Home pèse 829 Ko
maplibre-gl n'est pas découpé. Sur un produit fait pour être ouvert dehors en 4G, avant de jouer, c'est la première seconde d'attente.
Commande : /impeccable optimize

## Ce qui est réellement acquis

La **légende** est le meilleur élément du produit : elle rend de vrais marqueurs via le composant, donc elle ne peut pas dériver du rendu réel. Le **système de couleurs** tient ses promesses dans les deux thèmes sans un seul échec de contraste, y compris sur les couleurs de sens qui changent de valeur d'un mode à l'autre. Les **zones tactiles** sont vraies et non déclaratives. La **carte abstraite** applique littéralement le principe produit : plus rien n'y concurrence les terrains.

## Questions à considérer

1. Le produit sait maintenant dire *quand* une information a été constatée. Que se passe-t-il quand personne ne confirme pendant un an — le terrain disparaît-il de la carte, ou devient-il un appel à vérification ?
2. L'accès de développement fait exister un « admin » que rien ne distingue encore d'un visiteur, faute de pouvoirs. Qu'est-ce qu'un admin doit pouvoir faire que personne d'autre ne peut ?
3. Les trois profils d'utilisateurs partagent aujourd'hui exactement le même écran. Le contributeur régulier mérite-t-il un chemin plus court que le joueur de passage ?
