import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../test/test-utils';
import { ClubApplicationsPage } from './ClubApplicationsPage';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

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

const secondMidApplication = {
  ...fakeApplication,
  id: 43,
  player: { ...fakeApplication.player, id: 2, pseudo: 'FaastHands' },
};

const otherOfferApplication = {
  ...fakeApplication,
  id: 44,
  player: { ...fakeApplication.player, id: 2, pseudo: 'JungleKing', gameRole: 'JUNGLE' },
  offer: { id: 8, title: 'Recherche JUNGLE' },
};

describe('ClubApplicationsPage', () => {
  beforeEach(() => {
    listForClubMock.mockReset();
    updateStatusMock.mockReset();
    navigateMock.mockReset();
  });

  it('renders received applications', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication]);
    renderWithProviders(<ClubApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText('ShadowMid')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Recherche MID/ })).toBeInTheDocument();
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
  // ─── Filtrage par offre et recherche ──────────────────────

  it('filtre les candidatures sur une offre', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication, otherOfferApplication]);
    renderWithProviders(<ClubApplicationsPage />);

    await screen.findByText('ShadowMid');
    await userEvent.click(screen.getByRole('button', { name: /Recherche JUNGLE \(1\)/ }));

    expect(screen.queryByText('ShadowMid')).not.toBeInTheDocument();
    expect(screen.getByText('JungleKing')).toBeInTheDocument();
  });

  it('revient a toutes les offres', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication, otherOfferApplication]);
    renderWithProviders(<ClubApplicationsPage />);

    await screen.findByText('ShadowMid');
    await userEvent.click(screen.getByRole('button', { name: /Recherche JUNGLE \(1\)/ }));
    await userEvent.click(screen.getByRole('button', { name: /Toutes les offres/ }));

    expect(screen.getByText('ShadowMid')).toBeInTheDocument();
    expect(screen.getByText('JungleKing')).toBeInTheDocument();
  });

  it('recherche un candidat par pseudo', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication, otherOfferApplication]);
    renderWithProviders(<ClubApplicationsPage />);

    await screen.findByText('ShadowMid');
    await userEvent.type(screen.getByRole('searchbox'), 'jungle');

    expect(screen.getByText('JungleKing')).toBeInTheDocument();
    expect(screen.queryByText('ShadowMid')).not.toBeInTheDocument();
  });

  it('signale une recherche sans resultat', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication]);
    renderWithProviders(<ClubApplicationsPage />);

    await screen.findByText('ShadowMid');
    await userEvent.type(screen.getByRole('searchbox'), 'zzzz');

    expect(screen.getByText(/Aucune candidature ne correspond/i)).toBeInTheDocument();
  });

  // ─── Selection pour la comparaison ────────────────────────

  it('ne compare pas avant deux candidats selectionnes', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication, secondMidApplication]);
    renderWithProviders(<ClubApplicationsPage />);

    const toggles = await screen.findAllByRole('button', { name: /Ajouter .+ la comparaison/i });
    await userEvent.click(toggles[0]);

    expect(screen.getByText(/il en faut au moins deux/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Comparer$/ })).toBeDisabled();
  });

  it('compare les candidats explicitement selectionnes', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication, secondMidApplication]);
    renderWithProviders(<ClubApplicationsPage />);

    const toggles = await screen.findAllByRole('button', { name: /Ajouter .+ la comparaison/i });
    await userEvent.click(toggles[0]);
    await userEvent.click(toggles[1]);
    await userEvent.click(screen.getByRole('button', { name: /^Comparer$/ }));

    expect(navigateMock).toHaveBeenCalledWith('/players/compare?ids=1,2');
  });

  it('verrouille la selection sur une seule offre', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication, otherOfferApplication]);
    renderWithProviders(<ClubApplicationsPage />);

    const toggles = await screen.findAllByRole('button', { name: /Ajouter .+ la comparaison/i });
    await userEvent.click(toggles[0]);

    expect(screen.getAllByRole('button', { name: /Ajouter .+ la comparaison/i })[0]).toBeDisabled();
    expect(screen.getByText(/comparaison en cours sur une autre offre/i)).toBeInTheDocument();
  });

  it('deselectionne un candidat et libere l offre', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication, otherOfferApplication]);
    renderWithProviders(<ClubApplicationsPage />);

    const toggles = await screen.findAllByRole('button', { name: /Ajouter .+ la comparaison/i });
    await userEvent.click(toggles[0]);
    await userEvent.click(screen.getByRole('button', { name: /lectionn/i }));

    expect(screen.queryByRole('button', { name: /^Comparer$/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/comparaison en cours sur une autre offre/i)).not.toBeInTheDocument();
  });

  it('plafonne la selection a trois candidats', async () => {
    listForClubMock.mockResolvedValueOnce([
      fakeApplication,
      secondMidApplication,
      { ...fakeApplication, id: 46, player: { ...fakeApplication.player, id: 3, pseudo: 'P3' } },
      { ...fakeApplication, id: 47, player: { ...fakeApplication.player, id: 4, pseudo: 'P4' } },
    ]);
    renderWithProviders(<ClubApplicationsPage />);

    const toggles = await screen.findAllByRole('button', { name: /Ajouter .+ la comparaison/i });
    await userEvent.click(toggles[0]);
    await userEvent.click(toggles[1]);
    await userEvent.click(toggles[2]);

    expect(screen.getByText(/maximum atteint/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ajouter .+ la comparaison/i })).toBeDisabled();
  });

  it('compte les candidatures de chaque offre', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication, secondMidApplication]);
    renderWithProviders(<ClubApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText(/2 candidatures/)).toBeInTheDocument();
    });
  });
});