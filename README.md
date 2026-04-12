# Domaine de Fuego — Site d'adoption animale

Site web complet pour l'association Domaine de Fuego, développé avec React + Vite + TailwindCSS.

## Stack technique

- **React 19** + **TypeScript**
- **Vite** (bundler)
- **TailwindCSS v3** (styles)
- **React Router v7** (navigation SPA)
- **TipTap** (éditeur WYSIWYG pour le gestionnaire de pages)
- **EmailJS** (envoi de formulaires sans backend)
- **Lucide React** (icônes)
- Données statiques en JSON (`/public/data/`)
- Back-office avec localStorage

---

## Installation locale

### Prérequis
- Node.js 18+
- npm 9+

### 1. Cloner le projet
```bash
git clone https://github.com/votre-org/domainedefuego.git
cd domainedefuego
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d'environnement
```bash
cp .env.example .env
```
Éditez `.env` avec vos vraies valeurs (voir section EmailJS ci-dessous).

### 4. Lancer le serveur de développement
```bash
npm run dev
```
Le site est accessible sur [http://localhost:5173](http://localhost:5173)

---

## Configuration EmailJS

EmailJS permet d'envoyer des emails directement depuis le navigateur, sans backend.

### Étapes

1. Créez un compte sur [emailjs.com](https://www.emailjs.com) (gratuit jusqu'à 200 emails/mois)

2. **Service** : Ajoutez un service email (Gmail, Outlook, etc.) → notez le `Service ID`

3. **Templates** : Créez 3 templates :
   - **Adoption** : Variables disponibles : `prenom`, `nom`, `email`, `telephone`, `adresse`, `code_postal`, `ville`, `type_logement`, `jardin`, `surface`, `statut_occupant`, `statut_familial`, `enfants`, `enfants_ages`, `autres_animaux`, `heures_seul`, `vacances`, `animal_souhaite`, `pourquoi_adopter`, `charte_acceptee`
   - **Famille d'accueil** : Variables similaires + `duree_disponible`, `types_acceptes`, `urgences`, `experience`
   - **Contact** : Variables : `nom`, `email`, `sujet`, `message`

4. **Clé publique** : Dans Account > API Keys → notez votre `Public Key`

5. Remplissez votre `.env` :
```env
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ADOPTION=template_xxxxxxx
VITE_EMAILJS_TEMPLATE_FA=template_xxxxxxx
VITE_EMAILJS_TEMPLATE_CONTACT=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
```

---

## Déploiement sur Netlify

### Méthode 1 — Interface Netlify (recommandée)

1. Allez sur [app.netlify.com](https://app.netlify.com) et connectez-vous

2. Cliquez **"Add new site"** → **"Import an existing project"**

3. Connectez votre dépôt GitHub et sélectionnez ce projet

4. Configuration du build :
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`

5. Ajoutez vos **variables d'environnement** dans :
   > Site settings → Environment variables

   Ajoutez toutes les variables de votre `.env` :
   - `VITE_ADMIN_PASSWORD`
   - `VITE_EMAILJS_SERVICE_ID`
   - `VITE_EMAILJS_TEMPLATE_ADOPTION`
   - `VITE_EMAILJS_TEMPLATE_FA`
   - `VITE_EMAILJS_TEMPLATE_CONTACT`
   - `VITE_EMAILJS_PUBLIC_KEY`

6. Cliquez **"Deploy site"**

Le fichier `netlify.toml` gère automatiquement les redirections SPA (toutes les URLs → index.html).

### Méthode 2 — CLI Netlify

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

---

## Structure du projet

```
domainedefuego/
├── public/
│   └── data/
│       ├── animaux.json      # Liste des animaux
│       ├── config.json       # Configuration (emails, liens, chiffres)
│       └── pages.json        # Textes des pages
├── src/
│   ├── components/           # Composants réutilisables
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Layout.tsx
│   │   ├── Logo.tsx
│   │   ├── AnimalCard.tsx
│   │   ├── FormAdoption.tsx
│   │   ├── FormFamilleAccueil.tsx
│   │   └── FormContact.tsx
│   ├── pages/                # Pages de l'application
│   │   ├── Accueil.tsx
│   │   ├── Animaux.tsx
│   │   ├── AnimalDetail.tsx
│   │   ├── Adopter.tsx
│   │   ├── FamilleAccueil.tsx
│   │   ├── FaireUnDon.tsx
│   │   ├── Contact.tsx
│   │   ├── Presentation.tsx
│   │   ├── MentionsLegales.tsx
│   │   └── admin/
│   │       ├── AdminLogin.tsx
│   │       ├── AdminLayout.tsx
│   │       ├── AdminAnimaux.tsx
│   │       ├── AdminPages.tsx
│   │       └── AdminConfig.tsx
│   ├── hooks/
│   │   └── useData.ts        # Hooks pour lire/écrire les données
│   └── types/
│       └── index.ts          # Types TypeScript
├── .env.example
├── netlify.toml
└── tailwind.config.js
```

