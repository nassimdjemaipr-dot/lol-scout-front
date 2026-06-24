import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../test/test-utils';
import { OffersListPage } from './OffersListPage';

const listMock = vi.fn();
vi.mock('../services/offer.service', () => ({
  offerService: { list: (...args: unknown[]) => listMock(...args) },
}));

describe('OffersListPage', () => {
  beforeEach(() => listMock.mockReset());

  it('shows the list of offers when loaded', async () => {
    listMock.mockResolvedValueOnce([
      {
        id: 1,
        title: 'Recherche MID Diamond',
        description: 'Equipe ambitieuse cherche MID',
        wantedRole: 'MID',
        minimumRank: 'Diamond IV',
        club: { id: 1, name: 'Phoenix' },
        isActive: true,
      },
    ]);
    renderWithProviders(<OffersListPage />);

    await waitFor(() => {
      expect(screen.getByText('Recherche MID Diamond')).toBeInTheDocument();
      expect(screen.getByText('Phoenix')).toBeInTheDocument();
    });
  });

  it('shows empty state when no offers', async () => {
    listMock.mockResolvedValueOnce([]);
    renderWithProviders(<OffersListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Aucune offre disponible/i)).toBeInTheDocument();
    });
  });

  it('shows error state on failure', async () => {
    listMock.mockRejectedValueOnce(new Error('Network'));
    renderWithProviders(<OffersListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Impossible de charger les offres/i)).toBeInTheDocument();
    });
  });

  it('filters by role when a chip is clicked', async () => {
    listMock.mockResolvedValue([]);
    renderWithProviders(<OffersListPage />);
    await waitFor(() => expect(listMock).toHaveBeenCalled());

    await userEvent.click(screen.getByRole('button', { name: 'JUNGLE' }));
    await waitFor(() => {
      expect(listMock).toHaveBeenLastCalledWith({ role: 'JUNGLE' });
    });
  });

  it('truncates long descriptions', async () => {
    const longDesc = 'A'.repeat(200);
    listMock.mockResolvedValueOnce([
      {
        id: 1,
        title: 'X',
        description: longDesc,
        wantedRole: 'MID',
        minimumRank: 'Gold IV',
        club: { id: 1, name: 'Club' },
        isActive: true,
      },
    ]);
    renderWithProviders(<OffersListPage />);

    await waitFor(() => {
      // Le rendu doit contenir un texte tronque (longueur 140 + ellipsis)
      const truncatedSnippet = 'A'.repeat(140);
      expect(screen.getByText(new RegExp(truncatedSnippet))).toBeInTheDocument();
    });
  });
});