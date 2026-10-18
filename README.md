# Opalis Solaire

Site statique, sans framework et sans dépendance à installer. La racine du site et du dépôt Git est ce dossier `site web`.

## Aperçu local

Avec Node.js 18 ou plus récent :

```sh
npm run dev
```

Ouvrir `http://127.0.0.1:4173`. Les URL sans extension fonctionnent aussi dans l’aperçu. Le fichier `index.html` reste consultable directement ; le formulaire nécessite JavaScript et un accès au webhook existant.

## Pages et parcours

- `index.html` : accueil, orientation par besoin, rendu des teintes, avant/après et contact.
- `particuliers.html` : accompagnement pour maisons et appartements.
- `commerces.html` : parcours boutiques et vitrines, anti-éclats et protection renforcée.
- `professionnels.html` : solutions pour bureaux, bâtiments et applications spécifiques.
- `film-securite-vitrage.html` : anti-éclats, protection renforcée, étude et pose.
- `film-securite-vitrage-maison.html` : solutions pour sécuriser les fenêtres d’une maison et comparer film, fermeture, vitrage et grille.
- `film-anti-effraction-vitrine-commerce.html` : protection des vitrines professionnelles, niveaux de réponse, démonstration vidéo et guide fabricant.
- `mise-en-securite-vitrage-casse.html` : mise en sécurité provisoire d’un vitrage endommagé avec un film adhésif de maintien, avant son remplacement.
- `film-anti-graffiti-vitrage.html` : protection de surface, entretien et remplacement.
- Les cinq anciennes pages de conseil, les six fiches chantier, le portfolio, le simulateur et la présentation juridique sont harmonisés avec la nouvelle identité.
- `efficacite-film-solaire.html`
- `combiner-film-solaire-et-securite-vitrage.html`
- `film-solaire-double-vitrage-compatibilite.html`
- `film-anti-uv-maison-proteger-meubles-parquet.html` : guide sur la filtration UV et la protection des meubles, tissus et parquets exposés.
- `projet-films-solaires-baies-maison.html` : chantiers de films solaires sur baies vitrées de maisons.
- `projet-vitrines-valence-lyon.html` : protections de vitrines de commerces à Valence et Lyon.
- `projet-facade-vitree-film-solaire.html` : film solaire posé sur une façade vitrée.

Le positionnement est celui d’un installateur : diagnostic, conseil, fourniture et pose d’une solution. Les références fabricant ne sont que des exemples et les données détaillées restent secondaires dans le parcours.

## Modifier le site

Les pages HTML sont éditables directement. `opalis.css` et `opalis.js` portent la nouvelle identité et les interactions communes. `pro.css` / `pro.js` complètent les pages de service. `main.js` conserve les filtres et comparateurs des réalisations et fiches chantier.

Modifier le menu et le footer dans `templates/header.html` et `templates/footer.html`, puis synchroniser toutes les pages :

```sh
node scripts/sync-layout.mjs
```

Après une modification de titre, description ou FAQ, actualiser les données SEO à partir du contenu réel (Python 3 standard) :

```sh
npm run seo
```

Le build synchronise les éléments communs et le sitemap. Les URL canoniques et le sitemap suivent la convention Vercel `cleanUrls`. Aucun faux `lastmod`, avis ou résultat chiffré n’est généré.

```sh
npm run build
npm run check
```

## Sources, images et mesures

Voir `docs/sources-fournisseur.md` pour l’inventaire des visuels et données Solar Screen vérifiés. La brochure de sécurité fournie par le client est disponible au téléchargement sur les pages de sécurité ; ses photos restent des visuels du fournisseur, pas des références de chantier Opalis.

Le comparateur présente un rendu d’ambiance, pas une simulation physique ou photométrique. Ses exemples chiffrés portent tous sur un simple vitrage clair de 3 mm et ne donnent pas un gain en degrés ni en euros. Les films anti-haute fréquence ne sont pas présentés comme acoustiques. Les normes de sécurité restent rattachées aux systèmes et configurations testés.

Les photos de chantier fournies par Opalis sont conservées dans `assets-images`. Les variantes optimisées utilisées sur le site se trouvent dans `site web/assets`, avec les retouches de film demandées pour les sept nouvelles vues.

La section documentation comprend les sources et démonstrations du fournisseur ainsi qu’un emplacement pour les futures études et vidéos Opalis. Pour ajouter une étude, renseigner le document réel, son périmètre, la référence concernée et les conditions de mesure.

## Formulaires et vérifications

L’adresse du webhook n8n et le contrat de données existants sont conservés. Le formulaire ne confirme l’envoi qu’après une réponse HTTP réussie ; en cas d’erreur il conserve les saisies et permet un nouvel essai. Les paramètres `profil`, `lieu`, `besoin`, `vitrage` et `objectif` préparent la demande depuis les pages de service.

Les tests utilisent un transport simulé : ils ne créent aucun prospect sur le webhook réel. Ils couvrent succès, HTTP 500, panne réseau, délai dépassé, double clic, validation, calcul de surface et préremplissage boutique, véranda et fenêtre de toit. `scripts/check-site.py` vérifie également les fichiers, ancres, métadonnées, JSON-LD et la syntaxe JavaScript. L’outil local `scripts/responsive-preview.html` permet d’observer les pages dans des cadres de 320, 390, 768 et 1024 px.

Le dépôt GitHub existant est conservé. Aucun push ou déploiement n’est effectué automatiquement par les scripts locaux.
