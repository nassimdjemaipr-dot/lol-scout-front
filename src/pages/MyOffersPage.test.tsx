import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../test/test-utils';
import { MyOffersPage } from './MyOffersPage';

const listMineMock = vi.fn();
const updateMock = vi.fn();
const removeMock = vi.fn();

vi.mock('../services/offer.service', () => ({
  offerService: {
    listMine: () => listMineMock(),
    update: (...args: unknown[]) => updateMock(...args),
    remove: (...args: unknown[]) => removeMock(...args),
  },
}));

vi.mock('../lib/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), apiError: vi.fn() },
}));

const activeOffer = {
  id: 41,
  title: 'Recherche SUPPORT Emerald+',
  description: 'Une description suffisamment longue pour le formulaire.',
  wantedRole: 'SUPPORT',
  minimumRank: 'Emerald',
  publishedAt: '2026-09-24T10:00:00+00:00',
  expiresAt: '2026-11-24T10:00:00+00:00',
  isActive: true,
  club: { id: 1, name: 'Phoenix Esport' },
};

const disabledOffer = {
  ...activeOffer,
  id: 37,
  title: 'JUNGLE Master minimum',
  isActive: false,
};

const expiredOffer = {
  ...activeOffer,
  id: 12,
  title: 'ADC Gold+ saison passee',
  expiresAt: '2026-01-15T10:00:00+00:00',
};

describe('MyOffersPage', () => {
  beforeEach(() => {
    listMineMock.mockReset();
    updateMock.mockReset();
    removeMock.mockReset();
  });

  it('affiche les offres du club', async () => {
    listMineMock.mockResolvedValueOnce([activeOffer]);
    renderWithProviders(<MyOffersPage />);

    await waitFor(() => {
      expect(screen.getByText('Recherche SUPPORT Emerald+')).toBeInTheDocument();
    });
  });

  it('affiche les offres desactivees, que le listing public masque', async () => {
    listMineMock.mockResolvedValueOnce([disabledOffer]);
    renderWithProviders(<MyOffersPage />);

    await waitFor(() => {
      expect(screen.getByText('JUNGLE Master minimum')).toBeInTheDocument();
      expect(screen.getByText('Désactivée')).toBeInTheDocument();
    });
  });

  it('distingue une offre expiree d une offre en ligne', async () => {
    listMineMock.mockResolvedValueOnce([expiredOffer]);
    renderWithProviders(<MyOffersPage />);

    await waitFor(() => {
      expect(screen.getByText('Expirée')).toBeInTheDocument();
    });
  });

  it('affiche l etat vide', async () => {
    listMineMock.mockResolvedValueOnce([]);
    renderWithProviders(<MyOffersPage />);

    await waitFor(() => {
      expect(screen.getByText(/aucune offre/i)).toBeInTheDocument();
    });
  });

  it('affiche l etat d erreur', async () => {
    listMineMock.mockRejectedValueOnce(new Error('Network'));
    renderWithProviders(<MyOffersPage />);

    await waitFor(() => {
      expect(screen.getByText(/Impossible de charger/i)).toBeInTheDocument();
    });
  });

  it('desactive une offre en ligne', async () => {
    listMineMock.mockResolvedValue([activeOffer]);
    updateMock.mockResolvedValueOnce({ ...activeOffer, isActive: false });
    renderWithProviders(<MyOffersPage />);

    const button = await screen.findByRole('button', { name: /Désactiver/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith(41, { isActive: false });
    });
  });

  it('remet en ligne une offre desactivee', async () => {
    listMineMock.mockResolvedValue([disabledOffer]);
    updateMock.mockResolvedValueOnce({ ...disabledOffer, isActive: true });
    renderWithProviders(<MyOffersPage />);

    const button = await screen.findByRole('button', { name: /Remettre en ligne/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith(37, { isActive: true });
    });
  });

  it('demande confirmation avant de supprimer', async () => {
    listMineMock.mockResolvedValue([activeOffer]);
    renderWithProviders(<MyOffersPage />);

    await userEvent.click(await screen.findByRole('button', { name: /^Supprimer$/i }));

    expect(screen.getByText(/Supprimer définitivement/i)).toBeInTheDocument();
    expect(removeMock).not.toHaveBeenCalled();
  });

  it('supprime l offre une fois la suppression confirmee', async () => {
    listMineMock.mockResolvedValue([activeOffer]);
    removeMock.mockResolvedValueOnce(undefined);
    renderWithProviders(<MyOffersPage />);

    await userEvent.click(await screen.findByRole('button', { name: /^Supprimer$/i }));
    await userEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    await waitFor(() => {
      expect(removeMock).toHaveBeenCalledWith(41);
    });
  });

  it('annule la suppression sans appeler le service', async () => {
    listMineMock.mockResolvedValue([activeOffer]);
    renderWithProviders(<MyOffersPage />);

    await userEvent.click(await screen.findByRole('button', { name: /^Supprimer$/i }));
    await userEvent.click(screen.getByRole('button', { name: /Annuler/i }));

    await waitFor(() => {
      expect(screen.queryByText(/Supprimer définitivement/i)).not.toBeInTheDocument();
    });
    expect(removeMock).not.toHaveBeenCalled();
  });
});
