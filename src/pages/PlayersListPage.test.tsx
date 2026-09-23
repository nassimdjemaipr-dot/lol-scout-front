import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../test/test-utils';
import { PlayersListPage } from './PlayersListPage';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

const listMock = vi.fn();
vi.mock('../services/player.service', () => ({
  playerService: {
    list: (...args: unknown[]) => listMock(...args),
  },
}));

describe('PlayersListPage', () => {
  beforeEach(() => listMock.mockReset());

  it('shows loading then list', async () => {
    listMock.mockResolvedValueOnce([
      { id: 1, pseudo: 'ShadowMid', gameRole: 'MID', isAvailable: true, riotAccount: null },
    ]);

    renderWithProviders(<PlayersListPage />);
    await waitFor(() => {
      expect(screen.getByText('ShadowMid')).toBeInTheDocument();
    });
  });

  it('shows empty state when no players match', async () => {
    listMock.mockResolvedValueOnce([]);
    renderWithProviders(<PlayersListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Aucun joueur/i)).toBeInTheDocument();
    });
  });

  it('shows error state on failure', async () => {
    listMock.mockRejectedValueOnce(new Error('Network'));
    renderWithProviders(<PlayersListPage />);

    await waitFor(() => {
      expect(screen.getByText(/Impossible de charger/i)).toBeInTheDocument();
    });
  });

  it('filters by minimum rank and sends minRank to the API', async () => {
    listMock.mockResolvedValue([]);
    renderWithProviders(<PlayersListPage />);

    await waitFor(() => expect(listMock).toHaveBeenCalled());

    await userEvent.selectOptions(screen.getByLabelText(/Rang minimum/i), 'Diamond');

    await waitFor(() =>
      expect(listMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ minRank: 'Diamond' })
      )
    );
  });

  it('omits minRank when no rank is selected', async () => {
    listMock.mockResolvedValue([]);
    renderWithProviders(<PlayersListPage />);

    await waitFor(() =>
      expect(listMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ minRank: undefined })
      )
    );
  });

  it('offers every rank from Iron to Challenger', async () => {
    listMock.mockResolvedValue([]);
    renderWithProviders(<PlayersListPage />);

    const select = await screen.findByLabelText(/Rang minimum/i);
    const options = Array.from(select.querySelectorAll('option')).map((o) => o.value);

    expect(options).toEqual(['', 'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger']);
  });
  it('filters by role when clicking a chip', async () => {
    listMock.mockResolvedValue([]);
    renderWithProviders(<PlayersListPage />);

    // Attendre le premier rendu (filtre vide)
    await waitFor(() => expect(listMock).toHaveBeenCalled());

    // Click sur le chip "ADC"
    await userEvent.click(screen.getByRole('button', { name: 'ADC' }));

    await waitFor(() => {
      expect(listMock).toHaveBeenLastCalledWith({ role: 'ADC', available: undefined });
    });
  });

  it('toggles available filter', async () => {
    listMock.mockResolvedValue([]);
    renderWithProviders(<PlayersListPage />);
    await waitFor(() => expect(listMock).toHaveBeenCalled());

    await userEvent.click(screen.getByLabelText(/Disponibles uniquement/i));
    await waitFor(() => {
      expect(listMock).toHaveBeenLastCalledWith({ role: undefined, available: true });
    });
  });
  describe('sélection pour comparaison', () => {
    beforeEach(() => navigateMock.mockReset());

    it('ne propose pas de comparer avant deux joueurs', async () => {
      listMock.mockResolvedValue([
      { id: 1, pseudo: 'Alpha', gameRole: 'MID', isAvailable: true, riotAccount: null },
      { id: 2, pseudo: 'Beta', gameRole: 'ADC', isAvailable: true, riotAccount: null },
      { id: 3, pseudo: 'Gamma', gameRole: 'TOP', isAvailable: true, riotAccount: null },
      { id: 4, pseudo: 'Delta', gameRole: 'SUPPORT', isAvailable: true, riotAccount: null },
      ]);
      renderWithProviders(<PlayersListPage />);

      await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());

      const toggles = screen.getAllByRole('button', { name: /Ajouter à la comparaison/ });
      await userEvent.click(toggles[0]);

      expect(screen.getByText(/il en faut au moins deux/i)).toBeInTheDocument();
    });

    it('navigue vers la comparaison avec les identifiants choisis', async () => {
      listMock.mockResolvedValue([
      { id: 1, pseudo: 'Alpha', gameRole: 'MID', isAvailable: true, riotAccount: null },
      { id: 2, pseudo: 'Beta', gameRole: 'ADC', isAvailable: true, riotAccount: null },
      { id: 3, pseudo: 'Gamma', gameRole: 'TOP', isAvailable: true, riotAccount: null },
      { id: 4, pseudo: 'Delta', gameRole: 'SUPPORT', isAvailable: true, riotAccount: null },
      ]);
      renderWithProviders(<PlayersListPage />);

      await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());

      const toggles = screen.getAllByRole('button', { name: /Ajouter à la comparaison/ });
      await userEvent.click(toggles[0]);
      await userEvent.click(toggles[1]);

      await userEvent.click(screen.getByRole('button', { name: /^Comparer$/ }));

      expect(navigateMock).toHaveBeenCalledWith('/players/compare?ids=1,2');
    });

    it('plafonne la sélection à trois joueurs', async () => {
      listMock.mockResolvedValue([
      { id: 1, pseudo: 'Alpha', gameRole: 'MID', isAvailable: true, riotAccount: null },
      { id: 2, pseudo: 'Beta', gameRole: 'ADC', isAvailable: true, riotAccount: null },
      { id: 3, pseudo: 'Gamma', gameRole: 'TOP', isAvailable: true, riotAccount: null },
      { id: 4, pseudo: 'Delta', gameRole: 'SUPPORT', isAvailable: true, riotAccount: null },
      ]);
      renderWithProviders(<PlayersListPage />);

      await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());

      const toggles = screen.getAllByRole('button', { name: /Ajouter à la comparaison/ });
      await userEvent.click(toggles[0]);
      await userEvent.click(toggles[1]);
      await userEvent.click(toggles[2]);

      expect(screen.getByText(/maximum atteint/i)).toBeInTheDocument();
      expect(toggles[3]).toBeDisabled();
    });

    it('permet de désélectionner un joueur', async () => {
      listMock.mockResolvedValue([
      { id: 1, pseudo: 'Alpha', gameRole: 'MID', isAvailable: true, riotAccount: null },
      { id: 2, pseudo: 'Beta', gameRole: 'ADC', isAvailable: true, riotAccount: null },
      { id: 3, pseudo: 'Gamma', gameRole: 'TOP', isAvailable: true, riotAccount: null },
      { id: 4, pseudo: 'Delta', gameRole: 'SUPPORT', isAvailable: true, riotAccount: null },
      ]);
      renderWithProviders(<PlayersListPage />);

      await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());

      const toggles = screen.getAllByRole('button', { name: /Ajouter à la comparaison/ });
      await userEvent.click(toggles[0]);
      expect(screen.getByText(/1 joueur/)).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: /Sélectionné/ }));
      expect(screen.queryByText(/1 joueur/)).not.toBeInTheDocument();
    });
  });
});