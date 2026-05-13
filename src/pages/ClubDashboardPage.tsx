// Dashboard du club connecté. Stats + gestion des offres et candidatures.

import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import styles from './DashboardPage.module.css';

export function ClubDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>Mon espace club</h1>
        <p className="text-muted">
          Bienvenue, {user?.email}. Publie des offres, gère tes candidatures et
          recrute les meilleurs talents.
        </p>
      </header>

      {/* ─── Stats rapides ────────────────────────────── */}
      <div className={styles.statsRow}>
        <Card className={styles.statBox}>
          <span className={styles.statLabel}>Offres actives</span>
          <span className={`stat ${styles.statValue}`}>3</span>
        </Card>
        <Card className={styles.statBox}>
          <span className={styles.statLabel}>Candidatures reçues</span>
          <span className={`stat ${styles.statValue}`}>43</span>
        </Card>
        <Card className={styles.statBox}>
          <span className={styles.statLabel}>Shortlist</span>
          <span className={`stat ${styles.statValue}`}>12</span>
        </Card>
        <Card className={styles.statBox}>
          <span className={styles.statLabel}>Recrutements</span>
          <span className={`stat ${styles.statValue}`}>8</span>
        </Card>
      </div>

      {/* ─── Actions principales ──────────────────────── */}
      <div className={styles.grid}>
        <Card>
          <h3 className={styles.cardTitle}>Publier une nouvelle offre</h3>
          <p className="text-muted">
            Décris le poste, le rôle recherché et le rang minimum.
          </p>
          <Link to="/dashboard/club/offers/new">
            <Button variant="primary" size="sm" fullWidth>
              Créer une offre
            </Button>
          </Link>
        </Card>

        <Card>
          <h3 className={styles.cardTitle}>Mes offres</h3>
          <p className="text-muted">
            Gère tes offres existantes, modifie-les ou désactive-les.
          </p>
          <Link to="/dashboard/club/offers">
            <Button variant="ghost" size="sm" fullWidth>
              Voir mes offres
            </Button>
          </Link>
        </Card>

        <Card>
          <h3 className={styles.cardTitle}>Candidatures reçues</h3>
          <p className="text-muted">
            Consulte les candidatures pour chacune de tes offres ouvertes.
          </p>
          <Link to="/dashboard/club/applications">
            <Button variant="ghost" size="sm" fullWidth>
              Voir les candidatures
            </Button>
          </Link>
        </Card>

        <Card>
          <h3 className={styles.cardTitle}>Rechercher des joueurs</h3>
          <p className="text-muted">
            Filtre par rôle, rang et disponibilité pour repérer des talents.
          </p>
          <Link to="/players">
            <Button variant="ghost" size="sm" fullWidth>
              Lancer une recherche
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
