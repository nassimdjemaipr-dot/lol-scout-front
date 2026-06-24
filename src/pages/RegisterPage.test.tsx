import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../test/test-utils';
import { RegisterPage } from './RegisterPage';

const loginMock = vi.fn();
const registerMock = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ login: loginMock, isAuthenticated: false, user: null, logout: vi.fn() }),
}));

vi.mock('../services/auth.service', () => ({
  authService: { register: (...args: unknown[]) => registerMock(...args) },
}));

vi.mock('../lib/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn() },
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    loginMock.mockReset();
    registerMock.mockReset();
  });

  it('renders the form fields', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByLabelText(/Je suis/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Mot de passe$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmer le mot de passe/i)).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    renderWithProviders(<RegisterPage />);

    await userEvent.type(screen.getByLabelText(/^Email$/i), 'a@test.com');
    await userEvent.type(screen.getByLabelText(/^Mot de passe$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/Confirmer le mot de passe/i), 'OTHER-password');
    await userEvent.click(screen.getByRole('button', { name: /S'inscrire/i }));

    expect(await screen.findByText(/ne correspondent pas/i)).toBeInTheDocument();
  });

  it('calls register() and login() on successful submit', async () => {
    registerMock.mockResolvedValueOnce({ id: 1, email: 'new@test.com' });
    loginMock.mockResolvedValueOnce(undefined);

    renderWithProviders(<RegisterPage />);
    await userEvent.type(screen.getByLabelText(/^Email$/i), 'new@test.com');
    await userEvent.type(screen.getByLabelText(/^Mot de passe$/i), 'password123');
    await userEvent.type(screen.getByLabelText(/Confirmer le mot de passe/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /S'inscrire/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        email: 'new@test.com',
        password: 'password123',
        role: 'ROLE_PLAYER',
      });
    });
    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('new@test.com', 'password123');
    });
  });

  it('has a link to the login page', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByRole('link', { name: /Connecte-toi/i })).toHaveAttribute('href', '/login');
  });
});