import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../test/test-utils';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('renders the hero title', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByRole('heading', { name: /Trouvez votre/i, level: 1 })).toBeInTheDocument();
  });

  it('shows the two CTA buttons', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByRole('link', { name: /Créer un compte/i })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /Explorer les joueurs/i })).toHaveAttribute('href', '/players');
  });

  it('displays the 4 stats blocks', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/joueurs vérifiés/i)).toBeInTheDocument();
    expect(screen.getByText(/clubs partenaires/i)).toBeInTheDocument();
    expect(screen.getByText(/offres actives/i)).toBeInTheDocument();
    expect(screen.getByText(/recrutements réussis/i)).toBeInTheDocument();
  });

  it('renders the 3 "Comment ça marche" steps', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByRole('heading', { name: /Crée ton profil/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sois découvert/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Postule en un clic/i })).toBeInTheDocument();
  });
});