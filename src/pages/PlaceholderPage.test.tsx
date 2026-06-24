import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../test/test-utils';
import { PlaceholderPage } from './PlaceholderPage';

describe('PlaceholderPage', () => {
  it('renders the title', () => {
    renderWithProviders(<PlaceholderPage title="Coming soon" />);
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
  });
});