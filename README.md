# LoL Scout — Frontend

> Application web React du projet **LoL Scout** — plateforme de recrutement esport League of Legends.
> SPA en **React 19 + TypeScript** avec **Vite**, design tokens fidèles à la charte LoL.

**Projet fil-rouge CDA** — IPSSI — Auteur : Nassim Djemai — Période : Jan-Juin 2026.

⚠️ Ce front consomme l'API du backend Symfony : **https://github.com/nassimdjemaipr-dot/lol-scout-api**
Le back doit tourner sur `http://localhost:8000` pour que le front fonctionne.

---

## 🛠️ Stack technique

| Couche | Techno |
|---|---|
| Framework | React 19 + TypeScript ~6 |
| Bundler / dev server | Vite 8 |
| Routing | react-router-dom 7 |
| State serveur / cache | @tanstack/react-query 5 |
| HTTP client | axios 1 (avec intercepteur JWT auto) |
| Formulaires | react-hook-form + zod |
| Notifications (toasts) | react-hot-toast (stylisé charte LoL) |
| Styles | CSS Modules + variables CSS (pas de Tailwind/MUI) |
| Polices | Cinzel (titres), Outfit (texte), JetBrains Mono (stats) — Google Fonts |

---

## 🚀 Lancement rapide

### Prérequis
- **Node.js 18+** (testé sur Node 24)
- Le **backend lol-scout-api** doit tourner sur `http://localhost:8000`

### Installation en 3 commandes

```bash
git clone https://github.com/nassimdjemaipr-dot/lol-scout-front.git
cd lol-scout-front
npm install
```

### Configuration (optionnelle)

Par défaut, le front pointe sur `http://localhost:8000/api`. Pour changer :

```bash
cp .env.example .env
# Édite .env si besoin (par exemple en prod)
```

Variable disponible :
```env
VITE_API_URL=http://localhost:8000/api
```

### Démarrage

```bash
npm run dev
```

→ Front accessible sur **http://localhost:5173** ✅

### Build production

```bash
npm run build         # → génère le dossier dist/
npm run preview       # → lance un serveur statique pour preview le build
```

---

## 👤 Comptes de démonstration

> Mot de passe commun : **`password`**
> (Les comptes existent grâce aux fixtures du backend.)

| Type | Email |
|---|---|
| 🎮 Joueur | `joueur1@lolscout.gg` (ShadowMid — MID Diamond II) |
| 🎮 Joueur | `joueur6@lolscout.gg` (FaastHands — MID Grandmaster) |
| 🏆 Club | `club1@lolscout.gg` (Phoenix Esport) |
| 🛡️ Admin | `admin@lolscout.gg` |

Tous les comptes joueurs ont déjà un profil rempli + un compte Riot lié + des stats.
Le compte `club1` a déjà reçu des candidatures à traiter.

---

## 🗺️ Structure des routes

### Publiques (sans connexion)

| Route | Page |
|---|---|
| `/` | Accueil avec hero + stats |
| `/players` | Liste des joueurs avec filtres (rôle, disponibilité) |
| `/players/:id` | Profil joueur (stats, champions) |
| `/offers` | Liste des offres de recrutement |
| `/offers/:id` | Détail d'une offre + bouton Postuler |
| `/login` | Connexion |
| `/register` | Inscription (joueur ou club) |

### Joueur (`ROLE_PLAYER`)

| Route | Page |
|---|---|
| `/dashboard/player` | Dashboard joueur (profil + lien Riot + sync stats + candidatures) |
| `/dashboard/player/applications` | Mes candidatures avec statut |
| `/dashboard/player/profile` | Modifier mon profil (pseudo, rôle, bio, disponibilité) |

### Club (`ROLE_CLUB`)

| Route | Page |
|---|---|
| `/dashboard/club` | Dashboard club |
| `/dashboard/club/applications` | Candidatures reçues (Accepter / Refuser) |
| `/dashboard/club/offers/new` | Créer une offre (titre, rôle, rang min, date expiration) |
| `/dashboard/club/offers` | Mes offres *(prévu Jalon 6)* |

