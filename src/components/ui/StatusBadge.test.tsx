import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';
import { APPLICATION_STATUS_LABELS, type ApplicationStatus } from '../../types';

describe('StatusBadge', () => {
  const statuses: ApplicationStatus[] = ['EN_ATTENTE', 'ACCEPTEE', 'REFUSEE'];

  it.each(statuses)('renders the human label for status "%s"', (status) => {
    const { getByText } = render(<StatusBadge status={status} />);
    expect(getByText(APPLICATION_STATUS_LABELS[status])).toBeInTheDocument();
  });

  it.each(statuses)('applies the corresponding CSS class for "%s"', (status) => {
    const { container } = render(<StatusBadge status={status} />);
    expect((container.firstChild as HTMLElement).className).toMatch(new RegExp(status.toLowerCase()));
  });
});