import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, userEvent, waitFor } from '../test/test-utils';
import { ClubApplicationsPage } from './ClubApplicationsPage';

const listForClubMock = vi.fn();
const updateStatusMock = vi.fn();

vi.mock('../services/application.service', () => ({
  applicationService: {
    listForClub: () => listForClubMock(),
    updateStatus: (...args: unknown[]) => updateStatusMock(...args),
  },
}));

vi.mock('../lib/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), apiError: vi.fn() },
}));

const fakeApplication = {
  id: 42,
  status: 'EN_ATTENTE',
  message: 'Bonjour je suis interesse',
  appliedAt: '2026-05-31',
  player: {
    id: 1,
    pseudo: 'ShadowMid',
    gameRole: 'MID',
    riotAccount: { stats: { tier: 'Diamond II' } },
  },
  offer: { id: 7, title: 'Recherche MID' },
};

describe('ClubApplicationsPage', () => {
  beforeEach(() => {
    listForClubMock.mockReset();
    updateStatusMock.mockReset();
  });

  it('renders received applications', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication]);
    renderWithProviders(<ClubApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText('ShadowMid')).toBeInTheDocument();
      expect(screen.getByText(/Recherche MID/)).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    listForClubMock.mockResolvedValueOnce([]);
    renderWithProviders(<ClubApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Aucune candidature/i)).toBeInTheDocument();
    });
  });

  it('shows error state', async () => {
    listForClubMock.mockRejectedValueOnce(new Error('Network'));
    renderWithProviders(<ClubApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Impossible de charger/i)).toBeInTheDocument();
    });
  });

  it('accepts a pending application', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication]);
    updateStatusMock.mockResolvedValueOnce({ ...fakeApplication, status: 'ACCEPTEE' });

    renderWithProviders(<ClubApplicationsPage />);
    await waitFor(() => screen.getByText('ShadowMid'));

    await userEvent.click(screen.getByRole('button', { name: /Accepter/i }));

    expect(updateStatusMock).toHaveBeenCalledWith(42, 'ACCEPTEE');
  });

  it('rejects a pending application', async () => {
    listForClubMock.mockResolvedValueOnce([fakeApplication]);
    updateStatusMock.mockResolvedValueOnce({ ...fakeApplication, status: 'REFUSEE' });

    renderWithProviders(<ClubApplicationsPage />);
    await waitFor(() => screen.getByText('ShadowMid'));

    await userEvent.click(screen.getByRole('button', { name: /Refuser/i }));

    expect(updateStatusMock).toHaveBeenCalledWith(42, 'REFUSEE');
  });
});