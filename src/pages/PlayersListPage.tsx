// Liste des joueurs publique avec filtres (rôle, rang minimum, disponibilité).

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { playerService } from '../services/player.service';
import { PLAYER_ROLES, RANKS, type PlayerRole, type Rank } from '../types';
import { Card } from '../components/ui/Card';
import { RoleBadge } from '../components/ui/RoleBadge';
import { RankBadge } from '../components/ui/RankBadge';
import { Button } from '../components/ui/Button';
import styles from './PlayersListPage.module.css';

export function PlayersListPage() {
  const [filterRole, setFilterRole] = useState<PlayerRole | ''>('');
  const [filterAvailable, setFilterAvailable] = useState<boolean>(false);
  const [filterMinRank, setFilterMinRank] = useState<Rank | ''>('');

  const { data: players, isLoading, isError } = useQuery({
    queryKey: ['players', filterRole, filterAvailable, filterMinRank],
    queryFn: () =>
      playerService.list({
        role: filterRole || undefined,
        available: filterAvailable || undefined,
        minRank: filterMinRank || undefined,
      }),
  });

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>Rechercher des joueurs</h1>
        <p className="text-muted">
          Filtrez par rôle, rang, disponibilité. Tous les joueurs ont des stats
          vérifiées via l'API Riot Games.
        </p>
      </header>

      {/* ─── FILTRES ──────────────────────────────────────── */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>Rôle :</label>
          <div className={styles.chips}>
            <button
              className={`${styles.chip} ${filterRole === '' ? styles.chipActive : ''}`}
              onClick={() => setFilterRole('')}
            >
              Tous
            </button>
            {PLAYER_ROLES.map((r) => (
              <button
                key={r}
                className={`${styles.chip} ${filterRole === r ? styles.chipActive : ''}`}
                onClick={() => setFilterRole(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="min-rank">Rang minimum :</label>
          <select
            id="min-rank"
            className={styles.select}
            value={filterMinRank}
            onChange={(e) => setFilterMinRank(e.target.value as Rank | '')}
          >
            <option value="">Tous les rangs</option>
            {RANKS.map((rank) => (
              <option key={rank} value={rank}>
                {rank} et plus
              </option>
            ))}
          </select>
        </div>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={filterAvailable}
            onChange={(e) => setFilterAvailable(e.target.checked)}
          />
          Disponibles uniquement
        </label>
      </div>

      {/* ─── RÉSULTATS ────────────────────────────────────── */}
      {isLoading && <p className="text-muted text-center">Chargement…</p>}

      {isError && (
        <Card>
          <p className="text-muted text-center">
            Impossible de charger les joueurs. Le back-end est peut-être hors
            ligne.
          </p>
        </Card>
      )}

      {!isLoading && !isError && players && players.length === 0 && (
        <Card>
          <p className="text-muted text-center">
            Aucun joueur ne correspond à ces critères.
          </p>
        </Card>
      )}

      {!isLoading && !isError && players && players.length > 0 && (
        <div className={styles.grid}>
          {players.map((player) => (
            <Link to={`/players/${player.id}`} key={player.id} className={styles.cardLink}>
              <Card hoverable>
                <div className={styles.cardHeader}>
                  <div className={styles.avatar}>{player.pseudo[0]?.toUpperCase()}</div>
                  <div>
                    <h3 className={styles.pseudo}>{player.pseudo}</h3>
                    <RoleBadge role={player.gameRole} size="sm" />
                  </div>
                </div>

                <div className={styles.stats}>
                  <RankBadge tier={player.riotAccount?.stats?.tier} size="sm" />
                  {player.riotAccount?.stats?.winrate && (
                    <span className="stat text-gold">
                      {Number(player.riotAccount.stats.winrate).toFixed(1)}% WR
                    </span>
                  )}
                </div>

                {player.isAvailable && (
                  <div className={styles.available}>● Disponible</div>
                )}

                <Button variant="ghost" size="sm" fullWidth>
                  Voir le profil
                </Button>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
