// Vérification des clubs : file d'attente et historique.

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService, type AdminClub } from '../../services/admin.service';
import { notify } from '../../lib/notify';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import styles from './Admin.module.css';

type Filter = 'pending' | 'verified' | 'all';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'verified', label: 'Vérifiés' },
  { value: 'all', label: 'Tous' },
];

export function AdminClubsPage() {
  const [filter, setFilter] = useState<Filter>('pending');
  const queryClient = useQueryClient();

  const { data: clubs, isLoading, isError } = useQuery({
    queryKey: ['admin', 'clubs', filter],
    queryFn: () =>
      adminService.clubs(
        filter === 'all' ? undefined : filter === 'verified'
      ),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, isVerified }: { id: number; isVerified: boolean }) =>
      adminService.setClubVerified(id, isVerified),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      notify.success(
        updated.isVerified
          ? `${updated.name} est vérifié.`
          : `La vérification de ${updated.name} est retirée.`
      );
    },
    onError: (error) => notify.apiError(error, 'Impossible de modifier ce club.'),
  });

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>Clubs</h1>
        <p className="text-muted">
          Un club vérifié signale aux joueurs que la structure a été contrôlée.
          C&apos;est le seul repère dont ils disposent avant de candidater.
        </p>
      </header>

      <div className={styles.filters}>
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`${styles.chip} ${filter === item.value ? styles.chipActive : ''}`}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-muted text-center">Chargement…</p>}

      {isError && (
        <Card>
          <p className="text-muted text-center">Impossible de charger les clubs.</p>
        </Card>
      )}

      {clubs && clubs.length === 0 && (
        <Card>
          <p className="text-muted text-center">
            {filter === 'pending'
              ? 'Aucun club en attente de vérification.'
              : 'Aucun club pour ce filtre.'}
          </p>
        </Card>
      )}

      {clubs && clubs.length > 0 && (
        <div className={styles.grid}>
          {clubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              isPending={verifyMutation.isPending}
              onToggle={() =>
                verifyMutation.mutate({ id: club.id, isVerified: !club.isVerified })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ClubCard({
  club,
  isPending,
  onToggle,
}: {
  club: AdminClub;
  isPending: boolean;
  onToggle: () => void;
}) {
  return (
    <Card>
      <h3 className={styles.cardTitle}>{club.name}</h3>

      <p className={club.isVerified ? styles.active : styles.pending}>
        {club.isVerified ? '● Vérifié' : '● En attente'}
      </p>

      {club.description && <p className="text-muted">{club.description}</p>}

      {club.website && (
        <p className="mono">
          <a href={club.website} target="_blank" rel="noreferrer noopener">
            {club.website}
          </a>
        </p>
      )}

      <p className="text-muted">
        Responsable : <span className="mono">{club.owner.email ?? '—'}</span>
        {club.owner.isActive === false && (
          <span className={styles.inactive}> — compte désactivé</span>
        )}
      </p>

      <Button
        variant={club.isVerified ? 'ghost' : 'success'}
        size="sm"
        fullWidth
        disabled={isPending}
        onClick={onToggle}
      >
        {club.isVerified ? 'Retirer la vérification' : 'Vérifier ce club'}
      </Button>
    </Card>
  );
}
