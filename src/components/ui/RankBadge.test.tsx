import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RankBadge } from './RankBadge';

describe('RankBadge', () => {
  it('renders Unranked when tier is undefined', () => {
    render(<RankBadge />);
    expect(screen.getByText('Unranked')).toBeInTheDocument();
  });

  it('renders the tier label when provided', () => {
    render(<RankBadge tier="Diamond II" />);
    expect(screen.getByText('Diamond II')).toBeInTheDocument();
  });

  const tiers = [
    ['Iron IV', 'iron'],
    ['Bronze III', 'bronze'],
    ['Silver II', 'silver'],
    ['Gold I', 'gold'],
    ['Platinum II', 'platinum'],
    ['Emerald III', 'emerald'],
    ['Diamond IV', 'diamond'],
    ['Master', 'master'],
    ['Grandmaster', 'grandmaster'],
    ['Challenger', 'challenger'],
  ] as const;

  it.each(tiers)('applies the correct color class for tier "%s"', (tier, expectedClass) => {
    const { container } = render(<RankBadge tier={tier} />);
    expect((container.firstChild as HTMLElement).className).toMatch(new RegExp(expectedClass));
  });

  it('falls back to "unranked" for unknown tiers', () => {
    const { container } = render(<RankBadge tier="WeirdTier" />);
    expect((container.firstChild as HTMLElement).className).toMatch(/unranked/);
  });

  it('applies the size class', () => {
    const { container } = render(<RankBadge tier="Gold I" size="sm" />);
    expect((container.firstChild as HTMLElement).className).toMatch(/sm/);
  });
});