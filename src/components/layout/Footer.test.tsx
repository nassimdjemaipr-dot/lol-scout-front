import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from './Footer';

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  );
}

describe('Footer', () => {
  it('shows the brand', () => {
    renderFooter();
    expect(screen.getByRole('img', { name: 'LoL Scout' })).toBeInTheDocument();
  });

  it('renders the legal links', () => {
    renderFooter();
    expect(screen.getByText(/Mentions légales/)).toBeInTheDocument();
    expect(screen.getByText(/CGU/)).toBeInTheDocument();
    expect(screen.getByText(/Confidentialité/)).toBeInTheDocument();
    expect(screen.getByText(/Contact/)).toBeInTheDocument();
  });

  it('points the legal links at real routes, not dead anchors', () => {
    renderFooter();

    expect(screen.getByText(/Mentions légales/).closest('a')).toHaveAttribute(
      'href',
      '/mentions-legales'
    );
    expect(screen.getByText(/CGU/).closest('a')).toHaveAttribute('href', '/cgu');
    expect(screen.getByText(/Confidentialité/).closest('a')).toHaveAttribute(
      'href',
      '/confidentialite'
    );
    expect(screen.getByText(/Contact/).closest('a')).toHaveAttribute(
      'href',
      'mailto:contact@lol-scout.fr'
    );
  });

  it('mentions the current year and a disclaimer', () => {
    renderFooter();
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument();
    expect(screen.getByText(/Non affiliée à Riot Games/i)).toBeInTheDocument();
  });
});
