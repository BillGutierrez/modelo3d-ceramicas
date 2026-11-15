import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' => funciona en Vercel, Netlify y GitHub Pages (incluso en subcarpetas)
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1500 },
});
