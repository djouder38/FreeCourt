---
target: tout le parcours utilisateur (carte, CTA, calques, fiche terrain, profil)
total_score: 17
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-21T09-27-16Z
slug: src-pages-home-vue
---
Method: A en sous-agent isolé (a87c9763eebbf598e) · B repris en contexte parent après coupure API (limite de dépense mensuelle atteinte). Assessment A était terminé et scellé avant toute entrée de findings détecteur, l'invariant d'isolation est préservé.

## Design Health Score

| # | Heuristique | Note | Problème clé |
|---|---|---|---|
| 1 | Visibilité de l'état du système | 2/4 | Filtre actif = icône encre sur fond sombre, 1,1:1 (corrigé pendant la critique). Aucun retour après géolocalisation. |
| 2 | Correspondance monde réel | 3/4 | `moon`/`flame`/`star` affichés en texte brut dans le formulaire (corrigé). 4 mots pour 2 états. |
| 3 | Contrôle et liberté | 1/4 | Pas de fermeture du bottom sheet ni des filtres. Mode pin persistant après navigation. Validations et avis irréversibles. |
| 4 | Cohérence et standards | 2/4 | Système d'icônes violé 3 fois. Deux libellés pour le même CTA. 5 mécanismes de feedback pour 5 succès. |
| 5 | Prévention des erreurs | 1/4 | Le submit de /add est recouvert par la tab bar (756 vs 738) : tap = navigation ailleurs, formulaire perdu. |
| 6 | Reconnaissance plutôt que rappel | 1/4 | L'encodage du marqueur (anneau/texture/pastille/opacité) n'est expliqué nulle part. Aucune légende. |
| 7 | Flexibilité et efficacité | 1/4 | La recherche n'interroge que Nominatim, jamais la base de terrains. Aucune distance calculée. |
| 8 | Esthétique et minimalisme | 3/4 | Vraie retenue, palette cohérente. Mais 22 % de l'écran mobile est du chrome permanent. |
| 9 | Récupération d'erreur | 2/4 | Messages bien écrits, mais filtrer à zéro résultat n'affiche rien sur mobile. |
| 10 | Aide et documentation | 1/4 | Zéro onboarding, zéro légende. Le nom « FreeCourt » n'apparaît nulle part sur mobile. |
| **Total** | | **17/40** | Sous la bande courante (20-32) |

## Verdict de spécificité design

Les ornements sont authored, la structure est interchangeable. Le marqueur (anneau = état, texture = revêtement, pastille = fréquentation) et le jeu d'icônes (les 4 revêtements = le même cadre de terrain avec une texture différente) sont du vrai design produit. Mais la carte elle-même — le produit — est un style OpenFreeMap dark recoloré qui ne dit ni basket ni béton, et le châssis (tab bar 3 onglets, bottom sheet, chips arrondies, 2 CTA orange) conviendrait à une app de bornes de recharge. Le rapport est inversé : le marqueur est vu 2 secondes, le châssis 100 % du temps.

Scan déterministe : `detect.mjs --json src` retourne `[]`, exit 0. Zéro finding. Enseignement : le détecteur attrape les tics visuels d'IA, pas les défauts d'usage — les trois bugs bloquants ci-dessous lui sont tous passés sous le nez.

## Problèmes prioritaires

### [P0] Le bouton « Ajouter le terrain » est recouvert par la tab bar
Mesuré en 375×812 : submit à top 756 / bottom 808, tab bar à partir de 738. `elementFromPoint` au centre du bouton ne renvoie pas le submit. Le contributeur remplit le formulaire, tape le bouton, atterrit ailleurs — formulaire perdu, sans avertissement ni sauvegarde. Viole littéralement le principe « contribuer doit coûter moins cher que se plaindre ».
Fix : barre d'action sticky au-dessus de la tab bar, ou masquer la tab bar sur les écrans de tâche (/add, /court/:id).
Commande : /impeccable harden

