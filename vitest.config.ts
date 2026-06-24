// Config dediee a Vitest (separee de vite.config.ts).
// Necessaire car TypeScript 6 ne resout pas correctement le module augmentation
// de Vitest sur le defineConfig de Vite.

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/test/**',
        // Les fichiers .test.{ts,tsx} sont des tests, pas du code de prod
        'src/**/*.test.{ts,tsx}',
      ],
    },
  },
});