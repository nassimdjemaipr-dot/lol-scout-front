import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '../test/test-utils';
import { ClubDashboardPage } from './ClubDashboardPage';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'club@test.com', role: 'ROLE_CLUB' },
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

describe('ClubDashboardPage', () => {
  it('shows the welcome header with email', () => {
    renderWithProviders(<ClubDashboardPage />);
    expect(screen.getByText(/Mon espace club/i)).toBeInTheDocument();
    expect(screen.getByText(/club@test.com/i)).toBeInTheDocument();
  });

  it('renders the 4 stat boxes', () => {
    renderWithProviders(<ClubDashboardPage />);
    expect(screen.getByText(/Offres actives/i)).toBeInTheDocument();
    // "Candidatures reçues" apparait 2x : stat box + card. On verifie qu'il y a au moins 1.
    expect(screen.getAllByText(/Candidatures reçues/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Shortlist/i)).toBeInTheDocument();
    expect(screen.getByText(/Recrutements/i)).toBeInTheDocument();
  });

  it('has 4 action cards with links', () => {
    renderWithProviders(<ClubDashboardPage />);
    expect(screen.getByRole('link', { name: /Créer une offre/i })).toHaveAttribute('href', '/dashboard/club/offers/new');
    expect(screen.getByRole('link', { name: /Voir mes offres/i })).toHaveAttribute('href', '/dashboard/club/offers');
    expect(screen.getByRole('link', { name: /Voir les candidatures/i })).toHaveAttribute('href', '/dashboard/club/applications');
    expect(screen.getByRole('link', { name: /Lancer une recherche/i })).toHaveAttribute('href', '/players');
  });
});