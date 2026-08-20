-- FreeCourt — règles métier (triggers, RPC) + Row Level Security

-- Compteur de validations + verrouillage à 5 (règle spec) + statut flagged
CREATE OR REPLACE FUNCTION on_validation_insert() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.type = 'flag_issue' THEN
    UPDATE courts SET status = 'flagged', updated_at = now() WHERE id = NEW.court_id;
  ELSE
    UPDATE courts SET
      validation_count = validation_count + 1,
      status = CASE WHEN validation_count + 1 >= 5 THEN 'validated' ELSE status END,
      locked = CASE WHEN validation_count + 1 >= 5 THEN true ELSE locked END,
      updated_at = now()
    WHERE id = NEW.court_id;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_validation_insert
AFTER INSERT ON court_validations
FOR EACH ROW EXECUTE FUNCTION on_validation_insert();

-- 3 photos max par terrain, borné côté base
CREATE OR REPLACE FUNCTION enforce_photo_limit() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF (SELECT count(*) FROM court_photos WHERE court_id = NEW.court_id) >= 3 THEN
    RAISE EXCEPTION 'Maximum 3 photos par terrain';
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_photo_limit
BEFORE INSERT ON court_photos
FOR EACH ROW EXECUTE FUNCTION enforce_photo_limit();

-- Vote "utile" sur un avis (RPC, évite d'ouvrir UPDATE aux anonymes)
CREATE OR REPLACE FUNCTION vote_helpful(review_id uuid) RETURNS void
LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE court_reviews SET helpful_count = helpful_count + 1 WHERE id = review_id;
$$;

-- RLS. Phase sans auth (spec) : lecture publique, écritures anonymes permises
-- sur les contributions. À resserrer quand l'auth sera branchée.
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_validations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles publics en lecture" ON user_profiles FOR SELECT USING (true);

CREATE POLICY "terrains publics en lecture" ON courts FOR SELECT USING (true);
CREATE POLICY "ajout de terrain en draft" ON courts FOR INSERT
  WITH CHECK (status = 'draft' AND locked = false AND created_by IS NULL);

CREATE POLICY "photos publiques en lecture" ON court_photos FOR SELECT USING (true);
CREATE POLICY "ajout de photo" ON court_photos FOR INSERT
  WITH CHECK (uploaded_by IS NULL);

CREATE POLICY "avis publics en lecture" ON court_reviews FOR SELECT USING (true);
CREATE POLICY "ajout d'avis" ON court_reviews FOR INSERT
  WITH CHECK (author_id IS NULL AND helpful_count = 0);

CREATE POLICY "validations publiques en lecture" ON court_validations FOR SELECT USING (true);
CREATE POLICY "ajout de validation" ON court_validations FOR INSERT
  WITH CHECK (user_id IS NULL);
