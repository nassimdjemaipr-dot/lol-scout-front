// Dashboard du joueur connecté. Vue d'ensemble + accès rapide aux actions.

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { playerService } from '../services/player.service';
import { applicationService } from '../services/application.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RankBadge } from '../components/ui/RankBadge';
import { RoleBadge } from '../components/ui/RoleBadge';
import styles from './DashboardPage.module.css';

export function PlayerDashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [syncError, setSyncError] = useState<string | null>(null);

  // Profil du joueur connecté (vrai endpoint /api/players/me)
  const { data: player } = useQuery({
    queryKey: ['me', 'player'],
    queryFn: () => playerService.getMyProfile(),
    enabled: !!user,
  });

  // Candidatures du joueur connecté
  const { data: applications } = useQuery({
    queryKey: ['applications', 'me'],
    queryFn: () => applicationService.listMine(),
    enabled: !!user,
  });

  const syncMutation = useMutation({
    mutationFn: () => playerService.syncRiotStats(),
    onSuccess: () => {
      setSyncError(null);
      queryClient.invalidateQueries({ queryKey: ['me', 'player'] });
    },
    onError: (err: Error) => {
      setSyncError(err.message || 'Erreur lors de la synchronisation.');
    },
  });

  const applicationsCount = applications?.length ?? 0;

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>Mon espace joueur</h1>
        <p className="text-muted">
          Bienvenue, {user?.email}. Gère ton profil, synchronise tes stats Riot
          et suis tes candidatures.
        </p>
      </header>

      <div className={styles.grid}>
        {/* ─── Carte profil ─────────────────────────────── */}
        <Card>
          <h3 className={styles.cardTitle}>Mon profil</h3>
          {player ? (
            <>
              <p>
                <strong>{player.pseudo}</strong>
              </p>
              <div className={styles.badges}>
                <RoleBadge role={player.gameRole} size="sm" />
                <RankBadge tier={player.stats?.tier} size="sm" />
              </div>
            </>
          ) : (
            <p className="text-muted">Profil non créé.</p>
          )}
          <Link to="/dashboard/player/profile">
            <Button variant="ghost" size="sm" fullWidth>
              Modifier mon profil
            </Button>
          </Link>
        </Card>

        {/* ─── Carte Riot ──────────────────────────────── */}
        <Card>
          <h3 className={styles.cardTitle}>Compte Riot Games</h3>
          {player?.riotAccount ? (
            <>
              <p className="mono">{player.riotAccount.summonerName}</p>
              <p className="text-muted">Région : {player.riotAccount.region}</p>
              {player.riotAccount.lastSyncAt && (
                <p className="text-muted">
                  Dernière sync :{' '}
                  {new Date(player.riotAccount.lastSyncAt).toLocaleDateString('fr-FR')}
                </p>
              )}
            </>
          ) : (
            <p className="text-muted">Pas encore lié.</p>
          )}
          <Button
            variant="primary"
            size="sm"
            fullWidth
            isLoading={syncMutation.isPending}
            onClick={() => syncMutation.mutate()}
          >
            {player?.riotAccount ? 'Re-synchroniser' : 'Lier mon compte Riot'}
          </Button>
          {syncError && <p className={styles.error}>{syncError}</p>}
        </Card>

        {/* ─── Carte candidatures ──────────────────────── */}
        <Card>
          <h3 className={styles.cardTitle}>Mes candidatures</h3>
          {applicationsCount > 0 ? (
            <p>
              <strong className="text-gold" style={{ fontSize: '1.5rem' }}>
                {applicationsCount}
              </strong>{' '}
              candidature{applicationsCount > 1 ? 's' : ''} en cours
            </p>
          ) : (
            <p className="text-muted">Aucune candidature pour le moment.</p>
          )}
          <Link to={applicationsCount > 0 ? '/dashboard/player/applications' : '/offers'}>
            <Button variant="ghost" size="sm" fullWidth>
              {applicationsCount > 0 ? 'Voir mes candidatures' : 'Parcourir les offres'}
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}