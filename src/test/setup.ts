// Setup global pour tous les tests Vitest.
// Ajoute les matchers RTL (toBeInTheDocument, etc.) et nettoie le DOM apres chaque test.

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});