import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const basePath = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  plugins: [react()],
  base: basePath,
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setup-test.ts',
    css: false,
  },
});