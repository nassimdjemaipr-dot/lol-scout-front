import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { AppToaster } from './AppToaster';

describe('AppToaster', () => {
  it('renders without crashing', () => {
    const { container } = render(<AppToaster />);
    // react-hot-toast monte un conteneur. On verifie juste que le render passe.
    expect(container).toBeDefined();
  });
});