# Fichiers protégés — à maintenir manuellement sur Hostinger

Ces fichiers sont **exclus de git** (listés dans `.gitignore`) et doivent être
**re-uploadés manuellement** sur le serveur Hostinger après chaque déploiement,
car le gestionnaire de fichiers Hostinger / FTP les écrase lors d'un `git pull`.

## Fichiers à maintenir

| Fichier | Rôle |
|---|---|
| `public/.htaccess` | Règles Apache : redirections SPA, HTTPS force, cache headers |
| `public/*.html` | Toute page HTML personnalisée ajoutée manuellement |

## Procédure après chaque déploiement

1. Déployez le build (`dist/`) via FTP ou le gestionnaire Hostinger.
2. Vérifiez que `.htaccess` est bien présent dans le dossier racine du site.
3. Si absent, re-uploadez votre copie locale de `.htaccess`.
4. Testez une URL directe (ex: `/animaux`) pour vérifier que le routage SPA fonctionne.

## Contenu typique du .htaccess (Apache + SPA React)

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

> **Note :** Ce fichier n'est jamais dans le dépôt git pour éviter qu'un
> `git pull` ou un redéploiement automatique ne l'écrase avec une version vide.
