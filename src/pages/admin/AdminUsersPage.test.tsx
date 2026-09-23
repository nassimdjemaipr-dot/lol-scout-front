import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../../test/test-utils';
import { AdminUsersPage } from './AdminUsersPage';
import { adminService, type AdminUser } from '../../services/admin.service';

vi.mock('../../services/admin.service', () => ({
  adminService: {
    users: vi.fn(),
    setUserStatus: vi.fn(),
  },
}));

const currentUser = { email: 'admin@lolscout.gg', role: 'ROLE_ADMIN' };
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: currentUser }),
}));

const usersMock = adminService.users as ReturnType<typeof vi.fn>;
const statusMock = adminService.setUserStatus as ReturnType<typeof vi.fn>;

function user(id: number, email: string, isActive = true, role = 'ROLE_PLAYER'): AdminUser {
  return {
    id,
    email,
    role: role as AdminUser['role'],
    isActive,
    createdAt: '2026-05-01T10:00:00+00:00',
  };
}

describe('AdminUsersPage', () => {
  beforeEach(() => {
    usersMock.mockReset();
    statusMock.mockReset();
  });

  it('liste les comptes avec leur état', async () => {
    usersMock.mockResolvedValue([
      user(1, 'actif@test.com', true),
      user(2, 'desactive@test.com', false),
    ]);

    renderWithProviders(<AdminUsersPage />);

    await waitFor(() => expect(screen.getByText('actif@test.com')).toBeInTheDocument());
    expect(screen.getByText(/● Actif/)).toBeInTheDocument();
    expect(screen.getByText(/● Désactivé/)).toBeInTheDocument();
  });

  it('filtre par rôle', async () => {
    usersMock.mockResolvedValue([]);
    renderWithProviders(<AdminUsersPage />);

    await waitFor(() => expect(usersMock).toHaveBeenCalledWith({ role: undefined }));

    await userEvent.click(screen.getByRole('button', { name: 'Clubs' }));

    await waitFor(() =>
      expect(usersMock).toHaveBeenLastCalledWith({ role: 'ROLE_CLUB' })
    );
  });

  it('désactive un compte actif', async () => {
    usersMock.mockResolvedValue([user(7, 'cible@test.com', true)]);
    statusMock.mockResolvedValue(user(7, 'cible@test.com', false));

    renderWithProviders(<AdminUsersPage />);

    await waitFor(() => expect(screen.getByText('cible@test.com')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Désactiver' }));

    await waitFor(() => expect(statusMock).toHaveBeenCalledWith(7, false));
  });

  it('réactive un compte désactivé', async () => {
    usersMock.mockResolvedValue([user(8, 'dort@test.com', false)]);
    statusMock.mockResolvedValue(user(8, 'dort@test.com', true));

    renderWithProviders(<AdminUsersPage />);

    await waitFor(() => expect(screen.getByText('dort@test.com')).toBeInTheDocument());
    await userEvent.click(screen.getByRole('button', { name: 'Réactiver' }));

    await waitFor(() => expect(statusMock).toHaveBeenCalledWith(8, true));
  });

  it('interdit à l administrateur de se désactiver lui-même', async () => {
    usersMock.mockResolvedValue([
      user(1, 'admin@lolscout.gg', true, 'ROLE_ADMIN'),
      user(2, 'autre@test.com', true),
    ]);

    renderWithProviders(<AdminUsersPage />);

    await waitFor(() =>
      expect(screen.getByText('admin@lolscout.gg')).toBeInTheDocument()
    );

    const buttons = screen.getAllByRole('button', { name: 'Désactiver' });
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeEnabled();
    expect(screen.getByText('vous')).toBeInTheDocument();
  });

  it('affiche un état vide plutôt qu un tableau sans ligne', async () => {
    usersMock.mockResolvedValue([]);

    renderWithProviders(<AdminUsersPage />);

    await waitFor(() => expect(screen.getByText(/Aucun compte/i)).toBeInTheDocument());
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
