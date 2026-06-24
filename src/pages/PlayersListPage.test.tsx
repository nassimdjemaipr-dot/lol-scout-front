import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../test/test-utils';
import { PlayersListPage } from './PlayersListPage';

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
});