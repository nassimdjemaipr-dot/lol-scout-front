import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '../test/test-utils';
import { EditPlayerProfilePage } from './EditPlayerProfilePage';

const getMyProfileMock = vi.fn();
const updateMock = vi.fn();

vi.mock('../services/player.service', () => ({
  playerService: {
    getMyProfile: () => getMyProfileMock(),
    update: (...args: unknown[]) => updateMock(...args),
  },
}));

vi.mock('../lib/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), apiError: vi.fn() },
}));

describe('EditPlayerProfilePage', () => {
  beforeEach(() => {
    getMyProfileMock.mockReset();
    updateMock.mockReset();
  });

  it('shows loading state initially', () => {
    getMyProfileMock.mockReturnValueOnce(new Promise(() => {}));
    renderWithProviders(<EditPlayerProfilePage />);
    expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
  });

  it('prefills the form with current profile data', async () => {
    getMyProfileMock.mockResolvedValueOnce({
      id: 1,
      pseudo: 'CurrentPseudo',
      firstName: 'Jean',
      lastName: 'Dupont',
      gameRole: 'MID',
      bio: 'Ma bio actuelle',
      isAvailable: true,
    });

    renderWithProviders(<EditPlayerProfilePage />);

    await waitFor(() => {
      expect((screen.getByLabelText(/Pseudo en jeu/i) as HTMLInputElement).value).toBe('CurrentPseudo');
    });
  });

  it('shows "Profil introuvable" if no profile', async () => {
    getMyProfileMock.mockResolvedValueOnce(null);
    renderWithProviders(<EditPlayerProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/Profil introuvable/i)).toBeInTheDocument();
    });
  });

  it('has Cancel and Save buttons', async () => {
    getMyProfileMock.mockResolvedValueOnce({
      id: 1, pseudo: 'X', firstName: 'A', lastName: 'B', gameRole: 'MID', bio: '', isAvailable: false,
    });
    renderWithProviders(<EditPlayerProfilePage />);

    await waitFor(() => expect(screen.getByLabelText(/Pseudo/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Annuler/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Enregistrer/i })).toBeInTheDocument();
  });
});