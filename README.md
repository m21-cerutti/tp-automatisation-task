# TP : Tests E2E, Conteneurisation et CI/CD

## Contexte

Vous intégrez une équipe DevOps en tant que testeur. L\'équipe de
développement vous fournit une application web de gestion de tâches
**TaskFlow** développée en Node.js/Express.

L\'application dispose déjà de :

-   Une API REST CRUD complète
-   Une interface utilisateur moderne
-   Des tests unitaires (Jest + Supertest)

**Votre mission** : Compléter la chaîne de qualité en ajoutant des tests
E2E, conteneuriser l\'application et mettre en place une pipeline CI/CD.

------------------------------------------------------------------------

## Objectifs

À l\'issue de ce TP, vous serez capable de :

-   Écrire des tests End-to-End avec Selenium WebDriver
-   Créer un Dockerfile multi-stage optimisé
-   Concevoir une pipeline CI/CD avec GitHub Actions
-   Intégrer des outils d\'analyse de sécurité (bonus)

------------------------------------------------------------------------

## Prérequis

### Techniques

-   Node.js 18+ installé
-   Docker Desktop installé
-   Compte GitHub
-   Compte Docker Hub
-   Git configuré

### Connaissances

-   Bases de JavaScript
-   Notions de conteneurisation Docker
-   Compréhension des pipelines CI/CD

------------------------------------------------------------------------

## Ressources fournies

Vous recevez une archive `task-manager.zip` contenant :

    task-manager/
    ├── src/
    │   ├── app.js                 # Serveur Express
    │   ├── routes/tasks.js        # API REST
    │   └── models/taskStore.js    # Store en mémoire
    ├── public/
    │   ├── index.html             # Interface utilisateur
    │   ├── css/style.css          # Styles
    │   └── js/app.js              # Logique frontend
    ├── tests/
    │   ├── unit/                  # Tests unitaires (fournis)
    │   │   ├── taskStore.test.js
    │   │   └── api.test.js
    │   └── selenium/              # À COMPLÉTER
    │       └── .gitkeep
    ├── package.json
    └── jest.config.js

### Commandes disponibles

``` bash
npm install          # Installation des dépendances
npm start            # Démarrer l'application (port 3000)
npm test             # Lancer les tests unitaires
npm run test:selenium # Lancer les tests Selenium
```

### Fonctionnalités de l\'application

  Fonctionnalité        Description
  --------------------- ----------------------------------------------
  Créer une tâche       Formulaire avec titre, description, priorité
  Lister les tâches     Affichage de toutes les tâches
  Filtrer les tâches    Par statut (En attente, En cours, Terminées)
  Modifier une tâche    Via modal d\'édition
  Supprimer une tâche   Avec confirmation
  Statistiques          Compteurs en temps réel

------------------------------------------------------------------------

### API REST

  Méthode   Endpoint         Description
  --------- ---------------- -------------------------
  GET       /api/tasks       Liste toutes les tâches
  GET       /api/tasks/:id   Récupère une tâche
  POST      /api/tasks       Crée une tâche
  PUT       /api/tasks/:id   Met à jour une tâche
  DELETE    /api/tasks/:id   Supprime une tâche

------------------------------------------------------------------------

## Travail demandé

### Partie 1 : Tests Selenium {#partie-1--tests-selenium}

Créez le fichier `tests/selenium/tasks.selenium.test.js` contenant des
tests E2E couvrant les scénarios suivants :

-   Vous devez ecrire à minima plus de 19 tests e2e pertinents.

#### Contraintes techniques

-   Utiliser Selenium WebDriver avec Chrome en mode headless
-   Gérer correctement les waits (éviter les sleep fixes quand possible)
-   Le serveur de test doit démarrer automatiquement sur un port dédié
-   Nettoyer les données entre chaque test

### Partie 2 : Dockerfile {#partie-2--dockerfile}

Créez un `Dockerfile` multi-stage respectant les bonnes pratiques.

#### 2.1 Exigences fonctionnelles (15 points) {#21-exigences-fonctionnelles-15-points}

-   Utiliser Node.js 20 Alpine comme image de base
-   Multi-stage build (minimum 2 stages)
-   Exposer le port 3000
-   L\'application doit démarrer correctement

#### 2.2 Exigences de sécurité (10 points) {#22-exigences-de-sécurité-10-points}

