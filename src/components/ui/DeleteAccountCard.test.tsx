import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { DeleteAccountCard } from './DeleteAccountCard';
import { authService } from '../../services/auth.service';

const logout = vi.fn();
const navigate = vi.fn();

vi.mock('../../services/auth.service', () => ({
  authService: { deleteAccount: vi.fn() },
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ logout }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

function renderCard() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DeleteAccountCard />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('DeleteAccountCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ne supprime rien tant que la confirmation n a pas ete demandee', async () => {
    renderCard();

    await userEvent.click(screen.getByRole('button', { name: /supprimer mon compte/i }));

    expect(authService.deleteAccount).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /confirmer la suppression/i })).toBeInTheDocument();
  });

  it('annuler ramene a l etat initial sans appeler l API', async () => {
    renderCard();

    await userEvent.click(screen.getByRole('button', { name: /supprimer mon compte/i }));
    await userEvent.click(screen.getByRole('button', { name: /annuler/i }));

    expect(authService.deleteAccount).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /supprimer mon compte/i })).toBeInTheDocument();
  });

  it('confirme : appelle l API, deconnecte et redirige', async () => {
    (authService.deleteAccount as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);

    renderCard();

    await userEvent.click(screen.getByRole('button', { name: /supprimer mon compte/i }));
    await userEvent.click(screen.getByRole('button', { name: /confirmer la suppression/i }));

    await waitFor(() => expect(authService.deleteAccount).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('en cas d erreur API, ne deconnecte pas', async () => {
    (authService.deleteAccount as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('boom')
    );

    renderCard();

    await userEvent.click(screen.getByRole('button', { name: /supprimer mon compte/i }));
    await userEvent.click(screen.getByRole('button', { name: /confirmer la suppression/i }));

    await waitFor(() => expect(authService.deleteAccount).toHaveBeenCalledTimes(1));
    expect(logout).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
