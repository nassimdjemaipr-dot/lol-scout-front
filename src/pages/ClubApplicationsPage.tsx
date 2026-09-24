// Page "Candidatures reçues" — le club filtre ses candidatures par offre ou
// par pseudo, sélectionne des candidats d'une même offre pour les comparer,
// ouvre leur profil, et accepte ou refuse.

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
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
import compareStyles from './ComparePlayersPage.module.css';

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

function matchesSearch(application: Application, search: string): boolean {
  if (search === '') return true;

  const needle = search.trim().toLowerCase();

  return [
    application.player?.pseudo,
    application.player?.firstName,
    application.player?.lastName,
    application.offer?.title,
  ].some((field) => field?.toLowerCase().includes(needle));
}

export function ClubApplicationsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [filterOffer, setFilterOffer] = useState<number | ''>('');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<number | null>(null);

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

  const allGroups = applications ? groupByOffer(applications) : [];

  const visibleGroups = allGroups
    .filter((group) => filterOffer === '' || group.key === filterOffer)
    .map((group) => ({
      ...group,
      applications: group.applications.filter((app) => matchesSearch(app, search)),
    }))
    .filter((group) => group.applications.length > 0);

  const clearSelection = () => {
    setSelectedIds([]);
    setSelectedOffer(null);
  };

  // La comparaison n'a de sens qu'entre candidats d'une même offre : le
  // premier sélectionné fixe l'offre, les autres offres se verrouillent.
  const toggleSelection = (playerId: number, offerKey: number) => {
    if (selectedIds.includes(playerId)) {
      const next = selectedIds.filter((id) => id !== playerId);
      setSelectedIds(next);
      if (next.length === 0) setSelectedOffer(null);
      return;
    }

    if (selectedIds.length >= MAX_COMPARISON) return;
    if (selectedOffer !== null && selectedOffer !== offerKey) return;

    setSelectedIds([...selectedIds, playerId]);
    setSelectedOffer(offerKey);
  };

  const isSelectable = (playerId: number, offerKey: number): boolean => {
    if (selectedIds.includes(playerId)) return true;
    if (selectedOffer !== null && selectedOffer !== offerKey) return false;
    return selectedIds.length < MAX_COMPARISON;
  };

  const hasApplications = applications !== undefined && applications.length > 0;

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

      {!isLoading && !isError && hasApplications && (
        <div className={styles.filters}>
          <div className={styles.chips}>
            <button
              type="button"
              className={`${styles.chip} ${filterOffer === '' ? styles.chipActive : ''}`}
              aria-pressed={filterOffer === ''}
              onClick={() => setFilterOffer('')}
            >
              Toutes les offres
            </button>
            {allGroups.map((group) => (
              <button
                key={group.key}
                type="button"
                className={`${styles.chip} ${filterOffer === group.key ? styles.chipActive : ''}`}
                aria-pressed={filterOffer === group.key}
                onClick={() => setFilterOffer(group.key)}
              >
                {group.title} ({group.applications.length})
              </button>
            ))}
          </div>

          <input
            type="search"
            className={styles.search}
            aria-label="Rechercher un candidat"
            placeholder="Rechercher un candidat…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      )}

      {!isLoading && !isError && hasApplications && visibleGroups.length === 0 && (
        <Card>
          <p className="text-center text-muted">Aucune candidature ne correspond à ta recherche.</p>
        </Card>
      )}

      {!isLoading && !isError && visibleGroups.length > 0 && (
        <div className={styles.groups}>
          {visibleGroups.map((group) => {
            const total = group.applications.length;
            const locked = selectedOffer !== null && selectedOffer !== group.key;

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
                  <span className={styles.groupCount}>
                    {total} candidature{total > 1 ? 's' : ''}
                    {locked && ' — comparaison en cours sur une autre offre'}
                  </span>
                </div>

                <div className={styles.list}>
                  {group.applications.map((app) => {
                    const playerId = app.player?.id;
                    const selected = playerId !== undefined && selectedIds.includes(playerId);

                    return (
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

                        {playerId !== undefined && (
                          <button
                            type="button"
                            className={`${styles.compareToggle} ${selected ? styles.compareToggleActive : ''}`}
                            aria-pressed={selected}
                            disabled={!isSelectable(playerId, group.key)}
                            onClick={() => toggleSelection(playerId, group.key)}
                          >
                            {selected ? '✓ Sélectionné' : 'Ajouter à la comparaison'}
                          </button>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className={compareStyles.selectionBar}>
          <div className={compareStyles.selectionList}>
            <strong>
              {selectedIds.length} candidat{selectedIds.length > 1 ? 's' : ''}
            </strong>{' '}
            sélectionné{selectedIds.length > 1 ? 's' : ''}
            {selectedIds.length === 1 && (
              <span className="text-muted"> — il en faut au moins deux</span>
            )}
            {selectedIds.length === MAX_COMPARISON && (
              <span className="text-muted"> — maximum atteint</span>
            )}
          </div>

          <div className={compareStyles.selectionActions}>
            <Button
              variant="primary"
              size="sm"
              disabled={selectedIds.length < 2}
              onClick={() => navigate(`/players/compare?ids=${selectedIds.join(',')}`)}
            >
              Comparer
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
