import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../test/test-utils';
import { LoginPage } from './LoginPage';

// Mock du contexte d'auth + du service de notification
const loginMock = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ login: loginMock, isAuthenticated: false, user: null, logout: vi.fn() }),
}));

vi.mock('../lib/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn() },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    loginMock.mockReset();
  });

  it('renders the form fields', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
  });

  it('shows validation errors when fields are empty', async () => {
    renderWithProviders(<LoginPage />);
    await userEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    expect(await screen.findByText(/Email requis/i)).toBeInTheDocument();
    expect(screen.getByText(/Mot de passe requis/i)).toBeInTheDocument();
  });

  it('calls login() with the form values on submit', async () => {
    loginMock.mockResolvedValueOnce(undefined);
    renderWithProviders(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Mot de passe/i), 'mypassword');
    await userEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('test@example.com', 'mypassword');
    });
  });

  it('shows a server error when login fails', async () => {
    loginMock.mockRejectedValueOnce(new Error('Email ou mot de passe incorrect.'));
    renderWithProviders(<LoginPage />);

    await userEvent.type(screen.getByLabelText(/Email/i), 'wrong@test.com');
    await userEvent.type(screen.getByLabelText(/Mot de passe/i), 'badpass');
    await userEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    expect(await screen.findByText(/Email ou mot de passe incorrect/i)).toBeInTheDocument();
  });

  it('has a link to the registration page', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByRole('link', { name: /Inscris-toi/i })).toHaveAttribute('href', '/register');
  });
});