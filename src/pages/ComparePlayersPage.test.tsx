import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor, within } from '../test/test-utils';
import { ComparePlayersPage } from './ComparePlayersPage';
import { bestIndexes, tierRank } from '../lib/comparison';
import type { Player } from '../types';

const getMock = vi.fn();
vi.mock('../services/player.service', () => ({
  playerService: {
    get: (...args: unknown[]) => getMock(...args),
  },
}));

function player(
  id: number,
  pseudo: string,
  stats: Partial<{
    tier: string;
    winrate: string;
    averageKda: string;
    csPerMinute: string;
    visionScore: string;
    rankedGamesCount: number;
  }> | null
): Player {
  return {
    id,
    pseudo,
    gameRole: 'MID',
    isAvailable: true,
    riotAccount: stats
      ? {
          id,
          summonerName: pseudo + '#EUW',
          puuid: 'puuid-' + id,
          region: 'EUW1',
          stats: {
            id,
            tier: stats.tier ?? 'Gold IV',
            winrate: stats.winrate ?? '50',
            averageKda: stats.averageKda ?? '3',
            csPerMinute: stats.csPerMinute ?? '6',
            visionScore: stats.visionScore ?? '30',
            rankedGamesCount: stats.rankedGamesCount ?? 100,
          },
        }
      : undefined,
  };
}

/** Le joueur mis en évidence sur une ligne donnée. */
function winnersOf(label: string): string[] {
  const row = screen.getByRole('rowheader', { name: label }).closest('tr');
  const cells = Array.from(row!.querySelectorAll('td'));
  const headers = Array.from(
    document.querySelectorAll('thead th')
  ).slice(1);

  return cells
    .map((cell, index) =>
      /best/.test(cell.className) ? headers[index]?.textContent ?? '' : null
    )
    .filter((v): v is string => v !== null);
}

describe('tierRank', () => {
  it('classe les paliers du plus bas au plus haut', () => {
    expect(tierRank('Iron IV')).toBeLessThan(tierRank('Gold I'));
    expect(tierRank('Gold I')).toBeLessThan(tierRank('Challenger'));
  });

  it('place Emerald entre Platinum et Diamond', () => {
    expect(tierRank('Emerald I')).toBeGreaterThan(tierRank('Platinum I'));
    expect(tierRank('Emerald I')).toBeLessThan(tierRank('Diamond IV'));
  });

  it('retourne -1 pour un rang absent ou inconnu', () => {
    expect(tierRank(undefined)).toBe(-1);
    expect(tierRank('Unranked')).toBe(-1);
  });
});

describe('bestIndexes', () => {
  it('designe la valeur la plus elevee', () => {
    expect(bestIndexes([1, 5, 3])).toEqual([1]);
  });

  it('designe toutes les valeurs en cas d egalite', () => {
    expect(bestIndexes([4, 4, 2])).toEqual([0, 1]);
  });

  it('ignore les valeurs absentes', () => {
    expect(bestIndexes([null, 7, 2])).toEqual([1]);
  });

  it('ne designe personne s il n y a pas de quoi comparer', () => {
    expect(bestIndexes([null, null])).toEqual([]);
    expect(bestIndexes([5, null])).toEqual([]);
  });
});

describe('ComparePlayersPage', () => {
  beforeEach(() => getMock.mockReset());

  it('demande au moins deux joueurs', () => {
    renderWithProviders(<ComparePlayersPage />, {
      initialEntries: ['/players/compare?ids=1'],
    });

    expect(screen.getByText(/au moins deux joueurs/i)).toBeInTheDocument();
    expect(getMock).not.toHaveBeenCalled();
  });

  it('met en evidence le meilleur sur chaque critere classable', async () => {
    getMock.mockImplementation((id: number) =>
      Promise.resolve(
        id === 1
          ? player(1, 'Alpha', { tier: 'Diamond II', winrate: '62', averageKda: '3.1' })
          : player(2, 'Beta', { tier: 'Master I', winrate: '55', averageKda: '4.4' })
      )
    );

    renderWithProviders(<ComparePlayersPage />, {
      initialEntries: ['/players/compare?ids=1,2'],
    });

    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

    expect(winnersOf('Rang')).toEqual([expect.stringContaining('Beta')]);
    expect(winnersOf('Taux de victoire')).toEqual([expect.stringContaining('Alpha')]);
    expect(winnersOf('KDA moyen')).toEqual([expect.stringContaining('Beta')]);
  });

  it('ne classe pas les criteres de contexte', async () => {
    getMock.mockImplementation((id: number) =>
      Promise.resolve(player(id, 'P' + id, { rankedGamesCount: id * 100 }))
    );

    renderWithProviders(<ComparePlayersPage />, {
      initialEntries: ['/players/compare?ids=1,2'],
    });

    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

    expect(winnersOf('Parties classées')).toEqual([]);
    expect(winnersOf('Disponibilité')).toEqual([]);
    expect(winnersOf('Poste')).toEqual([]);
  });

  it('affiche un tiret pour un joueur sans compte Riot, sans le declarer gagnant', async () => {
    getMock.mockImplementation((id: number) =>
      Promise.resolve(
        id === 1 ? player(1, 'Alpha', { winrate: '58' }) : player(2, 'Beta', null)
      )
    );

    renderWithProviders(<ComparePlayersPage />, {
      initialEntries: ['/players/compare?ids=1,2'],
    });

    await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());

    const row = screen.getByRole('rowheader', { name: 'Taux de victoire' }).closest('tr');
    expect(within(row!).getByText('—')).toBeInTheDocument();
    expect(winnersOf('Taux de victoire')).toEqual([]);
  });

  it('ne compare jamais plus de trois joueurs', async () => {
    getMock.mockImplementation((id: number) => Promise.resolve(player(id, 'P' + id, {})));

    renderWithProviders(<ComparePlayersPage />, {
      initialEntries: ['/players/compare?ids=1,2,3,4,5'],
    });

    await waitFor(() => expect(getMock).toHaveBeenCalled());
    expect(getMock).toHaveBeenCalledTimes(3);
  });
});