### [P1] La carte est illisible dehors, ce que le produit interdit explicitement
Ratios mesurés contre le fond `#1a1d23` : rues de quartier 1,67:1, parcs 1,14:1, eau 1,25:1, corps du marqueur 1,03:1, brouillon à 55 % d'opacité ≈2,6:1. Un playground se repère par sa rue et son parc : les deux sont invisibles. 4 des 15 terrains sont en bord de mer et le littoral ne se voit pas. L'opacité sur les brouillons est aussi fausse sémantiquement : un terrain « à vérifier » doit signaler son incertitude, pas s'effacer.
Fix : trancher fond clair par défaut (l'usage le commande) vs sombre remonté (roadMinor ≥3:1, green ≥2:1, water ≥3:1). Remplacer l'opacité par un anneau en tirets à opacité pleine.
Commande : /impeccable colorize

### [P1] Zéro résultat de filtre n'affiche rien sur mobile
Filtre « Sable » appliqué : 0 marqueur, et aucun message dans le DOM. L'état vide n'existe que dans l'aside desktop. L'utilisateur conclut « il n'y a aucun terrain ici » et ferme l'app.
Fix : sortir l'état vide vers un overlay carte partagé, avec le filtre actif nommé et un bouton « Effacer les filtres ».
Commande : /impeccable onboard

### [P2] Cibles tactiles sous 44 px sur un produit utilisé à une main
Marqueur 38×38 (l'objet le plus tapé, posé sur une surface pannable : un tap imprécis devient un drag), étoiles de notation 20×32 accolées (on note 3 en voulant 4), « Retour » 67×20, chips de filtre h26, boutons de validation h38.
Fix : hit-target de 44 px via pseudo-élément transparent en gardant le visuel actuel.
Commande : /impeccable adapt

### [P2] Ni distance ni fraîcheur : le produit ne répond pas à ses deux promesses
`grep -riE "distance|km|haversine"` sur src/ : zéro résultat. `created_at` est chargé par `fetchCourtDetail()` puis jamais affiché. Le joueur ne sait jamais lequel est le plus proche ; la fiche affiche « État moyen » identiquement, que ce soit saisi hier ou il y a deux ans. C'est exactement l'info fausse que le principe n°3 dit vouloir éviter, et c'est le différenciateur n°1 du positionnement.
Fix : distance haversine en tête de fiche et comme tri par défaut ; marqueur « vous êtes ici » ; ligne de fraîcheur « décrit il y a 3 mois · confirmé par 4 joueurs ».
Commande : /impeccable shape

## Signaux d'alarme par persona

**Le joueur pressé en plein soleil** : tape « Trouver un terrain près de moi », la carte vole vers sa position et rien n'apparaît — pas de point bleu, pas de liste, pas de distance. Les chips qui décident s'il y va (« Béton », « État moyen ») sont le plus petit texte de l'écran, 12 px gris. « S'y rendre », l'action qui accomplit la promesse du produit, est stylée en tertiaire (153×42, bordure discrète) sous le bloc Photos.

**Le premier visiteur** : atterrit sur l'Europe au zoom 4 avec deux pastilles « 3 » et « 2 » et deux ordres en majuscules. Le nom « FreeCourt » n'apparaît nulle part sur mobile (le h1 est dans l'aside `hidden lg:flex`). Il tape « Rucker Park » dans la recherche et n'obtient pas Rucker Park, parce que la recherche n'interroge que Nominatim. L'onglet Profil, un tiers de la navigation, mène à un bouton « Se connecter (bientôt) » cliquable sans effet.

## Observations mineures

- Bordures invisibles : `--color-edge #333` sur card = 1,23:1. Toutes les cartes, chips et champs sont délimités par un trait qu'on ne voit pas dehors. Les étoiles vides de la notation sont en `text-edge` : on ne voit pas qu'il faut noter sur 5.
- Marqueurs exposés en `generic "Map marker"` sans nom ni rôle, non focusables : l'interaction centrale est invisible au clavier et au lecteur d'écran.
- Le champ de recherche ne prend pas le focus à l'ouverture (`autofocus` sur un élément en `v-if` ne se rejoue pas) : deux gestes pour une intention.
- Mode pin persistant dans le store après navigation : revenir sur la carte laisse l'utilisateur en mode ajout.
- Le bottom sheet lit `selected` depuis `courts` et non `filtered` : un terrain exclu par le filtre reste affiché.
- Les CTA de la sidebar desktop sont à top 1392 dans un viewport de 800 px, sous la ligne de flottaison, et le bloc n'est pas sticky.
- Vocabulaire des états : « à vérifier », « validé », « verrouillé », « certifié » — 4 mots pour 2 états.
- Aucune prise en charge de `prefers-reduced-motion`.
- Plancher typographique à 10 px (libellés de tab bar) sur un produit dont le principe est la lisibilité au soleil.

## Questions à considérer

1. Si la carte doit être lisible en plein soleil, pourquoi est-elle sombre ? L'orange, le Bebas, le ballon et « Airball ! » portent déjà toute la marque. Un fond béton pâle avec des marqueurs orange qui claquent serait plus street ET beaucoup plus lisible. Le sombre deviendrait le mode nuit — quand on joue sous les projecteurs.
2. Pourquoi le premier écran demande-t-il ce qu'on veut faire au lieu de montrer les terrains ? Les trois personas veulent la même chose en arrivant : voir des terrains près d'eux. Géolocaliser à l'ouverture et afficher 3 cartes triées par distance rendrait « Ajouter » à son vrai rang : secondaire.
3. Si une info fausse est pire qu'une info absente, pourquoi ne jamais afficher l'âge de l'information ? Un état qui pâlit avec le temps, un marqueur dont l'anneau se ternit, une invitation « personne n'a confirmé depuis 8 mois — tu y es ? » : ce serait la seule chose qu'un concurrent généraliste ne pourrait pas copier.
