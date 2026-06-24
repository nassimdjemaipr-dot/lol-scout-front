import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer', () => {
  it('shows the brand', () => {
    render(<Footer />);
    expect(screen.getByText('LoL Scout')).toBeInTheDocument();
  });

  it('renders the legal links', () => {
    render(<Footer />);
    expect(screen.getByText(/À propos/)).toBeInTheDocument();
    expect(screen.getByText(/CGU/)).toBeInTheDocument();
    expect(screen.getByText(/Confidentialité/)).toBeInTheDocument();
    expect(screen.getByText(/Contact/)).toBeInTheDocument();
  });

  it('mentions the current year and a disclaimer', () => {
    render(<Footer />);
    expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeInTheDocument();
    expect(screen.getByText(/Non affiliée à Riot Games/i)).toBeInTheDocument();
  });
});