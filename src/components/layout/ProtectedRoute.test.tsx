import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

const useAuthMock = vi.fn();
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

function setupRoute(initialPath = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<p>Login Page</p>} />
        <Route path="/" element={<p>Home Page</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/protected" element={<p>Secret Area</p>} />
        </Route>
        <Route element={<ProtectedRoute requiredRole="ROLE_CLUB" />}>
          <Route path="/club" element={<p>Club Area</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('shows a loading state when isLoading is true', () => {
    useAuthMock.mockReturnValue({ isLoading: true, isAuthenticated: false, user: null });
    setupRoute();
    expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
  });

  it('redirects to /login when not authenticated', () => {
    useAuthMock.mockReturnValue({ isLoading: false, isAuthenticated: false, user: null });
    setupRoute('/protected');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders the outlet when authenticated', () => {
    useAuthMock.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: 1, email: 'a@b.com', role: 'ROLE_PLAYER' },
    });
    setupRoute('/protected');
    expect(screen.getByText('Secret Area')).toBeInTheDocument();
  });

  it('redirects to / if requiredRole does not match', () => {
    useAuthMock.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: 1, email: 'a@b.com', role: 'ROLE_PLAYER' }, // pas ROLE_CLUB
    });
    setupRoute('/club');
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('renders the outlet when role matches', () => {
    useAuthMock.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: 1, email: 'a@b.com', role: 'ROLE_CLUB' },
    });
    setupRoute('/club');
    expect(screen.getByText('Club Area')).toBeInTheDocument();
  });
});