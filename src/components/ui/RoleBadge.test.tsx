import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoleBadge } from './RoleBadge';
import type { PlayerRole } from '../../types';

describe('RoleBadge', () => {
  const roles: PlayerRole[] = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

  it.each(roles)('renders the role label for %s', (role) => {
    render(<RoleBadge role={role} />);
    expect(screen.getByText(role)).toBeInTheDocument();
  });

  it('applies the size class', () => {
    const { container } = render(<RoleBadge role="MID" size="sm" />);
    expect((container.firstChild as HTMLElement).className).toMatch(/sm/);
  });

  it('uses md size by default', () => {
    const { container } = render(<RoleBadge role="MID" />);
    expect((container.firstChild as HTMLElement).className).toMatch(/md/);
  });

  it('applies the role-specific class', () => {
    const { container } = render(<RoleBadge role="JUNGLE" />);
    expect((container.firstChild as HTMLElement).className).toMatch(/jungle/);
  });
});