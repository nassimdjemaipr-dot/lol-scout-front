import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders its label', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /Click me/ })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Submit</Button>);
    await userEvent.click(screen.getByRole('button', { name: /Submit/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Saving...</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows a spinner when isLoading is true (label hidden)', () => {
    render(<Button isLoading>Saving</Button>);
    expect(screen.queryByText('Saving')).not.toBeInTheDocument();
  });

  it('does not fire click when disabled', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Cant click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Button variant="primary">P</Button>);
    expect(screen.getByRole('button').className).toMatch(/primary/);

    rerender(<Button variant="danger">D</Button>);
    expect(screen.getByRole('button').className).toMatch(/danger/);
  });

  it('applies size classes', () => {
    render(<Button size="lg">Big</Button>);
    expect(screen.getByRole('button').className).toMatch(/lg/);
  });

  it('applies fullWidth class when prop is true', () => {
    render(<Button fullWidth>Wide</Button>);
    expect(screen.getByRole('button').className).toMatch(/fullWidth/);
  });

  it('merges custom className', () => {
    render(<Button className="my-custom-class">X</Button>);
    expect(screen.getByRole('button').className).toMatch(/my-custom-class/);
  });
});