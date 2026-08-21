# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Trois profils, tous primaires : le produit sert délibérément les trois besoins
plutôt que d'en privilégier un (décision de Théo, 2026-08-21).

1. **Le joueur qui veut jouer maintenant.** Il est dehors, ballon sous le bras,
   sur mobile, parfois en plein soleil. Il cherche un terrain proche, libre et
   praticable. Sa décision se prend en quelques secondes.
2. **Le voyageur / nouveau en ville.** Il ne connaît aucun spot. Il compare,
   regarde les photos et les avis, prépare sa session à l'avance.
3. **Le régulier qui fait vivre sa scène.** Il connaît les terrains de sa ville,
   les ajoute, les corrige, valide ceux des autres. C'est lui qui alimente la
   base et sans qui les deux premiers profils n'ont rien à consulter.

Ces trois profils sont souvent la même personne à des moments différents.

## Product Purpose

Référencer les terrains de basket du monde entier et permettre de trouver où
jouer. La consultation est ouverte à tous ; la base est alimentée et corrigée
par ceux qui jouent. Le succès se mesure à une chose : quelqu'un ouvre l'app et
part jouer sur un terrain qu'il ne connaissait pas.

## Positioning

Quatre différences, confirmées par Théo, qu'un concurrent généraliste ne peut
pas copier honnêtement :

1. **L'état réel du terrain.** Sol, paniers (avec ou sans filet), éclairage,
   praticabilité. Des informations qui se dégradent avec le temps et que seuls
   les joueurs présents sur place connaissent.
2. **Les spots que les cartes généralistes ignorent.** Playgrounds de quartier,
   terrains d'école ouverts le week-end, city-stades non référencés.
3. **La scène.** Qui joue, quand, à quel niveau, quelle ambiance. La valeur est
   autant dans les gens que dans le béton.
4. **Une carte qui ne montre que les terrains.** Pas de restaurants, pas de
   commerces, pas de bruit. L'itinéraire est délégué à Google Maps par un lien ;
   FreeCourt ne cherche pas à être un outil de navigation.

Le point 4 est structurant : tout ce qui n'aide pas à trouver ou juger un
terrain n'a rien à faire sur la carte.

## Operating Context

- Usage très majoritairement mobile, souvent en extérieur, en plein jour, à une
  main, parfois avec un ballon dans l'autre.
- La consultation se fait sur le terrain ou juste avant de partir ; la
  contribution se fait plutôt au calme, après coup.
- L'itinéraire final sort de l'app (lien Google Maps) : FreeCourt s'arrête au
  moment où l'utilisateur sait où aller.

## Capabilities and Constraints

Existant et fonctionnel en production :
- Carte mondiale avec regroupement des terrains par zone et dégroupement au zoom.
- Fiche terrain : revêtement, état, fréquentation, description, photos (3 max),
  avis notés de 1 à 5 avec vote « utile », lien itinéraire externe.
- Ajout d'un terrain par placement d'un pin ou recherche d'adresse.
- Validation communautaire : 5 validations font passer un terrain de « à
  vérifier » à « validé », et le verrouillent (règle appliquée en base).
- Recherche de lieu et géolocalisation « près de moi ».

Contraintes techniques durables :
- Vue 3 + Vite + Tailwind + Pinia, Supabase (PostgreSQL, RLS, Storage),
  MapLibre GL avec les tuiles OpenFreeMap, déploiement Vercel.
- Le fond de carte est un style vectoriel tiers : la palette est appliquée par
  code, il n'y a pas d'éditeur visuel de style.

Décisions produit actées :
- **Bilingue FR/EN dès maintenant** (décidé le 2026-08-21). L'i18n n'est pas
  encore implémentée : toute l'interface est actuellement en français en dur.
  Toute nouvelle interface doit être écrite en prévoyant les deux langues.

Explicitement non décidé / non fait :
- Aucune authentification. Les statuts contributeurs (Rookie → Legend) et le
  système de score sont spécifiés mais dormants ; les contributions sont
  anonymes et les règles d'accès en base sont volontairement permissives.
- Aucun modèle économique, aucune date de lancement public arrêtée.

## Brand Commitments

- Nom : **FreeCourt**. Le « Free » porte à la fois gratuit et libre d'accès.
- Univers de référence : street ball, béton, playground. Fixé par la spec
  d'origine (`freecourt-claude-code-prompt.md`), qui reste la référence.
- Mascotte existante : un ballon de basket avec des yeux et de petits bras,
  utilisé dans les toasts, la page 404 et les états vides (`Mascot.vue`).
- Ton : direct, tutoiement, vocabulaire de joueur, pas de langage corporate.

## Evidence on Hand

- **15 terrains réels** en base, répartis sur 4 continents, dont des lieux qui
  existent vraiment et sont vérifiables : Rucker Park, The Cage (West 4th),
  Venice Beach, Playground Duperré, Arpoador, Mauerpark, Yoyogi, Bondi.
- **Les 8 avis en base sont fabriqués** pour la démo. Ce ne sont pas de vrais
  témoignages : ils ne doivent jamais être présentés comme tels, ni servir de
  preuve sociale dans une page marketing.
- **Aucune photo réelle de terrain** n'est disponible aujourd'hui. Le bucket est
  vide (hors un fichier de test). Toute maquette montrant des photos doit
  utiliser un placeholder assumé, jamais une image inventée présentée comme un
  vrai terrain.
- Aucun utilisateur réel, aucune métrique d'usage, aucune couverture presse.

## Product Principles

1. **La carte ne montre que ce qui aide à jouer.** Tout élément qui n'aide pas à
   trouver ou juger un terrain est du bruit à supprimer.
2. **Lisible dehors, en plein soleil, à une main.** Le contraste et la taille
   des cibles ne sont pas de l'esthétique, ce sont des contraintes d'usage.
3. **Une info fausse est pire qu'une info absente.** L'état d'un terrain se
   dégrade ; le produit doit toujours montrer son degré de confiance plutôt que
   d'afficher une certitude qu'il n'a pas.
4. **Contribuer doit coûter moins cher que se plaindre.** Ajouter ou corriger un
   terrain doit rester faisable en une minute, sans compte.
5. **On s'arrête où commence la navigation.** Trouver le terrain, oui ; guider
   jusqu'à lui, non — c'est le travail de Google Maps.

## Accessibility & Inclusion

- Usage en extérieur en plein jour : contraste élevé exigé sur tous les textes
  et sur les éléments de carte, au-delà du minimum réglementaire.
- Manipulation à une main sur mobile : les actions principales doivent rester
  atteignables au pouce.
- Bilingue FR/EN : les libellés doivent supporter des longueurs variables sans
  casser la mise en page.
