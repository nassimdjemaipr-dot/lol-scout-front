import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '../test/test-utils';
import { MyApplicationsPage } from './MyApplicationsPage';

const listMineMock = vi.fn();
vi.mock('../services/application.service', () => ({
  applicationService: { listMine: () => listMineMock() },
}));

describe('MyApplicationsPage', () => {
  beforeEach(() => listMineMock.mockReset());

  it('shows a list of applications', async () => {
    listMineMock.mockResolvedValueOnce([
      {
        id: 1,
        status: 'EN_ATTENTE',
        message: 'Coucou',
        appliedAt: '2026-05-31',
        offer: {
          id: 7,
          title: 'Recherche TOP',
          wantedRole: 'TOP',
          minimumRank: 'Gold IV',
          club: { id: 1, name: 'Phoenix' },
        },
      },
    ]);

    renderWithProviders(<MyApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Recherche TOP/i)).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    listMineMock.mockResolvedValueOnce([]);
    renderWithProviders(<MyApplicationsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Tu n'as pas encore postulé/i)).toBeInTheDocument();
    });
  });
});