---

## 🏗️ Architecture

```
src/
├── components/
│   ├── ui/                  # Composants génériques (Button, Card, RoleBadge, RankBadge, StatusBadge)
│   └── layout/              # Header, Footer, Layout, ProtectedRoute
├── contexts/
│   └── AuthContext.tsx      # État d'auth global + login/logout
├── pages/                   # Toutes les pages (11 pages)
├── services/                # Couche API (axios)
│   ├── api.ts               # Client axios + intercepteur JWT
│   ├── auth.service.ts
│   ├── player.service.ts
│   ├── offer.service.ts
│   └── application.service.ts
├── styles/
│   └── tokens.css           # Design tokens (couleurs, polices, espacements)
├── types/
│   └── index.ts             # Types TypeScript (User, Player, Offer, Application…)
├── App.tsx                  # Définition des routes
├── main.tsx                 # Providers (Router + Auth + React Query)
└── index.css                # Reset + styles globaux
```

---

## 🎨 Charte graphique

Fidèle à la consigne du **Jalon 2 (UI/UX)** :

### Palette
- **Dark Blue** `#0A1428` — fond principal
- **Gold** `#C89B3C` — accents, titres, badges
- **Teal** `#0AC8B9` — boutons CTA, actions interactives
- **Charcoal** `#1E2328` — cartes et surfaces
- **Cream** `#F0E6D2` — texte sur fond sombre
- **Success** `#28B745` / **Danger** `#E84057` — statuts

### Typographie
- **Cinzel Bold** — titres principaux (style élégant inspiré LoL)
- **Outfit** — texte courant (sans-serif moderne)
- **JetBrains Mono** — stats et chiffres

### Approche
- **Mobile First** : 375px → 768px → 1024px → 1440px
- **Accessibilité** : contraste WCAG AA, cibles cliquables ≥ 44×44px
- **Animations sobres** : `translateY(-2px)` au hover, transitions 0.2s

---

## 🔐 Authentification

Le flow est géré par `AuthContext` :

1. **Login** → `POST /api/login_check` → JWT renvoyé
2. Le token est stocké en **`localStorage`** (clé `lol-scout-token`)
3. Un **intercepteur axios** injecte automatiquement `Authorization: Bearer <token>` sur chaque requête
4. Si l'API renvoie **401** → on nettoie le token et on redirige vers `/login`
5. Les routes `/dashboard/*` sont protégées par `<ProtectedRoute requiredRole="..." />`

---

## 📋 Statut du projet (Jalon 5 — fin mai 2026)

✅ **Livré Jalon 5 (v1.0-beta)** :
- Pages publiques (joueurs, offres, profil)
- Auth complète (login / register / logout) avec persistance JWT
- Flow candidature complet (joueur ↔ club)
- Dashboards joueur / club
- Lier compte Riot + synchroniser stats en live
- Modifier mon profil joueur
- Créer une offre (club)
- Système de toasts (feedback visuel sur toutes les actions)
- Header avec badge de rôle + bouton Déconnexion
- Charte graphique LoL respectée (Cinzel + tokens CSS)

⏳ **Prévu Jalon 6 (juin)** : tests Jest/Vitest, page "Mes offres" club, déploiement production.

Bilan détaillé dans le backend : [docs/BILAN.md](https://github.com/nassimdjemaipr-dot/lol-scout-api/blob/main/docs/BILAN.md)

---

## 🆘 Dépannage

| Problème | Solution |
|---|---|
| Erreur 401 sur les pages protégées | Vérifie que tu es loggé et que le back tourne |
| "Impossible de charger les joueurs" | Le back n'est pas démarré → `docker compose up -d` côté API |
| PowerShell bloque `npm` | Utilise `npm.cmd` à la place, ou `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| Erreur de build TypeScript | `npm install` puis `npx tsc --noEmit` pour diagnostiquer |
| Port 5173 occupé | Vite te proposera automatiquement le port suivant (5174…) |