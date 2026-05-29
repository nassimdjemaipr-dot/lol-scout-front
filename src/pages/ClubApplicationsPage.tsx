// Page "Candidatures reçues" — le club voit les candidatures sur ses offres
// et peut les accepter ou les refuser.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../services/application.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { RoleBadge } from '../components/ui/RoleBadge';
import { RankBadge } from '../components/ui/RankBadge';
import type { ApplicationStatus } from '../types';
import styles from './ApplicationsPage.module.css';

export function ClubApplicationsPage() {
  const queryClient = useQueryClient();

  const { data: applications, isLoading, isError } = useQuery({
    queryKey: ['applications', 'club'],
    queryFn: () => applicationService.listForClub(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ApplicationStatus }) =>
      applicationService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'club'] });
    },
  });

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>Candidatures reçues</h1>
        <p className="text-muted">Gère les candidatures sur tes offres de recrutement.</p>
      </header>

      {isLoading && <p className="text-center text-muted">Chargement…</p>}

      {isError && (
        <Card>
          <p className="text-center text-muted">Impossible de charger les candidatures.</p>
        </Card>
      )}

      {!isLoading && !isError && applications && applications.length === 0 && (
        <Card>
          <p className="text-center text-muted">Aucune candidature reçue pour le moment.</p>
        </Card>
      )}

      {!isLoading && !isError && applications && applications.length > 0 && (
        <div className={styles.list}>
          {applications.map((app) => (
            <Card key={app.id} className={styles.candidateCard}>
              <div className={styles.candidateHead}>
                <div>
                  <h3 className={styles.candidateName}>{app.player?.pseudo ?? 'Joueur'}</h3>
                  <span className={styles.offerLabel}>pour « {app.offer?.title} »</span>
                </div>
                <div className={styles.candidateBadges}>
                  {app.player?.gameRole && <RoleBadge role={app.player.gameRole} size="sm" />}
                  {app.player?.stats?.tier && <RankBadge tier={app.player.stats.tier} size="sm" />}
                  <StatusBadge status={app.status} />
                </div>
              </div>

              {app.message && <p className={styles.message}>« {app.message} »</p>}

              {app.status === 'EN_ATTENTE' && (
                <div className={styles.actions}>
                  <Button
                    variant="success"
                    size="sm"
                    isLoading={statusMutation.isPending && statusMutation.variables?.id === app.id}
                    onClick={() => statusMutation.mutate({ id: app.id, status: 'ACCEPTEE' })}
                  >
                    Accepter
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    isLoading={statusMutation.isPending && statusMutation.variables?.id === app.id}
                    onClick={() => statusMutation.mutate({ id: app.id, status: 'REFUSEE' })}
                  >
                    Refuser
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}