import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../../test/test-utils';
import { AdminClubsPage } from './AdminClubsPage';
import { adminService, type AdminClub } from '../../services/admin.service';

vi.mock('../../services/admin.service', () => ({
  adminService: {
    clubs: vi.fn(),
    setClubVerified: vi.fn(),
  },
}));

const clubsMock = adminService.clubs as ReturnType<typeof vi.fn>;
const verifyMock = adminService.setClubVerified as ReturnType<typeof vi.fn>;

function club(id: number, name: string, isVerified = false): AdminClub {
  return {
    id,
    name,
    description: 'Un club',
    website: null,
    isVerified,
    owner: { id: id * 10, email: 'owner' + id + '@test.com', isActive: true },
  };
}

describe('AdminClubsPage', () => {
  beforeEach(() => {
    clubsMock.mockReset();
    verifyMock.mockReset();
  });

  it('ouvre sur la file d attente plutôt que sur tous les clubs', async () => {
    clubsMock.mockResolvedValue([]);

    renderWithProviders(<AdminClubsPage />);

    await waitFor(() => expect(clubsMock).toHaveBeenCalledWith(false));
  });

  it('bascule entre les trois filtres', async () => {
    clubsMock.mockResolvedValue([]);
    renderWithProviders(<AdminClubsPage />);

    await waitFor(() => expect(clubsMock).toHaveBeenCalled());

    await userEvent.click(screen.getByRole('button', { name: 'Vérifiés' }));
    await waitFor(() => expect(clubsMock).toHaveBeenLastCalledWith(true));

    await userEvent.click(screen.getByRole('button', { name: 'Tous' }));
    await waitFor(() => expect(clubsMock).toHaveBeenLastCalledWith(undefined));
  });

  it('vérifie un club en attente', async () => {
    clubsMock.mockResolvedValue([club(3, 'Shadow Wolves', false)]);
    verifyMock.mockResolvedValue(club(3, 'Shadow Wolves', true));

    renderWithProviders(<AdminClubsPage />);

    await waitFor(() => expect(screen.getByText('Shadow Wolves')).toBeInTheDocument());
    expect(screen.getByText(/● En attente/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Vérifier ce club/ }));

    await waitFor(() => expect(verifyMock).toHaveBeenCalledWith(3, true));
  });

  it('retire la vérification d un club vérifié', async () => {
    clubsMock.mockResolvedValue([club(4, 'Phoenix', true)]);
    verifyMock.mockResolvedValue(club(4, 'Phoenix', false));

    renderWithProviders(<AdminClubsPage />);

    await waitFor(() => expect(screen.getByText('Phoenix')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: /Retirer la vérification/ }));

    await waitFor(() => expect(verifyMock).toHaveBeenCalledWith(4, false));
  });

  it('signale un club dont le responsable est désactivé', async () => {
    const orphan = club(5, 'Sans Chef', false);
    orphan.owner.isActive = false;
    clubsMock.mockResolvedValue([orphan]);

    renderWithProviders(<AdminClubsPage />);

    await waitFor(() => expect(screen.getByText('Sans Chef')).toBeInTheDocument());
    expect(screen.getByText(/compte désactivé/i)).toBeInTheDocument();
  });

  it('annonce une file vide plutôt que rien', async () => {
    clubsMock.mockResolvedValue([]);

    renderWithProviders(<AdminClubsPage />);

    await waitFor(() =>
      expect(screen.getByText(/Aucun club en attente/i)).toBeInTheDocument()
    );
  });
});
