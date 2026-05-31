// Page "Mes candidatures" — liste les candidatures envoyées par le joueur connecté.

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { applicationService } from '../services/application.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { RoleBadge } from '../components/ui/RoleBadge';
import styles from './ApplicationsPage.module.css';

export function MyApplicationsPage() {
  const { data: applications, isLoading, isError } = useQuery({
    queryKey: ['applications', 'me'],
    queryFn: () => applicationService.listMine(),
  });

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>Mes candidatures</h1>
        <p className="text-muted">Suis l'état de tes candidatures aux offres des clubs.</p>
      </header>

      {isLoading && <p className="text-center text-muted">Chargement…</p>}

      {isError && (
        <Card>
          <p className="text-center text-muted">Impossible de charger tes candidatures.</p>
        </Card>
      )}

      {!isLoading && !isError && applications && applications.length === 0 && (
        <Card>
          <div className={styles.empty}>
            <p className="text-muted">Tu n'as pas encore postulé à une offre.</p>
            <Link to="/offers">
              <Button variant="primary">Parcourir les offres</Button>
            </Link>
          </div>
        </Card>
      )}

      {!isLoading && !isError && applications && applications.length > 0 && (
        <div className={styles.list}>
          {applications.map((app) => (
            <Card key={app.id} className={styles.row}>
              <div className={styles.rowMain}>
                <Link to={`/offers/${app.offer?.id}`} className={styles.offerTitle}>
                  {app.offer?.title ?? 'Offre'}
                </Link>
                <span className={styles.club}>{app.offer?.club?.name}</span>
                {app.offer?.wantedRole && <RoleBadge role={app.offer.wantedRole} size="sm" />}
              </div>
              <div className={styles.rowSide}>
                <StatusBadge status={app.status} />
                <span className={styles.date}>
                  {new Date(app.appliedAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}