# SIG Web 2D/3D du campus de l’EHTP

Projet académique de géoportail consacré au campus de l’École Hassania des Travaux Publics.

L’application associe une carte 2D avec **OpenLayers**, une visualisation 3D avec **CesiumJS** et des couches géographiques publiées avec **GeoServer**. Elle rassemble des données sur les bâtiments, les équipements et les espaces du campus.

> Cette version est un prototype académique. Certaines fonctionnalités nécessitent une configuration locale et une validation complémentaire.

## Objectifs

- Centraliser les données géographiques du campus.
- Faciliter la consultation des bâtiments et des infrastructures.
- Proposer des représentations complémentaires en 2D et en 3D.
- Interroger les informations associées aux objets géographiques.
- Intégrer des outils de mesure, de recherche et d’export.

## Fonctionnalités

### Cartographie 2D

- Affichage d’un fond OpenStreetMap.
- Superposition des couches du campus via les services WMS de GeoServer.
- Activation et désactivation des couches.
- Navigation par zoom et déplacement.
- Consultation des attributs par clic avec des requêtes GetFeatureInfo.

### Visualisation 3D

- Affichage d’une scène avec CesiumJS.
- Chargement d’un jeu de données local au format 3D Tiles.
- Navigation autour des modèles.
- Cadrage de la scène sur le jeu de données chargé.

Le jeu de données comprend un fichier `tileset.json` et cinq fichiers `.b3dm`.

### Mesures

- Dessin de lignes pour mesurer des distances.
- Dessin de polygones pour mesurer des superficies.
- Affichage des résultats.
- Effacement des dessins de mesure.

Les calculs actuels utilisent une projection en Web Mercator :
les résultats doivent être considérés comme indicatifs.

### Recherches et exports

Le code comprend des traitements pour :

- La recherche attributaire via WFS et des filtres CQL.
- La sélection spatiale par intersection.
- La recherche d’objets par couche et par nom.
- L’export PNG, PDF, GeoJSON et Shapefile.

Ces traitements restent à vérifier après nettoyage du JavaScript.
La présence d’un bouton ou d’un traitement dans le code ne constitue
pas une validation de son fonctionnement.

### Comptes de démonstration

- Pages d’inscription et de connexion.
- Stockage local des comptes dans le navigateur.
- Session de démonstration avec expiration.
- Adaptation de certains éléments de l’interface selon le rôle.

Cette gestion des comptes est uniquement pédagogique :
elle ne fournit pas une authentification sécurisée côté serveur.

## Données géographiques

Le projet contient les couches suivantes :

| Couche | Contenu |
|---|---|
| `Batiments` | Bâtiments du campus |
| `Direction` | Direction |
| `Centre_Conference` | Centre de conférence |
| `Classes_Départements` | Classes et départements |
| `Laboratoires` | Laboratoires |
| `Espaces_Verts` | Espaces verts |
| `Parking` | Parkings |
| `Restaurant` | Restaurant |
| `SalleEtude` | Salle d’étude |
| `Mosquée` | Mosquée |
| `Terrains` | Terrains |
| `Voirie` | Voirie du campus |

Les couches sont fournies sous forme de shapefiles.

Pour chaque couche, conserver ensemble les fichiers associés :
`.shp`, `.shx`, `.dbf`, `.prj` et `.cpg` lorsqu’il existe.

Le projet QGIS `Sig_web.qgz` et les styles SLD accompagnent les données.

## Technologies utilisées

| Technologie | Utilisation |
|---|---|
| HTML et CSS | Structure et présentation |
| JavaScript | Interactions et logique cartographique |
| OpenLayers | Carte 2D |
| CesiumJS | Visualisation 3D |
| GeoServer | Publication et interrogation des couches |
| QGIS | Projet cartographique et préparation des données |
| Proj4js | Définition des projections |
| WMS / WFS | Services cartographiques et accès aux entités |
| CQL | Filtres attributaires et spatiaux |
| 3D Tiles / B3DM | Organisation des données 3D |
| jsPDF et shp-write | Traitements d’export présents dans le code |

