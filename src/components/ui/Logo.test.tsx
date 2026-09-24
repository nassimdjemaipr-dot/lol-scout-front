import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Logo } from './Logo';

describe('Logo', () => {
  it('porte un nom accessible malgre le decoupage du mot', () => {
    render(<Logo />);

    expect(screen.getByRole('img', { name: 'LoL Scout' })).toBeInTheDocument();
  });

  it('nomme aussi la variante mire seule', () => {
    render(<Logo variant="mark" />);

    expect(screen.getByRole('img', { name: 'LoL Scout' })).toBeInTheDocument();
  });

  it('rend le mot en texte, pas en image', () => {
    const { container } = render(<Logo />);

    expect(container.textContent).toContain('SC');
    expect(container.textContent).toContain('UT');
    expect(container.textContent).toContain('LOL');
  });

  it('remplace le O par la mire', () => {
    const { container } = render(<Logo />);

    expect(container.textContent).not.toContain('SCOUT');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('masque les parties decoratives aux lecteurs d ecran', () => {
    const { container } = render(<Logo />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('accepte une classe supplementaire', () => {
    const { container } = render(<Logo className="maClasse" />);

    expect(container.firstElementChild).toHaveClass('maClasse');
  });
});
