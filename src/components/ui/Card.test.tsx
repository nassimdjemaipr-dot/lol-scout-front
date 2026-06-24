import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders its children', () => {
    render(<Card>Hello inside</Card>);
    expect(screen.getByText('Hello inside')).toBeInTheDocument();
  });

  it('applies hoverable class when hoverable=true', () => {
    const { container } = render(<Card hoverable>x</Card>);
    expect((container.firstChild as HTMLElement).className).toMatch(/hoverable/);
  });

  it('merges custom className', () => {
    const { container } = render(<Card className="extra">x</Card>);
    expect((container.firstChild as HTMLElement).className).toMatch(/extra/);
  });

  it('forwards extra props to the div', () => {
    const { container } = render(<Card data-testid="card-root">x</Card>);
    expect(container.querySelector('[data-testid="card-root"]')).not.toBeNull();
  });
});