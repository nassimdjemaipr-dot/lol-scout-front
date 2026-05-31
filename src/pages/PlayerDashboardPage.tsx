// Dashboard du joueur connecté. Vue d'ensemble + accès rapide aux actions.

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { playerService } from '../services/player.service';
import { applicationService } from '../services/application.service';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RankBadge } from '../components/ui/RankBadge';
import { RoleBadge } from '../components/ui/RoleBadge';
import { notify } from '../lib/notify';
import styles from './DashboardPage.module.css';

// Régions LoL supportées (correspondent au mapping back RiotSyncService)
const REGIONS = [
  { code: 'EUW1', label: 'Europe West (EUW)' },
  { code: 'EUN1', label: 'Europe Nordic & East (EUNE)' },
  { code: 'NA1', label: 'North America (NA)' },
  { code: 'KR', label: 'Korea (KR)' },
  { code: 'JP1', label: 'Japan (JP)' },
  { code: 'BR1', label: 'Brazil (BR)' },
  { code: 'LA1', label: 'Latin America North (LAN)' },
  { code: 'LA2', label: 'Latin America South (LAS)' },
  { code: 'OC1', label: 'Oceania (OCE)' },
  { code: 'TR1', label: 'Turkey (TR)' },
  { code: 'RU', label: 'Russia (RU)' },
] as const;

export function PlayerDashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ─── État du formulaire de liaison Riot ──────────────────
  const [summonerName, setSummonerName] = useState('');
  const [region, setRegion] = useState('EUW1');
  // Force l'affichage du formulaire même si déjà lié (pour changer de compte)
  const [forceLinkForm, setForceLinkForm] = useState(false);

  // ─── Données du joueur connecté ──────────────────────────
  const { data: player } = useQuery({
    queryKey: ['me', 'player'],
    queryFn: () => playerService.getMyProfile(),
    enabled: !!user,
  });

  const { data: applications } = useQuery({
    queryKey: ['applications', 'me'],
    queryFn: () => applicationService.listMine(),
    enabled: !!user,
  });

  // ─── Mutations Riot ──────────────────────────────────────
  const syncMutation = useMutation({
    mutationFn: () => playerService.syncRiotStats(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me', 'player'] });
      notify.success('Stats Riot synchronisees.');
    },
    onError: (err) => notify.apiError(err, 'Erreur lors de la synchronisation.'),
  });

  const linkMutation = useMutation({
    mutationFn: () => playerService.linkRiotAccount(summonerName.trim(), region),
    onSuccess: () => {
      // Une fois lié, on déclenche aussi la sync pour avoir les stats tout de suite
      queryClient.invalidateQueries({ queryKey: ['me', 'player'] });
      notify.success('Compte Riot lie. Recuperation des stats...');
      syncMutation.mutate();
      setForceLinkForm(false);
      setSummonerName('');
    },
    onError: (err) => notify.apiError(err, 'Impossible de lier le compte Riot.'),
  });

  const linkError = linkMutation.isError
    ? isAxiosError(linkMutation.error)
      ? (linkMutation.error.response?.data as { error?: string })?.error ??
        'Impossible de lier le compte Riot.'
      : 'Impossible de lier le compte Riot.'
    : null;

  const syncError = syncMutation.isError
    ? isAxiosError(syncMutation.error)
      ? (syncMutation.error.response?.data as { error?: string })?.error ??
        'Erreur lors de la synchronisation.'
      : 'Erreur lors de la synchronisation.'
    : null;

  const stats = player?.riotAccount?.stats;
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
                <RankBadge tier={stats?.tier} size="sm" />
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

          {player?.riotAccount && !forceLinkForm ? (
            /* ─── Cas 1 : compte déjà lié → infos + bouton sync ─── */
            <>
              <p className="mono">
                <strong>{player.riotAccount.summonerName}</strong>
              </p>
              <p className="text-muted">Région : {player.riotAccount.region}</p>
              {player.riotAccount.lastSyncAt && (
                <p className="text-muted">
                  Dernière sync :{' '}
                  {new Date(player.riotAccount.lastSyncAt).toLocaleString('fr-FR')}
                </p>
              )}

              {stats && (
                <div className={styles.statsInline}>
                  <span className="stat text-gold">{stats.tier}</span>
                  <span className="stat">{Number(stats.winrate).toFixed(1)}% WR</span>
                  <span className="stat">{stats.rankedGamesCount} parties</span>
                </div>
              )}

              <Button
                variant="primary"
                size="sm"
                fullWidth
                isLoading={syncMutation.isPending}
                onClick={() => syncMutation.mutate()}
              >
                Synchroniser maintenant
              </Button>

              {syncMutation.isSuccess && (
                <p className={styles.success}>✅ Stats mises à jour</p>
              )}
              {syncError && <p className={styles.error}>{syncError}</p>}

              <button
                type="button"
                onClick={() => setForceLinkForm(true)}
                className={styles.changeAccount}
              >
                Changer de compte Riot
              </button>
            </>
          ) : (
            /* ─── Cas 2 : pas encore lié → formulaire ─── */
            <>
              <p className="text-muted" style={{ marginBottom: 'var(--space-3)' }}>
                Lie ton compte League of Legends pour importer tes stats automatiquement.
              </p>

              <div className={styles.field}>
                <label htmlFor="riot-id">Riot ID</label>
                <input
                  id="riot-id"
                  type="text"
                  placeholder="ex : ShadowMid#EUW"
                  value={summonerName}
                  onChange={(e) => setSummonerName(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="riot-region">Région</label>
                <select
                  id="riot-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className={styles.input}
                >
                  {REGIONS.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {linkError && <p className={styles.error}>{linkError}</p>}

              <Button
                variant="primary"
                size="sm"
                fullWidth
                isLoading={linkMutation.isPending || syncMutation.isPending}
                disabled={summonerName.trim().length < 3}
                onClick={() => linkMutation.mutate()}
              >
                Lier mon compte Riot
              </Button>

              {linkMutation.isPending && (
                <p
                  className="text-muted"
                  style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-2)' }}
                >
                  Résolution PUUID via Account-V1…
                </p>
              )}
              {syncMutation.isPending && linkMutation.isSuccess && (
                <p
                  className="text-muted"
                  style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--space-2)' }}
                >
                  Récupération des stats Solo/Duo…
                </p>
              )}

              {player?.riotAccount && forceLinkForm && (
                <button
                  type="button"
                  onClick={() => setForceLinkForm(false)}
                  className={styles.changeAccount}
                >
                  Annuler
                </button>
              )}
            </>
          )}
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