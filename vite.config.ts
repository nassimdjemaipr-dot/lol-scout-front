import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Config de test : voir vitest.config.ts (separe pour eviter les conflits de types
// entre defineConfig de Vite et celui de Vitest).
export default defineConfig({
  plugins: [react()],
})