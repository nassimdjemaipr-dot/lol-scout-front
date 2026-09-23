// Comparaison de 2 à 3 joueurs côte à côte.
// Les identifiants arrivent par l'URL : /players/compare?ids=1,2,3

import { useQueries } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { playerService } from '../services/player.service';
import { type Player } from '../types';
import {
  bestIndexes,
  formatValue,
  parseComparisonIds,
  tierRank,
  toNumber,
} from '../lib/comparison';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RankBadge } from '../components/ui/RankBadge';
import { RoleBadge } from '../components/ui/RoleBadge';
import styles from './ComparePlayersPage.module.css';

interface Criterion {
  label: string;
  /** Valeur comparable, null si non renseignée. */
  value: (p: Player) => number | null;
  /** Rendu affiché. */
  render: (p: Player) => React.ReactNode;
  /** Un critère de contexte n'a pas de gagnant. */
  context?: boolean;
}

const CRITERIA: Criterion[] = [
  {
    label: 'Poste',
    value: () => null,
    render: (p) => <RoleBadge role={p.gameRole} size="sm" />,
    context: true,
  },
  {
    label: 'Rang',
    value: (p) => {
      const r = tierRank(p.riotAccount?.stats?.tier);
      return r < 0 ? null : r;
    },
    render: (p) => <RankBadge tier={p.riotAccount?.stats?.tier} size="sm" />,
  },
  {
    label: 'Taux de victoire',
    value: (p) => toNumber(p.riotAccount?.stats?.winrate),
    render: (p) => formatValue(p.riotAccount?.stats?.winrate, ' %'),
  },
  {
    label: 'KDA moyen',
    value: (p) => toNumber(p.riotAccount?.stats?.averageKda),
    render: (p) => formatValue(p.riotAccount?.stats?.averageKda),
  },
  {
    label: 'CS par minute',
    value: (p) => toNumber(p.riotAccount?.stats?.csPerMinute),
    render: (p) => formatValue(p.riotAccount?.stats?.csPerMinute),
  },
  {
    label: 'Score de vision',
    value: (p) => toNumber(p.riotAccount?.stats?.visionScore),
    render: (p) => formatValue(p.riotAccount?.stats?.visionScore),
  },
  {
    label: 'Parties classées',
    value: () => null,
    render: (p) => p.riotAccount?.stats?.rankedGamesCount ?? '—',
    context: true,
  },
  {
    label: 'Disponibilité',
    value: () => null,
    render: (p) =>
      p.isAvailable ? (
        <span className={styles.available}>● Disponible</span>
      ) : (
        <span className="text-muted">Non disponible</span>
      ),
    context: true,
  },
];


export function ComparePlayersPage() {
  const [searchParams] = useSearchParams();

  const ids = parseComparisonIds(searchParams.get('ids'));

  // Aucune requete tant que la comparaison n a pas de sens : un seul
  // identifiant ne compare rien, et chaque appel coute une requete.
  const enabled = ids.length >= 2;

  const results = useQueries({
    queries: enabled
      ? ids.map((id) => ({
          queryKey: ['player', id],
          queryFn: () => playerService.get(id),
        }))
      : [],
  });

  const isLoading = results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);
  const players = results.map((r) => r.data).filter((p): p is Player => !!p);

  if (!enabled) {
    return (
      <div className="container">
        <Card>
          <p className="text-muted text-center">
            Sélectionne au moins deux joueurs depuis la liste pour les comparer.
          </p>
          <Link to="/players">
            <Button variant="primary" size="sm" fullWidth>
              Retour à la liste
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container">
      <header className={styles.header}>
        <h1>Comparaison</h1>
        <p className="text-muted">
          La meilleure valeur de chaque ligne est mise en évidence. Les lignes
          grisées sont des éléments de contexte, qu&apos;on ne classe pas.
        </p>
      </header>

      {isLoading && <p className="text-muted text-center">Chargement…</p>}

      {isError && (
        <Card>
          <p className="text-muted text-center">
            Impossible de charger un ou plusieurs profils.
          </p>
        </Card>
      )}

      {!isLoading && !isError && players.length >= 2 && (
        <Card>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.criterion}>Critère</th>
                  {players.map((p) => (
                    <th key={p.id}>
                      <Link to={`/players/${p.id}`} className={styles.playerLink}>
                        {p.pseudo}
                      </Link>
                      {p.riotAccount?.summonerName && (
                        <div className="mono text-muted">
                          {p.riotAccount.summonerName}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CRITERIA.map((criterion) => {
                  const winners = criterion.context
                    ? []
                    : bestIndexes(players.map(criterion.value));

                  return (
                    <tr
                      key={criterion.label}
                      className={criterion.context ? styles.contextRow : undefined}
                    >
                      <th scope="row" className={styles.criterion}>
                        {criterion.label}
                      </th>
                      {players.map((p, index) => (
                        <td
                          key={p.id}
                          className={winners.includes(index) ? styles.best : undefined}
                        >
                          {criterion.render(p)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className={styles.caveat}>
            Un taux de victoire se lit avec le nombre de parties : 70 % sur
            quinze parties ne vaut pas 58 % sur trois cents. C&apos;est pourquoi
            le nombre de parties classées figure ici sans être classé.
          </p>

          <Link to="/players">
            <Button variant="ghost" size="sm" fullWidth>
              Retour à la liste
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
