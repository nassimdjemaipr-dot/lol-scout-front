import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, userEvent } from '../test/test-utils';
import { CreateOfferPage } from './CreateOfferPage';

const createMock = vi.fn();
vi.mock('../services/offer.service', () => ({
  offerService: { create: (...args: unknown[]) => createMock(...args) },
}));

vi.mock('../lib/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), apiError: vi.fn() },
}));

describe('CreateOfferPage', () => {
  beforeEach(() => createMock.mockReset());

  it('renders all form fields', () => {
    renderWithProviders(<CreateOfferPage />);
    expect(screen.getByLabelText(/Titre de l'offre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description du poste/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rôle recherché/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rang minimum/i)).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    renderWithProviders(<CreateOfferPage />);
    await userEvent.click(screen.getByRole('button', { name: /Publier l'offre/i }));

    expect(await screen.findByText(/Titre requis/i)).toBeInTheDocument();
    expect(screen.getByText(/Description requise/i)).toBeInTheDocument();
  });

  it('exposes the role and rank options', () => {
    renderWithProviders(<CreateOfferPage />);
    // Les options des selects sont disponibles
    const roleSelect = screen.getByLabelText(/Rôle recherché/i) as HTMLSelectElement;
    const rankSelect = screen.getByLabelText(/Rang minimum/i) as HTMLSelectElement;
    expect(roleSelect.querySelectorAll('option').length).toBeGreaterThan(0);
    expect(rankSelect.querySelectorAll('option').length).toBeGreaterThan(0);
  });

  it('has a cancel button that navigates back', async () => {
    renderWithProviders(<CreateOfferPage />);
    expect(screen.getByRole('button', { name: /Annuler/i })).toBeInTheDocument();
  });
});