// Tableau de bord de l'administrateur : compteurs et files d'attente.

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { roleLabelPlural } from '../../lib/roles';
import styles from './Admin.module.css';

export function AdminDashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminService.stats(),
  });

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>Administration</h1>
        <p className="text-muted">
          Supervision de la plateforme : comptes et vérification des clubs.
        </p>
      </header>

      {isLoading && <p className="text-muted text-center">Chargement…</p>}

      {isError && (
        <Card>
          <p className="text-muted text-center">
            Impossible de charger les statistiques.
          </p>
        </Card>
      )}

      {stats && (
        <>
          <div className={styles.statsRow}>
            <Stat label="Comptes" value={stats.users.total} />
            <Stat label="Joueurs" value={stats.players} />
            <Stat label="Clubs" value={stats.clubs.total} />
            <Stat label="Offres" value={stats.offers} />
            <Stat label="Candidatures" value={stats.applications} />
          </div>

          <div className={styles.grid}>
            <Card>
              <h3 className={styles.cardTitle}>Clubs à vérifier</h3>
              {stats.clubs.unverified > 0 ? (
                <p>
                  <strong className={styles.pending}>{stats.clubs.unverified}</strong> club
                  {stats.clubs.unverified > 1 ? 's' : ''} en attente de vérification.
                </p>
              ) : (
                <p className="text-muted">Aucun club en attente.</p>
              )}
              <Link to="/admin/clubs">
                <Button variant="primary" size="sm" fullWidth>
                  Gérer les clubs
                </Button>
              </Link>
            </Card>

            <Card>
              <h3 className={styles.cardTitle}>Comptes désactivés</h3>
              {stats.users.inactive > 0 ? (
                <p>
                  <strong className={styles.pending}>{stats.users.inactive}</strong> compte
                  {stats.users.inactive > 1 ? 's' : ''} désactivé
                  {stats.users.inactive > 1 ? 's' : ''}.
                </p>
              ) : (
                <p className="text-muted">Tous les comptes sont actifs.</p>
              )}
              <Link to="/admin/users">
                <Button variant="primary" size="sm" fullWidth>
                  Gérer les comptes
                </Button>
              </Link>
            </Card>

            <Card>
              <h3 className={styles.cardTitle}>Répartition des rôles</h3>
              <ul className={styles.roleList}>
                {Object.entries(stats.users.byRole).map(([role, count]) => (
                  <li key={role}>
                    <span className="text-muted">{roleLabelPlural(role)}</span>
                    <strong>{count}</strong>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.statBox}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}
