// App — déclaration des routes de l'application.
// Toutes les pages sont enveloppées par le Layout (Header + Footer).
// Les routes /dashboard/* nécessitent une authentification + un rôle précis.

import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PlayersListPage } from './pages/PlayersListPage';
import { PlayerProfilePage } from './pages/PlayerProfilePage';
import { OffersListPage } from './pages/OffersListPage';
import { OfferDetailPage } from './pages/OfferDetailPage';
import { PlayerDashboardPage } from './pages/PlayerDashboardPage';
import { ClubDashboardPage } from './pages/ClubDashboardPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* ─── Routes publiques ──────────────────────────── */}
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/players" element={<PlayersListPage />} />
        <Route path="/players/:id" element={<PlayerProfilePage />} />
        <Route path="/offers" element={<OffersListPage />} />
        <Route path="/offers/:id" element={<OfferDetailPage />} />
        <Route path="/clubs" element={<PlaceholderPage title="Liste des clubs" />} />
        <Route path="/clubs/:id" element={<PlaceholderPage title="Profil club" />} />

        {/* ─── Routes Joueur (ROLE_PLAYER) ──────────────── */}
        <Route element={<ProtectedRoute requiredRole="ROLE_PLAYER" />}>
          <Route path="/dashboard/player" element={<PlayerDashboardPage />} />
          <Route path="/dashboard/player/profile" element={<PlaceholderPage title="Modifier mon profil" />} />
          <Route path="/dashboard/player/applications" element={<PlaceholderPage title="Mes candidatures" />} />
        </Route>

        {/* ─── Routes Club (ROLE_CLUB) ──────────────────── */}
        <Route element={<ProtectedRoute requiredRole="ROLE_CLUB" />}>
          <Route path="/dashboard/club" element={<ClubDashboardPage />} />
          <Route path="/dashboard/club/offers" element={<PlaceholderPage title="Mes offres" />} />
          <Route path="/dashboard/club/offers/new" element={<PlaceholderPage title="Créer une offre" />} />
          <Route path="/dashboard/club/applications" element={<PlaceholderPage title="Candidatures reçues" />} />
        </Route>

        {/* ─── 404 ───────────────────────────────────────── */}
        <Route path="*" element={<PlaceholderPage title="404 — Page introuvable" />} />
      </Route>
    </Routes>
  );
}

export default App;