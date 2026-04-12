# Domaine de Fuego — Site d'adoption animale

Site web complet pour l'association Domaine de Fuego, développé avec React + Vite + TailwindCSS.

## Stack technique

- **React 19** + **TypeScript**
- **Vite** (bundler)
- **TailwindCSS v3** (styles)
- **React Router v7** (navigation SPA)
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

Le mot de passe est défini par `VITE_ADMIN_PASSWORD` dans `.env`.
En développement sans `.env`, le mot de passe par défaut est `admin`.

### Fonctionnalités
- **Animaux** : Ajouter, modifier, archiver les animaux
- **Pages** : Éditer les textes de la page Présentation et Faire un don
- **Configuration** : Email, liens réseaux sociaux, HelloAsso, chiffres clés
- **Export/Import** : Sauvegarde complète au format JSON

> **Important** : Les données modifiées sont stockées dans le localStorage du navigateur. Utilisez la fonction Export/Import pour sauvegarder et transférer les données.

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
