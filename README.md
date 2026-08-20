# 🏀 FreeCourt

Web app communautaire pour localiser, ajouter et noter des terrains de basket
à travers le monde. Mobile-first, ambiance street ball dark.

## Stack
- Vue 3 + Vite + Tailwind CSS 4 + Pinia + Vue Router
- Carte : MapLibre GL + tuiles vectorielles OpenFreeMap (style dark custom)
- Backend : Supabase (PostgreSQL + RLS + Storage), projet `freecourt`
- Déploiement : Vercel via GitHub (`djouder38/freecourt`)

## Lancer en local

```bash
npm install
```

Copier `.env.example` en `.env` et remplir avec les valeurs du dashboard
Supabase (Settings → API), puis :

```bash
npm run dev
```

## Base de données
Le schéma complet est versionné dans `supabase/migrations/` (tables, RLS,
triggers, bucket Storage) et le seed dans `supabase/seed.sql` (15 terrains).
Les migrations sont déjà appliquées sur le projet Supabase `freecourt`.

## Fonctionnement (phase sans auth)
- Consultation, ajout de terrain, avis, photos et validations sont ouverts
  à tous (RLS permissive documentée dans `002_rules_and_rls.sql`).
- Un terrain naît en `draft` ; à 5 validations communautaires il passe
  `validated` + `locked` (trigger SQL).
- L'auth (Google/email) et les statuts contributeurs Rookie → Legend sont
  structurés dans `src/stores/user.js` mais volontairement non branchés.

## Build

```bash
npm run build
```
