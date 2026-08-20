# FreeCourt — Prompt Claude Code

## 🎯 MISSION
Tu vas construire **FreeCourt**, une web app communautaire permettant de localiser, ajouter et noter des terrains de basket à travers le monde. L'app est pensée **mobile-first** (80% usage mobile) avec une expérience desktop soignée. Tu travailles en **autonomie complète** : initialise, code, connecte les services, déploie. Ne demande pas de validation à chaque étape — avance et livre.

---

## 🏗️ STACK TECHNIQUE

- **Frontend**: Vue 3 + Vite
- **Styling**: Tailwind CSS
- **Carte**: Mapbox GL JS (style Dark custom)
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage)
- **Déploiement**: Vercel via GitHub
- **State management**: Pinia

---

## 📁 STRUCTURE DU PROJET

```
freecourt/
├── src/
│   ├── components/
│   │   ├── map/
│   │   │   ├── MapView.vue          # Carte Mapbox principale
│   │   │   ├── CourtMarker.vue      # Icône terrain dynamique (SVG)
│   │   │   ├── CourtPopup.vue       # Popup clic terrain
│   │   │   └── AddCourtPin.vue      # Mode "pin ton terrain"
│   │   ├── court/
│   │   │   ├── CourtCard.vue        # Fiche terrain (bottom sheet mobile)
│   │   │   ├── CourtForm.vue        # Formulaire ajout/édition
│   │   │   ├── CourtPhotos.vue      # Galerie 3 photos max
│   │   │   ├── CourtRating.vue      # Système 1-5 étoiles + vote utile
│   │   │   └── CourtBadges.vue      # Icônes état/revêtement/fréquentation
│   │   ├── community/
│   │   │   ├── ValidationPanel.vue  # Valider existence + infos d'un terrain
│   │   │   ├── FlagIssue.vue        # Signaler un problème
│   │   │   └── ContributorBadge.vue # Badge Rookie → Legend
│   │   └── ui/
│   │       ├── TabBar.vue           # Navigation mobile (tab bar ronds)
│   │       ├── BottomSheet.vue      # Bottom sheet réutilisable
│   │       ├── Mascot.vue           # Mascotte ballon/panier cartoon
│   │       └── StatusChip.vue       # Draft / Validated / À vérifier
│   ├── pages/
│   │   ├── Home.vue                 # Carte principale (vue par défaut)
│   │   ├── CourtDetail.vue          # Page détail terrain
│   │   ├── AddCourt.vue             # Flow ajout terrain
│   │   └── Profile.vue              # Profil + stats contributeur
│   ├── stores/
│   │   ├── courts.js                # State terrains + CRUD Supabase
│   │   ├── map.js                   # State carte (zoom, center, mode)
│   │   └── user.js                  # Auth + statut contributeur
│   └── services/
│       ├── supabase.js              # Client + helpers
│       └── mapbox.js               # Config + style custom Dark
```

---

## 🗄️ SUPABASE — SCHÉMA COMPLET

Créer ces tables avec Row Level Security activé:

```sql
-- Profils contributeurs
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  pseudo text NOT NULL,
  avatar_url text,
  status text DEFAULT 'rookie' CHECK (status IN ('rookie','regular','baller','legend')),
  contribution_score int DEFAULT 0,
  courts_added int DEFAULT 0,
  validations_done int DEFAULT 0,
  joined_at timestamp DEFAULT now()
);

-- Terrains
CREATE TABLE courts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  lat float NOT NULL,
  lng float NOT NULL,
  description text,
  surface text CHECK (surface IN ('concrete','parquet','synthetic','sand')),
  condition text CHECK (condition IN ('good','average','degraded')),
  traffic text CHECK (traffic IN ('quiet','busy','iconic')),
  status text DEFAULT 'draft' CHECK (status IN ('draft','validated','flagged')),
  validation_count int DEFAULT 0,
  locked boolean DEFAULT false,
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Photos (max 3 par terrain)
CREATE TABLE court_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid REFERENCES courts(id) ON DELETE CASCADE,
  url text NOT NULL,
  uploaded_by uuid REFERENCES user_profiles(id),
  created_at timestamp DEFAULT now()
);

-- Avis
CREATE TABLE court_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid REFERENCES courts(id) ON DELETE CASCADE,
  rating int CHECK (rating BETWEEN 1 AND 5),
  text text,
  helpful_count int DEFAULT 0,
  author_id uuid REFERENCES user_profiles(id),
  created_at timestamp DEFAULT now()
);

-- Validations communauté
CREATE TABLE court_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid REFERENCES courts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id),
  type text CHECK (type IN ('existence','info_correct','flag_issue')),
  note text,
  created_at timestamp DEFAULT now(),
  UNIQUE(court_id, user_id) -- 1 validation par user par terrain
);
```

