import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../test/test-utils';
import { ClubApplicationsPage } from './ClubApplicationsPage';

const listForClubMock = vi.fn();
const updateStatusMock = vi.fn();

vi.mock('../services/application.service', () => ({
  applicationService: {
    listForClub: () => listForClubMock(),
    updateStatus: (...args: unknown[]) => updateStatusMock(...args),
  },
}));

vi.mock('../lib/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), apiError: vi.fn() },
}));

const fakeApplication = {
  id: 42,
  status: 'EN_ATTENTE',
  message: 'Bonjour je suis interesse',
  appliedAt: '2026-05-31',
  player: {
    id: 1,
    pseudo: 'ShadowMid',
    gameRole: 'MID',
    riotAccount: { stats: { tier: 'Diamond II' } },
  },
  offer: { id: 7, title: 'Recherche MID' },
};

describe('ClubApplicationsPage', () => {
  beforeEach(() => {
    listForClubMock.mockReset();
    updateStatusMock.mockReset();
  });

  it('renders received applications', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication]);
    renderWithProviders(<ClubApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText('ShadowMid')).toBeInTheDocument();
      expect(screen.getByText(/Recherche MID/)).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    listForClubMock.mockResolvedValueOnce([]);
    renderWithProviders(<ClubApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Aucune candidature/i)).toBeInTheDocument();
    });
  });

  it('shows error state', async () => {
    listForClubMock.mockRejectedValueOnce(new Error('Network'));
    renderWithProviders(<ClubApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Impossible de charger/i)).toBeInTheDocument();
    });
  });

  it('accepts a pending application', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication]);
    updateStatusMock.mockResolvedValueOnce({ ...fakeApplication, status: 'ACCEPTEE' });

    renderWithProviders(<ClubApplicationsPage />);
    await waitFor(() => screen.getByText('ShadowMid'));

    await userEvent.click(screen.getByRole('button', { name: /Accepter/i }));

    expect(updateStatusMock).toHaveBeenCalledWith(42, 'ACCEPTEE');
  });

  it('rejects a pending application', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication]);
    updateStatusMock.mockResolvedValueOnce({ ...fakeApplication, status: 'REFUSEE' });

    renderWithProviders(<ClubApplicationsPage />);
    await waitFor(() => screen.getByText('ShadowMid'));

    await userEvent.click(screen.getByRole('button', { name: /Refuser/i }));

    expect(updateStatusMock).toHaveBeenCalledWith(42, 'REFUSEE');
  });
  it('affiche le pseudo du joueur, pas un libelle generique', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication]);
    renderWithProviders(<ClubApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText('ShadowMid')).toBeInTheDocument();
    });
    expect(screen.queryByText('Joueur')).not.toBeInTheDocument();
  });

  it('lie le pseudo au profil du joueur', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication]);
    renderWithProviders(<ClubApplicationsPage />);

    const link = await screen.findByRole('link', { name: 'ShadowMid' });
    expect(link).toHaveAttribute('href', '/players/1');
  });

  it('lie le rappel de l offre a son detail', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication]);
    renderWithProviders(<ClubApplicationsPage />);

    const link = await screen.findByRole('link', { name: /Recherche MID/ });
    expect(link).toHaveAttribute('href', '/offers/7');
  });

  it('propose Voir le profil meme sur une candidature deja traitee', async () => {
    listForClubMock.mockResolvedValueOnce([{ ...fakeApplication, status: 'ACCEPTEE' }]);
    renderWithProviders(<ClubApplicationsPage />);

    const link = await screen.findByRole('link', { name: /Voir le profil/i });
    expect(link).toHaveAttribute('href', '/players/1');
    expect(screen.queryByRole('button', { name: /Accepter/i })).not.toBeInTheDocument();
  });
  it('propose la comparaison quand une offre recoit deux candidatures', async () => {
    listForClubMock.mockResolvedValueOnce([
      fakeApplication,
      { ...fakeApplication, id: 43, player: { ...fakeApplication.player, id: 2, pseudo: "JungleKing" } },
    ]);
    renderWithProviders(<ClubApplicationsPage />);

    const link = await screen.findByRole('link', { name: /Comparer les 2 candidats/i });
    expect(link).toHaveAttribute('href', '/players/compare?ids=1,2');
  });

  it('ne propose pas la comparaison sur une offre a candidat unique', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication]);
    renderWithProviders(<ClubApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText('ShadowMid')).toBeInTheDocument();
    });
    expect(screen.queryByRole('link', { name: /Comparer/i })).not.toBeInTheDocument();
  });

  it('ne compare pas des candidats de deux offres differentes', async () => {
    listForClubMock.mockResolvedValueOnce([
      fakeApplication,
      {
        ...fakeApplication,
        id: 44,
        player: { ...fakeApplication.player, id: 2, pseudo: "JungleKing" },
        offer: { id: 8, title: 'Recherche JUNGLE' },
      },
    ]);
    renderWithProviders(<ClubApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Recherche JUNGLE/ })).toBeInTheDocument();
    });
    expect(screen.queryByRole('link', { name: /Comparer/i })).not.toBeInTheDocument();
  });

  it('plafonne la comparaison a trois candidats', async () => {
    listForClubMock.mockResolvedValueOnce([
      fakeApplication,
      { ...fakeApplication, id: 45, player: { ...fakeApplication.player, id: 2, pseudo: "P2" } },
      { ...fakeApplication, id: 46, player: { ...fakeApplication.player, id: 3, pseudo: "P3" } },
      { ...fakeApplication, id: 47, player: { ...fakeApplication.player, id: 4, pseudo: "P4" } },
    ]);
    renderWithProviders(<ClubApplicationsPage />);

    const link = await screen.findByRole('link', { name: /Comparer les 3 premiers/i });
    expect(link).toHaveAttribute('href', '/players/compare?ids=1,2,3');
  });

  it('compte les candidatures de chaque offre', async () => {
    listForClubMock.mockResolvedValueOnce([
      fakeApplication,
      { ...fakeApplication, id: 48, player: { ...fakeApplication.player, id: 2, pseudo: "P2" } },
    ]);
    renderWithProviders(<ClubApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText('2 candidatures')).toBeInTheDocument();
    });
  });
});