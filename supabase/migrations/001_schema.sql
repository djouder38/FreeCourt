-- FreeCourt — schéma initial (spec 2026-08-20)

-- Profils contributeurs (dormant tant que l'auth n'est pas branchée)
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

-- Photos (3 max par terrain, borné par trigger)
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
  UNIQUE(court_id, user_id) -- 1 validation par user par terrain (les NULL anonymes passent)
);

CREATE INDEX idx_courts_position ON courts (lat, lng);
CREATE INDEX idx_photos_court ON court_photos (court_id);
CREATE INDEX idx_reviews_court ON court_reviews (court_id);
CREATE INDEX idx_validations_court ON court_validations (court_id);