---

## Back-office

Accédez au back-office sur `/admin`.

### Première connexion

> **Compte Super Admin par défaut :**
> - Email : `admin@domainedefuego.fr`
> - Mot de passe : `Admin1234!`
>
> **Changez ce mot de passe immédiatement** dans Administration → Utilisateurs.

### Rôles et permissions

| Rôle | Animaux | Pages | Config | Utilisateurs |
|------|---------|-------|--------|--------------|
| Super Admin | ✅ | ✅ | ✅ | ✅ |
| Administrateur | ✅ | ✅ | ✅ | ❌ |
| Éditeur | ✅ | ✅ | ❌ | ❌ |
| Bénévole | ✅ | ❌ | ❌ | ❌ |

### Fonctionnalités back-office

#### Tableau de bord (`/admin/dashboard`)
- Statistiques rapides (animaux disponibles, réservés, adoptés)
- Dernières candidatures reçues
- Animaux récemment ajoutés
- Raccourcis vers les actions fréquentes

#### Gestion des animaux (`/admin/animaux`)
- Tableau avec recherche par nom/race et filtres par statut
- Tri par date d'ajout, nom ou espèce
- **Upload de photos** directement depuis l'appareil (jusqu'à 10 photos, 2Mo max chacune — compression automatique)
- **Réorganisation** des photos (flèches), sélection de la photo principale
- **Vidéo** : lien YouTube (preview thumbnail), Instagram, ou upload MP4 direct
- Duplication d'une fiche (bouton Copier)
- Archivage = passage au statut "Adopté"

#### Gestionnaire de pages (`/admin/pages`)
- Liste de toutes les pages : système (non supprimables) + personnalisées
- Créer / modifier / supprimer / publier / dépublier des pages personnalisées
- Les pages publiées apparaissent **automatiquement dans le menu** du site
- Ordre du menu modifiable (numéro d'ordre)

#### Éditeur de page (`/admin/pages/edit/:id`)
- Champ titre (génère le slug automatiquement)
- Éditeur **WYSIWYG** (TipTap) : gras, italique, titres, listes, liens, citations
- Description SEO (meta description)
- Blocs de contenu : texte riche, image+légende, carte info, CTA, galerie, formulaire contact
- Statut : Brouillon / Publié

#### Candidatures (`/admin/candidatures`)
- Toutes les candidatures adoption + famille d'accueil (enregistrées automatiquement lors des soumissions)
- Filtres par type et statut
- Changement de statut : Nouvelle → En cours → Acceptée / Refusée
- Notes internes par candidature
- Export CSV

#### Utilisateurs (`/admin/users`) — Super Admin uniquement
- Ajouter / modifier des comptes (nom, email, mot de passe, rôle)
- Désactiver un compte sans le supprimer
- Le Super Admin ne peut pas être désactivé

#### Configuration (`/admin/config`)
- Email, téléphone, adresse
- Liens Facebook, Instagram, HelloAsso
- Chiffres clés page d'accueil
- **Export total** : télécharge un JSON avec toutes les données (animaux + config + pages)
- **Import total** : restaure depuis un JSON exporté

### Comment ajouter une page dans le menu

1. Allez dans **Pages** → **Nouvelle page**
2. Saisissez un titre — le slug s'auto-remplit
3. Rédigez le contenu (éditeur WYSIWYG + blocs)
4. Ajustez l'**ordre du menu** (entier, trié croissant)
5. Cliquez **Publier** — la page apparaît dans le menu et sur `/votre-slug`

### Gestion des médias

- Les photos sont **compressées automatiquement** (max 1400px, qualité 85%)
- Stockées en **base64 dans le localStorage**
- Indicateur de stockage utilisé affiché dans l'éditeur
- Limite pratique : ~10Mo de photos par navigateur

> **Important** : Les données sont dans le localStorage. Exportez régulièrement depuis Administration → Configuration → "Tout exporter". Pour transférer vers un autre navigateur/poste, importez ce fichier.

---

## Mise à jour des données JSON

Pour mettre à jour les données initiales (avant tout passage par le back-office) :

1. Éditez directement `public/data/animaux.json`, `config.json` ou `pages.json`
2. Committez et poussez → Netlify redéploie automatiquement

Une fois modifiées via le back-office, les données en localStorage priment sur les fichiers JSON.
Pour repartir des fichiers JSON : effacez le localStorage dans les DevTools.

---

## Licence

Tous droits réservés — Domaine de Fuego © 2024
