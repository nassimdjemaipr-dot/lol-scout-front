import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../test/test-utils';
import { OfferDetailPage } from './OfferDetailPage';

const offerGetMock = vi.fn();
const applyMock = vi.fn();
const useAuthMock = vi.fn();

vi.mock('../services/offer.service', () => ({
  offerService: { get: (id: number) => offerGetMock(id) },
}));

vi.mock('../services/application.service', () => ({
  applicationService: { apply: (...args: unknown[]) => applyMock(...args) },
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('../lib/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), apiError: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useParams: () => ({ id: '7' }) };
});

const fakeOffer = {
  id: 7,
  title: 'Recherche MID Diamond+',
  description: 'Equipe ambitieuse cherche midlaner experimente.',
  wantedRole: 'MID',
  minimumRank: 'Diamond IV',
  isActive: true,
  publishedAt: '2026-05-01',
  expiresAt: null,
  club: { id: 1, name: 'Phoenix Esport' },
};

describe('OfferDetailPage', () => {
  beforeEach(() => {
    offerGetMock.mockReset();
    applyMock.mockReset();
    useAuthMock.mockReset();
  });

  it('shows loading state initially', () => {
    offerGetMock.mockReturnValueOnce(new Promise(() => {})); // never resolves
    useAuthMock.mockReturnValue({ isAuthenticated: false, user: null });

    renderWithProviders(<OfferDetailPage />);
    expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
  });

  it('shows offer details when loaded', async () => {
    offerGetMock.mockResolvedValueOnce(fakeOffer);
    useAuthMock.mockReturnValue({ isAuthenticated: false, user: null });

    renderWithProviders(<OfferDetailPage />);
    await waitFor(() => {
      expect(screen.getByText('Recherche MID Diamond+')).toBeInTheDocument();
      expect(screen.getByText('Phoenix Esport')).toBeInTheDocument();
    });
  });

  it('shows "Offre introuvable" on error', async () => {
    offerGetMock.mockRejectedValueOnce(new Error('Network'));
    useAuthMock.mockReturnValue({ isAuthenticated: false, user: null });

    renderWithProviders(<OfferDetailPage />);
    await waitFor(() => {
      expect(screen.getByText(/Offre introuvable/i)).toBeInTheDocument();
    });
  });

  it('prompts a visitor to log in', async () => {
    offerGetMock.mockResolvedValueOnce(fakeOffer);
    useAuthMock.mockReturnValue({ isAuthenticated: false, user: null });

    renderWithProviders(<OfferDetailPage />);
    await waitFor(() => screen.getByText('Recherche MID Diamond+'));

    expect(screen.getByText(/Connecte-toi/i)).toBeInTheDocument();
  });

  it('shows "Postuler" button for ROLE_PLAYER', async () => {
    offerGetMock.mockResolvedValueOnce(fakeOffer);
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, email: 'p@test.com', role: 'ROLE_PLAYER' },
    });

    renderWithProviders(<OfferDetailPage />);
    await waitFor(() => screen.getByText('Recherche MID Diamond+'));
    expect(screen.getByRole('button', { name: /Postuler/i })).toBeInTheDocument();
  });

  it('submits application when "Envoyer ma candidature" is clicked', async () => {
    offerGetMock.mockResolvedValueOnce(fakeOffer);
    applyMock.mockResolvedValueOnce({ id: 1, status: 'EN_ATTENTE' });
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, email: 'p@test.com', role: 'ROLE_PLAYER' },
    });

    renderWithProviders(<OfferDetailPage />);
    await waitFor(() => screen.getByText('Recherche MID Diamond+'));

    await userEvent.click(screen.getByRole('button', { name: /Postuler/i }));
    await userEvent.type(
      screen.getByLabelText(/Message de motivation/i),
      'Bonjour, je suis tres motive par cette offre.'
    );
    await userEvent.click(screen.getByRole('button', { name: /Envoyer ma candidature/i }));

    await waitFor(() => {
      expect(applyMock).toHaveBeenCalledWith(7, 'Bonjour, je suis tres motive par cette offre.');
    });
  });

  it('shows message for ROLE_CLUB users (cannot apply)', async () => {
    offerGetMock.mockResolvedValueOnce(fakeOffer);
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, email: 'c@test.com', role: 'ROLE_CLUB' },
    });

    renderWithProviders(<OfferDetailPage />);
    await waitFor(() => screen.getByText('Recherche MID Diamond+'));
    expect(screen.getByText(/Seuls les joueurs/i)).toBeInTheDocument();
  });
});