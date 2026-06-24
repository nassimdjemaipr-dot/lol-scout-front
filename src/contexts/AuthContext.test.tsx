import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '../services/auth.service';

vi.mock('../services/auth.service', () => ({
  authService: {
    me: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
  },
}));

function TestConsumer() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{isLoading ? 'yes' : 'no'}</span>
      <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="email">{user?.email ?? 'no-user'}</span>
      <button onClick={() => login('test@test.com', 'pass')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('throws if useAuth is used outside AuthProvider', () => {
    // On reduit le bruit de la console pendant cette assertion
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(/AuthProvider/);
    consoleSpy.mockRestore();
  });

  it('starts unauthenticated when no token in localStorage', async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('no');
    });
    expect(screen.getByTestId('auth')).toHaveTextContent('no');
  });

  it('loads the user from token at mount if token exists', async () => {
    localStorage.setItem('lol-scout-token', 'existing-token');
    (authService.me as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 1,
      email: 'persisted@test.com',
      role: 'ROLE_PLAYER',
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('email')).toHaveTextContent('persisted@test.com');
    });
    expect(screen.getByTestId('auth')).toHaveTextContent('yes');
  });

  it('cleans up token if me() fails on mount', async () => {
    localStorage.setItem('lol-scout-token', 'bad-token');
    (authService.me as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('401'));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(localStorage.getItem('lol-scout-token')).toBeNull();
    });
  });

  it('login() stores token and fetches user', async () => {
    (authService.login as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ token: 'new-token' });
    (authService.me as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 5,
      email: 'logged@test.com',
      role: 'ROLE_CLUB',
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('no'));

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(localStorage.getItem('lol-scout-token')).toBe('new-token');
      expect(screen.getByTestId('email')).toHaveTextContent('logged@test.com');
    });
  });

  it('logout() clears the token and the user', async () => {
    localStorage.setItem('lol-scout-token', 'existing');
    (authService.me as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 1, email: 'a@b.com', role: 'ROLE_PLAYER',
    });

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId('email')).toHaveTextContent('a@b.com'));

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(localStorage.getItem('lol-scout-token')).toBeNull();
    expect(screen.getByTestId('auth')).toHaveTextContent('no');
  });
});