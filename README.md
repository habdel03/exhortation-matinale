# ✦ Exhortation Prophétique Matinale

> Plateforme digitale de ministère chrétien pour la publication et le partage d'exhortations prophétiques quotidiennes en français.

![Stack](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20Vanilla%20JS-blue)
![Backend](https://img.shields.io/badge/backend-Firebase%20Firestore-orange)
![Deployment](https://img.shields.io/badge/deploy-GitHub%20Pages-black)
![Language](https://img.shields.io/badge/language-Français-green)

---

## 📋 Table des matières

- [Aperçu du projet](#aperçu-du-projet)
- [Structure du projet](#structure-du-projet)
- [Configuration Firebase](#configuration-firebase)
- [Déploiement GitHub Pages](#déploiement-github-pages)
- [Personnalisation](#personnalisation)
- [Règles Firestore](#règles-firestore)
- [Administration](#administration)
- [Format des exhortations](#format-des-exhortations)

---

## 🌟 Aperçu du projet

**Exhortation Prophétique Matinale** est une plateforme web complète comprenant :

| Page | Fichier | Description |
|------|---------|-------------|
| Accueil | `index.html` | Hero, dernière exhortation, archive récente, YouTube, témoignages |
| Archive | `archive.html` | Toutes les exhortations avec pagination et filtres |
| Exhortation | `exhortation.html` | Page individuelle chargée dynamiquement depuis Firestore |
| À propos | `about.html` | Présentation du ministère |
| Contact | `contact.html` | Formulaire de contact (envoi dans Firestore) |
| Admin | `admin.html` | Interface de publication (accès authentifié) |

---

## 🗂 Structure du projet

```
/
├── index.html          # Page d'accueil
├── archive.html        # Archive paginée
├── exhortation.html    # Page exhortation unique
├── about.html          # À propos
├── contact.html        # Formulaire de contact
├── admin.html          # Panneau d'administration
├── sitemap.xml         # Plan du site SEO
│
├── css/
│   └── style.css       # Styles complets (design Navy + Gold)
│
├── js/
│   ├── firebase.js     # Init Firebase + utilitaires
│   ├── exhortations.js # Chargement homepage
│   └── archive.js      # Pagination + filtres + recherche
│
├── assets/
│   ├── images/         # Placer vos images ici (og-image.jpg, etc.)
│   └── logo/
│       └── favicon.svg # Favicon SVG
│
└── README.md
```

---

## 🔥 Configuration Firebase

### Étape 1 — Créer un projet Firebase

1. Allez sur [console.firebase.google.com](https://console.firebase.google.com)
2. Cliquez **"Ajouter un projet"**
3. Nommez-le (ex: `exhortation-matinale`)
4. Activez Google Analytics si souhaité

### Étape 2 — Activer Firestore

1. Dans le panneau Firebase, allez dans **Firestore Database**
2. Cliquez **"Créer une base de données"**
3. Choisissez le mode **Production** (ou Test pour commencer)
4. Sélectionnez une région proche (ex: `europe-west1`)

### Étape 3 — Activer Authentication

1. Allez dans **Authentication → Sign-in method**
2. Activez **Email/Password**
3. Créez un compte admin : **Authentication → Users → Add user**

### Étape 4 — Récupérer les clés Firebase

1. Allez dans **Paramètres du projet** (icône engrenage)
2. Section **"Vos applications"** → Cliquez l'icône Web `</>`
3. Enregistrez l'application (nommez-la)
4. Copiez l'objet `firebaseConfig`

### Étape 5 — Mettre à jour js/firebase.js

Ouvrez `js/firebase.js` et remplacez les placeholders :

```javascript
const firebaseConfig = {
  apiKey:            "AIzaSy...",           // ← Remplacer
  authDomain:        "mon-projet.firebaseapp.com",
  projectId:         "mon-projet",
  storageBucket:     "mon-projet.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc..."
};
```

---

## 🔒 Règles Firestore

Copiez ces règles dans **Firestore → Règles** :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Exhortations : lecture publique, écriture authentifiée seulement
    match /exhortations/{docId} {
      allow read:  if true;
      allow write: if request.auth != null;
    }

    // Messages de contact : écriture publique, lecture authentifiée
    match /messages/{docId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

---

## 🚀 Déploiement GitHub Pages

### Méthode 1 — Via l'interface GitHub (recommandée)

1. Créez un nouveau dépôt GitHub (public)
2. Nommez-le `exhortation-matinale` ou `votre-username.github.io`
3. Uploadez tous les fichiers du projet

```bash
git init
git add .
git commit -m "🚀 Initial deployment — Exhortation Prophétique Matinale"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/exhortation-matinale.git
git push -u origin main
```

4. Dans GitHub : **Settings → Pages → Source : Deploy from a branch**
5. Sélectionnez `main` → `/ (root)` → **Save**
6. Votre site sera disponible sur : `https://VOTRE_USERNAME.github.io/exhortation-matinale/`

### Méthode 2 — GitHub CLI

```bash
gh repo create exhortation-matinale --public --source=. --push
gh api repos/:owner/:repo/pages -X POST -f source='{"branch":"main","path":"/"}'
```

### Mettre à jour le site

```bash
git add .
git commit -m "✦ Nouvelle exhortation"
git push
```

---

## 🎨 Personnalisation

### Couleurs (css/style.css)

```css
:root {
  --navy:      #0A1628;  /* Bleu marine foncé */
  --gold:      #C9A84C;  /* Or accent */
  --cream:     #FDFAF4;  /* Fond crème */
}
```

### Liens YouTube (js/exhortations.js)

```javascript
const videoIds = [
  'VIDEO_ID_1',   // ← ID YouTube de la vidéo 1
  'VIDEO_ID_2',   // ← ID YouTube de la vidéo 2
  'VIDEO_ID_3'    // ← ID YouTube de la vidéo 3
];
```

L'ID YouTube est la partie `v=XXXX` dans une URL YouTube.

### URL du site (index.html + sitemap.xml)

Remplacez `https://your-site.github.io/` par votre vraie URL GitHub Pages.

### Numéro WhatsApp (index.html footer)

```html
<a href="https://api.whatsapp.com/send?phone=YOUR_PHONE">
```

Remplacez `YOUR_PHONE` par votre numéro international sans `+` ni espaces.
Ex : `33612345678` pour un numéro français.

---

## 🗄️ Format des exhortations Firestore

**Collection** : `exhortations`

```json
{
  "titre":         "La dimension du reste",
  "contenu":       "<p>Contenu HTML de l'exhortation...</p><blockquote>Un verset...</blockquote>",
  "date":          "2026-06-18",
  "categorie":     "Foi",
  "youtube_url":   "https://www.youtube.com/watch?v=VIDEO_ID",
  "slug":          "la-dimension-du-reste",
  "verse_du_jour": "Car la parole de Dieu est vivante et efficace...",
  "verse_ref":     "Hébreux 4:12"
}
```

Le champ `contenu` accepte du HTML. Balises recommandées :
- `<p>` pour les paragraphes
- `<blockquote>` pour les versets mis en valeur
- `<strong>` pour l'emphase
- `<em>` pour l'italique (s'affiche en or)

---

## 🛠 Administration

Accédez à `admin.html` pour :

- **Publier** de nouvelles exhortations
- **Visualiser** la liste des exhortations récentes
- **Supprimer** une exhortation

L'accès nécessite un compte Firebase Authentication.

**Créer un compte admin :**
1. Console Firebase → Authentication → Users
2. Cliquez "Add user"
3. Entrez email + mot de passe
4. Utilisez ces identifiants sur `admin.html`

---

## 📱 Partage WhatsApp

Le bouton WhatsApp génère automatiquement un message formaté :

```
✨ TITRE ✨

Extrait de l'exhortation...

🔗 Lire en ligne :
https://votre-site.github.io/exhortation.html?id=DOCUMENT_ID

— Exhortation Prophétique Matinale
```

---

## 🤝 Contribution

Ce projet est développé pour la gloire de Dieu.
Pour contribuer, ouvrez une issue ou une pull request.

---

*Fait avec foi · Firebase · GitHub Pages*
