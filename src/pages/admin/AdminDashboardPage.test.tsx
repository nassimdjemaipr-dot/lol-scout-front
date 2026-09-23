import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor, within } from '../../test/test-utils';
import { AdminDashboardPage } from './AdminDashboardPage';
import { adminService, type AdminStats } from '../../services/admin.service';

vi.mock('../../services/admin.service', () => ({
  adminService: { stats: vi.fn() },
}));

const statsMock = adminService.stats as ReturnType<typeof vi.fn>;

const stats: AdminStats = {
  users: {
    total: 14,
    inactive: 2,
    byRole: { ROLE_PLAYER: 10, ROLE_CLUB: 3, ROLE_ADMIN: 1 },
  },
  clubs: { total: 3, unverified: 1 },
  players: 6,
  offers: 5,
  applications: 5,
};

/** Carte identifiée par son titre. */
async function findCard(title: RegExp): Promise<HTMLElement> {
  const heading = await screen.findByRole('heading', { name: title });
  return heading.closest('div') as HTMLElement;
}

describe('AdminDashboardPage', () => {
  beforeEach(() => statsMock.mockReset());

  it('affiche les compteurs', async () => {
    statsMock.mockResolvedValue(stats);

    renderWithProviders(<AdminDashboardPage />);

    await waitFor(() => expect(screen.getByText('14')).toBeInTheDocument());
    expect(screen.getByText('Comptes')).toBeInTheDocument();
    expect(screen.getByText('Candidatures')).toBeInTheDocument();
  });

  it('signale les files d attente', async () => {
    statsMock.mockResolvedValue(stats);

    renderWithProviders(<AdminDashboardPage />);

    const clubsCard = await findCard(/Clubs à vérifier/);
    expect(within(clubsCard).getByText(/en attente de vérification/i)).toBeInTheDocument();
    expect(within(clubsCard).getByText('1')).toBeInTheDocument();

    const usersCard = await findCard(/Comptes désactivés/);
    expect(within(usersCard).getByText('2')).toBeInTheDocument();
  });

  it('dit explicitement quand il n y a rien à traiter', async () => {
    statsMock.mockResolvedValue({
      ...stats,
      users: { ...stats.users, inactive: 0 },
      clubs: { total: 3, unverified: 0 },
    });

    renderWithProviders(<AdminDashboardPage />);

    await waitFor(() =>
      expect(screen.getByText(/Aucun club en attente/i)).toBeInTheDocument()
    );
    expect(screen.getByText(/Tous les comptes sont actifs/i)).toBeInTheDocument();
  });

  it('traduit les rôles en libellés lisibles', async () => {
    statsMock.mockResolvedValue(stats);

    renderWithProviders(<AdminDashboardPage />);

    const rolesCard = await findCard(/Répartition des rôles/);
    expect(within(rolesCard).getByText('Joueurs')).toBeInTheDocument();
    expect(within(rolesCard).getByText('Administrateurs')).toBeInTheDocument();
    expect(screen.queryByText('ROLE_PLAYER')).not.toBeInTheDocument();
  });

  it('affiche une erreur lisible si les statistiques ne chargent pas', async () => {
    statsMock.mockRejectedValueOnce(new Error('boom'));

    renderWithProviders(<AdminDashboardPage />);

    await waitFor(() =>
      expect(screen.getByText(/Impossible de charger/i)).toBeInTheDocument()
    );
  });
});
