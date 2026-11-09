import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: { input: { app: resolve('index.html'), benchmark: resolve('benchmark.html') } },
  },
  test: { include: ['src/**/*.test.ts', 'src/**/*.test.tsx'], environment: 'node' },
});
