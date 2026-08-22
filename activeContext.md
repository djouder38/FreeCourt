# Contexte actif — FreeCourt

## État au 2026-08-22

Prod en ligne et à jour : **https://free-court-ebon.vercel.app**
Dernier commit déployé : `9b2ef43`. Dépôt propre, rien en attente.
Version 0.6.0. Supabase `freecourt` (eu-west-3), 16 terrains en base.

## ⏭️ À REPRENDRE ICI

**Finir l'identité visuelle.** La refonte « béton et marquage » du 21/08 a
livré la matière, la palette et la typo, mais deux chantiers annoncés ce
jour-là restent ouverts. Ce sont les deux prochaines choses à faire :

1. **Les formes.** Tout est encore arrondi (46 `rounded-full` au départ).
   La tension prévue par le monde visuel — dalle à angles francs pour les
   surfaces, marquage arrondi pour les actions — n'est pas appliquée. En
   l'état, les formes ne disent rien.
2. **La hiérarchie typographique.** Tout vit entre 11 et 16px. Big Shoulders
   Display a été choisie pour son caractère de signalétique : sans grands
   écarts de taille, elle ne sert à rien et la page reste plate.

Théo n'a pas donné de verdict explicite sur le monde visuel lui-même, mais
il ne l'a pas remis en cause après l'avoir vu — il a enchaîné sur des
corrections ciblées. À confirmer avant d'aller plus loin.

## Fait le 2026-08-22

- **Audit de contraste sérieux** : 4 écrans × 2 thèmes, là où la veille je
  n'avais vérifié que l'accueil. 7 échecs trouvés, dont deux à 1.06 et 1.79
  causés par la suppression des transparences (un texte d'aide en gris resté
  sur un bouton devenu bleu plein). Tout est corrigé, y compris l'attribution
  de la carte qui traînait l'ancien thème sombre en dur.
- **Bandeau des terrains** : il passait sous la tab bar sur les téléphones à
  encoche. Les positions en dur ignoraient `env(safe-area-inset-bottom)`.
  Remplacées par `--tabbar-h` / `--strip-h`, vérifiées avec 34px simulés.
- **Sélecteur de langue** ramené à deux drapeaux dessinés en SVG (Windows
  n'affiche pas les emoji drapeaux ; `aria-label` porte le nom de la langue).
- **Page de présentation** `/decouvrir` : affichée au premier lancement puis
  plus jamais, accessible depuis le profil. Le principe de contribution y
  est expliqué en quatre étapes illustrées par les vrais marqueurs de l'app.

## Reste ouvert (par ordre d'impact)

1. Les deux chantiers du monde visuel ci-dessus.
2. **Bottom sheet sans sortie explicite** : ni bouton, ni Échap, seulement un
   glissement que rien n'annonce. Inatteignable au clavier.
3. **Actions irréversibles** : validations, avis et votes n'ont ni
   confirmation ni retour arrière, et restent anonymes. C'est le vrai
   argument produit pour brancher l'auth.
4. **Chunk Home à 829 Ko** (maplibre-gl non code-splitté), sur une app qu'on
   ouvre dehors en 4G.
5. **Pluriels anglais figés** (« 1 reviews ») : ~30 lignes.
6. v1 auth + statuts contributeurs réels (structure dormante dans
   `stores/user.js`).

## Décisions actées

- **Impeccable fait autorité sur le design**, pas la spec d'origine
  (`freecourt-claude-code-prompt.md`), qui reste la référence produit.
- **Monde visuel « béton et marquage »** : le béton est gris jamais crème ;
  la couleur est de la peinture et couvre (aucun aplat translucide pour
  fabriquer un état) ; l'interface est le terrain (bleu) et les terrains
  sont le ballon (orange).
- **Jamais d'emoji** : tout passe par `components/ui/Icon.vue`.
- Polices : Archivo (corps) + Big Shoulders Display (display).
- Toute chaîne visible passe par `src/i18n/`. Les noms de statut (Rookie,
  Baller, Legend) ne se traduisent pas : vocabulaire basket.
- Vocabulaire des états : deux mots, « À vérifier » et « Validé ».
- La présentation ne s'affiche qu'une fois : le joueur pressé ne doit pas la
  retraverser à chaque ouverture.

## Pièges connus (ne pas rediagnostiquer)

- Quand le panneau navigateur n'est pas affiché, **rien n'est composité** :
  transitions CSS, `easeTo`/`flyTo` et l'event `load` de MapLibre ne se
  déclenchent pas, et les captures échouent. Neutraliser la transition ou
  espionner l'appel plutôt que conclure à un bug.
- **Vérifier les contrastes sur TOUS les écrans**, pas seulement l'accueil :
  c'est ce qui m'a fait manquer 7 échecs le 21/08.
- Après beaucoup d'éditions, le serveur de dev peut servir un module périmé
  (« does not provide an export named … ») : vider `node_modules/.vite` et
  redémarrer. Le build de prod n'est pas affecté.
- MapLibre écrase l'`aria-label` des marqueurs : le reposer APRÈS `addTo`.
- `VITE_SUPABASE_URL` contient `/rest/v1` côté Vercel ; le code le tolère.
- Ne jamais lancer de regex globale sur les espaces dans un `.vue` : ça
  aplatit l'indentation de tout le fichier.
- Ne pas insérer de texte français dans un `.js` depuis la ligne de commande :
  apostrophes et retours à la ligne ne survivent pas. Générer le code depuis
  des données (`JSON.stringify`) ou passer par un fichier.

## Comment vérifier

```bash
npm run dev                                          # serveur local
node .claude/skills/impeccable/scripts/detect.mjs src  # détecteur design
npm run build                                        # build de prod
```

Le skill Impeccable est installé en scope projet (`.claude/skills/`,
gitignoré) avec ses hooks actifs. Le réinstaller si besoin :
`npx impeccable install --providers=claude --scope=project`.
Deux critiques archivées dans `.impeccable/critique/` (17/40 puis 30/40).

## En attente de Théo

- Son verdict sur le monde visuel « béton et marquage ».
- Un terrain nommé « test » traîne en base, créé par lui pendant ses essais.
  Je ne l'ai pas supprimé.
- Sa limite de dépense mensuelle a sauté une fois le 21/08, ce qui a tué un
  sous-agent en pleine critique. Les critiques tournent depuis en contexte
  unique (mode dégradé, signalé dans le rapport).