**Règle de verrouillage** : quand `validation_count >= 5`, passer `locked = true`. Un terrain locked ne peut plus être supprimé ni modifié par son créateur — seulement par un compte `legend` ou admin.

---

## 🎮 SYSTÈME DE CONTRIBUTION

### Statuts et droits

| Statut | Score | Quota ajout | Droits |
|--------|-------|-------------|--------|
| Rookie | 0 | 2 terrains/semaine | Ajouter, valider |
| Regular | 50 | 5 terrains/semaine | + Modifier ses terrains non-lockés |
| Baller | 200 | 10 terrains/semaine | + Modifier tout terrain non-locké |
| Legend | 500 | Illimité | + Modération, validation sans admin |

### Scoring (auto-calculé)
- +10 terrain ajouté et validé
- +2 par validation effectuée
- +5 par avis posté
- +1 par vote "utile" reçu sur un avis

---

## 🗺️ CARTE MAPBOX — STYLE CUSTOM

Style de base: `mapbox://styles/mapbox/dark-v11`

Overrides custom à appliquer:
```json
{
  "background-color": "#0f0f0f",
  "road-color": "#1a1a2e",
  "road-minor-color": "#16213e",
  "building-color": "#1a1a2e",
  "water-color": "#0d1117",
  "text-color": "#e0e0e0",
  "text-halo-color": "#0f0f0f"
}
```

Accents: orange `#FF6B2B` pour les éléments FreeCourt (boutons, markers actifs, highlights).

### Markers terrains (SVG dynamique)
Chaque marker est un SVG généré selon les attributs du terrain :

- **Forme de base**: cercle avec icône ballon de basket
- **Couleur contour** selon `condition`:
  - `good` → vert `#22C55E`
  - `average` → orange `#F59E0B`
  - `degraded` → rouge `#EF4444`
- **Icône intérieure** selon `surface`:
  - `concrete` → texture béton
  - `parquet` → bois clair
  - `synthetic` → lignes stylisées
  - `sand` → points granuleux
- **Badge fréquentation** selon `traffic`:
  - `quiet` → pas de badge
  - `busy` → badge flame 🔥
  - `iconic` → badge étoile ⭐
- **Opacité réduite** pour les terrains en `draft`

---

## 📱 UX MOBILE — PRIORITÉ

### Vue principale (Home)
```
┌─────────────────────────┐
│                         │
│      CARTE MAPBOX       │
│       (full screen)     │
│                         │
│  ●filtres           ●ma position  │  ← ronds flottants, bordure orange
│                         │
│       [🏀 AJOUTER]      │  ← bouton central floating, orange, arrondi
│                         │
└─────────────────────────┘
│  🏀  🔍  👤            │  ← tab bar, fond sombre, icônes ronds
└─────────────────────────┘
```

### Détail terrain (Bottom Sheet)
- Swipe up depuis le bas après clic sur un marker
- Hauteur: 40% → 90% selon swipe
- Contenu: nom, badges, photos, rating, avis, bouton valider

### Desktop
- Sidebar gauche (320px) : liste terrains / détail terrain
- Carte : reste droite, full height
- Même palette, même ambiance

---

## ➕ FLOW AJOUT TERRAIN

