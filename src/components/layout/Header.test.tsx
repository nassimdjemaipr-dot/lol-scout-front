import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';

const useAuthMock = vi.fn();
const logoutMock = vi.fn();
const notifySuccessMock = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('../../lib/notify', () => ({
  notify: { success: (msg: string) => notifySuccessMock(msg), error: vi.fn() },
}));

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
}

describe('Header', () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    logoutMock.mockReset();
    notifySuccessMock.mockReset();
  });

  it('shows the logo and Connexion / Créer un compte when not authenticated', () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false, user: null, logout: logoutMock });
    renderHeader();

    expect(screen.getByText('LoL')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Connexion/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Créer un compte/i })).toBeInTheDocument();
  });

  it('shows player nav items when role is ROLE_PLAYER', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, email: 'p@test.com', role: 'ROLE_PLAYER' },
      logout: logoutMock,
    });
    renderHeader();

    expect(screen.getByText(/🎮 Joueur/)).toBeInTheDocument();
    expect(screen.getByText('Mon profil')).toBeInTheDocument();
  });

  it('shows club nav items when role is ROLE_CLUB', () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, email: 'c@test.com', role: 'ROLE_CLUB' },
      logout: logoutMock,
    });
    renderHeader();

    expect(screen.getByText(/🏆 Club/)).toBeInTheDocument();
    expect(screen.getByText('Mon club')).toBeInTheDocument();
  });

  it('calls logout + shows a notification when Déconnexion is clicked', async () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, email: 'a@b.com', role: 'ROLE_PLAYER' },
      logout: logoutMock,
    });
    renderHeader();

    await userEvent.click(screen.getByRole('button', { name: /Déconnexion/i }));
    expect(logoutMock).toHaveBeenCalled();
    expect(notifySuccessMock).toHaveBeenCalled();
  });
});