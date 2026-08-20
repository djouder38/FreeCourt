-- FreeCourt — seed : 15 terrains dans le monde + quelques avis de démo.
-- Les spots "iconic" sont pré-validés et verrouillés par la communauté.

INSERT INTO courts (name, lat, lng, description, surface, condition, traffic, status, validation_count, locked) VALUES
  ('Rucker Park', 40.829640, -73.936140, 'LE playground mythique de Harlem. Des légendes NBA y ont joué, ambiance garantie l''été.', 'concrete', 'good', 'iconic', 'validated', 5, true),
  ('The Cage — West 4th', 40.731210, -74.000550, 'Le terrain grillagé de Greenwich Village. Petit, physique, du très haut niveau de streetball.', 'concrete', 'good', 'iconic', 'validated', 5, true),
  ('Venice Beach Courts', 33.985030, -118.469600, 'Les terrains face au Pacifique. Dunks, soleil et show permanent.', 'concrete', 'good', 'iconic', 'validated', 5, true),
  ('Playground Duperré', 48.882240, 2.332290, 'Le terrain arc-en-ciel de Pigalle, coincé entre deux immeubles. Le plus instagrammé d''Europe.', 'synthetic', 'good', 'iconic', 'validated', 5, true),
  ('Arpoador Court', -22.988650, -43.191430, 'Jouer au coucher du soleil entre Ipanema et Copacabana. Unique.', 'concrete', 'average', 'iconic', 'validated', 5, true),
  ('Playground de Bercy', 48.838040, 2.382600, 'Terrains couverts sous le métro aérien, parfait quand il pleut.', 'synthetic', 'good', 'busy', 'validated', 5, true),
  ('Tête d''Or Playground', 45.777200, 4.855800, 'Dans le grand parc de Lyon. Beaucoup de monde le week-end.', 'concrete', 'good', 'busy', 'validated', 5, false),
  ('Prado Beach Court', 43.261000, 5.370700, 'Face à la mer à Marseille. Vent parfois traître, ambiance toujours bonne.', 'concrete', 'average', 'busy', 'validated', 5, false),
  ('Mauerpark Court', 52.543300, 13.402200, 'Au cœur du parc le plus vivant de Berlin. Pick-up games tous les soirs d''été.', 'concrete', 'average', 'busy', 'validated', 5, false),
  ('Yoyogi Park Court', 35.671200, 139.694900, 'Terrain très propre à côté de Harajuku. Niveau sérieux le dimanche.', 'synthetic', 'good', 'busy', 'validated', 5, false),
  ('Bondi Beach Courts', -33.889400, 151.277700, 'Les terrains au-dessus de la plage. Vue incroyable.', 'concrete', 'good', 'busy', 'validated', 5, false),
  ('Ciutadella Court', 41.388600, 2.187500, 'Petit terrain tranquille dans le parc de la Ciutadella.', 'concrete', 'average', 'quiet', 'draft', 2, false),
  ('Clapham Common Courts', 51.461300, -0.144000, 'Terrains ouverts sur la pelouse de Clapham. Calme en semaine.', 'concrete', 'average', 'quiet', 'draft', 3, false),
  ('Terrain de la Glacière', 48.830500, 2.345000, 'Playground de quartier dans le 13e, rarement blindé.', 'concrete', 'degraded', 'quiet', 'draft', 1, false),
  ('Barra Beach Court', -23.010800, -43.365900, 'Terrain de sable sur la plage de Barra da Tijuca. Le basket pieds nus, ça se mérite.', 'sand', 'average', 'quiet', 'draft', 2, false);

-- Quelques avis pour donner vie aux fiches
INSERT INTO court_reviews (court_id, rating, text, helpful_count)
SELECT id, 5, 'Le pèlerinage obligatoire. L''ambiance un samedi d''été est irréelle.', 12 FROM courts WHERE name = 'Rucker Park';
INSERT INTO court_reviews (court_id, rating, text, helpful_count)
SELECT id, 4, 'Niveau très relevé, viens chaud ou viens regarder.', 7 FROM courts WHERE name = 'Rucker Park';
INSERT INTO court_reviews (court_id, rating, text, helpful_count)
SELECT id, 5, 'Le plus beau terrain du monde, point.', 9 FROM courts WHERE name = 'Playground Duperré';
INSERT INTO court_reviews (court_id, rating, text, helpful_count)
SELECT id, 3, 'Magnifique mais souvent squatté par les photographes…', 5 FROM courts WHERE name = 'Playground Duperré';
INSERT INTO court_reviews (court_id, rating, text, helpful_count)
SELECT id, 5, 'Dunker face à l''océan. Rien à ajouter.', 8 FROM courts WHERE name = 'Venice Beach Courts';
INSERT INTO court_reviews (court_id, rating, text, helpful_count)
SELECT id, 4, 'Parfait l''été, pense à venir tôt pour avoir un panier.', 3 FROM courts WHERE name = 'Tête d''Or Playground';
INSERT INTO court_reviews (court_id, rating, text, helpful_count)
SELECT id, 4, 'Sous le métro = au sec toute l''année. Le spot pluie de Paris.', 6 FROM courts WHERE name = 'Playground de Bercy';
INSERT INTO court_reviews (court_id, rating, text, helpful_count)
SELECT id, 2, 'Sol fissuré et un panier tordu, mais on est entre nous.', 2 FROM courts WHERE name = 'Terrain de la Glacière';
