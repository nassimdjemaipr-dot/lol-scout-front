import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';

// Mock du Header pour eviter de devoir mocker AuthContext
vi.mock('./Header', () => ({
  Header: () => <header data-testid="header-mock">HEADER</header>,
}));

describe('Layout', () => {
  it('renders the Header, an outlet content and the Footer', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<p>Page content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('header-mock')).toBeInTheDocument();
    expect(screen.getByText('Page content')).toBeInTheDocument();
    expect(screen.getByText('LoL Scout')).toBeInTheDocument(); // dans le Footer
  });
});