1. Utilisateur appuie sur **[🏀 AJOUTER]**
2. La carte passe en **mode pin** (curseur crosshair, overlay semi-transparent, instruction "Tape sur la carte pour placer ton terrain")
3. Il tape sur la carte → un pin orange apparaît, draggable pour ajuster
4. **En parallèle**: un champ de recherche d'adresse apparaît en haut (optionnel, secondaire) — si utilisé, la carte se centre et place le pin automatiquement
5. Il confirme → formulaire slide up:
   - Nom du terrain *
   - Type de surface (selector visuel)
   - État (selector visuel)
   - Fréquentation (selector visuel)
   - Description (optionnel)
6. Il soumet → terrain créé en `draft`, apparaît sur la carte (semi-transparent)
7. Toast de confirmation avec mascotte 🏀

---

## 🎨 DESIGN SYSTEM

### Identité visuelle
- **Ambiance**: Street ball, béton, rétro NBA Playground — mais app moderne et propre. Pas de vibe-coding.
- **Police**: Une police display bold pour les titres (ex: `Bebas Neue` ou `Black Han Sans`), `Inter` pour le corps
- **Couleurs**:
  - Background: `#0f0f0f`
  - Surface: `#1a1a1a`
  - Card: `#242424`
  - Accent principal: `#FF6B2B` (orange basketball)
  - Accent secondaire: `#FFD700` (or NBA)
  - Text primary: `#FFFFFF`
  - Text secondary: `#9CA3AF`
  - Success: `#22C55E`
  - Warning: `#F59E0B`
  - Error: `#EF4444`

### Mascotte
Créer un petit personnage SVG inline: un ballon de basket avec des yeux et des petits bras. Utilisé dans:
- Écran de chargement
- Toast de confirmation ajout terrain
- Page 404
- Page profil vide

### Composants UI
- Boutons: arrondis (`border-radius: 9999px`), bold, uppercase pour les CTA
- Cards: fond `#242424`, border subtil `1px solid #333`, shadow légère
- Inputs: fond `#1a1a1a`, border `#333`, focus ring orange
- Bottom sheet: fond `#1a1a1a`, pill handle en haut, coins arrondis

---

## 📦 LIVRABLES ATTENDUS

- ✅ App Vue 3 complète et fonctionnelle
- ✅ Toutes les tables Supabase créées avec RLS
- ✅ Carte Mapbox avec style custom Dark et markers dynamiques
- ✅ Flow ajout terrain complet (pin + formulaire)
- ✅ Système de validation communauté
- ✅ Système de statuts contributeurs (Rookie → Legend)
- ✅ Gestion photos (upload Supabase Storage)
- ✅ Avis + vote utile
- ✅ Responsive mobile-first + desktop sidebar
- ✅ 15 terrains de seed data répartis sur plusieurs villes
- ✅ `.env.example` avec toutes les variables
- ✅ `README.md` avec instructions setup complet

---

## ⚙️ VARIABLES D'ENVIRONNEMENT

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_MAPBOX_TOKEN=
```

---

## 🚫 CONTRAINTES

- Pas de dépendances inutiles — keep it lean
- Lazy loading des images systématique
- Gestion des états loading / error / empty sur chaque vue
- Mobile first: tester chaque composant en 375px d'abord
- Code clean, composants réutilisables, pas de logique dans les templates
- Commentaires en français sur les parties complexes
- Auth Google/email: **ne pas implémenter maintenant** — préparer juste la structure (store user.js vide avec les méthodes login/logout en placeholder)
- Pas de CSS inline — Tailwind uniquement

---

## 🚀 ORDRE D'EXÉCUTION

1. Init projet Vue 3 + Vite + Tailwind + Pinia + Vue Router
2. Setup Supabase (tables + RLS + Storage bucket `court-photos`)
3. Setup Mapbox + style custom Dark
4. Composants UI de base (BottomSheet, TabBar, StatusChip, Mascot)
5. MapView + CourtMarker dynamique
6. Flow ajout terrain (bouton → pin → formulaire → submit)
7. Détail terrain (CourtCard + bottom sheet)
8. Photos + upload Storage
9. Avis + rating
10. Système validation communauté
11. Système statuts contributeurs (score + upgrade auto)
12. Page Profil
13. Seed data (15 terrains)
14. Responsive desktop (sidebar)
15. README + .env.example
16. Deploy Vercel