PostgreSQL/PostGIS figure dans le cahier des charges.
Cette archive ne fournit toutefois ni sauvegarde de base
ni scripts SQL permettant de reproduire ce composant.

## Organisation du projet

| Fichier ou dossier | Rôle |
|---|---|
| `index.html` | Interface principale et scripts intégrés |
| `script.js` | Logique cartographique supplémentaire |
| `style.css` | Styles |
| `login.html` | Page de connexion |
| `register.html` | Page d’inscription |
| `auth.js` | Gestion locale des comptes de démonstration |
| `Sig_web.qgz` | Projet QGIS |
| `Styles/` | Styles SLD |
| `tileset.json` | Description du jeu de données 3D |
| `data/` | Fichiers B3DM référencés par le tileset |
| Fichiers Shapefile | Données vectorielles du campus |

Conserver cette organisation tant que les chemins du code
et du projet QGIS n’ont pas été adaptés.

## Installation et configuration

### Prérequis

- Un navigateur prenant en charge WebGL.
- Un serveur HTTP local.
- GeoServer installé et démarré.
- Une connexion Internet pour les bibliothèques et fonds distants.
- QGIS pour consulter ou adapter le projet cartographique.

### 1. Récupérer les fichiers

Télécharger et extraire le projet.

Conserver notamment `tileset.json` et le dossier `data/`
à leurs emplacements respectifs.

### 2. Préparer les couches GeoServer

Le code cible par défaut :

```text
http://localhost:8080/geoserver/ehtp/wms
```

Dans GeoServer :

1. Créer un espace de travail nommé `ehtp`.
2. Ajouter les sources de données des couches.
3. Publier les couches avec les noms attendus par le code.
4. Vérifier leur système de coordonnées à partir des fichiers `.prj`.
5. Vérifier leur emprise.
6. Importer et associer les styles SLD si nécessaire.
7. Vérifier la disponibilité des services WMS et WFS.

Si GeoServer utilise une autre adresse, adapter les références
dans `index.html` et `script.js`.

Si le frontend et GeoServer sont servis depuis des origines différentes,
configurer les accès CORS ou un proxy adapté.

### 3. Vérifier les champs des couches

Les recherches utilisent notamment le champ `Nom`.
Les requêtes spatiales font référence à une propriété géométrique.

Vérifier ces noms dans les couches publiées et adapter les requêtes
s’ils diffèrent du schéma réel.

### 4. Configurer Cesium

Remplacer les jetons personnels présents dans le code par une
configuration adaptée à votre environnement.

Un jeton utilisé côté navigateur reste visible par les visiteurs :
limiter ses permissions et ses conditions d’utilisation.

### 5. Démarrer le serveur web local

Depuis le dossier contenant `index.html`, avec Python installé :

```bash
python -m http.server 8000
```

Ouvrir ensuite :

```text
http://localhost:8000/login.html
```

Utiliser uniquement des identifiants fictifs pour les comptes
de démonstration.

Aucune installation npm n’est nécessaire pour cette version.

## Dépendances externes

Le dépôt ne contient pas une installation complète de GeoServer
ni sa configuration de publication.

Pour reproduire la carte 2D, il faut publier les couches ou adapter
les URL vers un serveur existant.

Les données 3D sont incluses localement, mais leur affichage dépend
également du chargement correct de CesiumJS et de la configuration
de la scène.

Publier le frontend seul ne rend pas un GeoServer accessible
sur `localhost` disponible aux autres visiteurs.


## Compétences mobilisées

- Développement d’interfaces SIG Web.
- Intégration de services WMS et WFS.
- Configuration de couches et styles cartographiques.
- Manipulation de données vectorielles.
- Requêtes attributaires et spatiales.
- Visualisation de données 3D dans le navigateur.
- Articulation entre QGIS, GeoServer, OpenLayers et CesiumJS.

## Contexte

Projet académique consacré à la mise en place d’un SIG Web 2D/3D
pour le campus de l’École Hassania des Travaux Publics.