-   Créer et utiliser un utilisateur non-root
-   Définir un HEALTHCHECK
-   Créer un fichier `.dockerignore` approprié
-   Ne pas copier les fichiers de test dans l\'image finale

### Partie 3 : Pipeline GitHub Actions (35 points) {#partie-3--pipeline-github-actions-35-points}

Créez le fichier `.github/workflows/ci-cd.yml` avec les jobs suivants :

#### 3.1 Job \"test-unit\" {#31-job-test-unit}

#### 3.2 Job \"test-selenium\" {#32-job-test-selenium}

#### 3.3 Job \"build\" {#33-job-build}

#### 3.4 Job \"docker\" {#34-job-docker}

#### Secrets à configurer

## Bonus

### Bonus 1 : SonarQube (7 points) {#bonus-1--sonarqube-7-points}

Ajoutez un job d\'analyse de qualité de code avec SonarCloud.

#### Travail demandé

-   Créer un compte sur [SonarCloud](https://sonarcloud.io)
-   Créer le fichier `sonar-project.properties`
-   Ajouter un job \"sonar\" dans la pipeline
-   Configurer les secrets nécessaires

#### Secrets requis

  Secret        Description
  ------------- ------------------
  SONAR_TOKEN   Token SonarCloud

#### Exemple de configuration

``` yaml
sonar:
  name: SonarQube Analysis
  runs-on: ubuntu-latest
  needs: [test-unit]
  steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    - name: SonarCloud Scan
      uses: SonarSource/sonarcloud-github-action@master
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Bonus 2 : Snyk {#bonus-2--snyk}

Ajoutez un scan de vulnérabilités des dépendances avec Snyk.

#### Travail demandé

-   Créer un compte sur [Snyk](https://snyk.io)
-   Ajouter un job \"snyk\" dans la pipeline
-   Scanner les dépendances Node.js
-   Faire échouer le build si vulnérabilités critiques

#### Secret requis

  Secret       Description
  ------------ -------------
  SNYK_TOKEN   Token Snyk

#### Exemple de configuration

``` yaml
snyk:
  name: Snyk Security Scan
  runs-on: ubuntu-latest
  needs: [test-unit]
  steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run Snyk to check for vulnerabilities
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high
```

### Bonus 3 : Trivy (7 points) {#bonus-3--trivy-7-points}

Ajoutez un scan de sécurité de l\'image Docker avec Trivy.

#### Travail demandé

-   Ajouter un job \"trivy\" après le build Docker
-   Scanner l\'image pour les vulnérabilités
-   Générer un rapport au format SARIF
-   Uploader le rapport dans l\'onglet Security de GitHub

#### Exemple de configuration

``` yaml
trivy:
  name: Trivy Image Scan
  runs-on: ubuntu-latest
  needs: [docker]
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  steps:
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: ${{ secrets.DOCKERHUB_USERNAME }}/taskflow:${{ github.run_number }}
        format: 'sarif'
        output: 'trivy-results.sarif'
        severity: 'CRITICAL,HIGH'
    
    - name: Upload Trivy scan results
      uses: github/codeql-action/upload-sarif@v3
      with:
        sarif_file: 'trivy-results.sarif'
```

## Livrables attendus

1.  **Repository GitHub** contenant :

    -   Code source complet
    -   Tests Selenium (`tests/selenium/`)
    -   Dockerfile
    -   Pipeline CI/CD (`.github/workflows/ci-cd.yml`)

2.  **Captures d\'écran** :

    -   Pipeline GitHub Actions passée (tous les jobs verts)
    -   Image Docker Hub avec les tags
    -   (Bonus) Dashboard SonarCloud
    -   (Bonus) Rapport Snyk
    -   (Bonus) Résultats Trivy

------------------------------------------------------------------------

## Modalités

-   **Durée** : 4 heures
-   **Travail** : Individuel
-   **Rendu** : Lien du repository GitHub + document de synthèse

## Conseils

1.  **Commencez par faire fonctionner l\'application en local** avant
    d\'écrire les tests
2.  **Testez votre Dockerfile localement** avant de l\'intégrer à la
    pipeline
3.  **Commitez régulièrement** pour voir la pipeline s\'exécuter
4.  **Lisez les logs des jobs qui échouent** - ils contiennent souvent
    la solution

**Bon courage !**
