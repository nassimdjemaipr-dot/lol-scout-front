// Page "Candidatures reçues" — le club voit les candidatures groupées par
// offre, ouvre le profil d'un joueur, compare les candidats d'une même
// offre, et accepte ou refuse.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { applicationService } from '../services/application.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/StatusBadge';
import { RoleBadge } from '../components/ui/RoleBadge';
import { RankBadge } from '../components/ui/RankBadge';
import { notify } from '../lib/notify';
import { MAX_COMPARISON } from '../lib/comparison';
import type { Application, ApplicationStatus } from '../types';
import styles from './ApplicationsPage.module.css';

interface OfferGroup {
  key: number;
  title: string;
  offerId?: number;
  applications: Application[];
}

function groupByOffer(applications: Application[]): OfferGroup[] {
  const groups = new Map<number, OfferGroup>();

  for (const application of applications) {
    const key = application.offer?.id ?? 0;
    let group = groups.get(key);

    if (!group) {
      group = {
        key,
        title: application.offer?.title ?? 'Offre supprimée',
        offerId: application.offer?.id,
        applications: [],
      };
      groups.set(key, group);
    }

    group.applications.push(application);
  }

  return [...groups.values()];
}

function comparablePlayerIds(group: OfferGroup): number[] {
  return group.applications
    .map((application) => application.player?.id)
    .filter((id): id is number => typeof id === 'number')
    .slice(0, MAX_COMPARISON);
}

export function ClubApplicationsPage() {
  const queryClient = useQueryClient();

  const { data: applications, isLoading, isError } = useQuery({
    queryKey: ['applications', 'club'],
    queryFn: () => applicationService.listForClub(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ApplicationStatus }) =>
      applicationService.updateStatus(id, status),
    onSuccess: (_data, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'club'] });
      notify.success(
        status === 'ACCEPTEE' ? 'Candidature acceptee.' : 'Candidature refusee.',
      );
    },
    onError: (err) => notify.apiError(err, 'Erreur lors de la mise a jour.'),
  });

  const groups = applications ? groupByOffer(applications) : [];

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

      {!isLoading && !isError && groups.length > 0 && (
        <div className={styles.groups}>
          {groups.map((group) => {
            const ids = comparablePlayerIds(group);
            const total = group.applications.length;

            return (
              <section key={group.key} className={styles.group}>
                <div className={styles.groupHead}>
                  <h2 className={styles.groupTitle}>
                    {group.offerId ? (
                      <Link to={`/offers/${group.offerId}`} className={styles.offerLabel}>
                        {group.title}
                      </Link>
                    ) : (
                      group.title
                    )}
                  </h2>
                  <div className={styles.groupSide}>
                    <span className={styles.groupCount}>
                      {total} candidature{total > 1 ? 's' : ''}
                    </span>
                    {ids.length > 1 && (
                      <Link to={`/players/compare?ids=${ids.join(',')}`}>
                        <Button variant="secondary" size="sm">
                          {total > MAX_COMPARISON
                            ? `Comparer les ${MAX_COMPARISON} premiers`
                            : `Comparer les ${ids.length} candidats`}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                <div className={styles.list}>
                  {group.applications.map((app) => (
                    <Card key={app.id} className={styles.candidateCard}>
                      <div className={styles.candidateHead}>
                        <h3 className={styles.candidateName}>
                          {app.player ? (
                            <Link
                              to={`/players/${app.player.id}`}
                              className={styles.candidateLink}
                            >
                              {app.player.pseudo}
                            </Link>
                          ) : (
                            'Joueur'
                          )}
                        </h3>
                        <div className={styles.candidateBadges}>
                          {app.player?.gameRole && <RoleBadge role={app.player.gameRole} size="sm" />}
                          {app.player?.riotAccount?.stats?.tier && (
                            <RankBadge tier={app.player.riotAccount.stats.tier} size="sm" />
                          )}
                          <StatusBadge status={app.status} />
                        </div>
                      </div>

                      {app.message && <p className={styles.message}>« {app.message} »</p>}

                      <div className={styles.actions}>
                        {app.player && (
                          <Link to={`/players/${app.player.id}`}>
                            <Button variant="ghost" size="sm">
                              Voir le profil
                            </Button>
                          </Link>
                        )}

                        {app.status === 'EN_ATTENTE' && (
                          <>
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
                          </>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
