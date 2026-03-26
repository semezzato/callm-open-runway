import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    alias: {
      '@callm/core': path.resolve(__dirname, './packages/core/src'),
      '@callm/browser': path.resolve(__dirname, './packages/browser/src'),
    },
  },
});
