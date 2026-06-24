// Test fumigene : verifie que Vitest + RTL fonctionnent.
// Si ce test passe, le setup est OK.

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Smoke test', () => {
  it('renders a simple JSX element', () => {
    render(<h1>Hello LoL Scout</h1>);
    expect(screen.getByRole('heading', { name: /Hello LoL Scout/ })).toBeInTheDocument();
  });

  it('does basic arithmetic', () => {
    expect(2 + 2).toBe(4);
  });
});