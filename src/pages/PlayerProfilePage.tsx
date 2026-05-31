// Page profil joueur publique. Affiche les stats Riot + les champions joués.

import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { playerService } from '../services/player.service';
import { Card } from '../components/ui/Card';
import { RoleBadge } from '../components/ui/RoleBadge';
import { RankBadge } from '../components/ui/RankBadge';
import styles from './PlayerProfilePage.module.css';

export function PlayerProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data: player, isLoading, isError } = useQuery({
    queryKey: ['player', id],
    queryFn: () => playerService.get(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return <p className="text-center text-muted">Chargement…</p>;
  }

  if (isError || !player) {
    return (
      <div className="container">
        <Card>
          <p className="text-center text-muted">Joueur introuvable.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Variable locale pour alléger les accès imbriqués */}
      {(() => {
        const stats = player.riotAccount?.stats;
        const champions = stats?.playedChampions;
        return (
          <>
            {/* ─── HEADER PROFIL ──────────────────────────────────── */}
            <Card className={styles.profileCard}>
              <div className={styles.avatar}>{player.pseudo[0]?.toUpperCase()}</div>
              <div className={styles.info}>
                <h1 className={styles.pseudo}>{player.pseudo}</h1>
                <div className={styles.badges}>
                  <RoleBadge role={player.gameRole} />
                  <RankBadge tier={stats?.tier} />
                  {player.isAvailable && (
                    <span className={styles.available}>● Disponible</span>
                  )}
                </div>
                {player.bio && <p className={styles.bio}>{player.bio}</p>}
              </div>
            </Card>

            {/* ─── STATS ──────────────────────────────────────────── */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Statistiques classées</h2>
              <div className={styles.statsGrid}>
                <Card className={styles.statBox}>
                  <span className={styles.statLabel}>Winrate</span>
                  <span className={`stat ${styles.statValue}`}>
                    {stats?.winrate ? `${Number(stats.winrate).toFixed(1)}%` : '—'}
                  </span>
                </Card>
                <Card className={styles.statBox}>
                  <span className={styles.statLabel}>KDA moyen</span>
                  <span className={`stat ${styles.statValue}`}>
                    {stats?.averageKda ? Number(stats.averageKda).toFixed(2) : '—'}
                  </span>
                </Card>
                <Card className={styles.statBox}>
                  <span className={styles.statLabel}>CS / min</span>
                  <span className={`stat ${styles.statValue}`}>
                    {stats?.csPerMinute ? Number(stats.csPerMinute).toFixed(1) : '—'}
                  </span>
                </Card>
                <Card className={styles.statBox}>
                  <span className={styles.statLabel}>Vision</span>
                  <span className={`stat ${styles.statValue}`}>
                    {stats?.visionScore ? Number(stats.visionScore).toFixed(1) : '—'}
                  </span>
                </Card>
                <Card className={styles.statBox}>
                  <span className={styles.statLabel}>Parties classées</span>
                  <span className={`stat ${styles.statValue}`}>
                    {stats?.rankedGamesCount ?? '—'}
                  </span>
                </Card>
              </div>
            </section>

            {/* ─── CHAMPIONS JOUÉS ────────────────────────────────── */}
            {champions && champions.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Champions phares</h2>
                <div className={styles.championsGrid}>
                  {champions.map((champ) => (
                    <Card key={champ.id} className={styles.champCard}>
                      <h4 className={styles.champName}>{champ.championName}</h4>
                      <div className={styles.champStats}>
                        <span className="stat">{champ.gamesPlayed} parties</span>
                        <span className="stat text-gold">
                          {Number(champ.winrate).toFixed(1)}% WR
                        </span>
                        <span className="stat">KDA {Number(champ.kda).toFixed(2)}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        );
      })()}
    </div>
  );
}
